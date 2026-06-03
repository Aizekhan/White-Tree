/**
 * useUniverseCanon - Hook for accessing canon data from active project
 * Returns canon entities by category + helper methods
 */

import { useMemo } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import type {
  CanonCharacter,
  CanonLocation,
  CanonEvent,
  CanonFaction,
  CanonArtifact,
  CanonEntity,
  ProjectCanon
} from '../../canon/canonTypes';
import type { UniverseCategory } from './UniverseView';

export interface CanonEntityDisplay extends CanonEntity {
  displayRole?: string; // For characters
  displayDesc?: string; // For locations/events/factions/artifacts
  displayMotto?: string; // For factions
  displayRarity?: string; // For artifacts
  displayWhen?: string; // For events
}

export function useUniverseCanon() {
  const { projects, activeProjectId } = useStoryStore();

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  const canon: ProjectCanon | undefined = activeProject?.canon;

  /**
   * Get entities for a specific category
   */
  const getEntities = (category: UniverseCategory): CanonEntityDisplay[] => {
    if (!canon) return [];

    switch (category) {
      case 'characters':
        return (canon.characters || []).map((char) => ({
          ...char,
          displayRole: char.role,
        }));
      case 'locations':
        return (canon.locations || []).map((loc) => ({
          ...loc,
          displayDesc: loc.desc,
        }));
      case 'events':
        return (canon.events || []).map((evt) => ({
          ...evt,
          displayDesc: evt.desc,
          displayWhen: evt.when,
        }));
      case 'factions':
        return (canon.factions || []).map((fac) => ({
          ...fac,
          displayDesc: fac.desc,
          displayMotto: fac.motto,
        }));
      case 'artifacts':
        return (canon.artifacts || []).map((art) => ({
          ...art,
          displayDesc: art.desc,
          displayRarity: art.rarity,
        }));
      default:
        return [];
    }
  };

  /**
   * Get entity by ID (any category)
   */
  const getEntityById = (id: string): CanonEntity | undefined => {
    if (!canon) return undefined;

    const allEntities: CanonEntity[] = [
      ...(canon.characters || []),
      ...(canon.locations || []),
      ...(canon.events || []),
      ...(canon.factions || []),
      ...(canon.artifacts || []),
    ];

    return allEntities.find((e) => e.id === id);
  };

  /**
   * Get count for a specific category
   */
  const getCount = (category: UniverseCategory): number => {
    if (!canon) return 0;

    switch (category) {
      case 'characters':
        return canon.characters?.length || 0;
      case 'locations':
        return canon.locations?.length || 0;
      case 'events':
        return canon.events?.length || 0;
      case 'factions':
        return canon.factions?.length || 0;
      case 'artifacts':
        return canon.artifacts?.length || 0;
      default:
        return 0;
    }
  };

  return {
    canon,
    getEntities,
    getEntityById,
    getCount,
    hasCanon: !!canon,
  };
}
