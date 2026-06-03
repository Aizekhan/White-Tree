/**
 * VisualCanon - візуальні референси для персонажів та локацій
 * LoRA thresholds: 3, 15, 20 images
 */

import { useState, useMemo } from 'react';
import { Upload, Sparkles, Trash2 } from 'lucide-react';
import { useStoryStore } from '../../store/useStoryStore';

export default function VisualCanon() {
  const { currentProject } = useStoryStore();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Get entities from real canon (characters + locations)
  const entities = useMemo(() => {
    if (!currentProject?.canon) return [];

    const result: Array<{ id: string; name: string; type: 'character' | 'location'; refCount: number }> = [];

    // Add characters
    if (currentProject.canon.characters) {
      currentProject.canon.characters.forEach((char) => {
        result.push({
          id: char.id,
          name: char.name,
          type: 'character',
          refCount: 0, // TODO: count visual references when added
        });
      });
    }

    // Add locations
    if (currentProject.canon.locations) {
      currentProject.canon.locations.forEach((loc) => {
        result.push({
          id: loc.id,
          name: loc.name,
          type: 'location',
          refCount: 0, // TODO: count visual references when added
        });
      });
    }

    return result;
  }, [currentProject?.canon]);

  const handleGenerateReferences = () => {
    // TODO: Call AI to generate reference images
    alert('🎨 AI генерує референси...\n\nСимуляція: 3-5 варіантів буде створено.\n\n// TODO: Real AI за AI_CONTRACTS.md §6');
  };

  return (
    <div className="visual-canon">
      {/* Entity Selector */}
      <div className="visual-canon__header">
        <h2 className="visual-canon__title">Візуальні Референси</h2>
        <p className="visual-canon__desc">
          Завантажте або згенеруйте зображення для LoRA fine-tuning
        </p>
      </div>

      {/* Entity Grid */}
      {entities.length === 0 ? (
        <div className="visual-canon__empty">
          <div className="visual-canon__empty-icon">👥</div>
          <div className="visual-canon__empty-title">Немає персонажів чи локацій</div>
          <div className="visual-canon__empty-desc">
            Створіть персонажів та локації в розділі «Всесвіт» перед генерацією референсів
          </div>
        </div>
      ) : (
        <div className="visual-canon__grid">
          {entities.map((entity) => (
          <div
            key={entity.id}
            className={`visual-canon__entity ${selectedEntity === entity.id ? 'is-active' : ''}`}
            onClick={() => setSelectedEntity(entity.id)}
          >
            <div className="visual-canon__entity-icon">
              {entity.type === 'character' ? '👤' : '📍'}
            </div>
            <div className="visual-canon__entity-name">{entity.name}</div>
            <div className="visual-canon__entity-type">
              {entity.type === 'character' ? 'Персонаж' : 'Локація'}
            </div>
            <div className="visual-canon__entity-count">{entity.refCount} / 3</div>
          </div>
          ))}
        </div>
      )}

      {/* Reference Manager */}
      {selectedEntity && (
        <div className="visual-canon__manager">
          <div className="visual-canon__manager-header">
            <h3>Референси для {entities.find((e) => e.id === selectedEntity)?.name}</h3>
            <div className="visual-canon__thresholds">
              <span className="visual-canon__threshold">3 (мін)</span>
              <span className="visual-canon__threshold">15 (рек)</span>
              <span className="visual-canon__threshold visual-canon__threshold--gold">20 (макс)</span>
            </div>
          </div>

          <div className="visual-canon__actions">
            <button className="visual-canon__btn visual-canon__btn--generate" onClick={handleGenerateReferences}>
              <Sparkles size={16} />
              Генерувати AI
            </button>
            <button className="visual-canon__btn visual-canon__btn--upload">
              <Upload size={16} />
              Завантажити
            </button>
          </div>

          <div className="visual-canon__placeholder">
            <div className="visual-canon__placeholder-icon">🖼️</div>
            <div className="visual-canon__placeholder-text">
              Немає референсів<br />
              Згенеруйте або завантажте зображення
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
