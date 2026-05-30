import { useState } from 'react';

export default function BookFlow() {
  const [stage, setStage] = useState<'start' | 'video' | 'book'>('start');
  const [userText, setUserText] = useState('');

  if (stage === 'start') {
    return (
      <div className="w-screen h-screen overflow-hidden relative bg-black">
        <img
          src="/images/backgrounds/StartBack.png"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={() => setStage('video')}
            className="bg-amber-600 hover:bg-amber-500 px-16 py-8 rounded-2xl text-4xl text-white font-bold shadow-2xl transition-transform hover:scale-105"
          >
            🎬 ВІДКРИТИ КНИГУ
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'video') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
        <video
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onEnded={() => {
            console.log('Video ended, moving to book...');
            setTimeout(() => setStage('book'), 500);
          }}
        >
          <source src="/animations/StartStoryAnim.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  // stage === 'book'
  return (
    <div className="w-screen h-screen overflow-hidden bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">

      {/* Фіксований контейнер з aspect-ratio книги */}
      <div
        className="relative"
        style={{
          width: '90vw',
          maxWidth: '1400px',
          aspectRatio: '16/9', // Підбери під свою книгу (наприклад 16:9 або 2:1)
        }}
      >
        {/* Книга - завжди заповнює контейнер */}
        <img
          src="/images/book/OpenedBook.jpg"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* ЛІВА СТОРІНКА - User пише тут */}
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Почніть писати вашу історію..."
          className="absolute bg-transparent border-none outline-none resize-none text-amber-950/90 placeholder:text-amber-900/25 placeholder:italic"
          style={{
            // Фіксовані координати відносно контейнера
            top: '20%',
            left: '15%',
            width: '30%',
            height: '60%',
            padding: '1rem',
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(12px, 1vw, 16px)', // Адаптивний розмір шрифту
            lineHeight: '1.8'
          }}
        />

        {/* ПРАВА СТОРІНКА - AI підказки */}
        <div
          className="absolute bg-transparent p-4 text-amber-950/70 overflow-hidden"
          style={{
            top: '20%',
            right: '15%',
            width: '30%',
            height: '60%',
            fontFamily: "'IM Fell English', serif",
            fontSize: 'clamp(11px, 0.9vw, 14px)',
            lineHeight: '1.8'
          }}
        >
          <div className="italic text-amber-900/60 mb-3">AI Showrunner шепоче:</div>
          <div>
            "Цікавий початок...

            Можливо додати деталей про атмосферу?

            Що відчуває персонаж у цей момент?"
          </div>
        </div>

        {/* Debug overlay з червоними рамками (для налаштування) */}
        {/* Видали коли все буде ідеально */}
        <div
          className="absolute border-2 border-red-500/30 pointer-events-none"
          style={{
            top: '20%',
            left: '15%',
            width: '30%',
            height: '60%',
          }}
        />
        <div
          className="absolute border-2 border-blue-500/30 pointer-events-none"
          style={{
            top: '20%',
            right: '15%',
            width: '30%',
            height: '60%',
          }}
        />
      </div>

      {/* Debug */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded text-xs">
        Stage: {stage} | User text: {userText.length} chars
      </div>
    </div>
  );
}
