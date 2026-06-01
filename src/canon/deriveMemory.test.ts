// deriveMemory.test.ts — cheap smoke test to catch shape mismatches early.
// Runs via: npx tsx src/canon/deriveMemory.test.ts

import { deriveMemory } from "./deriveMemory";
import type { ProjectCanon } from "./canonTypes";
import type { NarrativeMemory } from "../types";

console.log("🧪 Testing deriveMemory() with empty canon...\n");

// Empty canon (all arrays empty)
const emptyCanon: ProjectCanon = {
  characters: [],
  locations: [],
  events: [],
  factions: [],
  artifacts: [],
  world: { rules: [] },
};

const result: NarrativeMemory = deriveMemory(emptyCanon);

// Expected shape for empty canon
const expected: NarrativeMemory = {
  characters: [],
  locations: [],
  timeline: [],
  worldRules: [],
  plotEvents: [],
};

// Deep equality check
const pass = JSON.stringify(result) === JSON.stringify(expected);

if (pass) {
  console.log("✅ PASS: deriveMemory(emptyCanon) returns correct NarrativeMemory shape");
  console.log("   Result:", JSON.stringify(result, null, 2));
  process.exit(0);
} else {
  console.error("❌ FAIL: Shape mismatch!");
  console.error("   Expected:", JSON.stringify(expected, null, 2));
  console.error("   Got:", JSON.stringify(result, null, 2));
  process.exit(1);
}
