/**
 * Phase 2.4 Unit Test — Offline mock test (no API, no Firebase)
 *
 * Purpose: Prove that migration is safe using pure TypeScript
 *
 * Run: npx tsx src/canon/phase2.test.ts
 */

import { deriveMemory } from './deriveMemory';
import { asInferredCanon } from './extractCanonPrompt';
import type { NarrativeMemory } from '../types';

console.log('\n🧪 ========== PHASE 2.4 OFFLINE TEST ==========');
console.log('⏰ Started at:', new Date().toISOString());
console.log('📦 Pure TypeScript test (no API calls)\n');

// Mock extraction result (як би повернув AI)
const MOCK_AI_EXTRACTION = {
  canon: {
    characters: [
      {
        id: 'char_krig',
        name: 'Кріг',
        role: 'Дослідник',
        trait: 'Цілеспрямований',
        goal: 'Знайти джерело сигналу',
        developmentArc: 'Від скептика до віруючого',
        confidence: 0.9,
        relations: [
          { id: 'char_ivy', kind: 'довіряє', confidence: 0.8 }
        ]
      },
      {
        id: 'char_ivy',
        name: 'Айві',
        role: 'Технік',
        trait: 'Розумна',
        goal: 'Розшифрувати сигнал',
        developmentArc: 'Навчається довіряти інтуїції',
        confidence: 0.85
      },
      {
        id: 'char_victor',
        name: 'Віктор',
        role: 'Командир',
        trait: 'Авторитарний',
        goal: 'Зберегти секретність',
        developmentArc: 'Розкриває приховану мотивацію',
        confidence: 0.7
      }
    ],
    locations: [
      {
        id: 'loc_horizon',
        name: 'Станція "Горизонт"',
        desc: 'Арктична дослідна база',
        confidence: 0.95
      },
      {
        id: 'loc_lab',
        name: 'Підземна лабораторія',
        desc: 'Секретний об\'єкт під льодом',
        confidence: 0.8
      }
    ],
    events: [
      {
        id: 'evt_signal',
        name: 'Виявлення сигналу',
        when: 'День 1',
        act: 1,
        characters: ['char_krig'],
        locations: ['loc_lab'],
        confidence: 1.0
      },
      {
        id: 'evt_decode',
        name: 'Розшифровка',
        when: 'День 3',
        act: 2,
        characters: ['char_ivy', 'char_krig'],
        locations: ['loc_lab'],
        confidence: 0.9
      },
      {
        id: 'evt_conflict',
        name: 'Конфлікт з командуванням',
        when: 'День 7',
        act: 2,
        characters: ['char_krig', 'char_victor'],
        confidence: 0.75
      }
    ],
    factions: [],
    artifacts: [
      {
        id: 'art_signal',
        name: 'Аномальний сигнал',
        desc: 'Загадкова передача з глибин льоду',
        confidence: 1.0
      }
    ],
    world: {
      rules: [
        'Сигнал йде з глибин льоду',
        'Температура критична',
        'Зв\'язок обмежений'
      ]
    }
  }
};

// TESTS
const tests: Array<{ name: string; passed: boolean; message: string }> = [];

console.log('━'.repeat(50));
console.log('🧪 RUNNING TESTS...\n');

// TEST 1: asInferredCanon stamps all entities as inferred
console.log('TEST 1: asInferredCanon() stamps origin correctly...');
const inferredCanon = asInferredCanon(MOCK_AI_EXTRACTION);

const allEntities = [
  ...inferredCanon.characters,
  ...inferredCanon.locations,
  ...inferredCanon.events,
  ...inferredCanon.artifacts,
];

const allInferred = allEntities.every(e =>
  e.origin?.source === 'inferred' &&
  e.origin?.confirmed === false &&
  e.origin?.createdBy === 'migration'
);

tests.push({
  name: 'All entities stamped as inferred (confirmed:false)',
  passed: allInferred,
  message: allInferred
    ? 'All entities correctly marked as unconfirmed'
    : `Found ${allEntities.filter(e => e.origin?.confirmed !== false).length} confirmed entities`
});

console.log(allInferred ? '   ✅ PASS' : '   ❌ FAIL');
if (!allInferred) {
  const bad = allEntities.filter(e => e.origin?.confirmed !== false);
  console.log('   ⚠️  Problem entities:', bad.map(e => e.name));
}

