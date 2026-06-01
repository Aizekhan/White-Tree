// deriveMemory.ts — Canon → NarrativeMemory (View).
// Single derivation point for all Memory → AI Context flow.
// Based on handoff/deriveMemory.ts from Claude Design.

import type { NarrativeMemory } from "../types";
import type { ProjectCanon, CanonBase, CanonId } from "./canonTypes";

/**
 * Filter: only EXPLICIT or user-CONFIRMED canon is authoritative.
 * Inferred-unconfirmed NEVER reaches AI context.
 */
const authoritative = <T extends CanonBase>(arr: T[] = []): T[] =>
  arr.filter((e) => e.origin?.source === "explicit" || e.origin?.confirmed === true);

/**
 * Helper: resolve Canon ID to display name.
 * Used for relationships mapping.
 */
const nameOf = (canon: ProjectCanon, id: CanonId): string => {
  for (const k of ["characters", "locations", "events", "factions", "artifacts"] as const) {
    const hit = (canon[k] as CanonBase[] | undefined)?.find((e) => e.id === id);
    if (hit) return hit.name;
  }
  return id; // fallback to id if target was filtered out / missing
};

/**
 * deriveMemory — THE SINGLE DERIVATION POINT.
 *
 * Call after ANY canon write:
 *   canon = applyToCanon(...);
 *   memory = deriveMemory(canon);
 *
 * NEVER write `memory` directly anywhere else.
 *
 * Returns exact NarrativeMemory shape from types.ts, so AIEngine.ts,
 * prompts, and filtered-context stay UNTOUCHED.
 */
export function deriveMemory(canon: ProjectCanon): NarrativeMemory {
  const chars = authoritative(canon.characters);
  const events = authoritative(canon.events);

  return {
    // Characters: map CanonCharacter → Character (NarrativeMemory shape)
    characters: chars.map((c) => ({
      name: c.name,
      role: c.role,
      trait: c.trait,
      goals: c.goal,                // NarrativeMemory uses "goals" (string); canon uses "goal"
      relationships: (c.relations ?? [])
        .map((r) => `${nameOf(canon, r.id)}: ${r.kind}`)
        .join("; "),
      developmentArc: c.developmentArc,
    })),

    // Locations: just names
    locations: authoritative(canon.locations).map((l) => l.name),

    // Timeline: events with temporal markers
    timeline: events.map((e) => (e.when ? `${e.when}: ${e.name}` : e.name)),

    // World Rules: from canon.world
    worldRules: canon.world?.rules ?? [],

    // Plot Events: just event names
    plotEvents: events.map((e) => e.name),
  };
}
