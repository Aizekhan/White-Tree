/**
 * ShotEditor - modal for creating/editing shots
 */

import { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import type { Shot, ShotType, CameraAngle, Dialogue } from './directorTypes';
import DialogueEditor from './DialogueEditor';
import { useStoryStore } from '../../store/useStoryStore';

interface ShotEditorProps {
  shot: Shot | null; // null = create new
  sceneId: string;
  onSave: (shot: Partial<Shot>) => void;
  onClose: () => void;
}

const SHOT_TYPES: { value: ShotType; label: string }[] = [
  { value: 'establishing', label: 'Встановлюючий' },
  { value: 'wide', label: 'Загальний план' },
  { value: 'medium', label: 'Середній план' },
  { value: 'close-up', label: 'Крупний план' },
  { value: 'extreme-close-up', label: 'Екстра крупний' },
  { value: 'pov', label: 'POV (погляд персонажа)' },
  { value: 'over-shoulder', label: 'Через плече' },
  { value: 'two-shot', label: 'Два персонажі' },
  { value: 'insert', label: 'Вставка (деталь)' },
];

const CAMERA_ANGLES: { value: CameraAngle; label: string }[] = [
  { value: 'eye-level', label: 'На рівні очей' },
  { value: 'high', label: 'Зверху' },
  { value: 'low', label: 'Знизу' },
  { value: 'birds-eye', label: 'Пташиний зір' },
  { value: 'dutch', label: 'Голландський (нахил)' },
  { value: 'aerial', label: 'Повітряний' },
];

export default function ShotEditor({ shot, sceneId, onSave, onClose }: ShotEditorProps) {
  const { currentProject } = useStoryStore();
  const [type, setType] = useState<ShotType>(shot?.type || 'wide');
  const [camera, setCamera] = useState<CameraAngle | undefined>(shot?.camera);
  const [angle, setAngle] = useState(shot?.angle || '');
  const [subject, setSubject] = useState(shot?.subject || '');
  const [lighting, setLighting] = useState(shot?.lighting || '');
  const [prompt, setPrompt] = useState(shot?.prompt || '');
  const [dialogues, setDialogues] = useState<Dialogue[]>(shot?.dialogues || []);

  // Get characters from canon for dialogue dropdown
  const characters = currentProject?.canon?.characters?.map((c) => c.name) || [];

  const handleSave = () => {
    const updatedShot: Partial<Shot> = {
      id: shot?.id || `shot_${Date.now()}`,
      sceneId,
      type,
      camera,
      angle: angle || undefined,
      subject: subject || undefined,
      lighting: lighting || undefined,
      prompt,
      dialogues: dialogues.length > 0 ? dialogues : undefined,
      orderIndex: shot?.orderIndex ?? 0, // TODO: calculate proper order
      updatedAt: Date.now(),
    };

    if (!shot) {
      updatedShot.createdAt = Date.now();
    }

    onSave(updatedShot);
    onClose();
  };

  const handleGenerate = () => {
    // TODO: Call AI to generate image
    alert('🎨 AI малює кадр...\n\nСимуляція: 3-5 варіантів буде згенеровано.\n\n// TODO: Real AI за AI_CONTRACTS.md §6');
  };

  return (
    <div className="shot-editor-overlay" onClick={onClose}>
      <div className="shot-editor" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="shot-editor__header">
          <h2 className="shot-editor__title">
            {shot ? 'Редагувати кадр' : 'Новий кадр'}
          </h2>
          <button className="shot-editor__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="shot-editor__body">
          {/* Type */}
          <div className="shot-editor__field">
            <label className="shot-editor__label">Тип кадру *</label>
            <select
              className="shot-editor__select"
              value={type}
              onChange={(e) => setType(e.target.value as ShotType)}
            >
              {SHOT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Angle */}
          <div className="shot-editor__field">
            <label className="shot-editor__label">Кут камери</label>
            <select
              className="shot-editor__select"
              value={camera || ''}
              onChange={(e) => setCamera(e.target.value as CameraAngle | undefined)}
            >
              <option value="">— Оберіть —</option>
              {CAMERA_ANGLES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Angle (free text) */}
          <div className="shot-editor__field">
            <label className="shot-editor__label">Ракурс (вільний текст)</label>
            <input
              type="text"
              className="shot-editor__input"
              placeholder="напр. з боку, знизу-зліва"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className="shot-editor__field">
            <label className="shot-editor__label">Об'єкт фокусу</label>
            <input
              type="text"
              className="shot-editor__input"
              placeholder="напр. Маркус за комп'ютером"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Lighting */}
          <div className="shot-editor__field">
            <label className="shot-editor__label">Світло</label>
            <input
              type="text"
              className="shot-editor__input"
              placeholder="напр. м'яке, драматичне, неонове"
              value={lighting}
              onChange={(e) => setLighting(e.target.value)}
            />
          </div>

          {/* Prompt */}
          <div className="shot-editor__field">
            <label className="shot-editor__label">Промпт для генерації *</label>
            <textarea
              className="shot-editor__textarea"
              placeholder="Опис кадру для AI генерації зображення..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* Dialogues */}
          <div className="shot-editor__field">
            <DialogueEditor
              dialogues={dialogues}
              characters={characters}
              onChange={setDialogues}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shot-editor__footer">
          <button className="shot-editor__btn shot-editor__btn--secondary" onClick={onClose}>
            Скасувати
          </button>
          <button
            className="shot-editor__btn shot-editor__btn--generate"
            onClick={handleGenerate}
            disabled={!prompt.trim()}
          >
            <ImageIcon size={16} />
            Намалювати
          </button>
          <button
            className="shot-editor__btn shot-editor__btn--primary"
            onClick={handleSave}
            disabled={!prompt.trim()}
          >
            <Save size={16} />
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}
