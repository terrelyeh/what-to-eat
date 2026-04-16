export function DishRecommendation({ dishes }) {
  if (!dishes) return null;
  const { recommended, avoid } = dishes;
  if (!recommended?.length && !avoid?.length) return null;

  return (
    <div
      style={{
        marginTop: 10,
        background: 'var(--color-surface-2)',
        borderRadius: 12,
        padding: 12,
        animation: 'fadeUp .3s ease .1s both',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
        🍽️ 網友推薦菜色
      </div>

      {recommended?.length > 0 && (
        <div style={{ marginBottom: avoid?.length ? 8 : 0 }}>
          {recommended.map((dish, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                color: 'var(--color-accent-3)',
                padding: '3px 0',
                lineHeight: 1.4,
              }}
            >
              👍 {dish}
            </div>
          ))}
        </div>
      )}

      {avoid?.length > 0 && (
        <div>
          {avoid.map((dish, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                color: 'var(--color-accent-2)',
                padding: '3px 0',
                lineHeight: 1.4,
                opacity: 0.8,
              }}
            >
              👎 {dish}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
