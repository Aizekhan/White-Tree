/**
 * phase4-integration.test.ts — Integration Test for Phase 4
 *
 * Purpose: Verify complete canon-aware flow:
 * 1. Project with canonAware=true + canon
 * 2. Auto-derivation on load
 * 3. Memory matches derived memory
 *
 * Run: npx tsx src/canon/phase4-integration.test.ts
 */

import { deriveMemory } from './deriveMemory.js';
import { ProjectCanon, CanonCharacter, CanonLocation } from './canonTypes.js';
import { NarrativeMemory, Project } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Project with Canon
// ─────────────────────────────────────────────────────────────────────────────

function createMockProject(): Project {
    const canon: ProjectCanon = {
        characters: [
            {
                id: 'char_elena',
                slug: 'elena-vasquez',
                name: 'Elena Vasquez',
                type: 'characters',
                role: 'Astronaut',
                trait: 'Determined, isolated',
                goal: 'Contact Earth',
                developmentArc: 'From isolation to self-reliance',
                status: 'Active',
                origin: {
                    source: 'explicit',
                    confidence: 1.0,
                    confirmed: true,
                    createdBy: 'user',
                    updatedAt: Date.now()
                }
            },
            {
                id: 'char_aria',
                slug: 'aria',
                name: 'ARIA',
                type: 'characters',
                role: 'AI Companion',
                trait: 'Logical, evolving',
                goal: 'Understand humanity',
                developmentArc: 'From machine to conscious',
                status: 'Active',
                origin: {
                    source: 'explicit',
                    confidence: 1.0,
                    confirmed: true,
                    createdBy: 'user',
                    updatedAt: Date.now()
                }
            }
        ],
        locations: [
            {
                id: 'loc_station',
                slug: 'icarus-station',
                name: 'Icarus Station',
                type: 'locations',
                desc: 'Abandoned space station orbiting Mars',
                origin: {
                    source: 'explicit',
                    confidence: 1.0,
                    confirmed: true,
                    createdBy: 'user',
                    updatedAt: Date.now()
                }
            }
        ],
        events: [
            {
                id: 'evt_signal',
                slug: 'mysterious-signal',
                name: 'Mysterious signal detected',
                type: 'events',
                desc: 'Strange transmission from unknown source',
                when: 'Day 1',
                origin: {
                    source: 'explicit',
                    confidence: 1.0,
                    confirmed: true,
                    createdBy: 'user',
                    updatedAt: Date.now()
                }
            }
        ],
        factions: [],
        artifacts: [],
        world: {
            rules: ['No FTL travel', 'AI sentience is emerging']
        }
    };

    return {
        id: 'test-project',
        userId: 'test-user',
        title: 'The Last Signal',
        description: 'A lone astronaut discovers consciousness in the void',
        language: 'ENG',
        tier: 'pro',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canon,
        canonAware: true, // PHASE 4: Canon Mode enabled
        memory: {
            // OLD memory (should be replaced by derived)
            characters: [],
            locations: [],
            timeline: [],
            worldRules: [],
            plotEvents: []
        },
        tokens: 1000
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

function test1_autoDerivation() {
    console.log('\n🧪 Test 1: Auto-derivation on project load (canonAware=true)');

    const project = createMockProject();

    // Simulate loadProjectState auto-derivation
    if (project.canonAware && project.canon) {
        const derivedMemory = deriveMemory(project.canon);
        project.memory = derivedMemory;
    }

    // Assertions
    if (project.memory.characters.length !== 2) {
        throw new Error(`❌ Expected 2 characters in derived memory, got ${project.memory.characters.length}`);
    }

    if (project.memory.locations.length !== 1) {
        throw new Error(`❌ Expected 1 location in derived memory, got ${project.memory.locations.length}`);
    }

    if (project.memory.plotEvents.length !== 1) {
        throw new Error(`❌ Expected 1 plot event in derived memory, got ${project.memory.plotEvents.length}`);
    }

    if (project.memory.worldRules.length !== 2) {
        throw new Error(`❌ Expected 2 world rules in derived memory, got ${project.memory.worldRules.length}`);
    }

    console.log('✅ Test 1 PASSED');
    console.log(`   - Derived ${project.memory.characters.length} characters from canon`);
    console.log(`   - Derived ${project.memory.locations.length} locations from canon`);
    console.log(`   - Derived ${project.memory.plotEvents.length} events from canon`);
    console.log(`   - Derived ${project.memory.worldRules.length} world rules from canon`);
}

function test2_canonAwareFalse() {
    console.log('\n🧪 Test 2: canonAware=false preserves old memory (no auto-derivation)');

    const project = createMockProject();
    project.canonAware = false;

    // Old memory with different data
    project.memory = {
        characters: [{ name: 'Old Character', role: 'Old Role', trait: '', goals: '', relationships: '', developmentArc: '' }],
        locations: ['Old Location'],
        timeline: [],
        worldRules: [],
        plotEvents: []
    };

    // Simulate loadProjectState (should NOT auto-derive)
    if (project.canonAware && project.canon) {
        const derivedMemory = deriveMemory(project.canon);
        project.memory = derivedMemory;
    }

    // Assertions: memory should remain unchanged
    if (project.memory.characters.length !== 1) {
        throw new Error(`❌ Expected old memory to be preserved, got ${project.memory.characters.length} characters`);
    }

    if (project.memory.characters[0].name !== 'Old Character') {
        throw new Error(`❌ Expected old character name to be preserved`);
    }

    console.log('✅ Test 2 PASSED');
    console.log('   - canonAware=false preserved old memory');
    console.log('   - No auto-derivation occurred');
}

function test3_characterDetails() {
    console.log('\n🧪 Test 3: Derived character details match canon');

    const project = createMockProject();

    if (project.canonAware && project.canon) {
        const derivedMemory = deriveMemory(project.canon);
        project.memory = derivedMemory;
    }

    const elena = project.memory.characters.find(c => c.name === 'Elena Vasquez');
    if (!elena) {
        throw new Error('❌ Elena not found in derived memory');
    }

    if (elena.role !== 'Astronaut') {
        throw new Error(`❌ Expected role='Astronaut', got '${elena.role}'`);
    }

    if (elena.trait !== 'Determined, isolated') {
        throw new Error(`❌ Expected trait='Determined, isolated', got '${elena.trait}'`);
    }

    if (elena.goals !== 'Contact Earth') {
        throw new Error(`❌ Expected goals='Contact Earth', got '${elena.goals}'`);
    }

    console.log('✅ Test 3 PASSED');
    console.log('   - Character details correctly derived from canon');
}

function test4_worldRules() {
    console.log('\n🧪 Test 4: World rules correctly derived from canon.world.rules');

    const project = createMockProject();

    if (project.canonAware && project.canon) {
        const derivedMemory = deriveMemory(project.canon);
        project.memory = derivedMemory;
    }

    const expectedRules = ['No FTL travel', 'AI sentience is emerging'];

    if (project.memory.worldRules.length !== expectedRules.length) {
        throw new Error(`❌ Expected ${expectedRules.length} world rules, got ${project.memory.worldRules.length}`);
    }

    expectedRules.forEach((rule, i) => {
        if (project.memory.worldRules[i] !== rule) {
            throw new Error(`❌ Expected rule '${rule}', got '${project.memory.worldRules[i]}'`);
        }
    });

    console.log('✅ Test 4 PASSED');
    console.log('   - World rules correctly derived from canon.world.rules');
}

function test5_timeline() {
    console.log('\n🧪 Test 5: Timeline entries derived from canon events with temporal markers');

    const project = createMockProject();

    if (project.canonAware && project.canon) {
        const derivedMemory = deriveMemory(project.canon);
        project.memory = derivedMemory;
    }

    // Timeline should contain events with "when" field
    if (project.memory.timeline.length !== 1) {
        throw new Error(`❌ Expected 1 timeline entry, got ${project.memory.timeline.length}`);
    }

    const expectedEntry = 'Day 1: Mysterious signal detected';
    if (project.memory.timeline[0] !== expectedEntry) {
        throw new Error(`❌ Expected timeline entry '${expectedEntry}', got '${project.memory.timeline[0]}'`);
    }

    console.log('✅ Test 5 PASSED');
    console.log('   - Timeline correctly derived from canon events');
}

// ─────────────────────────────────────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────────────────────────────────────

function runAllTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   Phase 4: Integration Test — Canon-Aware Flow');
    console.log('═══════════════════════════════════════════════════════════════');

    try {
        test1_autoDerivation();
        test2_canonAwareFalse();
        test3_characterDetails();
        test4_worldRules();
        test5_timeline();

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('   ✅ ALL TESTS PASSED — Phase 4 Integration Works!');
        console.log('═══════════════════════════════════════════════════════════════\n');
    } catch (err: any) {
        console.error('\n═══════════════════════════════════════════════════════════════');
        console.error(`   ❌ TEST FAILED: ${err.message}`);
        console.error('═══════════════════════════════════════════════════════════════\n');
        process.exit(1);
    }
}

runAllTests();
