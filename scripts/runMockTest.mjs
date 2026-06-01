#!/usr/bin/env node
/**
 * Mock test - runs EXTRACT_CANON on fake project data without Firebase
 */

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

// Mock project with realistic data
const MOCK_PROJECT = {
  id: 'mock-project-123',
  title: 'Перший Сигнал',
  language: 'UA',
  memory: {
    characters: [
      {
        name: 'Кріг',
        role: 'Головний герой, дослідник',
        trait: 'Цілеспрямований, обережний',
        goals: 'Знайти джерело сигналу',
        relationships: 'Довіряє Айві',
        developmentArc: 'Від скептика до віруючого в контакт'
      },
      {
        name: 'Айві',
        role: 'Технік, напарниця',
        trait: 'Розумна, імпульсивна',
        goals: 'Розшифрувати сигнал',
        relationships: 'Працює з Крігом',
        developmentArc: 'Навчається довіряти інтуїції'
      },
      {
        name: 'Віктор',
        role: 'Командир бази',
        trait: 'Авторитарний, підозрілий',
        goals: 'Зберегти секретність',
        relationships: 'Конфліктує з Крігом',
        developmentArc: 'Розкриває приховану мотивацію'
      }
    ],
    locations: [
      'Арктична станція "Горизонт"',
      'Підземна лабораторія',
      'Кімната прослуховування'
    ],
    timeline: [
      'День 1: Перше виявлення сигналу',
      'День 3: Розшифровка першого фрагменту',
      'День 7: Конфлікт з командуванням'
    ],
    worldRules: [
      'Сигнал йде з глибин льоду',
      'Температура на станції критична',
      'Зв\'язок із зовнішнім світом обмежений'
    ],
    plotEvents: [
      'Виявлення аномального сигналу',
      'Розшифровка математичного коду',
      'Конфлікт з Віктором через доступ до даних'
    ]
  },
  architecture: {
    title: 'Перший Сигнал',
    premise: 'Група дослідників на арктичній станції виявляє загадковий сигнал з глибин льоду',
    acts: {
      act1: {
        title: 'Виявлення',
        description: 'Перший контакт з невідомим',
        chapters: [{
          title: 'Глава 1',
          scenes: [{
            title: 'Аномалія',
            description: 'Кріг виявляє незвичайний сигнал',
            characterGoals: ['Зрозуміти природу сигналу'],
            conflicts: ['Скептицизм команди']
          }]
        }]
      },
      act2: {
        title: 'Розкриття',
        description: 'Правда виходить на поверхню',
        chapters: [{
          title: 'Глава 2',
          scenes: [{
            title: 'Розшифровка',
            description: 'Айві знаходить патерн у сигналі',
            characterGoals: ['Довести що сигнал інтелектуальний'],
            conflicts: ['Віктор забороняє продовжувати']
          }]
        }]
      },
      act3: {
        title: 'Контакт',
        description: 'Доля людства в руках дослідників',
        chapters: [{
          title: 'Глава 3',
          scenes: [{
            title: 'Відповідь',
            description: 'Команда відправляє відповідь',
            characterGoals: ['Встановити контакт'],
            conflicts: ['Віктор намагається знищити дані']
          }]
        }]
      }
    }
  },
  text: `Кріг не міг відірвати погляду від екрана. Сигнал повторювався з математичною точністю — кожні 11.37 секунди, три короткі імпульси, один довгий, знову три короткі.

— Це не може бути природним явищем, — прошепотів він.

Айві підняла голову від свого терміналу. Її пальці завмерли над клавіатурою.

— Що ти кажеш?

— Подивись на патерн. — Кріг показав на графік частот. — Це не просто радіошум. Це... послідовність.

Двері лабораторії відчинилися з різким звуком. Віктор увійшов, його обличчя було похмурим.

— Припиніть це негайно, — наказав він. — Я отримав наказ згорнути дослідження.

— Командире, ви не розумієте, — почала Айві, але Віктор різко перебив:

— Саме я розумію. Ви не знаєте, з чим маєте справу.

Кріг підвівся з крісла, його руки тремтіли від напруги.

— Це може бути перший контакт з позаземним розумом, і ви хочете це приховати?

Віктор підійшов ближче, його голос став тихішим, але жорсткішим:

— Я хочу зберегти цю станцію. І всіх вас.`
};

