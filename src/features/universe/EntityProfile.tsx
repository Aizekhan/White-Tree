/**
 * EntityProfile - деталі обраної сутності канону
 * Відображається в правому aside панелі
 */

import { Target, Heart, Zap, Users as UsersIcon, MapPin, Calendar, Package } from 'lucide-react';
import type { CanonEntityDisplay } from './useUniverseCanon';
import type {
  CanonCharacter,
  CanonLocation,
  CanonEvent,
  CanonFaction,
  CanonArtifact,
} from '../../canon/canonTypes';
import type { UniverseCategory } from './UniverseView';

interface EntityProfileProps {
  entity: CanonEntityDisplay;
  category: UniverseCategory;
  onClose?: () => void;
}

/**
 * Character profile
 */
function CharacterProfile({ entity }: { entity: CanonCharacter }) {
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
        {entity.role && (
          <div className="dblk">
            <div className="blk-h">
              <UsersIcon />
              Роль
            </div>
            <div className="dprose">{entity.role}</div>
          </div>
        )}

        {/* Trait */}
        {entity.trait && (
          <div className="dblk">
            <div className="blk-h">
              <Zap />
              Риса характеру
            </div>
            <div className="dprose">{entity.trait}</div>
          </div>
        )}

        {/* Goal */}
        {entity.goal && (
          <div className="dblk">
            <div className="blk-h">
              <Target />
              Ціль
            </div>
            <div className="dprose">{entity.goal}</div>
          </div>
        )}

        {/* Development Arc */}
        {entity.developmentArc && (
          <div className="dblk">
            <div className="blk-h">
              <Zap />
              Арка розвитку
            </div>
            <div className="dprose">{entity.developmentArc}</div>
          </div>
        )}

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
        {entity.status && (
          <div className="dblk">
            <div className="blk-h">
              <Zap />
              Статус
            </div>
            <div className="dprose">{entity.status}</div>
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
 * Main EntityProfile component - router based on category
 */
export default function EntityProfile({ entity, category }: EntityProfileProps) {
  switch (category) {
    case 'characters':
      return <CharacterProfile entity={entity as CanonCharacter} />;
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
}
