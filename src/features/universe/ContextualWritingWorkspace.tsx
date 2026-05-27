import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, User, MapPin, Moon, BookOpen, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SceneContext {
  id: number;
  title: string;
  act: string;
  location: string;
  timeOfDay: string;
  pov: string;
  visualMood: string;
  atmosphericColor: string;
  storyText: string;
  aiShowrunner: {
    emotional: string;
    narrative: string;
    tension: string;
  };
}

interface ContextualWritingWorkspaceProps {
  scene: SceneContext;
  onBack: () => void;
}

export default function ContextualWritingWorkspace({ scene, onBack }: ContextualWritingWorkspaceProps) {
  const [text, setText] = useState(scene.storyText);
  const [showAIWhisper, setShowAIWhisper] = useState(false);
  const [aiWhisper, setAIWhisper] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Simulate contextual AI whispers
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAIWhisper(true);
      setAIWhisper("Тут відчувається самотність Elena. Може додати внутрішній монолог про її сумніви?");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Persistent Atmospheric Background (subtle) */}
      <div className={`absolute inset-0 bg-gradient-to-b ${scene.atmosphericColor} opacity-20`}>
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left: Scene Context (always visible) */}
        <div className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-all mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            Повернутись до сцени
          </button>

          {/* Scene Info */}
          <div className="mb-6">
            <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">
              {scene.act}
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              {scene.title}
            </h2>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-white/40" />
                {scene.location}
              </div>
              <div className="flex items-center gap-2">
                <Moon size={14} className="text-white/40" />
                {scene.timeOfDay}
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-white/40" />
                POV: {scene.pov}
              </div>
            </div>
          </div>

          {/* Visual Mood */}
          <div className="mb-6 py-4 px-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-5xl mb-2">{scene.visualMood}</div>
            <div className="text-xs text-white/40 uppercase tracking-wider">
              Атмосфера сцени
            </div>
          </div>

          {/* AI Showrunner Context */}
          <div className="flex-1 overflow-y-auto">
            <div className="mb-3 text-xs text-violet-400 uppercase tracking-wider font-bold flex items-center gap-2">
              <Sparkles size={12} />
              AI Showrunner
            </div>

            <div className="space-y-4">
              <div className="bg-violet-900/20 rounded-xl p-4 border border-violet-500/20">
                <div className="text-xs text-violet-300 uppercase tracking-wider font-bold mb-2">
                  Емоційний контекст
                </div>
                <p className="text-white/80 text-sm leading-relaxed italic">
                  "{scene.aiShowrunner.emotional}"
                </p>
              </div>

              <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-2">
                  Наратив
                </div>
                <p className="text-white/70 text-xs leading-relaxed">
                  {scene.aiShowrunner.narrative}
                </p>
              </div>

              <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-500/20">
                <div className="text-xs text-amber-300 uppercase tracking-wider font-bold mb-2">
                  Напруга
                </div>
                <p className="text-white/70 text-xs">
                  {scene.aiShowrunner.tension}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Writing Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/80">
              <BookOpen size={18} />
              <span className="font-bold text-sm uppercase tracking-wider">
                Творча робота
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">
                {text.length} символів
              </span>
              <div className="w-px h-4 bg-white/20" />
              <button className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-all">
                <Save size={14} />
                Збережено
              </button>
            </div>
          </div>

          {/* Text Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Почніть писати вашу історію..."
              className="w-full h-full p-12 font-serif text-lg leading-relaxed bg-transparent text-white/90 placeholder:text-white/20 focus:outline-none resize-none selection:bg-violet-500/30"
            />

            {/* Contextual AI Whisper */}
            <AnimatePresence>
              {showAIWhisper && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute bottom-8 right-8 max-w-sm"
                >
                  <div className="bg-gradient-to-r from-violet-900/90 to-blue-900/90 backdrop-blur-xl rounded-2xl p-4 border border-violet-500/30 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={14} className="text-violet-300" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-violet-300 uppercase tracking-wider font-bold mb-1">
                          AI шепоче
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {aiWhisper}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="text-xs text-violet-300 hover:text-violet-200 font-bold">
                            Застосувати
                          </button>
                          <button
                            onClick={() => setShowAIWhisper(false)}
                            className="text-xs text-white/40 hover:text-white/60"
                          >
                            Приховати
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Editor Footer */}
          <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-xs text-white/60 hover:text-white font-bold uppercase tracking-wider transition-all">
                Історія версій
              </button>
              <button className="text-xs text-white/60 hover:text-white font-bold uppercase tracking-wider transition-all">
                AI асистент
              </button>
            </div>
            <div className="text-xs text-white/40">
              Останнє збереження: щойно
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
