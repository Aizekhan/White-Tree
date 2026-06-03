/**
 * SceneEditor - редагування сцени з Guardian Dialog
 * Джерело правди: book-edit.jsx:31-184
 *
 * Flow:
 * 1. Користувач редагує текст (contentEditable)
 * 2. Натискає "Закінчити редагування" → витягуються нові сутності
 * 3. Guardian Dialog пропонує підтвердити сутності з вибором типу
 * 4. Натискає "Додати у світ" → useCanonManagement.addXToCanon()
 *
 * MVP: MOCK entity extraction (як у прототипі)
 * TODO: Підключити реальний AI extractInlineEdit (Phase 4.5)
 */

import { useState, useRef, useEffect } from 'react';
import { useCanonManagement } from '../../hooks/useCanonManagement';
import { Character } from '../../types';
import './SceneEditor.css';

/**
 * Entity type selector
 */
const ENTITY_TYPES = ['Персонаж', 'Локація', 'Подія'] as const;
type EntityType = typeof ENTITY_TYPES[number];

/**
 * Proposed entity from Guardian
 */
interface ProposedEntity {
  name: string;
  type: EntityType;
}

/**
 * Conflict warning
 */
interface Conflict {
  message: string;
  impact: number; // 1-3 (1 = low, 3 = high)
}

/**
 * Guardian proposal
 */
interface GuardianProposal {
  news: ProposedEntity[];
  conflicts: Conflict[];
}

interface SceneEditorProps {
  initialText: string;
  sceneTitle?: string;
  sceneKicker?: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
  canonAware?: boolean;
}

/**
 * PageHeader (як у pages.jsx)
 */
function PageHeader({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <header className="page-head">
      {kicker && <div className="page-head__kicker">{kicker}</div>}
      <h2 className="page-head__title">{title}</h2>
      <div className="page-head__rule" />
    </header>
  );
}

/**
 * Folio (номер сторінки)
 */
function Folio({ n }: { n: string }) {
  return <div className="folio">{n}</div>;
}

/**
 * SceneEditor - головний компонент
 */
