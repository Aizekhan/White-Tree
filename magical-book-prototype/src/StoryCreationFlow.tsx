import { useState } from 'react';

/**
 * ПОВНИЙ FLOW СТВОРЕННЯ ІСТОРІЇ
 *
 * Stage 0: Стартовий екран (маг + кнопка "Створити історію")
 * Stage 1: Форма налаштування (опис + опції)
 * Stage 2: Анімація відкриття книги (AI генерує в цей час)
 * Stage 3: Читання/редагування історії (навігація стрілками)
 */

type StoryType = 'single' | 'multi' | 'infinite';
type NarrativeMode = 'text-only' | 'with-preprod' | 'with-sketches';

interface StoryConfig {
  description: string;
  storyType: StoryType;
  sceneLength: number;
  acts?: number;
  scenesPerAct?: number;
  narrativeMode: NarrativeMode;
}

interface Page {
  id: number;
  content: string;
}

type Stage = 'start' | 'config' | 'generating' | 'reading';

export default function StoryCreationFlow() {
  const [stage, setStage] = useState<Stage>('start');
  const [config, setConfig] = useState<StoryConfig>({
    description: '',
    storyType: 'single',
    sceneLength: 500,
    narrativeMode: 'text-only',
  });

  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Створення історії
  const handleCreateStory = () => {
    setStage('generating');

    // Симуляція AI generation (замість цього буде реальний Gemini)
    setTimeout(() => {
      // MOCK: генеруємо 10 сторінок тексту
      const mockPages: Page[] = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        content: `Сторінка ${i + 1}

У 2157 році людство досягло зірок, створивши колонії по всій сонячній системі.

Зв'язок між світами залежав від квантових ретрансляційних станцій — стародавніх таємничих структур.

Коли ретранслятори почали виходити з ладу, тиша опустилася на космос, ізолюючи кожну колонію в темряві простору.`,
      }));

      setPages(mockPages);
      setStage('reading');
    }, 3000); // 3 секунди на "генерацію" (довжина відео)
  };

  // Навігація
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const currentPage = pages[currentPageIndex];
  const nextPage = pages[currentPageIndex + 1];

  // ============================================
  // STAGE 0: СТАРТОВИЙ ЕКРАН (з магом)
  // ============================================
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
            onClick={() => setStage('config')}
            className="bg-amber-600 hover:bg-amber-500 px-16 py-8 rounded-2xl text-4xl text-white font-bold shadow-2xl transition-transform hover:scale-105"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ✨ Створити нову історію
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // STAGE 1: ФОРМА НАЛАШТУВАННЯ
  // ============================================
  if (stage === 'config') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">

        {/* Кнопка назад */}
        <button
          onClick={() => setStage('start')}
          className="absolute top-8 left-8 text-amber-200 hover:text-amber-100 flex items-center space-x-2 text-lg transition-colors z-30"
        >
          <span>←</span>
          <span>Назад</span>
        </button>

        {/* Пергамент контейнер */}
        <div
          className="relative max-w-xl w-full mx-4 p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
          style={{
            backgroundImage: 'url(/images/ornaments/pergament.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Темний overlay для читабельності */}
          <div className="absolute inset-0 bg-amber-950/10 pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-3xl text-amber-950 mb-6 text-center font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              ✨ Налаштування історії
            </h1>

          {/* Опис історії */}
          <div className="mb-5">
            <label className="block text-amber-950 mb-2 font-semibold">Опишіть вашу історію:</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Наприклад: Науково-фантастична історія про космічну станцію..."
              className="w-full h-24 bg-amber-50/80 border-2 border-amber-900/30 rounded p-3 text-amber-950 placeholder:text-amber-900/40 resize-none text-sm"
              style={{ fontFamily: "'Cinzel', serif" }}
            />
          </div>

          {/* Тип історії */}
          <div className="mb-5">
            <label className="block text-amber-950 mb-2 font-semibold">Тип історії:</label>
            <div className="space-y-1.5 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={config.storyType === 'single'}
                  onChange={() => setConfig({ ...config, storyType: 'single' })}
                  className="w-4 h-4"
                />
                <span className="text-amber-950">Односерійний наратив</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={config.storyType === 'multi'}
                  onChange={() => setConfig({ ...config, storyType: 'multi', acts: 3, scenesPerAct: 5 })}
                  className="w-4 h-4"
                />
                <span className="text-amber-950">Багатосерійний</span>
              </label>

              {config.storyType === 'multi' && (
                <div className="ml-6 space-y-1.5 mt-1.5">
                  <div className="flex items-center">
                    <label className="text-amber-950 text-xs">Кількість актів:</label>
                    <input
                      type="number"
                      value={config.acts}
                      onChange={(e) => setConfig({ ...config, acts: parseInt(e.target.value) })}
                      className="ml-2 w-16 bg-amber-50/80 border border-amber-900/30 rounded px-2 py-0.5 text-amber-950 text-xs"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="text-amber-950 text-xs">Сцен в акті:</label>
                    <input
                      type="number"
                      value={config.scenesPerAct}
                      onChange={(e) => setConfig({ ...config, scenesPerAct: parseInt(e.target.value) })}
                      className="ml-2 w-16 bg-amber-50/80 border border-amber-900/30 rounded px-2 py-0.5 text-amber-950 text-xs"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={config.storyType === 'infinite'}
                  onChange={() => setConfig({ ...config, storyType: 'infinite', scenesPerAct: 10 })}
                  className="w-4 h-4"
                />
                <span className="text-amber-950">Безкінечний</span>
              </label>

              {config.storyType === 'infinite' && (
                <div className="ml-6 mt-1.5">
                  <label className="text-amber-950 text-xs">Сцен в акті:</label>
                  <input
                    type="number"
                    value={config.scenesPerAct}
                    onChange={(e) => setConfig({ ...config, scenesPerAct: parseInt(e.target.value) })}
                    className="ml-2 w-16 bg-amber-50/80 border border-amber-900/30 rounded px-2 py-0.5 text-amber-950 text-xs"
                    min="1"
                    max="50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Довжина сцен */}
          <div className="mb-5">
            <label className="block text-amber-950 mb-2 font-semibold">Довжина сцен (слів):</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={config.sceneLength}
              onChange={(e) => setConfig({ ...config, sceneLength: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-amber-950 text-center mt-1 text-sm font-semibold">{config.sceneLength} слів</div>
          </div>

          {/* Режим narrative */}
          <div className="mb-6">
            <label className="block text-amber-950 mb-2 font-semibold">Додаткові опції:</label>
            <div className="space-y-1.5 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={config.narrativeMode === 'text-only'}
                  onChange={() => setConfig({ ...config, narrativeMode: 'text-only' })}
                  className="w-4 h-4"
                />
                <span className="text-amber-950">Тільки наратив (текст)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={config.narrativeMode === 'with-preprod'}
                  onChange={() => setConfig({ ...config, narrativeMode: 'with-preprod' })}
                  className="w-4 h-4"
                />
                <span className="text-amber-950">🎬 Preprod для відеороликів</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={config.narrativeMode === 'with-sketches'}
                  onChange={() => setConfig({ ...config, narrativeMode: 'with-sketches' })}
                  className="w-4 h-4"
                />
                <span className="text-amber-950">🎨 З картинками/ескізами</span>
              </label>
            </div>
          </div>

          {/* Кнопка створення */}
          <button
            onClick={handleCreateStory}
            disabled={!config.description.trim()}
            className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg text-lg font-bold shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ✨ Створити історію
          </button>
        </div>
      </div>
    </div>
    );
  }

  // ============================================
  // STAGE 2: ГЕНЕРАЦІЯ (під час анімації відкриття книги)
  // ============================================
  if (stage === 'generating') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
        <video
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/animations/StartStoryAnim.mp4" type="video/mp4" />
        </video>

        {/* Overlay з прогресом генерації */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center">
            <div className="text-3xl text-amber-100 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              ✨ AI створює вашу історію...
            </div>
            <div className="text-amber-200/60">
              Генерування наративу, персонажів, світобудови...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STAGE 3: ЧИТАННЯ (з навігацією стрілками)
  // ============================================
  return (
    <div className="w-screen h-screen overflow-hidden bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">

      <div
        className="relative"
        style={{
          width: '90vw',
          maxWidth: '1400px',
          aspectRatio: '16/9',
        }}
      >
        {/* Книга */}
        <img
          src="/images/book/OpenedBook.jpg"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* ЛІВА СТОРІНКА - поточна */}
        <div
          className="absolute bg-transparent p-6 text-amber-950/90 overflow-hidden"
          style={{
            top: '20%',
            left: '15%',
            width: '30%',
            height: '60%',
            fontFamily: "'IM Fell English', serif",
            fontSize: 'clamp(11px, 0.9vw, 14px)',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap'
          }}
        >
          {currentPage?.content}
        </div>

        {/* ПРАВА СТОРІНКА - наступна */}
        <div
          className="absolute bg-transparent p-6 text-amber-950/90 overflow-hidden"
          style={{
            top: '20%',
            right: '15%',
            width: '30%',
            height: '60%',
            fontFamily: "'IM Fell English', serif",
            fontSize: 'clamp(11px, 0.9vw, 14px)',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap'
          }}
        >
          {nextPage?.content || ''}
        </div>
      </div>

      {/* Навігація стрілками */}
      {currentPageIndex > 0 && (
        <button
          onClick={goToPrevPage}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-amber-900/50 hover:bg-amber-800/70 text-amber-100 p-4 rounded-full text-3xl transition-all"
        >
          ←
        </button>
      )}

      {currentPageIndex < pages.length - 2 && (
        <button
          onClick={goToNextPage}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-amber-900/50 hover:bg-amber-800/70 text-amber-100 p-4 rounded-full text-3xl transition-all"
        >
          →
        </button>
      )}

      {/* Кнопка edit mode */}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className="absolute top-8 right-8 bg-amber-900/50 hover:bg-amber-800/70 text-amber-100 px-4 py-2 rounded-lg text-sm transition-all"
      >
        {isEditMode ? '📖 Режим читання' : '✏️ Редагувати'}
      </button>

      {/* Debug */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded text-xs">
        Сторінки: {currentPageIndex + 1}-{currentPageIndex + 2} / {pages.length}
      </div>
    </div>
  );
}
