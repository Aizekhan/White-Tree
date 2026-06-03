/**
 * UniverseWorkspace - workspace для категорій (персонажі/локації/події)
 * Джерело правди: WhiteWrite WorldTree.html ws-* classes
 *
 * Integration: Real data from project.canon + Entity selection + Profile panel
 * TODO: filters, graph, edit mode (next session)
 */

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { ArrowLeft, User, MapPin, Calendar, Users, Package, Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useStoryStore } from '../../store/useStoryStore';

type SortOption = 'alphabetical' | 'confirmed-first' | 'inferred-first';
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

/**
 * Highlight search term in text
 */
function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function UniverseWorkspace({
  category,
  onCategoryChange,
  onBack,
}: UniverseWorkspaceProps) {
  const info = CATEGORY_INFO[category];
  const Icon = info.icon;
  const CardIcon = getEntityIcon(category);

  const { getEntities, getCount, hasCanon, canon } = useUniverseCanon();
  const { setCanon } = useStoryStore();

  // Selection state
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);

  // Clear selection, search, and exit edit mode when category changes
  useEffect(() => {
    setSelectedEntityId(null);
    setSearchQuery('');
    setEditMode(false);
  }, [category]);

  // Close category dropdown on outside click
  useEffect(() => {
    if (!showCategoryDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ws-cat-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCategoryDropdown]);

  // Close sort menu on outside click
  useEffect(() => {
    if (!showSortMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ws-sort-dropdown')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSortMenu]);

  // Use real canon data if available, otherwise fallback to MOCK
  const realEntities = getEntities(category);
  const allEntities = hasCanon && realEntities.length > 0
    ? realEntities
    : (category === 'characters' ? MOCK_CHARACTERS : []);

  // Filter and sort entities
  const entities = useMemo(() => {
    // Filter by search
    let filtered = allEntities;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = allEntities.filter((e) => e.name.toLowerCase().includes(query));
    }

    // Sort
    const sorted = [...filtered];
    switch (sortOption) {
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'confirmed-first':
        sorted.sort((a, b) => {
          const aConfirmed = a.origin?.confirmed ?? true; // MOCK entities default to true
          const bConfirmed = b.origin?.confirmed ?? true;
          if (aConfirmed === bConfirmed) return a.name.localeCompare(b.name);
          return aConfirmed ? -1 : 1;
        });
        break;
      case 'inferred-first':
        sorted.sort((a, b) => {
          const aConfirmed = a.origin?.confirmed ?? true;
          const bConfirmed = b.origin?.confirmed ?? true;
          if (aConfirmed === bConfirmed) return a.name.localeCompare(b.name);
          return aConfirmed ? 1 : -1;
        });
        break;
    }

    return sorted;
  }, [allEntities, searchQuery, sortOption]);

  const count = hasCanon ? getCount(category) : allEntities.length;
  const filteredCount = entities.length;

  // Find selected entity
  const selectedEntity = selectedEntityId
    ? entities.find((e) => e.id === selectedEntityId)
    : null;

  // Handle entity click
  const handleEntityClick = (entityId: string) => {
    setSelectedEntityId(entityId);
    setEditMode(false); // Exit edit mode when selecting new entity
  };

  // Handle edit mode toggle
  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
  };

  // Handle entity save
  const handleSaveEntity = (entityId: string, updates: Partial<CanonEntityDisplay>) => {
    if (!canon) return;

    // Update canon entity
    setCanon((prevCanon) => {
      if (!prevCanon) return prevCanon;

      // Find and update entity in correct collection
      const updatedCanon = { ...prevCanon };

      switch (category) {
        case 'characters':
          updatedCanon.characters = prevCanon.characters.map((e) =>
            e.id === entityId ? { ...e, ...updates } : e
          );
          break;
        case 'locations':
          updatedCanon.locations = prevCanon.locations.map((e) =>
            e.id === entityId ? { ...e, ...updates } : e
          );
          break;
        case 'events':
          updatedCanon.events = prevCanon.events.map((e) =>
            e.id === entityId ? { ...e, ...updates } : e
          );
          break;
        case 'factions':
          updatedCanon.factions = prevCanon.factions.map((e) =>
            e.id === entityId ? { ...e, ...updates } : e
          );
          break;
        case 'artifacts':
          updatedCanon.artifacts = prevCanon.artifacts.map((e) =>
            e.id === entityId ? { ...e, ...updates } : e
          );
          break;
      }

      return updatedCanon;
    });

    console.log('[Universe] Entity updated:', entityId, updates);
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

        {/* Search */}
        <div className="ws-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Пошук..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ws-search__input"
          />
          {searchQuery && (
            <button
              className="ws-search__clear"
              onClick={() => setSearchQuery('')}
              title="Очистити"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="ws-sort-dropdown">
          <button
            className="ws-sort-btn"
            onClick={() => setShowSortMenu(!showSortMenu)}
            title="Сортування"
          >
            <ArrowUpDown size={16} />
          </button>
          {showSortMenu && (
            <div className="ws-sort-menu">
              <button
                className={`ws-sort-item ${sortOption === 'alphabetical' ? 'is-active' : ''}`}
                onClick={() => {
                  setSortOption('alphabetical');
                  setShowSortMenu(false);
                }}
              >
                А → Я
              </button>
              <button
                className={`ws-sort-item ${sortOption === 'confirmed-first' ? 'is-active' : ''}`}
                onClick={() => {
                  setSortOption('confirmed-first');
                  setShowSortMenu(false);
                }}
              >
                Підтверджені спочатку
              </button>
              <button
                className={`ws-sort-item ${sortOption === 'inferred-first' ? 'is-active' : ''}`}
                onClick={() => {
                  setSortOption('inferred-first');
                  setShowSortMenu(false);
                }}
              >
                Припущені спочатку
              </button>
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="ws-cat-dropdown">
          <button
            className="ws-cat-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Icon size={16} />
            {info.label}
            <ChevronDown size={14} />
          </button>
          {showCategoryDropdown && (
            <div className="ws-cat-menu">
              {(Object.keys(CATEGORY_INFO) as UniverseCategory[]).map((cat) => {
                const catInfo = CATEGORY_INFO[cat];
                const CatIcon = catInfo.icon;
                return (
                  <button
                    key={cat}
                    className={`ws-cat-item ${cat === category ? 'is-active' : ''}`}
                    onClick={() => {
                      onCategoryChange(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <CatIcon size={16} />
                    {catInfo.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="ws-count">
          {searchQuery ? `${filteredCount} / ${count}` : `${count} items`}
        </div>
      </div>

      {/* Split: Main + Aside */}
      <div className="ws-split">
        {/* Main */}
        <div className="ws-main">
          {allEntities.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--tx-mid)', fontStyle: 'italic' }}>
              Ще немає {info.label.toLowerCase()} в канону
            </div>
          ) : entities.length === 0 ? (
            <div className="ws-empty">
              <div className="ws-empty__icon">🔍</div>
              <div className="ws-empty__title">Нічого не знайдено</div>
              <div className="ws-empty__desc">
                Спробуйте інший запит або змініть фільтри
              </div>
              <button
                className="ws-empty__btn"
                onClick={() => setSearchQuery('')}
              >
                Очистити пошук
              </button>
            </div>
          ) : (
            <div className="wcards">
              {entities.map((entity) => {
                const isConfirmed = entity.origin?.confirmed ?? true; // MOCK entities default to true
                const confidence = entity.origin?.confidence;

                return (
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
                      {/* Badge for inferred entities */}
                      {!isConfirmed && (
                        <div className="wcard__badge" title={`Припущено AI (${Math.round((confidence || 0) * 100)}%)`}>
                          ~{Math.round((confidence || 0) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="wcard__b">
                      <div className="wcard__row">
                        <div>
                          <div className="ent-name">
                            {highlightText(entity.name, searchQuery)}
                          </div>
                          <div className="ent-sub">{getEntitySubtitle(entity, category)}</div>
                        </div>
                      </div>
                      <div className="wcard__blurb">{getEntityDescription(entity, category)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Aside (Profile) */}
        <div className="ws-aside">
          {selectedEntity ? (
            <EntityProfile
              entity={selectedEntity}
              category={category}
              editMode={editMode}
              onToggleEdit={handleToggleEdit}
              onSave={handleSaveEntity}
            />
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
