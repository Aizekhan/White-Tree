import React, { useState } from 'react';
import {
  Clapperboard, Film, Camera, Play, Sparkles, Users, Clock, MapPin,
  Film as FilmIcon, Layout, Compass, Download, Zap, TrendingUp,
  Moon, Sun as SunIcon, Video, Target, Palette, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// MOCK: Demo data for "The Last Signal" sci-fi project
const DEMO_PROJECT = {
  title: "The Last Signal",
  tagline: "Sci-Fi Thriller • 2087",
  genre: "Sci-Fi Thriller",
  runtime: "18 min",
  progress: 65, // percentage
  aiStatus: "active" as const,
  productionStage: "Pre-Production",
  scenes: [
    {
      id: "scene-1",
      title: "The Signal Arrives",
      act: "Act I",
      chapter: "Discovery",
      status: "shot-ready" as const,
      description: "Dr. Elena Zhao detects the last radio signal from Mars at the Atacama Observatory. The massive radio dish slowly rotates towards the red planet as warning lights begin to flash.",
      characters: ["Elena Zhao", "Oracle AI"],
      location: "Radio Observatory",
      timeOfDay: "NIGHT",
      intExt: "EXT",
      mood: "Eerie, anticipatory",
      tension: 7,
      runtime: "2:45",
      shotCount: 5,
      budgetComplexity: "Medium",
      thumbnail: "🌌",
      // MOCK Director suggestions
      directorNotes: {
        suggestedShot: "Extreme wide establishing shot, crane movement",
        lighting: "Cool blue moonlight + warm amber practicals",
        cameraMovement: "Slow dolly-in on Elena's workstation",
        lens: "24mm anamorphic",
        mood: "Isolated, cosmic dread"
      }
    },
    {
      id: "scene-2",
      title: "Mentor's Warning",
      act: "Act I",
      chapter: "Discovery",
      status: "planned" as const,
      description: "Flashback to Dr. Chen's mysterious death and his final warning about corporate surveillance",
      characters: ["Elena Zhao", "Dr. Chen"],
      location: "University Lab",
      timeOfDay: "DAY",
      intExt: "INT",
      mood: "Tense, ominous",
      tension: 6,
      runtime: "1:30",
      shotCount: 3,
      budgetComplexity: "Low",
      thumbnail: "⚠️"
    },
    {
      id: "scene-3",
      title: "Research Montage",
      act: "Act I",
      chapter: "Discovery",
      status: "drafted" as const,
      description: "Elena works through the night analyzing signal patterns, coffee cups pile up",
      characters: ["Elena Zhao", "Oracle AI"],
      location: "Underground Lab",
      timeOfDay: "NIGHT",
      intExt: "INT",
      mood: "Focused, obsessive",
      tension: 5,
      runtime: "3:15",
      shotCount: 8,
      budgetComplexity: "Low",
      thumbnail: "🔬"
    },
    {
      id: "scene-4",
      title: "Corporate Confrontation",
      act: "Act II",
      chapter: "Pursuit",
      status: "shot-ready" as const,
      description: "Agent Kross arrives to interrogate Elena about her discovery. Tension escalates.",
      characters: ["Elena Zhao", "Agent Kross"],
      location: "Elena's Lab",
      timeOfDay: "DAY",
      intExt: "INT",
      mood: "Tense, claustrophobic",
      tension: 9,
      runtime: "4:20",
      shotCount: 12,
      budgetComplexity: "Medium",
      thumbnail: "🕴️"
    }
  ]
};

const STATUS_COLORS = {
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  drafted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  analyzed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "shot-ready": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
};

const STATUS_LABELS = {
  planned: "Planned",
  drafted: "Drafted",
  analyzed: "Analyzed",
  "shot-ready": "Shot-Ready"
};

const SIDEBAR_ITEMS = [
  { icon: Layout, label: "Projects", active: true },
  { icon: FilmIcon, label: "Scenes", active: false },
  { icon: Activity, label: "Timeline", active: false },
  { icon: Users, label: "Characters", active: false },
  { icon: Camera, label: "Director", active: false },
  { icon: Download, label: "Exports", active: false }
];

interface SceneCardProps {
  scene: typeof DEMO_PROJECT.scenes[0];
  isHero?: boolean;
  onClick: () => void;
}

function SceneCard({ scene, isHero = false, onClick }: SceneCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (isHero) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-violet-500/30 overflow-hidden shadow-2xl shadow-violet-500/20"
      >
        {/* Hero Thumbnail */}
        <div className="h-48 bg-gradient-to-br from-violet-900/30 to-blue-900/30 flex items-center justify-center text-8xl border-b border-violet-500/20 relative">
          {scene.thumbnail}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-violet-400 border border-violet-500/30">
              {scene.intExt} • {scene.timeOfDay}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${STATUS_COLORS[scene.status]}`}>
              {STATUS_LABELS[scene.status]}
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mb-1">
                {scene.act} • {scene.chapter}
              </div>
              <h2 className="font-serif font-bold text-white text-2xl leading-tight mb-2">
                {scene.title}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                {scene.description}
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-1">Runtime</div>
              <div className="text-lg font-bold text-white">{scene.runtime}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-1">Shots</div>
              <div className="text-lg font-bold text-white">{scene.shotCount}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-1">Tension</div>
              <div className="text-lg font-bold text-amber-400">{scene.tension}/10</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-1">Budget</div>
              <div className="text-sm font-bold text-white">{scene.budgetComplexity}</div>
            </div>
          </div>

          {/* Characters & Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {scene.characters.map((char, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-xs bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/30"
                >
                  <Users size={12} className="text-violet-400" />
                  <span className="text-white/80 font-medium">{char}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <MapPin size={12} className="text-white/40" />
              <span>{scene.location}</span>
              <span className="text-white/20">•</span>
              <span className="capitalize">{scene.mood}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-violet-500/20">
              <Film size={14} />
              Open Scene
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20">
              <Camera size={14} />
              AI Director
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular card (smaller)
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden cursor-pointer transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
    >
      <div className="h-20 bg-gradient-to-br from-violet-900/20 to-blue-900/20 flex items-center justify-center text-3xl border-b border-white/5 relative">
        {scene.thumbnail}
        <div className="absolute top-2 right-2">
          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[scene.status]}`}>
            {STATUS_LABELS[scene.status]}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-serif font-bold text-white/90 text-sm leading-tight line-clamp-1">
          {scene.title}
        </h3>
        <div className="flex items-center gap-2 text-[9px] text-white/30">
          <span>{scene.intExt}</span>
          <span>•</span>
          <span>{scene.timeOfDay}</span>
          <span>•</span>
          <span>{scene.runtime}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CinematicWorkspace() {
  const [selectedScene, setSelectedScene] = useState<typeof DEMO_PROJECT.scenes[0]>(DEMO_PROJECT.scenes[0]);
  const [activeNavItem, setActiveNavItem] = useState("Projects");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-20 bg-[#0f0f0f] border-r border-white/5 flex flex-col items-center py-6 gap-6">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-4">
          <Clapperboard size={24} className="text-white" />
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-4 flex-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNavItem(item.label)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeNavItem === item.label
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
              title={item.label}
            >
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* RICH HEADER */}
        <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-serif font-bold text-white mb-0.5">{DEMO_PROJECT.title}</h1>
                <p className="text-xs text-white/40">{DEMO_PROJECT.tagline}</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20">
                <Play size={14} />
                Preview
              </button>
            </div>

            {/* Metadata Bar */}
            <div className="flex items-center gap-6">
              {/* Progress */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Production Progress</span>
                  <span className="text-xs font-bold text-violet-400">{DEMO_PROJECT.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full"
                    style={{ width: `${DEMO_PROJECT.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-white/40" />
                  <span className="text-white/60">{DEMO_PROJECT.runtime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target size={12} className="text-white/40" />
                  <span className="text-white/60">{DEMO_PROJECT.genre}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className={DEMO_PROJECT.aiStatus === 'active' ? 'text-emerald-400' : 'text-white/40'} />
                  <span className={DEMO_PROJECT.aiStatus === 'active' ? 'text-emerald-400' : 'text-white/60'}>
                    AI {DEMO_PROJECT.aiStatus === 'active' ? 'Active' : 'Idle'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-white/40" />
                  <span className="text-white/60">{DEMO_PROJECT.productionStage}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          {/* CENTER: SCENES */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-6">
              {/* Hero Scene */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Film size={16} className="text-violet-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Active Scene</h2>
                </div>
                <SceneCard scene={selectedScene} isHero onClick={() => {}} />
              </div>

              {/* Other Scenes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layout size={16} className="text-white/40" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">All Scenes</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {DEMO_PROJECT.scenes.filter(s => s.id !== selectedScene.id).map((scene) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      onClick={() => setSelectedScene(scene)}
                    />
                  ))}
                  {/* Add Scene */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#1a1a1a]/50 rounded-xl border border-dashed border-white/10 cursor-pointer transition-all hover:border-violet-500/30 hover:bg-[#1a1a1a] flex items-center justify-center min-h-[120px]"
                  >
                    <div className="text-center">
                      <Sparkles size={16} className="text-violet-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-white/60">Add Scene</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT: DIRECTOR PANEL */}
          <aside className="w-80 bg-[#0f0f0f] border-l border-white/5 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Panel Header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Director</h3>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">Cinematic Analysis</p>
                </div>
              </div>

              {/* MOCK: Director Suggestions */}
              {selectedScene.directorNotes && (
                <div className="space-y-4">
                  {/* Current Scene */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-1">Current Scene</div>
                    <div className="text-sm font-bold text-white mb-2">{selectedScene.title}</div>
                    <div className="text-xs text-white/60">{selectedScene.intExt} • {selectedScene.timeOfDay}</div>
                  </div>

                  {/* Mood */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-2">Mood</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedScene.mood.split(', ').map((m, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-xs border border-violet-500/30">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Shot */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-2">Suggested Shot</div>
                    <div className="text-xs text-white/80 bg-white/5 rounded-lg p-3 border border-white/10">
                      {selectedScene.directorNotes.suggestedShot}
                    </div>
                  </div>

                  {/* Lighting */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-2">Lighting</div>
                    <div className="flex items-center gap-2 text-xs text-white/80 bg-white/5 rounded-lg p-3 border border-white/10">
                      <Palette size={12} className="text-amber-400" />
                      {selectedScene.directorNotes.lighting}
                    </div>
                  </div>

                  {/* Camera */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-2">Camera Movement</div>
                    <div className="text-xs text-white/80 bg-white/5 rounded-lg p-3 border border-white/10">
                      {selectedScene.directorNotes.cameraMovement}
                    </div>
                  </div>

                  {/* Lens */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold mb-2">Lens</div>
                    <div className="text-xs text-white/80 bg-white/5 rounded-lg p-3 border border-white/10">
                      {selectedScene.directorNotes.lens}
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20">
                    Generate Full Breakdown
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
