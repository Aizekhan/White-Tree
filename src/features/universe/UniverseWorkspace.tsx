/**
 * UniverseWorkspace - workspace для категорій (персонажі/локації/події)
 * Джерело правди: WhiteWrite WorldTree.html ws-* classes
 *
 * Integration: Real data from project.canon + Entity selection + Profile panel
 * TODO: filters, graph, edit mode (next session)
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Calendar, Users, Package } from 'lucide-react';
import type { UniverseCategory } from './UniverseView';
import { useUniverseCanon, type CanonEntityDisplay } from './useUniverseCanon';
import type { CanonCharacter, CanonLocation, CanonEvent, CanonFaction, CanonArtifact } from '../../canon/canonTypes';
import EntityProfile from './EntityProfile';

interface UniverseWorkspaceProps {
  category: UniverseCategory;
  onCategoryChange: (category: UniverseCategory) => void;
  onBack: () => void;
}

const CATEGORY_INFO = {
  characters: { icon: User, label: 'Персонажі', kicker: 'CHARACTERS' },
  locations: { icon: MapPin, label: 'Локації', kicker: 'LOCATIONS' },
  events: { icon: Calendar, label: 'Події', kicker: 'EVENTS' },
  factions: { icon: Users, label: 'Фракції', kicker: 'FACTIONS' },
  artifacts: { icon: Package, label: 'Артефакти', kicker: 'ARTIFACTS' },
};

// MOCK data (fallback if no canon)
const MOCK_CHARACTERS = [
  { id: 'marcus', name: 'Маркус Чен', role: 'Головний герой', motivation: 'Знайти сигнал...' },
  { id: 'elena', name: 'Елена Родрігес', role: 'Інженерка', motivation: 'Полагодити ретранслятори...' },
  { id: 'orion', name: 'Голос «Оріон»', role: 'Антагоніст', motivation: 'Веде відлік...' },
];

/**
 * Get card icon based on entity type
 */
function getEntityIcon(category: UniverseCategory) {
  switch (category) {
    case 'characters': return User;
    case 'locations': return MapPin;
    case 'events': return Calendar;
    case 'factions': return Users;
    case 'artifacts': return Package;
    default: return User;
  }
}

/**
 * Get card subtitle based on entity type
 */
function getEntitySubtitle(entity: CanonEntityDisplay, category: UniverseCategory): string {
  switch (category) {
    case 'characters':
      return (entity as CanonCharacter).role || 'Персонаж';
    case 'locations':
      return (entity as CanonLocation).atmos?.[0] || 'Локація';
    case 'events':
      return (entity as CanonEvent).when || 'Подія';
    case 'factions':
      return (entity as CanonFaction).motto || 'Фракція';
    case 'artifacts':
      return (entity as CanonArtifact).rarity || 'Артефакт';
    default:
      return '';
  }
}

/**
 * Get card description based on entity type
 */
function getEntityDescription(entity: CanonEntityDisplay, category: UniverseCategory): string {
  switch (category) {
    case 'characters':
      return (entity as CanonCharacter).goal || (entity as CanonCharacter).trait || '';
    case 'locations':
      return (entity as CanonLocation).desc || '';
    case 'events':
      return (entity as CanonEvent).desc || '';
    case 'factions':
      return (entity as CanonFaction).desc || '';
    case 'artifacts':
      return (entity as CanonArtifact).desc || '';
    default:
      return '';
  }
}

export default function UniverseWorkspace({
  category,
  onCategoryChange,
  onBack,
}: UniverseWorkspaceProps) {
  const info = CATEGORY_INFO[category];
  const Icon = info.icon;
  const CardIcon = getEntityIcon(category);

  const { getEntities, getCount, hasCanon } = useUniverseCanon();

  // Selection state
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Clear selection when category changes
  useEffect(() => {
    setSelectedEntityId(null);
  }, [category]);

  // Use real canon data if available, otherwise fallback to MOCK
  const realEntities = getEntities(category);
  const entities = hasCanon && realEntities.length > 0
    ? realEntities
    : (category === 'characters' ? MOCK_CHARACTERS : []);

  const count = hasCanon ? getCount(category) : entities.length;

  // Find selected entity
  const selectedEntity = selectedEntityId
    ? entities.find((e) => e.id === selectedEntityId)
    : null;

  // Handle entity click
  const handleEntityClick = (entityId: string) => {
    setSelectedEntityId(entityId);
  };

  return (
    <div className="ws">
      {/* Header */}
      <div className="ws-head">
        <button className="ws-back" onClick={onBack}>
          <ArrowLeft />
          Назад до дерева
        </button>

        <div className="ws-head__ring" style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: '10px', background: 'var(--gold-soft)', border: '1px solid rgba(217,119,6,0.4)', color: 'var(--gold-lit)' }}>
          <Icon size={20} />
        </div>

        <div className="ws-head__id">
          <div className="ws-head__k">{info.kicker}</div>
          <h1 className="ws-head__title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--tx-hi)' }}>
            {info.label}
          </h1>
        </div>

        <div className="ws-head__sp" />

        <div className="ws-count">{count} items</div>
      </div>

      {/* Split: Main + Aside */}
      <div className="ws-split">
        {/* Main */}
        <div className="ws-main">
          {entities.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--tx-mid)', fontStyle: 'italic' }}>
              Ще немає {info.label.toLowerCase()} в канону
            </div>
          ) : (
            <div className="wcards">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className={`wcard ${selectedEntityId === entity.id ? 'is-active' : ''}`}
                  onClick={() => handleEntityClick(entity.id)}
                >
                  <div className="wcard__media">
                    <div className="wcard__scrim" />
                    <div className="wcard__ic">
                      <CardIcon size={17} />
                    </div>
                  </div>
                  <div className="wcard__b">
                    <div className="wcard__row">
                      <div>
                        <div className="ent-name">{entity.name}</div>
                        <div className="ent-sub">{getEntitySubtitle(entity, category)}</div>
                      </div>
                    </div>
                    <div className="wcard__blurb">{getEntityDescription(entity, category)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aside (Profile) */}
        <div className="ws-aside">
          {selectedEntity ? (
            <EntityProfile entity={selectedEntity} category={category} />
          ) : (
            <div className="profile profile--empty">
              Оберіть сутність для перегляду деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
