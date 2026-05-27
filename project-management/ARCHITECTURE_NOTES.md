# Architecture Notes

**Purpose:** Document technical architecture decisions, patterns, and gotchas for AI agents.

---

## 📐 Current Architecture Overview

### **Tech Stack**

**Frontend:**
- React 19.0.0 (latest)
- TypeScript 5.8.2
- Vite 6.2.0 (build tool)
- Tailwind CSS 4.1.14 (styling)
- Zustand (state management)
- Motion 12.23.24 (animations)
- D3.js 7.9.0 (data visualization)
- Lucide React (icons)

**Backend:**
- Firebase Cloud Functions v2 (Node.js 22)
- Express 4.21.2 (local dev server)
- Google Gemini AI (gemini-2.5-flash)
- Firebase Firestore (database)
- Firebase Auth (authentication)
- Firebase Hosting (static site)

**APIs:**
- Gemini API v1 (REST)
- Google Text-to-Speech API

---

## 🗂️ Folder Structure

```
src/
├── features/              # Feature-based modules
│   ├── analysis/         # Story analysis components
│   ├── auth/             # Login/signup
│   ├── memory/           # Narrative memory panel
│   ├── projects/         # Project list & management
│   ├── shared/           # Shared components (Header, AudioPlayer)
│   └── story/            # Core writing workspace
├── services/             # Business logic layer
│   └── AIEngine.ts       # AI integration (Gemini)
├── store/                # Zustand state management
│   └── useStoryStore.ts  # Main store
├── hooks/                # Custom React hooks
├── config/               # Configuration files
├── types.ts              # TypeScript type definitions
├── firebase.ts           # Firebase initialization
└── App.tsx               # Main app component (925 lines - TO BE SPLIT)
```

---

## 🧠 State Management (Zustand)

### **Store Structure** (`useStoryStore.ts`)

```typescript
interface StoryState {
  // Project State
  projects: Project[];
  activeProjectId: string | null;

  // Editor State
  text: string;
  architecture: StoryArchitecture | null;
  activeScene: Scene | null;

  // AI Results
  result: AnalysisResult | null;

  // Narrative Memory
  memory: NarrativeMemory;

  // Sync Status
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isDirty: boolean;
  saveQueue: Promise<void>;
}
```

### **Key Patterns**

**1. Save Queue (Sequential Writes):**
```typescript
enqueueSave: (projectId, snapshot, saveFn) => {
  const version = get().currentSaveVersion + 1;
  set({ currentSaveVersion: version, isDirty: true });

  const newQueue = get().saveQueue.then(async () => {
    if (version < get().currentSaveVersion) return; // Skip stale
    await saveFn(projectId, snapshot);
    set({ isDirty: false });
  });

  set({ saveQueue: newQueue });
}
```
**Why:** Prevents race conditions when multiple saves fire rapidly.

**2. Optimistic Updates:**
```typescript
setText: (text) => set({ text, isDirty: true })
```
UI updates immediately, save happens async in background.

---

## 🤖 AI Integration

### **AI Engine** (`src/services/AIEngine.ts`)

**Flow:**
```
User Input → AIEngine.generateNarrativeContent() → Gemini API → JSON Response → UI Update
```

**Key Function:**
```typescript
export const generateNarrativeContent = async (params: AIAnalysisParams) => {
  const { text, mode, aspect, memory, activeProject } = params;

  // Build system instruction + prompt
  const systemInstruction = `You are an expert Narrative Writer...`;
  const prompt = `Story Text: ${text}...`;

  // Call Gemini API via Firebase Function proxy
  const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ systemInstruction, prompt, responseProperties })
  });

  return response.json();
}
```

**Modes:**
- `WRITE` - Generate scene text
- `ANALYZE` - Full narrative diagnostic
- `IMPROVE` - Rewrite with enhancements
- `ADAPT` - Convert to screenplay/poetry/etc.
- `ARCHITECT` - Generate full story structure

**Response Format:**
Gemini returns structured JSON (native JSON mode, not markdown-wrapped).

---

## 🔥 Firebase Architecture

### **Firestore Schema**

**Collection: `projects`**
```typescript
{
  id: string;
  userId: string;
  title: string;
  language: 'UA' | 'ENG';
  text: string;
  architecture: StoryArchitecture;
  memory: NarrativeMemory;
  result: AnalysisResult;
  sceneProgress: Record<string, SceneStatus>;
  tokens: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Security Rules:**
```javascript
match /projects/{projectId} {
  allow read, write: if request.auth != null &&
                       request.auth.uid == resource.data.userId;
}
```
Projects are user-isolated.

### **Cloud Functions**

**Function: `api`** (main API handler)
- Route: `/api/ai/generate`
- Purpose: Proxy to Gemini API (hides API key)
- Runtime: Node.js 22, 2GiB RAM, 300s timeout

**Environment Secrets:**
- `GEMINI_API_KEY`
- `GOOGLE_TTS_API_KEY`

Managed via Firebase Secret Manager.

---

## 🎨 Component Patterns

### **Feature Module Structure**

```
features/story/
├── components/
│   ├── NarrativeWorkspace.tsx    # Main editor
│   ├── StoryArchitectureView.tsx # Act/Scene outline
│   ├── StoryMap.tsx              # D3 visualization
│   └── WorkflowBar.tsx           # Mode selector
└── views/
    └── StoryView.tsx (if needed)