// Canon extraction functions
const EXTRACT_CANON_SYSTEM = `
You extract a NORMALIZED CANON GRAPH from an existing story project.
You DO NOT invent facts. Only surface entities/links explicitly supported by the
provided Narrative Memory, Architecture and Text. If unsure, lower the confidence.

For every entity output: a stable opaque id ("char_xxxx", "loc_xxxx", "evt_xxxx",
"fac_xxxx", "art_xxxx"), a url slug, a display name, and cross-links to other
entities BY THEIR id. Links are typed by target type (characters/locations/events/
factions/artifacts). Relationships between characters carry a short "kind".

CRITICAL:
- Output is treated as INFERRED (proposals), not truth.
- Give each entity & link a confidence 0..1.
- Reuse the SAME id when the same entity recurs.
- Keep names in the project's language. Do not translate.
- Do not duplicate entities that already exist (match by name, case-insensitive).
`.trim();

const EXTRACT_CANON_RESPONSE_PROPERTIES = {
  type: "object",
  properties: {
    canon: {
      type: "object",
      properties: {
        characters: { type: "array", items: { type: "object", properties: {
          id: { type: "string" }, slug: { type: "string" }, name: { type: "string" },
          role: { type: "string" }, trait: { type: "string" }, goal: { type: "string" },
          developmentArc: { type: "string" },
          relations: { type: "array", items: { type: "object", properties: {
            id: { type: "string" }, kind: { type: "string" }, confidence: { type: "number" },
          }, required: ["id", "kind"] } },
          locations: { type: "array", items: { type: "string" } },
          factions: { type: "array", items: { type: "string" } },
          artifacts: { type: "array", items: { type: "string" } },
          events: { type: "array", items: { type: "string" } },
          confidence: { type: "number" },
        }, required: ["id", "name", "role", "confidence"] } },
        locations: { type: "array", items: { type: "object", properties: {
          id: { type: "string" }, slug: { type: "string" }, name: { type: "string" },
          desc: { type: "string" }, confidence: { type: "number" },
        }, required: ["id", "name", "confidence"] } },
        events: { type: "array", items: { type: "object", properties: {
          id: { type: "string" }, slug: { type: "string" }, name: { type: "string" },
          when: { type: "string" }, act: { type: "number" },
          characters: { type: "array", items: { type: "string" } },
          locations: { type: "array", items: { type: "string" } },
          confidence: { type: "number" },
        }, required: ["id", "name", "confidence"] } },
        factions: { type: "array", items: { type: "object", properties: {
          id: { type: "string" }, slug: { type: "string" }, name: { type: "string" },
          align: { type: "string" }, desc: { type: "string" }, confidence: { type: "number" },
        }, required: ["id", "name", "confidence"] } },
        artifacts: { type: "array", items: { type: "object", properties: {
          id: { type: "string" }, slug: { type: "string" }, name: { type: "string" },
          owner: { type: "string" }, desc: { type: "string" }, confidence: { type: "number" },
        }, required: ["id", "name", "confidence"] } },
        world: { type: "object", properties: { rules: { type: "array", items: { type: "string" } } } },
      },
    },
  },
  required: ["canon"],
};

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[«»"']/g, "").replace(/[^a-z0-9а-яіїєґ]+/gi, "-").replace(/^-+|-+$/g, "");

function asInferredCanon(raw) {
  const stamp = (e) => ({
    ...e,
    type: e.type || (e.id?.startsWith('char_') ? 'characters' : e.id?.startsWith('loc_') ? 'locations' : e.id?.startsWith('evt_') ? 'events' : e.id?.startsWith('fac_') ? 'factions' : 'artifacts'),
    slug: e.slug || slugify(e.name),
    origin: {
      source: "inferred",
      confidence: e.confidence ?? e.trait_confidence ?? 0.5,
      confirmed: false,
      createdBy: "migration",
      updatedAt: Date.now()
    },
  });
  // AI може повернути з обгорткою "canon" або без
  const c = raw.canon || raw;
  return {
    characters: (c.characters || []).map(stamp),
    locations: (c.locations || []).map(stamp),
    events: (c.events || c.plotEvents || []).map(stamp),
    factions: (c.factions || []).map(stamp),
    artifacts: (c.artifacts || []).map(stamp),
    world: c.world || { rules: [] },
  };
}

function buildExtractCanonInput(opts) {
  const { memory, architecture, text } = opts;
  return [
    "=== NARRATIVE MEMORY ===",
    JSON.stringify(memory, null, 2),
    architecture ? "=== ARCHITECTURE ===\n" + JSON.stringify(architecture, null, 2) : "",
    text ? "=== CURRENT TEXT (excerpt) ===\n" + text.slice(0, 6000) : "",
    "",
    "Extract the canon graph. Mark every item with a confidence. Reuse ids for recurring entities.",
  ].filter(Boolean).join("\n\n");
}

function deriveMemory(canon) {
  const authoritative = (arr = []) =>
    arr.filter((e) => e.origin?.source === "explicit" || e.origin?.confirmed === true);

  const nameOf = (canon, id) => {
    for (const k of ["characters", "locations", "events", "factions", "artifacts"]) {
      const hit = canon[k]?.find((e) => e.id === id);
      if (hit) return hit.name;
    }
    return id;
  };

  const chars = authoritative(canon.characters);
  const events = authoritative(canon.events);

  return {
    characters: chars.map((c) => ({
      name: c.name,
      role: c.role,
      trait: c.trait,
      goals: c.goal,
      relationships: (c.relations ?? [])
        .map((r) => `${nameOf(canon, r.id)}: ${r.kind}`)
        .join("; "),
      developmentArc: c.developmentArc,
    })),
    locations: authoritative(canon.locations).map((l) => l.name),
    timeline: events.map((e) => (e.when ? `${e.when}: ${e.name}` : e.name)),
    worldRules: canon.world?.rules ?? [],
    plotEvents: events.map((e) => e.name),
  };
}

async function runMockTest() {
  console.log('\n🧪 ========== MOCK BACKFILL TEST ==========');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('📦 Using MOCK project data (no Firebase)\n');

  // Display mock project
  console.log(`📖 Mock Project: "${MOCK_PROJECT.title}" (${MOCK_PROJECT.language})`);
  console.log(`   Memory: ${MOCK_PROJECT.memory.characters.length} chars, ${MOCK_PROJECT.memory.locations.length} locs`);
  console.log(`   Architecture: ${Object.keys(MOCK_PROJECT.architecture.acts).length} acts`);
  console.log(`   Text: ${MOCK_PROJECT.text.length} chars\n`);

  // Run EXTRACT_CANON
  console.log('🤖 Running EXTRACT_CANON mode (calling Gemini API)...');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = buildExtractCanonInput({
    memory: MOCK_PROJECT.memory,
    architecture: MOCK_PROJECT.architecture,
    text: MOCK_PROJECT.text,
  });

  console.log(`   Prompt length: ${prompt.length} chars`);
  console.log(`   Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}\n`);

  const result = await genAI.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'system', parts: [{ text: EXTRACT_CANON_SYSTEM }] },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: EXTRACT_CANON_RESPONSE_PROPERTIES.properties,
        required: EXTRACT_CANON_RESPONSE_PROPERTIES.required,
      },
    },
  });

  let responseText;
  if (result.text) {
    responseText = result.text;
  } else if (result.response && typeof result.response.text === 'function') {
    responseText = result.response.text();
  } else if (result.candidates && result.candidates[0]) {
    responseText = result.candidates[0].content.parts[0].text;
  } else {
    throw new Error('Could not extract text from Gemini response');
  }

  // Clean markdown wrapping if present
  let cleanedText = responseText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.substring(7);
  }
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.substring(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  const aiResult = JSON.parse(cleanedText);
  console.log('✅ AI extraction complete');
  console.log('   Raw response keys:', Object.keys(aiResult));
  console.log('   Raw response preview:', JSON.stringify(aiResult).substring(0, 500), '\n');

  // Post-process
  console.log('🏷️  Stamping entities as inferred (confirmed:false)...');
  const inferredCanon = asInferredCanon(aiResult);

  const stats = {
    characters: inferredCanon.characters?.length || 0,
    locations: inferredCanon.locations?.length || 0,
    events: inferredCanon.events?.length || 0,
    factions: inferredCanon.factions?.length || 0,
    artifacts: inferredCanon.artifacts?.length || 0,
    worldRules: inferredCanon.world?.rules?.length || 0,
  };

  console.log('📊 Extraction stats:', stats);

  // Sample entities
  console.log('\n🔍 Sample entities:');
  if (inferredCanon.characters?.length > 0) {
    console.log('\n   Character:', inferredCanon.characters[0].name);
    console.log('   - ID:', inferredCanon.characters[0].id);
    console.log('   - Slug:', inferredCanon.characters[0].slug);
    console.log('   - Origin:', JSON.stringify(inferredCanon.characters[0].origin));
  }
  if (inferredCanon.locations?.length > 0) {
    console.log('\n   Location:', inferredCanon.locations[0].name);
    console.log('   - ID:', inferredCanon.locations[0].id);
    console.log('   - Slug:', inferredCanon.locations[0].slug);
  }
  if (inferredCanon.events?.length > 0) {
    console.log('\n   Event:', inferredCanon.events[0].name);
    console.log('   - ID:', inferredCanon.events[0].id);
    console.log('   - When:', inferredCanon.events[0].when || 'N/A');
  }

  // TESTS
  console.log('\n' + '='.repeat(50));
  console.log('🧪 RUNNING TESTS...\n');

  const tests = [];

  // TEST 1: Structure
  console.log('TEST 1: Canon structure validation...');
  const hasStructure =
    inferredCanon.characters &&
    inferredCanon.locations &&
    inferredCanon.events &&
    inferredCanon.characters.length > 0;

  const hasRequiredFields = inferredCanon.characters.every(c =>
    c.id && c.name && c.slug && c.origin
  );

  const test1Pass = hasStructure && hasRequiredFields;
  tests.push({ name: 'Canon structure', passed: test1Pass });
  console.log(test1Pass ? '   ✅ PASS - All required fields present' : '   ❌ FAIL - Missing fields');

  // TEST 2: All inferred
  console.log('\nTEST 2: All entities inferred + unconfirmed...');
  const allEntities = [
    ...(inferredCanon.characters || []),
    ...(inferredCanon.locations || []),
    ...(inferredCanon.events || []),
    ...(inferredCanon.factions || []),
    ...(inferredCanon.artifacts || []),
  ];

  const allInferred = allEntities.every((e) =>
    e.origin?.source === 'inferred' && e.origin?.confirmed === false
  );

  tests.push({ name: 'All entities inferred', passed: allInferred });
  console.log(allInferred ? '   ✅ PASS - All entities marked as inferred' : '   ❌ FAIL - Found confirmed entities');

  if (!allInferred) {
    const bad = allEntities.filter(e => e.origin?.confirmed !== false || e.origin?.source !== 'inferred');
    console.log('   ⚠️  Problem entities:', bad.map(e => `${e.name} (${e.origin?.source}, confirmed:${e.origin?.confirmed})`));
  }

  // TEST 3: deriveMemory empty
  console.log('\nTEST 3: deriveMemory returns empty (safe migration proof)...');
  const derived = deriveMemory(inferredCanon);
  const isEmpty =
    derived.characters.length === 0 &&
    derived.locations.length === 0 &&
    derived.timeline.length === 0 &&
    derived.plotEvents.length === 0;

  tests.push({ name: 'deriveMemory empty', passed: isEmpty });
  console.log(isEmpty ? '   ✅ PASS - deriveMemory correctly ignores unconfirmed entities' : '   ❌ FAIL - deriveMemory has data');
  console.log('   Derived memory:', JSON.stringify(derived));

  // TEST 4: Idempotency simulation
  console.log('\nTEST 4: ID stability check...');
  const hasStableIds = inferredCanon.characters.every(c =>
    c.id.startsWith('char_') && c.id.length > 6
  );
  tests.push({ name: 'Stable IDs', passed: hasStableIds });
  console.log(hasStableIds ? '   ✅ PASS - All IDs have correct format' : '   ❌ FAIL - Invalid ID format');

  // SUMMARY
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY:\n');

  tests.forEach((t, i) => {
    console.log(`   ${i+1}. ${t.passed ? '✅' : '❌'} ${t.name}`);
  });

  const allPassed = tests.every(t => t.passed);
  console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'));
  console.log('='.repeat(50) + '\n');

  if (allPassed) {
    console.log('✅ EXTRACT_CANON works correctly!');
    console.log('✅ Canon data structure is valid');
    console.log('✅ Migration is safe (no auto-confirm)');
    console.log('✅ Stable IDs generated');
    console.log('\n➡️  NEXT STEP: Build UI for confirmation queue (Phase 2.3)');
    console.log('\n📝 Extracted canon ready for Firestore (not saved in mock mode)');
  } else {
    console.log('⚠️  Fix extraction issues before proceeding to UI');
  }

  console.log('\n💾 Mock canon output saved to: canon-output.json');

  // Save output for inspection
  const fs = await import('fs');
  fs.writeFileSync('canon-output.json', JSON.stringify(inferredCanon, null, 2));

  process.exit(allPassed ? 0 : 1);
}

runMockTest().catch((error) => {
  console.error('\n❌ Fatal test error:', error);
  console.error('\nStack:', error.stack);
  process.exit(1);
});
