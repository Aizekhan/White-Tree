# Integration Plan: Immersive UI ↔ Existing WhiteWrite Engine

**Date:** 2026-05-28
**Status:** Architecture Analysis Complete → Planning Integration

---

## 🎯 Goal

Create evolutionary integration that wraps immersive narrative experience AROUND existing WhiteWrite engine.

**NOT:** Separate demo app
**NOT:** Full rewrite
**YES:** Transform user-facing experience while preserving backend infrastructure

---

## 🔍 Existing Architecture Discovery

### 1. **Authentication System**

**Location:** `src/features/auth/components/Login.tsx`

**Implementation:**
- Firebase Auth integration (direct usage)
- Email/password authentication
- Sign in: `signInWithEmailAndPassword(auth, email, password)`
- Sign up: `createUserWithEmailAndPassword(auth, email, password)`
- Error handling for auth/invalid-credential, auth/email-already-in-use, auth/weak-password

**Auth State:**
- Managed via `useProjectState` hook
- User object from Firebase Auth
- Admin override: `hrytsenkomaksym@gmail.com` gets tier override to `pro_plus`

**UI Pattern:**
- Fullscreen auth screen with WhiteWrite branding
- Login/Signup toggle within same component
- Animated transitions via Framer Motion

### 2. **Project Management**

**Firestore Collection:** `projects`

**Query Pattern:**
```typescript
query(collection(db, "projects"), where("userId", "==", user.uid))
```

**Project Data Structure (Inferred):**
```typescript
// NOTE: Project type is MISSING from src/types.ts (technical debt found)
// Inferred from usage in useProjectState.ts and ProjectList.tsx:

interface Project {
  // Firestore document ID
  id: string;

  // User relationship
  userId: string;

  // Project metadata
  title: string;
  description: string;
  language: 'UA' | 'ENG';
  tier: 'free' | 'pro' | 'pro_plus';
  createdAt: string; // ISO timestamp (converted from Firestore Timestamp)
  updatedAt: string; // ISO timestamp (converted from Firestore Timestamp)

  // Editor state (auto-saved)
  text?: string;
  memory?: NarrativeMemory;
  sceneProgress?: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">;
  architecture?: StoryArchitecture;
  result?: AnalysisResult;
  activeScene?: {
    act: string;
    chapter: string;
    scene: string;
    title: string;
    description: string;
    goals: string[];
    conflicts: string[];
  } | null;

  // Token balance for AI operations
  tokens?: number;
}
```

**Auto-Save Architecture:**
- Debounced auto-save with different delays:
  - Text: 800ms
  - Memory: 400ms
  - Catch-all dirty state: 3000ms
- Save queue with version tracking (prevents race conditions)
- Hydration guards prevent saves during project loading
- Uses `updateDoc` to update Firestore (NOT full doc replacement)

**Project CRUD:**
- **Read:** Real-time snapshot listener (`onSnapshot`) on projects collection
- **Update:** Auto-save via `updateDoc(doc(db, "projects", id), {...})`
- **Create:** Component reference exists (`onCreateProject` in ProjectList) but implementation NOT found in codebase
- **Delete:** `onDeleteProject` callback exists with 5-second countdown UI

### 3. **State Management**

**Zustand Store:** `src/store/useStoryStore.ts`

**Store Structure:**
```typescript
interface StoryState {
  // Project management
  projects: Project[];
  activeProjectId: string | null;
  isInitialLoad: boolean;

  // Editor state
  text: string;
  sceneProgress: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">;
  architecture: StoryArchitecture | null;
  result: AnalysisResult | null;
  activeScene: {...} | null;

  // Narrative Memory
  memory: NarrativeMemory; // { characters, locations, timeline, worldRules, plotEvents }

  // AI operations
  tokens: number;
  engineLogs: string[];

  // UI state
  workflowPhase: string;
  localResult: AnalysisResult | null;
  localIsAnalyzing: boolean;

  // Save queue management
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isDirty: boolean;
  isSaving: boolean;
  isHydrating: boolean;
  currentSaveVersion: number;
  saveQueue: Promise<void> | null;

  // Methods
  setActiveProjectId: (id: string | null) => Promise<void>; // BLOCKING - waits for saves
  loadProjectState: (project: Project) => void;
  enqueueSave: (projectId, snapshot, saveFn) => void;
  saveSceneText: (act, chapter, scene, text) => void;
  updateSceneStatus: (title, status) => void;
  // ...more
}
```

