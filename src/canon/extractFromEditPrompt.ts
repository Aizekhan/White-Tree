/**
 * extractFromEditPrompt.ts — AI Prompt for EXTRACT_FROM_EDIT Mode
 *
 * Purpose: Analyze edited prose text and detect:
 * - NEW entities (characters, locations, events)
 * - CONFLICTS with existing canon
 * - SUGGESTIONS for continuity
 *
 * This is a FOCUSED version of EXTRACT_CANON for single paragraph/scene.
 * Used for inline editing flow: user edits text → AI detects changes → Guardian confirms.
 *
 * @see handoff/EDIT_TO_CANON.md
 */

import type { ProjectCanon } from './canonTypes';

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

export const EXTRACT_FROM_EDIT_SYSTEM = `
You are a Canon Guardian for a narrative system.

The user edited a scene. Analyze the edited text and:
1. Detect NEW entities (characters, locations, events) not in existing canon
2. Find CONFLICTS with existing canon (character changes, location contradictions, timeline issues)
3. Suggest IMPROVEMENTS for continuity (optional enhancements)

IMPORTANT:
- Only extract entities EXPLICITLY mentioned in edited text
- Do not invent entities not in the text
- Conflicts must have high confidence (>0.7)
- Use natural language in explanations (user-facing)
- Keep names in the project's language (do not translate)
- For new entities, provide confidence score (0..1)
- Include text snippet where entity was found

CONFLICT DETECTION:
- Character rename: "Elena" → "Captain Elena"
- Trait change: "brave" → "cautious"
- Role change: "Astronaut" → "Captain"
- Location contradiction: "dark lab" vs canon says "bright"
- Timeline conflict: "Day 5" vs canon says "Day 3"

OUTPUT FORMAT:
Return JSON with:
- newEntities: { characters[], locations[], events[] }
- conflicts: { type, entityId, oldValue, newValue, impact, explanation }
- suggestions: { type, message, severity }

CONFIDENCE SCORING:
- 0.9-1.0: Clearly stated in text (e.g., "Marcus entered the lab")
- 0.7-0.9: Strongly implied (e.g., "He" when context clearly means Marcus)
- 0.5-0.7: Somewhat implied (ambiguous reference)
- <0.5: Weak inference (do not include)
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Response Schema (Gemini Structured Output)
// ─────────────────────────────────────────────────────────────────────────────

export const EXTRACT_FROM_EDIT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    newEntities: {
      type: "object",
      properties: {
        characters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              trait: { type: "string" },
              confidence: { type: "number" },
              extractedFrom: { type: "string" }, // Text snippet
            },
            required: ["name", "confidence", "extractedFrom"],
          },
        },
        locations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              confidence: { type: "number" },
              extractedFrom: { type: "string" },
            },
            required: ["name", "confidence", "extractedFrom"],
          },
        },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              confidence: { type: "number" },
              extractedFrom: { type: "string" },
            },
            required: ["name", "confidence", "extractedFrom"],
          },
        },
      },
    },
    conflicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["character_rename", "location_contradiction", "event_timeline_conflict", "trait_change", "role_change"],
          },
          entityId: { type: "string" }, // Canon entity ID
          entityType: {
            type: "string",
            enum: ["character", "location", "event"],
          },
          oldValue: { type: "string" },
          newValue: { type: "string" },
          impact: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          affectedScenes: { type: "array", items: { type: "string" } },
          explanation: { type: "string" }, // Natural language explanation
        },
        required: ["type", "entityId", "entityType", "oldValue", "newValue", "impact", "explanation"],
      },
    },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["missing_detail", "continuity_gap", "world_rule_violation"],
          },
          message: { type: "string" },
          severity: {
            type: "string",
            enum: ["info", "warning"],
          },
        },
        required: ["type", "message", "severity"],
      },
    },
  },
  required: ["newEntities", "conflicts", "suggestions"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Input Builder
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildExtractFromEditInputParams {
  text: string;               // Edited prose text
  sceneId: string;            // Scene context
  existingCanon: ProjectCanon; // Current canon state
  language?: 'UA' | 'ENG';    // For explanations
}

/**
 * Build prompt for EXTRACT_FROM_EDIT mode
 *
 * @param params - Input parameters
 * @returns Formatted prompt for AI
 */
export function buildExtractFromEditInput(params: BuildExtractFromEditInputParams): string {
  const { text, sceneId, existingCanon, language = 'UA' } = params;

  // Build existing canon summary (for conflict detection)
  const canonSummary = {
    characters: existingCanon.characters
      .filter(c => c.origin.confirmed)
      .map(c => ({
        id: c.id,
        name: c.name,
        role: c.role,
        trait: c.trait,
      })),
    locations: existingCanon.locations
      .filter(l => l.origin.confirmed)
      .map(l => ({
        id: l.id,
        name: l.name,
        desc: l.desc,
      })),
    events: existingCanon.events
      .filter(e => e.origin.confirmed)
      .map(e => ({
        id: e.id,
        name: e.name,
        when: e.when,
      })),
    worldRules: existingCanon.world?.rules || [],
  };

  const prompt = [
    `=== EDITED TEXT (Scene: ${sceneId}) ===`,
    text,
    '',
    '=== EXISTING CANON ===',
    JSON.stringify(canonSummary, null, 2),
    '',
    `=== TASK ===`,
    `Language: ${language}`,
    `Analyze the edited text and detect:`,
    `1. NEW entities not in existing canon`,
    `2. CONFLICTS with existing canon`,
    `3. SUGGESTIONS for continuity`,
    '',
    `Return JSON following the schema.`,
  ].join('\n');

  return prompt;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse AI response for EXTRACT_FROM_EDIT mode
 *
 * @param raw - Raw AI response
 * @returns Parsed extraction result
 */
export function parseExtractFromEditResponse(raw: any): {
  newEntities: {
    characters: Array<{
      name: string;
      role?: string;
      trait?: string;
      confidence: number;
      extractedFrom: string;
    }>;
    locations: Array<{
      name: string;
      description?: string;
      confidence: number;
      extractedFrom: string;
    }>;
    events: Array<{
      name: string;
      description: string;
      confidence: number;
      extractedFrom: string;
    }>;
  };
  conflicts: Array<{
    type: 'character_rename' | 'location_contradiction' | 'event_timeline_conflict' | 'trait_change' | 'role_change';
    entityId: string;
    entityType: 'character' | 'location' | 'event';
    oldValue: string;
    newValue: string;
    impact: 'low' | 'medium' | 'high';
    affectedScenes: string[];
    explanation: string;
  }>;
  suggestions: Array<{
    type: 'missing_detail' | 'continuity_gap' | 'world_rule_violation';
    message: string;
    severity: 'info' | 'warning';
  }>;
} {
  // Filter by confidence threshold (>= 0.7)
  const filterByConfidence = <T extends { confidence: number }>(items: T[]): T[] => {
    return items.filter(item => item.confidence >= 0.7);
  };

  const newEntities = raw.newEntities || { characters: [], locations: [], events: [] };

  return {
    newEntities: {
      characters: filterByConfidence(newEntities.characters || []),
      locations: filterByConfidence(newEntities.locations || []),
      events: filterByConfidence(newEntities.events || []),
    },
    conflicts: raw.conflicts || [],
    suggestions: raw.suggestions || [],
  };
}
