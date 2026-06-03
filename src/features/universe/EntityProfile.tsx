/**
 * EntityProfile - деталі обраної сутності канону
 * Відображається в правому aside панелі
 */

import { useState } from 'react';
import { Target, Heart, Zap, Users as UsersIcon, MapPin, Calendar, Package, Edit3, Save, X } from 'lucide-react';
import type { CanonEntityDisplay } from './useUniverseCanon';
import type {
  CanonCharacter,
  CanonLocation,
  CanonEvent,
  CanonFaction,
  CanonArtifact,
} from '../../canon/canonTypes';
import type { UniverseCategory } from './UniverseView';
import EditableField from './EditableField';

interface EntityProfileProps {
  entity: CanonEntityDisplay;
  category: UniverseCategory;
  editMode: boolean;
  onToggleEdit: () => void;
  onSave: (entityId: string, updates: Partial<CanonEntityDisplay>) => void;
  onClose?: () => void;
}

/**
 * Character profile
 */
function CharacterProfile({
  entity,
  editMode,
  onSave,
}: {
  entity: CanonCharacter;
  editMode: boolean;
  onSave: (updates: Partial<CanonCharacter>) => void;
}) {
  const handleFieldSave = (field: keyof CanonCharacter, value: string) => {
    onSave({ [field]: value });
  };

  return (
    <div className="profile">
      <div className="profile__hero">
        <div className="profile__img" />
        <div className="profile__scrim" />
        <div className="profile__cap">
          <div className="profile__k">ПЕРСОНАЖ</div>
          <h2 className="profile__title">{entity.name}</h2>
        </div>
      </div>

      <div className="profile__body">
        {/* Role */}
        <div className="dblk">
          <div className="blk-h">
            <UsersIcon />
            Роль
          </div>
          <EditableField
            value={entity.role || ''}
            onSave={(v) => handleFieldSave('role', v)}
            placeholder="Додати роль..."
            editMode={editMode}
          />
        </div>

        {/* Trait */}
        <div className="dblk">
          <div className="blk-h">
            <Zap />
            Риса характеру
          </div>
          <EditableField
            value={entity.trait || ''}
            onSave={(v) => handleFieldSave('trait', v)}
            placeholder="Додати рису характеру..."
            editMode={editMode}
          />
        </div>

        {/* Goal */}
        <div className="dblk">
          <div className="blk-h">
            <Target />
            Ціль
          </div>
          <EditableField
            value={entity.goal || ''}
            onSave={(v) => handleFieldSave('goal', v)}
            placeholder="Додати ціль..."
            editMode={editMode}
            multiline
          />
        </div>

        {/* Development Arc */}
        <div className="dblk">
          <div className="blk-h">
            <Zap />
            Арка розвитку
          </div>
          <EditableField
            value={entity.developmentArc || ''}
            onSave={(v) => handleFieldSave('developmentArc', v)}
            placeholder="Додати арку розвитку..."
            editMode={editMode}
            multiline
          />
        </div>

        {/* Relations */}
        {entity.relations && entity.relations.length > 0 && (
          <div className="dblk">
            <div className="blk-h">
              <Heart />
              Зв'язки
            </div>
            <div className="dprose">
              {entity.relations.map((rel, i) => (
                <div key={i} style={{ marginTop: i > 0 ? '8px' : 0 }}>
                  <strong>{rel.kind}</strong>
                  {rel.tone && ` (${rel.tone})`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="dblk">
          <div className="blk-h">
            <Zap />
            Статус
          </div>
          <EditableField
            value={entity.status || ''}
            onSave={(v) => handleFieldSave('status', v)}
            placeholder="Додати статус..."
            editMode={editMode}
          />
        </div>

        {/* Relations - TODO: Add relations editor in future */}
        {entity.relations && entity.relations.length > 0 && (
          <div className="dblk">
            <div className="blk-h">
              <Heart />
              Зв'язки
            </div>
            <div className="dprose">
              {entity.relations.map((rel, i) => (
                <div key={i} style={{ marginTop: i > 0 ? '8px' : 0 }}>
                  <strong>{rel.kind}</strong>
                  {rel.tone && ` (${rel.tone})`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Location profile
 */
function LocationProfile({ entity }: { entity: CanonLocation }) {
  return (
    <div className="profile">
      <div className="profile__hero">
        <div className="profile__img" />
        <div className="profile__scrim" />
        <div className="profile__cap">
          <div className="profile__k">ЛОКАЦІЯ</div>
          <h2 className="profile__title">{entity.name}</h2>
        </div>
      </div>

      <div className="profile__body">
        {/* Description */}
        {entity.desc && (
          <div className="dblk">
            <div className="blk-h">
              <MapPin />
              Опис
            </div>
            <div className="dprose">{entity.desc}</div>
          </div>
        )}

        {/* Atmosphere */}
        {entity.atmos && entity.atmos.length > 0 && (
          <div className="dblk">
            <div className="blk-h">
              <Zap />
              Атмосфера
            </div>
            <div className="dprose">{entity.atmos.join(', ')}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Event profile
 */
function EventProfile({ entity }: { entity: CanonEvent }) {
  return (
    <div className="profile">
      <div className="profile__hero">
        <div className="profile__img" />
        <div className="profile__scrim" />
        <div className="profile__cap">
          <div className="profile__k">ПОДІЯ</div>
          <h2 className="profile__title">{entity.name}</h2>
        </div>
      </div>

      <div className="profile__body">
        {/* When */}
        {entity.when && (
          <div className="dblk">
            <div className="blk-h">
              <Calendar />
              Коли
            </div>
            <div className="dprose">{entity.when}</div>
          </div>
        )}

        {/* Act */}
        {entity.act && (
          <div className="dblk">
            <div className="blk-h">
              <Zap />
              Акт
            </div>
            <div className="dprose">Акт {entity.act}</div>
          </div>
        )}

        {/* Description */}
        {entity.desc && (
          <div className="dblk">
            <div className="blk-h">
              <Calendar />
              Опис
            </div>
            <div className="dprose">{entity.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Faction profile
 */
function FactionProfile({ entity }: { entity: CanonFaction }) {
  return (
    <div className="profile">
      <div className="profile__hero">
        <div className="profile__img" />
        <div className="profile__scrim" />
        <div className="profile__cap">
          <div className="profile__k">ФРАКЦІЯ</div>
          <h2 className="profile__title">{entity.name}</h2>
        </div>
      </div>

      <div className="profile__body">
        {/* Motto */}
        {entity.motto && (
          <div className="dblk">
            <div className="blk-h">
              <UsersIcon />
              Девіз
            </div>
            <div className="dprose" style={{ fontStyle: 'italic' }}>
              "{entity.motto}"
            </div>
          </div>
        )}

        {/* Alignment */}
        {entity.align && (
          <div className="dblk">
            <div className="blk-h">
              <Zap />
              Вирівнювання
            </div>
            <div className="dprose">{entity.align}</div>
          </div>
        )}

        {/* Description */}
        {entity.desc && (
          <div className="dblk">
            <div className="blk-h">
              <UsersIcon />
              Опис
            </div>
            <div className="dprose">{entity.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Artifact profile
 */
function ArtifactProfile({ entity }: { entity: CanonArtifact }) {
  return (
    <div className="profile">
      <div className="profile__hero">
        <div className="profile__img" />
        <div className="profile__scrim" />
        <div className="profile__cap">
          <div className="profile__k">АРТЕФАКТ</div>
          <h2 className="profile__title">{entity.name}</h2>
        </div>
      </div>

      <div className="profile__body">
        {/* Rarity */}
        {entity.rarity && (
          <div className="dblk">
            <div className="blk-h">
              <Package />
              Рідкість
            </div>
            <div className="dprose">{entity.rarity}</div>
          </div>
        )}

        {/* Owner */}
        {entity.owner && (
          <div className="dblk">
            <div className="blk-h">
              <UsersIcon />
              Власник
            </div>
            <div className="dprose">{entity.owner}</div>
          </div>
        )}

        {/* Description */}
        {entity.desc && (
          <div className="dblk">
            <div className="blk-h">
              <Package />
              Опис
            </div>
            <div className="dprose">{entity.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Profile Header with Edit button
 */
function ProfileHeader({ editMode, onToggleEdit }: { editMode: boolean; onToggleEdit: () => void }) {
  return (
    <div className="profile__edit-bar">
      <button
        className={`profile__edit-btn ${editMode ? 'is-active' : ''}`}
        onClick={onToggleEdit}
        title={editMode ? 'Вийти з режиму редагування' : 'Редагувати'}
      >
        {editMode ? (
          <>
            <X size={16} />
            Закрити
          </>
        ) : (
          <>
            <Edit3 size={16} />
            Редагувати
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Main EntityProfile component - router based on category
 */
export default function EntityProfile({
  entity,
  category,
  editMode,
  onToggleEdit,
  onSave,
}: EntityProfileProps) {
  const handleSave = (updates: Partial<CanonEntityDisplay>) => {
    onSave(entity.id, updates);
  };

  return (
    <div>
      <ProfileHeader editMode={editMode} onToggleEdit={onToggleEdit} />
      {(() => {
        switch (category) {
          case 'characters':
            return (
              <CharacterProfile
                entity={entity as CanonCharacter}
                editMode={editMode}
                onSave={handleSave}
              />
            );
          case 'locations':
            return <LocationProfile entity={entity as CanonLocation} />;
          case 'events':
            return <EventProfile entity={entity as CanonEvent} />;
          case 'factions':
            return <FactionProfile entity={entity as CanonFaction} />;
          case 'artifacts':
            return <ArtifactProfile entity={entity as CanonArtifact} />;
          default:
            return (
              <div className="profile profile--empty">
                Оберіть сутність для перегляду деталей
              </div>
            );
        }
      })()}
    </div>
  );
}
