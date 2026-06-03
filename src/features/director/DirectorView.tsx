/**
 * DirectorView - Режисер (розкадровка)
 * Tabs: Розкадровка | Візуальний Канон
 */

import { useState, useEffect } from 'react';
import { Film, Palette, RefreshCw } from 'lucide-react';
import Storyboarding from './Storyboarding';
import VisualCanon from './VisualCanon';
import ReconstructionOverlay, { type ReconstructionItem } from '../reconstruction/ReconstructionOverlay';
import './DirectorView.css';

type DirectorTab = 'storyboard' | 'visual-canon';

// MOCK reconstruction items for demo
const MOCK_RECONSTRUCTION_ITEMS: ReconstructionItem[] = [
  {
    id: 'shot_1',
    type: 'shot',
    title: 'Кадр 1: Маркус в лабораторії',
    reason: 'Персонаж "Маркус Чен" - опис змінено',
    oldValue: 'Молодий програміст у повсякденному одязі',
    newValue: 'Досвідчений науковець у лабораторному халаті',
    reconStatus: 'review',
  },
  {
    id: 'shot_2',
    type: 'shot',
    title: 'Кадр 2: Екран з сигналом',
    reason: 'Локація "Лабораторія" - освітлення змінено',
    oldValue: 'Яскраве флюоресцентне світло',
    newValue: 'Тьмяне червоне аварійне світло',
    reconStatus: 'auto',
  },
  {
    id: 'dialogue_1',
    type: 'dialogue',
    title: 'Діалог: Маркус про відкриття',
    reason: 'Персонаж "Маркус" - емоційний тон змінено',
    oldValue: 'Це неможливо! (здивований)',
    newValue: 'Це неможливо! (стурбований, тремтить голос)',
    reconStatus: 'review',
  },
];

export default function DirectorView() {
  const [activeTab, setActiveTab] = useState<DirectorTab>('storyboard');
  const [reconstructionItems, setReconstructionItems] = useState<ReconstructionItem[]>([]);

  useEffect(() => {
    console.log('[DirectorView] Mounted');
  }, []);

  const handleShowReconstructionDemo = () => {
    setReconstructionItems(MOCK_RECONSTRUCTION_ITEMS);
  };

  const handleApplyAll = () => {
    console.log('[Reconstruction] Apply all auto items');
    // TODO: Real reconstruction logic
    alert('✅ Застосовано всі Auto зміни\n\n// TODO: Real reconstruction за Інваріант №5');
    setReconstructionItems([]);
  };

  const handleApplyOne = (itemId: string) => {
    console.log('[Reconstruction] Apply one:', itemId);
    setReconstructionItems((items) => items.filter((i) => i.id !== itemId));
  };

  const handlePinOne = (itemId: string) => {
    console.log('[Reconstruction] Pin one:', itemId);
    setReconstructionItems((items) =>
      items.map((i) => (i.id === itemId ? { ...i, reconStatus: 'pinned' as const } : i))
    );
  };

  const handleReviewOne = (itemId: string) => {
    console.log('[Reconstruction] Review one:', itemId);
    alert(`🔍 Відкриття редактора для ручного перегляду\n\nItem: ${itemId}\n\n// TODO: Open manual review editor`);
  };

  const handleDismiss = () => {
    setReconstructionItems([]);
  };

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

          {/* Demo button for Reconstruction */}
          <button
            className="director__tab director__tab--demo"
            onClick={handleShowReconstructionDemo}
            title="Показати demo Reconstruction overlay"
          >
            <RefreshCw size={18} />
            Reconstruction Demo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="director__content">
        {activeTab === 'storyboard' && <Storyboarding />}
        {activeTab === 'visual-canon' && <VisualCanon />}
      </div>

      {/* Reconstruction Overlay */}
      {reconstructionItems.length > 0 && (
        <ReconstructionOverlay
          items={reconstructionItems}
          onApplyAll={handleApplyAll}
          onApplyOne={handleApplyOne}
          onPinOne={handlePinOne}
          onReviewOne={handleReviewOne}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
