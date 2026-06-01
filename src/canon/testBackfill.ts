/**
 * testBackfill.ts — Phase 2.4 Integration Test
 *
 * Purpose: Verify that EXTRACT_CANON + backfillProjectCanon work correctly on real project
 *
 * How to run:
 *   1. Start dev server: npm run dev
 *   2. Start backend: node server.js
 *   3. Open browser console on localhost:5173
 *   4. Import and run:
 *      ```js
 *      import { runBackfillTest } from './canon/testBackfill';
 *      await runBackfillTest('your-project-id');
 *      ```
 *
 * OR use this helper script directly in console (copy-paste):
 *   ```js
 *   // Ensure you're authenticated in the app first
 *   const { backfillProjectCanon } = await import('./canon/backfillCanon');
 *   const { deriveMemory } = await import('./canon/deriveMemory');
 *   const { db } = await import('./firebase');
 *   const { doc, getDoc, updateDoc } = await import('firebase/firestore');
 *
 *   const projectId = 'YOUR_PROJECT_ID'; // Replace with real project ID
 *   const projectRef = doc(db, 'projects', projectId);
 *   const projectSnap = await getDoc(projectRef);
 *   const project = { id: projectSnap.id, ...projectSnap.data() };
 *
 *   console.log('🧪 Running backfill test on project:', project.title);
 *   const result = await backfillProjectCanon(project);
 *
 *   if (result.success) {
 *     console.log('✅ Backfill succeeded!');
 *     console.log('📊 Stats:', result.stats);
 *     console.log('🔍 Canon sample (first character):', result.canon.characters[0]);
 *
 *     // Test 1: Check origin fields
 *     const allInferred = result.canon.characters.every(c =>
 *       c.origin?.source === 'inferred' && c.origin?.confirmed === false
 *     );
 *     console.log('✓ Test 1 - All entities inferred + unconfirmed:', allInferred ? '✅ PASS' : '❌ FAIL');
 *
 *     // Test 2: deriveMemory returns empty authoritative
 *     const derivedMemory = deriveMemory(result.canon);
 *     const isEmpty = derivedMemory.characters.length === 0;
 *     console.log('✓ Test 2 - deriveMemory returns empty (no confirmed entities):', isEmpty ? '✅ PASS' : '❌ FAIL');
 *     console.log('  Derived memory:', derivedMemory);
 *
 *     // Write to Firestore
 *     await updateDoc(projectRef, { canon: result.canon });
 *     console.log('💾 Written to Firestore');
 *
 *     // Test 3: Re-run to check idempotency
 *     console.log('\n🔄 Re-running backfill to test idempotency...');
 *     const result2 = await backfillProjectCanon(project);
 *     const sameCount = result2.stats.characters === result.stats.characters;
 *     console.log('✓ Test 3 - Idempotency (same entity count):', sameCount ? '✅ PASS' : '❌ FAIL');
 *     console.log('  First run:', result.stats);
 *     console.log('  Second run:', result2.stats);
 *
 *   } else {
 *     console.error('❌ Backfill failed:', result.error);
 *   }
 *   ```
 *
 * Success Criteria (4 tests):
 *   ✅ 1. project.canon populated with id + slug + name
 *   ✅ 2. All origin.confirmed === false, source === "inferred"
 *   ✅ 3. deriveMemory(canon) returns empty authoritative-memory
 *   ✅ 4. Re-run doesn't create duplicates (idempotency)
 */

import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { backfillProjectCanon, validateCanon } from './backfillCanon';
import { deriveMemory } from './deriveMemory';
import type { Project } from '../types';

export interface TestResult {
  passed: boolean;
  tests: {
    name: string;
    passed: boolean;
    message: string;
  }[];
  canon?: any;
  stats?: any;
}

/**
 * Runs full backfill integration test on a real project
 *
 * @param projectId - Firestore project ID to test with
 * @returns TestResult with pass/fail status
 */
