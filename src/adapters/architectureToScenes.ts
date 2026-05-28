import type { StoryArchitecture, ArchitectAct, ArchitectChapter, ArchitectScene } from '../types';

/**
 * Scene format for ImmersiveStoryEntry component
 */
export interface ImmersiveScene {
  id: number;
  title: string;
  act: string;
  location: string;
  timeOfDay: string;
  pov: string;
  visualMood: string;
  atmosphericColor: string;
  storyText: string;
  aiShowrunner: {
    emotional: string;
    narrative: string;
    tension: string;
  };
  // Original architecture references for navigation back
  actKey: 'act1' | 'act2' | 'act3';
  chapterIndex: number;
  sceneIndex: number;
}

/**
 * Converts StoryArchitecture to flattened scene list for immersive viewing
 */
export function architectureToScenes(architecture: StoryArchitecture): ImmersiveScene[] {
  const scenes: ImmersiveScene[] = [];
  let globalId = 1;

  // Process each act
  (['act1', 'act2', 'act3'] as const).forEach((actKey, actIndex) => {
    const act = architecture.acts[actKey];

    act.chapters.forEach((chapter, chapterIndex) => {
      chapter.scenes.forEach((scene, sceneIndex) => {
        scenes.push({
          id: globalId++,
          title: scene.title,
          act: `Act ${actIndex + 1}`,
          location: extractLocation(scene.description) || chapter.title,
          timeOfDay: extractTimeOfDay(scene.description) || 'Unknown',
          pov: extractPOV(scene.description) || 'Unknown',
          visualMood: getVisualMood(actIndex + 1, scene),
          atmosphericColor: getAtmosphericColor(actIndex + 1),
          storyText: formatStoryText(scene),
          aiShowrunner: generateAIFeedback(scene, act, actIndex + 1),
          // Original references
          actKey,
          chapterIndex,
          sceneIndex,
        });
      });
    });
  });

  return scenes;
}

/**
 * Extract location from scene description (simple heuristic)
 */
function extractLocation(description: string): string | null {
  const locationMarkers = ['INT.', 'EXT.', 'at', 'in', 'inside', 'outside'];
  const firstSentence = description.split('.')[0];

  for (const marker of locationMarkers) {
    if (firstSentence.toLowerCase().includes(marker.toLowerCase())) {
      return firstSentence.trim();
    }
  }

  return null;
}

/**
 * Extract time of day from description
 */
function extractTimeOfDay(description: string): string | null {
  const times = ['morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk', 'day'];
  const lowerDesc = description.toLowerCase();

  for (const time of times) {
    if (lowerDesc.includes(time)) {
      return time.charAt(0).toUpperCase() + time.slice(1);
    }
  }

  return null;
}

/**
 * Extract POV character from description
 */
function extractPOV(description: string): string | null {
  // Look for character names (capitalized words that aren't common words)
  const words = description.split(/\s+/);
  const commonWords = new Set(['The', 'A', 'An', 'In', 'At', 'On', 'With', 'For', 'By']);

  for (const word of words) {
    const clean = word.replace(/[.,;:!?]/g, '');
    if (clean.length > 2 && /^[A-Z][a-z]+$/.test(clean) && !commonWords.has(clean)) {
      return clean;
    }
  }

  return null;
}

/**
 * Get visual mood emoji based on act and scene
 */
function getVisualMood(actNumber: number, scene: ArchitectScene): string {
  const description = scene.description.toLowerCase();

  // Conflict-based moods
  if (scene.conflicts.length > 0) {
    if (description.includes('fight') || description.includes('battle')) return '⚔️';
    if (description.includes('tension') || description.includes('argument')) return '⚡';
    if (description.includes('confrontation')) return '🔥';
  }

  // Goal-based moods
  if (scene.characterGoals.length > 0) {
    if (description.includes('discover') || description.includes('reveal')) return '🔍';
    if (description.includes('journey') || description.includes('travel')) return '🗺️';
    if (description.includes('decision')) return '🎭';
  }

  // Act-based defaults
  if (actNumber === 1) return '🌅'; // Beginning
  if (actNumber === 2) return '⚡'; // Conflict
  if (actNumber === 3) return '🎬'; // Resolution

  return '📖'; // Default
}

/**
 * Get atmospheric color gradient based on act
 */
function getAtmosphericColor(actNumber: number): string {
  const colors = {
    1: 'from-blue-950 via-indigo-950 to-black',        // Act 1: Setup (cool, mysterious)
    2: 'from-orange-950 via-red-950 to-black',         // Act 2: Conflict (warm, intense)
    3: 'from-violet-950 via-purple-950 to-black',      // Act 3: Resolution (deep, dramatic)
  };

  return colors[actNumber as keyof typeof colors] || 'from-slate-950 to-black';
}

/**
 * Format scene into story text
 */
function formatStoryText(scene: ArchitectScene): string {
  const parts: string[] = [];

  // Description as opening
  parts.push(scene.description);

  // Character goals if present
  if (scene.characterGoals.length > 0) {
    parts.push('');
    parts.push(`Goals: ${scene.characterGoals.join(', ')}`);
  }

  // Conflicts if present
  if (scene.conflicts.length > 0) {
    parts.push('');
    parts.push(`Conflicts: ${scene.conflicts.join(', ')}`);
  }

  return parts.join('\n\n');
}

/**
 * Generate AI Showrunner feedback for scene
 */
function generateAIFeedback(
  scene: ArchitectScene,
  act: ArchitectAct,
  actNumber: number
): ImmersiveScene['aiShowrunner'] {
  // Emotional analysis
  const emotional = scene.conflicts.length > 0
    ? `This scene carries emotional weight through ${scene.conflicts.length} key conflict(s). The character's journey deepens here.`
    : `Character goals drive this scene: ${scene.characterGoals[0] || 'exploration and discovery'}.`;

  // Narrative analysis
  const narrative = actNumber === 1
    ? 'Setup phase: establishing world, character, and stakes.'
    : actNumber === 2
    ? 'Rising action: conflict intensifies, obstacles multiply.'
    : 'Resolution phase: climax approaches, threads converge.';

  // Tension analysis
  const tensionLevel = scene.conflicts.length > 2 ? 'high' : scene.conflicts.length > 0 ? 'rising' : 'building';
  const tension = `Tension: ${tensionLevel}. ${scene.conflicts.length} active conflicts shaping the narrative.`;

  return { emotional, narrative, tension };
}
