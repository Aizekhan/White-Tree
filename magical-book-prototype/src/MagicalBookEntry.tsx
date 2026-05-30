import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MAGICAL BOOK ENTRY - 3 Stage Flow
 *
 * Stage 1: StartBack.png (маг в бібліотеці) + підказка "Торкніться..."
 * Stage 2: StartStoryAnim.mp4 (анімація відкриття книги)
 * Stage 3: OpenedBook.jpg (відкрита книга) + overlay textarea для writing
 */

type Stage = 'start' | 'ritual' | 'workspace';

export default function MagicalBookEntry() {
  const [stage, setStage] = useState<Stage>('start');
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Симуляція AI генерації (ink reveal effect)
  const simulateAIGeneration = () => {
    const narrative = `У 2157 році людство досягло зірок, створивши колонії по всій сонячній системі.

Зв'язок між світами залежав від квантових ретрансляційних станцій — стародавніх таємничих структур.

Коли ретранслятори почали виходити з ладу, тиша опустилася на космос...`;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= narrative.length) {
        setAiText(narrative.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 40);
  };

  // Обробка кліку на стартовому екрані
  const handleStartClick = () => {
    console.log('🎬 Start clicked, transitioning to ritual...');
    setStage('ritual');

    // Запускаємо відео
    setTimeout(() => {
      if (videoRef.current) {
        console.log('▶️ Playing video...');
        videoRef.current.play();
      }
    }, 100);
  };

  // Коли відео закінчилося → перехід до workspace
  const handleVideoEnd = () => {
    console.log('✅ Video ended, transitioning to workspace...');
    setStage('workspace');

    // Через 1 секунду AI починає генерувати текст
    setTimeout(() => {
      console.log('🤖 AI generation started...');
      simulateAIGeneration();
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-black">

      {/* ========================================
          STAGE 1: START (StartBack.png)
      ======================================== */}
      <AnimatePresence>
        {stage === 'start' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 cursor-pointer z-10"
            onClick={handleStartClick}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: 'url(/images/backgrounds/StartBack.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Легкий dark overlay */}
            <div className="absolute inset-0 bg-black/20 z-10" />

            {/* Підказка */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 2 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div className="text-center">
                <p
                  className="text-amber-100 text-3xl tracking-widest mb-4"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    textShadow: '0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4)'
                  }}
                >
                  Торкніться щоб розпочати...
                </p>

                {/* Pulsing line */}
                <motion.div
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleX: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-64 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================
          STAGE 2: RITUAL (StartStoryAnim.mp4)
      ======================================== */}
      <AnimatePresence>
        {stage === 'ritual' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Video анімація */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={handleVideoEnd}
              muted
              playsInline
            >
              <source src="/animations/StartStoryAnim.mp4" type="video/mp4" />
            </video>

            {/* Subtle glow overlay */}
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================
          STAGE 3: WORKSPACE (OpenedBook.jpg)
      ======================================== */}
      <AnimatePresence>
        {stage === 'workspace' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Dark background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black" />

            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-radial from-amber-950/20 via-transparent to-transparent" />

            {/* OpenedBook.jpg - центруємо книгу */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative max-w-6xl w-full">

                {/* Книга */}
                <img
                  src="/images/book/OpenedBook.jpg"
                  alt="Opened magical book"
                  className="w-full h-auto"
                  style={{
                    filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.7))'
                  }}
                />

                {/* Book glow effect */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-radial from-amber-400/10 via-transparent to-transparent blur-xl pointer-events-none"
                />

                {/* ЛІВА СТОРІНКА: AI Generated Text */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    top: '18%',
                    left: '12%',
                    width: '32%',
                    height: '65%',
                  }}
                >
                  <div
                    className="p-6 text-amber-950/90 leading-relaxed"
                    style={{
                      fontFamily: "'IM Fell English', serif",
                      fontSize: '14px',
                      lineHeight: '2',
                    }}
                  >
                    {aiText}

                    {/* Cursor якщо AI ще пише */}
                    {aiText.length > 0 && aiText.length < 300 && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-5 bg-amber-900/80 ml-1"
                      />
                    )}
                  </div>
                </div>

                {/* ПРАВА СТОРІНКА: User Textarea (overlay) */}
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Почніть писати вашу історію..."
                  className="
                    absolute
                    bg-transparent
                    border-none
                    outline-none
                    resize-none
                    text-amber-950/90
                    placeholder:text-amber-900/25
                    placeholder:italic
                  "
                  style={{
                    top: '18%',
                    right: '12%',
                    width: '32%',
                    height: '65%',
                    padding: '1.5rem',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '14px',
                    lineHeight: '2',
                  }}
                />
              </div>
            </div>

            {/* Debug info */}
            <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono space-y-1 bg-black/50 p-3 rounded">
              <div>Stage: {stage}</div>
              <div>User: {userText.length} символів</div>
              <div>AI: {aiText.length} символів</div>
            </div>

            {/* Підказка */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 text-amber-100/60 text-sm text-center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              AI генерує наратив на лівій сторінці • Ви пишете на правій
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
