/**
 * DialogueEditor - edit dialogues within a shot
 */

import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { Dialogue } from './directorTypes';
import { estimateDialogueDuration } from './directorTypes';

interface DialogueEditorProps {
  dialogues: Dialogue[];
  characters: string[]; // from canon
  onChange: (dialogues: Dialogue[]) => void;
}

export default function DialogueEditor({ dialogues, characters, onChange }: DialogueEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const newDialogue: Dialogue = {
      id: `dialogue_${Date.now()}`,
      character: characters[0] || 'Narrator',
      emotion: '',
      text: '',
      duration: 0,
    };
    onChange([...dialogues, newDialogue]);
    setEditingIndex(dialogues.length);
  };

  const handleUpdate = (index: number, updates: Partial<Dialogue>) => {
    const updated = dialogues.map((d, i) => {
      if (i === index) {
        const newDialogue = { ...d, ...updates };
        // Auto-calculate duration if text changed
        if (updates.text !== undefined) {
          newDialogue.duration = estimateDialogueDuration(updates.text);
        }
        return newDialogue;
      }
      return d;
    });
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(dialogues.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const totalDuration = dialogues.reduce((sum, d) => sum + (d.duration || 0), 0);

  return (
    <div className="dialogue-editor">
      <div className="dialogue-editor__header">
        <h3 className="dialogue-editor__title">Діалоги</h3>
        <div className="dialogue-editor__duration">
          <Clock size={14} />
          <span>{totalDuration}с</span>
        </div>
      </div>

      {dialogues.length === 0 && (
        <div className="dialogue-editor__empty">
          Немає діалогів. Додайте репліку.
        </div>
      )}

      <div className="dialogue-editor__list">
        {dialogues.map((dialogue, index) => (
          <div key={dialogue.id} className="dialogue-item">
            {/* Character */}
            <div className="dialogue-item__row">
              <select
                className="dialogue-item__select"
                value={dialogue.character}
                onChange={(e) => handleUpdate(index, { character: e.target.value })}
              >
                <option value="Narrator">Narrator</option>
                {characters.map((char) => (
                  <option key={char} value={char}>
                    {char}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="dialogue-item__emotion"
                placeholder="емоція"
                value={dialogue.emotion || ''}
                onChange={(e) => handleUpdate(index, { emotion: e.target.value })}
              />

              <div className="dialogue-item__duration">
                {dialogue.duration}с
              </div>

              <button
                className="dialogue-item__remove"
                onClick={() => handleRemove(index)}
                title="Видалити"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Text */}
            <textarea
              className="dialogue-item__text"
              placeholder="Текст репліки..."
              value={dialogue.text}
              onChange={(e) => handleUpdate(index, { text: e.target.value })}
              rows={2}
            />
          </div>
        ))}
      </div>

      <button className="dialogue-editor__add-btn" onClick={handleAdd}>
        <Plus size={16} />
        Додати репліку
      </button>
    </div>
  );
}
