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
import RelationsGraph from './RelationsGraph';
import { useStoryStore } from '../../store/useStoryStore';
import './UniverseView.css';

export type UniverseCategory = 'characters' | 'locations' | 'events' | 'factions' | 'artifacts';
export type UniverseView = 'tree' | 'graph';

export default function UniverseView() {
  const [view, setView] = useState<UniverseView>('tree');
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [category, setCategory] = useState<UniverseCategory>('characters');
  const { project } = useStoryStore();

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

  const handleViewChange = (newView: UniverseView) => {
    setView(newView);
    setShowWorkspace(false); // Return to home when switching views
  };

  return (
    <div className="wt-root">
      {!showWorkspace && view === 'tree' && (
        <WorldTreeStage
          onNodeClick={handleNodeClick}
          onViewChange={handleViewChange}
        />
      )}

      {!showWorkspace && view === 'graph' && (
        <div className="wt-view">
          {/* View Toggle Button */}
          <button
            className="wt-view-toggle"
            onClick={() => handleViewChange('tree')}
          >
            ← Назад до дерева
          </button>
          <RelationsGraph canon={project?.canon || null} />
        </div>
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
