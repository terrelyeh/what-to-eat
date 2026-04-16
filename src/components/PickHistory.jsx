export function PickHistory({ hist }) {
  if (!hist.length) return null;

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '24px 16px 0' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--color-dim)',
          marginBottom: 12,
        }}
      >
        抽選紀錄
      </h3>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {hist.map((h, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 auto',
              background: 'var(--color-surface)',
              borderRadius: 12,
              padding: '10px 14px',
              textAlign: 'center',
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 24 }}>{h.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap' }}>
              {h.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
