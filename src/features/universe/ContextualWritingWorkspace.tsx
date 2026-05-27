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
  const [selectedText, setSelectedText] = useState('');
  const [showContextualInsight, setShowContextualInsight] = useState(false);
  const [contextualInsight, setContextualInsight] = useState('');
  const [showNarrativeMemory, setShowNarrativeMemory] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Simulate contextual AI whispers
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAIWhisper(true);
      setAIWhisper("Тут відчувається самотність Elena. Може додати внутрішній монолог про її сумніви?");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle text selection
  const handleTextSelect = () => {
    if (!textAreaRef.current) return;
    const selected = textAreaRef.current.value.substring(
      textAreaRef.current.selectionStart,
      textAreaRef.current.selectionEnd
    );

    if (selected.length > 10) {
      setSelectedText(selected);
      setShowContextualInsight(true);

      // Simulate AI contextual analysis
      if (selected.includes('signal') || selected.includes('сигнал')) {
        setContextualInsight("Згадайте: Dr. Chen залишив encrypted message про Mars. Це може бути connection!");
      } else if (selected.includes('Elena') || selected.includes('Елена')) {
        setContextualInsight("Elena тут пасивна. Можливо додати активне рішення або внутрішній конфлікт?");
      } else {
        setContextualInsight("Цей dialogue міг би мати більше emotional subtext. Elena ховає свої справжні почуття.");
      }
    } else {
      setShowContextualInsight(false);
    }
  };

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

            <div className="space-y-4 mb-6">
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

            {/* Narrative Memory Panel */}
            {showNarrativeMemory && (
              <div className="border-t border-white/10 pt-4">
                <div className="mb-3 text-xs text-emerald-400 uppercase tracking-wider font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🧠 Narrative Memory
                  </span>
                  <button
                    onClick={() => setShowNarrativeMemory(false)}
                    className="text-white/40 hover:text-white/60 transition-all text-xs"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Active Thread */}
                  <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">🔗</span>
                      <div>
                        <div className="text-xs text-emerald-300 font-bold mb-1">
                          Неvирішена нитка
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">
                          Dr. Chen's encrypted message про Mars - ще не розшифровано
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Character State */}
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">👤</span>
                      <div>
                        <div className="text-xs text-blue-300 font-bold mb-1">
                          Elena's emotional state
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">
                          Grief про Chen + obsession з Mars signal. Втрачає себе в роботі.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lore Connection */}
                  <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">📖</span>
                      <div>
                        <div className="text-xs text-purple-300 font-bold mb-1">
                          Lore callback
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">
                          Mars Colony Zeta - silent since 2085. Two years без звʼязку.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emotional Arc */}
                  <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">💫</span>
                      <div>
                        <div className="text-xs text-red-300 font-bold mb-1">
                          Character arc
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">
                          Elena починає journey від isolation до connection з Oracle AI.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              onMouseUp={handleTextSelect}
              onKeyUp={handleTextSelect}
              placeholder="Почніть писати вашу історію..."
              className="w-full h-full p-12 font-serif text-lg leading-relaxed bg-transparent text-white/90 placeholder:text-white/20 focus:outline-none resize-none selection:bg-violet-500/30"
            />

            {/* Contextual AI Insight (on text selection) */}
            <AnimatePresence>
              {showContextualInsight && selectedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-20 left-1/2 -translate-x-1/2 max-w-md z-20"
                >
                  <div className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/30 shadow-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={14} className="text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">
                          Narrative Intelligence
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {contextualInsight}
                        </p>
                      </div>
                    </div>

                    {/* Emotional Rewrite Options */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2">
                        Переписати з емоцією:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs text-red-200 font-bold transition-all">
                          🔥 Більше напруги
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-200 font-bold transition-all">
                          💔 Вразливість
                        </button>
                        <button className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-xs text-purple-200 font-bold transition-all">
                          🌙 Більше mystery
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowContextualInsight(false)}
                      className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/60 transition-all"
                    >
                      Закрити
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