// TEST 2: All entities have required fields
console.log('\nTEST 2: All entities have id, slug, name, origin...');
const hasRequiredFields = allEntities.every(e =>
  e.id && e.slug && e.name && e.origin
);

tests.push({
  name: 'All entities have required fields',
  passed: hasRequiredFields,
  message: hasRequiredFields ? 'All fields present' : 'Missing required fields'
});

console.log(hasRequiredFields ? '   ✅ PASS' : '   ❌ FAIL');

// TEST 3: deriveMemory returns EMPTY (critical!)
console.log('\nTEST 3: deriveMemory() returns empty (no authoritative entities)...');
const derivedMemory: NarrativeMemory = deriveMemory(inferredCanon);

const isEmpty =
  derivedMemory.characters.length === 0 &&
  derivedMemory.locations.length === 0 &&
  derivedMemory.timeline.length === 0 &&
  derivedMemory.plotEvents.length === 0;

tests.push({
  name: 'deriveMemory returns empty (proof migration is safe)',
  passed: isEmpty,
  message: isEmpty
    ? 'deriveMemory correctly ignores unconfirmed entities'
    : `Unexpected data: ${JSON.stringify(derivedMemory)}`
});

console.log(isEmpty ? '   ✅ PASS - Migration is SAFE' : '   ❌ FAIL - DANGER!');
console.log('   Derived memory:', JSON.stringify(derivedMemory));

// TEST 4: Stable IDs format
console.log('\nTEST 4: Stable ID format (char_*, loc_*, evt_*)...');
const hasStableIds =
  inferredCanon.characters.every(c => c.id.startsWith('char_')) &&
  inferredCanon.locations.every(l => l.id.startsWith('loc_')) &&
  inferredCanon.events.every(e => e.id.startsWith('evt_'));

tests.push({
  name: 'Stable ID format',
  passed: hasStableIds,
  message: hasStableIds ? 'All IDs follow convention' : 'Invalid ID format detected'
});

console.log(hasStableIds ? '   ✅ PASS' : '   ❌ FAIL');

// TEST 5: Slugs generated
console.log('\nTEST 5: Slugs auto-generated from names...');
const hasSlugs = allEntities.every(e => e.slug && e.slug.length > 0);

tests.push({
  name: 'Slugs auto-generated',
  passed: hasSlugs,
  message: hasSlugs ? 'All entities have slugs' : 'Missing slugs'
});

console.log(hasSlugs ? '   ✅ PASS' : '   ❌ FAIL');

// Example slugs
if (hasSlugs) {
  console.log('   Sample slugs:');
  console.log('   -', inferredCanon.characters[0].name, '→', inferredCanon.characters[0].slug);
  console.log('   -', inferredCanon.locations[0].name, '→', inferredCanon.locations[0].slug);
}

// SUMMARY
console.log('\n' + '━'.repeat(50));
console.log('📊 TEST SUMMARY:\n');

tests.forEach((t, i) => {
  console.log(`   ${i + 1}. ${t.passed ? '✅' : '❌'} ${t.name}`);
  if (!t.passed) {
    console.log(`      → ${t.message}`);
  }
});

const allPassed = tests.every(t => t.passed);

console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'));
console.log('━'.repeat(50) + '\n');

// STATS
console.log('📊 Extraction Stats:');
console.log(`   Characters: ${inferredCanon.characters.length}`);
console.log(`   Locations: ${inferredCanon.locations.length}`);
console.log(`   Events: ${inferredCanon.events.length}`);
console.log(`   Artifacts: ${inferredCanon.artifacts.length}`);
console.log(`   World rules: ${inferredCanon.world.rules?.length || 0}`);

// CONCLUSION
if (allPassed) {
  console.log('\n✅ PHASE 2 MIGRATION IS SAFE:');
  console.log('   - All entities stamped as inferred (not authoritative)');
  console.log('   - deriveMemory ignores unconfirmed entities');
  console.log('   - Existing memory/behavior unchanged');
  console.log('   - Stable IDs prevent graph breakage on rename');
  console.log('\n➡️  READY FOR PHASE 2.3: Build UI confirmation queue');
} else {
  console.log('\n❌ FIX ISSUES BEFORE PHASE 2.3');
}

process.exit(allPassed ? 0 : 1);
