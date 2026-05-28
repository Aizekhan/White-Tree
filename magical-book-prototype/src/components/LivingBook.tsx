import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { InkParagraph } from './InkRevealText';
import { MagicalParticles, BookGlow } from './MagicalParticles';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookSpread {
  id: string;
  leftPage: {
    type: 'lore' | 'context' | 'suggestions';
    title?: string;
    content: string[];
  };
  rightPage: {
    type: 'narrative' | 'chapter';
    title?: string;
    content: string[];
  };
  mood?: 'dark' | 'warm' | 'epic';
}

interface LivingBookProps {
  spreads: BookSpread[];
  onGenerate?: () => void;
}

export const LivingBook = ({ spreads, onGenerate }: LivingBookProps) => {
  const book = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Ritual sequence before generation
    setTimeout(() => {
      onGenerate?.();
      setIsGenerating(false);
    }, 2000);
  };

  const nextPage = () => {
    book.current?.pageFlip()?.flipNext();
  };

  const prevPage = () => {
    book.current?.pageFlip()?.flipPrev();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full">
      {/* Ambient particles */}
      <MagicalParticles />

      {/* Subtle camera drift */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -5, 0],
          rotate: [0, 0.2, 0, -0.2, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Book glow */}
        <div className="absolute inset-0 -m-20">
          <BookGlow />
        </div>

        {/* Generation ritual glow */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 -m-32 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0.8, 1.2, 1, 1.2, 0.8]
            }}
            transition={{
              duration: 2,
              ease: 'easeInOut'
            }}
          >
            <div className="w-full h-full bg-gradient-radial from-amber-400/40 via-violet-500/20 to-transparent blur-3xl" />
          </motion.div>
        )}

        {/* The Book */}
        <motion.div
          className="relative shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <HTMLFlipBook
            ref={book}
            width={500}
            height={700}
            size="stretch"
            minWidth={300}
            maxWidth={600}
            minHeight={400}
            maxHeight={800}
            showCover={false}
            mobileScrollSupport={false}
            className="shadow-2xl"
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            maxShadowOpacity={0.8}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={(e) => setCurrentPage(e.data)}
          >
            {spreads.map((spread, spreadIndex) => (
              <>
                {/* Left Page - Context/Lore */}
                <div
                  key={`left-${spread.id}`}
                  className="relative bg-gradient-to-br from-[#f4e4c8] to-[#e8d4b8] overflow-hidden"
                  style={{
                    borderRight: '2px solid rgba(139, 90, 43, 0.3)',
                    boxShadow: 'inset -10px 0 20px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Page texture */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        radial-gradient(ellipse at 20% 30%, rgba(139, 90, 43, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 70%, rgba(101, 67, 33, 0.12) 0%, transparent 50%)
                      `
                    }}
                  />

                  {/* Center binding glow */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-amber-400/10 to-transparent" />

                  {/* Content */}
                  <div className="relative p-12 h-full flex flex-col">
                    {spread.leftPage.title && (
                      <h3
                        className="text-2xl font-bold text-amber-900 mb-6 text-center"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {spread.leftPage.title}
                      </h3>
                    )}

                    <div className="flex-1 space-y-4">
                      {spread.leftPage.content.map((paragraph, i) => (
                        <InkParagraph
                          key={i}
                          delay={i * 200}
                          speed={0.02}
                          className="text-sm text-amber-800 leading-relaxed italic"
                          style={{ fontFamily: "'IM Fell English', serif" } as any}
                        >
                          {paragraph}
                        </InkParagraph>
                      ))}
                    </div>

                    {/* Page number */}
                    <div className="text-center text-xs text-amber-700 mt-4">
                      {spreadIndex * 2}
                    </div>
                  </div>
                </div>

                {/* Right Page - Narrative */}
                <div
                  key={`right-${spread.id}`}
                  className="relative bg-gradient-to-bl from-[#f4e4c8] to-[#e8d4b8] overflow-hidden"
                  style={{
                    borderLeft: '2px solid rgba(139, 90, 43, 0.3)',
                    boxShadow: 'inset 10px 0 20px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Page texture */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        radial-gradient(ellipse at 30% 40%, rgba(139, 90, 43, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 60%, rgba(101, 67, 33, 0.12) 0%, transparent 50%)
                      `
                    }}
                  />

                  {/* Center binding glow */}
                  <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-amber-400/10 to-transparent" />

                  {/* Content */}
                  <div className="relative p-12 h-full flex flex-col">
                    {spread.rightPage.title && (
                      <h2
                        className="text-3xl font-bold text-amber-900 mb-8"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {spread.rightPage.title}
                      </h2>
                    )}

                    <div className="flex-1 space-y-4">
                      {spread.rightPage.content.map((paragraph, i) => (
                        <InkParagraph
                          key={i}
                          delay={i * 300}
                          speed={0.025}
                          className="text-base text-amber-900 leading-relaxed"
                          style={{ fontFamily: "'IM Fell English', serif" } as any}
                        >
                          {paragraph}
                        </InkParagraph>
                      ))}
                    </div>

                    {/* Page number */}
                    <div className="text-center text-xs text-amber-700 mt-4">
                      {spreadIndex * 2 + 1}
                    </div>
                  </div>
                </div>
              </>
            ))}
          </HTMLFlipBook>
        </motion.div>
      </motion.div>

      {/* Navigation controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 items-center">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="p-3 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md text-amber-200 text-sm font-semibold">
          Page {currentPage + 1} of {spreads.length * 2}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= spreads.length * 2 - 2}
          className="p-3 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>

        {/* Generate more button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="ml-4 px-6 py-3 rounded-full bg-violet-900/80 hover:bg-violet-800 text-amber-50 disabled:opacity-50 transition-all shadow-lg backdrop-blur-sm font-semibold"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {isGenerating ? 'Manifesting...' : 'Continue Story'}
        </button>
      </div>
    </div>
  );
};
