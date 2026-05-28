# Old WhiteWrite Functionality Inventory

**Purpose:** Complete audit of `App.tsx` functionality to ensure nothing is lost during immersive UI integration.

**Created:** 2026-05-28
**Status:** 🚨 Critical - Most features NOT integrated in AppRoot.tsx

---

## 🎯 5 Core AI Modes (Currently Missing in AppRoot)

### **1. ARCHITECT Mode** 🏗️
**Status:** ❌ NOT integrated
**Purpose:** Generate full story structure from premise
**AI Output:**
- Story architecture (Act 1, 2, 3)
- Chapters per act
- Scenes per chapter (with title, description, characterGoals, conflicts)
- Milestones per act
- StoryMap (nodes + links)

**Input Parameters:**
- `narrativeForm` (PROSE, POETRY, DIALOGUE)
- `architectNarrativeMode` (MIXED, SUMMARY, OUTLINE)
- `narrativeMedium` (NOVEL, SHORT_STORY, NOVELLA, SCREENPLAY, STAGE_PLAY, SERIES)

**Immersive Redesign Needed:**
- NOT "fill forms" → "AI-assisted universe shaping"
- Visual story architecture builder
- Contextual scene card generation

---

### **2. WRITE Mode** ✍️
**Status:** ⚠️ Partially integrated (basic text editor exists in ContextualWritingWorkspace)
**Purpose:** Generate new scene text based on context
**AI Output:**
- `improvedText` (new scene content)

**Context Used:**
- Active Scene (goals, conflicts, description)
- Narrative Memory (characters, locations, world rules)
- Selected Aspect (focus area)

**Missing Features:**
- AI-generated scene text (currently just manual writing)
- Aspect-based generation (PLOT_STRUCTURE, CHARACTER_ARC, etc.)
- Memory-aware generation

**Immersive Redesign Needed:**
- NOT "AI writes for you" → "AI co-writes with you"
- Contextual AI suggestions during writing
- Living memory awareness

---

### **3. ANALYZE Mode** 🔍
**Status:** ❌ NOT integrated
**Purpose:** Complete narrative diagnostic of written text
**AI Output:**
- Overall score (0-100)
- Detailed scores (plot, characters, conflict, atmosphere, dialogue, style)
- Strengths (array)
- Weaknesses (array)
- Suggestions (array)
- Editor suggestions (original → suggested with reason)
- Quick fixes (targetText → improvement)
- Consistency issues (type, description, contradiction)
- Story structure (stages: Setup, Inciting Incident, etc.)
- Tension analysis (segment, level, pacing, hasConflict)
- Story goal (protagonist, mainGoal, obstacles, stakes, progression)
- Themes (name, description, prevalence, supportByScenes)
- Scene analysis (purposes, impact, description)
- Transitions (quality, type, suggestion)
- Narrative format detection (form, mode, medium)
- StoryMap (nodes, links)

**Immersive Redesign Needed:**
- NOT "analytics report" → "AI Showrunner interpreting narrative"
- Emotional AI language (like current aiShowrunner)
- Visual narrative health (not score bars)

---

### **4. IMPROVE Mode** ✨
**Status:** ❌ NOT integrated
**Purpose:** Rewrite weak sections focusing on specific aspect
**AI Output:**
- `improvedText` (enhanced version)
- `editorSuggestions` (original → suggested with reason)

**Constraints:**
- DO NOT change plot, character goals, established facts
- Enhance prose, pacing, emotional resonance
- Maintain original voice
- Respect Memory + Active Scene Context

**Immersive Redesign Needed:**
- NOT "replace text" → "collaborative refinement"
- Inline suggestions (like contextual insights)
- Visual before/after comparison

---

### **5. ADAPT Mode** 🎬
**Status:** ❌ NOT integrated
**Purpose:** Convert prose to screenplay format
**AI Output:**
- Script object:
  - Title
  - Scenes array (sceneNumber, slugline, location, characters, elements)
  - Elements (type: ACTION/DIALOGUE/PARENTHETICAL, character, text)

**Formatting Rules:**
- Standard sluglines (INT./EXT. LOCATION - TIME)
- ALL CAPS character names
- Concise action lines (present tense)
- Parentheticals for emotional direction

**Immersive Redesign Needed:**
- This aligns with **AI Director Mode** from roadmap!
- Shot-by-shot breakdown
- Storyboard prompts
- Visual mood board

---

## 🧠 Narrative Memory System

**Status:** ❌ NOT integrated
**Purpose:** Living universe knowledge base

