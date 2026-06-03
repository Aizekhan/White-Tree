/**
 * RelationsGraph - visualization of entity relationships
 * Simple version without D3.js - shows relations as a list with visual connections
 */

import { useState, useMemo } from 'react';
import { User, MapPin, Calendar, Users, Package, ArrowRight } from 'lucide-react';
import type { Canon, CanonCharacter } from '../../canon/canonTypes';

interface RelationsGraphProps {
  canon: Canon | null;
}

interface RelationDisplay {
  sourceId: string;
  sourceName: string;
  sourceType: 'character' | 'location' | 'event' | 'faction' | 'artifact';
  targetId?: string;
  targetName?: string;
  kind: string;
  tone?: string;
}

/**
 * Get entity icon based on type
 */
function getEntityIcon(type: string) {
  switch (type) {
    case 'character': return User;
    case 'location': return MapPin;
    case 'event': return Calendar;
    case 'faction': return Users;
    case 'artifact': return Package;
    default: return User;
  }
}

/**
 * Get entity by ID from canon
 */
function getEntityById(canon: Canon, entityId: string) {
  const allEntities = [
    ...canon.characters,
    ...canon.locations,
    ...canon.events,
    ...canon.factions,
    ...canon.artifacts,
  ];
  return allEntities.find((e) => e.id === entityId);
}

export default function RelationsGraph({ canon }: RelationsGraphProps) {
  const [filterType, setFilterType] = useState<'all' | 'character' | 'location' | 'event' | 'faction' | 'artifact'>('all');

  // Extract all relations from canon
  const relations = useMemo(() => {
    if (!canon) return [];

    const result: RelationDisplay[] = [];

    // Character relations
    canon.characters.forEach((char: CanonCharacter) => {
      if (char.relations) {
        char.relations.forEach((rel) => {
          const target = rel.targetId ? getEntityById(canon, rel.targetId) : undefined;
          result.push({
            sourceId: char.id,
            sourceName: char.name,
            sourceType: 'character',
            targetId: rel.targetId,
            targetName: target?.name,
            kind: rel.kind,
            tone: rel.tone,
          });
        });
      }
    });

    // TODO: Add relations from other entity types when they support it

    return result;
  }, [canon]);

  // Filter relations
  const filteredRelations = useMemo(() => {
    if (filterType === 'all') return relations;
    return relations.filter((rel) => rel.sourceType === filterType);
  }, [relations, filterType]);

  if (!canon) {
    return (
      <div className="relations-graph">
        <div className="relations-graph__empty">
          <div className="relations-graph__empty-icon">🔗</div>
          <div className="relations-graph__empty-title">Немає канону</div>
          <div className="relations-graph__empty-desc">
            Спочатку створіть сутності канону
          </div>
        </div>
      </div>
    );
  }

  if (relations.length === 0) {
    return (
      <div className="relations-graph">
        <div className="relations-graph__empty">
          <div className="relations-graph__empty-icon">🔗</div>
          <div className="relations-graph__empty-title">Немає зв'язків</div>
          <div className="relations-graph__empty-desc">
            Додайте зв'язки до персонажів у режимі редагування
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relations-graph">
      {/* Header */}
      <div className="relations-graph__header">
        <div className="relations-graph__title">
          <div className="relations-graph__icon">🔗</div>
          <h3>Граф Зв'язків</h3>
        </div>
        <div className="relations-graph__stats">
          {relations.length} {relations.length === 1 ? 'зв\'язок' : 'зв\'язків'}
        </div>
      </div>

      {/* Filter */}
      <div className="relations-graph__filter">
        <button
          className={`filter-btn ${filterType === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Всі
        </button>
        <button
          className={`filter-btn ${filterType === 'character' ? 'is-active' : ''}`}
          onClick={() => setFilterType('character')}
        >
          <User size={14} />
          Персонажі
        </button>
        <button
          className={`filter-btn ${filterType === 'location' ? 'is-active' : ''}`}
          onClick={() => setFilterType('location')}
        >
          <MapPin size={14} />
          Локації
        </button>
        <button
          className={`filter-btn ${filterType === 'event' ? 'is-active' : ''}`}
          onClick={() => setFilterType('event')}
        >
          <Calendar size={14} />
          Події
        </button>
      </div>

      {/* Relations List */}
      <div className="relations-graph__list">
        {filteredRelations.length === 0 ? (
          <div className="relations-graph__empty-filter">
            Немає зв'язків для обраного типу
          </div>
        ) : (
          filteredRelations.map((rel, i) => {
            const SourceIcon = getEntityIcon(rel.sourceType);
            const targetType = rel.targetId ? 'character' : undefined; // TODO: detect target type
            const TargetIcon = targetType ? getEntityIcon(targetType) : null;

            return (
              <div key={i} className="relation-card">
                {/* Source */}
                <div className="relation-node">
                  <div className="relation-node__icon">
                    <SourceIcon size={16} />
                  </div>
                  <div className="relation-node__content">
                    <div className="relation-node__name">{rel.sourceName}</div>
                    <div className="relation-node__type">{rel.sourceType}</div>
                  </div>
                </div>

                {/* Arrow with label */}
                <div className="relation-arrow">
                  <div className="relation-arrow__line" />
                  <div className="relation-arrow__label">
                    <div className="relation-arrow__kind">{rel.kind}</div>
                    {rel.tone && (
                      <div className="relation-arrow__tone">({rel.tone})</div>
                    )}
                  </div>
                  <ArrowRight size={18} className="relation-arrow__icon" />
                </div>

                {/* Target */}
                <div className="relation-node relation-node--target">
                  {rel.targetName ? (
                    <>
                      <div className="relation-node__icon">
                        {TargetIcon && <TargetIcon size={16} />}
                      </div>
                      <div className="relation-node__content">
                        <div className="relation-node__name">{rel.targetName}</div>
                        <div className="relation-node__type">{targetType}</div>
                      </div>
                    </>
                  ) : (
                    <div className="relation-node__placeholder">
                      Невідомо
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
