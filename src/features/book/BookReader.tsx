/**
 * BookReader - читання історії на пергаменті
 * Джерело правди: WhiteWrite.html + book.jsx + pages.jsx
 *
 * MVP: два листи (розворот), навігація стрілками, пагінація кружечками
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import SceneIntentPage, { type IntentId } from './SceneIntentPage';
import SceneEditor from './SceneEditor';
import type { BookScene } from './useBookScenes';
import './BookReader.css';
import './SceneIntentPage.css';

/**
 * Scene structure (як у book.jsx:40-56)
 */
interface Scene {
  n: number;
  title: string;
  pages: Page[];
}

interface Page {
  left: React.ReactNode;
  right: React.ReactNode;
  whisper?: string; // Підказка Хранителя (поки не використовується)
}

/**
 * Folio - номер сторінки (як у pages.jsx:35-37)
 */
function Folio({ n }: { n: string }) {
  return <div className="folio">{n}</div>;
}

/**
 * PageHeader - заголовок сторінки (як у pages.jsx:25-32)
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
 * Prose - текст з drop-cap (як у pages.jsx:4-12)
 */
function Prose({ first, children }: { first?: string; children: React.ReactNode }) {
  return (
    <p className="prose">
      {first && <span className="prose__cap">{first}</span>}
      {children}
    </p>
  );
}

/**
 * TitlePage - титульна сторінка (як у pages.jsx:42-55)
 */
function TitlePage({ title }: { title: string }) {
  return (
    <div className="page-inner page-title">
      <div className="title-mark">✶</div>
      <div className="title-kicker">Книга перша</div>
      <h1 className="title-name">{title}</h1>
      <div className="title-sub">всесвіт, що дихає у темряві бібліотеки</div>
      <div className="title-orn">· ✦ ·</div>
      <p className="title-epigraph">
        «Коли згасне остання зоря, хтось мусить пам'ятати, якою була ніч до неї.»
      </p>
      <Folio n="i" />
    </div>
  );
}

/**
 * StoryOpening - початок історії (як у pages.jsx:58-75)
 */
function StoryOpening() {
  return (
    <div className="page-inner">
      <PageHeader kicker="Пролог" title="Тиша над містом" />
      <Prose first="К">
        оли впала остання зоря над Орелією, місто не закричало. Воно затихло — так
        затихає людина, що нарешті почула власне ім'я з вуст того, кого давно вважала
        мертвим.
      </Prose>
      <Prose>
        Десь під містом прокинувся голос. Він не кликав її — він просто почав рахувати від
        тисячі донизу.
      </Prose>
      <Folio n="1" />
    </div>
  );
}

/**
 * StoryContinued - продовження (як у pages.jsx:77-93)
 */
function StoryContinued() {
  return (
    <div className="page-inner">
      <PageHeader kicker="Розділ перший" title="Жертва Оракула" />
      <Prose first="О">
        ракул чекав на неї там, де закінчувалися мапи. Він пам'ятав не минуле — він
        пам'ятав уперед, і кожен спогад був раною, якої ще не сталося.
      </Prose>
      <Prose>
        «Щоб місто вдихнуло, — сказав він, — хтось має затримати подих назавжди.» Елена
        зрозуміла ціну раніше, ніж він договорив.
      </Prose>
      <Folio n="2" />
    </div>
  );
}

/**
 * Placeholder - заглушка для MVP
 */
