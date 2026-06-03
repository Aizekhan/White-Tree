/**
 * BookView - Книга (читання/редагування)
 * Інтеграція BookReader компонента з прототипу WhiteWrite.html
 */

import { useEffect, useState } from 'react';
import BookReader from './BookReader';
import type { IntentId } from './SceneIntentPage';

export default function BookView() {
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    console.log('[BookView] Mounted');
  }, []);

  // TODO: Отримувати projectTitle з поточного проекту
  const projectTitle = 'Попіл Орелії';

  const handleEdit = () => {
    console.log('[BookView] Edit mode requested');
    setEditMode(true);
  };

  const handleSaveEdit = (newText: string) => {
    console.log('[BookView] Saved edit:', newText);
    // TODO: Зберегти newText в project.architecture.scenes
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    console.log('[BookView] Cancelled edit');
    setEditMode(false);
  };

  const handleGenerateNextScene = (intent: IntentId, customNote?: string) => {
    console.log('[BookView] Generate next scene:', intent, customNote);
    // TODO: Викликати AI генерацію з обраним напрямом
    // TODO: Зберегти intent на сцені (для регенерації)
  };

  return (
    <BookReader
      projectTitle={projectTitle}
      editMode={editMode}
      onEdit={handleEdit}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onGenerateNextScene={handleGenerateNextScene}
    />
  );
}
