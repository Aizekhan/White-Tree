/**
 * UniverseView - Всесвіт (canon management)
 * Placeholder для порту з WhiteWrite WorldTree.html прототипу
 */

import { useEffect } from 'react';

export default function UniverseView() {
  useEffect(() => {
    console.log('[UniverseView] Mounted');
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-0)',
        color: 'var(--tx)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--gold-bright)',
            fontSize: '32px',
            marginBottom: '16px',
          }}
        >
          🌳 Всесвіт
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--tx-mid)' }}>
          Дерево канону: персонажі, локації, події, фракції, артефакти.
          <br />
          <br />
          <em style={{ color: 'var(--gold-lit)' }}>
            Прототип: WhiteWrite WorldTree.html (wt-*.jsx)
          </em>
        </p>
      </div>
    </div>
  );
}
