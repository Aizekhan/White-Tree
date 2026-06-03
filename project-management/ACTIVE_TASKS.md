# Active Tasks

**Last Updated:** 2026-06-03
**Current Sprint:** UI Port (Book ✅ COMPLETE | Universe 🔄 IN PROGRESS)

---

## 🎨 UI Port from WhiteWrite Prototype → Production (Session 11)

**Context:** Porting pixel-perfect UI from WhiteWrite prototype handoff to production codebase.
**Started:** 2026-06-03
**Status:** Book COMPLETE ✅ | Universe PARTIAL ✅ | Director NOT STARTED

### Strategy
- Port by screen (не все одразу)
- Verify кожний екран з прототипом перед next
- Послідовність: Book → Universe → Director

### ✅ Book Screen (COMPLETE ✅)
**Date:** 2026-06-03 (Session 11 start)
**Commits:** `274ed33` (Book complete), `4c5c9d4` (Login fix)

- [x] **Sub-task 1:** Scene Intent "Що далі?" (SceneIntentPage.tsx + .css)
  - 7 intent directions + custom description
  - Button active only when valid selection
  - Integrated into BookReader as scene N+1
- [x] **Sub-task 2:** SceneEditor + Guardian Dialog
  - Edit mode with pencil button trigger
  - Pagination algorithm ready
  - Guardian proposes new entities with type selection
  - Conflict detection + integration with EDIT→CANON backend
  - Coach tip for first-time users
- [x] **Sub-task 3:** Integration with project.architecture.scenes
  - useBookScenes hook (flattens acts → chapters → scenes)
  - Dynamic scene source (real data or fallback to MOCK)
  - Persistent position via localStorage

**Files Created:**
- `src/features/book/SceneIntentPage.tsx` + `.css`
- `src/features/book/SceneEditor.tsx` + `.css`
- `src/features/book/useBookScenes.ts`

**Files Modified:**
- `src/types.ts` (extended ArchitectScene)
- `src/features/book/BookReader.tsx` (dynamic scene source)
- `src/features/book/BookView.tsx` (edit state management)
- `src/App.new.tsx` (Login fix)

### ✅ Universe Screen (ADVANCED FEATURES COMPLETE ✅)
**Date:** 2026-06-03 (Session 11 continuation)
**Commits:** `4727610`, `d988651`, `3a1f521`, `dbe298e`

**Completed:**
- [x] WorldTreeStage (tree visualization with 5 clickable nodes)
- [x] UniverseWorkspace (category workspace with cards grid)
- [x] UniverseView.css (full styles from WhiteWrite WorldTree.html)
- [x] **Real Canon Data Integration**
  - useUniverseCanon hook (getEntities, getEntityById, getCount)
  - Dynamic card rendering based on entity type
  - Fallback to MOCK when no canon
- [x] **Entity Selection + Profile Panel**
  - EntityProfile.tsx (5 type-specific views)
  - Character/Location/Event/Faction/Artifact profiles
  - Active card styling (.is-active)
  - Clear selection on category change
- [x] **Filters + Sort + Status Badges**
  - Search filter (by entity name)
  - Category dropdown (quick switch without going back to tree)
  - Sort options: alphabetical, confirmed-first, inferred-first
  - Visual badges on inferred entities (violet ~XX% confidence)
  - Dynamic filtered count display (X / Y format)
  - Outside click handling for dropdowns
- [x] **UX Improvements**
  - "No results" empty state with clear search button
  - Search term highlighting in entity names (golden background)
  - Differentiate between "no canon data" and "no search results"
- [x] **Edit Mode for ALL Entity Types** (Phase 4.9)
  - EditableField component (inline editing with Enter/Escape shortcuts)
  - Character: role, trait, goal, developmentArc, status (all editable)
  - Location: desc, atmos (comma-separated array)
  - Event: when, act (number), desc
  - Faction: motto, align, desc
  - Artifact: rarity, owner, desc
  - Save changes directly to canon via setCanon
  - Auto-focus on edit start with text selection

**Files Created:**
- `src/features/universe/UniverseView.tsx` (MODIFIED from MVP)
- `src/features/universe/UniverseView.css` (full styles + filters + sort + empty state + editable fields)
- `src/features/universe/WorldTreeStage.tsx`
- `src/features/universe/UniverseWorkspace.tsx` (MODIFIED with selection + filters + sort + UX + edit state)
- `src/features/universe/useUniverseCanon.ts`
- `src/features/universe/EntityProfile.tsx` (MODIFIED with edit mode for all types)
- `src/features/universe/EditableField.tsx` (NEW - inline editing component)