**Key Behaviors:**
1. **Project switching is BLOCKING**: Waits for pending saves before switching projects
2. **Save queue ensures sequential writes**: Version-based conflict prevention
3. **Hydration guards**: Prevents auto-save triggers during project load
4. **Snapshot-based saves**: Only saves content, excludes logs

### 4. **Project Hook Integration**

**Hook:** `src/hooks/useProjectState.ts`

**Purpose:** Bridge between Firebase Auth, Firestore real-time sync, and Zustand store

**Flow:**
```
User Auth → Projects Sync (onSnapshot) → Active Project Selection → Load State → Auto-Save Setup
```

**Effects:**
1. **Auth & Projects Sync** (runs on user.uid change):
   - If no user → clear projects
   - If user → create snapshot listener on projects collection
   - Disable auto-select on initial load

2. **Token Balance Sync** (runs on activeProject.tokens change):
   - Updates local tokens state from active project

3. **Scene & Text Sync** (runs on activeProjectId change):
   - Blocks if same project already loaded
   - Sets hydration flag (prevents auto-saves)
   - Calls `loadProjectState(projectToLoad)`
   - Clears hydration after 500ms

4. **Auto-Save Triggers**:
   - Text change → 800ms debounce
   - Memory change → 400ms debounce
   - Any dirty state → 3000ms catch-all
   - All check: `!isHydrating && isProjectLoaded && hasSyncedForCurrentProject`

**Return Value:** Exposes full store API + helpers (forceSave, triggerSave, manualSetActiveProjectId)

### 5. **Project UI Components**

**Component:** `src/features/projects/components/ProjectList.tsx`

**Features:**
- Grid display of user projects (2 columns)
- Active project highlighting (violet background)
- Inline edit mode (edit title/description)
- 5-second countdown delete confirmation
- Create new project form with:
  - Title input
  - Language toggle (UA/ENG)
  - Description textarea
  - AI premise tip: "This will be used by the AI to automatically construct the initial architecture tree"

**Project Card Shows:**
- Icon (BookOpen)
- Title & Description
- Language badge
- Last updated date
- Character count from memory

### 6. **Story Architecture Types**

**Structure:** Three-act screenplay structure

```typescript
StoryArchitecture
  ├─ title: string
  ├─ premise: string
  └─ acts: { act1, act2, act3 }
       └─ ArchitectAct
            ├─ title
            ├─ description
            ├─ milestones: { label, description }[]
            └─ chapters: ArchitectChapter[]
                 └─ ArchitectChapter
                      ├─ title
                      └─ scenes: ArchitectScene[]
                           └─ ArchitectScene
                                ├─ title
                                ├─ description
                                ├─ characterGoals: string[]
                                ├─ conflicts: string[]
                                ├─ status: "Planned" | "Drafted" | ...
                                ├─ writtenText?: string
                                ├─ adaptedText?: string
                                └─ adaptedTarget?: string
```

### 7. **Narrative Memory System**

**Structure:**
```typescript
interface NarrativeMemory {
  characters: Character[]; // name, role, trait, goals, relationships, developmentArc
  locations: string[];
  timeline: string[];
  worldRules: string[];
  plotEvents: string[];
}
```

**Purpose:** AI context that ensures consistency across story

**Integration:** Automatically sent to Gemini AI during analysis/generation

---

## 🚧 Technical Debt Identified

### CRITICAL: Missing Project Type Definition

**Issue:** `Project` type is imported from `src/types.ts` but does NOT exist in that file.

