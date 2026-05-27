// TEMP: Multi-view demo wrapper
// Story Immersion First

import { useState } from 'react';
import { Brain, Clapperboard, Camera, Sparkles, BookOpen } from 'lucide-react';
import ImmersiveStoryEntry from './features/universe/ImmersiveStoryEntry';
import UniverseBrainView from './features/universe/UniverseBrainView';
import CinematicWorkspace from './features/workspace/CinematicWorkspace';

type View = 'immersive' | 'universe' | 'production';

const VIEWS = [
  { id: 'immersive' as const, icon: Sparkles, label: 'Story', component: ImmersiveStoryEntry },
  { id: 'universe' as const, icon: Brain, label: 'Intelligence', component: UniverseBrainView },
  { id: 'production' as const, icon: Clapperboard, label: 'Production', component: CinematicWorkspace },
];

export default function AppCinematic() {
  const [activeView, setActiveView] = useState<View>('immersive');

  const CurrentView = VIEWS.find(v => v.id === activeView)?.component || UniverseBrainView;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation Bar */}
      <nav className="bg-[#0f0f0f] border-b border-white/5 px-6 py-3 flex items-center gap-4">
        {VIEWS.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeView === view.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              <Icon size={16} />
              {view.label}
            </button>
          );
        })}
      </nav>

      {/* View Content */}
      <CurrentView />
    </div>
  );
}
