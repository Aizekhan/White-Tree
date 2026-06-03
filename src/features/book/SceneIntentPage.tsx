/**
 * SceneIntentPage - "Що далі?" (Story Navigation)
 * Джерело правди: pages.jsx:169-210
 *
 * Користувач обирає НАПРЯМ, не промпт
 * 7 напрямів + свій опис
 */

import { useState } from 'react';
import './SceneIntentPage.css';

/**
 * Intent options (як у pages.jsx:170-179)
 */
const INTENTS = [
  { id: 'conflict', icon: '⚔', t: 'Конфлікт', d: 'зіткнення, ставки ростуть' },
  { id: 'character', icon: '❦', t: 'Розвиток персонажа', d: 'внутрішня зміна, вибір' },
  { id: 'action', icon: '✦', t: 'Екшн', d: 'рух, погоня, небезпека' },
  { id: 'romance', icon: '♥', t: 'Романтика', d: 'близькість, тепло, напруга' },
  { id: 'world', icon: '✶', t: 'Світобудова', d: 'глибше у канон світу' },
  { id: 'twist', icon: '↯', t: 'Поворот', d: 'підрив очікувань' },
  { id: 'surprise', icon: '✷', t: 'Сюрприз від AI', d: 'довірити напрям Хранителю' },
  { id: 'custom', icon: '✎', t: 'Свій напрям', d: 'опиши, що хочеш побачити' },
] as const;

export type IntentId = typeof INTENTS[number]['id'];

interface SceneIntentPageProps {
  sceneNumber?: number;
  onGenerate?: (intent: IntentId, customNote?: string) => void;
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
 * SceneIntentPage - головний компонент
 */
export default function SceneIntentPage({ sceneNumber = 3, onGenerate }: SceneIntentPageProps) {
  const [selected, setSelected] = useState<string>('');
  const [customNote, setCustomNote] = useState('');
  const [busy, setBusy] = useState(false);

  const canGo = selected && (selected !== 'custom' || customNote.trim().length > 0);

  const handleGenerate = () => {
    if (!canGo || busy) return;

    setBusy(true);

    // TODO: Викликати AI генерацію наступної сцени
    if (onGenerate) {
      onGenerate(selected as IntentId, selected === 'custom' ? customNote : undefined);
    }

    // Симуляція генерації (поки немає реального AI)
    setTimeout(() => {
      setBusy(false);
    }, 1900);
  };

  return (
    <div className="page-inner page-intent">
      <PageHeader kicker={`Сцена ${sceneNumber} завершена`} title="Що далі?" />

      <p className="intent__lead">
        Задай напрям — або опиши свій. Хранитель напише наступну сцену, спираючись на канон.
      </p>

      {/* Select dropdown (як у pages.jsx:194-200) */}
      <label className="intent-field">
        <span className="intent-field__lbl">Напрям наступної сцени</span>
        <select
          className="intent-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="" disabled>
            Оберіть напрям…
          </option>
          {INTENTS.map((intent) => (
            <option key={intent.id} value={intent.id}>
              {intent.icon} {intent.t} — {intent.d}
            </option>
          ))}
        </select>
      </label>

      {/* Custom note (лише для "Свій напрям") */}
      {selected === 'custom' && (
        <textarea
          className="intent-note"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Напр.: Маркус знаходить лист від Олени й вирішує повернутись на станцію…"
          rows={3}
        />
      )}

      {/* Generate button */}
      <button
        className="intent-gen"
        type="button"
        onClick={handleGenerate}
        disabled={!canGo || busy}
      >
        {busy ? '✦ Хранитель пише…' : '✦ Генерувати наступну сцену'}
      </button>

      <Folio n="vi" />
    </div>
  );
}
