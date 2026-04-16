const RATING_MARKS = [
  { label: '不限', min: 0, max: 5 },
  { label: '3.0–5.0', min: 3.0, max: 5 },
  { label: '3.5–5.0', min: 3.5, max: 5 },
  { label: '3.5–4.5', min: 3.5, max: 4.5 },
  { label: '4.0+', min: 4.0, max: 5 },
];

const REVIEW_COUNTS = [
  { label: '不限', value: 0 },
  { label: '10+', value: 10 },
  { label: '50+', value: 50 },
  { label: '100+', value: 100 },
  { label: '500+', value: 500 },
];

const PRICE_LEVELS = [
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
  { label: '$$$$', value: 4 },
];

const SHOP_AGES = [
  { label: '不限', value: 'any' },
  { label: '新店探索', value: 'new', desc: '<30 則評論' },
  { label: '老字號', value: 'established', desc: '>200 則評論' },
];

function ChipGroup({ items, value, onChange, multi = false }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((item) => {
        const itemVal = item.value ?? item;
        const isActive = multi
          ? Array.isArray(value) && value.includes(itemVal)
          : value === itemVal;

        return (
          <button
            key={item.label}
            onClick={() => {
              if (multi) {
                const arr = Array.isArray(value) ? [...value] : [];
                const idx = arr.indexOf(itemVal);
                if (idx >= 0) arr.splice(idx, 1);
                else arr.push(itemVal);
                onChange(arr);
              } else {
                onChange(itemVal);
              }
            }}
            style={{
              flex: multi ? '0 0 auto' : 1,
              padding: '9px 12px',
              borderRadius: 12,
              border: isActive
                ? '2px solid var(--color-accent)'
                : '2px solid var(--color-surface-2)',
              background: isActive ? 'rgba(245,158,66,.15)' : 'transparent',
              color: isActive ? 'var(--color-accent)' : 'var(--color-dim)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s',
              textAlign: 'center',
            }}
          >
            <div>{item.label}</div>
            {item.desc && (
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{item.desc}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--color-dim)',
        margin: '0 0 10px',
        letterSpacing: 1,
      }}
    >
      {children}
    </p>
  );
}

export function FilterPanel({
  show,
  // Rating range
  ratingRange,
  onRatingRangeChange,
  // Min reviews
  minReviews,
  onMinReviewsChange,
  // Price levels
  priceLevels,
  onPriceLevelsChange,
  // Shop age
  shopAge,
  onShopAgeChange,
  // Open only
  openOnly,
  onOpenOnlyChange,
  // Actions
  onClose,
  onReset,
}) {
  if (!show) return null;

  const ratingPreset = RATING_MARKS.find(
    (r) => r.min === ratingRange.min && r.max === ratingRange.max,
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          background: 'rgba(0,0,0,.6)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 11,
          background: 'var(--color-surface)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,.4)',
          animation: 'slideUp .3s cubic-bezier(.17,.67,.21,1.05)',
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--color-surface-2)',
            borderRadius: 2,
            margin: '0 auto 20px',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 20,
              margin: 0,
            }}
          >
            篩選
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-2)',
              border: 'none',
              color: 'var(--color-dim)',
              fontSize: 18,
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Rating Range */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>📊 評分範圍</SectionLabel>
          <ChipGroup
            items={RATING_MARKS.map((r) => ({
              label: r.label,
              value: `${r.min}-${r.max}`,
            }))}
            value={`${ratingRange.min}-${ratingRange.max}`}
            onChange={(v) => {
              const [min, max] = v.split('-').map(Number);
              onRatingRangeChange({ min, max });
            }}
          />
        </div>

        {/* Min Reviews */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>💬 最低評論數</SectionLabel>
          <ChipGroup
            items={REVIEW_COUNTS}
            value={minReviews}
            onChange={onMinReviewsChange}
          />
        </div>

        {/* Price Level */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>💰 價位（可複選）</SectionLabel>
          <ChipGroup
            items={PRICE_LEVELS}
            value={priceLevels}
            onChange={onPriceLevelsChange}
            multi
          />
          <p style={{ fontSize: 11, color: 'var(--color-dim)', marginTop: 6, opacity: 0.6 }}>
            未選 = 不限・$ 便宜 / $$ 中等 / $$$ 偏高 / $$$$ 高級
          </p>
        </div>

        {/* Shop Age */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>🏪 店家類型</SectionLabel>
          <ChipGroup items={SHOP_AGES} value={shopAge} onChange={onShopAgeChange} />
        </div>

        {/* Open Only Toggle */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <SectionLabel>✅ 營業狀態</SectionLabel>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-dim)',
                  margin: '-6px 0 0',
                  opacity: 0.7,
                }}
              >
                只顯示營業中的餐廳
              </p>
            </div>
            <button
              onClick={() => onOpenOnlyChange((v) => !v)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                border: 'none',
                background: openOnly
                  ? 'var(--color-accent-3)'
                  : 'var(--color-surface-2)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background .2s',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: openOnly ? 24 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left .2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,.3)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: '1.5px solid var(--color-surface-2)',
            background: 'transparent',
            color: 'var(--color-dim)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 重設篩選條件
        </button>
      </div>
    </>
  );
}
