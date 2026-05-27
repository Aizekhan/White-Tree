# Key Product & Architecture Decisions

**Purpose:** Document critical decisions to avoid re-debating them every session.

---

## 🎯 Product Direction Decisions

### **Decision 1: Product Evolution**
**Date:** 2026-05-27
**Decision:** WhiteWrite evolves from "AI narrative writer" to "AI film preproduction platform"

**Rationale:**
- Writing assistants are crowded market (Sudowrite, NovelAI, etc.)
- Film preproduction is underserved
- AI Director Mode = unique positioning
- Cinematic UX = differentiation

**Implications:**
- UI terminology shift (Draft → Shot, Scene → Sequence)
- Cinematic visual language (dark mode, film icons)
- Focus on visual outputs (shot lists, storyboards)

**Status:** ✅ Committed

---

### **Decision 2: Demo Impact > Architecture Purity**
**Date:** 2026-05-27
**Decision:** Prioritize visible product value over perfect code architecture

**Rationale:**
- Need fast iteration to test market fit
- "Holy shit" UX reaction > clean abstractions
- Can refactor later once product-market fit is proven

**Implications:**
- Minimal cleanup only (don't rewrite everything)
- Ship features fast, polish later
- Accept some technical debt for speed

**Status:** ✅ Committed

---

### **Decision 3: AI Director Mode = Top Priority**
**Date:** 2026-05-27
**Decision:** AI Director Mode is the killer feature and gets highest development priority

**Rationale:**
- No competitor has this
- Clear "wow moment" for demos
- Transforms positioning from writer tool → production tool
- Viral potential (share shot lists on social)

**Implications:**
- Build Director Mode in Phase 2 (not Phase 4)
- May skip some cleanup to get Director Mode faster
- Export shot list to PDF is critical

**Status:** ✅ Committed

---

## 🏗️ Architecture Decisions

### **Decision 4: Stick with Firebase**
**Date:** 2026-05-27
**Decision:** Continue using Firebase (Firestore, Auth, Hosting, Functions) — no migration to complex backends

**Rationale:**
- Firebase already works
- Scales fine for MVP
- Migration would delay product work
- Can always migrate later if needed

**Alternatives Considered:**
- Supabase (too much migration work)
- Custom Node.js backend (unnecessary complexity)
- Graph database (overkill for MVP)

**Status:** ✅ Committed

---

### **Decision 5: Single Gemini Pipeline (No Multi-Agent)**
**Date:** 2026-05-27
**Decision:** Use single Gemini API calls with structured JSON responses — avoid complex multi-agent systems

**Rationale:**
- Current system works well
- Multi-agent adds complexity without clear benefit
- Gemini 2.5 Flash is powerful enough for all modes
- Simpler = faster to ship

**Alternatives Considered:**
- LangChain multi-agent orchestration (overkill)
- Separate models for different tasks (unnecessary)

**Status:** ✅ Committed

---

### **Decision 6: React 19 + Zustand (No Redux/Jotai)**
**Date:** 2026-05-27
**Decision:** Keep Zustand for state management, avoid migration to Redux/Jotai

**Rationale:**
- Zustand is working fine
- Migration would be pure refactor (no product value)
- Simple API, easy to understand

**Status:** ✅ Committed

---

### **Decision 7: Feature-Based Folder Structure**
**Date:** 2026-05-27
**Decision:** Maintain feature-based organization (`src/features/`) instead of layer-based (`src/components/`, `src/services/`)

**Rationale:**
- Already established pattern
- Easier to navigate by feature
- Scales better for growing codebase

**Status:** ✅ Committed

---

## 🎨 UI/UX Decisions

### **Decision 8: Cinematic Visual Language**
**Date:** 2026-05-27
**Decision:** Shift UI from "text editor" aesthetic to "film production software" aesthetic

**Changes:**
- Dark mode with gold/violet accents (cinematic colors)
- Film icons (Clapperboard, Film, Camera) instead of book icons
- Visual scene cards (not text lists)
- Timeline-based navigation (not outline view)
- Production dashboard feel

**Rationale:**
- Aligns with film preproduction positioning
- Makes product feel premium
- Differentiates from writing tools

**Status:** ✅ Committed

---

### **Decision 9: "Show, Don't Configure"**
**Date:** 2026-05-27
**Decision:** Avoid heavy settings panels — show intelligent defaults and let AI decide

**Examples:**
- Don't ask user to configure shot types → AI suggests based on scene
- Don't ask for pacing preferences → AI analyzes and suggests
- Auto-detect narrative form/medium from content

**Rationale:**
- Reduces cognitive load
- Faster onboarding
- AI should be smart enough to decide

**Status:** ✅ Committed

---

## 🚫 What We're NOT Doing (Anti-Decisions)

### **NOT: Enterprise Features**
No multi-tenancy, SSO, advanced permissions, audit logs.
**Why:** Focus on indie creators first.

### **NOT: Graph Database**
No Neo4j, no complex relationship modeling.
**Why:** Firestore is sufficient for MVP.

### **NOT: Perfect TypeScript**
No 100% type coverage, no strict mode everywhere.
**Why:** Speed > type safety for MVP.

### **NOT: Comprehensive Testing**
No 80% test coverage requirement.
**Why:** Manual testing is fine for MVP. Add tests for critical paths only.

### **NOT: Multi-Language i18n (Yet)**
Focus on English + Ukrainian only.
**Why:** Don't need 20 languages for MVP.

---

## 📝 Decision Log Template

When making new decisions, add here:

```markdown
### **Decision X: [Title]**
**Date:** YYYY-MM-DD
**Decision:** [What we decided]

**Rationale:**
- Why we made this choice

**Alternatives Considered:**
- Option A (rejected because...)
- Option B (rejected because...)

**Implications:**
- What this means for the codebase/product

**Status:** ✅ Committed / 🤔 Under Review / ❌ Rejected
```

---

## 🔄 Review Schedule

Review this document:
- After each major phase completion
- When considering architecture changes
- When new AI agents join the project