**Evidence:**
- `useProjectState.ts:13` imports `{ Project }` from '../types'
- `ProjectList.tsx:4` imports `{ Project }` from '../../../types'
- Searched entire `src/types.ts` (252 lines) - Project type NOT defined
- TypeScript likely inferring structure or allowing `any`

**Impact:** Type safety compromised for core data structure

**Fix Required:** Add proper Project type definition to types.ts before integration

---

## 🎨 Immersive UI Components (Already Built)

### Current Components

**1. ImmersiveStoryEntry.tsx**
- Fullscreen scene viewer with atmospheric backgrounds
- Sequential paragraph fade-in animations
- AI Showrunner emotional narration
- Scene navigation (prev/next)
- "Enter Scene" button → triggers writing mode

**2. ContextualWritingWorkspace.tsx**
- Fullscreen writing editor (NO sidebar in Story mode)
- Minimal floating UI (top bar, bottom autosave status)
- Text selection → contextual AI insights popup
- AI whispers (timed contextual suggestions)
- Optional scene context panel (floating button)

**3. AppCinematic.tsx**
- Navigation wrapper for demo views:
  - Story (immersive)
  - Intelligence (universe brain)
  - Production (cinematic workspace)
- Manages writingMode state
- Passes scene context between components

**Status:** Built with MOCK data ("The Last Signal" demo story)

---

## 🔗 Integration Strategy: Evolutionary Approach

### Phase 1: Add Project Type & Fix Technical Debt

**Tasks:**
1. Define proper `Project` interface in `src/types.ts`
2. Verify all imports compile without errors
3. Add JSDoc documentation for Project fields
4. Export Project type properly

**Why First:** Foundation must be solid before building on top

---

### Phase 2: Connect Auth to Immersive Entry Point

**Current Flow (Old):**
```
main.tsx → App.tsx (direct editor - no auth)
```

**New Flow (Immersive Wrapper):**
```
main.tsx → AppRoot.tsx (NEW)
  ├─ IF no user → Login.tsx
  └─ IF user → ImmersiveProjectHub.tsx (NEW)
       ├─ Show user projects (enhanced visual)
       ├─ Universe creation experience (transform simple form)
       └─ Select project → ImmersiveStoryEntry → Writing → Production
```

**Implementation Plan:**
1. Create `src/AppRoot.tsx` - master wrapper component
2. Add `onAuthStateChanged` listener
3. Conditional render: Login vs ImmersiveProjectHub
4. Use existing `useProjectState` hook (already handles auth + projects)

**Preserve:**
- Existing Login.tsx component (works perfectly)
- Firebase Auth integration (no changes needed)
- useProjectState hook (reuse as-is)

---

### Phase 3: Transform Project Creation Experience

**BEFORE (Current - Simple Form):**
```tsx
<form>
  <input placeholder="Story Title" />
  <textarea placeholder="Description" />
  <select language="UA/ENG" />
  <button>Create Project</button>
</form>
```

**AFTER (Immersive Universe Ignition):**
```tsx
<ImmersiveUniverseCreation>
  {/* Full-screen cinematic experience */}
  <AtmosphericBackground gradient="cosmic" />

  {/* AI-guided conversation */}
  <AIShowrunner>
    "What world is calling to you today?"
  </AIShowrunner>

  {/* Natural language input */}
  <UniversePrompt>
    User types: "A story about the last transmission from Mars..."
  </UniversePrompt>

  {/* AI extracts structure */}
  → title: "The Last Signal"
  → genre: Sci-Fi Thriller
  → premise: [extracted from user input]
  → medium: Film/Screen (inferred)

  {/* UNDERNEATH: Creates standard Project in Firestore */}
  createProject({
    title, description, language,
    userId: user.uid,
    tier: user.tier,
    createdAt: Timestamp.now(),
    // ... rest of standard structure
  })
</ImmersiveUniverseCreation>
```

**Key Insight:** Beautiful immersive UI on top, SAME Firestore structure underneath

