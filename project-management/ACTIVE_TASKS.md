# Active Tasks

**Last Updated:** 2026-05-28
**Current Sprint:** Phase 1 - Real Backend Integration Complete

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
