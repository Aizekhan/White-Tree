/**
 * BookView - Книга (читання/редагування)
 * Інтеграція BookReader компонента з прототипу WhiteWrite.html
 */

import { useEffect, useState } from 'react';
import BookReader from './BookReader';

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
    // TODO: Відкрити SceneEditor з Guardian Dialog (EDIT→CANON flow)
  };

  return <BookReader projectTitle={projectTitle} onEdit={handleEdit} />;
}
