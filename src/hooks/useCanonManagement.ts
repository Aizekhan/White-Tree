/**
 * useCanonManagement.ts — Phase 3: Flip Source Hook
 *
 * Purpose: Central management for Canon → Memory flow.
 * When project.canonAware = true:
 *   - Write operations go to canon (not memory directly)
 *   - deriveMemory(canon) runs automatically
 *   - Resulting NarrativeMemory syncs back to store
 *
 * De-Risk Strategy:
 *   - deepEqual check before flip (optional validation)
 *   - Gradual rollout via canonAware flag
 *
 * @see CLAUDE.md — Canon System Invariants
 */

import { useCallback } from 'react';
import { useStoryStore } from '../store/useStoryStore';
import {
    ProjectCanon,
    CanonCharacter,
    CanonLocation,
    CanonEvent
} from '../canon/canonTypes';
import { deriveMemory } from '../canon/deriveMemory';
import { Character, NarrativeMemory } from '../types';

/**
 * Generate stable ID for canon entities
 * Format: {type}_{random8chars}
 */
function generateCanonId(type: 'char' | 'loc' | 'evt' | 'rule'): string {
    const random = Math.random().toString(36).substring(2, 10);
    return `${type}_${random}`;
}

/**
 * Generate URL-friendly slug from name
 * Example: "Marcus Chen" → "marcus-chen"
 */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function useCanonManagement(canonAware: boolean = false) {
    const { memory, setMemory, setCanon } = useStoryStore();

    /**
     * Add Character to Canon (explicit, confirmed)
     * Triggers deriveMemory → setMemory automatically
     */
    const addCharacterToCanon = useCallback((char: Character) => {
        if (!canonAware) {
            // Fallback: direct memory write (old behavior)
            setMemory(prev => ({
                ...prev,
                characters: [...prev.characters, char]
            }));
            return;
        }

        // NEW: Write to canon (synced with canonTypes.ts schema)
        const canonChar: CanonCharacter = {
            id: generateCanonId('char'),
            slug: slugify(char.name),
            name: char.name,
            type: 'characters' as const,
            role: char.role || 'Unknown',
            trait: char.trait || '',
            goal: char.goal || '',  // singular string (not array)
            developmentArc: char.developmentArc || '',
            status: char.status || 'Active',
            // relations: [], // TODO: map Character.relationships string → typed relations
            origin: {
                source: 'explicit', // User-created
                confidence: 1.0,
                confirmed: true, // Explicit entities are pre-confirmed
                createdBy: 'user',
                updatedAt: Date.now()
            }
        };

        setCanon(prev => {
            const newCanon: ProjectCanon = prev || { characters: [], locations: [], events: [], rules: [] };
            return {
                ...newCanon,
                characters: [...newCanon.characters, canonChar]
            };
        });

        // Auto-derive memory from canon
        const updatedCanon = useStoryStore.getState().projects.find(
            p => p.id === useStoryStore.getState().activeProjectId
        )?.canon;

        if (updatedCanon) {
            const derivedMemory = deriveMemory(updatedCanon);
            setMemory(derivedMemory);
        }
    }, [canonAware, setMemory, setCanon]);

    /**
     * Add Location to Canon (explicit, confirmed)
     */
    const addLocationToCanon = useCallback((locationName: string) => {
        if (!canonAware) {
            // Fallback: direct memory write
            setMemory(prev => ({
                ...prev,
                locations: [...prev.locations, locationName]
            }));
            return;
        }

        const canonLoc: CanonLocation = {
            id: generateCanonId('loc'),
            slug: slugify(locationName),
            name: locationName,
            type: 'locations' as const,
            desc: '', // Optional description
            origin: {
                source: 'explicit',
                confidence: 1.0,
                confirmed: true,
                createdBy: 'user',
                updatedAt: Date.now()
            }
        };

        setCanon(prev => {
            const newCanon: ProjectCanon = prev || { characters: [], locations: [], events: [], rules: [] };
            return {
                ...newCanon,
                locations: [...newCanon.locations, canonLoc]
            };
        });

        // Auto-derive memory
        const updatedCanon = useStoryStore.getState().projects.find(
            p => p.id === useStoryStore.getState().activeProjectId
        )?.canon;

        if (updatedCanon) {
            const derivedMemory = deriveMemory(updatedCanon);
            setMemory(derivedMemory);
        }
    }, [canonAware, setMemory, setCanon]);

    /**
     * Add Event to Canon (explicit, confirmed)
     */
    const addEventToCanon = useCallback((eventDescription: string) => {
        if (!canonAware) {
            setMemory(prev => ({
                ...prev,
                plotEvents: [...prev.plotEvents, eventDescription]
            }));
            return;
        }

        const canonEvent: CanonEvent = {
            id: generateCanonId('evt'),
            slug: slugify(eventDescription.slice(0, 50)), // Use first 50 chars for slug
            name: eventDescription.slice(0, 100), // Short name
            type: 'events' as const,
            desc: eventDescription, // Full description
            origin: {
                source: 'explicit',
                confidence: 1.0,
                confirmed: true,
                createdBy: 'user',
                updatedAt: Date.now()
            }
        };

        setCanon(prev => {
            const newCanon: ProjectCanon = prev || { characters: [], locations: [], events: [], rules: [] };
            return {
                ...newCanon,
                events: [...newCanon.events, canonEvent]
            };
        });

        // Auto-derive memory
        const updatedCanon = useStoryStore.getState().projects.find(
            p => p.id === useStoryStore.getState().activeProjectId
        )?.canon;

        if (updatedCanon) {
            const derivedMemory = deriveMemory(updatedCanon);
            setMemory(derivedMemory);
        }
    }, [canonAware, setMemory, setCanon]);

    /**
     * Add World Rule to Canon (explicit, confirmed)
     * Rules are stored in world.rules[] array (not separate entities)
     */
    const addRuleToCanon = useCallback((ruleDescription: string) => {
        if (!canonAware) {
            setMemory(prev => ({
                ...prev,
                worldRules: [...prev.worldRules, ruleDescription]
            }));
            return;
        }

        setCanon(prev => {
            const newCanon: ProjectCanon = prev || {
                characters: [],
                locations: [],
                events: [],
                factions: [],
                artifacts: []
            };
            return {
                ...newCanon,
                world: {
                    ...(newCanon.world || {}),
                    rules: [...(newCanon.world?.rules || []), ruleDescription]
                }
            };
        });

        // Auto-derive memory
        const updatedCanon = useStoryStore.getState().projects.find(
            p => p.id === useStoryStore.getState().activeProjectId
        )?.canon;

        if (updatedCanon) {
            const derivedMemory = deriveMemory(updatedCanon);
            setMemory(derivedMemory);
        }
    }, [canonAware, setMemory, setCanon]);

    /**
     * Add Timeline entry to Canon (maps to events with temporal info)
     */
    const addTimelineToCanon = useCallback((timelineEntry: string) => {
        if (!canonAware) {
            setMemory(prev => ({
                ...prev,
                timeline: [...prev.timeline, timelineEntry]
            }));
            return;
        }

        // Timeline entries become temporal events in canon
        const canonEvent: CanonEvent = {
            id: generateCanonId('evt'),
            slug: slugify(timelineEntry.slice(0, 50)),
            name: timelineEntry.slice(0, 100),
            type: 'events' as const,
            desc: timelineEntry,
            when: timelineEntry, // Temporal marker
            origin: {
                source: 'explicit',
                confidence: 1.0,
                confirmed: true,
                createdBy: 'user',
                updatedAt: Date.now()
            }
        };

        setCanon(prev => {
            const newCanon: ProjectCanon = prev || { characters: [], locations: [], events: [], rules: [] };
            return {
                ...newCanon,
                events: [...newCanon.events, canonEvent]
            };
        });

        // Auto-derive memory
        const updatedCanon = useStoryStore.getState().projects.find(
            p => p.id === useStoryStore.getState().activeProjectId
        )?.canon;

        if (updatedCanon) {
            const derivedMemory = deriveMemory(updatedCanon);
            setMemory(derivedMemory);
        }
    }, [canonAware, setMemory, setCanon]);

    /**
     * Remove entity from Canon by ID
     */
    const removeFromCanon = useCallback((entityId: string, entityType: 'characters' | 'locations' | 'events' | 'factions' | 'artifacts') => {
        if (!canonAware) {
            // Fallback: not supported in old flow
            console.warn('[useCanonManagement] removeFromCanon called but canonAware=false');
            return;
        }

        setCanon(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [entityType]: prev[entityType]?.filter((e: any) => e.id !== entityId) || []
            };
        });

        // Auto-derive memory
        const updatedCanon = useStoryStore.getState().projects.find(
            p => p.id === useStoryStore.getState().activeProjectId
        )?.canon;

        if (updatedCanon) {
            const derivedMemory = deriveMemory(updatedCanon);
            setMemory(derivedMemory);
        }
    }, [canonAware, setCanon, setMemory]);

    /**
     * De-Risk Check: Validate that deriveMemory(canon) matches oldMemory
     * Returns { matches: boolean, diff?: string }
     */
    const validateMemoryEquivalence = useCallback((canon: ProjectCanon, oldMemory: NarrativeMemory) => {
        const derived = deriveMemory(canon);

        // Deep equality check (simple JSON comparison for now)
        const derivedStr = JSON.stringify(derived);
        const oldStr = JSON.stringify(oldMemory);

        if (derivedStr === oldStr) {
            return { matches: true };
        }

        // Generate diff report
        const diff = {
            characters: {
                derived: derived.characters.length,
                old: oldMemory.characters.length,
                match: derived.characters.length === oldMemory.characters.length
            },
            locations: {
                derived: derived.locations.length,
                old: oldMemory.locations.length,
                match: derived.locations.length === oldMemory.locations.length
            },
            plotEvents: {
                derived: derived.plotEvents.length,
                old: oldMemory.plotEvents.length,
                match: derived.plotEvents.length === oldMemory.plotEvents.length
            },
            worldRules: {
                derived: derived.worldRules.length,
                old: oldMemory.worldRules.length,
                match: derived.worldRules.length === oldMemory.worldRules.length
            },
            timeline: {
                derived: derived.timeline.length,
                old: oldMemory.timeline.length,
                match: derived.timeline.length === oldMemory.timeline.length
            }
        };

        return {
            matches: false,
            diff: JSON.stringify(diff, null, 2)
        };
    }, []);

    return {
        // Write operations (canon-aware)
        addCharacterToCanon,
        addLocationToCanon,
        addEventToCanon,
        addRuleToCanon,
        addTimelineToCanon,
        removeFromCanon,

        // Validation
        validateMemoryEquivalence,

        // Status
        canonAware
    };
}
