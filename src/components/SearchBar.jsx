import { useRef } from 'react';

const KEYWORD_SUGGESTIONS = [
  '拉麵', '麵店', '漢堡', '咖哩', '壽司', '火鍋', '披薩', '牛排',
  '早午餐', '素食', '甜點', '咖啡', '麵包', '便當', '炸雞', '燒肉', '小吃',
];

export function SearchBar({ keyword, activeKeyword, busy, filtered, onKeywordChange, onSearch, onClear }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
    inputRef.current?.blur();
  };

  const handleChipClick = (kw) => {
    onKeywordChange(kw);
    onSearch(kw);
  };

  return (
    <>
      {/* Search Input */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 16px', marginBottom: 8 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="搜尋想吃的... 拉麵、漢堡、curry"
              style={{
                width: '100%',
                padding: '11px 16px',
                paddingRight: activeKeyword ? 36 : 16,
                borderRadius: 40,
                border: '2px solid var(--color-surface-2)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color .2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-surface-2)')}
            />
            {activeKeyword && (
              <button
                type="button"
                onClick={onClear}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--color-surface-2)',
                  border: 'none',
                  color: 'var(--color-dim)',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              flexShrink: 0,
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
              color: '#fff',
              fontSize: 18,
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.5 : 1,
              transition: 'opacity .2s',
            }}
          >
            🔍
          </button>
        </form>

        {activeKeyword && !busy && (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                background: 'rgba(245,158,66,.15)',
                border: '1.5px solid var(--color-accent)',
                color: 'var(--color-accent)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              🔍 搜尋: 「{activeKeyword}」
              <span onClick={onClear} style={{ cursor: 'pointer', opacity: 0.7, fontSize: 10 }}>
                ✕ 清除
              </span>
            </span>
            <span style={{ color: 'var(--color-dim)', fontSize: 11 }}>{filtered.length} 間</span>
          </div>
        )}
      </section>

      {/* Keyword Chips */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {KEYWORD_SUGGESTIONS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleChipClick(kw)}
              disabled={busy}
              style={{
                flex: '0 0 auto',
                padding: '5px 12px',
                borderRadius: 20,
                border: activeKeyword === kw ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-surface-2)',
                background: activeKeyword === kw ? 'rgba(245,158,66,.12)' : 'transparent',
                color: activeKeyword === kw ? 'var(--color-accent)' : 'var(--color-dim)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 12,
                cursor: busy ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: busy ? 0.5 : 1,
                transition: 'all .15s',
              }}
            >
              {kw}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