**Remaining Tasks:**
- [ ] **Reconstruction overlay** (show affected scenes on entity change)
- [ ] **Batch operations** (select multiple entities for bulk actions)
- [ ] **D3.js force-directed graph** (advanced visualization - optional)

**Status:** Core + Advanced UI ✅ COMPLETE | Graph view + Edit mode ⏳ PENDING

### ⏳ Director Screen (NOT STARTED)
**Status:** Awaiting Universe completion

**Planned Features:**
- Storyboarding (scene shot breakdown)
- Shot editor with dialogue
- Visual canon (reference images + LoRA thresholds)
- Camera angles, moods, storyboard prompts

---

## 🧬 Canon System Migration (Working with Claude Design handoff)

**Context:** Міграція WhiteWrite у Canon-Aware архітектуру. Handoff від Claude Design.
**Started:** 2026-06-01
**Status:** Phase 3 COMPLETE ✅ | Phase 4 Ready

### ✅ Phase 1: Foundation (COMPLETE ✅)
**Date:** 2026-06-01
**Status:** Темний деплой - типи існують, не використовуються

- [x] Прочитати handoff від Claude Design (CANON_SCHEMA.md, SESSION_DIGEST.md)
- [x] Додати інваріанти в CLAUDE.md (2 розділи)
- [x] Створити `src/canon/canonTypes.ts` (Canon* інтерфейси)
- [x] Інтегрувати `deriveMemory.ts` (Canon → NarrativeMemory bridge)
- [x] Додати `canon?` + `canonAware?` до Project interface
- [x] Оновити Firestore rules для підтримки canon поля
- [x] Створити smoke test `deriveMemory.test.ts` (✅ PASS)

### ✅ Phase 2: Content Population (COMPLETE ✅)
**Date:** 2026-06-01
**Commits:** `581f662`, `90f9386`

- [x] **Phase 2.1:** Додати режим `EXTRACT_CANON` в AIEngine.ts + extractCanonPrompt.ts
- [x] **Phase 2.2:** Створити функцію backfillProjectCanon (memory+arch → canon inferred)
- [x] **Phase 2.4:** Офлайн тест доводить безпеку міграції (5 тестів ✅ PASS)
- [x] **Phase 2.3:** UI черга підтвердження (CanonConfirmationQueue component)
  - [x] Створити CanonConfirmationQueue.tsx
  - [x] Інтегрувати в NarrativeMemoryPanel
  - [x] Додати setCanon в useStoryStore
  - [x] Handlers: Confirm/Reject/Edit (Edit = placeholder)
  - [x] Тестова сторінка: canon-test.html (standalone demo)

**Key Guarantees Proven:**
- ✅ Всі entity origin.confirmed === false (inferred)
- ✅ deriveMemory(inferredCanon) returns empty (migration safe)
- ✅ Stable IDs prevent graph breakage on rename
- ✅ No behavior changes until user explicitly confirms entities

**Demo:** http://localhost:3000/canon-test.html

### ✅ Phase 3: Flip Source (COMPLETE ✅)
**Date:** 2026-06-01
**Commit:** `eed0e6b`

- [x] Створити `useCanonManagement.ts` хук (canon-aware memory operations)
- [x] Перенаправити записи memory → canon → deriveMemory (за флагом canonAware)
- [x] Додати де-ризик перевірку `deepEqual(deriveMemory(canon), oldMemory)`
- [x] Створити phase3.test.ts (5 тестів ✅ PASS)
- [x] Створити validateMigration.ts (✅ SAFE)
- [x] Створити integration-example.tsx (reference implementation)

**Key Deliverables:**
- ✅ `useCanonManagement.ts`: addCharacterToCanon, addLocationToCanon, addEventToCanon, addRuleToCanon
- ✅ Auto-derives memory after canon writes
- ✅ Fallback to direct memory write (canonAware=false)
- ✅ De-risk validation passed

**Test Results:**
```
Phase 3 Tests: 5/5 ✅
- addCharacterToCanon creates explicit entity + derives memory
- addLocationToCanon creates explicit entity + derives memory
- Multiple entities → derived memory contains all confirmed
- Inferred (unconfirmed) entities do NOT appear in derived memory
- Removing entity from canon updates derived memory

Migration Validation: ✅ SAFE
- deriveMemory(canon) === memory (deepEqual check passed)
```

