/**
 * UniverseWorkspace - workspace для категорій (персонажі/локації/події)
 * Джерело правди: WhiteWrite WorldTree.html ws-* classes
 *
 * MVP: header + mock cards + empty profile panel
 * TODO: real data from canon, filters, profile, graph (next session)
 */

import { ArrowLeft, User, MapPin, Calendar, Users, Package } from 'lucide-react';
import type { UniverseCategory } from './UniverseView';

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

// MOCK data (TODO: replace with real canon data)
const MOCK_CHARACTERS = [
  { id: 'marcus', name: 'Маркус Чен', role: 'Головний герой', motivation: 'Знайти сигнал...' },
  { id: 'elena', name: 'Елена Родрігес', role: 'Інженерка', motivation: 'Полагодити ретранслятори...' },
  { id: 'orion', name: 'Голос «Оріон»', role: 'Антагоніст', motivation: 'Веде відлік...' },
];

export default function UniverseWorkspace({
  category,
  onCategoryChange,
  onBack,
}: UniverseWorkspaceProps) {
  const info = CATEGORY_INFO[category];
  const Icon = info.icon;

  const mockData = category === 'characters' ? MOCK_CHARACTERS : [];

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

        <div className="ws-count">{mockData.length} items</div>
      </div>

      {/* Split: Main + Aside */}
      <div className="ws-split">
        {/* Main */}
        <div className="ws-main">
          <div className="wcards">
            {mockData.map((char) => (
              <div key={char.id} className="wcard">
                <div className="wcard__media">
                  <div className="wcard__scrim" />
                  <div className="wcard__ic">
                    <User size={17} />
                  </div>
                </div>
                <div className="wcard__b">
                  <div className="wcard__row">
                    <div>
                      <div className="ent-name">{char.name}</div>
                      <div className="ent-sub">{char.role}</div>
                    </div>
                  </div>
                  <div className="wcard__blurb">{char.motivation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aside (Profile) */}
        <div className="ws-aside">
          <div className="profile profile--empty">
            Оберіть сутність для перегляду деталей
          </div>
        </div>
      </div>
    </div>
  );
}
