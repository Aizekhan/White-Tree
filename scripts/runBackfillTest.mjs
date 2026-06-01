#!/usr/bin/env node
/**
 * CLI wrapper to run backfill test without browser
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

// Load environment
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Import Canon functions (will need to transpile)
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

  // Get first user project
  console.log('📖 Loading projects from Firestore...');
  const projectsSnapshot = await db.collection('projects').limit(1).get();

  if (projectsSnapshot.empty) {
    console.error('❌ No projects found in Firestore');
    process.exit(1);
  }

  const projectDoc = projectsSnapshot.docs[0];
  const projectData = projectDoc.data();
  const project = {
    id: projectDoc.id,
    ...projectData,
    createdAt: projectData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
    updatedAt: projectData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
  };

  console.log(`✅ Project loaded: "${project.title}" (${project.language})`);
  console.log(`   Memory: ${project.memory?.characters?.length || 0} chars, ${project.memory?.locations?.length || 0} locs`);
  console.log(`   Text: ${project.text?.length || 0} chars\n`);

  // Run EXTRACT_CANON
  console.log('🤖 Running EXTRACT_CANON mode...');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = buildExtractCanonInput({
    memory: project.memory || { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] },
    architecture: project.architecture,
    text: project.text,
  });

  console.log(`   Prompt length: ${prompt.length} chars`);

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

  // Post-process
  console.log('\n🏷️  Stamping entities as inferred...');
  const inferredCanon = asInferredCanon(aiResult);

  const stats = {
    characters: inferredCanon.characters?.length || 0,
    locations: inferredCanon.locations?.length || 0,
    events: inferredCanon.events?.length || 0,
    factions: inferredCanon.factions?.length || 0,
    artifacts: inferredCanon.artifacts?.length || 0,
    worldRules: inferredCanon.world?.rules?.length || 0,
  };

  console.log('📊 Stats:', stats);

  // TEST 1: Structure
  console.log('\n🧪 TEST 1: Canon structure validation...');
  const hasStructure = inferredCanon.characters && inferredCanon.locations && inferredCanon.events;
  console.log(hasStructure ? '   ✅ PASS' : '   ❌ FAIL');

  // TEST 2: All inferred
  console.log('\n🧪 TEST 2: All entities inferred + unconfirmed...');
  const allInferred = [
    ...inferredCanon.characters,
    ...inferredCanon.locations,
    ...inferredCanon.events,
  ].every((e) => e.origin?.source === 'inferred' && e.origin?.confirmed === false);
  console.log(allInferred ? '   ✅ PASS' : '   ❌ FAIL');

  // TEST 3: deriveMemory empty
  console.log('\n🧪 TEST 3: deriveMemory returns empty...');
  const derived = deriveMemory(inferredCanon);
  const isEmpty = derived.characters.length === 0;
  console.log(isEmpty ? '   ✅ PASS' : '   ❌ FAIL');
  console.log('   Derived memory:', derived);

  // Write to Firestore
  console.log('\n💾 Writing canon to Firestore...');
  await db.collection('projects').doc(project.id).update({
    canon: inferredCanon,
    updatedAt: new Date(),
  });
  console.log('✅ Written to Firestore');

  // TEST 4: Idempotency (skip for now - would need 2nd run)

  console.log('\n==================================================');
  console.log('📊 TEST SUMMARY:');
  console.log(`   1. ${hasStructure ? '✅' : '❌'} Canon structure`);
  console.log(`   2. ${allInferred ? '✅' : '❌'} All entities inferred`);
  console.log(`   3. ${isEmpty ? '✅' : '❌'} deriveMemory returns empty`);
  console.log('\n' + (hasStructure && allInferred && isEmpty ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'));
  console.log('==================================================\n');

  process.exit(hasStructure && allInferred && isEmpty ? 0 : 1);
}

runTest().catch((error) => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});