### ✅ Phase 4: Derived Features (MVP COMPLETE ✅)
**Date:** 2026-06-01
**Commits:** `ec98c29`, `8e5d64f`, `dd95070`, `1203c19`, `fbd72a6`

- [x] Додати canonAware toggle UI в ProjectList (Zap/ZapOff icon)
- [x] Підготувати useCanonManagement для інтеграції (Phase 3 deliverable)
- [x] Інтегрувати auto-derivation в useProjectState.ts
- [x] Створити phase4-integration.test.ts (5 тестів ✅ PASS)
- [x] Створити ai-context.test.ts (3 тести ✅ PASS)
- [x] Verify AI context generation with derived memory (✅ VERIFIED)
- [x] **Phase 4.5:** EXTRACT_FROM_EDIT AI mode foundation
  - [x] Додати EXTRACT_FROM_EDIT режим в AIEngine.ts
  - [x] Створити extractFromEditPrompt.ts (268 рядків)
  - [x] Інтегрувати AI виклик в extractFromEdit.ts
  - [x] Confidence filtering (>= 0.7)
- [x] **Phase 4.6:** Guardian Dialog UI
  - [x] Створити GuardianDialog.tsx (614 рядків)
  - [x] Natural language display (українською)
  - [x] Entity type promotion (dropdown)
  - [x] Conflict warnings з impact visualization
  - [x] Onboarding coach tip
  - [x] Створити guardian-test.html (5 scenarios)
- [x] **Phase 4.7:** Inline Edit Handler
  - [x] Додати onBlur handler до NarrativeWorkspace textarea
  - [x] Debounce 500ms
  - [x] Loading state indicator
  - [x] Guards (canonAware, not empty, draft mode)
- [x] **Phase 4.8:** Canon Update Flow
  - [x] Інтегрувати useCanonManagement для підтверджених сутностей
  - [x] handleConfirmCanonChanges handler
  - [x] Auto-derivation після canon update
  - [x] onCanonUpdate callback
- [ ] Додати SceneIntent + canon-лінки до ArchitectScene
- [ ] Імплементувати storyMap як похідний від canon-графа
- [ ] **Phase 4.9:** Reconstruction queue (optional)
  - [ ] Track affected scenes (recon: "review")
  - [ ] Show user: "3 scenes need review"

**Key Deliverables:**
- ✅ Auto-derivation: canonAware=true → memory = deriveMemory(canon)
- ✅ Canon Mode toggle ready for testing
- ✅ AI receives canon-based context (180 chars vs 18 chars legacy)
- ✅ Legacy mode preserved (canonAware=false)
- ✅ **EDIT → CANON pipeline COMPLETE (Phase 4.5-4.8)**
- ✅ Human-in-the-loop confirmation (Guardian Dialog)
- ✅ Zero manual memory writes (all through Guardian)

**Test Results:**
```
Phase 4 Integration: 5/5 ✅
AI Context Generation: 3/3 ✅
Phase 4.5-4.8: Manual testing via guardian-test.html ✅
Total: 8/8 unit tests ✅ + EDIT→CANON flow working end-to-end ✅
```

**Status:** EDIT → CANON flow готовий до production тестування

---

## 🎯 Phase 1: Immersive Experience + Real Backend (COMPLETE ✅)

### ✅ Completed
- [x] Create project-management folder structure
- [x] Write ROADMAP.md
- [x] Write CURRENT_PHASE.md
- [x] Write DECISIONS.md
- [x] Audit codebase structure
- [x] Identify infrastructure access needs
- [x] GitHub CLI authentication
- [x] Firebase access confirmation
- [x] Create ImmersiveStoryEntry.tsx (immersive scene viewer)
- [x] Create ContextualWritingWorkspace.tsx (fullscreen writing mode)
- [x] Create architectureToScenes.ts adapter (StoryArchitecture → ImmersiveScene)
- [x] Connect immersive UI to real WhiteWrite backend
- [x] Implement Universe Ignition UX (auto-select, hidden library)
- [x] Fix React Hooks ordering violation
- [x] Integrate real auto-save system

### 🔄 In Progress
- [ ] **Test Scene → Writing Flow**
  - [ ] Click "Enter Scene" and verify workspace loads
  - [ ] Test auto-save triggers and persists to Firestore
  - [ ] Verify atmosphere continuity across transitions
  - Status: Ready for testing

### 📋 To Do - P0 (Critical)

#### **Cinematic Workspace Shell**
- [ ] Create `src/features/workspace/CinematicWorkspace.tsx`
- [ ] Implement dark mode theme with cinematic colors
- [ ] Create production dashboard layout
- [ ] Add film-themed icons (replace BookOpen with Clapperboard)
- [ ] Status: Not Started