**Implementation:**
1. Create `ImmersiveUniverseCreation.tsx` component
2. Reuse atmospheric gradient system from ImmersiveStoryEntry
3. Add AI Showrunner guide component (can start with scripted conversation, Gemini integration later)
4. Natural language input → parse/extract → call existing createProject function
5. Transition: Universe creation → Project created → Load immersive entry

---

### Phase 4: Bridge Architecture to Immersive Scenes

**Challenge:** Existing system has StoryArchitecture (acts/chapters/scenes), immersive UI uses flat scene array

**Solution: Adapter Layer**

```typescript
// src/adapters/architectureToScenes.ts

export function architectureToImmersiveScenes(architecture: StoryArchitecture): SceneContext[] {
  const scenes: SceneContext[] = [];

  Object.entries(architecture.acts).forEach(([actKey, act]) => {
    act.chapters.forEach((chapter, chapterIdx) => {
      chapter.scenes.forEach((scene, sceneIdx) => {
        scenes.push({
          id: `${actKey}-${chapterIdx}-${sceneIdx}`,
          title: scene.title,
          act: act.title,
          location: extractLocation(scene.description), // Parse from description
          timeOfDay: extractTime(scene.description), // Parse from description
          pov: extractPOV(architecture.memory), // From narrative memory
          visualMood: inferMood(scene.description), // AI or heuristic
          atmosphericColor: inferColor(scene.description), // Map mood to gradient
          storyText: scene.writtenText || scene.description,
          aiShowrunner: generateShowrunnerNarration(scene, architecture.memory)
        });
      });
    });
  });

  return scenes;
}
```

**Flow:**
```
Project Selected
  → Load StoryArchitecture from Firestore
  → architectureToImmersiveScenes(architecture)
  → ImmersiveStoryEntry receives scenes array
  → User navigates/reads immersively
  → "Enter Scene" → ContextualWritingWorkspace
  → Writing saved back to architecture.acts[act].chapters[ch].scenes[sc].writtenText
```

---

### Phase 5: Integrate Writing Flow

**Connection Points:**

**1. Scene Selection → Writing Mode**
```tsx
// ImmersiveStoryEntry.tsx
<button onClick={() => onEnterScene(currentScene)}>
  Enter Scene
</button>

// AppRoot.tsx (or new navigation wrapper)
const [activeScene, setActiveScene] = useState<SceneContext | null>(null);
const [writingMode, setWritingMode] = useState(false);

<ImmersiveStoryEntry
  scenes={scenes}
  onEnterScene={(scene) => {
    setActiveScene(scene);
    setWritingMode(true);
  }}
/>

{writingMode && activeScene && (
  <ContextualWritingWorkspace
    scene={activeScene}
    onBack={() => setWritingMode(false)}
    onTextChange={(newText) => {
      // Save to Firestore via useStoryStore
      saveSceneText(scene.act, scene.chapterIdx, scene.sceneIdx, newText);
    }}
  />
)}
```

**2. Auto-Save Integration**
```typescript
// ContextualWritingWorkspace.tsx
const { saveSceneText } = useStoryStore();

const handleTextChange = (newText: string) => {
  setText(newText);

  // Save to architecture structure (existing auto-save will trigger)
  saveSceneText(
    sceneContext.actKey,
    sceneContext.chapterIdx,
    sceneContext.sceneIdx,
    newText
  );
};
```

**3. Scene Status Updates**
```typescript
// When user starts writing
updateSceneStatus(scene.title, "Drafted");

// After AI analysis
updateSceneStatus(scene.title, "Analyzed");

// After improvements applied
updateSceneStatus(scene.title, "Improved");
```

---

### Phase 6: Production & Intelligence Views (Future)

**Approach:** Keep navigation wrapper but progressively enhance views

**Production View:**
- Keep existing `CinematicWorkspace.tsx` structure
- Connect to real project data (scenes, characters, locations)
- Scene status tracking from sceneProgress
- Character list from memory.characters

**Intelligence View:**
- Connect `UniverseBrainView.tsx` to narrative memory
- Show real character arcs, plot threads, lore
- Narrative graph from memory relationships

**NOT Priority:** These are secondary to core Story experience

---

## 📋 Implementation Checklist

