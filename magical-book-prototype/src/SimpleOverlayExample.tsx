import { useState } from 'react';

/**
 * ПРОСТИЙ ПРИКЛАД: Overlay textarea поверх картинки
 *
 * Концепція:
 * 1. Фонова картинка (сторінка книги)
 * 2. Прозорий textarea поверх неї
 * 3. Користувач пише → текст з'являється на "папері"
 */

export default function SimpleOverlayExample() {
  const [text, setText] = useState('');

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">

      {/* Заголовок пояснення */}
      <div className="absolute top-4 left-4 text-white">
        <h2 className="text-xl font-bold">Simple Overlay Example</h2>
        <p className="text-sm text-gray-400">Пиши в textarea поверх картинки →</p>
      </div>

      {/* Контейнер книги */}
      <div
        className="relative bg-amber-50 rounded-lg shadow-2xl"
        style={{
          width: '400px',
          height: '600px',
          // Фоновий градієнт імітує сторінку
          background: 'linear-gradient(to bottom, #fef3c7, #fde68a)',
        }}
      >

        {/* Декоративна рамка (межі тексту) */}
        <div className="absolute inset-0 border-8 border-amber-900/10 rounded-lg pointer-events-none" />

        {/* TEXTAREA ПОВЕРХ */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Почни писати тут..."
          className="
            absolute
            top-[80px]
            left-[40px]
            w-[320px]
            h-[440px]

            bg-transparent
            border-none
            outline-none
            resize-none

            text-amber-950
            font-serif
            text-lg
            leading-relaxed

            placeholder:text-amber-900/30
            placeholder:italic
          "
          style={{
            fontFamily: "'Cinzel', serif",
          }}
        />

        {/* Показуємо символи для debug */}
        <div className="absolute bottom-4 right-4 text-xs text-amber-900/50">
          {text.length} символів
        </div>

      </div>

      {/* Пояснення праворуч */}
      <div className="absolute top-4 right-4 bg-gray-800 text-white p-4 rounded-lg max-w-xs text-sm">
        <h3 className="font-bold mb-2">Як це працює:</h3>
        <ul className="space-y-1 text-gray-300">
          <li>✅ position: relative на контейнері</li>
          <li>✅ position: absolute на textarea</li>
          <li>✅ bg-transparent - прозорий фон</li>
          <li>✅ border-none - без рамки</li>
          <li>✅ Medieval шрифт Cinzel</li>
          <li>✅ Текст виглядає як на папері</li>
        </ul>
      </div>

    </div>
  );
}