function PlaceholderPage({ text }: { text: string }) {
  return (
    <div className="page-inner">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontStyle: 'italic',
          color: 'var(--ink-soft)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

/**
 * BookReader props
 */
interface BookReaderProps {
  projectTitle?: string;
  scenes?: BookScene[]; // Real scenes from architecture
  editMode?: boolean;
  onEdit?: () => void;
  onSaveEdit?: (sceneIndex: number, newText: string) => void;
  onCancelEdit?: () => void;
  onGenerateNextScene?: (sceneIndex: number, intent: IntentId, customNote?: string) => void;
}

/**
 * BookReader - основний компонент читання
 */
export default function BookReader({
  projectTitle = 'Попіл Орелії',
  scenes: bookScenes = [],
  editMode = false,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onGenerateNextScene,
}: BookReaderProps) {
  /**
   * Convert BookScene[] to Scene[] format for rendering
   * Each BookScene becomes one spread (2 leaves)
   */
  const realScenes = useMemo<Scene[]>(() => {
    if (bookScenes.length === 0) return [];

    // Title page (scene 0)
    const titleScene: Scene = {
      n: 0,
      title: projectTitle,
      pages: [
        {
          left: <TitlePage title={projectTitle} />,
          right: <PlaceholderPage text="Зміст (TODO)" />,
        },
      ],
    };

    // Written scenes from architecture
    const writtenScenes: Scene[] = bookScenes.map((bookScene, idx) => {
      const hasText = !!bookScene.writtenText;

      return {
        n: idx + 1,
        title: bookScene.title,
        pages: [
          {
            // Left: scene header + description or written text
            left: hasText ? (
              <div className="page-inner">
                <PageHeader kicker={`${bookScene.actTitle} · ${bookScene.chapterTitle}`} title={bookScene.title} />
                <Prose>{bookScene.writtenText}</Prose>
                <Folio n={String(idx * 2 + 1)} />
              </div>
            ) : (
              <div className="page-inner">
                <PageHeader kicker={`${bookScene.actTitle} · ${bookScene.chapterTitle}`} title={bookScene.title} />
                <Prose first={bookScene.description[0]}>{bookScene.description.slice(1)}</Prose>
                <Folio n={String(idx * 2 + 1)} />
              </div>
            ),
            // Right: continuation or placeholder
            right: <PlaceholderPage text={hasText ? "Продовження..." : "Ще не написано. Натисніть олівець для редагування."} />,
          },
        ],
      };
    });

    // Final scene: Scene Intent page
    const finalScene: Scene = {
      n: bookScenes.length + 1,
      title: 'Що далі?',
      pages: [
        {
          left: <PlaceholderPage text="Колофон (кінець відомих сторінок)" />,
          right: <SceneIntentPage sceneNumber={bookScenes.length} onGenerate={(intent, note) => onGenerateNextScene?.(bookScenes.length, intent, note)} />,
        },
      ],
    };

    return [titleScene, ...writtenScenes, finalScene];
  }, [bookScenes, projectTitle, onGenerateNextScene]);

  // Fallback to MOCK scenes if no real data
  const MOCK_SCENES: Scene[] = [
    {
      n: 1,
      title: 'Тиша над колонією',
      pages: [
        { left: <TitlePage title={projectTitle} />, right: <StoryOpening /> },
        { left: <StoryContinued />, right: <PlaceholderPage text="Продовження..." /> },
      ],
    },
    {
      n: 2,
      title: 'Перший контакт',
      pages: [{ left: <PlaceholderPage text="Сцена 2 (лівий лист)" />, right: <PlaceholderPage text="Сцена 2 (правий лист)" /> }],
    },
    {
      n: 3,
      title: 'Що далі?',
      pages: [
        {
          left: <PlaceholderPage text="Колофон (кінець відомих сторінок)" />,
          right: <SceneIntentPage sceneNumber={2} onGenerate={(intent, note) => onGenerateNextScene?.(2, intent, note)} />,
        },
      ],
    },
  ];

  // Use real scenes if available, fallback to MOCK
  const SCENES = realScenes.length > 0 ? realScenes : MOCK_SCENES;

  const [sceneIdx, setSceneIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);

  const scene = SCENES[sceneIdx];
  let spread = scene.pages[pageIdx];
  const totalPages = SCENES.reduce((sum, s) => sum + s.pages.length, 0);
  const currentPageNum = SCENES.slice(0, sceneIdx).reduce((sum, s) => sum + s.pages.length, 0) + pageIdx + 1;

  // Replace right page with SceneEditor if in edit mode
  // Real scenes: sceneIdx 1+ (skip title page at sceneIdx 0)
  // MOCK scenes: sceneIdx 0, pageIdx 1
  const isRealSceneEditable = realScenes.length > 0 && sceneIdx > 0 && sceneIdx <= bookScenes.length;
  const isMockEditable = realScenes.length === 0 && sceneIdx === 0 && pageIdx === 1;
  const isEditablePage = isRealSceneEditable || isMockEditable;

  // Get current scene for editing
  const currentBookScene = isRealSceneEditable ? bookScenes[sceneIdx - 1] : null;
  const editingSceneIndex = isRealSceneEditable ? sceneIdx - 1 : 1; // For real: sceneIdx-1, for MOCK: hardcoded 1

  const sceneText = currentBookScene?.writtenText || currentBookScene?.description || `Оракул чекав на неї там, де закінчувалися мапи. Він пам'ятав не минуле — він пам'ятав уперед, і кожен спогад був раною, якої ще не сталося.

«Щоб місто вдихнуло, — сказав він, — хтось має затримати подих назавжди.» Елена зрозуміла ціну раніше, ніж він договорив.`;

  const sceneTitle = currentBookScene?.title || 'Жертва Оракула';
  const sceneKicker = currentBookScene
    ? `${currentBookScene.actTitle} · ${currentBookScene.chapterTitle} · чернетка`
    : 'Розділ перший · чернетка';

  if (editMode && isEditablePage && onSaveEdit && onCancelEdit) {
    spread = {
      ...spread,
      right: (
        <SceneEditor
          initialText={sceneText}
          sceneTitle={sceneTitle}
          sceneKicker={sceneKicker}
          onSave={(newText) => onSaveEdit(editingSceneIndex, newText)}
          onCancel={onCancelEdit}
        />
      ),
    };
  }

  // Persist reading position (як у book.jsx:92-95)
  useEffect(() => {
    try {
      localStorage.setItem('ww_book_scene', String(sceneIdx));
      localStorage.setItem('ww_book_page', String(pageIdx));
    } catch (e) {
      console.error('[BookReader] Failed to persist position:', e);
    }
  }, [sceneIdx, pageIdx]);

  // Restore position on mount
  useEffect(() => {
    try {
      const savedScene = localStorage.getItem('ww_book_scene');
      const savedPage = localStorage.getItem('ww_book_page');
      if (savedScene !== null) setSceneIdx(parseInt(savedScene, 10));
      if (savedPage !== null) setPageIdx(parseInt(savedPage, 10));
    } catch (e) {
      console.error('[BookReader] Failed to restore position:', e);
    }
  }, []);

  // Navigation (як у book.jsx:121-133)
  const goNext = useCallback(() => {
    if (pageIdx < scene.pages.length - 1) {
      setPageIdx(pageIdx + 1);
    } else if (sceneIdx < SCENES.length - 1) {
      setSceneIdx(sceneIdx + 1);
      setPageIdx(0);
    }
  }, [sceneIdx, pageIdx, scene.pages.length, SCENES.length]);

  const goPrev = useCallback(() => {
    if (pageIdx > 0) {
      setPageIdx(pageIdx - 1);
    } else if (sceneIdx > 0) {
      const prevScenePages = SCENES[sceneIdx - 1].pages.length;
      setSceneIdx(sceneIdx - 1);
      setPageIdx(prevScenePages - 1);
    }
  }, [sceneIdx, pageIdx, SCENES]);

  // Keyboard navigation (як у book.jsx:139-148)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const atFirst = sceneIdx === 0 && pageIdx === 0;
  const atLast = sceneIdx === SCENES.length - 1 && pageIdx === scene.pages.length - 1;

  return (
    <div className="book-world">
      {/* Background atmosphere */}
      <div className="book-ambient" />
      <div className="book-vignette" />

      {/* Book stage */}
      <div className="book-stage">
        <div className="book">
          {/* Spine */}
          <div className="book__spine" />

          {/* Left leaf */}
          <div className="leaf leaf--left">{spread.left}</div>

          {/* Right leaf */}
          <div className="leaf leaf--right">{spread.right}</div>
        </div>
      </div>

      {/* Navigation arrows (як у прототипі - кутові кнопки) */}
      {!atFirst && (
        <button className="book-nav book-nav--prev" onClick={goPrev} aria-label="Попередня сторінка">
          <ChevronLeft />
        </button>
      )}
      {!atLast && (
        <button className="book-nav book-nav--next" onClick={goNext} aria-label="Наступна сторінка">
          <ChevronRight />
        </button>
      )}

      {/* Pagination dots (кружечки з номерами) */}
      <div className="book-pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`book-page-dot ${i + 1 === currentPageNum ? 'is-active' : ''}`}
            onClick={() => {
              // Calculate scene + page from absolute page number
              let targetScene = 0;
              let targetPage = i;
              for (let s = 0; s < SCENES.length; s++) {
                if (targetPage < SCENES[s].pages.length) {
                  targetScene = s;
                  break;
                }
                targetPage -= SCENES[s].pages.length;
              }
              setSceneIdx(targetScene);
              setPageIdx(targetPage);
            }}
            aria-label={`Сторінка ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Edit button (олівець, як у прототипі) */}
      {onEdit && (
        <button className="book-edit-btn" onClick={onEdit} aria-label="Редагувати">
          <Edit3 />
        </button>
      )}
    </div>
  );
}