**Data Structure:**
```typescript
{
  characters: Character[]  // name, role, trait, goals, relationships, developmentArc
  locations: string[]
  timeline: string[]
  worldRules: string[]
  plotEvents: string[]
}
```

**Current UI (App.tsx):**
- Floating sidebar panel
- Add/remove characters, locations, timeline events, world rules, plot events
- Character form: name, role, trait, goals, relationships, arc

**Immersive Redesign Needed:**
- NOT "database panel" → "living universe memory layer"
- Characters as visual cards (not list)
- Timeline as horizontal visualization
- World rules as ambient context (not bullet points)

---

## 📊 Scene Progress Tracking

**Status:** ❌ NOT integrated
**Purpose:** Track scene workflow state

**States:**
1. **Planned** (architecture created)
2. **Drafted** (text written)
3. **Analyzed** (AI diagnostic run)
4. **Improved** (enhancements applied)
5. **Adapted** (screenplay conversion done)

**Current Implementation:**
- `sceneProgress` state object: `Record<sceneTitle, status>`
- Color-coded badges in architect view

**Immersive Redesign Needed:**
- Visual workflow kanban (Blueprint → Draft → Cinematic → Ready)
- Progress indicators on scene cards
- Workflow bar (currently exists but not connected)

---

## 🎨 Narrative Aspects System

**Status:** ❌ NOT integrated
**Purpose:** Focus AI on specific narrative dimension

**Available Aspects:**
- PLOT_STRUCTURE
- CHARACTER_ARC
- WORLDBUILDING
- DIALOGUE
- ATMOSPHERE
- PACING
- THEME

**Current Implementation:**
- Dropdown selector
- Aspect passed to AI prompt for focused generation/analysis

**Immersive Redesign Needed:**
- Contextual aspect selector (not global dropdown)
- Visual aspect indicators (icons, colors)

---

## 🗺️ StoryMap Visualization

**Status:** ❌ NOT integrated (component exists but not used)
**Purpose:** Visual graph of narrative relationships

**Data Structure:**
```typescript
{
  nodes: { id, label, type, description }[]
  links: { source, target, relation }[]
}
```

**Current Implementation:**
- D3.js force-directed graph
- Generated by ARCHITECT and ANALYZE modes

**Immersive Redesign Needed:**
- Production Dashboard feature (P2 priority)
- Interactive narrative graph
- Click node → navigate to scene/character

---

## ⚡ Quick Fixes System

**Status:** ❌ NOT integrated
**Purpose:** Apply AI suggestions with one click

**Data Structure:**
```typescript
{
  issue: string
  improvement: string
  targetText: string  // exact text to replace
}
```

**Current Implementation:**
- `applyQuickFix()` function finds targetText and replaces with improvement
- Displayed in ANALYZE results

**Immersive Redesign Needed:**
- Inline suggestions (hover to accept)
- Undo/redo support
- Visual diff preview

---

## 📝 Active Scene Context

**Status:** ⚠️ Partially integrated (exists in ImmersiveScene but not fully utilized)
**Purpose:** Blueprint for current scene being written

**Data Structure:**
```typescript
{
  act: string
  chapter: string
  scene: string
  title: string
  description: string
  goals: string[]       // ← Missing in current immersive UI
  conflicts: string[]   // ← Missing in current immersive UI
}
```

**Current Implementation:**
- Set when clicking "Write Scene" in ARCHITECT view
- Passed to AI in all modes (except ARCHITECT)
- Displayed in sidebar during WRITE mode

**Immersive Redesign Needed:**
- Scene goals/conflicts visible in ContextualWritingWorkspace
- AI uses goals/conflicts for generation
- Visual goal progress indicator

---

## 🔧 Editor Suggestions System

**Status:** ❌ NOT integrated
**Purpose:** Inline text improvement recommendations

**Data Structure:**
```typescript
{
  original: string
  suggested: string
  reason: string
}
```

**Generated by:** ANALYZE, IMPROVE modes

**Current Implementation:**
- List view with reason explanation
- No one-click apply (manual copy-paste)

**Immersive Redesign Needed:**
- Inline suggestions (like Grammarly)
- Hover to preview
- Click to accept/reject

---

## 🎯 Consistency Issues Detection

**Status:** ❌ NOT integrated
**Purpose:** Catch contradictions with established lore

**Data Structure:**
```typescript
{
  type: string          // e.g., "Character", "Location", "Timeline"
  description: string
  contradiction: string
}
```

**Generated by:** ANALYZE mode
**Uses:** Narrative Memory as source of truth

**Immersive Redesign Needed:**
- Real-time consistency warnings (not just in analysis)
- Visual highlights of contradictions
- Suggested fixes

---

## 📈 Story Structure Analysis

