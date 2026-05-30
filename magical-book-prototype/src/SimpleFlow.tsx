import { useState } from 'react';

/**
 * ПРОСТИЙ ТЕСТ БЕЗ АНІМАЦІЙ
 * Просто переключення між 3 екранами
 */

type Stage = 'start' | 'ritual' | 'workspace';

export default function SimpleFlow() {
  const [stage, setStage] = useState<Stage>('start');

  return (
    <div className="min-h-screen w-full bg-black text-white">

      {/* Кнопки для debug */}
      <div className="fixed top-4 left-4 z-50 space-x-2">
        <button onClick={() => setStage('start')} className="bg-blue-500 px-4 py-2 rounded">
          Stage 1
        </button>
        <button onClick={() => setStage('ritual')} className="bg-green-500 px-4 py-2 rounded">
          Stage 2
        </button>
        <button onClick={() => setStage('workspace')} className="bg-purple-500 px-4 py-2 rounded">
          Stage 3
        </button>
      </div>

      {/* Info */}
      <div className="fixed top-4 right-4 z-50 bg-black/80 p-4 rounded text-sm">
        Current Stage: <strong>{stage}</strong>
      </div>

      {/* ===== STAGE 1: START ===== */}
      {stage === 'start' && (
        <div className="w-full h-screen relative">
          <img
            src="/images/backgrounds/StartBack.png"
            alt="Start background"
            className="w-full h-full object-cover"
            onError={() => console.error('❌ Failed to load StartBack.png')}
            onLoad={() => console.log('✅ StartBack.png loaded')}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setStage('ritual')}
              className="bg-amber-600 hover:bg-amber-500 text-white px-12 py-6 rounded-lg text-3xl font-bold shadow-2xl border-4 border-amber-400 transition-all hover:scale-110"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              🎬 Відкрити книгу
            </button>
          </div>
        </div>
      )}

      {/* ===== STAGE 2: RITUAL ===== */}
      {stage === 'ritual' && (
        <div className="w-full h-screen relative bg-gray-900">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onEnded={() => setStage('workspace')}
            onError={() => console.error('❌ Failed to load video')}
            onLoadedData={() => console.log('✅ Video loaded')}
          >
            <source src="/animations/StartStoryAnim.mp4" type="video/mp4" />
          </video>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
            Video відтворюється...
          </div>
        </div>
      )}

      {/* ===== STAGE 3: WORKSPACE ===== */}
      {stage === 'workspace' && (
        <div className="w-full h-screen relative bg-gray-950 flex items-center justify-center">
          <div className="relative max-w-5xl w-full">
            <img
              src="/images/book/OpenedBook.jpg"
              alt="Opened book"
              className="w-full h-auto"
              onError={() => console.error('❌ Failed to load OpenedBook.jpg')}
              onLoad={() => console.log('✅ OpenedBook.jpg loaded')}
            />

            {/* Textarea overlay */}
            <textarea
              placeholder="Пишіть тут..."
              className="absolute top-1/4 right-[10%] w-[35%] h-[60%] bg-yellow-100/30 border-2 border-red-500 p-4 text-black"
              style={{ fontFamily: "'Cinzel', serif" }}
            />

            <div className="absolute top-1/4 left-[10%] w-[35%] h-[60%] bg-blue-100/30 border-2 border-blue-500 p-4 text-black">
              AI текст тут
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
