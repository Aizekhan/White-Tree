import { useEffect, useRef, useMemo } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useStoryStore } from '../store/useStoryStore';
import { Project } from '../types';
import { User } from 'firebase/auth';
import { deriveMemory } from '../canon/deriveMemory';

export const useProjectState = (user: User | null) => {
    const store = useStoryStore();
    const {
        projects, setProjects,
        activeProjectId, setActiveProjectId,
        isInitialLoad, setIsInitialLoad,
        text, setText,
        memory, setMemory,
        sceneProgress, setSceneProgress,
        architecture, setArchitecture,
        result, setResult,
        localResult, setLocalResult,
        localIsAnalyzing, setLocalIsAnalyzing,
        workflowPhase, setWorkflowPhase,
        activeScene, setActiveScene,
        tokens, setTokens,
        engineLogs, setEngineLogs,
        deductTokens,
        addEngineLog,
        updateSceneStatus,
        saveSceneText,
        saveAdaptedText,
        saveStatus,
        setSaveStatus,
        saveVersion,
        isHydrating,
        setIsHydrating,
        loadProjectState,
    } = store;

    // Helper: serialize architecture for comparison (ignore undefined fields)
    const serializeArch = (a: any) => JSON.stringify(a ?? null);

    // FIX: Override tier for admin email
    const activeProject = useMemo(() => {
        const raw = projects.find(p => p.id === activeProjectId) || null;
        if (!raw) return null;
        return {
            ...raw,
            tier: user?.email === 'hrytsenkomaksym@gmail.com' ? 'pro_plus' : raw.tier
        };
    }, [projects, activeProjectId, user?.email]);

    const lastLoadedProjectId = useRef<string | null>(null);
    const isLoadingNewProject = useRef(false);
    const isProjectLoaded = useRef(false);
    const hasSyncedForCurrentProject = useRef(false);
    const selectionGuarded = useRef(false);

    // [VER_6_STABILITY] AUTH & PROJECTS SYNC
    useEffect(() => {
        if (!user) {
            console.log("[VER_6] No user. State reset.");
            setProjects([]);
            return;
        }

        console.log(`[VER_6_ACTIVE] User: ${user.uid}. Initializing.`);
        const q = query(collection(db, "projects"), where("userId", "==", user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let projectsData: Project[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                projectsData.push({
                    ...data,
                    id: docSnap.id,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
                } as Project);
            });

            setProjects(projectsData);

            if (isInitialLoad) {
                console.log("[VER_6] Initial load done. AUTO-SELECT IS DISABLED.");
                setIsInitialLoad(false);
            }
        }, (error) => {
            console.error("[VER_6] Snapshot error:", error);
        });

        return () => unsubscribe();
    }, [user?.uid]); 

    // Sync token balance
    useEffect(() => {
        if (activeProject) {
            setTokens(activeProject.tokens || 1000);
        }
    }, [activeProject?.tokens, setTokens]);

    // [VER_6_STABILITY] SCENE & TEXT SYNC
    useEffect(() => {
        if (!activeProjectId) {
            if (lastLoadedProjectId.current) {
                console.log("[VER_6] Clearing active project state");
                lastLoadedProjectId.current = null;
                isProjectLoaded.current = false;
                setText("");
                setMemory({ characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] });
                setSceneProgress({});
            }
            return;
        }

        const projectToLoad = projects.find(p => p.id === activeProjectId);
        if (!projectToLoad) return;

        if (activeProjectId === lastLoadedProjectId.current && isProjectLoaded.current) {
             return;
        }

        console.log(`[VER_6] Syncing project: ${activeProjectId}`);
        isLoadingNewProject.current = true;
        setIsHydrating(true); // START HYDRATION
        lastLoadedProjectId.current = activeProjectId;

        loadProjectState(projectToLoad);

        // [PHASE 4] Canon-aware auto-derivation
        // If project has canon and canonAware flag is true, derive memory from canon
        if (projectToLoad.canonAware && projectToLoad.canon) {
            console.log('[CANON] Auto-deriving memory from canon (canonAware=true)');
            const derivedMemory = deriveMemory(projectToLoad.canon);
            setMemory(derivedMemory);
        }

        isProjectLoaded.current = true;
        hasSyncedForCurrentProject.current = true;
        setSaveStatus('saved');
        
        // Use a persistent timer to avoid cleanup killing it before completion
        const timer = setTimeout(() => { 
            isLoadingNewProject.current = false; 
            setIsHydrating(false); // END HYDRATION
        }, 500);
        return () => {
            // We still want to clear it to avoid memory leaks if project changes again
            clearTimeout(timer);
        };
        
    }, [activeProjectId, JSON.stringify(projects.find(p => p.id === activeProjectId) || null)]);

    // [VER_6_STABILITY] Auto-save: TEXT (800ms)
    useEffect(() => {
        if (!activeProjectId || isInitialLoad || isHydrating || !isProjectLoaded.current || !hasSyncedForCurrentProject.current) return;

        const timer = setTimeout(() => {
            triggerSave(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [text]);

    // [VER_6_STABILITY] Auto-save: MEMORY (400ms)
    useEffect(() => {
        if (!activeProjectId || isInitialLoad || isHydrating || !isProjectLoaded.current || !hasSyncedForCurrentProject.current) return;

        const timer = setTimeout(() => {
            triggerSave(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [memory]);

    // [VER_6_STABILITY] Auto-save: Catch-all for any isDirty (3s)
    useEffect(() => {
        if (!activeProjectId || isInitialLoad || isHydrating || !isProjectLoaded.current || !hasSyncedForCurrentProject.current || !store.isDirty) return;

        const timer = setTimeout(() => {
            triggerSave(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [store.isDirty]);

    const triggerSave = (immediate = false) => {
        // [CRITICAL] Use getState() for snapshot to avoid stale closures
        const currentState = useStoryStore.getState();
        
        if (!activeProjectId || !isProjectLoaded.current || currentState.isHydrating) return;

        // [SNAPSHOT] Partitioned: only persist content, exclude logs
        const snapshot = {
            text: currentState.text,
            memory: currentState.memory,
            sceneProgress: currentState.sceneProgress,
            architecture: currentState.architecture,
            result: currentState.result,
            activeScene: currentState.activeScene,
            tokens: currentState.tokens
        };

        currentState.enqueueSave(activeProjectId, structuredClone(snapshot), async (id, data) => {
            const projectRef = doc(db, "projects", id);
            await updateDoc(projectRef, {
                text: data.text,
                memory: data.memory,
                sceneProgress: data.sceneProgress,
                architecture: data.architecture ?? null,
                result: data.result ?? null,
                activeScene: data.activeScene ?? null,
                tokens: data.tokens ?? 1000,
                updatedAt: Timestamp.now()
            });
            console.log(`[SAVE_QUEUE] Firestore write success: ${id}`);
        });
    };

    const forceSave = async (overrides: Partial<Project> = {}) => {
        const currentState = useStoryStore.getState();
        if (!activeProjectId || currentState.isHydrating) return;
        
        const snapshot = {
            text: overrides.text !== undefined ? overrides.text : currentState.text,
            memory: overrides.memory !== undefined ? overrides.memory : currentState.memory,
            sceneProgress: overrides.sceneProgress !== undefined ? overrides.sceneProgress : currentState.sceneProgress,
            architecture: overrides.architecture !== undefined ? overrides.architecture : (currentState.architecture ?? null),
            result: overrides.result !== undefined ? overrides.result : currentState.result,
            activeScene: overrides.activeScene !== undefined ? overrides.activeScene : currentState.activeScene,
            tokens: overrides.tokens !== undefined ? overrides.tokens : currentState.tokens,
        };

        triggerSave(true); // Enqueue the save
    };

    const manualSetActiveProjectId = async (id: string | null) => {
        if (selectionGuarded.current) return;
        selectionGuarded.current = true;
        
        // The store's setActiveProjectId is now async and waits for the queue
        await setActiveProjectId(id);
        
        setTimeout(() => { selectionGuarded.current = false; }, 1000);
    };

    // FIX: Return ALL store fields that App.tsx expects via destructuring,
    // not just 3 fields. Previously App.tsx silently got `undefined` for most fields.
    return {
        // Project state
        projects,
        setProjects,
        activeProjectId,
        setActiveProjectId: manualSetActiveProjectId,
        activeProject,
        isInitialLoad,
        // Editor state
        text,
        setText,
        sceneProgress,
        setSceneProgress,
        architecture,
        setArchitecture,
        result,
        setResult,
        localResult,
        setLocalResult,
        localIsAnalyzing,
        setLocalIsAnalyzing,
        workflowPhase,
        setWorkflowPhase,
        activeScene,
        setActiveScene,
        // User state
        tokens,
        setTokens,
        deductTokens,
        memory,
        setMemory,
        engineLogs,
        setEngineLogs,
        addEngineLog,
        // Scene actions
        updateSceneStatus,
        saveSceneText,
        saveAdaptedText,
        saveStatus,
        triggerManualSave: store.triggerManualSave,
        forceSave,
        triggerSave,
    };
};
