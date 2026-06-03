/**
 * Storyboarding - розкадровка сцени
 * Scene selector + shot cards grid + "Calculate shots" button
 */

import { useState, useMemo } from 'react';
import { ChevronDown, Calculator, Plus } from 'lucide-react';
import { useBookScenes } from '../book/useBookScenes';
import type { Shot } from './directorTypes';

// MOCK shots для демо (TODO: replace with real Firestore data)
const MOCK_SHOTS: Shot[] = [
  {
    id: 'shot_1',
    sceneId: 'scene_1',
    orderIndex: 0,
    type: 'wide',
    camera: 'eye-level',
    subject: 'Маркус в лабораторії',
    lighting: 'холодне флюоресцентне',
    prompt: 'sci-fi laboratory, lone scientist, cold fluorescent lighting, wide shot',
    image: '/placeholders/ph-shot.jpg', // placeholder
  },
  {
    id: 'shot_2',
    sceneId: 'scene_1',
    orderIndex: 1,
    type: 'close-up',
    camera: 'low',
    subject: 'Екран з сигналом',
    lighting: 'підсвітка екрана',
    prompt: 'glowing screen with mysterious signal, close-up, dramatic lighting',
    image: '/placeholders/ph-shot.jpg',
  },
];

export default function Storyboarding() {
  const { scenes, isLoading } = useBookScenes();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [showSceneDropdown, setShowSceneDropdown] = useState(false);

  // Get shots for selected scene (MOCK for now)
  const shots = useMemo(() => {
    if (!selectedSceneId) return [];
    return MOCK_SHOTS.filter((s) => s.sceneId === selectedSceneId);
  }, [selectedSceneId]);

  // Auto-select first scene
  useState(() => {
    if (scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(scenes[0].id);
    }
  });

  // Handle calculate shots (AI simulation)
  const handleCalculateShots = () => {
    // TODO: Call AI to suggest shot breakdown based on scene text
    alert('🎬 AI розраховує кадри...\n\nСимуляція: 3-5 кадрів буде згенеровано.\n\n// TODO: Real AI за AI_CONTRACTS.md §6');
  };

  const selectedScene = scenes.find((s) => s.id === selectedSceneId);

  if (isLoading) {
    return (
      <div className="storyboard-loading">
        Завантаження сцен...
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="storyboard-empty">
        <div className="storyboard-empty__icon">📝</div>
        <div className="storyboard-empty__title">Немає сцен</div>
        <div className="storyboard-empty__desc">
          Спочатку створіть сцени в розділі «Книга»
        </div>
      </div>
    );
  }

  return (
    <div className="storyboard">
      {/* Scene Selector */}
      <div className="storyboard__header">
        <div className="storyboard__scene-selector">
          <label className="storyboard__label">Сцена:</label>
          <div className="storyboard__dropdown">
            <button
              className="storyboard__dropdown-btn"
              onClick={() => setShowSceneDropdown(!showSceneDropdown)}
            >
              {selectedScene ? selectedScene.title : 'Оберіть сцену'}
              <ChevronDown size={16} />
            </button>
            {showSceneDropdown && (
              <div className="storyboard__dropdown-menu">
                {scenes.map((scene) => (
                  <button
                    key={scene.id}
                    className={`storyboard__dropdown-item ${scene.id === selectedSceneId ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedSceneId(scene.id);
                      setShowSceneDropdown(false);
                    }}
                  >
                    {scene.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="storyboard__calculate-btn"
          onClick={handleCalculateShots}
          disabled={!selectedSceneId}
        >
          <Calculator size={16} />
          Розрахувати к-ть кадрів
        </button>
      </div>

      {/* Shots Grid */}
      {selectedSceneId && (
        <div className="storyboard__content">
          {shots.length === 0 ? (
            <div className="storyboard__no-shots">
              <div className="storyboard__no-shots-icon">🎬</div>
              <div className="storyboard__no-shots-title">Немає кадрів</div>
              <div className="storyboard__no-shots-desc">
                Натисніть «Розрахувати к-ть кадрів» для AI-пропозиції<br />
                або додайте кадр вручну
              </div>
              <button className="storyboard__add-shot-btn">
                <Plus size={18} />
                Додати кадр вручну
              </button>
            </div>
          ) : (
            <div className="shots-grid">
              {shots.map((shot) => (
                <div key={shot.id} className="shot-card">
                  {/* Shot Image */}
                  <div className="shot-card__media">
                    <img
                      src={shot.image || '/placeholders/ph-shot.jpg'}
                      alt={shot.subject || 'Shot'}
                      className="shot-card__img"
                    />
                    <div className="shot-card__badge">{shot.type}</div>
                  </div>

                  {/* Shot Details */}
                  <div className="shot-card__body">
                    <div className="shot-card__field">
                      <span className="shot-card__label">Тип:</span>
                      <span className="shot-card__value">{shot.type}</span>
                    </div>
                    <div className="shot-card__field">
                      <span className="shot-card__label">Камера:</span>
                      <span className="shot-card__value">{shot.camera || '—'}</span>
                    </div>
                    <div className="shot-card__field">
                      <span className="shot-card__label">Об'єкт:</span>
                      <span className="shot-card__value">{shot.subject || '—'}</span>
                    </div>
                    <div className="shot-card__field">
                      <span className="shot-card__label">Світло:</span>
                      <span className="shot-card__value">{shot.lighting || '—'}</span>
                    </div>
                    <div className="shot-card__prompt">
                      <span className="shot-card__label">Промпт:</span>
                      <p className="shot-card__prompt-text">{shot.prompt}</p>
                    </div>
                  </div>

                  {/* Shot Actions */}
                  <div className="shot-card__actions">
                    <button className="shot-card__btn shot-card__btn--edit">
                      Редагувати
                    </button>
                    <button className="shot-card__btn shot-card__btn--draw">
                      Намалювати
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
