/**
 * VisualCanon - візуальні референси для персонажів та локацій
 * LoRA thresholds: 3, 15, 20 images
 */

import { useState } from 'react';
import { Upload, Sparkles, Trash2 } from 'lucide-react';

export default function VisualCanon() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // TODO: Fetch from real canon (characters + locations)
  const entities = [
    { id: 'char_1', name: 'Маркус Чен', type: 'character' },
    { id: 'char_2', name: 'Елена Родрігес', type: 'character' },
    { id: 'loc_1', name: 'Лабораторія', type: 'location' },
  ];

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
            <div className="visual-canon__entity-count">0 / 3</div>
          </div>
        ))}
      </div>

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
