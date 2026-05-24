import { create } from 'zustand';
import {
    Project,
    NarrativeMemory,
    AnalysisResult,
    StoryArchitecture,
    EngineLog
} from '../types';

interface StoryState {
    // Project State
    projects: Project[];
    activeProjectId: string | null;
    isInitialLoad: boolean;

    // Editor & Active Scene State
    text: string;
    sceneProgress: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">;
    architecture: StoryArchitecture | null;
    result: AnalysisResult | null;
    localResult: AnalysisResult | null;
    localIsAnalyzing: boolean;
    workflowPhase: 'blueprint' | 'editor';
    activeScene: {
        act: string;
        actKey: string;
        chapter: string;
        chapterIdx: number;
        scene: string;
        sceneIdx: number;
        title: string;
        description: string;
        goals: string[];
        conflicts: string[];
    } | null;

    // User / Config State
    tokens: number;
    memory: NarrativeMemory;
    engineLogs: EngineLog[];

    // Sync status (UI feedback)
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    saveVersion: number;
    isSaving: boolean;
    isDirty: boolean;
    saveQueue: Promise<void>;
    currentSaveVersion: number;
    isHydrating: boolean;

    // Basic Setters
    setProjects: (projects: Project[]) => void;
    setActiveProjectId: (id: string | null) => Promise<void>;
    setIsInitialLoad: (val: boolean) => void;
    setText: (text: string) => void;
    setSceneProgress: (progress: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">) => void;
    setArchitecture: (arc: StoryArchitecture | null | ((prev: StoryArchitecture | null) => StoryArchitecture | null)) => void;
    setResult: (res: AnalysisResult | null | ((prev: AnalysisResult | null) => AnalysisResult | null)) => void;
    setLocalResult: (res: AnalysisResult | null | ((prev: AnalysisResult | null) => AnalysisResult | null)) => void;
    setLocalIsAnalyzing: (val: boolean) => void;
    setWorkflowPhase: (phase: 'blueprint' | 'editor') => void;
    setActiveScene: (scene: any) => void;
    setTokens: (tokens: number) => void;
    setMemory: (memory: NarrativeMemory | ((prev: NarrativeMemory) => NarrativeMemory)) => void;
    setEngineLogs: (logs: EngineLog[] | ((prev: EngineLog[]) => EngineLog[])) => void;
    setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
    setSaveQueue: (queue: Promise<void>) => void;
    setIsDirty: (isDirty: boolean) => void;
    setIsHydrating: (isHydrating: boolean) => void;
    loadProjectState: (project: Project) => void;

    // Advanced Actions
    enqueueSave: (projectId: string, snapshot: any, saveFn: (id: string, data: any) => Promise<void>) => void;
    waitForSave: () => Promise<void>;
    triggerManualSave: () => void;
    deductTokens: (amount: number) => void;
    addEngineLog: (action: string, details: string, type?: 'info' | 'success' | 'warning') => void;
    updateSceneStatus: (sceneTitle: string, status: "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted") => void;
    saveSceneText: (actKey: string, chapterIdx: number, sceneIdx: number, writtenText: string) => void;
    saveAdaptedText: (actKey: string, chapterIdx: number, sceneIdx: number, adaptedText: string, adaptedTarget: any) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
    projects: [],
    activeProjectId: null,
    isInitialLoad: true,

    text: "",
    sceneProgress: {},
    architecture: null,
    result: null,
    localResult: null,
    localIsAnalyzing: false,
    workflowPhase: 'blueprint',
    activeScene: null,

    tokens: 1000,
    memory: { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] },
    engineLogs: [],

    saveStatus: 'saved',
    saveVersion: 0,
    isSaving: false,
    isDirty: false,
    saveQueue: Promise.resolve(),
    lastSaveHash: null,
    currentSaveVersion: 0,
    isHydrating: false,

    setProjects: (newProjects) => set((state) => {
        if (state.projects.length === newProjects.length && 
            state.projects.every((p, i) => p.id === newProjects[i].id && p.updatedAt === newProjects[i].updatedAt)) {
            return state;
        }
        return { projects: newProjects };
    }),

