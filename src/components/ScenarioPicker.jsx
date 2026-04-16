import { SCENARIOS } from '../config/scenarios.js';

export function ScenarioPicker({ activeScenario, onSelect }) {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {/* Clear button */}
        {activeScenario && (
          <button
            onClick={() => onSelect(null)}
            style={{
              flex: '0 0 auto',
              padding: '8px 12px',
              borderRadius: 14,
              border: '1.5px solid var(--color-accent-2)',
              background: 'rgba(255,107,107,.1)',
              color: 'var(--color-accent-2)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ✕ 不限
          </button>
        )}
        {SCENARIOS.map((s) => {
          const isActive = activeScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(isActive ? null : s.id)}
              style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                borderRadius: 14,
                border: isActive
                  ? '1.5px solid var(--color-accent)'
                  : '1.5px solid var(--color-surface-2)',
                background: isActive ? 'rgba(245,158,66,.12)' : 'var(--color-surface)',
                color: isActive ? 'var(--color-accent)' : 'var(--color-dim)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .15s',
                textAlign: 'left',
              }}
            >
              <div>
                {s.emoji} {s.label}
              </div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{s.desc}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
