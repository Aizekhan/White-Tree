/**
 * ProjectsView - Проекти (список всесвітів)
 * Placeholder для порту з White.html (#view-narr)
 */

import { useEffect } from 'react';

export default function ProjectsView() {
  useEffect(() => {
    console.log('[ProjectsView] Mounted');
  }, []);

  return (
    <div
      className="view is-on"
      style={{
        position: 'absolute',
        top: '118px',
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        background: `radial-gradient(80% 50% at 100% 0%, rgba(124,58,237,0.07), transparent 60%),
                     radial-gradient(70% 50% at 0% 100%, rgba(217,119,6,0.06), transparent 55%),
                     var(--bg-0)`,
      }}
    >
      <div style={{ padding: 'max(4vh, 40px) 20px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '36px',
              color: 'var(--tx-hi)',
              marginBottom: '8px',
            }}
          >
            Ваші Проєкти
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--tx-mid)' }}>
            Керуйте вашими narrative всесвітами
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px',
          }}
        >
          {/* Placeholder карточки проектів */}
          <div
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              borderRadius: '13px',
              padding: '18px',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tx-mid)',
              fontStyle: 'italic',
            }}
          >
            <p style={{ textAlign: 'center' }}>
              Список проектів
              <br />
              (інтеграція з Firestore)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
