import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import { useProjectState } from './hooks/useProjectState';
import Login from './features/auth/components/Login';
import MagicalBookEntry from './features/entry/MagicalBookEntry';
import ProjectList from './features/projects/components/ProjectList';
import ImmersiveStoryEntry from './features/universe/ImmersiveStoryEntry';
import ContextualWritingWorkspace from './features/universe/ContextualWritingWorkspace';
import { createProject } from './services/projectService';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Project, NarrativeMode, NarrativeAspect, NarrativeForm, ArchitectNarrativeMode, NarrativeMedium } from './types';
import { architectureToScenes, type ImmersiveScene } from './adapters/architectureToScenes';
import { Library, Plus, LogOut, Loader2, X } from 'lucide-react';
import { generateNarrativeContent } from './services/AIEngine';

// Translations (simple inline for now - can extract later)
const translations = {
  UA: {
    storyProjects: 'Ваші Проєкти',
    manageUniverses: 'Керуйте вашими narrative всесвітами',
    newProject: 'Новий Проєкт',
    newStory: 'Нова Історія',
    newJourney: 'Опишіть конфлікт, персонажа та сеттинг...',
    cancel: 'Скасувати',
    createProject: 'Створити Проєкт',
    storyPremise: 'Опис Наративу',
    premiseTip: 'Це буде використано AI для автоматичної побудови структури історії.',
    welcomeBack: 'З поверненням',
    beginJourney: 'Почніть вашу наративну подорож',
    loginDesc: 'Увійдіть щоб отримати доступ до ваших світів, персонажів та історій.',
    signupDesc: 'Створіть акаунт щоб почати будувати ваші interconnected story universes.',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Підтвердіть пароль',
    signIn: 'Увійти',
    createAccount: 'Створити акаунт',
    needAccount: 'Створити новий акаунт',
    alreadyHaveAccount: 'Увійти в існуючий акаунт',
    invalidCredentials: 'Невірний email або пароль',
    emailInUse: 'Email вже використовується',
    weakPassword: 'Пароль має містити принаймні 6 символів'
  },
  ENG: {
    storyProjects: 'Your Projects',
    manageUniverses: 'Manage your narrative universes',
    newProject: 'New Project',
    newStory: 'New Story',
    newJourney: 'Describe core conflict, main character, and setting...',
    cancel: 'Cancel',
    createProject: 'Create Project',
    storyPremise: 'Story Premise / Description',
    premiseTip: 'This will be used by the AI to automatically construct the initial architecture tree.',
    welcomeBack: 'Welcome Back',
    beginJourney: 'Begin Your Narrative Journey',
    loginDesc: 'Sign in to access your worlds, characters, and stories.',
    signupDesc: 'Create an account to start building your interconnected story universes.',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    needAccount: 'Create a new account instead',
    alreadyHaveAccount: 'Sign in to existing account',
    invalidCredentials: 'Invalid email or password',
    emailInUse: 'Email already in use',
    weakPassword: 'Password should be at least 6 characters'
  }
};

