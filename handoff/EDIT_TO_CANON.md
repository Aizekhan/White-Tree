# EDIT → CANON: Inline Editing Specification

**Purpose:** Specification for inline narrative editing as reverse bridge to Canon system.

**Status:** Implementation Ready
**Based On:** Canon Phase 3+4 (complete), prototype from MageBack demo
**Author:** Claude Design → Claude Code handoff

---

## 🎯 Core Principle

**Invariant:** Text edits never silently become truth — every edit is a **proposal** requiring user confirmation.

```
User Edit (text change)
    ↓
extractFromEdit(text, sceneId)
    ↓
Detected Changes: new entities (inferred) + conflicts (continuity)
    ↓
User Confirmation (Guardian Dialog)
    ↓
useCanonManagement.addXToCanon() [confirmed entities]
    ↓
deriveMemory(canon) → updated NarrativeMemory
    ↓
Reconstruction (if needed)
```

---

## 📐 Architecture

### **Pipeline Stages**

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: EDIT EVENT                                         │
│ - User edits prose text (contentEditable / textarea)       │
│ - Trigger: onBlur (when focus leaves text area)            │
│ - Debounce: 500ms (avoid spam during typing)               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: EXTRACTION                                         │
│ - extractFromEdit(text, sceneId)                           │
│ - AI analyzes edited paragraph/scene                        │
│ - Returns: { newEntities, conflicts, suggestions }         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 3: GUARDIAN DIALOG (human-in-the-loop)               │
│ - Show detected changes in natural language                │
│ - User chooses: Confirm / Reject / Edit entity type        │
│ - If conflict: show impact + continuity warning            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 4: CANON UPDATE                                       │
│ - Confirmed entities → useCanonManagement.addXToCanon()    │
│ - origin.source = "inferred" (from edit)                   │
│ - origin.confirmed = true (after user approval)            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 5: DERIVATION + RECONSTRUCTION                        │
│ - deriveMemory(canon) → updated NarrativeMemory            │
│ - Reconstruction: scenes with canon drift → review queue   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 API Specification

### **extractFromEdit()**

```typescript
interface ExtractFromEditParams {
    text: string;              // Edited prose text (paragraph or scene)
    sceneId: string;           // Scene context (for continuity check)
    existingCanon: ProjectCanon; // Current canon state
}

interface ExtractFromEditResult {
    // New entities detected in edited text
    newEntities: {
        characters: Array<{
            name: string;
            role?: string;
            trait?: string;
            confidence: number;     // 0..1
            extractedFrom: string;  // Original text snippet
        }>;
        locations: Array<{
            name: string;
            description?: string;
            confidence: number;
            extractedFrom: string;
        }>;
        events: Array<{
            name: string;
            description: string;
            confidence: number;
            extractedFrom: string;
        }>;
    };

    // Conflicts with existing canon
    conflicts: Array<{
        type: 'character_rename' | 'location_contradiction' | 'event_timeline_conflict';
        entityId: string;       // Conflicting canon entity
        oldValue: string;
        newValue: string;
        impact: 'low' | 'medium' | 'high';
        affectedScenes: string[]; // Scene IDs that would need reconstruction
        explanation: string;    // Human-readable conflict description
    }>;

    // Suggestions (optional enhancements)
    suggestions: Array<{
        type: 'missing_detail' | 'continuity_gap' | 'world_rule_violation';
        message: string;
        severity: 'info' | 'warning';
    }>;
}

export async function extractFromEdit(
    params: ExtractFromEditParams
): Promise<ExtractFromEditResult>;
```

### **Guardian Dialog Actions**

```typescript
interface GuardianDialogProps {
    result: ExtractFromEditResult;
    onConfirm: (entities: ConfirmedEntity[]) => void;
    onReject: () => void;
    onEditEntityType: (entityId: string, newType: CanonType) => void;
}

interface ConfirmedEntity {
    name: string;
    type: 'character' | 'location' | 'event' | 'rule';
    // Additional fields populated by user (optional)
    role?: string;
    trait?: string;
    description?: string;
}
```

---

## 🎨 UX Flow (from Prototype)

### **Trigger: onBlur**

```typescript
<textarea
    onBlur={async (e) => {
        const editedText = e.target.value;

        // Extract changes from edited text
        const result = await extractFromEdit({
            text: editedText,
            sceneId: currentScene.id,
            existingCanon: project.canon
        });

        // If changes detected → show Guardian dialog
        if (result.newEntities.characters.length > 0 ||
            result.conflicts.length > 0) {
            setGuardianDialog({ open: true, result });
        }
    }}
/>
```

