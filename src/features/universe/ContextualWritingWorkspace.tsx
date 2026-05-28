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
  text?: string;
  onTextChange?: (text: string) => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
}

export default function ContextualWritingWorkspace({
  scene,
  onBack,
  text: externalText,
  onTextChange,
  saveStatus = 'saved'
}: ContextualWritingWorkspaceProps) {
  const [text, setText] = useState(externalText || scene.storyText);
  const [showSceneContext, setShowSceneContext] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external text changes
  useEffect(() => {
    if (externalText !== undefined && externalText !== text) {
      setText(externalText);
    }
  }, [externalText]);

  // Handle text updates
  const handleTextChange = (newText: string) => {
    setText(newText);
    onTextChange?.(newText);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Persistent Atmospheric Background */}
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
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="backdrop-blur-xl bg-black/30 rounded-full px-4 py-2 border border-white/10">
            <div className="text-xs text-white/80 font-bold">
              {scene.title}
            </div>
          </div>

          <div className="text-xs text-white/40 backdrop-blur-sm bg-black/20 px-3 py-2 rounded-full border border-white/10">
            {text.length} characters
          </div>
        </div>
      </div>

      {/* Fullscreen Text Editor */}
      <div className="relative z-10 min-h-screen flex flex-col pt-20">
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Begin writing your story..."
          className="flex-1 w-full px-12 md:px-24 lg:px-32 py-12 font-serif text-xl leading-relaxed bg-transparent text-white/90 placeholder:text-white/20 focus:outline-none resize-none selection:bg-violet-500/30"
        />
      </div>

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

            <button
              onClick={() => setShowSceneContext(false)}
              className="mt-4 w-full text-center text-xs text-white/40 hover:text-white/60 transition-all"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autosave Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="backdrop-blur-xl bg-black/30 rounded-full px-4 py-2 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Save
              size={12}
              className={saveStatus === 'saving' ? 'animate-pulse' : ''}
            />
            <span>
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'unsaved' && 'Unsaved'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
