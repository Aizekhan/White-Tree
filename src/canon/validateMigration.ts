/**
 * validateMigration.ts — De-Risk Check for Phase 3
 *
 * Purpose: Validate that deriveMemory(canon) produces identical NarrativeMemory
 * before enabling canonAware flag for existing projects.
 *
 * Usage:
 *   import { validateMigration } from './validateMigration';
 *   const result = validateMigration(project);
 *   if (!result.safe) {
 *       console.error('Migration not safe:', result.issues);
 *   }
 */

import { deriveMemory } from './deriveMemory.js';
import { ProjectCanon } from './canonTypes.js';
import { NarrativeMemory } from '../types.js';

export interface MigrationValidationResult {
    safe: boolean;
    issues: string[];
    details?: {
        charactersMatch: boolean;
        locationsMatch: boolean;
        eventsMatch: boolean;
        rulesMatch: boolean;
        timelineMatch: boolean;
    };
}

/**
 * Deep equality check for two values
 */
function deepEqual(a: any, b: any): boolean {
    // Primitive equality
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    // Array check (MUST be before object check)
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, i) => deepEqual(item, b[i]));
    }

    // Object check
    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a).sort();
        const keysB = Object.keys(b).sort();

        if (keysA.length !== keysB.length) return false;
        // Compare keys as strings
        if (JSON.stringify(keysA) !== JSON.stringify(keysB)) return false;

        return keysA.every(key => deepEqual(a[key], b[key]));
    }

    return false;
}

/**
 * Validate that a project with canon can safely enable canonAware
 *
 * Checks:
 * 1. Canon exists
 * 2. deriveMemory(canon) matches current memory
 * 3. No data loss would occur
 *
 * @param canon - Project canon
 * @param memory - Current NarrativeMemory
 * @returns Validation result with safety flag and issues
 */
export function validateMigration(
    canon: ProjectCanon | undefined,
    memory: NarrativeMemory
): MigrationValidationResult {
    const issues: string[] = [];

    // Check 1: Canon exists
    if (!canon) {
        issues.push('No canon found. Run backfillProjectCanon first.');
        return { safe: false, issues };
    }

    // Check 2: Derive memory from canon
    const derivedMemory = deriveMemory(canon);

    // Check 3: Compare fields
    const charactersMatch = deepEqual(
        derivedMemory.characters.sort((a, b) => a.name.localeCompare(b.name)),
        memory.characters.sort((a, b) => a.name.localeCompare(b.name))
    );

    const locationsMatch = deepEqual(
        derivedMemory.locations.sort(),
        memory.locations.sort()
    );

    const eventsMatch = deepEqual(
        derivedMemory.plotEvents.sort(),
        memory.plotEvents.sort()
    );

    const rulesMatch = deepEqual(
        derivedMemory.worldRules.sort(),
        memory.worldRules.sort()
    );

    const timelineMatch = deepEqual(
        derivedMemory.timeline.sort(),
        memory.timeline.sort()
    );

    // Collect issues
    if (!charactersMatch) {
        issues.push(`Characters mismatch: canon has ${canon.characters.filter(c => c.origin.confirmed).length} confirmed, memory has ${memory.characters.length}`);
    }

    if (!locationsMatch) {
        issues.push(`Locations mismatch: canon has ${canon.locations.filter(l => l.origin.confirmed).length} confirmed, memory has ${memory.locations.length}`);
    }

    if (!eventsMatch) {
        issues.push(`Events mismatch: canon has ${canon.events.filter(e => e.origin.confirmed).length} confirmed, memory has ${memory.plotEvents.length}`);
    }

    if (!rulesMatch) {
        issues.push(`Rules mismatch: canon has ${canon.rules.filter(r => r.origin.confirmed).length} confirmed, memory has ${memory.worldRules.length}`);
    }

    if (!timelineMatch) {
        issues.push(`Timeline mismatch: derived ${derivedMemory.timeline.length}, memory has ${memory.timeline.length}`);
    }

    const safe = issues.length === 0;

    return {
        safe,
        issues,
        details: {
            charactersMatch,
            locationsMatch,
            eventsMatch,
            rulesMatch,
            timelineMatch
        }
    };
}

