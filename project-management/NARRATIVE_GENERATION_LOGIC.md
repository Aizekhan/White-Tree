# WhiteWrite Narrative Generation Logic - Детальна Архітектура

**Версія:** 1.0
**Дата:** 2026-06-01
**Статус:** Production (whitewrite.com)

---

## 📋 Зміст

1. [Огляд Системи](#огляд-системи)
2. [Архітектура Компонентів](#архітектура-компонентів)
3. [Структура Бази Даних](#структура-бази-даних)
4. [Логіка Генерації Наративу](#логіка-генерації-наративу)
5. [Narrative Memory System](#narrative-memory-system)
6. [Збереження Стилю та Консистентності](#збереження-стилю-та-консистентності)
7. [Auto-Save та Синхронізація](#auto-save-та-синхронізація)
8. [AI Modes та Їх Промпти](#ai-modes-та-їх-промпти)
9. [Обробка Помилок та Fallback](#обробка-помилок-та-fallback)
10. [Діаграми та Потоки Даних](#діаграми-та-потоки-даних)

---

## 🎯 Огляд Системи

WhiteWrite - це AI-powered платформа для написання наративів, яка використовує **багатошарову архітектуру** для збереження контексту, послідовності подій та стилю написання.

### Ключові Принципи

1. **Narrative Memory** - система збереження всіх важливих фактів про світ, персонажів, події
2. **Scene-Based Context** - кожна сцена має свій контекст (мета, конфлікт)
3. **Filtered Memory** - AI отримує лише релевантний контекст для поточної сцени
4. **Multi-Mode AI** - різні режими генерації (Write, Analyze, Improve, Adapt, Architect)
5. **Auto-Save Queue** - дебаунс-система збереження без втрат даних

---

## 🏗️ Архітектура Компонентів

### Шари Системи

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│  React Components (UI)                                  │
│    ├── NarrativeWorkspace (Editor UI)                   │
│    ├── BlueprintView (Architecture UI)                  │
│    └── MemoryPanel (Memory Management UI)               │
├─────────────────────────────────────────────────────────┤
│  State Management (Zustand)                             │
│    ├── useStoryStore.ts (Global State)                  │
│    └── useProjectState.ts (Firestore Sync Hook)         │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                   │
│    ├── AIEngine.ts (Prompt Construction)                │
│    └── architectureToScenes.ts (Data Adapters)          │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                        │
├─────────────────────────────────────────────────────────┤
│  Firebase Functions (Node.js)                           │
│    ├── /api/ai/generate (Main AI Endpoint)              │
│    ├── /api/ai/resync (Future History Sync)             │
│    └── Authentication Middleware                        │
├─────────────────────────────────────────────────────────┤
│  External AI Service                                    │
│    └── Google Gemini 2.5 Flash (REST API v1)            │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
├─────────────────────────────────────────────────────────┤
│  Firestore Collections                                  │
│    ├── users/ (User profiles)                           │
│    └── projects/ (Story projects)                       │
│         ├── text (Current scene text)                   │
│         ├── memory (Narrative Memory)                   │
│         ├── architecture (Story Structure)              │
│         ├── result (AI Analysis Results)                │
│         └── activeScene (Current Context)               │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Структура Бази Даних

### Firestore Schema

#### Collection: `projects`

```typescript
{
  // ── Metadata ──
  id: string,                    // Firestore auto-generated ID
  userId: string,                // Firebase Auth UID
  title: string,                 // Project title
  description: string,           // Project description
  language: 'UA' | 'ENG',        // Content language
  tier: 'free' | 'pro' | 'pro_plus', // Subscription tier

  // ── Timestamps ──
  createdAt: Timestamp,          // Creation date
  updatedAt: Timestamp,          // Last modification date

  // ── Editor State (Auto-saved) ──
  text: string,                  // Current scene text (live editor content)

  // ── Narrative Memory ──
  memory: {
    characters: [
      {
        name: string,            // Character name
        role: string,            // Protagonist, Antagonist, Supporting
        trait: string,           // Core personality trait
        status: string,          // Current status (alive, dead, injured, etc.)
        location: string,        // Current location
        goal: string,            // Main character goal
        relationships: string,   // Relationships with other characters
        developmentArc: string   // Character arc trajectory
      }
    ],
    locations: string[],         // List of locations mentioned
    timeline: string[],          // Chronological events
    worldRules: string[],        // Laws of physics, magic rules, etc.
    plotEvents: string[]         // Key plot events in order
  },

  // ── Story Architecture (Blueprint) ──
  architecture: {
    title: string,               // Story title
    premise: string,             // Story premise/logline
    acts: {
      act1: {
        title: string,           // Act I title
        description: string,     // Act I summary
        milestones: [
          {
            label: string,       // "Inciting Incident"
            description: string
          }
        ],
        chapters: [
          {
            title: string,
            scenes: [
              {
                title: string,
                description: string,
                characterGoals: string[],
                conflicts: string[],
                keyEvents: string[],       // NEW: External plot beats
                status: "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted",
                writtenText?: string,      // Written prose text
                adaptedText?: string,      // Adapted screenplay text
                adaptedTarget?: string,    // SCREENPLAY, VIDEO_CARDS, etc.
                isLocked?: boolean,        // True History lock (Pro+)

                // ── Cinematic Metadata (for Immersive UI) ──
                location?: string,         // EXT. FOREST - DAY
                timeOfDay?: string,        // Dawn, Day, Dusk, Night
                POV?: string,              // Character POV
                visualMood?: string,       // Golden hour, fog, rain
                atmosphericColor?: string  // Indigo-950, amber-900
              }
            ]
          }
        ]
      },
      act2: { /* Same structure */ },
      act3: { /* Same structure */ }
    }
  },

  // ── Active Scene Context ──
  activeScene: {
    act: string,                 // "ACT I"
    actKey: string,              // "act1"
    chapter: string,             // Chapter title
    chapterIdx: number,          // Chapter index
    scene: string,               // Scene title
    sceneIdx: number,            // Scene index
    title: string,               // Scene title (duplicate for quick access)
    description: string,         // Scene description
    goals: string[],             // Character goals for this scene
    conflicts: string[]          // Scene conflicts
  } | null,

  // ── AI Analysis Results ──
  result: {
    score: number,               // Overall score 0-10
    detailedScores: {
      plot: number,
      characters: number,
      conflict: number,
      atmosphere: number,
      dialogue: number,
      style: number
    },
    strengths: string[],
    weaknesses: string[],
    suggestions: string[],
    editorSuggestions: [
      {
        original: string,
        suggested: string,
        reason: string
      }
    ],
    consistencyIssues: [
      {
        type: "character" | "timeline" | "location" | "event" | "logic",
        description: string,
        contradiction: string
      }
    ],
    tensionAnalysis: [
      {
        segment: string,
        level: number,           // 0-10
        pacing: "slow" | "moderate" | "fast",
        hasConflict: boolean,
        note: string
      }
    ],
    storyMap: {
      nodes: [
        {
          id: string,
          label: string,
          type: "character" | "event" | "scene" | "location",
          description: string
        }
      ],
      links: [
        {
          source: string,        // Node ID
          target: string,        // Node ID
          relation: string       // "loves", "kills", "leads to"
        }
      ]
    }
    // ... (and many more fields, see types.ts)
  } | null,

  // ── Scene Progress Tracking ──
  sceneProgress: {
    [sceneTitle: string]: "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted"
  },

  // ── Token Balance ──
  tokens: number                 // AI operation credits
}
```

---

## 🤖 Логіка Генерації Наративу

### Потік Генерації (End-to-End)

```
┌──────────────────────────────────────────────────────────┐
│  1. USER ACTION                                          │
│     User clicks "Write" button in scene editor           │
└──────────────┬───────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  2. FRONTEND: AIEngine.generateNarrativeContent()        │
│     - Prepare params (text, mode, aspect, memory, etc.)  │
│     - Filter Narrative Memory (relevant to scene)        │
│     - Build systemInstruction (JSON schema + rules)      │
│     - Build prompt (user input + context)                │
└──────────────┬───────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  3. BACKEND: Firebase Function /api/ai/generate          │
│     - Verify Firebase Auth token                         │
│     - Call Gemini 2.5 Flash REST API                     │
│     - Receive raw text response                          │
│     - Parse JSON with 4-level fallback                   │
└──────────────┬───────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  4. AI MODEL: Gemini 2.5 Flash                           │
│     - Process systemInstruction (rules + JSON schema)    │
│     - Process user prompt (text + Narrative Memory)      │
│     - Generate structured JSON response                  │
│       {                                                   │
│         "improvedText": "...",                           │
│         "memorySuggestions": [...]                       │
│       }                                                   │
└──────────────┬───────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  5. FRONTEND: Process AI Response                        │
│     - Extract improvedText, memorySuggestions            │
│     - Update Zustand store (setText, setMemory)          │
│     - Trigger auto-save queue                            │
└──────────────┬───────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  6. AUTO-SAVE: Debounced Firestore Sync                  │
│     - 800ms debounce for text changes                    │
│     - 400ms debounce for memory changes                  │
│     - Enqueue save with version control                  │
│     - updateDoc(projectRef, snapshot)                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🧠 Narrative Memory System

### Що таке Narrative Memory?

**Narrative Memory** - це глобальна база знань про історію, яка **накопичується та оновлюється** під час написання. Вона забезпечує консистентність світу, персонажів та подій.

### Структура Пам'яті

```typescript
interface NarrativeMemory {
  characters: Character[];      // Персонажі з повними профілями
  locations: string[];          // Всі згадані локації
  timeline: string[];           // Хронологія подій
  worldRules: string[];         // Закони світу (магія, фізика, соціальні правила)
  plotEvents: string[];         // Ключові сюжетні події
}
```

### Приклад Наповнення Memory

```json
{
  "characters": [
    {
      "name": "Elena Rodriguez",
      "role": "Protagonist",
      "trait": "Determined but haunted by guilt",
      "status": "Alive, injured (leg wound)",
      "location": "Mars Outpost Delta",
      "goal": "Discover the source of the signal and return home",
      "relationships": "Trusts Viktor, distrusts Commander Reeves",
      "developmentArc": "From isolation to connection, overcoming survivor's guilt"
    },
    {
      "name": "Viktor Chen",
      "role": "Supporting Character",
      "trait": "Rational, emotionally distant",
      "status": "Alive, healthy",
      "location": "Mars Outpost Delta",
      "goal": "Analyze the signal and protect the crew",
      "relationships": "Professional bond with Elena, respects her skills",
      "developmentArc": "Learning to trust emotions over data"
    }
  ],
  "locations": [
    "Mars Outpost Delta - Research Station",
    "Crashed alien ship in Valles Marineris",
    "Underground cave system"
  ],
  "timeline": [
    "Day 1: Elena's crew lands on Mars",
    "Day 3: Signal detected from crashed ship",
    "Day 5: Elena enters the ship alone",
    "Day 7: Viktor discovers signal is a warning"
  ],
  "worldRules": [
    "Mars atmosphere is toxic without suit",
    "Communication with Earth has 20-minute delay",
    "Alien technology reacts to human touch",
    "The signal causes hallucinations in humans"
  ],
  "plotEvents": [
    "Elena's previous mission ended in crew death",
    "Signal is revealed to be alien distress beacon",
    "Commander Reeves hiding corporate agenda",
    "Underground structure is ancient alien city"
  ]
}
```

### Як Memory Оновлюється

#### 1. Automatic Extraction (AI-Driven)

Коли AI генерує текст (режим `Write` або `Improve`), він **автоматично аналізує** нові факти та пропонує оновлення:

```json
{
  "improvedText": "Elena stepped into the alien chamber...",
  "memorySuggestions": [
    {
      "id": "mem_001",
      "type": "character",
      "action": "update",
      "targetId": "Elena Rodriguez",
      "newData": {
        "status": "Alive, inside alien ship",
        "location": "Alien ship interior - command deck"
      },
      "reason": "Elena entered a new location and her status changed"
    },
    {
      "id": "mem_002",
      "type": "event",
      "action": "add",
      "targetId": "plot_events",
      "newData": {
        "event": "Elena discovers alien holographic interface"
      },
      "reason": "Significant plot event occurred"
    }
  ]
}
```

#### 2. Manual Editing (User Control)

Користувач може вручну редагувати Memory через **Memory Panel UI** (sidebar).

#### 3. Consistency Check

При режимі `Analyze`, AI перевіряє **суперечності** між текстом та Memory:

```json
{
  "consistencyIssues": [
    {
      "type": "character",
      "description": "Elena is described as wearing a red suit",
      "contradiction": "Memory states Elena's suit is blue (established in Chapter 1)"
    }
  ]
}
```

---

## 🎨 Збереження Стилю та Консистентності

### 1. Scene Context Filtering

**Проблема:** Якщо передавати всю Memory AI при кожному запиті, промпт стає надто великим і AI губиться.

**Рішення:** WhiteWrite використовує **контекстну фільтрацію** - AI отримує лише релевантні дані.

#### Код Фільтрації (AIEngine.ts:778-799)

```typescript
let filteredMemory = { ...memory };

if (activeScene && mode !== NarrativeMode.ARCHITECT) {
  // Збираємо контекст сцени в один рядок
  const sceneContextText = `${activeScene.title} ${activeScene.description} ${activeScene.goals.join(" ")} ${activeScene.conflicts.join(" ")} `.toLowerCase();

  // Фільтруємо персонажів (лише ті, що згадані в сцені)
  filteredMemory.characters = memory.characters.filter(c =>
    sceneContextText.includes(c.name.toLowerCase()) ||
    (c.location && sceneContextText.includes(c.location.toLowerCase()))
  );

  // Фільтруємо локації (лише релевантні)
  filteredMemory.locations = memory.locations.filter(l =>
    sceneContextText.includes(l.toLowerCase()) ||
    filteredMemory.characters.some(c => c.location && c.location.toLowerCase() === l.toLowerCase())
  );

  // Обмежуємо plotEvents (лише останні 5 подій)
  filteredMemory.plotEvents = memory.plotEvents.slice(-5);

  // Фільтруємо worldRules (лише релевантні до локації)
  filteredMemory.worldRules = memory.worldRules.filter(r =>
    sceneContextText.includes(r.toLowerCase()) ||
    filteredMemory.locations.some(l => r.toLowerCase().includes(l.toLowerCase()))
  );
}
```

**Результат:** AI отримує компактний, релевантний контекст замість гігабайтів даних.

---

### 2. Active Scene Context

Кожна сцена має **структурований контекст**, який передається AI:

```typescript
Current Scene Context:
Act: ACT II
Chapter: The Discovery
Scene: Elena Enters the Ship

Description:
Elena steps into the alien spacecraft. The air is cold and metallic. Strange symbols glow on the walls. She hears a faint humming sound.

Goal:
- Elena must find the source of the signal
- Activate the ship's navigation system

Conflict:
- Ship interior is unstable and shifting
- Hallucinations caused by alien technology
- Viktor warns her to abort via radio
```

Це гарантує, що AI **не забуде** про мету та конфлікт сцени.

---

### 3. Show, Don't Tell Instructions

WhiteWrite використовує **детальні інструкції** для збереження стилю:

```
Guidelines for Narrative Generation:
- Show, Don't Tell: Present information through observation, dialogue, or action.
- Sensory Focus: Prioritize sensory experience and character reactions.
- Lore Consistency: Do not contradict established facts in Narrative Memory.

Scene Structure Requirements:
1. Setup: Begin with the character actively pursuing the defined Scene Goal.
2. Inciting Conflict: Introduce the defined Scene Conflict naturally.
3. Escalation: Increase tension or stakes.
4. Outcome: End the scene with a clear outcome (Success, Failure, Complication, New information).
```

---

### 4. Language Instruction

Всі генерації **строго дотримуються мови проєкту**:

```javascript
const languageInstruction = `CRITICAL: All generated text, analysis, suggestions, and story elements MUST be in ${activeProject?.language === 'UA' ? 'Ukrainian' : 'English'}.`;
```

---

## 💾 Auto-Save та Синхронізація

### Проблема: Race Conditions та Втрата Даних

Коли користувач швидко друкує, без системи черг можливі:
- **Перезаписування новіших даних старішими** (race condition)
- **Втрата змін через паралельні запити**
- **Помилки синхронізації між вкладками**

### Рішення: Save Queue System

WhiteWrite використовує **версійну систему черг** з дебаунсом.

#### Код Системи (useStoryStore.ts:161-197)

```typescript
enqueueSave: (projectId, snapshot, saveFn) => {
  const state = get();

  // 1. Increment version immediately (Optimistic UI)
  const version = state.currentSaveVersion + 1;
  set({ currentSaveVersion: version, isDirty: true });

  const newQueue = state.saveQueue.then(async () => {
    // 2. Skip outdated versions (Race condition fix)
    if (version < get().currentSaveVersion) {
      console.log(`[SAVE_QUEUE] Skipping version ${version} (obsolete)`);
      return;
    }

    set({ isSaving: true, saveStatus: 'saving' });
    try {
      // 3. Persistence to Firestore
      await saveFn(projectId, snapshot);

      // 4. Clear isDirty ONLY if this is still the latest version
      if (version === get().currentSaveVersion) {
        set({ isDirty: false, saveStatus: 'saved' });
      }
    } catch (err) {
      set({ saveStatus: 'error' });
      console.error("[SAVE_QUEUE] Save error:", err);
    } finally {
      if (get().saveQueue === newQueue) {
        set({ isSaving: false });
      }
    }
  });

  set({ saveQueue: newQueue });
}
```

### Дебаунс Таймери (useProjectState.ts:152-183)

```typescript
// Auto-save: TEXT (800ms debounce)
useEffect(() => {
  if (!activeProjectId || isInitialLoad || isHydrating) return;

  const timer = setTimeout(() => {
    triggerSave(false);
  }, 800);

  return () => clearTimeout(timer);
}, [text]);

// Auto-save: MEMORY (400ms debounce)
useEffect(() => {
  if (!activeProjectId || isInitialLoad || isHydrating) return;

  const timer = setTimeout(() => {
    triggerSave(false);
  }, 400);

  return () => clearTimeout(timer);
}, [memory]);

// Auto-save: Catch-all (3s debounce)
useEffect(() => {
  if (!activeProjectId || isInitialLoad || isHydrating || !store.isDirty) return;

  const timer = setTimeout(() => {
    triggerSave(false);
  }, 3000);

  return () => clearTimeout(timer);
}, [store.isDirty]);
```

**Результат:**
- ✅ Жодних втрат даних
- ✅ Мінімум запитів до Firestore (дебаунс)
- ✅ Версійний контроль (пропуск застарілих збережень)

---

## 🎭 AI Modes та Їх Промпти

WhiteWrite підтримує **5 режимів AI**:

### 1. WRITE Mode

**Призначення:** Генерація нового тексту або продовження історії.

**Промпт Структура:**

```
You are an expert Narrative Writer and Editor.

CRITICAL CONTEXT:
- Use the Active Scene Context (Title, Description, Goal, Conflict) as the primary blueprint.
- Consult Narrative Memory (Characters, Locations, World Rules) to ensure absolute consistency.

Guidelines:
- Show, Don't Tell: Present through observation, dialogue, action.
- Sensory Focus: Prioritize sensory experience and character reactions.
- Lore Consistency: Do not contradict established facts.

Scene Structure Requirements:
1. Setup: Begin with character actively pursuing Scene Goal.
2. Inciting Conflict: Introduce Scene Conflict naturally.
3. Escalation: Increase tension or stakes.
4. Outcome: End with clear outcome (Success, Failure, Complication).

NARRATIVE MEMORY EXTRACTION:
- Extract updates for Narrative Memory ONLY if significant new facts.
- DO NOT suggest duplicates.
- Detect new characters, locations, events, world rules.

Return:
{
  "improvedText": "...",
  "memorySuggestions": [...]
}
```

**AI Temperature:** `0.7` (креативний)

---

### 2. ANALYZE Mode

**Призначення:** Повний діагностичний аналіз тексту.

**Промпт Структура:**

```
Perform a complete narrative diagnostic of the provided text.

CRITICAL ANALYSIS TASKS:
1. Consistency Check: Compare text against Narrative Memory. Identify contradictions.
2. Goal Progression: Evaluate if scene addresses the defined Scene Goal.
3. Conflict Resolution: Analyze how Scene Conflict is handled.
4. Narrative Diagnostic: Provide scores (0-10), strengths, weaknesses, suggestions.
5. Tension Analysis: Break narrative into 8-10 segments, evaluate tension.
6. Story Structure: Identify standard story structure stages.
7. NARRATIVE MEMORY EXTRACTION: Extract ONLY significant new facts.

SCORING GUIDELINES (0-10):
- 0-3: Critical issues
- 4-6: Functional but lacking
- 9-10: Exceptional

Return:
{
  "score": 8,
  "detailedScores": { plot: 8, characters: 9, conflict: 7, ... },
  "strengths": [...],
  "weaknesses": [...],
  "suggestions": [...],
  "consistencyIssues": [...],
  "tensionAnalysis": [...],
  "storyMap": { nodes: [...], links: [...] }
}
```

**AI Temperature:** `0.2` (аналітичний, детермінований)

---

### 3. IMPROVE Mode

**Призначення:** Покращення існуючого тексту без зміни сюжету.

**Промпт Структура:**

```
Improve the provided text by rewriting weak sections, focusing on: [selected aspect].

CONSTRAINTS:
- DO NOT change the plot, character goals, or established facts.
- Enhance prose, pacing, emotional resonance while maintaining original voice.
- Ensure consistency with Narrative Memory and Active Scene Context.

Return:
{
  "improvedText": "...",
  "editorSuggestions": [
    {
      "original": "He walked slowly",
      "suggested": "He dragged his feet, every step heavier than the last",
      "reason": "Added sensory detail and emotional weight"
    }
  ],
  "memorySuggestions": [...]
}
```

**AI Temperature:** `0.7`

---

### 4. ADAPT Mode

**Призначення:** Конвертація прози у screenplay, video cards, poetry, тощо.

**Приклад для Screenplay:**

```
Convert the provided narrative text into a structured, professional scene-based screenplay.

FORMATTING RULES:
- Use standard sluglines: INT. or EXT. LOCATION - TIME OF DAY.
- Character names in ALL CAPS before dialogue.
- Action lines: concise, present tense.

CINEMATIC WRITING (CRITICAL):
- SHOW, DON'T TELL: A director cannot "film" abstract thoughts or internal feelings.
- Replace abstract descriptions with concrete, visible actions.
- ❌ BAD: "Nature desperately tries to warn its creature."
- ✅ GOOD: "The fog thickens. Roots under the crawler's paws move slowly."

Return:
{
  "improvedText": "Full formatted markdown screenplay",
  "script": {
    "title": "...",
    "scenes": [
      {
        "sceneNumber": 1,
        "slugline": "INT. MARS OUTPOST - NIGHT",
        "elements": [
          { "type": "action", "text": "Elena stares at the monitor..." },
          { "type": "dialogue", "character": "ELENA", "text": "It's still there." }
        ]
      }
    ]
  }
}
```

**Підтримувані формати:**
- `SCREENPLAY` - Професійний кіносценарій
- `VIDEO_CARDS` - YouTube Shorts / TikTok формат
- `TODDLER_BOOK` - Дитяча книга з ілюстраціями
- `POETRY` - Поетична адаптація
- `SOCIAL_POST` - Вірусний пост для соцмереж

---

### 5. ARCHITECT Mode

**Призначення:** Генерація повної структури історії з ідеї (3-act structure).

**Промпт Структура:**

```
Generate a full story structure from a short idea.
Create a full narrative outline including ACT I, ACT II, and ACT III.
For each act, include chapters, scenes, character goals, and conflicts.

CRITICAL: For every scene, provide 3-5 "keyEvents" (external plot beats).

Return:
{
  "architecture": {
    "title": "...",
    "premise": "...",
    "acts": {
      "act1": {
        "title": "Setup",
        "description": "...",
        "milestones": [
          { "label": "Inciting Incident", "description": "..." }
        ],
        "chapters": [
          {
            "title": "Chapter 1",
            "scenes": [
              {
                "title": "Opening Scene",
                "description": "...",
                "characterGoals": ["..."],
                "conflicts": ["..."],
                "keyEvents": ["..."]
              }
            ]
          }
        ]
      },
      "act2": { ... },
      "act3": { ... }
    }
  },
  "storyMap": { nodes: [...], links: [...] }
}
```

---

## ⚠️ Обробка Помилок та Fallback

### Backend: 4-Level JSON Parsing

WhiteWrite використовує **4-рівневу систему відновлення** для парсингу JSON від AI (functions/index.js:31-86):

```javascript
function safeParseJSON(rawText, modelName) {
  const cleaned = cleanAIResponse(rawText);

  // Level 1: Normal parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    console.warn(`[PARSE] Level 1 failed`);
  }

  // Level 2: Find last closing brace (truncated response)
  try {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0) {
      return JSON.parse(cleaned.substring(0, lastBrace + 1));
    }
  } catch (err2) {}

  // Level 3: Auto-close unclosed braces/brackets
  try {
    let attempt = cleaned;
    let braces = 0, brackets = 0;
    // ... counting logic ...
    attempt += ']'.repeat(Math.max(0, brackets));
    attempt += '}'.repeat(Math.max(0, braces));
    return JSON.parse(attempt);
  } catch (err3) {}

  // Level 4: Return raw text as fallback (NEVER crash)
  console.error(`[PARSE] All levels failed. Returning rawText fallback.`);
  return { rawText: cleaned, parseError: true };
}
```

**Результат:** Система **ніколи не крашиться** через невалідний JSON від AI.

---

### Frontend: Response Normalization

AIEngine також нормалізує відповіді (AIEngine.ts:724-776):

```typescript
const normalizeResponse = (data: any) => {
  if (!data) return data;

  // Handle backend parseError flag
  if (data.parseError === true && data.rawText) {
    console.warn("[AI] Backend parseError. Attempting simple recovery...");
    let cleaned = data.rawText.trim();
    // Remove markdown wrappers
    if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
    // ... try JSON.parse again ...

    // If still fails, return raw text
    return {
      improvedText: data.rawText || "",
      rawText: data.rawText || "",
      parseError: true
    };
  }

  // Handle field variations (architecture vs storyArchitecture)
  if (data.storyArchitecture && !data.architecture) {
    data.architecture = data.storyArchitecture;
  }

  // Convert acts array to object
  if (data.architecture && Array.isArray(data.architecture.acts)) {
    const actsObj = {};
    data.architecture.acts.forEach((act, index) => {
      actsObj[`act${index + 1}`] = act;
    });
    data.architecture.acts = actsObj;
  }

  return data;
};
```

---

## 📊 Діаграми та Потоки Даних

### Data Flow: Write Mode

```
┌─────────────┐
│    USER     │
│  Types text │
└──────┬──────┘
       ↓
┌──────────────────────┐
│  Editor Component    │
│  setText(newText)    │
└──────┬───────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  Zustand Store                                   │
│  - text: updated                                 │
│  - isDirty: true                                 │
│  - Triggers useEffect in useProjectState         │
└──────┬───────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  Auto-Save (800ms debounce)                      │
│  - setTimeout(() => triggerSave(), 800)          │
└──────┬───────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  enqueueSave()                                   │
│  - version++                                     │
│  - Queue promise chain                           │
│  - Skip if version < currentSaveVersion          │
└──────┬───────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  Firestore updateDoc()                           │
│  - projects/{projectId}                          │
│  - { text, memory, architecture, updatedAt }     │
└──────────────────────────────────────────────────┘
```

---

### AI Request Flow: WRITE Mode

```
┌───────────────────┐
│  User Clicks      │
│  "Write" Button   │
└────────┬──────────┘
         ↓
┌────────────────────────────────────────────┐
│  AIEngine.generateNarrativeContent()       │
│  - mode: NarrativeMode.WRITE               │
│  - text: current scene text                │
│  - memory: Narrative Memory                │
│  - activeScene: { title, description, ... }│
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Filter Narrative Memory                   │
│  - Extract relevant characters             │
│  - Extract relevant locations              │
│  - Last 5 plot events only                 │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Build systemInstruction                   │
│  - Mode-specific instructions              │
│  - JSON schema (responseProperties)        │
│  - Language instruction (UA/ENG)           │
│  - Filtered Memory context                 │
│  - Active Scene context                    │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  HTTP POST /api/ai/generate                │
│  Headers: Authorization: Bearer {token}    │
│  Body: {                                   │
│    systemInstruction,                      │
│    prompt,                                 │
│    responseProperties,                     │
│    config: { temperature: 0.7 }            │
│  }                                         │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Backend: Verify Auth Token                │
│  - admin.auth().verifyIdToken()            │
│  - Return 401 if invalid                   │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Backend: callGeminiREST()                 │
│  - URL: https://generativelanguage.        │
│    googleapis.com/v1/models/               │
│    gemini-2.5-flash:generateContent        │
│  - Body: { contents, generationConfig }    │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Gemini 2.5 Flash Processing               │
│  - Analyze systemInstruction               │
│  - Analyze user prompt + context           │
│  - Generate structured JSON response       │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Backend: safeParseJSON()                  │
│  - Level 1: JSON.parse()                   │
│  - Level 2: Find last '}'                  │
│  - Level 3: Auto-close brackets            │
│  - Level 4: Return { rawText, parseError } │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Return JSON to Frontend                   │
│  {                                         │
│    "improvedText": "...",                  │
│    "memorySuggestions": [...]              │
│  }                                         │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Frontend: normalizeResponse()             │
│  - Handle parseError flag                  │
│  - Normalize field names                   │
│  - Convert acts array to object            │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Update Zustand Store                      │
│  - setText(data.improvedText)              │
│  - setMemory(...apply suggestions)         │
│  - setResult(data)                         │
└────────┬───────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Auto-Save Triggered                       │
│  - Debounced save to Firestore             │
└────────────────────────────────────────────┘
```

---

## 🔒 Механізми Збереження Консистентності

### 1. Project Isolation

Кожен проєкт ізольований на рівні **промпту**:

```javascript
CRITICAL PROJECT CONTEXT (DATA ISOLATION):
- Project ID: ${activeProject?.id || 'New Project'}
- Project Title: ${activeProject?.title || 'Untitled'}
```

**Результат:** AI не плутає різні історії між собою.

---

### 2. Memory Suggestions Workflow

AI не змінює Memory напряму - він лише **пропонує** зміни:

```typescript
interface MemorySuggestion {
  id: string;
  type: "character" | "location" | "event" | "timeline" | "rule";
  action: "add" | "update";
  targetId: string;        // EXACT name or index
  newData: {
    name?: string;
    role?: string;
    status?: string;
    location?: string;
    // ... all character fields
  };
  reason: string;          // Why this change is suggested
}
```

Користувач може **прийняти або відхилити** кожну пропозицію через UI.

---

### 3. True History Lock (Pro+ Feature)

Для Pro+ користувачів є функція **True History** - написані сцени **блокуються** і не змінюються при regeneration:

```typescript
interface ArchitectScene {
  title: string;
  description: string;
  writtenText?: string;    // If present, scene is considered "written"
  isLocked?: boolean;      // True History lock (immutable)
  // ...
}
```

При resync (функція `resyncFutureHistory`), AI:
- **НЕ змінює** True History scenes
- **Regenerates** лише Future History scenes
- **Виявляє inconsistencies** між True та Future History

---

### 4. Consistency Issues Detection

В режимі `Analyze`, AI автоматично виявляє суперечності:

```json
{
  "consistencyIssues": [
    {
      "type": "character",
      "description": "Viktor is described as being on Earth",
      "contradiction": "Memory states Viktor is on Mars Outpost Delta"
    },
    {
      "type": "timeline",
      "description": "Text says 'Day 2' but previous scene ended on Day 5",
      "contradiction": "Timeline inconsistency - events out of order"
    },
    {
      "type": "location",
      "description": "Scene describes red sky",
      "contradiction": "Mars sky is established as pink-orange in Memory"
    }
  ]
}
```

---

## 🎯 Висновки

### Чому WhiteWrite Зберігає Послідовність?

1. **Narrative Memory** - глобальна база фактів, яка постійно оновлюється
2. **Filtered Context** - AI отримує лише релевантні дані для кожної сцени
3. **Active Scene Goals/Conflicts** - структурований контекст для кожної генерації
4. **Memory Suggestions** - AI пропонує зміни, а не змінює напряму
5. **Consistency Checks** - автоматичне виявлення суперечностей
6. **True History Lock** - захист написаних сцен від перезапису

### Чому WhiteWrite Зберігає Стиль?

1. **Language Instruction** - строга мовна політика (UA/ENG)
2. **Show, Don't Tell** - детальні інструкції для стилю
3. **Scene Structure Rules** - чіткі правила композиції сцен
4. **Temperature Control** - креативність (0.7) vs аналітичність (0.2)
5. **Aspect Focus** - користувач обирає аспект для покращення

### Чому WhiteWrite Не Втрачає Даних?

1. **Save Queue System** - версійний контроль без race conditions
2. **Debounced Auto-Save** - 800ms/400ms/3s дебаунс
3. **4-Level JSON Parsing** - ніколи не крашиться через невалідний JSON
4. **Response Normalization** - обробка parseError та fallback
5. **Firestore Timestamps** - updatedAt для аудиту

---

## 📚 Технічний Стек

- **Frontend:** React 19, TypeScript, Zustand
- **Backend:** Firebase Functions (Node.js), Firestore
- **AI:** Google Gemini 2.5 Flash (REST API v1)
- **Auth:** Firebase Authentication
- **Hosting:** Firebase Hosting

---

**Документ створено:** 2026-06-01
**Версія WhiteWrite:** VER_27_STABLE_FLOW
**Автор:** Claude Code (Sonnet 4.5) + Aizekhan

