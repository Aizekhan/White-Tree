/**
 * RelationsEditor - inline editor for character relations
 */

import { useState } from 'react';
import { Heart, Plus, Trash2, Check, X } from 'lucide-react';

interface Relation {
  kind: string;
  tone?: string;
  targetId?: string;
}

interface RelationsEditorProps {
  relations: Relation[];
  onSave: (newRelations: Relation[]) => void;
  editMode: boolean;
}

export default function RelationsEditor({
  relations,
  onSave,
  editMode,
}: RelationsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newKind, setNewKind] = useState('');
  const [newTone, setNewTone] = useState('');

  const handleAdd = () => {
    if (!newKind.trim()) return;

    const newRelation: Relation = {
      kind: newKind.trim(),
      tone: newTone.trim() || undefined,
    };

    onSave([...relations, newRelation]);
    setNewKind('');
    setNewTone('');
    setIsAdding(false);
  };

  const handleRemove = (index: number) => {
    const updated = relations.filter((_, i) => i !== index);
    onSave(updated);
  };

  const handleCancel = () => {
    setNewKind('');
    setNewTone('');
    setIsAdding(false);
  };

  if (!editMode) {
    // Read-only view
    if (!relations || relations.length === 0) {
      return (
        <div className="dblk">
          <div className="blk-h">
            <Heart />
            Зв'язки
          </div>
          <div className="dprose" style={{ fontStyle: 'italic', opacity: 0.5 }}>
            Немає зв'язків
          </div>
        </div>
      );
    }

    return (
      <div className="dblk">
        <div className="blk-h">
          <Heart />
          Зв'язки
        </div>
        <div className="dprose">
          {relations.map((rel, i) => (
            <div key={i} style={{ marginTop: i > 0 ? '8px' : 0 }}>
              <strong>{rel.kind}</strong>
              {rel.tone && ` (${rel.tone})`}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Edit mode view
  return (
    <div className="dblk">
      <div className="blk-h">
        <Heart />
        Зв'язки
      </div>

      {/* Existing relations */}
      <div className="relations-list">
        {relations.map((rel, i) => (
          <div key={i} className="relation-item">
            <div className="relation-content">
              <strong>{rel.kind}</strong>
              {rel.tone && <span className="relation-tone"> ({rel.tone})</span>}
            </div>
            <button
              className="relation-delete"
              onClick={() => handleRemove(i)}
              title="Видалити"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {relations.length === 0 && !isAdding && (
          <div className="dprose" style={{ fontStyle: 'italic', opacity: 0.5 }}>
            Немає зв'язків
          </div>
        )}
      </div>

      {/* Add new relation */}
      {isAdding ? (
        <div className="relation-form">
          <div className="relation-form__fields">
            <input
              type="text"
              placeholder="Тип зв'язку (напр. Партнер, Ворог, Наставник)"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value)}
              className="relation-input"
              autoFocus
            />
            <input
              type="text"
              placeholder="Тон (напр. Довірливі, Напружені) - необов'язково"
              value={newTone}
              onChange={(e) => setNewTone(e.target.value)}
              className="relation-input"
            />
          </div>
          <div className="relation-form__actions">
            <button
              className="relation-btn relation-btn--save"
              onClick={handleAdd}
              disabled={!newKind.trim()}
              title="Додати"
            >
              <Check size={14} />
            </button>
            <button
              className="relation-btn relation-btn--cancel"
              onClick={handleCancel}
              title="Скасувати"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          className="relation-add-btn"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={16} />
          Додати зв'язок
        </button>
      )}
    </div>
  );
}
