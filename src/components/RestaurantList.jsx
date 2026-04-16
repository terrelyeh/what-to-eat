import { RestaurantCard } from './RestaurantCard.jsx';

export function RestaurantList({ filtered, busy, activeKeyword, pick, done, regionId }) {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--color-dim)',
          marginBottom: 12,
        }}
      >
        附近餐廳 ({filtered.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!busy && !filtered.length && (
          <div
            style={{
              textAlign: 'center',
              padding: 32,
              color: 'var(--color-dim)',
              fontSize: 14,
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
            }}
          >
            {activeKeyword
              ? `找不到「${activeKeyword}」的相關餐廳，試試其他關鍵字？`
              : '沒有符合條件的餐廳 😢'}
          </div>
        )}
        {filtered.map((r, i) => (
          <RestaurantCard
            key={r.id}
            r={r}
            isSelected={pick?.id === r.id && done}
            index={i}
            regionId={regionId}
          />
        ))}
      </div>
    </section>
  );
}