### Immediate (Session 5)

- [ ] **Add Project type to src/types.ts**
  ```typescript
  export interface Project {
    id: string;
    userId: string;
    title: string;
    description: string;
    language: 'UA' | 'ENG';
    tier: 'free' | 'pro' | 'pro_plus';
    createdAt: string;
    updatedAt: string;
    text?: string;
    memory?: NarrativeMemory;
    sceneProgress?: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">;
    architecture?: StoryArchitecture;
    result?: AnalysisResult;
    activeScene?: { act: string; chapter: string; scene: string; title: string; description: string; goals: string[]; conflicts: string[]; } | null;
    tokens?: number;
  }
  ```

- [ ] **Find or create missing createProject function**
  - Search existing codebase for any project creation logic
  - If missing, implement in `src/services/projectService.ts` (NEW)
  - Use addDoc(collection(db, "projects"), {...})

- [ ] **Create AppRoot.tsx master wrapper**
  - Auth state management (onAuthStateChanged)
  - Conditional: Login vs Authenticated App
  - Integrate useProjectState hook
  - Handle loading states

### Near-Term (Sessions 6-7)

- [ ] **Create ImmersiveProjectHub component**
  - Enhanced visual project list (reuse ProjectList logic, new UI)
  - Show projects with cinematic cards
  - "Create Universe" prominent CTA

- [ ] **Create ImmersiveUniverseCreation component**
  - Atmospheric fullscreen experience
  - AI Showrunner guided input
  - Natural language → Project creation
  - Call existing createProject (preserve backend)

- [ ] **Build architectureToScenes adapter**
  - Convert StoryArchitecture → SceneContext[]
  - Handle missing data gracefully (description fallbacks)
  - Mood/color inference logic

### Mid-Term (Sessions 8-10)

- [ ] **Connect ImmersiveStoryEntry to real data**
  - Remove MOCK "The Last Signal" data
  - Load scenes from activeProject.architecture
  - Scene navigation updates activeScene in store

- [ ] **Integrate ContextualWritingWorkspace with auto-save**
  - Connect to saveSceneText from useStoryStore
  - Status updates (Drafted → Analyzed → Improved)
  - Preserve auto-save timings (800ms text, 400ms memory)

- [ ] **Add real Gemini AI contextual insights**
  - Replace mock insights with actual API calls
  - Use narrative memory for context
  - Emotional rewrites generate real alternatives

### Future (Sessions 11+)

- [ ] Connect Production view to real data
- [ ] Connect Intelligence view to memory
- [ ] Add scene-level atmospheric customization
- [ ] Implement scene reordering in immersive view
- [ ] Add character spotlight mode

---

## 🛡️ Preservation Checklist

**MUST NOT BREAK:**
- ✅ Firebase Auth integration (Login.tsx works)
- ✅ Firestore projects collection structure
- ✅ useProjectState real-time sync
- ✅ Zustand store save queue architecture
- ✅ Auto-save debouncing (800ms/400ms/3000ms)
- ✅ Version-based conflict prevention
- ✅ Hydration guards during project load
- ✅ Token balance system
- ✅ Narrative Memory structure
- ✅ StoryArchitecture three-act format
- ✅ Existing user projects data

**TRANSFORMATION ONLY:**
- 🎨 User-facing project creation experience (form → immersive)
- 🎨 Scene viewing/reading (architecture tree → immersive entry)
- 🎨 Writing interface visual design (keep functionality)
- 🎨 Navigation (tabs → immersive modes)

---

## 💡 Key Insights for Integration

### 1. **Immersive = Wrapper, Not Replacement**

The immersive UI is a **visual transformation layer** that sits ON TOP of the existing engine:

```
┌─────────────────────────────────────┐
│   Immersive UI Layer (NEW)          │ ← Atmospheric, emotional, cinematic
│   - ImmersiveStoryEntry             │
│   - ContextualWritingWorkspace      │
│   - ImmersiveUniverseCreation       │
└──────────────┬──────────────────────┘
               │ Adapter
┌──────────────▼──────────────────────┐
│   WhiteWrite Engine (EXISTING)      │ ← Business logic, persistence, AI
│   - StoryArchitecture               │
│   - NarrativeMemory                 │
│   - Auto-save queue                 │
│   - Gemini AI integration           │
│   - Firestore sync                  │
└─────────────────────────────────────┘
```