export async function runBackfillTest(projectId: string): Promise<TestResult> {
  console.log(`\n🧪 ========== BACKFILL INTEGRATION TEST ==========`);
  console.log(`📁 Project ID: ${projectId}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  const tests: TestResult['tests'] = [];

  try {
    // Load project from Firestore
    console.log(`📖 Loading project from Firestore...`);
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error(`Project ${projectId} not found in Firestore`);
    }

    const projectData = projectSnap.data();
    const project: Project = {
      id: projectSnap.id,
      userId: projectData.userId,
      title: projectData.title || 'Untitled',
      description: projectData.description || '',
      language: projectData.language || 'ENG',
      tier: projectData.tier || 'free',
      createdAt: projectData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      updatedAt: projectData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
      text: projectData.text || '',
      memory: projectData.memory || { characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] },
      architecture: projectData.architecture,
      canon: projectData.canon,
      canonAware: projectData.canonAware || false,
    };

    console.log(`✅ Project loaded: "${project.title}" (${project.language})`);
    console.log(`   Memory: ${project.memory.characters.length} chars, ${project.memory.locations.length} locs`);
    console.log(`   Text: ${project.text?.length || 0} chars\n`);

    // RUN BACKFILL (First time)
    console.log(`🤖 Running backfillProjectCanon() [1st run]...`);
    const result1 = await backfillProjectCanon(project);

    if (!result1.success) {
      tests.push({
        name: 'Backfill execution',
        passed: false,
        message: `Backfill failed: ${result1.error}`,
      });
      return { passed: false, tests };
    }

    console.log(`✅ Backfill completed successfully`);
    console.log(`📊 Stats:`, result1.stats);

    // TEST 1: Canon structure validation
    console.log(`\n🧪 TEST 1: Canon structure validation...`);
    const validation = validateCanon(result1.canon);
    tests.push({
      name: 'Canon structure (id, name, origin fields)',
      passed: validation.valid,
      message: validation.valid ? 'All entities have required fields' : `Validation errors: ${validation.errors.join(', ')}`,
    });
    console.log(validation.valid ? '   ✅ PASS' : `   ❌ FAIL: ${validation.errors.join(', ')}`);

    // TEST 2: All entities are inferred + unconfirmed
    console.log(`\n🧪 TEST 2: All entities inferred + unconfirmed...`);
    const allInferred = [
      ...result1.canon.characters,
      ...result1.canon.locations,
      ...result1.canon.events,
      ...result1.canon.factions,
      ...result1.canon.artifacts,
    ].every((entity: any) =>
      entity.origin?.source === 'inferred' && entity.origin?.confirmed === false
    );
    tests.push({
      name: 'All entities inferred (confirmed:false)',
      passed: allInferred,
      message: allInferred ? 'All entities marked as inferred' : 'Found entities with confirmed:true or source!==inferred',
    });
    console.log(allInferred ? '   ✅ PASS' : '   ❌ FAIL');

    // TEST 3: deriveMemory returns empty (no authoritative entities)
    console.log(`\n🧪 TEST 3: deriveMemory returns empty authoritative memory...`);
    const derivedMemory = deriveMemory(result1.canon);
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
        : `deriveMemory returned data: ${JSON.stringify(derivedMemory)}`,
    });
    console.log(isEmpty ? '   ✅ PASS' : '   ❌ FAIL');
    console.log(`   Derived memory:`, derivedMemory);

    // Write to Firestore
    console.log(`\n💾 Writing canon to Firestore...`);
    await updateDoc(projectRef, {
      canon: result1.canon,
      updatedAt: new Date(),
    });
    console.log(`✅ Written to Firestore`);

    // TEST 4: Idempotency (re-run doesn't create duplicates)
    console.log(`\n🧪 TEST 4: Idempotency test (re-running backfill)...`);
    const result2 = await backfillProjectCanon(project);

    if (!result2.success) {
      tests.push({
        name: 'Idempotency (2nd run)',
        passed: false,
        message: `Second run failed: ${result2.error}`,
      });
    } else {
      const sameStats =
        result2.stats.characters === result1.stats.characters &&
        result2.stats.locations === result1.stats.locations &&
        result2.stats.events === result1.stats.events;

      tests.push({
        name: 'Idempotency (same entity counts on re-run)',
        passed: sameStats,
        message: sameStats
          ? 'Entity counts match (no duplicates)'
          : `Counts differ - 1st: ${JSON.stringify(result1.stats)}, 2nd: ${JSON.stringify(result2.stats)}`,
      });
      console.log(sameStats ? '   ✅ PASS' : '   ❌ FAIL');
      console.log(`   1st run:`, result1.stats);
      console.log(`   2nd run:`, result2.stats);
    }

    // SUMMARY
    const allPassed = tests.every(t => t.passed);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 TEST SUMMARY:`);
    tests.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.passed ? '✅' : '❌'} ${t.name}`);
      if (!t.passed) console.log(`      → ${t.message}`);
    });
    console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
    console.log(`${'='.repeat(50)}\n`);

    return {
      passed: allPassed,
      tests,
      canon: result1.canon,
      stats: result1.stats,
    };

  } catch (error: any) {
    console.error(`\n❌ Test error:`, error);
    tests.push({
      name: 'Test execution',
      passed: false,
      message: error.message,
    });
    return { passed: false, tests };
  }
}

// Quick console helper for manual testing
export const CONSOLE_TEST_SNIPPET = `
// Copy-paste this into browser console (after auth):
import { runBackfillTest } from './src/canon/testBackfill';
await runBackfillTest('YOUR_PROJECT_ID_HERE');
`;
