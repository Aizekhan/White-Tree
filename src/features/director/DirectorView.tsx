/**
 * DirectorView - Режисер (розкадровка)
 * Tabs: Розкадровка | Візуальний Канон
 */

import { useState, useEffect } from 'react';
import { Film, Palette } from 'lucide-react';
import Storyboarding from './Storyboarding';
import VisualCanon from './VisualCanon';
import './DirectorView.css';

type DirectorTab = 'storyboard' | 'visual-canon';

export default function DirectorView() {
  const [activeTab, setActiveTab] = useState<DirectorTab>('storyboard');

  useEffect(() => {
    console.log('[DirectorView] Mounted');
  }, []);

  return (
    <div className="director">
      {/* Header with tabs */}
      <div className="director__header">
        <div className="director__title">
          <div className="director__icon">🎬</div>
          <h1>Режисер</h1>
        </div>

        <div className="director__tabs">
          <button
            className={`director__tab ${activeTab === 'storyboard' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('storyboard')}
          >
            <Film size={18} />
            Розкадровка
          </button>
          <button
            className={`director__tab ${activeTab === 'visual-canon' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('visual-canon')}
          >
            <Palette size={18} />
            Візуальний Канон
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="director__content">
        {activeTab === 'storyboard' && <Storyboarding />}
        {activeTab === 'visual-canon' && <VisualCanon />}
      </div>
    </div>
  );
}
