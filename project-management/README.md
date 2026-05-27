# Project Management

**Purpose:** Persistent memory layer for AI agents and human developers working on WhiteWrite.

---

## 📁 Files in This Folder

### **ROADMAP.md**
- Overall product vision
- Phase-based roadmap
- Killer features & differentiators
- Success metrics

**Read this:** When planning new features or understanding product direction.

---

### **CURRENT_PHASE.md**
- Active sprint details
- Current priorities (P0, P1, P2)
- What we're NOT doing
- Success criteria

**Read this:** At the start of every session to know what to focus on.

---

### **ACTIVE_TASKS.md**
- Checkbox task lists by phase
- Status tracking (Not Started / In Progress / Completed)
- Sprint timelines

**Update this:** As you complete tasks.

---

### **DECISIONS.md**
- Key product & architecture decisions
- Rationale for each decision
- Anti-decisions (what we explicitly avoid)

**Read this:** Before making significant changes to avoid re-debating settled questions.

---

### **SESSION_LOG.md**
- Chronological log of dev sessions
- What was done, decisions made, next steps
- Insights and blockers

**Update this:** At the end of each session.

---

### **UI_DIRECTION.md**
- Visual design principles
- Color palette, typography, icons
- Component designs
- Motion & interaction patterns

**Read this:** Before building any UI components.

---

### **ARCHITECTURE_NOTES.md**
- Technical architecture overview
- Folder structure
- State management patterns
- Known gotchas
- Refactoring guidelines

**Read this:** Before making architectural changes.

---

## 🚀 How to Use (AI Agent Workflow)

### **At Start of New Session:**
1. Read `CURRENT_PHASE.md` (5 min)
2. Skim `ACTIVE_TASKS.md` (2 min)
3. Check last session in `SESSION_LOG.md` (2 min)
4. Review `DECISIONS.md` if making architecture changes (5 min)

**Total:** ~15 minutes to get full context.

---

### **During Session:**
- Update `ACTIVE_TASKS.md` as you complete tasks
- Check `UI_DIRECTION.md` when building UI
- Check `ARCHITECTURE_NOTES.md` when refactoring

---

### **At End of Session:**
1. Update `SESSION_LOG.md` with what you did
2. Update `ACTIVE_TASKS.md` checkboxes
3. Note any new decisions in `DECISIONS.md`
4. Update `CURRENT_PHASE.md` if priorities changed

---

## 🧠 Why This Exists

**Problem:** AI agents lose context between sessions.

**Solution:** Persistent project memory in version-controlled markdown files.

**Benefits:**
- No re-discovering project decisions every session
- Consistent development direction
- Easy onboarding for new AI agents
- Human developers can also benefit

---

## 📝 Maintenance

**Review & Update:**
- After each major phase completion
- When priorities shift
- When new decisions are made

**Keep It Lean:**
- These docs should be quick to read (10-15 min total)
- Remove outdated info
- Update dates when things change

---

## 🤝 Contributing

**For AI Agents:**
- Update these docs as you work
- Document new decisions in DECISIONS.md
- Log your sessions in SESSION_LOG.md

**For Human Developers:**
- Review AI-generated updates
- Add context AI might miss
- Correct misunderstandings

---

## 🔗 Related Docs

- `/README.md` - Main project README (user-facing)
- `/README_TECHNICAL.md` - Technical documentation (Ukrainian)
- `/firestore.rules` - Security rules
- `/firebase.json` - Firebase config
