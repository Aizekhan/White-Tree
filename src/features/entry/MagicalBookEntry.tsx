import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HTMLFlipBook from 'react-pageflip';
import { Sparkles, BookOpen, Wand2 } from 'lucide-react';

interface MagicalBookEntryProps {
  onEnterUniverse: (universePrompt: string) => void;
  onLogin: () => void;
  onSignup: () => void;
}

const MagicalBookEntry: React.FC<MagicalBookEntryProps> = ({
  onEnterUniverse,
  onLogin,
  onSignup
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [universePrompt, setUniversePrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const bookRef = useRef<any>(null);

  const flipToNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const flipToPrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Cinematic Background with Fire/Magic Atmosphere */}
      <div className="absolute inset-0">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0a] via-[#0a0a0a] to-[#0a0505]" />

        {/* Radial glow (fire-like) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-amber-900/30 via-orange-900/10 to-transparent blur-3xl" />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      </div>

      {/* Mysterious Keeper/Wizard Figure (left side) */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-48 h-96 pointer-events-none"
      >
        {/* Placeholder silhouette - можна замінити на реальну картинку */}
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-orange-950/60 to-transparent rounded-full blur-xl" />
          <Wand2 className="absolute top-1/3 left-1/2 -translate-x-1/2 w-16 h-16 text-amber-500/40" />
          <Sparkles className="absolute top-1/2 left-1/4 w-8 h-8 text-yellow-400/50 animate-pulse" />
        </div>
      </motion.div>

      {/* Main Content: Magical Book */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative"
        >
          {/* Book glow effect */}
          <div className="absolute -inset-20 bg-gradient-radial from-amber-600/20 via-orange-600/5 to-transparent blur-2xl" />

          {/* The Magical Book */}
          <div className="relative perspective-[2000px]">
            <HTMLFlipBook
              ref={bookRef}
              width={500}
              height={650}
              size="stretch"
              minWidth={400}
              maxWidth={600}
              minHeight={500}
              maxHeight={700}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={(e: any) => setCurrentPage(e.data)}
              className="shadow-2xl"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={1000}
              usePortrait={true}
              startZIndex={0}
              autoSize={true}
              maxShadowOpacity={0.8}
              showPageCorners={true}
              disableFlipByClick={false}
            >
              {/* Cover Page */}
              <div className="bg-[#2d1810] border-4 border-amber-900/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-orange-950/30" />
                <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <BookOpen className="w-24 h-24 text-amber-500 mb-8 drop-shadow-2xl" />
                  </motion.div>
                  <h1 className="font-serif text-5xl font-bold text-amber-100 mb-4 drop-shadow-lg">
                    Your Story Awaits
                  </h1>
                  <p className="text-amber-200/70 text-lg font-light mb-12">
                    Open the book to begin your journey
                  </p>
                  <motion.button
                    onClick={flipToNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-medium shadow-xl transition-all"
                  >
                    Open Book
                  </motion.button>
                </div>
              </div>

              {/* Page 1: The Beginning - OLD MAGICAL MANUSCRIPT STYLE */}
              <div className="bg-[#f4e4c8] relative overflow-hidden border-r-2 border-amber-900/40 shadow-inner">
                {/* Old paper texture with stains and aging */}
                <div className="absolute inset-0 opacity-40"
                     style={{
                       backgroundImage: `
                         radial-gradient(ellipse at 20% 30%, rgba(139, 90, 43, 0.1) 0%, transparent 50%),
                         radial-gradient(ellipse at 80% 70%, rgba(101, 67, 33, 0.08) 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 90%, rgba(160, 82, 45, 0.06) 0%, transparent 40%)
                       `,
                     }}
                />

                {/* Paper fiber texture */}
                <div className="absolute inset-0 opacity-20 mix-blend-multiply"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3' fill='%238B7355'/%3E%3C/svg%3E")`
                     }}
                />

                {/* Aged paper grain */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-amber-900/10" />

                <div className="relative h-full p-12 flex flex-col">
                  {/* Decorative corner ornaments */}
                  <div className="absolute top-8 left-8 w-16 h-16 opacity-30">
                    <svg viewBox="0 0 100 100" className="text-amber-800 fill-current">
                      <path d="M0,0 Q50,0 50,50 Q0,50 0,0 M10,10 Q40,10 40,40 Q10,40 10,10" />
                    </svg>
                  </div>
                  <div className="absolute top-8 right-8 w-16 h-16 opacity-30 transform rotate-90">
                    <svg viewBox="0 0 100 100" className="text-amber-800 fill-current">
                      <path d="M0,0 Q50,0 50,50 Q0,50 0,0 M10,10 Q40,10 40,40 Q10,40 10,10" />
                    </svg>
                  </div>

                  <div className="text-center mb-8">
                    {/* Illuminated chapter heading */}
                    <div className="mb-4">
                      <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-700/60 to-transparent mx-auto mb-3" />
                      <div className="flex items-center justify-center gap-2 text-amber-900/60 text-xs tracking-[0.3em] uppercase font-bold">
                        <span>✦</span>
                        <span>Chapter I</span>
                        <span>✦</span>
                      </div>
                    </div>

                    <h2 className="font-serif text-4xl font-bold text-amber-900 mb-3 tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                      The Beginning
                    </h2>

                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-px bg-amber-700/40" />
                      <svg width="20" height="20" viewBox="0 0 20 20" className="text-amber-700/60 fill-current">
                        <path d="M10,2 L12,8 L18,10 L12,12 L10,18 L8,12 L2,10 L8,8 Z" />
                      </svg>
                      <div className="w-12 h-px bg-amber-700/40" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-5 text-amber-950/90">
                    {/* Drop cap (illuminated first letter) */}
                    <p className="font-serif text-base leading-relaxed">
                      <span className="float-left text-6xl font-bold text-amber-800 leading-none mr-2 mt-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>I</span>
                      <span className="italic">n every writer's heart lies a universe waiting to be born, a realm of infinite possibility where the boundaries between dream and reality blur into stardust...</span>
                    </p>

                    <p className="font-serif text-base leading-relaxed indent-8">
                      A place where characters breathe with the essence of life, where worlds unfold like petals of an ancient rose, and stories come alive through the sacred magic of words inscribed by mortal hand and divine inspiration.
                    </p>

                    <p className="font-serif text-base leading-relaxed indent-8">
                      This is not merely a tool of craft. This is your portal—your mystical gateway to cinematic storytelling where the spirit of creation becomes your co-creator, your eternal muse, your keeper of infinite universes.
                    </p>

                    {/* Decorative quote box */}
                    <div className="border-l-2 border-amber-700/40 pl-4 py-2 my-6 bg-amber-900/5">
                      <p className="font-serif text-sm italic text-amber-800/80 leading-relaxed">
                        "Every story is a spell waiting to be cast upon the world."
                      </p>
                      <p className="font-serif text-xs text-amber-700/60 mt-1 text-right">
                        — Ancient Keeper's Wisdom
                      </p>
                    </div>
                  </div>

                  {/* Decorative bottom ornament */}
                  <div className="mt-6 flex justify-center">
                    <svg width="120" height="40" viewBox="0 0 120 40" className="text-amber-700/30 fill-current">
                      <path d="M10,20 Q30,10 60,20 Q90,30 110,20 M20,25 Q40,18 60,25 Q80,32 100,25" stroke="currentColor" strokeWidth="1" fill="none" />
                      <circle cx="60" cy="20" r="3" />
                      <circle cx="30" cy="15" r="1.5" />
                      <circle cx="90" cy="25" r="1.5" />
                    </svg>
                  </div>
                </div>

                {/* Page aging effects */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-amber-900/5 via-transparent to-amber-900/5" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none" />
              </div>

              {/* Page 2: Call to Action - OLD MAGICAL MANUSCRIPT STYLE */}
              <div className="bg-[#f4e4c8] relative overflow-hidden border-l-2 border-amber-900/40 shadow-inner">
                {/* Old paper texture with stains and aging */}
                <div className="absolute inset-0 opacity-40"
                     style={{
                       backgroundImage: `
                         radial-gradient(ellipse at 30% 40%, rgba(139, 90, 43, 0.12) 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 80%, rgba(101, 67, 33, 0.09) 0%, transparent 50%),
                         radial-gradient(ellipse at 60% 20%, rgba(160, 82, 45, 0.07) 0%, transparent 40%)
                       `,
                     }}
                />

                {/* Paper fiber texture */}
                <div className="absolute inset-0 opacity-20 mix-blend-multiply"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3' fill='%238B7355'/%3E%3C/svg%3E")`
                     }}
                />

                {/* Aged paper grain */}
                <div className="absolute inset-0 bg-gradient-to-bl from-amber-100/20 via-transparent to-amber-900/10" />

                {/* Decorative corner ornaments */}
                <div className="absolute bottom-8 right-8 w-16 h-16 opacity-30 transform rotate-180">
                  <svg viewBox="0 0 100 100" className="text-amber-800 fill-current">
                    <path d="M0,0 Q50,0 50,50 Q0,50 0,0 M10,10 Q40,10 40,40 Q10,40 10,10" />
                  </svg>
                </div>
                <div className="absolute bottom-8 left-8 w-16 h-16 opacity-30 transform rotate-270">
                  <svg viewBox="0 0 100 100" className="text-amber-800 fill-current">
                    <path d="M0,0 Q50,0 50,50 Q0,50 0,0 M10,10 Q40,10 40,40 Q10,40 10,10" />
                  </svg>
                </div>

                <div className="absolute inset-0 opacity-30" />

                <div className="relative h-full p-12 flex flex-col justify-center">
                  {/* Top decorative element */}
                  <div className="text-center mb-8">
                    <div className="mb-4">
                      <svg width="80" height="30" viewBox="0 0 80 30" className="mx-auto text-amber-700/40 fill-current">
                        <path d="M5,15 L20,15 M60,15 L75,15" stroke="currentColor" strokeWidth="1" fill="none" />
                        <circle cx="40" cy="15" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
                        <circle cx="40" cy="15" r="4" />
                      </svg>
                    </div>

                    <h2 className="font-serif text-3xl font-bold text-amber-900 mb-3 tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                      Describe the universe<br/>calling to you...
                    </h2>

                    <p className="text-amber-800/70 text-sm italic" style={{ fontFamily: "'IM Fell English', serif" }}>
                      What story seeks to be told?
                    </p>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="w-16 h-px bg-amber-700/30" />
                      <span className="text-amber-700/50 text-xs">✦</span>
                      <div className="w-16 h-px bg-amber-700/30" />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!showPromptInput ? (
                      <motion.div
                        key="options"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Main action button */}
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowPromptInput(true)}
                            className="w-full p-6 bg-gradient-to-br from-amber-700 to-amber-600 border-2 border-amber-900/50 text-white rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            {/* Decorative shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                            <span className="text-lg relative z-10">Begin New Universe</span>
                          </motion.button>
                          {/* Corner accents */}
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400/60" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400/60" />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400/60" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400/60" />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-amber-700/30" />
                          <span className="text-xs text-amber-700/60 uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                            or
                          </span>
                          <div className="flex-1 h-px bg-amber-700/30" />
                        </div>

                        {/* Auth buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onLogin}
                            className="flex-1 p-4 bg-amber-50/80 border-2 border-amber-700/30 text-amber-900 rounded-lg font-semibold hover:bg-amber-100/80 hover:border-amber-700/50 transition-all shadow-sm"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Login
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onSignup}
                            className="flex-1 p-4 bg-amber-50/80 border-2 border-amber-700/30 text-amber-900 rounded-lg font-semibold hover:bg-amber-100/80 hover:border-amber-700/50 transition-all shadow-sm"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Sign Up
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Ornamental border for textarea */}
                        <div className="relative">
                          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border border-amber-700/20 rounded-lg pointer-events-none" />
                          <textarea
                            autoFocus
                            value={universePrompt}
                            onChange={(e) => setUniversePrompt(e.target.value)}
                            placeholder="A lone astronaut discovers a signal from an ancient civilization..."
                            className="w-full h-48 bg-amber-50/80 border-2 border-amber-700/30 rounded-lg p-4 text-amber-950 resize-none focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50 placeholder:text-amber-800/40 shadow-inner"
                            style={{ fontFamily: "'IM Fell English', serif" }}
                          />
                          {/* Corner decorations */}
                          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-700/40" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-700/40" />
                          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-700/40" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-700/40" />
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowPromptInput(false)}
                            className="px-6 py-3 bg-amber-900/10 border border-amber-900/30 text-amber-900 rounded-lg font-medium hover:bg-amber-900/20 transition-all"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Back
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => universePrompt.trim() && onEnterUniverse(universePrompt)}
                            disabled={!universePrompt.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-600 border-2 border-amber-900/40 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Enter Universe
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </HTMLFlipBook>

            {/* Page navigation */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={flipToPrev}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-amber-900/30 text-amber-200 rounded-lg hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-amber-300/70 text-sm">
                Page {currentPage + 1}
              </span>
              <button
                onClick={flipToNext}
                disabled={currentPage >= 2}
                className="px-4 py-2 bg-amber-900/30 text-amber-200 rounded-lg hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ambient sparkles around the book */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            initial={{
              x: window.innerWidth / 2 + (Math.random() - 0.5) * 600,
              y: window.innerHeight / 2 + (Math.random() - 0.5) * 400,
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MagicalBookEntry;
