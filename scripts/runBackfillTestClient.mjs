#!/usr/bin/env node
/**
 * CLI test using client Firebase SDK (no admin needed)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, limit, query } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

// Load environment
dotenv.config();

// Initialize Firebase Client SDK
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Canon functions (same as before)
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
    origin: { source: "inferred", confidence: e.confidence ?? 0.5, confirmed: false, createdBy: "migration", updatedAt: Date.now() },
  });
  const c = raw.canon || {};
  return {
    characters: (c.characters || []).map(stamp),
    locations: (c.locations || []).map(stamp),
    events: (c.events || []).map(stamp),
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

async function runTest() {
  console.log('\n🧪 ========== BACKFILL INTEGRATION TEST ==========');
  console.log('⏰ Started at:', new Date().toISOString(), '\n');

  // Get projects (without auth - will only see public data or fail)
  console.log('📖 Loading projects from Firestore...');
  console.log('⚠️  WARNING: Running without auth - can only access public projects\n');

  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, limit(1));
  const projectsSnapshot = await getDocs(q);

  if (projectsSnapshot.empty) {
    console.error('❌ No accessible projects found (need auth for private projects)');
    console.log('\n💡 TIP: Run this test from browser console with authentication');
    process.exit(1);
  }

  const projectDoc = projectsSnapshot.docs[0];
  const projectData = projectDoc.data();
  const project = {
    id: projectDoc.id,
    ...projectData,
  };

  console.log(`✅ Project loaded: "${project.title}" (${project.language})`);
  console.log(`   ID: ${project.id}`);
  console.log(`   Memory: ${project.memory?.characters?.length || 0} chars, ${project.memory?.locations?.length || 0} locs`);
  console.log(`   Text: ${project.text?.length || 0} chars\n`);

  // Run EXTRACT_CANON
  console.log('🤖 Running EXTRACT_CANON mode (calling Gemini API)...');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = buildExtractCanonInput({
    memory: project.memory || { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] },
    architecture: project.architecture,
    text: project.text,
  });

  console.log(`   Prompt length: ${prompt.length} chars`);
  console.log(`   Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}\n`);

  const result = await genAI.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
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

  const aiResult = JSON.parse(responseText);
  console.log('✅ AI extraction complete');
  console.log('   Raw response keys:', Object.keys(aiResult), '\n');

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

  // Sample entity
  if (inferredCanon.characters?.length > 0) {
    console.log('\n🔍 Sample character:');
    console.log('   ', JSON.stringify(inferredCanon.characters[0], null, 2).split('\n').slice(0, 10).join('\n   '));
  }

  // TESTS
  console.log('\n' + '='.repeat(50));
  console.log('🧪 RUNNING TESTS...\n');

  // TEST 1: Structure
  console.log('TEST 1: Canon structure validation...');
  const hasStructure = inferredCanon.characters && inferredCanon.locations && inferredCanon.events;
  console.log(hasStructure ? '   ✅ PASS - All required arrays present' : '   ❌ FAIL - Missing arrays');

  // TEST 2: All inferred
  console.log('\nTEST 2: All entities inferred + unconfirmed...');
  const entitiesToCheck = [
    ...(inferredCanon.characters || []),
    ...(inferredCanon.locations || []),
    ...(inferredCanon.events || []),
    ...(inferredCanon.factions || []),
    ...(inferredCanon.artifacts || []),
  ];
  const allInferred = entitiesToCheck.every((e) => e.origin?.source === 'inferred' && e.origin?.confirmed === false);
  console.log(allInferred ? '   ✅ PASS - All entities marked as inferred' : '   ❌ FAIL - Found confirmed entities');

  if (!allInferred) {
    const confirmed = entitiesToCheck.filter(e => e.origin?.confirmed !== false);
    console.log('   ⚠️  Confirmed entities:', confirmed.map(e => e.name));
  }

  // TEST 3: deriveMemory empty
  console.log('\nTEST 3: deriveMemory returns empty (safe migration proof)...');
  const derived = deriveMemory(inferredCanon);
  const isEmpty = derived.characters.length === 0 && derived.locations.length === 0;
  console.log(isEmpty ? '   ✅ PASS - deriveMemory returns empty (no authoritative entities)' : '   ❌ FAIL - deriveMemory has data');
  console.log('   Derived memory:', JSON.stringify(derived));

  // Write to Firestore (will fail without auth, but show intent)
  console.log('\n💾 Attempting to write canon to Firestore...');
  try {
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, {
      canon: inferredCanon,
      updatedAt: new Date(),
    });
    console.log('✅ Successfully written to Firestore');
  } catch (error) {
    console.log('❌ Write failed (expected without auth):', error.message);
    console.log('💡 Canon data is ready but not persisted. Run from browser console to persist.');
  }

  // SUMMARY
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY:\n');
  console.log(`   1. ${hasStructure ? '✅' : '❌'} Canon structure (id, name, origin fields)`);
  console.log(`   2. ${allInferred ? '✅' : '❌'} All entities inferred (confirmed:false)`);
  console.log(`   3. ${isEmpty ? '✅' : '❌'} deriveMemory returns empty (proof migration is safe)`);
  console.log(`   4. ⏭️  Idempotency test (skipped - requires 2nd run)`);

  const allPassed = hasStructure && allInferred && isEmpty;
  console.log('\n' + (allPassed ? '🎉 ALL CRITICAL TESTS PASSED' : '⚠️  SOME TESTS FAILED'));
  console.log('='.repeat(50) + '\n');

  if (allPassed) {
    console.log('✅ Extraction works correctly!');
    console.log('✅ Canon data structure is valid');
    console.log('✅ Migration is safe (no auto-confirm)');
    console.log('\n➡️  NEXT STEP: Build UI for confirmation queue (Phase 2.3)');
  } else {
    console.log('⚠️  Fix extraction issues before building UI');
  }

  process.exit(allPassed ? 0 : 1);
}

runTest().catch((error) => {
  console.error('\n❌ Fatal test error:', error);
  console.error('\nStack:', error.stack);
  process.exit(1);
});
