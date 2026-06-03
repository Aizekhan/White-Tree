/**
 * useBookScenes - Hook для роботи з реальними сценами project.architecture
 *
 * Перетворює складну структуру acts → chapters → scenes в плоский масив для навігації книгою
 * Надає методи для збереження тексту та intent
 */

import { useMemo } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import type { ArchitectScene } from '../../types';

/**
 * Flat scene for Book navigation
 */
export interface BookScene {
  // Scene data
  title: string;
  description: string;
  writtenText?: string;
  intent?: string;
  status?: ArchitectScene['status'];

  // Navigation metadata
  actKey: 'act1' | 'act2' | 'act3';
  actTitle: string;
  chapterIdx: number;
  chapterTitle: string;
  sceneIdx: number;

  // Flattened index
  globalIndex: number;
}

export function useBookScenes() {
  const { architecture, saveSceneText } = useStoryStore();

  /**
   * Flatten acts → chapters → scenes into a single array for book navigation
   */
  const flatScenes = useMemo<BookScene[]>(() => {
    if (!architecture) return [];

    const scenes: BookScene[] = [];
    let globalIndex = 0;

    // Iterate through acts (act1, act2, act3)
    (['act1', 'act2', 'act3'] as const).forEach((actKey) => {
      const act = architecture.acts[actKey];
      if (!act) return;

      // Iterate through chapters
      act.chapters.forEach((chapter, chapterIdx) => {
        // Iterate through scenes
        chapter.scenes.forEach((scene, sceneIdx) => {
          scenes.push({
            // Scene data
            title: scene.title,
            description: scene.description,
            writtenText: scene.writtenText,
            intent: scene.intent,
            status: scene.status,

            // Navigation metadata
            actKey,
            actTitle: act.title,
            chapterIdx,
            chapterTitle: chapter.title,
            sceneIdx,

            // Flattened index
            globalIndex: globalIndex++,
          });
        });
      });
    });

    return scenes;
  }, [architecture]);

  /**
   * Save written text for a scene
   */
  const saveText = (scene: BookScene, newText: string) => {
    saveSceneText(scene.actKey, scene.chapterIdx, scene.sceneIdx, newText);
  };

  /**
   * Save intent for next scene generation
   * TODO: Add setSceneIntent to useStoryStore
   */
  const saveIntent = (scene: BookScene, intent: string) => {
    console.log('[useBookScenes] Save intent:', { scene: scene.title, intent });
    // TODO: Implement setSceneIntent in useStoryStore
  };

  return {
    scenes: flatScenes,
    totalScenes: flatScenes.length,
    architecture,
    saveText,
    saveIntent,
  };
}
