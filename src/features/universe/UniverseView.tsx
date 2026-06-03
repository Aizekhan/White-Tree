/**
 * UniverseView - World Tree (Всесвіт)
 * Джерело правди: WhiteWrite WorldTree.html + wt-world.jsx
 *
 * MVP:
 * - TreeStage (візуал дерева - placeholder)
 * - Workspace (категорії: персонажі/локації/події)
 * - Character cards grid
 * - Profile panel (правий aside)
 *
 * TODO: Граф, реконструкція, фільтри (next session)
 */

import { useState, useEffect } from 'react';
import WorldTreeStage from './WorldTreeStage';
import UniverseWorkspace from './UniverseWorkspace';
import './UniverseView.css';

export type UniverseCategory = 'characters' | 'locations' | 'events' | 'factions' | 'artifacts';

export default function UniverseView() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [category, setCategory] = useState<UniverseCategory>('characters');

  useEffect(() => {
    console.log('[UniverseView] Mounted');
  }, []);

  const handleNodeClick = (clickedCategory: UniverseCategory) => {
    setCategory(clickedCategory);
    setShowWorkspace(true);
  };

  const handleBack = () => {
    setShowWorkspace(false);
  };

  return (
    <div className="wt-root">
      {!showWorkspace && (
        <WorldTreeStage onNodeClick={handleNodeClick} />
      )}

      {showWorkspace && (
        <UniverseWorkspace
          category={category}
          onCategoryChange={setCategory}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