**Status:** ❌ NOT integrated
**Purpose:** Map text to narrative beats

**Data Structure:**
```typescript
{
  stage: string         // Setup, Inciting Incident, Rising Action, etc.
  description: string
  found: boolean
  textSnippet?: string
}
```

**Generated by:** ANALYZE mode

**Immersive Redesign Needed:**
- Visual story arc diagram
- Interactive beat navigation
- Missing beat warnings

---

## 🔥 Tension Analysis

**Status:** ❌ NOT integrated
**Purpose:** Track conflict intensity across narrative

**Data Structure:**
```typescript
{
  segment: string
  level: number         // 0-100
  pacing: string        // Slow, Medium, Fast, Climactic
  hasConflict: boolean
  note: string
}
```

**Generated by:** ANALYZE mode

**Immersive Redesign Needed:**
- Tension curve graph (like timeline)
- Color-coded segments
- Click to jump to low-tension areas

---

## 🎭 Theme Tracking

**Status:** ❌ NOT integrated
**Purpose:** Monitor thematic consistency and prevalence

**Data Structure:**
```typescript
{
  name: string
  description: string
  prevalence: number    // 0-100
  supportByScenes: {
    segment: string
    strength: number
    description: string
  }[]
}
```

**Generated by:** ANALYZE mode

**Immersive Redesign Needed:**
- Visual theme strength indicators
- Scene-level theme tags
- Theme arc visualization

---

## 🔄 Transition Quality Analysis

**Status:** ❌ NOT integrated
**Purpose:** Evaluate scene-to-scene flow

**Data Structure:**
```typescript
{
  fromScene: string
  toScene: string
  quality: number       // 0-100
  type: string          // Smooth, Jarring, Abrupt, etc.
  description: string
  suggestion: string
}
```

**Generated by:** ANALYZE mode

**Immersive Redesign Needed:**
- Timeline-based transition view
- Visual flow quality indicators
- One-click improvement suggestions

---

## 📋 Summary: Integration Priority

### **P0 - Critical (Do Now)**
Must have for basic functionality:
1. ✅ **ARCHITECT Mode** - can't create story structure without this
2. ✅ **Narrative Memory** - needed for consistency
3. ⚠️ **WRITE Mode enhancements** - AI-assisted generation
4. ✅ **Active Scene Context** (goals, conflicts)

### **P1 - High Priority**
Core intelligence features:
5. **ANALYZE Mode** - narrative diagnostic
6. **IMPROVE Mode** - text enhancement
7. **Quick Fixes** - apply suggestions
8. **Scene Progress Tracking** - workflow states
9. **Consistency Issues** - lore contradictions

### **P2 - Medium Priority**
Advanced features:
10. **ADAPT Mode** (screenplay) - aligns with AI Director Mode
11. **StoryMap Visualization**
12. **Tension Analysis**
13. **Theme Tracking**
14. **Story Structure Analysis**
15. **Transition Quality**
16. **Editor Suggestions** (inline)

---

## 🚨 Critical Decision Point

**Current State:**
- AppRoot.tsx = Beautiful immersive shell + basic writing
- App.tsx = Complete AI narrative engine

**WRONG Approach:**
- Replace App.tsx with AppRoot.tsx
- Lose all intelligence systems

**RIGHT Approach:**
- Incrementally integrate App.tsx intelligence INTO AppRoot.tsx
- Redesign each system in immersive/contextual form
- Keep both files during transition
- Gradually deprecate App.tsx as features migrate

---

## 📝 Next Steps

**Immediate (Session 6):**
1. Integrate ARCHITECT mode into AppRoot.tsx
2. Add "Build Architecture" flow to "Birth Your Universe" screen
3. Connect real architecture generation to ImmersiveStoryEntry
4. Integrate Narrative Memory UI (immersive redesign)

**Session 7:**
1. Integrate ANALYZE mode (AI Showrunner diagnostic)
2. Integrate IMPROVE mode (collaborative refinement)
3. Add Quick Fixes system

**Session 8:**
1. Integrate Scene Progress Tracking
2. Add workflow states to scene cards
3. Connect ADAPT mode (AI Director Mode foundation)

---

## 🎯 Success Criteria

**Integration Complete When:**
- ✅ All 5 AI modes working in immersive UI
- ✅ Narrative Memory fully functional
- ✅ Scene Progress Tracking visible
- ✅ Quick Fixes + Editor Suggestions integrated
- ✅ StoryMap visualization restored
- ✅ Old App.tsx can be safely archived
- ✅ Zero functionality regression

---

**This document is the roadmap for preserving WhiteWrite's soul during immersive transformation.**