export default function SceneEditor({
  initialText,
  sceneTitle = 'Жертва Оракула',
  sceneKicker = 'Розділ перший · чернетка',
  onSave,
  onCancel,
  canonAware = true,
}: SceneEditorProps) {
  const [text, setText] = useState(initialText);
  const [pages, setPages] = useState<string[] | null>(null); // null = single page; array = paginated
  const [pgIdx, setPgIdx] = useState(0);
  const [proposal, setProposal] = useState<GuardianProposal | null>(null);
  const [confirmedEntities, setConfirmedEntities] = useState<string[]>([]); // Список підтверджених сутностей
  const [showCoach, setShowCoach] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  const {
    addCharacterToCanon,
    addLocationToCanon,
    addEventToCanon,
  } = useCanonManagement(canonAware);

  // Show coach tip on first edit (one-time)
  useEffect(() => {
    const hasSeenCoach = localStorage.getItem('ww_scene_editor_coach');
    if (!hasSeenCoach) {
      setShowCoach(true);
    }
  }, []);

  const dismissCoach = () => {
    setShowCoach(false);
    localStorage.setItem('ww_scene_editor_coach', 'true');
  };

  /**
   * Paginate text into chunks that fit leaf capacity
   * Джерело: book-edit.jsx:45-67
   */
  const paginate = (fullText: string, leafCapacity: number): string[] => {
    if (!probeRef.current) return [fullText];

    const probe = probeRef.current;
    const words = fullText.split(/\s+/);
    const out: string[] = [];
    let cur = '';

    for (let i = 0; i < words.length; i++) {
      const next = cur ? cur + ' ' + words[i] : words[i];
      probe.innerText = next;

      if (probe.scrollHeight > leafCapacity && cur) {
        out.push(cur);
        cur = words[i];
      } else {
        cur = next;
      }
    }

    if (cur) out.push(cur);
    return out;
  };

  /**
   * Handle finish editing → extract entities → show Guardian
   */
  const handleFinishEditing = () => {
    const editedText = editorRef.current?.innerText || text;
    setText(editedText);

    // MOCK entity extraction (MVP)
    // TODO: Replace with real AI extractInlineEdit
    const mockProposal = extractEntitiesMock(editedText, initialText);

    if (mockProposal.news.length > 0 || mockProposal.conflicts.length > 0) {
      setProposal(mockProposal);
    } else {
      // No changes detected, save directly
      onSave(editedText);
    }
  };

  /**
   * MOCK entity extraction (як у прототипі)
   * Шукає нові слова з великої літери (як імена)
   * TODO: Phase 4.5 — підключити справжній extractInlineEdit
   */
  const extractEntitiesMock = (newText: string, oldText: string): GuardianProposal => {
    // Extract capitalized words as potential entities
    const capitalizedPattern = /\b[А-ЯІЇЄҐA-Z][а-яіїєґa-z]+\b/g;
    const oldWords = new Set(oldText.match(capitalizedPattern) || []);
    const newWords = newText.match(capitalizedPattern) || [];

    const uniqueNewWords = Array.from(new Set(newWords)).filter(
      (word) => !oldWords.has(word) && word.length > 2
    );

    // Take first 5 as proposals (MVP limit)
    const news: ProposedEntity[] = uniqueNewWords.slice(0, 5).map((name) => ({
      name,
      type: 'Персонаж', // Default type
    }));

    // MOCK conflicts (для демо)
    const conflicts: Conflict[] = [];
    if (newText.includes('портал') && !oldText.includes('портал')) {
      conflicts.push({
        message: 'У canon немає магічних порталів. Це може порушити правила світу.',
        impact: 3,
      });
    }

    return { news, conflicts };
  };

  /**
   * Handle entity type change
   */
  const handleTypeChange = (index: number, newType: EntityType) => {
    if (!proposal) return;

    const updatedNews = [...proposal.news];
    updatedNews[index] = { ...updatedNews[index], type: newType };

    setProposal({ ...proposal, news: updatedNews });
  };

  /**
   * Confirm entity → add to canon
   */
  const handleConfirmEntity = (entity: ProposedEntity) => {
    switch (entity.type) {
      case 'Персонаж':
        // Create Character object with minimal data
        const char: Character = {
          name: entity.name,
          role: 'Unknown',
          trait: '',
          goal: '',
          developmentArc: '',
          status: 'Active',
        };
        addCharacterToCanon(char);
        break;

      case 'Локація':
        addLocationToCanon(entity.name);
        break;

      case 'Подія':
        addEventToCanon(entity.name);
        break;
    }

    // Add to confirmed list
    setConfirmedEntities((prev) => [...prev, entity.name]);

    // Remove from proposal
    setProposal((prev) =>
      prev
        ? {
            ...prev,
            news: prev.news.filter((e) => e.name !== entity.name),
          }
        : null
    );
  };

  /**
   * Dismiss entity proposal (keep only in text, don't add to canon)
   */
  const handleDismissEntity = (entityName: string) => {
    setProposal((prev) =>
      prev
        ? {
            ...prev,
            news: prev.news.filter((e) => e.name !== entityName),
          }
        : null
    );
  };

  /**
   * Close Guardian → save text
   */
  const handleCloseGuardian = () => {
    setProposal(null);
    onSave(text);
  };

  // Current page text (if paginated)
  const currentPageText = pages ? pages[pgIdx] : text;
  const canGoPrev = pages && pgIdx > 0;
  const canGoNext = pages && pgIdx < pages.length - 1;

  return (
    <div className="page-inner">
      {/* Page header */}
      <PageHeader kicker={sceneKicker} title={sceneTitle} />

      {/* Hint */}
      <p className="se-hint">
        <span className="se-hint__pen">✎</span>{' '}
        Редагуйте текст вільно. Після завершення Хранитель перевірить зміни.
      </p>

      {/* Editable prose */}
      <div
        ref={editorRef}
        className="se-prose"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setText(e.currentTarget.innerText)}
      >
        {currentPageText}
      </div>

      {/* Hidden probe for pagination (not used in MVP, but ready) */}
      <div
        ref={probeRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '100%',
          fontSize: 'clamp(15px, 1.6vw, 17px)',
          lineHeight: '1.75',
        }}
      />

      {/* Page navigation (if paginated) */}
      {pages && pages.length > 1 && (
        <div className="se-pages">
          <button
            className="se-pages__btn"
            onClick={() => setPgIdx((i) => i - 1)}
            disabled={!canGoPrev}
          >
            ‹
          </button>
          <div className="se-pages__cur">
            {pgIdx + 1} / {pages.length}
          </div>
          <button
            className="se-pages__btn"
            onClick={() => setPgIdx((i) => i + 1)}
            disabled={!canGoNext}
          >
            ›
          </button>
        </div>
      )}

      {/* Action buttons (top-right corner) */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(201,162,75,0.3)',
            background: 'transparent',
            color: 'var(--parch-gold-deep)',
            cursor: 'pointer',
            fontSize: 'clamp(13px, 1.3vw, 14px)',
            fontFamily: 'var(--font-book)',
          }}
        >
          Скасувати
        </button>
        <button
          onClick={handleFinishEditing}
          className="se-btn--ok"
          style={{ width: 'auto', padding: '8px 20px' }}
        >
          ✦ Закінчити редагування
        </button>
      </div>

      <Folio n="edit" />

      {/* Confirmed entities list */}
      {confirmedEntities.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            right: '20px',
            background: 'rgba(201,162,75,0.12)',
            border: '1px solid rgba(201,162,75,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
            fontSize: 'clamp(12px, 1.2vw, 13px)',
          }}
        >
          <span style={{ color: 'var(--parch-gold-deep)', fontWeight: 600 }}>
            У твоєму світі:
          </span>
          {confirmedEntities.map((name) => (
            <span
              key={name}
              style={{
                background: 'var(--parch-gold)',
                color: 'var(--ink)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              ✦ {name}
            </span>
          ))}
        </div>
      )}

      {/* Guardian Dialog */}
      {proposal && (
        <div className="se-keeper">
          <button className="se-keeper__close" onClick={handleCloseGuardian}>
            ✕
          </button>

          <h2 className="se-keeper__title">✦ Хранитель</h2>
          <p className="se-keeper__lead">
            Знайдено нові елементи в тексті. Оберіть тип і додайте у канон світу.
          </p>

          {/* New entities */}
          {proposal.news.map((entity, idx) => (
            <div key={entity.name} className="se-prop">
              <div className="se-prop__name">{entity.name}</div>

              {/* Type selector */}
              <div className="se-prop__types">
                {ENTITY_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`se-type ${entity.type === type ? 'is-on' : ''}`}
                    onClick={() => handleTypeChange(idx, type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="se-btn--ok"
                  onClick={() => handleConfirmEntity(entity)}
                  style={{ flex: 1 }}
                >
                  ✦ Додати у світ
                </button>
                <button
                  onClick={() => handleDismissEntity(entity.name)}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid rgba(201,162,75,0.3)',
                    background: 'transparent',
                    color: 'var(--parch-gold-deep)',
                    cursor: 'pointer',
                    fontSize: 'clamp(13px, 1.3vw, 15px)',
                    fontFamily: 'var(--font-book)',
                  }}
                >
                  Лишити тільки в тексті
                </button>
              </div>
            </div>
          ))}

          {/* Conflicts */}
          {proposal.conflicts.length > 0 && (
            <div className="se-conflicts">
              <h3 className="se-conflicts__title">⚠ Конфлікти з canon</h3>
              {proposal.conflicts.map((conflict, idx) => (
                <div key={idx} className="se-conflict">
                  <div className="se-conflict__msg">{conflict.message}</div>
                  <div className="se-conflict__impact">
                    Вплив: {'★'.repeat(conflict.impact)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coach tip (first-time onboarding) */}
      {showCoach && (
        <div className="se-coach">
          <h4 className="se-coach__title">✦ Підказка</h4>
          <p className="se-coach__text">
            Редагуйте текст як вам зручно. Після завершення Хранитель перевірить нові сутності та
            запропонує додати їх до світу.
          </p>
          <button className="se-coach__dismiss" onClick={dismissCoach}>
            Зрозуміло
          </button>
        </div>
      )}
    </div>
  );
}
