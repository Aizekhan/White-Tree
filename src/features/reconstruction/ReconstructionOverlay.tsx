/**
 * ReconstructionOverlay - показує елементи що потребують оновлення після зміни canon
 * Інваріант №5: Reconstruction strategy (auto/review/pinned)
 */

import { useState } from 'react';
import { AlertTriangle, Check, Pin, Eye, X } from 'lucide-react';
import './ReconstructionOverlay.css';

export interface ReconstructionItem {
  id: string;
  type: 'scene' | 'shot' | 'dialogue';
  title: string;
  reason: string; // "Character 'Маркус' description changed"
  oldValue?: string;
  newValue?: string;
  reconStatus: 'auto' | 'review' | 'pinned';
}

interface ReconstructionOverlayProps {
  items: ReconstructionItem[];
  onApplyAll: () => void;
  onApplyOne: (itemId: string) => void;
  onPinOne: (itemId: string) => void;
  onReviewOne: (itemId: string) => void;
  onDismiss: () => void;
}

export default function ReconstructionOverlay({
  items,
  onApplyAll,
  onApplyOne,
  onPinOne,
  onReviewOne,
  onDismiss,
}: ReconstructionOverlayProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (items.length === 0) return null;

  const autoItems = items.filter((i) => i.reconStatus === 'auto');
  const reviewItems = items.filter((i) => i.reconStatus === 'review');
  const pinnedItems = items.filter((i) => i.reconStatus === 'pinned');

  return (
    <div className="reconstruction-overlay">
      <div className="reconstruction-overlay__backdrop" onClick={onDismiss} />

      <div className="reconstruction-overlay__panel">
        {/* Header */}
        <div className="reconstruction-overlay__header">
          <div className="reconstruction-overlay__icon">
            <AlertTriangle size={24} />
          </div>
          <div className="reconstruction-overlay__title-block">
            <h2 className="reconstruction-overlay__title">Реконструкція після зміни canon</h2>
            <p className="reconstruction-overlay__subtitle">
              {items.length} {items.length === 1 ? 'елемент потребує' : 'елементів потребують'} оновлення
            </p>
          </div>
          <button className="reconstruction-overlay__close" onClick={onDismiss}>
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="reconstruction-overlay__stats">
          <div className="reconstruction-overlay__stat">
            <span className="reconstruction-overlay__stat-label">Auto:</span>
            <span className="reconstruction-overlay__stat-value">{autoItems.length}</span>
          </div>
          <div className="reconstruction-overlay__stat">
            <span className="reconstruction-overlay__stat-label">Review:</span>
            <span className="reconstruction-overlay__stat-value">{reviewItems.length}</span>
          </div>
          <div className="reconstruction-overlay__stat">
            <span className="reconstruction-overlay__stat-label">Pinned:</span>
            <span className="reconstruction-overlay__stat-value">{pinnedItems.length}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="reconstruction-overlay__list">
          {items.map((item) => {
            const isExpanded = expandedItem === item.id;

            return (
              <div
                key={item.id}
                className={`reconstruction-item ${isExpanded ? 'is-expanded' : ''} reconstruction-item--${item.reconStatus}`}
              >
                {/* Header */}
                <div
                  className="reconstruction-item__header"
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                >
                  <div className="reconstruction-item__icon">
                    {item.type === 'scene' && '📝'}
                    {item.type === 'shot' && '🎬'}
                    {item.type === 'dialogue' && '💬'}
                  </div>
                  <div className="reconstruction-item__info">
                    <h3 className="reconstruction-item__title">{item.title}</h3>
                    <p className="reconstruction-item__reason">{item.reason}</p>
                  </div>
                  <div className="reconstruction-item__status">
                    {item.reconStatus === 'auto' && <span className="reconstruction-item__badge reconstruction-item__badge--auto">Auto</span>}
                    {item.reconStatus === 'review' && <span className="reconstruction-item__badge reconstruction-item__badge--review">Review</span>}
                    {item.reconStatus === 'pinned' && <span className="reconstruction-item__badge reconstruction-item__badge--pinned">Pinned</span>}
                  </div>
                </div>

                {/* Expanded Diff */}
                {isExpanded && (item.oldValue || item.newValue) && (
                  <div className="reconstruction-item__diff">
                    {item.oldValue && (
                      <div className="reconstruction-item__diff-col">
                        <div className="reconstruction-item__diff-label">Старе значення:</div>
                        <div className="reconstruction-item__diff-text reconstruction-item__diff-text--old">
                          {item.oldValue}
                        </div>
                      </div>
                    )}
                    {item.newValue && (
                      <div className="reconstruction-item__diff-col">
                        <div className="reconstruction-item__diff-label">Нове значення:</div>
                        <div className="reconstruction-item__diff-text reconstruction-item__diff-text--new">
                          {item.newValue}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {isExpanded && (
                  <div className="reconstruction-item__actions">
                    <button
                      className="reconstruction-item__btn reconstruction-item__btn--apply"
                      onClick={() => onApplyOne(item.id)}
                      title="Застосувати зміни"
                    >
                      <Check size={14} />
                      Застосувати
                    </button>
                    <button
                      className="reconstruction-item__btn reconstruction-item__btn--review"
                      onClick={() => onReviewOne(item.id)}
                      title="Переглянути вручну"
                    >
                      <Eye size={14} />
                      Переглянути
                    </button>
                    <button
                      className="reconstruction-item__btn reconstruction-item__btn--pin"
                      onClick={() => onPinOne(item.id)}
                      title="Закріпити (не змінювати)"
                    >
                      <Pin size={14} />
                      Закріпити
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="reconstruction-overlay__footer">
          <button className="reconstruction-overlay__btn reconstruction-overlay__btn--secondary" onClick={onDismiss}>
            Закрити
          </button>
          <button
            className="reconstruction-overlay__btn reconstruction-overlay__btn--primary"
            onClick={onApplyAll}
            disabled={autoItems.length === 0}
          >
            <Check size={16} />
            Застосувати всі Auto ({autoItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