    setActiveProjectId: async (id) => {
        const state = get();
        // [BLOCKING] Wait for any pending saves before switching
        if (state.isSaving || state.isDirty) {
            await state.saveQueue;
        }

        set((state) => ({ 
            activeProjectId: id,
            text: "",
            sceneProgress: {},
            architecture: null,
            result: null,
            localResult: null,
            activeScene: null,
            memory: { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] },
            engineLogs: [],
            workflowPhase: 'blueprint',
            isDirty: false,
            isHydrating: false,
            lastSaveHash: null
        }));
    },

    loadProjectState: (project) => {
        set((state) => ({
            ...state,
            text: project.text || "",
            memory: project.memory || { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] },
            sceneProgress: project.sceneProgress || {},
            architecture: project.architecture || null,
            result: project.result || null,
            activeScene: project.activeScene || null,
            tokens: project.tokens ?? 1000,
            isDirty: false, // Reset dirty after full load
            lastSaveHash: null // Reset hash to force next sync check if needed
        }));
    },

    setSaveQueue: (saveQueue) => set({ saveQueue }),
    setIsDirty: (isDirty) => set({ isDirty }),
    setIsHydrating: (isHydrating) => set({ isHydrating }),

    enqueueSave: (projectId, snapshot, saveFn) => {
        const state = get();
        
        // 1. Increment version immediately (Optimistic state)
        const version = state.currentSaveVersion + 1;
        set({ currentSaveVersion: version, isDirty: true });

        const newQueue = state.saveQueue.then(async () => {
            // 2. Skip outdated versions
            // If a newer version was enqueued while we were waiting, this snapshot is obsolete.
            if (version < get().currentSaveVersion) {
                console.log(`[SAVE_QUEUE] Skipping version ${version} (obsolete)`);
                return;
            }

            set({ isSaving: true, saveStatus: 'saving' });
            try {
                // 3. Persistence
                await saveFn(projectId, snapshot);
                
                // 4. Clear isDirty ONLY if this is still the latest version
                if (version === get().currentSaveVersion) {
                    set({ isDirty: false, saveStatus: 'saved' });
                }
            } catch (err) {
                set({ saveStatus: 'error' });
                console.error("[SAVE_QUEUE] Save error:", err);
            } finally {
                // Only clear isSaving if no new queue has been created
                if (get().saveQueue === newQueue) {
                    set({ isSaving: false });
                }
            }
        });

        set({ saveQueue: newQueue });
    },

    waitForSave: async () => {
        await get().saveQueue;
    },

    setIsInitialLoad: (isInitialLoad) => set({ isInitialLoad }),
    setText: (text) => set({ text, isDirty: true }),
    setSceneProgress: (sceneProgress) => set({ sceneProgress, isDirty: true }),

    setArchitecture: (arcUpdater) => set((state) => ({
        architecture: typeof arcUpdater === 'function' ? arcUpdater(state.architecture) : arcUpdater,
        isDirty: true
    })),

    setResult: (resUpdater) => set((state) => ({
        result: typeof resUpdater === 'function' ? resUpdater(state.result) : resUpdater,
        isDirty: true
    })),

    setLocalResult: (resUpdater) => set((state) => ({
        localResult: typeof resUpdater === 'function' ? resUpdater(state.localResult) : resUpdater
    })),

    setLocalIsAnalyzing: (localIsAnalyzing) => set({ localIsAnalyzing }),
    setWorkflowPhase: (workflowPhase) => set({ workflowPhase }),
    setActiveScene: (activeScene) => set({ activeScene }),
    setTokens: (tokens) => set({ tokens, isDirty: true }),

    setMemory: (memoryUpdater) => set((state) => ({
        memory: typeof memoryUpdater === 'function' ? memoryUpdater(state.memory) : memoryUpdater,
        isDirty: true
    })),

    setEngineLogs: (logsUpdater) => set((state) => ({
        engineLogs: typeof logsUpdater === 'function' ? logsUpdater(state.engineLogs) : logsUpdater
    })),

    setSaveStatus: (saveStatus) => set({ saveStatus }),

    triggerManualSave: () => set((state) => ({ 
        saveVersion: state.saveVersion + 1 
    })),

    deductTokens: (amount) => set((state) => ({ 
        tokens: Math.max(0, state.tokens - amount),
        isDirty: true 
    })),

    addEngineLog: (action, details, type = 'info') => set((state) => ({
        engineLogs: [{
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            action,
            details,
            type
        }, ...state.engineLogs] as EngineLog[]
    })),

    updateSceneStatus: (sceneTitle, status) => set((state) => ({
        sceneProgress: { ...state.sceneProgress, [sceneTitle]: status }
    })),

    saveSceneText: (actKey, chapterIdx, sceneIdx, writtenText) => set((state) => {
        const prev = state.architecture;
        if (!prev) return state;
        const acts = { ...prev.acts };
        if (!acts[actKey as keyof typeof acts]) return state;
        const act = { ...acts[actKey as keyof typeof acts] };
        const chapters = [...act.chapters];
        if (!chapters[chapterIdx]) return state;
        const chapter = { ...chapters[chapterIdx] };
        const scenes = [...chapter.scenes];
        if (!scenes[sceneIdx]) return state;
        scenes[sceneIdx] = { ...scenes[sceneIdx], writtenText, status: "Drafted" };
        chapter.scenes = scenes;
        chapters[chapterIdx] = chapter;
        act.chapters = chapters;
        (acts as any)[actKey] = act;
        return { architecture: { ...prev, acts }, isDirty: true };
    }),

    saveAdaptedText: (actKey, chapterIdx, sceneIdx, adaptedText, adaptedTarget) => set((state) => {
        const prev = state.architecture;
        if (!prev) return state;
        const acts = { ...prev.acts };
        if (!acts[actKey as keyof typeof acts]) return state;
        const act = { ...acts[actKey as keyof typeof acts] };
        const chapters = [...act.chapters];
        if (!chapters[chapterIdx]) return state;
        const chapter = { ...chapters[chapterIdx] };
        const scenes = [...chapter.scenes];
        if (!scenes[sceneIdx]) return state;
        scenes[sceneIdx] = { ...scenes[sceneIdx], adaptedText, adaptedTarget, status: "Adapted" };
        chapter.scenes = scenes;
        chapters[chapterIdx] = chapter;
        act.chapters = chapters;
        (acts as any)[actKey] = act;
        return { architecture: { ...prev, acts }, isDirty: true };
    })
}));
