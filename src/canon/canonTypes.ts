// Canon Graph Types — stable schema for Canon-Aware narrative system.
// Based on CANON_SCHEMA.md from Claude Design handoff.
// DO NOT modify these types without updating CANON_SCHEMA.md first.

// ══════════════════════════════════════════════════════════════════════════════
// Base Types
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Stable opaque ID (never changes, even on rename).
 * Examples: "char_8f3k2a", "loc_9xh2b", "evt_3k8f2"
 */
export type CanonId = string;

/**
 * Canon entity type (determines which collection it belongs to).
 */
export type CanonType = "characters" | "locations" | "events" | "factions" | "artifacts";

/**
 * Origin provenance — who created this canon entry.
 */
export type Provenance = "explicit" | "inferred";

/**
 * Origin metadata — tracks how this canon entry was created and its authority level.
 */
export interface Origin {
  source: Provenance;          // explicit = user created; inferred = AI proposed
  confidence?: number;          // 0..1, only for inferred
  confirmed: boolean;           // inferred becomes canon only after true
  createdBy: "user" | "ai" | "migration";
  updatedAt: number;            // timestamp
}

// ══════════════════════════════════════════════════════════════════════════════
// Base Canon Entity
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Base interface for all canon entities.
 * Cross-links are named by TARGET TYPE (plural). Reverse links are derived.
 */
export interface CanonBase {
  id: CanonId;                  // opaque, stable (never changes)
  slug: string;                 // URL-friendly ("marcus-chen")
  name: string;                 // display name ("Король Маркус")
  type: CanonType;
  origin: Origin;

  // Cross-links to other canon entities (by target type, plural)
  characters?: CanonId[];
  locations?: CanonId[];
  events?: CanonId[];
  factions?: CanonId[];
  artifacts?: CanonId[];
}

// ══════════════════════════════════════════════════════════════════════════════
// Canon Entities (extend CanonBase)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Character entity — matches NarrativeMemory.Character fields.
 */
export interface CanonCharacter extends CanonBase {
  type: "characters";
  role: string;                 // "Protagonist", "Antagonist", "Supporting"
  trait: string;                // Core personality trait
  goal: string;                 // Main character goal (NarrativeMemory uses "goals")
  developmentArc: string;       // Character arc trajectory
  status?: string;              // Current status (alive, dead, injured, etc.)

  // Typed relationships (replaces Character.relationships string)
  relations?: Array<{
    id: CanonId;                // Target character ID
    kind: string;               // Relationship type ("loves", "hates", "mentor of")
    tone?: string;              // Optional emotional tone
  }>;
}

/**
 * Location entity.
 */
export interface CanonLocation extends CanonBase {
  type: "locations";
  atmos?: string[];             // Atmospheric tags
  desc?: string;                // Description
}

/**
 * Event entity (plot beats, timeline entries).
 */
export interface CanonEvent extends CanonBase {
  type: "events";
  when?: string;                // Temporal marker ("Day 5", "Chapter 3")
  act?: number;                 // Act number (1, 2, 3)
  desc?: string;                // Event description
}

/**
 * Faction entity (groups, organizations, alliances).
 */
export interface CanonFaction extends CanonBase {
  type: "factions";
  motto?: string;               // Faction motto or slogan
  align?: string;               // Alignment (good/evil/neutral, etc.)
  desc?: string;                // Description
}

/**
 * Artifact entity (items, objects, MacGuffins).
 */
export interface CanonArtifact extends CanonBase {
  type: "artifacts";
  rarity?: string;              // Rarity level
  owner?: CanonId;              // Current owner (character ID)
  desc?: string;                // Description
}

// ══════════════════════════════════════════════════════════════════════════════
// Narrative Layer (Canon-Aware Scenes)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Scene Intent — user's creative direction for the next scene.
 * Replaces free-form prompts with structured choices.
 */
export interface SceneIntent {
  direction: "conflict" | "character" | "action" | "romance" | "worldbuilding" | "surprise" | "custom";
  note?: string;                // For custom direction or clarification
}

/**
 * Canon-aware scene (extends existing ArchitectScene).
 * Adds: id, slug, intent, canon-links, recon strategy.
 */
export interface CanonScene {
  id: CanonId;                  // "scene_..."
  slug: string;
  title: string;
  description: string;
  characterGoals: string[];     // Matches ArchitectScene.characterGoals
  conflicts: string[];          // Matches ArchitectScene.conflicts
  status?: "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted";

  // Story Navigation
  intent?: SceneIntent;         // User-selected direction
  writtenText?: string;         // Generated prose

  // Reconstruction strategy (replaces True History Lock)
  recon?: "auto" | "review" | "pinned";  // Default: "review" for written scenes

  // Canon links (for Impact Analysis)
  characters?: CanonId[];
  locations?: CanonId[];
  events?: CanonId[];
  factions?: CanonId[];
  artifacts?: CanonId[];
}

// ══════════════════════════════════════════════════════════════════════════════
// Project Canon (top-level structure)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Project Canon — single source of truth for all narrative entities.
 * Stored as `canon` field in projects/{id} document.
 */
export interface ProjectCanon {
  characters: CanonCharacter[];
  locations: CanonLocation[];
  events: CanonEvent[];
  factions: CanonFaction[];
  artifacts: CanonArtifact[];
  world?: {
    facts?: Array<{ k: string; v: string }>;  // Key-value world facts
    rules?: string[];                          // World rules (physics, magic, etc.)
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Union Types (for generic canon operations)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Union of all canon entity types.
 */
export type CanonEntity =
  | CanonCharacter
  | CanonLocation
  | CanonEvent
  | CanonFaction
  | CanonArtifact;

/**
 * Helper type to get entity type from collection name.
 */
export type CanonCollectionMap = {
  characters: CanonCharacter;
  locations: CanonLocation;
  events: CanonEvent;
  factions: CanonFaction;
  artifacts: CanonArtifact;
};