```

### **Shared Components**

- `AppHeader.tsx` - Top navigation
- `AudioPlayer.tsx` - Text-to-speech
- `SubscriptionGate.tsx` - Feature paywall

---

## ⚠️ Known Gotchas

### **1. App.tsx is Too Large (925 lines)**
**Problem:** Hard to navigate, slow to load in editor.
**Solution:** Split into feature modules (planned in Phase 1).

### **2. JSON Parse Failures**
**Problem:** Sometimes Gemini returns malformed JSON.
**Current Fix:** Fallback handler in `normalizeResponse()`:
```typescript
if (data.parseError === true && data.rawText) {
  // Try simple recovery
  const cleaned = data.rawText.trim().replace(/```json|```/g, '');
  return JSON.parse(cleaned);
}
```
**Future Fix:** Add retry logic with different temperature.

### **3. Save Status Stuck on "Saving"**
**Problem:** UI doesn't update if save completes while component unmounted.
**Workaround:** Use `saveQueue` promise to ensure completion.
**Future Fix:** Add timeout + error recovery.

### **4. Firebase Auth Race Condition**
**Problem:** `auth.currentUser` is null on first render.
**Solution:** `getAuthToken()` retries 3 times with delays:
```typescript
export async function getAuthToken(retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const user = auth.currentUser;
    if (user) return await user.getIdToken();
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return null;
}
```

---

## 🔧 Development Workflow

### **Local Development**
```bash
npm run dev        # Start Vite dev server (localhost:3000)
node server.js     # Start Express proxy (localhost:3001)
```

**Why two servers?**
- Vite: Frontend hot reload
- Express: Local API proxy (mimics Cloud Functions)

### **Build & Deploy**
```bash
npm run build      # Build to dist/
firebase deploy    # Deploy hosting + functions
```

**Deploy targets:**
- Hosting: `https://white-tree-489715.web.app`
- Functions: `https://api-foem2jj2ha-uc.a.run.app`

---

## 🚀 Performance Optimizations

### **Current Optimizations**
1. **Firestore Query Limiting:**
   - Only load projects for current user
   - Use `where('userId', '==', uid)`

2. **Auto-Save Debouncing:**
   - Save queue prevents rapid writes
   - Only newest version persists

3. **Code Splitting:**
   - Vite auto-splits by route (if we add routing)

### **Potential Future Optimizations**
- [ ] Lazy load analysis panels
- [ ] Virtual scrolling for long scene lists
- [ ] Service worker caching
- [ ] Firestore local persistence

---

## 🎯 Refactoring Guidelines

### **When Refactoring:**

1. **Extract Only When Painful**
   - Don't extract for purity
   - Extract when file > 500 lines OR
   - When code is duplicated 3+ times

2. **Preserve Behavior First**
   - Make it work → Make it right → Make it fast
   - Test after each extraction

3. **Keep Related Code Together**
   - Feature-based modules > layer-based
   - Co-locate components + hooks + utils

4. **Avoid Premature Abstraction**
   - Wait until 3rd use case before abstracting
   - Duplication is better than wrong abstraction

---

## 📦 Key Dependencies

### **Critical Dependencies**
- `@google/genai` - Gemini AI SDK
- `firebase` - All Firebase services
- `zustand` - State management
- `motion` - Animations
- `d3` - Data visualization

### **Dev Dependencies**
- `vite` - Build tool
- `typescript` - Type checking
- `tailwindcss` - Styling
- `tsx` - TS execution for server

---

## 🔮 Planned Architecture Changes

### **Phase 1 (Current Sprint)**
1. Extract `AIOrchestrator.ts` (if beneficial)
2. Split `App.tsx` into:
   - `WorkspaceContainer.tsx`
   - `EditorWorkspace.tsx`
   - Keep App.tsx as layout shell

### **Future (Post-MVP)**
1. Add React Router (multi-page app)
2. Code splitting by route
3. Service worker for offline mode
4. Firestore local persistence
5. Real-time collaboration (Firestore listeners)

---

## 📚 Reference Links

- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Vite Docs](https://vitejs.dev/)
- [React 19 Docs](https://react.dev/)

---

## 🔍 How to Use This Document

**New AI Agent Onboarding:**
1. Read DECISIONS.md first
2. Read this document second
3. Check ACTIVE_TASKS.md for current work

**Before Making Architecture Changes:**
1. Check if it's in DECISIONS.md (already decided?)
2. If new decision → add to DECISIONS.md
3. Update this doc with implementation notes
