const DISTANCES = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
];

export function FilterBar({ radius, activeFilters, onRadiusChange, onOpenFilter, onResetPick }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        {DISTANCES.map((d) => {
          const on = radius === d.value;
          return (
            <button
              key={d.value}
              onClick={() => {
                onRadiusChange(d.value);
                onResetPick();
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 40,
                border: on ? '2px solid var(--color-accent)' : '2px solid transparent',
                background: on ? 'rgba(245,158,66,.15)' : 'var(--color-surface)',
                color: on ? 'var(--color-accent)' : 'var(--color-dim)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={onOpenFilter}
        style={{
          position: 'relative',
          padding: '8px 14px',
          borderRadius: 40,
          border: activeFilters > 0 ? '2px solid var(--color-accent)' : '2px solid var(--color-surface-2)',
          background: activeFilters > 0 ? 'rgba(245,158,66,.15)' : 'var(--color-surface)',
          color: activeFilters > 0 ? 'var(--color-accent)' : 'var(--color-dim)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
        }}
      >
        ⚙️ 篩選
        {activeFilters > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--color-accent-2)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {activeFilters}
          </span>
        )}
      </button>
    </>
  );
}