/**
 * Validate migration for multiple projects (batch validation)
 *
 * @param projects - Array of projects with canon and memory
 * @returns Summary of validation results
 */
export function validateMigrationBatch(
    projects: Array<{
        id: string;
        name: string;
        canon?: ProjectCanon;
        memory: NarrativeMemory;
    }>
): {
    totalProjects: number;
    safeProjects: number;
    unsafeProjects: number;
    results: Array<{ projectId: string; projectName: string; result: MigrationValidationResult }>;
} {
    const results = projects.map(project => ({
        projectId: project.id,
        projectName: project.name,
        result: validateMigration(project.canon, project.memory)
    }));

    const safeProjects = results.filter(r => r.result.safe).length;
    const unsafeProjects = results.filter(r => !r.result.safe).length;

    return {
        totalProjects: projects.length,
        safeProjects,
        unsafeProjects,
        results
    };
}

/**
 * CLI tool to validate migration for a project
 * Usage: npx tsx src/canon/validateMigration.ts
 */
function runCLI() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   Migration Validation Tool — Phase 3');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Example: validate a mock project (synced with canonTypes.ts schema)
    const mockCanon: ProjectCanon = {
        characters: [
            {
                id: 'char_1',
                slug: 'john',
                name: 'John',
                type: 'characters' as const,
                role: 'Hero',
                trait: '',
                goal: '',
                developmentArc: '',
                status: 'Active',
                origin: { source: 'explicit', confidence: 1.0, confirmed: true, createdBy: 'user', updatedAt: Date.now() }
            }
        ],
        locations: [
            {
                id: 'loc_1',
                slug: 'city',
                name: 'City',
                type: 'locations' as const,
                desc: '',
                origin: { source: 'explicit', confidence: 1.0, confirmed: true, createdBy: 'user', updatedAt: Date.now() }
            }
        ],
        events: [],
        factions: [],
        artifacts: []
    };

    const mockMemory: NarrativeMemory = {
        characters: [{
            name: 'John',
            role: 'Hero',
            trait: '',
            goals: '', // Character uses "goals" (not "goal")
            relationships: '',
            developmentArc: ''
        }],
        locations: ['City'],
        timeline: [],
        worldRules: [],
        plotEvents: []
    };

    // Debug: show derived memory
    console.log('Canon:');
    console.log('  - Characters:', mockCanon.characters.map(c => c.name));
    console.log('  - Locations:', mockCanon.locations.map(l => l.name));
    console.log('\nCurrent Memory:');
    console.log('  - Characters:', mockMemory.characters.map(c => c.name));
    console.log('  - Locations:', mockMemory.locations);
    console.log('\nDerived Memory from Canon:');
    const derived = deriveMemory(mockCanon);
    console.log('  - Characters:', derived.characters.map(c => c.name));
    console.log('  - Locations:', derived.locations);
    console.log('\nCharacter Comparison:');
    console.log('  Derived:', JSON.stringify(derived.characters[0], null, 2));
    console.log('  Memory:', JSON.stringify(mockMemory.characters[0], null, 2));
    console.log('');

    const result = validateMigration(mockCanon, mockMemory);

    if (result.safe) {
        console.log('✅ Migration is SAFE');
        console.log('   - deriveMemory(canon) matches current memory');
        console.log('   - No data loss will occur\n');
    } else {
        console.log('⚠️  Migration is NOT SAFE');
        console.log('   Issues:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('\n   Fix these issues before enabling canonAware flag.\n');
    }

    console.log('Details:');
    console.log(`   - Characters match: ${result.details?.charactersMatch ? '✅' : '❌'}`);
    console.log(`   - Locations match: ${result.details?.locationsMatch ? '✅' : '❌'}`);
    console.log(`   - Events match: ${result.details?.eventsMatch ? '✅' : '❌'}`);
    console.log(`   - Rules match: ${result.details?.rulesMatch ? '✅' : '❌'}`);
    console.log(`   - Timeline match: ${result.details?.timelineMatch ? '✅' : '❌'}`);

    console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// Run CLI when executed directly
runCLI();
