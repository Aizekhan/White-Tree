import React, { useState } from 'react';
import {
  Brain, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Users, Clock, Zap, Heart, Activity, AlertCircle, Sparkles,
  ArrowRight, Eye, Layers
} from 'lucide-react';
import { motion } from 'motion/react';

// MOCK: Story Intelligence data for "The Last Signal"
const STORY_INTELLIGENCE = {
  projectTitle: "The Last Signal",
  universeHealth: 78, // overall

  characterArcs: [
    {
      name: "Elena Zhao",
      role: "Protagonist",
      arcProgress: 65,
      health: "warning", // good, warning, critical
      currentState: "Paranoid → Determined",
      issues: [
        "Character agency weakens in Scene 5",
        "Motivation becomes reactive instead of proactive"
      ],
      strengths: [
        "Strong opening setup",
        "Compelling relationship with Oracle"
      ],
      aiSuggestion: "Add personal stakes: Why does Elena care beyond scientific curiosity?"
    },
    {
      name: "Oracle (AI)",
      role: "Sidekick",
      arcProgress: 45,
      health: "critical",
      currentState: "Logical → Sacrificial",
      issues: [
        "True motivation unclear",
        "Sacrifice in Scene 7 feels rushed"
      ],
      strengths: [
        "Unique AI personality"
      ],
      aiSuggestion: "Foreshadow sacrifice motivation in Scene 3-4"
    },
    {
      name: "Agent Kross",
      role: "Antagonist",
      arcProgress: 30,
      health: "critical",
      currentState: "One-dimensional threat",
      issues: [
        "Lacks moral complexity",
        "Corporate villain cliché"
      ],
      strengths: [],
      aiSuggestion: "Add conflicted loyalty scene - show Kross questioning orders"
    }
  ],

  unresolvedThreads: [
    {
      id: 1,
      priority: "high",
      thread: "Dr. Chen's final encrypted message",
      lastMentioned: "Scene 2 (flashback)",
      status: "abandoned", // active, abandoned, resolved
      aiNote: "Critical setup that was never paid off. Resolve in Act III."
    },
    {
      id: 2,
      priority: "medium",
      thread: "Oracle's true origin",
      lastMentioned: "Scene 3 (brief mention)",
      status: "active",
      aiNote: "Mystery box without resolution plan. Add reveal in Scene 7-8."
    },
    {
      id: 3,
      priority: "high",
      thread: "Why Mars colony actually went silent",
      lastMentioned: "Scene 1 (signal detection)",
      status: "active",
      aiNote: "Core mystery. Current trajectory suggests reveal too late (Scene 10)."
    },
    {
      id: 4,
      priority: "low",
      thread: "Elena's estranged family",
      lastMentioned: "Scene 1 (one line)",
      status: "abandoned",
      aiNote: "Mentioned but never developed. Either expand or remove."
    }
  ],

  emotionalPacing: [
    { scene: 1, tension: 7, emotion: "Curiosity + Dread" },
    { scene: 2, tension: 6, emotion: "Fear + Grief" },
    { scene: 3, tension: 5, emotion: "Obsession" },
    { scene: 4, tension: 9, emotion: "Confrontation" },
    { scene: 5, tension: 4, emotion: "Deflated" }, // DROP DETECTED
    { scene: 6, tension: 6, emotion: "Determination" },
    { scene: 7, tension: 8, emotion: "Sacrifice" },
    { scene: 8, tension: 9, emotion: "Revelation" }
  ],

  loreConsistency: [
    {
      type: "contradiction",
      severity: "high",
      issue: "AI sentience laws inconsistent",
      details: "Scene 3: 'AI free will banned' vs Scene 7: Oracle makes autonomous choice",
      scenes: ["Scene 3", "Scene 7"],
      aiSuggestion: "Clarify: Oracle breaking law (adds stakes) or laws misunderstood?"
    },
    {
      type: "timeline",
      severity: "medium",
      issue: "Signal decoding timeline doesn't match",
      details: "Scene 4: Elena arrives 'next day' but Scene 5 shows 3 days of work",
      scenes: ["Scene 4", "Scene 5"],
      aiSuggestion: "Fix timeline: Either compress work or add time jump marker"
    },
    {
      type: "world-rule",
      severity: "low",
      issue: "Mars signal travel time",
      details: "Scene 1 says '12 minutes' but Scene 6 implies real-time communication",
      scenes: ["Scene 1", "Scene 6"],
      aiSuggestion: "Clarify: Is there quantum relay tech? Or Scene 6 mistake?"
    }
  ],

  aiInsights: [
    {
      type: "strength",
      title: "Opening hook is excellent",
      description: "Scene 1 establishes mystery and atmosphere effectively. The radio dish visual is compelling.",
      confidence: 95
    },
    {
      type: "warning",
      title: "Act II momentum drops",
      description: "Scenes 5-6 lose tension after Scene 4 confrontation. Elena becomes too passive.",
      confidence: 88
    },
    {
      type: "critical",
      title: "Antagonist underdeveloped",
      description: "Agent Kross is one-dimensional. Story needs moral gray area to avoid cliché.",
      confidence: 92
    },
    {
      type: "opportunity",
      title: "Oracle relationship underutilized",
      description: "Elena-Oracle dynamic is unique but needs more conflict/depth before sacrifice.",
      confidence: 85
    }
  ]
};

const HEALTH_COLORS = {
  good: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", icon: CheckCircle2 },
  warning: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: AlertTriangle },
  critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", icon: AlertCircle }
};

const PRIORITY_COLORS = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

