/**
 * extractFromEdit.ts — Extract Canon Changes from Inline Edits
 *
 * Purpose: Analyze edited prose text and detect:
 * 1. NEW entities (characters, locations, events)
 * 2. CONFLICTS with existing canon
 * 3. SUGGESTIONS for continuity
 *
 * This is the reverse bridge: Narrative → Canon
 * (deriveMemory is forward: Canon → Narrative)
 *
 * @see handoff/EDIT_TO_CANON.md
 */

import { ProjectCanon } from './canonTypes';
import { deriveMemory } from './deriveMemory';
import { NarrativeMode, NarrativeAspect } from '../types';
import { generateNarrativeContent } from '../services/AIEngine';
import { parseExtractFromEditResponse } from './extractFromEditPrompt';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ExtractedCharacter {
    name: string;
    role?: string;
    trait?: string;
    confidence: number;         // 0..1
    extractedFrom: string;      // Original text snippet
}

interface ExtractedLocation {
    name: string;
    description?: string;
    confidence: number;
    extractedFrom: string;
}

interface ExtractedEvent {
    name: string;
    description: string;
    confidence: number;
    extractedFrom: string;
}

interface CanonConflict {
    type: 'character_rename' | 'location_contradiction' | 'event_timeline_conflict' | 'trait_change' | 'role_change';
    entityId: string;           // Conflicting canon entity ID
    entityType: 'character' | 'location' | 'event';
    oldValue: string;
    newValue: string;
    impact: 'low' | 'medium' | 'high';
    affectedScenes: string[];   // Scene IDs that would need reconstruction
    explanation: string;        // Human-readable conflict description
}

interface ContinuitySuggestion {
    type: 'missing_detail' | 'continuity_gap' | 'world_rule_violation';
    message: string;
    severity: 'info' | 'warning';
}

interface ExtractFromEditResult {
    // New entities detected in edited text
    newEntities: {
        characters: ExtractedCharacter[];
        locations: ExtractedLocation[];
        events: ExtractedEvent[];
    };

    // Conflicts with existing canon
    conflicts: CanonConflict[];

    // Suggestions (optional enhancements)
    suggestions: ContinuitySuggestion[];
}

interface ExtractFromEditParams {
    text: string;                   // Edited prose text (paragraph or scene)
    sceneId: string;                // Scene context (for continuity check)
    existingCanon: ProjectCanon;    // Current canon state
    language?: 'UA' | 'ENG';        // Language for explanations
}

// ─────────────────────────────────────────────────────────────────────────────
// Main API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract canon changes from edited narrative text
 *
 * @param params - Extraction parameters
 * @returns Detected entities, conflicts, and suggestions
 *
 * @example
 * const result = await extractFromEdit({
 *     text: "Маркус увійшов у темну лабораторію.",
 *     sceneId: "scene_chapter1_1",
 *     existingCanon: project.canon
 * });
 *
 * if (result.newEntities.characters.length > 0) {
 *     // Show Guardian dialog
 * }
 */
