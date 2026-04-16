import { useState } from 'react';
import { CUISINE_CATEGORIES } from '../config/cuisine-types.js';

export function CategoryPicker({ busy, activeCategory, activeSub, onSelect, onClear }) {
  const [expanded, setExpanded] = useState(null);

  const handleCategoryClick = (cat) => {
    if (expanded === cat.id) {
      // Collapse — search the whole category
      setExpanded(null);
      onSelect(cat.id, null, cat.keyword, cat.googleType || null);
    } else {
      setExpanded(cat.id);
    }
  };

  const handleSubClick = (cat, sub) => {
    setExpanded(null);
    onSelect(cat.id, sub.id, sub.keyword, sub.googleType || null);
  };

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 16px', marginBottom: 10 }}>
      {/* Main categories — horizontal scroll */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {activeCategory && (
          <button
            onClick={onClear}
            disabled={busy}
            style={{
              flex: '0 0 auto',
              padding: '6px 12px',
              borderRadius: 20,
              border: '1.5px solid var(--color-accent-2)',
              background: 'rgba(255,107,107,.1)',
              color: 'var(--color-accent-2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ✕ 清除
          </button>
        )}
        {CUISINE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const isExpanded = expanded === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              disabled={busy}
              style={{
                flex: '0 0 auto',
                padding: '6px 14px',
                borderRadius: 20,
                border: isActive
                  ? '1.5px solid var(--color-accent)'
                  : isExpanded
                    ? '1.5px solid var(--color-dim)'
                    : '1.5px solid var(--color-surface-2)',
                background: isActive
                  ? 'rgba(245,158,66,.12)'
                  : isExpanded
                    ? 'var(--color-surface-2)'
                    : 'transparent',
                color: isActive
                  ? 'var(--color-accent)'
                  : isExpanded
                    ? 'var(--color-text)'
                    : 'var(--color-dim)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 12,
                cursor: busy ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: busy ? 0.5 : 1,
                transition: 'all .15s',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          );
        })}
      </div>

      {/* Subcategories — show when expanded */}
      {expanded && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingTop: 8,
            paddingBottom: 4,
            scrollbarWidth: 'none',
            animation: 'fadeUp .2s ease both',
          }}
        >
          {CUISINE_CATEGORIES.find((c) => c.id === expanded)?.subs.map((sub) => {
            const isActive = activeSub === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubClick(CUISINE_CATEGORIES.find((c) => c.id === expanded), sub)}
                disabled={busy}
                style={{
                  flex: '0 0 auto',
                  padding: '5px 12px',
                  borderRadius: 16,
                  border: isActive
                    ? '1.5px solid var(--color-accent)'
                    : '1.5px solid var(--color-surface-2)',
                  background: isActive ? 'rgba(245,158,66,.12)' : 'var(--color-surface)',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-dim)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: 11,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: busy ? 0.5 : 1,
                  transition: 'all .15s',
                }}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