export default function AppRoot() {
  console.log('[APPROOT] Component rendering');

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [language, setLanguage] = useState<'UA' | 'ENG'>('UA');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeWritingScene, setActiveWritingScene] = useState<ImmersiveScene | null>(null);
  const [showArchitectModal, setShowArchitectModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [premise, setPremise] = useState('');
  const [localArchitecture, setLocalArchitecture] = useState<any>(null);

  // Magical book entry states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [universePromptFromBook, setUniversePromptFromBook] = useState<string | null>(null);

  const t = translations[language];

  console.log('[APPROOT] State:', { authLoading, user: !!user });

  // Auth state listener
  useEffect(() => {
    console.log('[APPROOT] Initializing auth listener');
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log('[AUTH] User state changed:', currentUser?.email || 'Not logged in');
        setUser(currentUser);
        setAuthLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('[AUTH] Error in auth listener:', error);
      setAuthLoading(false);
    }
  }, []);

  // Load project state hook (only when authenticated)
  const projectState = useProjectState(user);

  // Use local architecture if available (immediately after generation), otherwise use Firestore data
  const currentArchitecture = localArchitecture || projectState.activeProject?.architecture;

  // Sync localArchitecture when project changes
  useEffect(() => {
    if (projectState.activeProject?.architecture) {
      setLocalArchitecture(projectState.activeProject.architecture);
    } else {
      setLocalArchitecture(null);
    }
  }, [projectState.activeProjectId]);

  // Auto-select first project on login (Universe Ignition)
  useEffect(() => {
    if (user && projectState.projects.length > 0 && !projectState.activeProjectId) {
      console.log('[UNIVERSE] Auto-selecting first project for immersive experience');
      projectState.setActiveProjectId(projectState.projects[0].id);
    }
  }, [user, projectState.projects.length, projectState.activeProjectId]);

  // Handlers
  const handleCreateProject = async (
    title?: string,
    description?: string,
    lang?: 'UA' | 'ENG'
  ) => {
    if (!user) return;

    try {
      const projectId = await createProject(user, title, description, lang || language);
      console.log(`[APP_ROOT] Project created: ${projectId}`);

      // Auto-select newly created project
      setTimeout(() => {
        projectState.setActiveProjectId(projectId);
      }, 500); // Small delay to allow Firestore snapshot to update
    } catch (error) {
      console.error('[APP_ROOT] Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleSelectProject = async (id: string) => {
    await projectState.setActiveProjectId(id);
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'projects', id));
      console.log(`[APP_ROOT] Project deleted: ${id}`);

      // Clear selection if deleting active project
      if (projectState.activeProjectId === id) {
        await projectState.setActiveProjectId(null);
      }
    } catch (error) {
      console.error('[APP_ROOT] Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleUpdateProject = async (id: string, data: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log(`[APP_ROOT] Project updated: ${id}`);
    } catch (error) {
      console.error('[APP_ROOT] Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleGenerateArchitecture = async () => {
    if (!premise.trim() || !projectState.activeProject) return;

    setIsGenerating(true);
    try {
      console.log('[ARCHITECT] Generating architecture for:', premise);

      const result = await generateNarrativeContent({
        text: premise,
        mode: 'ARCHITECT' as NarrativeMode,
        aspect: 'PLOT_STRUCTURE' as NarrativeAspect,
        memory: {
          characters: [],
          locations: [],
          timeline: [],
          worldRules: [],
          plotEvents: []
        },
        activeProject: projectState.activeProject,
        narrativeForm: 'PROSE' as NarrativeForm,
        architectNarrativeMode: 'SCENE_BASED' as ArchitectNarrativeMode,
        narrativeMedium: 'NOVEL' as NarrativeMedium
      });

      console.log('[ARCHITECT] Architecture generated:', result);

      if (result.architecture) {
        console.log('[ARCHITECT] Architecture structure:', {
          title: result.architecture.title,
          acts: Object.keys(result.architecture.acts || {})
        });

        // Save architecture to Firestore
        await updateDoc(doc(db, 'projects', projectState.activeProject.id), {
          architecture: result.architecture,
          updatedAt: new Date().toISOString()
        });

        console.log('[ARCHITECT] Architecture saved to Firestore');

        // Update local state immediately (don't wait for Firestore snapshot)
        setLocalArchitecture(result.architecture);
        projectState.setArchitecture(result.architecture);

        console.log('[ARCHITECT] Local state updated - scenes should appear now');

        setShowArchitectModal(false);
        setPremise('');
      } else {
        console.error('[ARCHITECT] No architecture in result:', result);
        throw new Error('AI did not return architecture');
      }
    } catch (error) {
      console.error('[ARCHITECT] Failed to generate architecture:', error);
      alert(language === 'UA'
        ? 'Помилка створення структури. Спробуйте ще раз.'
        : 'Failed to generate architecture. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Magical book handlers
  const handleEnterUniverseFromBook = (prompt: string) => {
    console.log('[MAGICAL_BOOK] User wants to enter universe:', prompt);
    setUniversePromptFromBook(prompt);
    setShowLoginModal(true);
  };

  // When user successfully authenticates, create project with saved universe prompt
  useEffect(() => {
    if (user && universePromptFromBook) {
      console.log('[MAGICAL_BOOK] User authenticated, creating universe with prompt:', universePromptFromBook);

      // Create project with universe prompt as description
      handleCreateProject(
        universePromptFromBook.slice(0, 50) + (universePromptFromBook.length > 50 ? '...' : ''),
        universePromptFromBook,
        language
      );

      // Clear the stored prompt
      setUniversePromptFromBook(null);
      setShowLoginModal(false);
    }
  }, [user, universePromptFromBook]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show magical book entry
  if (!user) {
    try {
      return (
        <>
          <MagicalBookEntry
            onEnterUniverse={handleEnterUniverseFromBook}
            onLogin={() => setShowLoginModal(true)}
            onSignup={() => setShowLoginModal(true)}
          />

          {/* Login/Signup Modal Overlay */}
          {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="relative max-w-md w-full mx-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute -top-12 right-0 p-2 text-amber-300/60 hover:text-amber-300 transition-all"
                >
                  <X size={24} />
                </button>
                <Login t={t} />
              </div>
            </div>
          )}
        </>
      );
    } catch (error) {
      console.error('[APPROOT] Error rendering MagicalBookEntry:', error);
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Error Loading App</h1>
            <p className="text-white/60">{String(error)}</p>
          </div>
        </div>
      );
    }
  }

  // Authenticated - show immersive universe
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Floating Top Bar (minimal) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all text-sm"
          >
            <Library size={16} />
            <span className="text-white/80">Library</span>
          </button>

          <div className="w-px h-4 bg-white/20" />

          <div className="flex gap-1.5">
            <button
              onClick={() => setLanguage('UA')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'UA'
                  ? 'bg-violet-600 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              UA
            </button>
            <button
              onClick={() => setLanguage('ENG')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'ENG'
                  ? 'bg-violet-600 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              EN
            </button>
          </div>

          <div className="w-px h-4 bg-white/20" />

          <button
            onClick={() => auth.signOut()}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all"
            title="Sign Out"
          >
            <LogOut size={16} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Library Sidebar (slides in from left) */}
      {showLibrary && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLibrary(false)}
          />
          <div className="w-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-white/10 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold mb-2">Your Universes</h2>
              <p className="text-sm text-white/40">{user.email}</p>
            </div>

            <ProjectList
              projects={projectState.projects}
              activeProjectId={projectState.activeProjectId}
              t={t}
              onCreateProject={handleCreateProject}
              onSelectProject={(id) => {
                handleSelectProject(id);
                setShowLibrary(false);
              }}
              onDeleteProject={handleDeleteProject}
              onUpdateProject={handleUpdateProject}
            />
          </div>
        </div>
      )}

      {/* Main Immersive View */}
      {activeWritingScene ? (
        // Writing Mode - seamless continuation of immersion
        <ContextualWritingWorkspace
          scene={{
            id: activeWritingScene.id,
            title: activeWritingScene.title,
            act: activeWritingScene.act,
            location: activeWritingScene.location,
            timeOfDay: activeWritingScene.timeOfDay,
            pov: activeWritingScene.pov,
            visualMood: activeWritingScene.visualMood,
            atmosphericColor: activeWritingScene.atmosphericColor,
            storyText: projectState.text || activeWritingScene.storyText,
            aiShowrunner: activeWritingScene.aiShowrunner,
          }}
          text={projectState.text}
          onTextChange={(newText) => {
            console.log('[UNIVERSE] Text updated, triggering auto-save');
            projectState.setText(newText);
          }}
          saveStatus={projectState.saveStatus}
          onBack={() => setActiveWritingScene(null)}
        />
      ) : projectState.activeProject && currentArchitecture ? (
        // Scene Navigation - immersive story entry
        <ImmersiveStoryEntry
          projectTitle={projectState.activeProject.title}
          projectDescription={projectState.activeProject.description}
          scenes={architectureToScenes(currentArchitecture)}
          onEnterScene={(scene) => {
            console.log('[UNIVERSE] Entering scene:', scene.title);
            setActiveWritingScene(scene);
          }}
        />
      ) : (
        // No architecture yet - show Universe Ignition
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-950 via-indigo-950 to-black">
          <div className="max-w-2xl text-center px-8">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-5xl">✨</span>
            </div>

            <h1 className="text-4xl font-serif font-bold mb-4">
              {language === 'UA' ? 'Народіть Ваш Всесвіт' : 'Birth Your Universe'}
            </h1>

            <p className="text-lg text-white/60 mb-8">
              {language === 'UA'
                ? projectState.activeProject
                  ? `"${projectState.activeProject.title}" чекає на свою історію`
                  : 'Почніть свою наративну подорож'
                : projectState.activeProject
                ? `"${projectState.activeProject.title}" awaits its story`
                : 'Begin your narrative journey'}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowArchitectModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl hover:from-violet-700 hover:to-blue-700 transition-all text-lg font-bold shadow-xl shadow-violet-900/50"
              >
                {language === 'UA' ? '🎬 Створити Структуру' : '🎬 Build Structure'}
              </button>

              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all text-lg font-bold border border-white/20">
                {language === 'UA' ? '📝 Почати Писати' : '📝 Start Writing'}
              </button>
            </div>

            {!projectState.activeProject && (
              <button
                onClick={() => handleCreateProject()}
                className="mt-6 text-sm text-white/40 hover:text-white/60 flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                {language === 'UA' ? 'або створіть новий всесвіт' : 'or create a new universe'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ARCHITECT Modal */}
      {showArchitectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-white">
                {language === 'UA' ? '🎬 Створити Структуру Історії' : '🎬 Build Story Architecture'}
              </h2>
              <button
                onClick={() => setShowArchitectModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <X size={24} className="text-white/60" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-2">
                {language === 'UA' ? 'Опишіть вашу історію (ідея, конфлікт, персонажі):' : 'Describe your story (idea, conflict, characters):'}
              </label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder={language === 'UA'
                  ? 'Наприклад: "Самотня астрофізик на віддаленій орбітальній станції виявляє дивний сигнал із глибокого космосу..."'
                  : 'Example: "A lone astrophysicist on a remote orbital station detects a strange signal from deep space..."'}
                className="w-full h-32 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowArchitectModal(false)}
                disabled={isGenerating}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
              >
                {language === 'UA' ? 'Скасувати' : 'Cancel'}
              </button>
              <button
                onClick={handleGenerateArchitecture}
                disabled={isGenerating || !premise.trim()}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all font-bold shadow-xl shadow-violet-900/50 disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {language === 'UA' ? 'Генерується...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    {language === 'UA' ? '✨ Створити' : '✨ Generate'}
                  </>
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="mt-6 p-4 bg-violet-900/20 border border-violet-500/20 rounded-xl">
                <p className="text-sm text-white/60 text-center">
                  {language === 'UA'
                    ? 'AI створює структуру вашої історії (Acts, Chapters, Scenes)...'
                    : 'AI is building your story structure (Acts, Chapters, Scenes)...'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
