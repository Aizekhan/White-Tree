/**
 * Тест завантаження assets
 */

export default function TestAssets() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-2xl mb-8">Asset Loading Test</h1>

      <div className="space-y-8">

        {/* Test 1: StartBack.png */}
        <div className="border border-white/20 p-4 rounded">
          <h2 className="text-xl mb-4">1. StartBack.png (background)</h2>
          <img
            src="/images/backgrounds/StartBack.png"
            alt="Start background"
            className="w-full max-w-2xl border border-amber-400"
            onError={(e) => console.error('Failed to load StartBack.png', e)}
            onLoad={() => console.log('✅ StartBack.png loaded')}
          />
        </div>

        {/* Test 2: OpenedBook.jpg */}
        <div className="border border-white/20 p-4 rounded">
          <h2 className="text-xl mb-4">2. OpenedBook.jpg</h2>
          <img
            src="/images/book/OpenedBook.jpg"
            alt="Opened book"
            className="w-full max-w-2xl border border-amber-400"
            onError={(e) => console.error('Failed to load OpenedBook.jpg', e)}
            onLoad={() => console.log('✅ OpenedBook.jpg loaded')}
          />
        </div>

        {/* Test 3: Video */}
        <div className="border border-white/20 p-4 rounded">
          <h2 className="text-xl mb-4">3. StartStoryAnim.mp4</h2>
          <video
            src="/animations/StartStoryAnim.mp4"
            controls
            className="w-full max-w-2xl border border-amber-400"
            onError={(e) => console.error('Failed to load video', e)}
            onLoadedData={() => console.log('✅ Video loaded')}
          />
        </div>

      </div>

      <div className="mt-8 p-4 bg-blue-900/50 rounded">
        <p className="text-sm">Відкрий Console (F12) щоб побачити лог завантаження файлів</p>
      </div>
    </div>
  );
}
