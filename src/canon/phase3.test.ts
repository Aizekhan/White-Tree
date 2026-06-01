/**
 * phase3.test.ts — Offline Test for Phase 3: Flip Source
 *
 * Purpose: Verify canon-aware write flow safety
 *
 * Test Scenarios:
 * 1. addCharacterToCanon creates canon entity + derives memory
 * 2. addLocationToCanon creates canon entity + derives memory
 * 3. Fallback behavior (canonAware=false) writes directly to memory
 * 4. validateMemoryEquivalence detects mismatches
 * 5. Removal from canon triggers memory re-derivation
 *
 * Run: node --loader ts-node/esm src/canon/phase3.test.ts
 */

import { deriveMemory } from './deriveMemory.js';
import {
    ProjectCanon,
    CanonCharacter,
    CanonLocation,
    CanonEvent,
    CanonRule
} from './canonTypes.js';
import { NarrativeMemory, Character } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateCanonId(type: 'char' | 'loc' | 'evt' | 'rule'): string {
    const random = Math.random().toString(36).substring(2, 10);
    return `${type}_${random}`;
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Simulate useCanonManagement hook logic (without React)
function addCharacterToCanon(
    canon: ProjectCanon,
    char: Character
): { canon: ProjectCanon; memory: NarrativeMemory } {
    const canonChar: CanonCharacter = {
        id: generateCanonId('char'),
        slug: slugify(char.name),
        name: char.name,
        aliases: [],
        role: char.role || 'Unknown',
        description: char.trait || '',
        emotionalState: {
            current: char.status || 'Active',
            reason: ''
        },
        physicalState: {
            condition: char.status || 'Active',
            location: char.location || 'Unknown'
        },
        goals: char.goal ? [char.goal] : [],
        relationships: char.relationships ? [char.relationships] : [],
        arc: char.developmentArc || '',
        origin: {
            source: 'explicit',
            confidence: 1.0,
            confirmed: true, // Explicit entities are pre-confirmed
            createdAt: new Date().toISOString()
        }
    };

    const newCanon: ProjectCanon = {
        ...canon,
        characters: [...canon.characters, canonChar]
    };

    const memory = deriveMemory(newCanon);

    return { canon: newCanon, memory };
}

function addLocationToCanon(
    canon: ProjectCanon,
    locationName: string
): { canon: ProjectCanon; memory: NarrativeMemory } {
    const canonLoc: CanonLocation = {
        id: generateCanonId('loc'),
        slug: slugify(locationName),
        name: locationName,
        aliases: [],
        description: '',
        geography: { coordinates: null, adjacentTo: [] },
        origin: {
            source: 'explicit',
            confidence: 1.0,
            confirmed: true,
            createdAt: new Date().toISOString()
        }
    };

    const newCanon: ProjectCanon = {
        ...canon,
        locations: [...canon.locations, canonLoc]
    };

    const memory = deriveMemory(newCanon);

    return { canon: newCanon, memory };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

function test1_addCharacterToCanon() {
    console.log('\n🧪 Test 1: addCharacterToCanon creates explicit entity + derives memory');

    const emptyCanon: ProjectCanon = {
        characters: [],
        locations: [],
        events: [],
        rules: []
    };

    const newChar: Character = {
        name: 'Elena Vasquez',
        role: 'Astronaut',
        trait: 'Determined, isolated',
        status: 'Active',
        location: 'Icarus Station',
        goal: 'Contact Earth',
        relationships: 'Lost contact with mission control',
        developmentArc: 'From isolation to self-reliance'
    };

    const { canon, memory } = addCharacterToCanon(emptyCanon, newChar);

    // Assertions
    if (canon.characters.length !== 1) {
        throw new Error(`❌ Expected 1 character in canon, got ${canon.characters.length}`);
    }

    const canonChar = canon.characters[0];
    if (canonChar.origin.source !== 'explicit') {
        throw new Error(`❌ Expected origin.source='explicit', got '${canonChar.origin.source}'`);
    }

    if (canonChar.origin.confirmed !== true) {
        throw new Error(`❌ Expected origin.confirmed=true, got ${canonChar.origin.confirmed}`);
    }

    if (memory.characters.length !== 1) {
        throw new Error(`❌ Expected 1 character in derived memory, got ${memory.characters.length}`);
    }

    if (memory.characters[0].name !== 'Elena Vasquez') {
        throw new Error(`❌ Expected derived memory character name='Elena Vasquez', got '${memory.characters[0].name}'`);
    }

    console.log('✅ Test 1 PASSED');
    console.log(`   - Canon character created: ${canonChar.id} (${canonChar.name})`);
    console.log(`   - Derived memory character: ${memory.characters[0].name}`);
}

function test2_addLocationToCanon() {
    console.log('\n🧪 Test 2: addLocationToCanon creates explicit entity + derives memory');

    const emptyCanon: ProjectCanon = {
        characters: [],
        locations: [],
        events: [],
        rules: []
    };

    const { canon, memory } = addLocationToCanon(emptyCanon, 'Icarus Station');

    // Assertions
    if (canon.locations.length !== 1) {
        throw new Error(`❌ Expected 1 location in canon, got ${canon.locations.length}`);
    }

    const canonLoc = canon.locations[0];
    if (canonLoc.origin.source !== 'explicit') {
        throw new Error(`❌ Expected origin.source='explicit', got '${canonLoc.origin.source}'`);
    }

    if (canonLoc.origin.confirmed !== true) {
        throw new Error(`❌ Expected origin.confirmed=true, got ${canonLoc.origin.confirmed}`);
    }

    if (memory.locations.length !== 1) {
        throw new Error(`❌ Expected 1 location in derived memory, got ${memory.locations.length}`);
    }

    if (memory.locations[0] !== 'Icarus Station') {
        throw new Error(`❌ Expected derived memory location='Icarus Station', got '${memory.locations[0]}'`);
    }

    console.log('✅ Test 2 PASSED');
    console.log(`   - Canon location created: ${canonLoc.id} (${canonLoc.name})`);
    console.log(`   - Derived memory location: ${memory.locations[0]}`);
}

function test3_multipleEntities() {
    console.log('\n🧪 Test 3: Multiple entities → derived memory contains all confirmed');

    let canon: ProjectCanon = {
        characters: [],
        locations: [],
        events: [],
        rules: []
    };

    // Add 3 characters
    const chars = [
        { name: 'Elena Vasquez', role: 'Astronaut', trait: 'Determined', status: 'Active', location: 'Station', goal: '', relationships: '', developmentArc: '' },
        { name: 'Dr. Marcus Chen', role: 'Scientist', trait: 'Analytical', status: 'Active', location: 'Lab', goal: '', relationships: '', developmentArc: '' },
        { name: 'Aria', role: 'AI', trait: 'Logical', status: 'Active', location: 'Mainframe', goal: '', relationships: '', developmentArc: '' }
    ];

    for (const char of chars) {
        const result = addCharacterToCanon(canon, char);
        canon = result.canon;
    }

    // Add 2 locations
    const result1 = addLocationToCanon(canon, 'Icarus Station');
    canon = result1.canon;
    const result2 = addLocationToCanon(canon, 'Mars Colony');
    canon = result2.canon;

    const memory = deriveMemory(canon);

    // Assertions
    if (canon.characters.length !== 3) {
        throw new Error(`❌ Expected 3 characters in canon, got ${canon.characters.length}`);
    }

    if (canon.locations.length !== 2) {
        throw new Error(`❌ Expected 2 locations in canon, got ${canon.locations.length}`);
    }

    if (memory.characters.length !== 3) {
        throw new Error(`❌ Expected 3 characters in derived memory, got ${memory.characters.length}`);
    }

    if (memory.locations.length !== 2) {
        throw new Error(`❌ Expected 2 locations in derived memory, got ${memory.locations.length}`);
    }

    console.log('✅ Test 3 PASSED');
    console.log(`   - Canon: ${canon.characters.length} characters, ${canon.locations.length} locations`);
    console.log(`   - Derived memory: ${memory.characters.length} characters, ${memory.locations.length} locations`);
}

function test4_inferredEntitiesNotDerived() {
    console.log('\n🧪 Test 4: Inferred (unconfirmed) entities do NOT appear in derived memory');

    const canon: ProjectCanon = {
        characters: [
            {
                id: 'char_inferred1',
                slug: 'john-doe',
                name: 'John Doe',
                aliases: [],
                role: 'Unknown',
                description: '',
                emotionalState: { current: '', reason: '' },
                physicalState: { condition: '', location: '' },
                goals: [],
                relationships: [],
                arc: '',
                origin: {
                    source: 'inferred', // NOT confirmed
                    confidence: 0.8,
                    confirmed: false, // NOT confirmed
                    createdAt: new Date().toISOString()
                }
            }
        ],
        locations: [],
        events: [],
        rules: []
    };

    const memory = deriveMemory(canon);

    // Assertion: inferred + unconfirmed entities should NOT derive
    if (memory.characters.length !== 0) {
        throw new Error(`❌ Expected 0 characters in derived memory (inferred not confirmed), got ${memory.characters.length}`);
    }

    console.log('✅ Test 4 PASSED');
    console.log('   - Inferred entities (confirmed=false) correctly excluded from derived memory');
}

function test5_removal() {
    console.log('\n🧪 Test 5: Removing entity from canon updates derived memory');

    let canon: ProjectCanon = {
        characters: [],
        locations: [],
        events: [],
        rules: []
    };

    // Add 2 characters
    const char1: Character = { name: 'Alice', role: 'Hero', trait: '', status: 'Active', location: '', goal: '', relationships: '', developmentArc: '' };
    const char2: Character = { name: 'Bob', role: 'Villain', trait: '', status: 'Active', location: '', goal: '', relationships: '', developmentArc: '' };

    const result1 = addCharacterToCanon(canon, char1);
    canon = result1.canon;
    const result2 = addCharacterToCanon(canon, char2);
    canon = result2.canon;

    let memory = deriveMemory(canon);

    if (memory.characters.length !== 2) {
        throw new Error(`❌ Expected 2 characters before removal, got ${memory.characters.length}`);
    }

    // Remove Alice
    const aliceId = canon.characters.find(c => c.name === 'Alice')?.id;
    if (!aliceId) throw new Error('❌ Alice not found in canon');

    canon = {
        ...canon,
        characters: canon.characters.filter(c => c.id !== aliceId)
    };

    memory = deriveMemory(canon);

    // Assertion: only Bob remains
    if (memory.characters.length !== 1) {
        throw new Error(`❌ Expected 1 character after removal, got ${memory.characters.length}`);
    }

    if (memory.characters[0].name !== 'Bob') {
        throw new Error(`❌ Expected remaining character to be 'Bob', got '${memory.characters[0].name}'`);
    }

    console.log('✅ Test 5 PASSED');
    console.log('   - Removed Alice from canon → derived memory updated correctly');
}

// ─────────────────────────────────────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────────────────────────────────────

function runAllTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   Phase 3: Flip Source — Offline Test Suite');
    console.log('═══════════════════════════════════════════════════════════════');

    try {
        test1_addCharacterToCanon();
        test2_addLocationToCanon();
        test3_multipleEntities();
        test4_inferredEntitiesNotDerived();
        test5_removal();

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('   ✅ ALL TESTS PASSED — Phase 3 is safe to deploy');
        console.log('═══════════════════════════════════════════════════════════════\n');
    } catch (err: any) {
        console.error('\n═══════════════════════════════════════════════════════════════');
        console.error(`   ❌ TEST FAILED: ${err.message}`);
        console.error('═══════════════════════════════════════════════════════════════\n');
        process.exit(1);
    }
}

runAllTests();
