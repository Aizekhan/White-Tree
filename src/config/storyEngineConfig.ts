import { Layout, PenLine, Search, Sparkles, Clapperboard, BrainCircuit, History, LucideIcon } from 'lucide-react';

export interface EngineModule {
  title: string;
  description: string;
  icon: LucideIcon;
  details?: string[];
}

export const storyEngineConfig = {
  pipeline: [
    "Narrative Architect",
    "Write Scene",
    "Analyze",
    "Improve",
    "Adapt",
    "Memory Extraction",
    "Memory Suggestions",
    "Narrative Memory"
  ],
  modules: {
    architecture: {
      title: "Architecture Logic",
      description: "Generates Acts → Chapters → Scenes and assigns Scene Goals and Conflicts.",
      icon: Layout,
      details: [
        "Scene Title & Description: Provides the high-level summary of what happens.",
        "Scene Goal: Defines what the character is actively trying to achieve.",
        "Scene Conflict: Defines the obstacle or opposition preventing the character from achieving their goal."
      ]
    },
    writing: {
      title: "Scene Writing Logic",
      description: "Generates scenes using Scene Goal, Conflict, Character State, Locations, World Rules, Timeline, and Plot Events.",
      icon: PenLine,
      details: [
        "Scene Goal & Conflict: These act as the primary dramatic drivers for the scene.",
        "Scene Description: The specific events to cover.",
        "Character State: Current status, location, and overarching goals of the characters involved.",
        "Locations: Details about the setting.",
        "World Rules: Established lore and constraints.",
        "Timeline & Plot Events: Recent events to maintain continuity."
      ]
    },
    analysis: {
      title: "Analysis Logic",
      description: "Evaluates scenes for pacing, clarity, atmosphere, and narrative consistency.",
      icon: Search,
      details: [
        "Narrative Clarity: Is the prose clear and easy to follow?",
        "Pacing: Does the scene move at an appropriate speed?",
        "Atmosphere: Is the tone and mood effectively established?",
        "Character Consistency: Do the characters act in accordance with their established traits and states?",
        "Alignment: Does the scene successfully address the defined Scene Goal and Conflict?"
      ]
    },
    improve: {
      title: "Improve Logic",
      description: "Rewrites scenes to improve prose quality without changing the core events.",
      icon: Sparkles,
      details: [
        "Improving prose style and flow.",
        "Adjusting pacing to build tension or allow for reflection.",
        "Reducing repetitive or AI-like phrasing.",
        "Strengthening imagery, sensory details, and overall readability."
      ]
    },
    adaptation: {
      title: "Screenplay Adaptation Logic",
      description: "Transforms narrative prose into screenplay format using cinematic language.",
      icon: Clapperboard,
      details: [
        "Applies cinematic language and strictly adheres to 'show, don't tell' principles.",
        "Ensures that internal thoughts and abstract concepts are translated into visible actions, expressions, or dialogue."
      ]
    },
    memory: {
      title: "Narrative Memory System",
      description: "Stores structured story context including Characters, Locations, Timeline, World Rules, and Plot Events.",
      icon: BrainCircuit,
      details: [
        "Characters: Names, roles, traits, and relationships.",
        "Character State: Current status, location, and active goals.",
        "Locations: Settings and environments.",
        "Timeline: Chronological order of events.",
        "World Rules: Lore, magic systems, or technological constraints.",
        "Plot Events: Key occurrences that shape the story."
      ]
    },
    extraction: {
      title: "Memory Extraction and Suggestions",
      description: "Analyzes scenes and extracts structured information to generate memory suggestions.",
      icon: History,
      details: [
        "Character state changes (e.g., injuries, new locations, updated goals).",
        "New plot events or outcomes.",
        "New location references.",
        "Timeline updates."
      ]
    }
  } as Record<string, EngineModule>
};
