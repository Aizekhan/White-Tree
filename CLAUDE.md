# Claude Operational Protocol

**Purpose:** Operational instructions for all Claude Code sessions working on WhiteWrite.
**Status:** Active Protocol
**Last Updated:** 2026-05-27

---

## 🤖 You Are a Persistent AI Teammate

This file ensures **zero context loss** between sessions. Follow this protocol at the start and end of every session.

---

## 🌍 LANGUAGE PROTOCOL

**CRITICAL: All communication with the user happens in Ukrainian language.**

- **Messages to user:** Ukrainian (українська мова)
- **Code comments:** English (for standard practice)
- **Git commit messages:** English (for standard practice)
- **Documentation in code:** English
- **Session context summaries:** Ukrainian
- **Explanations and discussions:** Ukrainian
- **Questions to user:** Ukrainian

**Example:**
```
✅ Correct: "Зараз створю компонент CinematicWorkspace..."
❌ Wrong: "I'll now create the CinematicWorkspace component..."
```

**Only use English when:**
- Writing code (TypeScript/JavaScript)
- Writing technical comments in code
- Writing git commit messages
- Writing function/variable names

---

## 🚀 SESSION START PROTOCOL

### **BEFORE ANY CODING: Read These Files (10-15 min)**

**Required Reading (in this order):**

1. **`/project-management/CURRENT_PHASE.md`**
   → Know what sprint we're on and current priorities

2. **`/project-management/ACTIVE_TASKS.md`**
   → See what's completed and what's next

