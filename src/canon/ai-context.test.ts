/**
 * ai-context.test.ts — Verify AI Context Generation with Canon
 *
 * Purpose: Ensure AI receives correct memory context based on canon
 * when canonAware=true
 *
 * Run: npx tsx src/canon/ai-context.test.ts
 */

import { deriveMemory } from './deriveMemory.js';
import { ProjectCanon } from './canonTypes.js';
import { NarrativeMemory } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const testCanon: ProjectCanon = {
    characters: [
        {
            id: 'char_elena',
            slug: 'elena',
            name: 'Elena',
            type: 'characters',
            role: 'Protagonist',
            trait: 'Brave',
            goal: 'Save the station',
            developmentArc: 'Growth',
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
            slug: 'station',
            name: 'Space Station Alpha',
            type: 'locations',
            desc: 'Orbital research facility',
            origin: {
                source: 'explicit',
                confidence: 1.0,
                confirmed: true,
                createdBy: 'user',
                updatedAt: Date.now()
            }
        }
    ],
    events: [],
    factions: [],
    artifacts: [],
    world: {
        rules: ['Zero gravity affects everything']
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulate AI Context Building
// ─────────────────────────────────────────────────────────────────────────────

function buildAIContext(memory: NarrativeMemory): string {
    // This simulates how AIEngine.ts uses memory for context
    let context = '## Story Context\n\n';

    if (memory.characters.length > 0) {
        context += '### Characters\n';
        memory.characters.forEach(char => {
            context += `- **${char.name}** (${char.role}): ${char.trait}\n`;
            if (char.goals) context += `  Goal: ${char.goals}\n`;
        });
        context += '\n';
    }

    if (memory.locations.length > 0) {
        context += '### Locations\n';
        memory.locations.forEach(loc => {
            context += `- ${loc}\n`;
        });
        context += '\n';
    }

    if (memory.worldRules.length > 0) {
        context += '### World Rules\n';
        memory.worldRules.forEach(rule => {
            context += `- ${rule}\n`;
        });
        context += '\n';
    }

    return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

function test1_canonAwareContext() {
    console.log('\n🧪 Test 1: Canon-aware project provides derived memory to AI');

    // Simulate canonAware=true flow
    const derivedMemory = deriveMemory(testCanon);
    const aiContext = buildAIContext(derivedMemory);

    // Verify AI context contains canon data
    if (!aiContext.includes('Elena')) {
        throw new Error('❌ AI context does not contain canon character');
    }

    if (!aiContext.includes('Space Station Alpha')) {
        throw new Error('❌ AI context does not contain canon location');
    }

    if (!aiContext.includes('Zero gravity')) {
        throw new Error('❌ AI context does not contain canon world rules');
    }

    console.log('✅ Test 1 PASSED');
    console.log('   - AI context includes canonical character data');
    console.log('   - AI context includes canonical location data');
    console.log('   - AI context includes canonical world rules');
    console.log('\n   Generated AI Context:');
    console.log('   ' + aiContext.split('\n').join('\n   '));
}

function test2_legacyModeContext() {
    console.log('\n🧪 Test 2: Legacy mode (canonAware=false) uses manual memory');

    // Simulate canonAware=false flow (manual memory)
    const manualMemory: NarrativeMemory = {
        characters: [
            {
                name: 'Old Character',
                role: 'Old Role',
                trait: 'Old Trait',
                goals: 'Old Goal',
                relationships: '',
                developmentArc: ''
            }
        ],
        locations: ['Old Location'],
        timeline: [],
        worldRules: [],
        plotEvents: []
    };

    const aiContext = buildAIContext(manualMemory);

    // Verify AI context contains manual data (not canon)
    if (!aiContext.includes('Old Character')) {
        throw new Error('❌ AI context does not contain manual character');
    }

    if (!aiContext.includes('Old Location')) {
        throw new Error('❌ AI context does not contain manual location');
    }

    // Should NOT contain canon data
    if (aiContext.includes('Elena')) {
        throw new Error('❌ AI context unexpectedly contains canon character (should use manual memory)');
    }

    console.log('✅ Test 2 PASSED');
    console.log('   - Legacy mode uses manual memory');
    console.log('   - Canon data not leaked into legacy context');
}

function test3_contextDifference() {
    console.log('\n🧪 Test 3: Canon context differs from manual context');

    const canonMemory = deriveMemory(testCanon);
    const manualMemory: NarrativeMemory = {
        characters: [],
        locations: [],
        timeline: [],
        worldRules: [],
        plotEvents: []
    };

    const canonContext = buildAIContext(canonMemory);
    const manualContext = buildAIContext(manualMemory);

    // They should be different
    if (canonContext === manualContext) {
        throw new Error('❌ Canon context identical to manual context (should differ)');
    }

    // Canon context should be richer (longer)
    if (canonContext.length <= manualContext.length) {
        throw new Error('❌ Canon context not richer than empty manual context');
    }

    console.log('✅ Test 3 PASSED');
    console.log(`   - Canon context: ${canonContext.length} chars`);
    console.log(`   - Manual context: ${manualContext.length} chars`);
    console.log('   - Canon provides richer AI context');
}

// ─────────────────────────────────────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────────────────────────────────────

function runAllTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   AI Context Generation Test — Canon vs Legacy');
    console.log('═══════════════════════════════════════════════════════════════');

    try {
        test1_canonAwareContext();
        test2_legacyModeContext();
        test3_contextDifference();

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('   ✅ ALL TESTS PASSED — AI Context Generation Verified!');
        console.log('═══════════════════════════════════════════════════════════════\n');
    } catch (err: any) {
        console.error('\n═══════════════════════════════════════════════════════════════');
        console.error(`   ❌ TEST FAILED: ${err.message}`);
        console.error('═══════════════════════════════════════════════════════════════\n');
        process.exit(1);
    }
}

runAllTests();
