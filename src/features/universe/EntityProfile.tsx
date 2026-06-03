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
function LocationProfile({
  entity,
  editMode,
  onSave,
}: {
  entity: CanonLocation;
  editMode: boolean;
  onSave: (updates: Partial<CanonLocation>) => void;
}) {
  const handleFieldSave = (field: keyof CanonLocation, value: string) => {
    if (field === 'atmos') {
      // Parse comma-separated string to array
      const atmosArray = value.split(',').map((s) => s.trim()).filter(Boolean);
      onSave({ atmos: atmosArray });
    } else {
      onSave({ [field]: value });
    }
  };

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
        <div className="dblk">
          <div className="blk-h">
            <MapPin />
            Опис
          </div>
          <EditableField
            value={entity.desc || ''}
            onSave={(v) => handleFieldSave('desc', v)}
            placeholder="Додати опис локації..."
            editMode={editMode}
            multiline
          />
        </div>

        {/* Atmosphere */}
        <div className="dblk">
          <div className="blk-h">
            <Zap />
            Атмосфера
          </div>
          <EditableField
            value={entity.atmos?.join(', ') || ''}
            onSave={(v) => handleFieldSave('atmos', v)}
            placeholder="Додати атмосферу (через кому)..."
            editMode={editMode}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Event profile
 */
function EventProfile({
  entity,
  editMode,
  onSave,
}: {
  entity: CanonEvent;
  editMode: boolean;
  onSave: (updates: Partial<CanonEvent>) => void;
}) {
  const handleFieldSave = (field: keyof CanonEvent, value: string) => {
    if (field === 'act') {
      // Parse act as number
      const actNum = parseInt(value, 10);
      if (!isNaN(actNum)) {
        onSave({ act: actNum });
      }
    } else {
      onSave({ [field]: value });
    }
  };

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
        <div className="dblk">
          <div className="blk-h">
            <Calendar />
            Коли
          </div>
          <EditableField
            value={entity.when || ''}
            onSave={(v) => handleFieldSave('when', v)}
            placeholder="Додати часовий маркер..."
            editMode={editMode}
          />
        </div>

        {/* Act */}
        <div className="dblk">
          <div className="blk-h">
            <Zap />
            Акт
          </div>
          <EditableField
            value={entity.act?.toString() || ''}
            onSave={(v) => handleFieldSave('act', v)}
            placeholder="Номер акту..."
            editMode={editMode}
          />
        </div>

        {/* Description */}
        <div className="dblk">
          <div className="blk-h">
            <Calendar />
            Опис
          </div>
          <EditableField
            value={entity.desc || ''}
            onSave={(v) => handleFieldSave('desc', v)}
            placeholder="Додати опис події..."
            editMode={editMode}
            multiline
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Faction profile
 */
function FactionProfile({
  entity,
  editMode,
  onSave,
}: {
  entity: CanonFaction;
  editMode: boolean;
  onSave: (updates: Partial<CanonFaction>) => void;
}) {
  const handleFieldSave = (field: keyof CanonFaction, value: string) => {
    onSave({ [field]: value });
  };

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
        <div className="dblk">
          <div className="blk-h">
            <UsersIcon />
            Девіз
          </div>
          <EditableField
            value={entity.motto || ''}
            onSave={(v) => handleFieldSave('motto', v)}
            placeholder="Додати девіз фракції..."
            editMode={editMode}
          />
        </div>

        {/* Alignment */}
        <div className="dblk">
          <div className="blk-h">
            <Zap />
            Вирівнювання
          </div>
          <EditableField
            value={entity.align || ''}
            onSave={(v) => handleFieldSave('align', v)}
            placeholder="Додати моральне вирівнювання..."
            editMode={editMode}
          />
        </div>

        {/* Description */}
        <div className="dblk">
          <div className="blk-h">
            <UsersIcon />
            Опис
          </div>
          <EditableField
            value={entity.desc || ''}
            onSave={(v) => handleFieldSave('desc', v)}
            placeholder="Додати опис фракції..."
            editMode={editMode}
            multiline
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Artifact profile
 */
function ArtifactProfile({
  entity,
  editMode,
  onSave,
}: {
  entity: CanonArtifact;
  editMode: boolean;
  onSave: (updates: Partial<CanonArtifact>) => void;
}) {
  const handleFieldSave = (field: keyof CanonArtifact, value: string) => {
    onSave({ [field]: value });
  };

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
        <div className="dblk">
          <div className="blk-h">
            <Package />
            Рідкість
          </div>
          <EditableField
            value={entity.rarity || ''}
            onSave={(v) => handleFieldSave('rarity', v)}
            placeholder="Додати рідкість..."
            editMode={editMode}
          />
        </div>

        {/* Owner */}
        <div className="dblk">
          <div className="blk-h">
            <UsersIcon />
            Власник
          </div>
          <EditableField
            value={entity.owner || ''}
            onSave={(v) => handleFieldSave('owner', v)}
            placeholder="Додати власника..."
            editMode={editMode}
          />
        </div>

        {/* Description */}
        <div className="dblk">
          <div className="blk-h">
            <Package />
            Опис
          </div>
          <EditableField
            value={entity.desc || ''}
            onSave={(v) => handleFieldSave('desc', v)}
            placeholder="Додати опис артефакту..."
            editMode={editMode}
            multiline
          />
        </div>
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
            return (
              <LocationProfile
                entity={entity as CanonLocation}
                editMode={editMode}
                onSave={handleSave}
              />
            );
          case 'events':
            return (
              <EventProfile
                entity={entity as CanonEvent}
                editMode={editMode}
                onSave={handleSave}
              />
            );
          case 'factions':
            return (
              <FactionProfile
                entity={entity as CanonFaction}
                editMode={editMode}
                onSave={handleSave}
              />
            );
          case 'artifacts':
            return (
              <ArtifactProfile
                entity={entity as CanonArtifact}
                editMode={editMode}
                onSave={handleSave}
              />
            );
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