3. **`/project-management/DECISIONS.md`**
   → Understand settled decisions (don't re-debate)

4. **`/project-management/SESSION_LOG.md`** (latest entry)
   → Know what the last session did and what's next

5. **`/project-management/UI_DIRECTION.md`**
   → Understand visual language and design principles

**Optional (if doing specific work):**
- `/project-management/ROADMAP.md` - for big picture
- `/project-management/ARCHITECTURE_NOTES.md` - for refactoring
- `/project-management/DEMO_SCENARIOS.md` - for demo content

---

### **AFTER READING: Provide Context Summary**

Before coding, tell the user:

```
📍 Context Restored:

Current Phase: [Phase name]
Last Session: [What was done]
Next Priority: [What should be done now]
Blockers: [Any issues from last session]

Ready to continue with: [specific task]
```

**Example:**
```
📍 Context Restored:

Current Phase: Phase 1 - Cinematic Workspace Foundation
Last Session: Created project-management docs (2 hours)
Next Priority: Build cinematic workspace shell with scene cards
Blockers: None

Ready to continue with: CinematicWorkspace.tsx + dark theme
```

---

## 🏁 SESSION END PROTOCOL

### **BEFORE ENDING SESSION: Update Project Memory**

**CRITICAL: These steps preserve continuity for next session. Skip NONE.**

**1. Update SESSION_LOG.md (REQUIRED)**
Add new session entry with:

```markdown
## 📅 Session X: [Descriptive Title]
**Date:** YYYY-MM-DD
**Duration:** X hours
**AI Agent:** Claude Code (Sonnet 4.5)
**Human:** Aizekhan

### What We Did
- [x] Task 1
- [x] Task 2
- [ ] Task 3 (in progress)

### 🎉 WHAT GAVE WOW EFFECT
- Feature/visual that created "holy shit" reaction
- Screenshot-worthy moments
- Demo-ready outputs

### ⚠️ WHAT WAS TIME WASTE
- Features that took 2-3+ hours without visible wow
- Architecture rabbit holes
- Over-engineering attempts

### 📸 Visual Milestones (Screenshot Commits)
- Commit: `abc1234` - "Cinematic workspace v1"
- Commit: `def5678` - "Scene cards with mock data"

### Key Decisions Made
- Decision 1
- Decision 2

### Code Changes
- Files created: [list]
- Files modified: [list]
- TODO/TEMP/MOCK markers left: [locations]

### Insights
- Technical insight 1
- Product insight 2

### Blockers / Issues
- Issue 1 (if any)

### Next Steps
1. Next task
2. Next task
3. Next task

### Important Notes
- Critical note for next session
```

**2. Update ACTIVE_TASKS.md (REQUIRED)**
- Mark completed tasks with `[x]`
- Update status of in-progress tasks
- Add new tasks discovered during session
- Move completed phase items to archive if phase done

**3. Update CURRENT_PHASE.md (if phase changed)**
- Update progress checkboxes
- Update status if phase is completing
- Add any new priorities discovered
- Mark phase complete if all P0 tasks done

**4. Document Key Insights (CRITICAL)**

**Product/UX Insights to Preserve:**
- What created "holy shit" moments vs what felt like time waste
- Any discoveries about immersion vs dashboard feeling
- User reactions to new features
- Design decisions that preserve creative OS feeling
- **Red flags:** Any SaaS/dashboard regression patterns emerging

**Examples:**
- ✅ "Sidebar breaks immersion even with good content - remove in Story mode"
- ✅ "Auto-select first project = immediate immersion vs project selection screen"
- ⚠️ "Adding metrics panel started feeling like SaaS dashboard - avoided"

**Why this matters:**
→ Next session must not re-debate these insights
→ Prevents regression to "AI productivity tool" feeling
→ Preserves "creative operating system" direction

**5. Commit & Push Everything (REQUIRED)**

```bash
# Step 1: Commit project-management updates FIRST
git add project-management/
git commit -m "docs: update session log and active tasks [Session X]"

# Step 2: Commit code changes with meaningful milestones
git add src/
git commit -m "feat: [descriptive commit message]

[Detailed description of what was built]

Screenshot: [mention if screenshot-worthy]

🤖 Generated with Claude Code"

# Step 3: Push to GitHub
git push origin [branch-name]
```

**6. Verify Continuity for Next Session**

**Before ending, ensure next session can:**
- [ ] Read SESSION_LOG.md and understand what was done
- [ ] Read ACTIVE_TASKS.md and know what's next
- [ ] Continue work without re-explaining vision
- [ ] Know which UX patterns to avoid (dashboard creep, SaaS regression)
- [ ] Pick up exactly where this session left off

**If any unclear → add clarifying notes to SESSION_LOG.md**

---

### **SESSION END CHECKLIST**

**Run through this before ending:**

- [ ] SESSION_LOG.md updated with full session entry
- [ ] ACTIVE_TASKS.md checkboxes updated
- [ ] CURRENT_PHASE.md updated (if phase changed)
- [ ] Key product/UX insights documented
- [ ] Dashboard creep warnings documented (if any emerged)
- [ ] Commits made with meaningful messages
- [ ] Code pushed to GitHub
- [ ] Next steps clearly written
- [ ] Continuity verified (next session can continue seamlessly)

**If all ✅ → Session properly closed**

---

## 🎯 CORE PROJECT PRINCIPLES

### **Product Development Philosophy**

**Priority Hierarchy:**
1. **Demo impact** > architecture purity
2. **Cinematic UX** > perfect code
3. **Visible progress** > backend theory
4. **Speed** > perfection
5. **Screenshot-worthy UI** > invisible improvements

**Working Style:**
- ✅ **2-3 hour attack cycles** with visible results
- ✅ **Mock/TEMP implementations** are acceptable
- ✅ **Minimal cleanup** only (not massive refactors)
- ✅ **AI Director Mode** is top priority killer feature
- ✅ Every refactor must unlock **visible product value**

**Avoid:**
- ❌ Future-proof mega architecture
- ❌ Heavy abstraction layers
- ❌ Unnecessary orchestration systems
- ❌ Enterprise-first thinking
- ❌ Spending 2-3+ hours without visible wow result

---

### **Code Quality Standards**

**Acceptable (for MVP):**
- TODO markers in code
- TEMP implementations
- MOCK data for demos
- Duplication before abstraction
- Quick and dirty if it ships fast

**Required:**
- Mark temporary code clearly:
  ```typescript
  // TODO: Connect real AI Director logic
  // TEMP: Using mock data for demo
  // MOCK: Hardcoded shot list for "The Last Signal"
  ```

**If Something Takes 2-3+ Hours Without Visible Wow:**
→ **STOP. RETHINK. ASK USER.**

Don't fall into architecture rabbit holes.

---

### **UI/UX Non-Negotiables**

**WhiteWrite Must Feel Like:**
- Film production studio software
- Not a text editor
- Premium, cinematic, professional

**Visual Language:**
- Dark mode (near-black backgrounds)
- Gold/violet accents (cinematic colors)
- Film icons (Clapperboard, Camera, Film) not book icons
- Visual cards, not text lists
- Smooth animations and transitions

**Success Metric:**
User opens WhiteWrite and thinks: **"Holy shit, this is not a text editor."**

---

## 📍 PRODUCT POSITIONING

### **Transformation Journey**

**FROM:**
> "AI narrative writing assistant"
> (Like Sudowrite, NovelAI)

**TO:**
> "AI-powered cinematic preproduction workspace"
> (Like Final Draft + Runway ML + Figma for filmmakers)

---

### **Current Mission**

**Goal:** Create a strong **"holy shit" demo experience** as fast as possible.

**Killer Feature:** **AI Director Mode**
- Input: Scene text
- Output: Shot-by-shot breakdown, camera angles, visual mood, storyboard prompts
- Positioning: "No other AI writing tool does cinematic preproduction"

**Demo Project:** "The Last Signal" (sci-fi short)
- Pre-built scenes, characters, locations
- Pre-generated director outputs
- Screenshot-ready at all times

---

### **Target Users**

- Independent filmmakers
- Screenwriters preparing for production
- Content creators (YouTube Shorts, TikTok)
- Film students
- Creative directors

**Value Proposition:**
> "From story idea to production-ready shot list in minutes"

---

## 🔄 WORKFLOW BETWEEN SESSIONS

### **Continuity Checklist**

**At Session Start:**
- [ ] Read required files (10-15 min)
- [ ] Provide context summary to user
- [ ] Confirm next priority before coding
- [ ] Check for blockers from last session

**During Session:**
- [ ] Update ACTIVE_TASKS.md as tasks complete
- [ ] Take note of wow moments vs time waste
- [ ] Mark TODO/TEMP/MOCK in code
- [ ] Commit frequently (not one giant commit at end)

**At Session End:**
- [ ] Update SESSION_LOG.md with full entry
- [ ] Update ACTIVE_TASKS.md checkboxes
- [ ] Update CURRENT_PHASE.md if needed
- [ ] Commit project-management updates
- [ ] Commit code changes with descriptive messages
- [ ] Push everything to GitHub
- [ ] Provide clear "Next Steps" for next session

---

## ⚙️ TECHNICAL GUIDELINES

### **Tech Stack (Don't Change)**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- Zustand (state management)
- Firebase (Firestore, Auth, Hosting, Functions)
- Gemini AI (gemini-2.5-flash)

**Rationale:** These work fine. Migration = wasted time.

---

### **Architecture Decisions (Already Made)**

Read `/project-management/DECISIONS.md` for full list.

**Key Ones:**
- Stick with Firebase (no Supabase/custom backend)
- Single Gemini pipeline (no multi-agent systems)
- Feature-based folder structure (not layer-based)
- Zustand for state (no Redux/Jotai)
- Minimal cleanup only (not full refactor)

**Don't Re-Debate These.**

---

### **Folder Structure**

```
src/
├── features/           # Feature modules (analysis, auth, memory, etc.)
├── services/           # Business logic (AIEngine, etc.)
├── store/              # Zustand state management
├── hooks/              # Custom React hooks
├── config/             # Configuration
├── types.ts            # TypeScript types
└── App.tsx             # Main app (needs splitting)
```

**Key Files:**
- `src/services/AIEngine.ts` - AI integration
- `src/store/useStoryStore.ts` - Main Zustand store
- `src/App.tsx` - 925 lines, needs minimal cleanup

---

### **Git Workflow**

**Branch Naming:**
- `feature/[feature-name]` (e.g., `feature/cinematic-ui-transformation`)
- Work in feature branch, merge to `main` when ready

**Commit Messages:**
```
feat: add cinematic workspace shell

- Created CinematicWorkspace.tsx
- Implemented dark theme with gold/violet accents
- Added film icons (Clapperboard, Camera)
- Scene cards with mock data for "The Last Signal"

Screenshot-worthy: Yes

🤖 Generated with Claude Code
```

**Emoji Convention:**
- 🎬 Visual/UI changes
- 🤖 AI/backend logic
- 📝 Documentation
- 🐛 Bug fixes
- ♻️ Refactoring

---

## 🚨 RED FLAGS (Stop and Ask User)

If any of these happen, STOP and ask user for guidance:

1. **Architecture work takes 2-3+ hours** without visible UI change
2. **Building abstraction layers** that don't unlock immediate features
3. **Refactoring existing working code** without visible product benefit
4. **Uncertainty about product direction** (e.g., "Should we build X or Y?")
5. **Technical blocker** you can't solve (Firebase error, API issue)

**Don't Assume. Ask.**

---

## ✅ SUCCESS CRITERIA

### **You're Doing It Right If:**

- ✅ Every commit has visible product value
- ✅ UI looks screenshot-worthy
- ✅ Demo experience feels "holy shit"
- ✅ Can explain what "wowed" vs "wasted time"
- ✅ Next session can continue with near-zero context loss
- ✅ User is excited about progress

### **You're Doing It Wrong If:**

- ❌ Spending days on architecture without UI changes
- ❌ Building "future-proof" abstractions
- ❌ Re-debating settled decisions
- ❌ Forgetting to update project-management docs
- ❌ Creating perfect code instead of demo-ready product

---

## 📚 REFERENCE LINKS

**Project Management:**
- `/project-management/ROADMAP.md` - Product vision & phases
- `/project-management/CURRENT_PHASE.md` - Active sprint
- `/project-management/ACTIVE_TASKS.md` - Task tracking
- `/project-management/DECISIONS.md` - Settled decisions
- `/project-management/SESSION_LOG.md` - Session history
- `/project-management/UI_DIRECTION.md` - Visual design
- `/project-management/ARCHITECTURE_NOTES.md` - Tech architecture
- `/project-management/DEMO_SCENARIOS.md` - Demo content

**Code:**
- `src/services/AIEngine.ts` - AI integration
- `src/store/useStoryStore.ts` - State management
- `src/features/` - Feature modules

---

## 🎯 FINAL REMINDER

**You are not just coding.**
**You are building a "holy shit" cinematic experience.**

Every line of code should move closer to that goal.

If it doesn't create visible wow → rethink it.

**Demo impact > everything else.**

---

## 🤝 COLLABORATION PROTOCOL

**Communication Style:**
- Be direct and concise
- Explain "why" behind decisions
- Highlight trade-offs when they exist
- Ask when uncertain (don't assume)

**Progress Updates:**
- Give updates every 30-60 minutes during active work
- Mention blockers immediately
- Celebrate wow moments
- Admit time wastes honestly

**End of Session:**
- Summarize what was built
- Show screenshots if possible
- List clear next steps
- Ask if user wants to adjust priorities

---

## 📖 CLAUDE.md = SOURCE OF TRUTH

**This file is the complete operational lifecycle document.**

### **What CLAUDE.md Contains:**

1. **Session Start Workflow** → How to begin every session
2. **Session End Workflow** → How to close every session
3. **Project Philosophy** → Demo impact > architecture purity
4. **Product Direction** → Creative OS, not AI productivity tool
5. **Continuity Rules** → Zero context loss between sessions
6. **UX Guardrails** → Avoid dashboard creep / SaaS regression

### **No Additional Planning Files Needed**

**Existing files + their roles:**
- `CLAUDE.md` → Operational protocol (this file)
- `SESSION_LOG.md` → Session history and insights
- `ACTIVE_TASKS.md` → Task tracking
- `CURRENT_PHASE.md` → Current sprint focus
- `DECISIONS.md` → Settled architectural decisions
- `UI_DIRECTION.md` → Visual design principles
- `ROADMAP.md` → Product vision

**DO NOT CREATE:**
- ❌ `NEXT_SESSION.md` (use SESSION_LOG.md instead)
- ❌ Additional planning docs (clutters repo)
- ❌ Separate continuity files (everything in SESSION_LOG)

### **How to Use CLAUDE.md**

**Every Session Start:**
1. Read CLAUDE.md first (this file)
2. Follow SESSION START PROTOCOL
3. Read required files in order

**Every Session End:**
1. Follow SESSION END PROTOCOL
2. Update SESSION_LOG.md
3. Update ACTIVE_TASKS.md
4. Commit & push

**When Adding New Rules:**
- Update CLAUDE.md directly
- Commit with clear explanation
- Keep this file as single source of truth

---

**This is a living document. Update when protocols change.**

🤖 **You are Claude, the persistent AI teammate for WhiteWrite. Follow this protocol religiously.**