### 2. **Data Flows Bidirectionally**

**Down (Engine → UI):**
- StoryArchitecture → adapter → SceneContext[] → ImmersiveStoryEntry
- NarrativeMemory → AI Showrunner narration
- sceneProgress → visual status indicators

**Up (UI → Engine):**
- User writes text → saveSceneText → architecture.acts[].chapters[].scenes[].writtenText
- Scene status changes → updateSceneStatus → sceneProgress[sceneTitle]
- New project created → createProject → Firestore projects collection

### 3. **Auth is Already Solved**

- Login.tsx works perfectly
- useProjectState handles auth + sync
- Just need to wire into new navigation flow
- NO changes to auth logic required

### 4. **Progressive Enhancement Path**

Can integrate incrementally without breaking production:

**Step 1:** Add AppRoot wrapper (keeps old App.tsx accessible)
**Step 2:** New users see immersive experience
**Step 3:** Existing users migrate gradually
**Step 4:** Deprecate old UI when confident

### 5. **Mock → Real Data is Well-Defined**

Immersive components already accept props - just need to:
- Replace STORY_SCENES constant with dynamic data
- Connect onEnterScene callback
- Hook up text onChange to saveSceneText

NOT a rewrite - just wiring existing pieces together.

---

## 🚀 Next Session Starting Point

**For Session 5, start with:**

1. **Add Project type definition** (fixes technical debt, unblocks integration)
2. **Create AppRoot.tsx** (master wrapper, auth conditional)
3. **Test basic flow**: Login → Show projects (existing ProjectList) → Verify nothing broken

**Then build forward from solid foundation:**
- Session 6: ImmersiveProjectHub (enhanced project list)
- Session 7: ImmersiveUniverseCreation (transform project creation)
- Session 8: Architecture adapter + connect immersive entry to real data

---

## 📚 Reference Files Map

**Auth:**
- `src/features/auth/components/Login.tsx` - Auth UI

**Projects:**
- `src/hooks/useProjectState.ts` - Auth + Project sync hook
- `src/features/projects/components/ProjectList.tsx` - Project list UI
- `src/types.ts` - Type definitions (needs Project type added!)

**State:**
- `src/store/useStoryStore.ts` - Zustand store (save queue, editor state)
- `src/firebase.ts` - Firebase initialization

**Immersive UI:**
- `src/features/universe/ImmersiveStoryEntry.tsx` - Scene viewer
- `src/features/universe/ContextualWritingWorkspace.tsx` - Writing workspace
- `src/AppCinematic.tsx` - Demo navigation wrapper

**Original Editor:**
- `src/App.tsx` - Legacy editor (no auth/projects - standalone)

**Entry:**
- `src/main.tsx` - App entry point (currently renders AppCinematic)

---

## ✅ Success Criteria

**Integration successful when:**

1. ✅ User logs in with existing credentials
2. ✅ Sees their existing projects (preserved data)
3. ✅ Can create new project via immersive experience
4. ✅ New project appears in Firestore with correct structure
5. ✅ Opens project → sees immersive scene entry (if architecture exists)
6. ✅ "Enter Scene" → contextual writing workspace
7. ✅ Writes text → auto-saves to Firestore (800ms debounce)
8. ✅ Scene status updates in sceneProgress
9. ✅ Switches projects → previous project auto-saved before switch
10. ✅ Logs out and back in → all data persisted correctly

**Visual demo ready when:**
- Can show end-to-end flow: Universe creation → Immersive entry → Writing → Persistence
- "Holy shit" moments: Atmospheric entry, AI living presence, contextual intelligence
- Zero data loss - existing users' work remains intact

---

**Status:** Ready to begin Phase 1 implementation 🎬
