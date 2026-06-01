/**
 * integration-example.tsx — Phase 3: How to Integrate useCanonManagement
 *
 * Purpose: Reference implementation showing canon-aware memory operations
 *
 * Integration Steps for AppRoot.tsx:
 * 1. Import useCanonManagement
 * 2. Call hook with project.canonAware flag
 * 3. Replace direct setMemory calls with canon-aware functions
 * 4. Pass functions to NarrativeMemoryPanel
 *
 * @see useCanonManagement.ts
 */

import React from 'react';
import { useCanonManagement } from '../hooks/useCanonManagement';
import { useStoryStore } from '../store/useStoryStore';
import { Character } from '../types';
import NarrativeMemoryPanel from '../features/memory/components/NarrativeMemoryPanel';

/**
 * Example Component showing canon-aware memory operations
 */
export function CanonAwareWorkspace() {
    const { memory, setMemory, projects, activeProjectId } = useStoryStore();

    // Get active project
    const activeProject = projects.find(p => p.id === activeProjectId);

    // Initialize useCanonManagement with canonAware flag
    const {
        addCharacterToCanon,
        addLocationToCanon,
        addEventToCanon,
        addRuleToCanon,
        addTimelineToCanon,
        removeFromCanon,
        validateMemoryEquivalence,
        canonAware
    } = useCanonManagement(activeProject?.canonAware || false);

    // ───────────────────────────────────────────────────────────────────────
    // Memory Write Operations (Canon-Aware)
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Add Character
     * - If canonAware=true → writes to canon → deriveMemory → setMemory
     * - If canonAware=false → writes directly to memory (fallback)
     */
    const handleAddCharacter = (char: Character) => {
        addCharacterToCanon(char);
        console.log(`[Canon-Aware] Added character: ${char.name} (canonAware=${canonAware})`);
    };

    /**
     * Add String Memory (locations, plotEvents, worldRules, timeline)
     * Maps to appropriate canon function based on key
     */
    const handleAddStringMemory = (
        key: keyof Omit<typeof memory, 'characters'>,
        value: string
    ) => {
        switch (key) {
            case 'locations':
                addLocationToCanon(value);
                break;
            case 'plotEvents':
                addEventToCanon(value);
                break;
            case 'worldRules':
                addRuleToCanon(value);
                break;
            case 'timeline':
                addTimelineToCanon(value);
                break;
            default:
                console.warn(`[Canon-Aware] Unknown memory key: ${key}`);
        }
        console.log(`[Canon-Aware] Added ${key}: ${value} (canonAware=${canonAware})`);
    };

    /**
     * Remove from Memory
     * - If canonAware=true → removes from canon → deriveMemory
     * - If canonAware=false → removes directly from memory
     */
    const handleRemoveFromMemory = (
        key: keyof typeof memory,
        index: number
    ) => {
        if (!canonAware) {
            // Fallback: direct memory removal
            setMemory(prev => ({
                ...prev,
                [key]: (prev[key] as any[]).filter((_, i) => i !== index)
            }));
            return;
        }

        // Canon-aware removal
        // Note: Requires mapping memory index → canon entity ID
        // This is a simplified example — real implementation needs ID tracking
        console.log(`[Canon-Aware] Remove from ${key} at index ${index}`);

        // In production, you'd track which memory item came from which canon entity
        // For now, just direct memory removal (TODO: implement canon removal)
        setMemory(prev => ({
            ...prev,
            [key]: (prev[key] as any[]).filter((_, i) => i !== index)
        }));
    };

    /**
     * Canon Entity Confirmation (from Phase 2 UI)
     * Marks inferred entity as confirmed
     */
    const handleConfirmCanonEntity = (entityId: string, entityType: string) => {
        const { setCanon } = useStoryStore.getState();

        setCanon(prev => {
            if (!prev) return prev;

            const typeKey = `${entityType}s` as keyof typeof prev; // 'character' → 'characters'

            return {
                ...prev,
                [typeKey]: prev[typeKey].map((entity: any) =>
                    entity.id === entityId
                        ? { ...entity, origin: { ...entity.origin, confirmed: true } }
                        : entity
                )
            };
        });

        console.log(`[Canon] Confirmed ${entityType}: ${entityId}`);
    };

    /**
     * Canon Entity Rejection (from Phase 2 UI)
     * Removes inferred entity from canon
     */
    const handleRejectCanonEntity = (entityId: string, entityType: string) => {
        const typeKey = `${entityType}s` as keyof ProjectCanon;
        removeFromCanon(entityId, typeKey);
        console.log(`[Canon] Rejected ${entityType}: ${entityId}`);
    };

    /**
     * Canon Entity Edit (from Phase 2 UI)
     * Opens modal to edit entity (placeholder)
     */
    const handleEditCanonEntity = (entity: any, entityType: string) => {
        // TODO: Open edit modal
        console.log(`[Canon] Edit ${entityType}:`, entity);
        alert(`Edit modal coming soon for: ${entity.name}`);
    };

    // ───────────────────────────────────────────────────────────────────────
    // De-Risk Validation (Optional)
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Validate that deriveMemory(canon) matches current memory
     * Use this before enabling canonAware for a project
     */
    const runValidation = () => {
        if (!activeProject?.canon) {
            console.warn('[Validation] No canon to validate');
            return;
        }

        const validation = validateMemoryEquivalence(activeProject.canon, memory);

        if (validation.matches) {
            console.log('✅ [Validation] Memory matches derived memory from canon');
        } else {
            console.warn('⚠️ [Validation] Memory mismatch:', validation.diff);
        }
    };

    // ───────────────────────────────────────────────────────────────────────
    // Render
    // ───────────────────────────────────────────────────────────────────────

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">
                Canon-Aware Workspace {canonAware && '(Canon Mode Active)'}
            </h1>

            {/* Validation Button */}
            <button
                onClick={runValidation}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Run Validation
            </button>

            {/* Memory Panel with Canon-Aware Functions */}
            <NarrativeMemoryPanel
                memory={memory}
                canon={activeProject?.canon}
                showMemory={true}
                setShowMemory={() => {}}
                t={{
                    narrativeMemory: 'Narrative Memory',
                    characterTracker: 'Characters',
                    addCharacter: 'Add Character',
                    cancel: 'Cancel',
                    characterName: 'Name',
                    characterRole: 'Role',
                    characterTrait: 'Trait',
                    characterGoals: 'Goals',
                    characterRelationships: 'Relationships',
                    characterArc: 'Development Arc',
                    save: 'Save',
                    locations: 'Locations',
                    timeline: 'Timeline',
                    worldRules: 'World Rules',
                    plotEvents: 'Plot Events',
                    reset: 'Reset',
                    proTip: 'Memory is automatically synced with Canon when canonAware=true'
                }}
                onResetMemory={() => {
                    setMemory({
                        characters: [],
                        locations: [],
                        timeline: [],
                        worldRules: [],
                        plotEvents: []
                    });
                }}
                onAddCharacter={handleAddCharacter}
                onRemoveCharacter={(idx) => handleRemoveFromMemory('characters', idx)}
                onAddStringMemory={handleAddStringMemory}
                onRemoveStringMemory={handleRemoveFromMemory}
                onConfirmCanonEntity={handleConfirmCanonEntity}
                onRejectCanonEntity={handleRejectCanonEntity}
                onEditCanonEntity={handleEditCanonEntity}
            />
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// Integration Checklist for AppRoot.tsx
// ═════════════════════════════════════════════════════════════════════════════

/**
 * [ ] Step 1: Import useCanonManagement
 *     import { useCanonManagement } from '../hooks/useCanonManagement';
 *
 * [ ] Step 2: Initialize hook in component
 *     const { addCharacterToCanon, addLocationToCanon, ... } = useCanonManagement(
 *         activeProject?.canonAware || false
 *     );
 *
 * [ ] Step 3: Replace direct setMemory calls
 *     OLD: setMemory(prev => ({ ...prev, characters: [...prev.characters, char] }))
 *     NEW: addCharacterToCanon(char)
 *
 * [ ] Step 4: Pass functions to NarrativeMemoryPanel
 *     <NarrativeMemoryPanel
 *         onAddCharacter={addCharacterToCanon}
 *         onAddStringMemory={(key, val) => {
 *             if (key === 'locations') addLocationToCanon(val);
 *             else if (key === 'plotEvents') addEventToCanon(val);
 *             ...
 *         }}
 *         ...
 *     />
 *
 * [ ] Step 5: Test with canonAware=false (should work as before)
 * [ ] Step 6: Enable canonAware=true for test project
 * [ ] Step 7: Verify deriveMemory returns correct memory
 * [ ] Step 8: Run Phase 3 tests
 */
