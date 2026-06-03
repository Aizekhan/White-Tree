/**
 * WorldTreeStage - візуалізація дерева з нодами
 * Джерело правди: WhiteWrite WorldTree.html tree-stage
 *
 * MVP: placeholder з кнопками-нодами
 * TODO: справжнє дерево (SVG або зображення) next session
 */

import { User, MapPin, Calendar, Users, Package } from 'lucide-react';
import type { UniverseCategory } from './UniverseView';

interface WorldTreeStageProps {
  onNodeClick: (category: UniverseCategory) => void;
}

export default function WorldTreeStage({ onNodeClick }: WorldTreeStageProps) {
  const nodes = [
    { category: 'characters' as UniverseCategory, label: 'Персонажі', icon: User, position: { top: '25%', left: '30%' } },
    { category: 'locations' as UniverseCategory, label: 'Локації', icon: MapPin, position: { top: '35%', right: '30%' } },
    { category: 'events' as UniverseCategory, label: 'Події', icon: Calendar, position: { top: '55%', left: '35%' } },
    { category: 'factions' as UniverseCategory, label: 'Фракції', icon: Users, position: { top: '60%', right: '35%' } },
    { category: 'artifacts' as UniverseCategory, label: 'Артефакти', icon: Package, position: { top: '45%', left: '50%' } },
  ];

  return (
    <div className="tree-stage">
      <div className="tree-frame">
        {/* Tree image placeholder */}
        <div
          className="tree-img"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '96px',
            color: 'rgba(217,160,70,0.3)',
          }}
        >
          🌳
        </div>

        {/* Ambient haze */}
        <div className="tree-haze" />

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.category}
            className="node"
            style={node.position}
            onClick={() => onNodeClick(node.category)}
          >
            <div className="node__orb">
              <node.icon />
            </div>
            <div className="node__pulse" />
            <div className="node__label is-bot">
              <span className="node__title">{node.label}</span>
              <span className="node__kicker">Категорія</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="tree-hint">
        <span className="tree-hint__mark">✦</span>
        Оберіть категорію для перегляду канону
      </div>
    </div>
  );
}
