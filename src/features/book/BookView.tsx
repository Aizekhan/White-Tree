/**
 * BookView - Книга (читання/редагування)
 * Інтеграція BookReader компонента з прототипу WhiteWrite.html
 */

import { useEffect, useState } from 'react';
import BookReader from './BookReader';
import { useBookScenes } from './useBookScenes';
import type { IntentId } from './SceneIntentPage';

export default function BookView() {
  const [editMode, setEditMode] = useState(false);
  const { scenes, saveText, saveIntent } = useBookScenes();

  useEffect(() => {
    console.log('[BookView] Mounted');
    console.log('[BookView] Loaded scenes:', scenes.length);
  }, [scenes.length]);

  // TODO: Отримувати projectTitle з поточного проекту
  const projectTitle = scenes.length > 0 ? scenes[0].actTitle : 'Попіл Орелії';

  const handleEdit = () => {
    console.log('[BookView] Edit mode requested');
    setEditMode(true);
  };

  const handleSaveEdit = (sceneIndex: number, newText: string) => {
    console.log('[BookView] Saved edit for scene', sceneIndex, ':', newText);

    if (scenes[sceneIndex]) {
      saveText(scenes[sceneIndex], newText);
    }

    setEditMode(false);
  };

  const handleCancelEdit = () => {
    console.log('[BookView] Cancelled edit');
    setEditMode(false);
  };

  const handleGenerateNextScene = (sceneIndex: number, intent: IntentId, customNote?: string) => {
    console.log('[BookView] Generate next scene:', sceneIndex, intent, customNote);

    const intentValue = intent === 'custom' && customNote ? customNote : intent;

    if (scenes[sceneIndex]) {
      saveIntent(scenes[sceneIndex], intentValue);
    }

    // TODO: Викликати AI генерацію з обраним напрямом
  };

  return (
    <BookReader
      projectTitle={projectTitle}
      scenes={scenes}
      editMode={editMode}
      onEdit={handleEdit}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onGenerateNextScene={handleGenerateNextScene}
    />
  );
}
