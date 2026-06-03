/**
 * Director types — shots, dialogues, visual references
 */

export type ShotType =
  | 'establishing' // Встановлюючий
  | 'wide' // Загальний план
  | 'medium' // Середній план
  | 'close-up' // Крупний план
  | 'extreme-close-up' // Екстра крупний
  | 'pov' // POV (погляд персонажа)
  | 'over-shoulder' // Через плече
  | 'two-shot' // Два персонажі
  | 'insert'; // Вставка (деталь)

export type CameraAngle =
  | 'eye-level' // На рівні очей
  | 'high' // Зверху
  | 'low' // Знизу
  | 'birds-eye' // Пташиний зір
  | 'dutch' // Голландський (нахил)
  | 'aerial'; // Повітряний

export interface Dialogue {
  id: string;
  character: string; // ім'я персонажа або "Narrator"
  emotion?: string; // емоція (напр. "радісно", "сердито")
  text: string;
  duration?: number; // оцінка тривалості озвучки (секунди)
}

export interface Shot {
  id: string;
  sceneId: string;
  orderIndex: number; // порядок в сцені
  type: ShotType;
  camera?: CameraAngle;
  angle?: string; // вільний текст ракурсу
  subject?: string; // об'єкт фокусу
  lighting?: string; // світло (напр. "м'яке", "драматичне")
  prompt: string; // промпт для генерації зображення
  image?: string; // згенероване зображення URL або null
  generatedVariants?: string[]; // варіанти згенерованих зображень (3-5)
  dialogues?: Dialogue[];
  createdAt?: number;
  updatedAt?: number;
}

export interface VisualReference {
  id: string;
  entityId: string; // character або location з canon
  entityType: 'character' | 'location';
  entityName: string; // для display
  images: string[]; // URLs або base64
  loraThreshold: 3 | 15 | 20; // к-ть зображень для LoRA
  confirmed: boolean; // чи підтверджено користувачем
  createdAt?: number;
}

/**
 * Helper: estimate dialogue duration in seconds
 * Rough formula: ~150 words per minute (2.5 words per second)
 */
export function estimateDialogueDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const wordsPerSecond = 2.5;
  return Math.ceil(words / wordsPerSecond);
}

/**
 * Helper: calculate total shot duration (sum of dialogues)
 */
export function calculateShotDuration(shot: Shot): number {
  if (!shot.dialogues || shot.dialogues.length === 0) return 0;
  return shot.dialogues.reduce((sum, d) => sum + (d.duration || 0), 0);
}