export default function UniverseBrainView() {
  const [selectedCharacter, setSelectedCharacter] = useState(STORY_INTELLIGENCE.characterArcs[0]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Universe Intelligence</h1>
            <p className="text-sm text-white/40">{STORY_INTELLIGENCE.projectTitle} • Narrative Analysis</p>
          </div>
        </div>

        {/* Universe Health Bar */}
        <div className="bg-gradient-to-r from-violet-900/20 to-blue-900/20 rounded-2xl p-6 border border-violet-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-white/60">Universe Health</span>
            <span className="text-3xl font-bold text-violet-400">{STORY_INTELLIGENCE.universeHealth}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${STORY_INTELLIGENCE.universeHealth}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full"
            />
          </div>
          <p className="text-xs text-white/40 mt-2">Based on character arcs, lore consistency, and emotional pacing</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Character Arcs */}
        <div className="col-span-8 space-y-6">
          {/* Character Arc Health */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-violet-400" />
              <h2 className="text-lg font-bold text-white">Character Arc Health</h2>
            </div>

            <div className="space-y-4">
              {STORY_INTELLIGENCE.characterArcs.map((char) => {
                const healthConfig = HEALTH_COLORS[char.health];
                const Icon = healthConfig.icon;

                return (
                  <motion.div
                    key={char.name}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedCharacter(char)}
                    className={`bg-[#1a1a1a] rounded-2xl p-5 border cursor-pointer transition-all ${
                      selectedCharacter.name === char.name
                        ? 'border-violet-500/50 shadow-lg shadow-violet-500/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-white text-lg">{char.name}</h3>
                          <span className="text-xs text-white/40 uppercase tracking-wider">{char.role}</span>
                        </div>
                        <p className="text-sm text-white/60">{char.currentState}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${healthConfig.bg} ${healthConfig.border} ${healthConfig.text}`}>
                        <Icon size={12} />
                        <span className="text-xs font-bold uppercase tracking-wider">{char.health}</span>
                      </div>
                    </div>

                    {/* Arc Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Arc Progress</span>
                        <span className="text-sm font-bold text-white">{char.arcProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            char.health === 'good' ? 'bg-emerald-500' :
                            char.health === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${char.arcProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Issues & Strengths */}
                    {char.issues.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Issues
                        </div>
                        <ul className="space-y-1">
                          {char.issues.map((issue, idx) => (
                            <li key={idx} className="text-xs text-white/60 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Suggestion */}
                    <div className="bg-violet-500/10 rounded-xl p-3 border border-violet-500/20">
                      <div className="text-[10px] text-violet-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                        <Sparkles size={10} />
                        AI Showrunner
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{char.aiSuggestion}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Emotional Pacing */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-amber-400" />
              <h2 className="text-lg font-bold text-white">Emotional Pacing</h2>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
              {/* Tension Graph */}
              <div className="mb-4">
                <div className="flex items-end justify-between h-32 gap-2">
                  {STORY_INTELLIGENCE.emotionalPacing.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${point.tension * 10}%` }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-full rounded-t-lg ${
                          point.tension >= 8 ? 'bg-emerald-500' :
                          point.tension >= 6 ? 'bg-amber-500' :
                          point.tension >= 4 ? 'bg-violet-500' : 'bg-red-500'
                        }`}
                        style={{ minHeight: '8px' }}
                      />
                      <span className="text-[10px] text-white/40 font-bold">S{point.scene}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert */}
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 flex items-start gap-3">
                <TrendingDown size={16} className="text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-red-400 mb-1">Tension Drop Detected</div>
                  <p className="text-xs text-white/60">Scene 5 shows significant emotional deflation after Scene 4's peak. Character becomes passive.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: Insights & Threads */}
        <div className="col-span-4 space-y-6">
          {/* AI Showrunner Insights */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-violet-400" />
              <h2 className="text-base font-bold text-white">AI Showrunner</h2>
            </div>

            <div className="space-y-3">
              {STORY_INTELLIGENCE.aiInsights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-xl p-4 border ${
                    insight.type === 'strength' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                    insight.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    insight.type === 'strength' ? 'text-emerald-400' :
                    insight.type === 'warning' ? 'text-amber-400' :
                    insight.type === 'critical' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {insight.type}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{insight.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-2">{insight.description}</p>
                  <div className="text-[10px] text-white/30">Confidence: {insight.confidence}%</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Unresolved Threads */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-blue-400" />
              <h2 className="text-base font-bold text-white">Unresolved Threads</h2>
            </div>

            <div className="space-y-3">
              {STORY_INTELLIGENCE.unresolvedThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${PRIORITY_COLORS[thread.priority]}`}>
                      {thread.priority}
                    </span>
                    <span className={`text-[10px] ${
                      thread.status === 'abandoned' ? 'text-red-400' :
                      thread.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {thread.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{thread.thread}</h3>
                  <p className="text-[11px] text-white/40 mb-2">Last: {thread.lastMentioned}</p>
                  <p className="text-xs text-violet-400 leading-relaxed">{thread.aiNote}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Lore Consistency */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-red-400" />
              <h2 className="text-base font-bold text-white">Lore Alerts</h2>
            </div>

            <div className="space-y-3">
              {STORY_INTELLIGENCE.loreConsistency.map((issue, idx) => (
                <div
                  key={idx}
                  className="bg-[#1a1a1a] rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
                >
                  <div className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-2">
                    {issue.type} • {issue.severity}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{issue.issue}</h3>
                  <p className="text-xs text-white/60 mb-2">{issue.details}</p>
                  <div className="text-[11px] text-white/40 mb-2">
                    Affects: {issue.scenes.join(', ')}
                  </div>
                  <p className="text-xs text-violet-400">{issue.aiSuggestion}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
