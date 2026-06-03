/**
 * StartScreen - головний екран мага (маршрут /)
 * Еталон: flow.jsx StartScreen + WhiteWrite.html hero
 */

import { Sparkles, Video, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './StartScreen.css';

export default function StartScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateStory = () => {
    if (!user) {
      // TODO: Open login/registration modal
      alert('🔒 Увійдіть або зареєструйтеся\n\nТимчасова заглушка — модалку входу буде додано.');
      return;
    }
    // Navigate to create new project flow
    navigate('/projects?create=true');
  };

  const handleOrderBook = () => {
    // TODO: Open order book modal
    alert('📚 Замовлення книги\n\nВ розробці, скоро!\n\n// TODO: Real book ordering flow');
  };

  return (
    <div className="start-screen">
      {/* Background */}
      {/* TODO: Replace gradient with assets/StartBack.jpg when available */}
      <div className="start-screen__background" />

      {/* Logo Block - Top Left */}
      <div className="start-screen__logo">
        <img src="/assets/tree-logo.svg" alt="Tree" className="start-screen__tree" />
        <div className="start-screen__brand">
          <h2 className="start-screen__brand-name">WhiteWrite</h2>
          <p className="start-screen__brand-tagline">by White Tree</p>
        </div>
      </div>

      {/* Hero - Center */}
      <div className="start-screen__hero">
        <h1 className="start-screen__title">Твоя історія чекає</h1>
        <p className="start-screen__subtitle">
          Легко створюй казки, серіали, аніме, книги й документалки — будь-якого жанру.
        </p>
        <button className="start-screen__cta" onClick={handleCreateStory}>
          <Sparkles size={20} />
          Створити свою історію
        </button>
      </div>

      {/* Feature Card - Bottom Left */}
      <div className="start-screen__feature start-screen__feature--left">
        <div className="start-screen__feature-badge">нова можливість</div>
        <div className="start-screen__feature-icon">
          <Video size={32} />
        </div>
        <h3 className="start-screen__feature-title">🎬 Доведи історію до відео</h3>
        <p className="start-screen__feature-text">
          Розкадровка, діалоги з таймінгом, LoRA для персонажів —
          перетвори сценарій на готову відеопреподакшн.
        </p>
      </div>

      {/* Order Book Card - Right */}
      <div className="start-screen__feature start-screen__feature--right">
        <div className="start-screen__feature-icon">
          <BookOpen size={32} />
        </div>
        <h3 className="start-screen__feature-title">Замовити книгу</h3>
        <p className="start-screen__feature-text">
          Надрукуємо твій роман у твердій палітурці з авторською обкладинкою.
          Від 1 примірника.
        </p>
        <button className="start-screen__feature-btn" onClick={handleOrderBook}>
          Дізнатися більше
        </button>
      </div>
    </div>
  );
}
