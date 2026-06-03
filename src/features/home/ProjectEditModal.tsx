/**
 * ProjectEditModal - модалка редагування проєкту
 * Еталон: White.html proj-edit modal
 */

import { useState } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import type { Project } from '../../types';
import './ProjectEditModal.css';

interface ProjectEditModalProps {
  project: Project;
  onSave: (updates: Partial<Project>) => void;
  onClose: () => void;
}

export default function ProjectEditModal({ project, onSave, onClose }: ProjectEditModalProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [language, setLanguage] = useState<'UA' | 'ENG'>(project.language);
  // TODO: Add when fields exist in Project type
  // const [genre, setGenre] = useState(project.genre || '');
  // const [scope, setScope] = useState(project.scope || '');
  // const [cover, setCover] = useState(project.cover || '');

  const handleSave = () => {
    onSave({
      title,
      description,
      language,
      // TODO: Add genre, scope when fields exist
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleCoverUpload = () => {
    // TODO: Implement file upload
    alert('📷 Завантаження обкладинки\n\n// TODO: File upload integration');
  };

  const handleCoverRemove = () => {
    // TODO: Remove cover
    alert('🗑 Видалення обкладинки\n\n// TODO: Remove cover logic');
  };

  return (
    <div className="project-edit-modal-overlay" onClick={onClose}>
      <div className="project-edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="project-edit-modal__header">
          <h2 className="project-edit-modal__title">Редагувати проєкт</h2>
          <button className="project-edit-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="project-edit-modal__body">
          {/* Cover */}
          <div className="project-edit-modal__field">
            <label className="project-edit-modal__label">Обкладинка</label>
            <div className="project-edit-modal__cover">
              <div className="project-edit-modal__cover-preview">
                {/* TODO: Show project.cover when field exists */}
                <div className="project-edit-modal__cover-fallback">
                  <div className="project-edit-modal__cover-icon">📖</div>
                </div>
              </div>
              <div className="project-edit-modal__cover-actions">
                <button className="project-edit-modal__cover-btn" onClick={handleCoverUpload}>
                  <Upload size={14} />
                  Завантажити
                </button>
                <button className="project-edit-modal__cover-btn project-edit-modal__cover-btn--danger" onClick={handleCoverRemove}>
                  <Trash2 size={14} />
                  Прибрати
                </button>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="project-edit-modal__field">
            <label className="project-edit-modal__label">Назва *</label>
            <input
              type="text"
              className="project-edit-modal__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Назва проєкту"
            />
          </div>

          {/* Description */}
          <div className="project-edit-modal__field">
            <label className="project-edit-modal__label">Опис</label>
            <textarea
              className="project-edit-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткий опис проєкту..."
              rows={3}
            />
          </div>

          {/* Language */}
          <div className="project-edit-modal__field">
            <label className="project-edit-modal__label">Мова</label>
            <select
              className="project-edit-modal__select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'UA' | 'ENG')}
            >
              <option value="UA">Українська</option>
              <option value="ENG">English</option>
            </select>
          </div>

          {/* TODO: Add Genre */}
          <div className="project-edit-modal__field">
            <label className="project-edit-modal__label">Жанр</label>
            <input
              type="text"
              className="project-edit-modal__input"
              placeholder="Фентезі, Sci-Fi, Детектив..."
              disabled
              title="TODO: Add genre field to Project type"
            />
            <span className="project-edit-modal__hint">// TODO: Add genre field</span>
          </div>

          {/* TODO: Add Scope */}
          <div className="project-edit-modal__field">
            <label className="project-edit-modal__label">Обсяг</label>
            <select className="project-edit-modal__select" disabled title="TODO: Add scope field">
              <option>Оповідання</option>
              <option>Повість</option>
              <option>Роман</option>
              <option>Серіал</option>
            </select>
            <span className="project-edit-modal__hint">// TODO: Add scope field</span>
          </div>
        </div>

        {/* Footer */}
        <div className="project-edit-modal__footer">
          <button className="project-edit-modal__btn project-edit-modal__btn--secondary" onClick={onClose}>
            Скасувати
          </button>
          <button
            className="project-edit-modal__btn project-edit-modal__btn--primary"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Save size={16} />
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}
