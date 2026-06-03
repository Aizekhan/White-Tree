/**
 * EditableField - inline editable field for entity properties
 */

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  multiline?: boolean;
  placeholder?: string;
  editMode: boolean;
}

export default function EditableField({
  value,
  onSave,
  multiline = false,
  placeholder = '',
  editMode,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync with prop changes
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = localValue.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!editMode) {
    return <div className="dprose">{value || placeholder}</div>;
  }

  if (!isEditing) {
    return (
      <div
        className="dprose dprose--editable"
        onClick={() => setIsEditing(true)}
        title="Клікни для редагування"
      >
        {value || <span className="dprose--placeholder">{placeholder}</span>}
      </div>
    );
  }

  return (
    <div className="editable-field">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="editable-field__textarea"
          rows={3}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="editable-field__input"
        />
      )}
      <div className="editable-field__actions">
        <button
          className="editable-field__btn editable-field__btn--save"
          onClick={handleSave}
          title="Зберегти (Enter)"
        >
          <Check size={14} />
        </button>
        <button
          className="editable-field__btn editable-field__btn--cancel"
          onClick={handleCancel}
          title="Скасувати (Esc)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
