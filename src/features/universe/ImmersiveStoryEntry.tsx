import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, User, Moon, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// MOCK: "The Last Signal" story data
const STORY_SCENES = [
  {
    id: 1,
    title: "The Signal Arrives",
    act: "Act I",
    location: "Atacama Observatory",
    timeOfDay: "Night",
    pov: "Elena Zhao",
    visualMood: "🌌",
    atmosphericColor: "from-indigo-950 via-violet-950 to-black",

    storyText: `The massive radio dish slowly rotates towards Mars, its metal framework creaking against the desert wind. Warning lights blink amber across the control console. Dr. Elena Zhao's fingers hover over the keyboard, her breath visible in the cold observatory air.

The signal — impossible, yet undeniable — pulses across her screen. Twelve minutes ago, something on Mars broke decades of silence.

"Oracle," she whispers to the AI assistant, "confirm signal origin."

The synthetic voice responds, calm but curious: "Confirmed. Mars Colony Zeta. Signal authenticated with legacy encryption keys."

Elena's heart pounds. The colony went dark in 2085. Two years of silence. Two years of questions.

And now, this.`,

    aiShowrunner: {
      emotional: "Elena feels the weight of isolation here. This is the moment before everything changes.",
      narrative: "Opening hook establishes mystery effectively. The sensory details ground us.",
      tension: "Rising curiosity + dread. The silence breaks."
    }
  },
  {
    id: 2,
    title: "Mentor's Warning",
    act: "Act I",
    location: "University Lab",
    timeOfDay: "Day",
    pov: "Elena Zhao",
    visualMood: "⚠️",
    atmosphericColor: "from-amber-900 via-orange-950 to-black",

    storyText: `[FLASHBACK - Two Years Earlier]

Dr. Chen's hands trembled as he pressed the encrypted drive into Elena's palm. His office, usually warm with afternoon light, felt cold. Sterile.

"They'll come for this," he said, eyes darting to the door. "The corporations. They don't want the truth about Mars."

Elena tried to smile. "You're being paranoid again—"

"I'm being realistic." Chen's voice cracked. "Promise me. If something happens to me... decode the message. Don't let them bury it."

Three days later, Chen was dead. Heart attack, they said. Natural causes.

Elena never believed it.`,

    aiShowrunner: {
      emotional: "Grief lingers here, unspoken. Chen's warning haunts Elena's every decision.",
      narrative: "Flashback adds depth but feels slightly rushed. Chen's fear needs one more beat.",
      tension: "Paranoia seeping in. Setup for conspiracy."
    }
  },
  {
    id: 3,
    title: "Research Montage",
    act: "Act I",
    location: "Underground Lab",
    timeOfDay: "Night",
    pov: "Elena Zhao",
    visualMood: "🔬",
    atmosphericColor: "from-blue-950 via-slate-950 to-black",

    storyText: `Hours blur. Coffee cups pile up. The underground lab hums with server fans.

Elena's eyes burn from screen glare, but she can't stop. The signal's not random noise — it's structured. Intentional. Someone on Mars is trying to say something.

Oracle processes terabytes of data per second, neural nets hunting patterns. "Progress: 34%. Estimated time: 47 hours."

Too slow.

Elena types faster, overriding safety protocols, pushing Oracle beyond designed limits. The AI doesn't protest. If anything, Oracle seems... eager.

"We're close," Elena mutters, more to herself than to Oracle. "I can feel it."

"Affirmative," Oracle replies. "Emotional resonance detected in signal harmonics. This is not automated. This is human."`,

    aiShowrunner: {
      emotional: "Obsession takes hold. Elena's losing herself in the mystery, and Oracle enables it.",
      narrative: "Good pacing but Elena becomes too passive. She needs to actively discover something.",
      tension: "Building momentum. The partnership with Oracle deepens."
    }
  }
];

export default function ImmersiveStoryEntry() {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [showAI, setShowAI] = useState(false);

  const scene = STORY_SCENES[currentSceneIdx];

  useEffect(() => {
    // Show AI narration after 3 seconds
    const timer = setTimeout(() => setShowAI(true), 3000);
    return () => clearTimeout(timer);
  }, [currentSceneIdx]);

  const nextScene = () => {
    if (currentSceneIdx < STORY_SCENES.length - 1) {
      setCurrentSceneIdx(currentSceneIdx + 1);
      setShowAI(false);
    }
  };

  const prevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx(currentSceneIdx - 1);
      setShowAI(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${scene.atmosphericColor}`}>
        {/* Subtle animated overlay */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Visual Mood (large emoji/icon) */}
        <motion.div
          key={scene.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1 }}
          className="text-9xl mb-8 select-none"
        >
          {scene.visualMood}
        </motion.div>

        {/* Story Text */}
        <motion.div
          key={`story-${scene.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Scene Header */}
          <div className="text-center mb-8">
            <div className="text-sm text-white/40 uppercase tracking-widest font-bold mb-2">
              {scene.act}
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-4">
              {scene.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                {scene.location}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Moon size={14} />
                {scene.timeOfDay}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <User size={14} />
                {scene.pov}
              </div>
            </div>
          </div>

          {/* Story Paragraph */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="prose prose-invert max-w-none">
              {scene.storyText.split('\n\n').map((paragraph, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="text-white/90 leading-relaxed text-lg font-serif mb-4 last:mb-0"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>

          {/* AI Showrunner Narration */}
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-gradient-to-r from-violet-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles size={16} className="text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-violet-400 uppercase tracking-wider font-bold mb-2">
                      AI Showrunner
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/80 text-sm leading-relaxed italic">
                        "{scene.aiShowrunner.emotional}"
                      </p>
                      <p className="text-white/60 text-xs leading-relaxed">
                        {scene.aiShowrunner.narrative}
                      </p>
                      <div className="text-xs text-white/40 pt-2 border-t border-white/10">
                        Tension: {scene.aiShowrunner.tension}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Controls (minimal) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10 shadow-2xl">
          {/* Previous */}
          <button
            onClick={prevScene}
            disabled={currentSceneIdx === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Scene Counter */}
          <div className="text-white/60 text-sm font-bold min-w-[80px] text-center">
            Scene {currentSceneIdx + 1} / {STORY_SCENES.length}
          </div>

          {/* Next */}
          <button
            onClick={nextScene}
            disabled={currentSceneIdx === STORY_SCENES.length - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronRight size={20} className="text-white" />
          </button>

          <div className="w-px h-6 bg-white/20" />

          {/* Enter Workspace */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all"
          >
            <Play size={16} />
            Enter Scene
          </button>
        </div>
      </div>

      {/* Top Floating Info */}
      <div className="fixed top-8 left-8 z-20">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
          <div className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">
            The Last Signal
          </div>
          <div className="text-sm text-white/80 font-bold">
            Sci-Fi Thriller • 2087
          </div>
        </div>
      </div>

      {/* Progress indicator (subtle) */}
      <div className="fixed top-8 right-8 z-20">
        <div className="flex gap-2">
          {STORY_SCENES.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSceneIdx
                  ? 'bg-violet-400 w-8'
                  : idx < currentSceneIdx
                  ? 'bg-white/40'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
