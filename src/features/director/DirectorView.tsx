/**
 * DirectorView - Режисер (розкадровка)
 * Placeholder для порту з WhiteWrite Workspace.html прототипу
 */

import { useEffect } from 'react';

export default function DirectorView() {
  useEffect(() => {
    console.log('[DirectorView] Mounted');
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
          🎬 Режисер
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--tx-mid)' }}>
          Розкадровка, кадри з діалогами, візуальний канон + LoRA.
          <br />
          <br />
          <em style={{ color: 'var(--gold-lit)' }}>
            Прототип: WhiteWrite Workspace.html (ws-*.jsx)
          </em>
        </p>
      </div>
    </div>
  );
}