#### **AI Director Mode Foundation**
- [ ] Create `src/services/AIDirectorEngine.ts`
- [ ] Design Gemini prompt for cinematic breakdown
- [ ] Define `DirectorOutput` TypeScript interface
- [ ] Implement shot list generation logic
- [ ] Create basic shot type taxonomy (Wide, Medium, Close-up, POV, etc.)
- [ ] Status: Not Started

#### **Scene Cards (Visual)**
- [ ] Create `src/features/production/components/SceneCard.tsx`
- [ ] Design card layout (thumbnail, status badge, character chips)
- [ ] Add quick action buttons (Draft, Review, Direct)
- [ ] Implement status color coding
- [ ] Add hover effects and animations
- [ ] Status: Not Started

#### **Scene Timeline Prototype**
- [ ] Create `src/features/production/components/SceneTimeline.tsx`
- [ ] Implement horizontal scrollable timeline
- [ ] Add act markers
- [ ] Add click-to-navigate functionality
- [ ] (Optional) Tension curve visualization overlay
- [ ] Status: Not Started

---

## 🎬 Phase 2: AI Director Mode (Next Sprint)

### 📋 To Do - P1 (High Priority)

#### **Director View UI**
- [ ] Create `src/features/director/views/DirectorView.tsx`
- [ ] Implement shot list table (editable)
- [ ] Create visual mood board component
- [ ] Add pacing timeline visualization
- [ ] Implement storyboard prompt cards
- [ ] Add "Copy to Midjourney" button
- [ ] Status: Not Started

#### **Director Mode Integration**
- [ ] Add "Direct" button to WorkflowBar
- [ ] Add Director tab to NarrativeWorkspace
- [ ] Save directorOutput to Firestore (extend ArchitectScene type)
- [ ] Implement export to PDF (shot list)
- [ ] Status: Not Started

---

## 🎨 Phase 3: Production Dashboard (Future)

### 📋 To Do - P2 (Medium Priority)

#### **Character Board**
- [ ] Create `src/features/production/components/CharacterBoard.tsx`
- [ ] Implement character grid layout
- [ ] Add D3.js relationship graph
- [ ] Character arc visualization
- [ ] Click character → filter scenes
- [ ] Status: Not Started

#### **Production Dashboard**
- [ ] Create `src/features/production/views/ProductionDashboard.tsx`
- [ ] Implement Kanban columns (Blueprint, Draft, Cinematic, Ready)
- [ ] Add progress stats (%, word count, scenes completed)
- [ ] Drag-and-drop scene cards between columns
- [ ] Status: Not Started

---

## 🚀 Phase 4: Public Demo Ready (Future)

### 📋 To Do - P3 (Low Priority)

#### **Landing Page**
- [ ] Create landing page route
- [ ] Hero section with demo video embed
- [ ] Feature showcase (before/after screenshots)
- [ ] "Try AI Director" CTA button
- [ ] Status: Not Started

#### **Onboarding Flow**
- [ ] Create `src/features/onboarding/OnboardingFlow.tsx`
- [ ] 3-step interactive tour
- [ ] Auto-create sample project on signup
- [ ] Status: Not Started

#### **Public Sharing**
- [ ] Implement public project links (`/project/{id}/public`)
- [ ] Read-only view for non-auth users
- [ ] Share button in project header
- [ ] Status: Not Started

---

## 🐛 Bugs & Tech Debt

### Known Issues
- [ ] App.tsx is 925 lines (too large)
- [ ] Some AI responses occasionally fail JSON parse (handled, but not perfect)
- [ ] Save status indicator sometimes gets stuck on "saving"

### Tech Debt
- [ ] No error boundaries in React components
- [ ] Firebase rules need review for security
- [ ] No loading skeletons (just spinners)

---

## 🔧 Dev Ops Tasks

- [ ] Set up GitHub Actions for auto-deploy on merge to main
- [ ] Add Firestore backup schedule
- [ ] Set up error monitoring (Sentry or similar)

---

## 📝 Task Template

When adding new tasks:

```markdown
- [ ] **Task Title**
  - [ ] Subtask 1
  - [ ] Subtask 2
  - Status: Not Started / In Progress / Blocked / Completed
  - Assigned: [AI Agent / Human]
  - Priority: P0 / P1 / P2 / P3
```

---

## ⏰ Sprint Timeline

