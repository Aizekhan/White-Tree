import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, User, MapPin, Moon, Save } from 'lucide-react';
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
  const [showSceneContext, setShowSceneContext] = useState(false);
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

      {/* Minimal Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-sm backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Повернутись</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Scene Info - Minimal */}
          <div className="backdrop-blur-xl bg-black/30 rounded-full px-4 py-2 border border-white/10">
            <div className="text-xs text-white/80 font-bold">
              {scene.title}
            </div>
          </div>

          {/* Character count */}
          <div className="text-xs text-white/40 backdrop-blur-sm bg-black/20 px-3 py-2 rounded-full border border-white/10">
            {text.length} символів
          </div>
        </div>
      </div>

      {/* Fullscreen Text Editor */}
      <div className="relative z-10 min-h-screen flex flex-col pt-20">
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onMouseUp={handleTextSelect}
          onKeyUp={handleTextSelect}
          placeholder="Почніть писати вашу історію..."
          className="flex-1 w-full px-12 md:px-24 lg:px-32 py-12 font-serif text-xl leading-relaxed bg-transparent text-white/90 placeholder:text-white/20 focus:outline-none resize-none selection:bg-violet-500/30"
        />

        {/* Contextual AI Insight (on text selection) */}
        <AnimatePresence>
          {showContextualInsight && selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-32 left-1/2 -translate-x-1/2 max-w-md z-30"
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
              className="fixed bottom-24 right-8 max-w-sm z-30"
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

        {/* Floating Scene Context Button */}
        <button
          onClick={() => setShowSceneContext(!showSceneContext)}
          className="fixed bottom-24 left-8 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all z-30"
          title="Scene Context"
        >
          <span className="text-xl">{scene.visualMood}</span>
        </button>

        {/* Scene Context Panel */}
        <AnimatePresence>
          {showSceneContext && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed left-8 bottom-40 w-80 max-h-[60vh] overflow-y-auto backdrop-blur-xl bg-black/40 rounded-2xl border border-white/10 p-6 z-30"
            >
              <div className="mb-4">
                <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">
                  {scene.act}
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3">
                  {scene.title}
                </h3>
                <div className="space-y-2 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    {scene.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon size={12} />
                    {scene.timeOfDay}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={12} />
                    {scene.pov}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="text-xs text-violet-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Sparkles size={12} />
                  AI Guidance
                </div>
                <div className="bg-violet-900/20 rounded-lg p-3 border border-violet-500/20">
                  <p className="text-white/80 text-xs leading-relaxed italic">
                    "{scene.aiShowrunner.emotional}"
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-3">
                  🧠 Remember
                </div>
                <div className="text-xs text-white/60 leading-relaxed">
                  Dr. Chen's encrypted message • Elena's grief • Mars Colony Zeta silence
                </div>
              </div>

              <button
                onClick={() => setShowSceneContext(false)}
                className="mt-4 w-full text-center text-xs text-white/40 hover:text-white/60 transition-all"
              >
                Закрити
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimal Footer - Autosave */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="backdrop-blur-xl bg-black/30 rounded-full px-4 py-2 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Save size={12} />
            <span>Збережено</span>
          </div>
        </div>
      </div>
    </div>
  );
}