### **Guardian Dialog (Natural Language)**

```
🛡️ Хранитель Канону

Я помітив зміни у вашому тексті:

✨ Нові сутності:
  • Персонаж: "Маркус" (Дослідник)
  • Локація: "Підземна лабораторія"

⚠️ Можливі конфлікти:
  • Персонаж "Елена" раніше була "Астронавт", а тепер "Капітан"
  • Це вплине на 3 сцени, які треба буде переглянути

[ Підтвердити зміни ]  [ Відхилити ]  [ Редагувати типи ]
```

### **Onboarding (First-Time User)**

```
👋 Коуч-підказка (перший раз)

Коли ви редагуєте текст, я автоматично відстежую:
  • Нових персонажів, локації, події
  • Суперечності з попереднім canon
  • Сцени, які потребують оновлення

Ви завжди контролюєте, що стає правдою історії.

[ Зрозуміло! ]
```

---

## 🔗 Integration with Existing System

### **Phase 3: useCanonManagement**

Already implemented. Use for confirmed entities:

```typescript
const { addCharacterToCanon, addLocationToCanon, addEventToCanon } =
    useCanonManagement(project.canonAware);

// After user confirms in Guardian dialog:
guardianResult.confirmedEntities.forEach(entity => {
    if (entity.type === 'character') {
        addCharacterToCanon({
            name: entity.name,
            role: entity.role || 'Unknown',
            trait: entity.trait || '',
            goals: '',
            relationships: '',
            developmentArc: ''
        });
    }
    // ... similar for locations, events
});
```

### **Phase 4: Auto-Derivation**

Already implemented in `useProjectState.ts`. After canon update, memory is automatically derived:

```typescript
// This happens automatically:
if (project.canonAware && project.canon) {
    const derivedMemory = deriveMemory(project.canon);
    setMemory(derivedMemory); // AI context updated
}
```

---

## 🧪 AIEngine Integration

### **New Mode: EXTRACT_FROM_EDIT**

Minimal version of `EXTRACT_CANON` focused on single paragraph/scene:

```typescript
// src/services/AIEngine.ts
export enum NarrativeMode {
    // ... existing modes
    EXTRACT_FROM_EDIT = "EXTRACT_FROM_EDIT"
}

// New extraction function
export async function extractFromEdit(
    text: string,
    sceneId: string,
    existingCanon: ProjectCanon
): Promise<ExtractFromEditResult> {
    const response = await generateNarrativeContent({
        text,
        mode: NarrativeMode.EXTRACT_FROM_EDIT,
        memory: deriveMemory(existingCanon), // Current canon as context
        activeScene: { id: sceneId },
        // ... other params
    });

    return parseExtractFromEditResponse(response);
}
```

### **Prompt Template**

```typescript
// src/canon/extractFromEditPrompt.ts
export const EXTRACT_FROM_EDIT_SYSTEM = `
You are a Canon Guardian for a narrative system.

User edited a scene. Analyze the edited text and:
1. Detect NEW entities (characters, locations, events)
2. Find CONFLICTS with existing canon
3. Suggest IMPROVEMENTS for continuity

Return JSON with:
- newEntities: { characters[], locations[], events[] }
- conflicts: { type, entityId, oldValue, newValue, impact, explanation }
- suggestions: { type, message, severity }

IMPORTANT:
- Only extract entities EXPLICITLY mentioned in edited text
- Conflicts must have high confidence (>0.8)
- Use natural language in explanations (user-facing)
`;
```

---

## 📋 Implementation Checklist

### **Phase 4.5: Full Write Redirect (Foundation)**

- [ ] Create `src/canon/extractFromEdit.ts` API
- [ ] Add `EXTRACT_FROM_EDIT` mode to AIEngine
- [ ] Create `extractFromEditPrompt.ts` prompt template
- [ ] Add response parser for extraction results

### **Phase 4.6: Guardian Dialog (UI)**

- [ ] Create `GuardianDialog.tsx` component
- [ ] Implement natural language display of changes
- [ ] Add conflict warnings with impact visualization
- [ ] Implement entity type promotion (user can change type)
- [ ] Add onboarding coach tip (first-time only)

### **Phase 4.7: Inline Edit Handler**

- [ ] Add `onBlur` handler to prose text areas
- [ ] Debounce extraction calls (500ms)
- [ ] Show loading state during extraction
- [ ] Handle errors gracefully

### **Phase 4.8: Canon Update Flow**

- [ ] Integrate with `useCanonManagement` for confirmed entities
- [ ] Mark entities as `origin.source: "inferred"` + `confirmed: true`
- [ ] Link entities to scene (`sceneId` in metadata)
- [ ] Trigger auto-derivation after update

