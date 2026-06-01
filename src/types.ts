// Canon System imports
import type { ProjectCanon } from "./canon";

export enum NarrativeForm {
  PROSE = "Prose Story",
  SCREENPLAY = "Screenplay",
  DIALOGUE_DRIVEN = "Dialogue-Driven",
  EPISTOLARY = "Epistolary",
  CINEMATIC = "Cinematic Narrative",
}

export enum ArchitectNarrativeMode {
  DESCRIPTIVE = "Descriptive",
  SCENE_BASED = "Scene-Based",
  INTERNAL_MONOLOGUE = "Internal Monologue",
  MIXED = "Mixed",
}

export enum NarrativeMedium {
  NOVEL = "Novel",
  FILM_SCREEN = "Film / Screen",
  COMIC = "Comic",
  YOUTUBE = "YouTube Video",
  SHORT_VIDEO = "Short Video",
}

export enum NarrativeMode {
  WRITE = "Write",
  ANALYZE = "Analyze",
  IMPROVE = "Improve",
  ADAPT = "Adapt",
  ARCHITECT = "Architect",
  EXTRACT_CANON = "ExtractCanon",
}

export enum NarrativeAspect {
  PLOT_STRUCTURE = "Plot structure",
  CHARACTERS = "Characters",
  CHARACTER_DEVELOPMENT = "Character development",
  CONFLICT = "Conflict",
  WORLDBUILDING = "Worldbuilding",
  ATMOSPHERE = "Atmosphere",
  DIALOGUE = "Dialogue",
  PACING = "Pacing",
  STYLE = "Style",
  THEME = "Theme",
  EMOTIONAL_IMPACT = "Emotional impact",
  READER_ENGAGEMENT = "Reader engagement",
  STORY_LOGIC = "Story logic",
  NARRATIVE_CLARITY = "Narrative clarity",
}

export enum AdaptTarget {
  SCREENPLAY = "Screenplay",
  VIDEO_CARDS = "Video Cards",
  TODDLER_BOOK = "Toddler Book",
  POETRY = "Poetry",
  SOCIAL_POST = "Social Post",
}

export interface Character {
  name: string;
  role: string;
  trait: string;
  goals: string;
  relationships: string;
  developmentArc: string;
}

export interface NarrativeMemory {
  characters: Character[];
  locations: string[];
  timeline: string[];
  worldRules: string[];
  plotEvents: string[];
}

export interface DetailedScores {
  plot: number;
  characters: number;
  conflict: number;
  atmosphere: number;
  dialogue: number;
  style: number;
}

export interface EditorSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface ConsistencyIssue {
  type: "character" | "timeline" | "location" | "event" | "logic";
  description: string;
  contradiction: string;
}

export interface StoryStage {
  stage: "Introduction" | "Inciting Incident" | "Rising Action" | "Climax" | "Resolution";
  description: string;
  found: boolean;
  textSnippet?: string;
}

export interface TensionPoint {
  segment: string;
  level: number; // 0-10
  pacing: "slow" | "moderate" | "fast";
  hasConflict: boolean;
  note: string;
}

export interface GoalProgression {
  segment: string;
  status: "not started" | "in progress" | "setback" | "achieved" | "failed";
  description: string;
}

export interface StoryGoal {
  protagonist: string;
  mainGoal: string;
  obstacles: string[];
  stakes: string;
  progression: GoalProgression[];
}

export interface ThemeSupport {
  segment: string;
  strength: number; // 0-10
  description: string;
}

export interface Theme {
  name: string;
  description: string;
  prevalence: number; // 0-10
  supportByScenes: ThemeSupport[];
}

export type ScenePurpose = "exposition" | "conflict" | "character development" | "plot progression" | "emotional moment";

export interface SceneAnalysis {
  segment: string;
  purposes: ScenePurpose[];
  impact: number; // 0-10
  description: string;
}

export interface ScriptElement {
  type: "action" | "dialogue" | "parenthetical" | "shot";
  character?: string;
  text: string;
}

export interface ScriptScene {
  sceneNumber: number;
  slugline: string; // e.g. INT. COFFEE SHOP - DAY
  location: string;
  characters: string[];
  elements: ScriptElement[];
}

export interface Script {
  title: string;
  scenes: ScriptScene[];
}

export interface SceneTransition {
  fromScene: string;
  toScene: string;
  quality: number; // 0-10
  type: "smooth" | "abrupt" | "pacing jump" | "missing setup";
  description: string;
  suggestion: string;
}

export interface NarrativeNode {
  id: string;
  label: string;
  type: "character" | "event" | "scene" | "location";
  description?: string;
}

export interface NarrativeLink {
  source: string;
  target: string;
  relation: string;
}

export interface ArchitectScene {
  title: string;
  description: string;
  characterGoals: string[];
  conflicts: string[];
  status?: "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted";
}

export interface ArchitectChapter {
  title: string;
  scenes: ArchitectScene[];
}

export interface ArchitectAct {
  title: string;
  description: string;
  milestones: {
    label: string;
    description: string;
  }[];
  chapters: ArchitectChapter[];
}

export interface StoryArchitecture {
  title: string;
  premise: string;
  acts: {
    act1: ArchitectAct;
    act2: ArchitectAct;
    act3: ArchitectAct;
  };
}

export interface QuickFix {
  issue: string;
  improvement: string;
  targetText?: string;
}

export interface NarrativeFormatAnalysis {
  form: string;
  mode: string;
  medium: string;
  explanation: string;
}

export interface AnalysisResult {
  score?: number;
  detailedScores?: DetailedScores;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  editorSuggestions?: EditorSuggestion[];
  quickFixes?: QuickFix[];
  consistencyIssues?: ConsistencyIssue[];
  storyStructure?: StoryStage[];
  tensionAnalysis?: TensionPoint[];
  storyGoal?: StoryGoal;
  themes?: Theme[];
  sceneAnalysis?: SceneAnalysis[];
  transitions?: SceneTransition[];
  narrativeFormat?: NarrativeFormatAnalysis;
  storyMap?: {
    nodes: NarrativeNode[];
    links: NarrativeLink[];
  };
  architecture?: StoryArchitecture;
  script?: Script;
  improvedText?: string;
}

export interface AIResponse {
  result: AnalysisResult;
}

/**
 * Project represents a user's narrative project stored in Firestore.
 * Each project contains story architecture, narrative memory, and editor state.
 */
export interface Project {
  /** Firestore document ID */
  id: string;

  /** User ID (from Firebase Auth) */
  userId: string;

  /** Project metadata */
  title: string;
  description: string;
  language: 'UA' | 'ENG';
  tier: 'free' | 'pro' | 'pro_plus';

  /** Timestamps (ISO string format, converted from Firestore Timestamp) */
  createdAt: string;
  updatedAt: string;

  /** Editor state (auto-saved) */
  text?: string;
  memory?: NarrativeMemory;
  sceneProgress?: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">;
  architecture?: StoryArchitecture;

  /** Canon System (Phase 1+) — single source of truth */
  canon?: ProjectCanon;
  canonAware?: boolean;         // Feature flag: if true, memory = deriveMemory(canon)

  result?: AnalysisResult;
  activeScene?: {
    act: string;
    chapter: string;
    scene: string;
    title: string;
    description: string;
    goals: string[];
    conflicts: string[];
  } | null;

  /** Token balance for AI operations */
  tokens?: number;
}