async function extractFromEdit(
    params: ExtractFromEditParams
): Promise<ExtractFromEditResult> {
    const { text, sceneId, existingCanon, language = 'UA' } = params;

    try {
        // Call AIEngine with EXTRACT_FROM_EDIT mode
        const aiResponse = await generateNarrativeContent({
            text,
            mode: NarrativeMode.EXTRACT_FROM_EDIT,
            aspect: NarrativeAspect.CHARACTERS, // Not used for this mode, but required by interface
            memory: deriveMemory(existingCanon), // Derived memory as context
            activeProject: { canon: existingCanon } as any, // Pass canon for prompt builder
            activeScene: { id: sceneId } as any, // Scene context
            narrativeForm: undefined as any,
            architectNarrativeMode: undefined as any,
            narrativeMedium: undefined as any,
        });

        // Parse AI response using the prompt's parser
        const parsed = parseExtractFromEditResponse(aiResponse);

        return parsed;
    } catch (error) {
        console.error('[extractFromEdit] AI call failed:', error);

        // Fallback: return empty result on error
        return {
            newEntities: {
                characters: [],
                locations: [],
                events: []
            },
            conflicts: [],
            suggestions: []
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Conflict Detection Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect conflicts between edited text and existing canon
 *
 * @param text - Edited text
 * @param existingCanon - Current canon state
 * @returns Detected conflicts
 */
function detectConflicts(
    text: string,
    existingCanon: ProjectCanon
): CanonConflict[] {
    const conflicts: CanonConflict[] = [];

    // TODO: Implement conflict detection logic
    // Examples:
    // 1. Character trait changed: "Елена була сміливою" → "Елена була обережною"
    // 2. Location description contradicts: "Станція була темною" vs canon says "bright"
    // 3. Event timeline conflict: "Day 5" vs canon says "Day 3"

    return conflicts;
}

/**
 * Calculate impact of conflict on existing scenes
 *
 * @param conflict - Detected conflict
 * @param existingCanon - Current canon state
 * @returns Impact level and affected scenes
 */
function calculateImpact(
    conflict: CanonConflict,
    existingCanon: ProjectCanon
): { impact: 'low' | 'medium' | 'high'; affectedScenes: string[] } {
    // TODO: Implement impact calculation
    // High impact: core character trait change affecting 5+ scenes
    // Medium impact: secondary character change affecting 2-4 scenes
    // Low impact: minor detail change affecting 0-1 scenes

    return {
        impact: 'low',
        affectedScenes: []
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Promotion (user can change entity type)
// ─────────────────────────────────────────────────────────────────────────────

type EntityType = 'character' | 'location' | 'event' | 'rule';

/**
 * Promote extracted entity to different type
 *
 * Example: "Маркус" detected as character, user changes to location
 *
 * @param entity - Extracted entity
 * @param newType - New entity type
 * @returns Promoted entity
 */
function promoteEntityType(
    entity: ExtractedCharacter | ExtractedLocation | ExtractedEvent,
    newType: EntityType
): ExtractedCharacter | ExtractedLocation | ExtractedEvent {
    // Base promotion: copy common fields
    const base = {
        name: entity.name,
        confidence: entity.confidence,
        extractedFrom: entity.extractedFrom
    };

    switch (newType) {
        case 'character':
            return {
                ...base,
                role: (entity as ExtractedCharacter).role || '',
                trait: (entity as ExtractedCharacter).trait || ''
            } as ExtractedCharacter;

        case 'location':
            return {
                ...base,
                description: (entity as ExtractedLocation).description || ''
            } as ExtractedLocation;

        case 'event':
            return {
                ...base,
                description: (entity as ExtractedEvent).description || entity.name
            } as ExtractedEvent;

        default:
            return entity;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Natural Language Explanations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate human-readable explanation for conflict
 *
 * @param conflict - Detected conflict
 * @param language - UI language
 * @returns Natural language explanation
 */
function explainConflict(
    conflict: CanonConflict,
    language: 'UA' | 'ENG' = 'UA'
): string {
    const templates = {
        UA: {
            character_rename: `Персонаж "${conflict.oldValue}" тепер називається "${conflict.newValue}"`,
            trait_change: `Риса персонажа змінилася: "${conflict.oldValue}" → "${conflict.newValue}"`,
            role_change: `Роль персонажа змінилася: "${conflict.oldValue}" → "${conflict.newValue}"`,
            location_contradiction: `Локація "${conflict.oldValue}" суперечить новому опису: "${conflict.newValue}"`,
            event_timeline_conflict: `Подія "${conflict.oldValue}" конфліктує з часовою лінією: "${conflict.newValue}"`
        },
        ENG: {
            character_rename: `Character "${conflict.oldValue}" is now called "${conflict.newValue}"`,
            trait_change: `Character trait changed: "${conflict.oldValue}" → "${conflict.newValue}"`,
            role_change: `Character role changed: "${conflict.oldValue}" → "${conflict.newValue}"`,
            location_contradiction: `Location "${conflict.oldValue}" contradicts new description: "${conflict.newValue}"`,
            event_timeline_conflict: `Event "${conflict.oldValue}" conflicts with timeline: "${conflict.newValue}"`
        }
    };

    return templates[language][conflict.type] || conflict.explanation;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
    // Main API
    extractFromEdit,

    // Helpers
    detectConflicts,
    calculateImpact,
    promoteEntityType,
    explainConflict,

    // Types (re-export for convenience)
    type ExtractFromEditParams,
    type ExtractFromEditResult,
    type ExtractedCharacter,
    type ExtractedLocation,
    type ExtractedEvent,
    type CanonConflict,
    type ContinuitySuggestion,
    type EntityType
};
