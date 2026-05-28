import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';
import type { Project } from '../types';

/**
 * Creates a new project in Firestore for the given user.
 *
 * @param user - Firebase Auth user
 * @param title - Project title
 * @param description - Project description/premise
 * @param language - Project language (UA or ENG)
 * @returns Promise<string> - The created project ID
 */
export async function createProject(
  user: User,
  title: string = 'New Story',
  description: string = 'A new narrative journey',
  language: 'UA' | 'ENG' = 'UA'
): Promise<string> {
  const now = Timestamp.now();

  const projectData = {
    userId: user.uid,
    title,
    description,
    language,
    tier: 'free', // Default tier, can be upgraded via subscription
    createdAt: now,
    updatedAt: now,

    // Initialize empty editor state
    text: '',
    memory: {
      characters: [],
      locations: [],
      timeline: [],
      worldRules: [],
      plotEvents: []
    },
    sceneProgress: {},
    architecture: null,
    result: null,
    activeScene: null,
    tokens: 1000 // Default token balance for new projects
  };

  const docRef = await addDoc(collection(db, 'projects'), projectData);

  console.log(`[PROJECT_SERVICE] Created new project: ${docRef.id} - "${title}"`);

  return docRef.id;
}
