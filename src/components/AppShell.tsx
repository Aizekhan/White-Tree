/**
 * AppShell - Головний шел додатку WhiteWrite
 * Джерело правди: White.html прототип
 *
 * Структура:
 * - rail (верхнє меню): лого + перемикачі стовпів/секцій + userdock
 * - stage (контент): дочірні компоненти
 */

import { ReactNode } from 'react';
import { BookOpen, Globe2, Clapperboard, Library, Brain, Compass, Menu, LogOut, ChevronLeft } from 'lucide-react';
import './AppShell.css';

/**
 * Іконки для кнопок меню
 */
const ICONS = {
  book: BookOpen,
  universe: Globe2,
  clapper: Clapperboard,
  library: Library,
  brain: Brain,
  compass: Compass,
};

/**
 * Стовпи (pillars) - режими роботи з проектом
 */
export const PILLARS = {
  book: { label: 'Книга', icon: 'book' as const },
  universe: { label: 'Всесвіт', icon: 'universe' as const },
  director: { label: 'Режисер', icon: 'clapper' as const },
} as const;

/**
 * Секції (sections) - in-shell views на головній
 */
export const SECTIONS = {
  narr: { label: 'Проекти', icon: 'library' as const },
  kb: { label: 'База знань', icon: 'brain' as const },
  market: { label: 'Маркетплейс', icon: 'compass' as const },
} as const;

export type PillarKey = keyof typeof PILLARS;
export type SectionKey = keyof typeof SECTIONS;
export type Mode = PillarKey | SectionKey | 'home' | null;

interface RailButtonProps {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
  active: boolean;
  onClick: () => void;
}

/**
 * Gilded pill button (золота кнопка меню)
 */
function RailButton({ id, label, icon, active, onClick }: RailButtonProps) {
  const Icon = ICONS[icon];

  return (
    <button
      className={`ritem ${active ? 'is-on' : ''}`}
      aria-label={label}
      onClick={onClick}
      data-id={id}
    >
      <Icon className="ritem__icon" />
      <span className="ritem__lbl">{label}</span>
    </button>
  );
}

interface AppShellProps {
  /** Поточний режим (pillar/section/home) */
  mode: Mode;
  /** Чи працюємо над проектом */
  inWork: boolean;
  /** Чи користувач залогінений */
  isAuthenticated: boolean;
  /** Токени користувача */
  tokens?: number;
  /** Аватар користувача */
  avatar?: string;
  /** Email користувача */
  userEmail?: string;
  /** Callback для зміни режиму */
  onModeChange: (mode: Mode) => void;
  /** Callback для виходу */
  onLogout?: () => void;
  /** Callback для переходу на головну */
  onGoHome?: () => void;
  /** Дочірній контент */
  children: ReactNode;
}

/**
 * AppShell - головний шел WhiteWrite
 */
export default function AppShell({
  mode,
  inWork,
  isAuthenticated,
  tokens = 0,
  avatar,
  userEmail,
  onModeChange,
  onLogout,
  onGoHome,
  children,
}: AppShellProps) {
  // Показувати кнопку collapse лише в режимі читання книги
  const showCollapse = inWork && mode === 'book';

  // Показувати кнопку "На головну" коли в роботі або не на home
  const showHomeFab = inWork || (mode && mode !== 'home');

  return (
    <div className="shell">
      {/* ========== ВЕРХНЄ МЕНЮ (rail) ========== */}
      <div className="rail">
        {/* Кнопка назад (поки не використовується) */}
        <button
          className="rail__back"
          id="backbtn"
          title="Назад"
          aria-label="Назад"
          style={{ display: 'none' }}
        >
          <ChevronLeft />
        </button>

        {/* Лого */}
        <button
          className="rail__logo"
          title="На головну"
          aria-label="На головну"
          onClick={onGoHome}
        >
          <img
            src="/assets/tree-logo.svg"
            alt="WhiteWrite"
            style={{ height: '108px', width: 'auto' }}
          />
        </button>

        {/* Назва бренду */}
        <span className="rail__brand">
          White<b>Write</b>
        </span>

        {/* Кнопка згортання (лише для книги) */}
        <button
          className="rail__collapse"
          id="rail-collapse"
          title="Сховати меню для читання"
          aria-label="Сховати меню"
          style={{ display: showCollapse ? 'grid' : 'none' }}
          onClick={() => {
            document.querySelector('.rail')?.classList.toggle('is-collapsed');
          }}
        >
          <Menu />
        </button>

        {/* Роздільник */}
        <span className="rail__div"></span>

        {/* Навігаційні кнопки */}
        <nav className="rail__items" aria-label="Навігація">
          {inWork ? (
            // Коли в проекті - показуємо PILLARS
            <>
              {Object.entries(PILLARS).map(([key, pillar]) => (
                <RailButton
                  key={key}
                  id={key}
                  label={pillar.label}
                  icon={pillar.icon}
                  active={mode === key}
                  onClick={() => onModeChange(key as PillarKey)}
                />
              ))}
            </>
          ) : (
            // Коли на головній - показуємо SECTIONS
            <>
              {Object.entries(SECTIONS).map(([key, section]) => {
                // Проекти лише для залогінених
                if (key === 'narr' && !isAuthenticated) return null;

                return (
                  <RailButton
                    key={key}
                    id={key}
                    label={section.label}
                    icon={section.icon}
                    active={mode === key}
                    onClick={() => onModeChange(key as SectionKey)}
                  />
                );
              })}
            </>
          )}
        </nav>

        {/* Правий бік (знизу-зліва в прототипі, але в rail це margin-left: auto) */}
        <div className="rail__foot">
          {/* Userdock (токени + аватар + вихід) */}
          {isAuthenticated && (
            <div className="userdock">
              {/* Токени */}
              <div className="userdock__tokens">
                <div className="userdock__tok">{tokens.toLocaleString()}</div>
                <div className="userdock__tokl">ТОКЕНІВ</div>
              </div>

              {/* Аватар */}
              <div className="userdock__av">
                {avatar ? (
                  <img src={avatar} alt="Avatar" />
                ) : (
                  <span>{userEmail?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>

              {/* Вихід */}
              {onLogout && (
                <button
                  className="userdock__logout"
                  onClick={onLogout}
                  title="Вийти"
                  aria-label="Вийти"
                >
                  <LogOut />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========== STAGE (контент) ========== */}
      <div className="stage">{children}</div>

      {/* Кнопка "На головну" (floating action button) */}
      {showHomeFab && onGoHome && (
        <button
          className="homefab"
          id="homefab"
          onClick={onGoHome}
          title="На головну"
          aria-label="На головну"
        >
          <ChevronLeft />
        </button>
      )}
    </div>
  );
}