### **Phase 4.9: Reconstruction Queue (Phase 5 Preview)**

- [ ] Detect scenes with canon drift (conflicts)
- [ ] Add to reconstruction queue with `recon: "review"`
- [ ] Show user: "3 scenes need review due to canon changes"

---

## 🎯 Answers to Claude Code Questions

### **Q1: Reconstruction Strategy — Phase 5 first or full write redirect?**

**A:** Full write redirect FIRST. Without it, canon has holes (manual memory writes bypass canon). Once write redirect is complete, Phase 5 reconstruction becomes safe.

**Priority:**
1. ✅ Phase 4.5-4.8: Full write redirect (extractFromEdit + Guardian)
2. ⏳ Phase 5: Reconstruction strategy (auto/review/pinned)

### **Q2: UI for Canon Confirmation Queue in production?**

**A:** Use existing `spec/Canon Confirmation Queue.html` mockup as base. Guardian Dialog is evolution of that design:
- **Same pattern:** inferred entities → user confirmation
- **New addition:** conflict warnings + impact visualization
- **New addition:** inline context (extracted text snippet)

### **Q3: StoryMap Derivation — 1:1 mapping to canon entities?**

**A:** Derive from **scene-level canon links**:

```typescript
storyMap.nodes = architecture.scenes.map(scene => ({
    id: scene.id,
    title: scene.title,
    // Derive from canon links
    characters: scene.canonLinks?.characters.map(id =>
        canon.characters.find(c => c.id === id)?.name
    ),
    location: scene.canonLinks?.locations[0] // Primary location
}));
```

Scene is node, canon entities are **attributes** of that node.

### **Q4: Migration Path for existing projects to canonAware=true?**

**A:** Gradual per-project flag + safety check:

```typescript
// Before enabling canonAware for project:
const validation = validateMigration(project.canon, project.memory);

if (!validation.safe) {
    console.warn('Migration not safe:', validation.issues);
    // Show user: "Please review canon entities before enabling canon mode"
    return;
}

// Safe to enable:
updateProject(project.id, { canonAware: true });
```

**Recommended:**
1. Run `validateMigration()` before enabling
2. Enable for new projects by default (`canonAware: true`)
3. Existing projects opt-in via toggle (with validation)

---

## 🚀 Next Steps (Implementation Order)

### **Immediate (Phase 4.5):**
1. Create `extractFromEdit.ts` API
2. Add `EXTRACT_FROM_EDIT` mode to AIEngine
3. Create prompt template
4. Add response parser

### **Short-term (Phase 4.6-4.7):**
1. Build Guardian Dialog component
2. Add inline edit handlers (onBlur)
3. Integrate with useCanonManagement

### **Medium-term (Phase 4.8-4.9):**
1. Canon update flow with scene links
2. Reconstruction queue preview
3. Impact visualization

### **Long-term (Phase 5):**
1. Full reconstruction strategy (auto/review/pinned)
2. Diff generation for review mode
3. Continuity warnings for pinned mode

---

## 📦 Example Flow (Complete Cycle)

```
1. User edits scene text:
   "Маркус увійшов у темну лабораторію під станцією."

2. onBlur → extractFromEdit()
   AI detects:
   - New character: "Маркус" (confidence: 0.9)
   - New location: "Темна лабораторія під станцією" (confidence: 0.95)

3. Guardian Dialog appears:
   🛡️ "Я помітив 2 нові сутності. Додати до canon?"

4. User confirms → useCanonManagement
   addCharacterToCanon({ name: "Маркус", ... })
   addLocationToCanon("Темна лабораторія під станцією")

5. Auto-derivation (Phase 4)
   deriveMemory(canon) → NarrativeMemory updated

6. AI context enriched
   Next generation uses "Маркус" + "Темна лабораторія" as canonical context
```

---

## 🎬 Prototype Reference

From `MageBack.png` demo (White.html):

- **Editable scene:** "Розділ перший · чернетка — Жертва Оракула"
- **Trigger:** Blur event on prose text
- **Guardian:** Right-side panel with natural language
- **Coach tip:** First-time onboarding
- **Visual:** Violet/gold accent for canon entities

**Extend to:** All prose scenes (Пролог, Розділ перший, etc.)

---

**Status:** Ready for Implementation
**Dependencies:** Phase 3 ✅, Phase 4 MVP ✅
**Blocking:** Phase 5 (reconstruction)

**Contact:** Claude Code for implementation questions
**Handoff From:** Claude Design canonical spec

🤖 **Let's build the Guardian!**