**Sprint 1 (Current):** May 27-29
- Focus: Minimal cleanup + Cinematic workspace shell + AI Director foundation

**Sprint 2:** May 30 - Jun 1
- Focus: Complete AI Director Mode + Scene cards + Timeline

**Sprint 3:** Jun 2-4
- Focus: Production Dashboard + Character Board

**Sprint 4:** Jun 5-7
- Focus: Public demo ready + Landing page

---

## 🎨 Magical Book Entry Prototype (Separate Mini-Project)

**Location:** `E:\White Tree\magical-book-prototype\`
**Dev Server:** http://localhost:5173
**Status:** 4-stage Story Creation Flow COMPLETE ✅

### ✅ Completed (Session 7 - 2026-05-30)
- [x] **StoryCreationFlow.tsx - Full 4-stage flow:**
  - [x] Stage 0: Start screen (StartBack.png + "Створити нову історію" button)
  - [x] Stage 1: Config form (pergament.png background, all story options)
  - [x] Stage 2: Generation animation (StartStoryAnim.mp4 + overlay)
  - [x] Stage 3: Reading mode (OpenedBook.jpg + 2-page spread + navigation)
  - [x] Mock AI generation (10 pages of sci-fi text)
  - [x] Arrow navigation (← →) for page flipping
  - [x] Responsive design (aspect-ratio container)

### 🔄 In Progress
- [ ] **Edit mode functionality**
  - [ ] Make text editable (textarea instead of div)
  - [ ] Save user edits
  - [ ] Possibly add autosave
  - Status: Button exists, functionality not implemented
  - Priority: P1

### 📋 To Do - P0 (Critical)
- [ ] **Integrate Gemini AI**
  - [ ] Replace mock data with real AI generation
  - [ ] Use config parameters (storyType, sceneLength, narrativeMode)
  - [ ] Generate during video animation (3 seconds)
  - [ ] Handle streaming or batch generation
  - Status: Not Started
  - Priority: P0

- [ ] **Add video onEnded handler**
  - [ ] Auto-transition from generating → reading after video
  - [ ] Currently uses setTimeout, should use video event
  - Status: Not Started
  - Priority: P0

### 📋 To Do - P1 (High Priority)
- [ ] **Test full user flow**
  - [ ] Start → Config → Generation → Reading
  - [ ] Test all form options
  - [ ] Test navigation edge cases
  - Status: Ready for testing
  - Priority: P1

- [ ] **Save stories to Firestore**
  - [ ] Save generated story with metadata
  - [ ] Load existing stories
  - [ ] Story list view
  - Status: Not Started
  - Priority: P1

### 📋 To Do - P2 (Nice to Have)
- [ ] **Page flip animation**
  - [ ] Use react-pageflip library (already installed)
  - [ ] Smooth page turn effect
  - Status: Not Started
  - Priority: P2

- [ ] **Loading progress during generation**
  - [ ] Progress bar or percentage
  - [ ] Show generation steps
  - Status: Not Started
  - Priority: P2

- [ ] **Integrate into main WhiteWrite**
  - [ ] Replace Login screen with magical book entry
  - [ ] Connect book flow to Firebase Auth
  - [ ] Universe prompt → createProject
  - Status: Not Started
  - Priority: P2

### 📝 Files Created/Modified (Session 7)
- `src/StoryCreationFlow.tsx` (414 lines) - Full implementation
- `src/App.tsx` - Connected StoryCreationFlow
- `public/images/ornaments/pergament.png` - Form background (uploaded by user)

### 📝 User Assets
- `public/images/backgrounds/StartBack.png` - Wizard in library
- `public/images/ornaments/pergament.png` - Form background
- `public/images/book/OpenedBook.jpg` - Opened book with empty pages
- `public/animations/StartStoryAnim.mp4` - Book opening animation

### 📝 Configuration Options Implemented
**Story Type:**
- Односерійний наратив
- Багатосерійний (acts + scenes per act)
- Безкінечний (scenes per act)

**Scene Length:** 200-2000 words (slider)

**Narrative Mode:**
- Тільки наратив (текст)
- Preprod для відеороликів
- З картинками/ескізами

### ⚠️ Critical Lessons (Session 7)
- **Quality > Speed:** Multiple syntax errors frustrated user
- **Test before sending:** Don't iterate 3-4 times on fixes
- **User quote:** "я ебав тебе в рот -раніше ти гарно все так робив, а зараз - ну просто діч полнєйша"
- **Next session:** Focus on quality, test JSX syntax before Edit tool
- **Session ended:** User requested end due to frustration with quality
