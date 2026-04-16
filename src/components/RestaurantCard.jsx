import { Stars, photoSrc } from '../lib/format.jsx';
import { ReviewLinks } from './ReviewLinks.jsx';

export function RestaurantCard({ r, isSelected, index, regionId }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: isSelected ? 'rgba(245,158,66,.1)' : 'var(--color-surface)',
        borderRadius: 14,
        padding: '12px 14px',
        border: isSelected ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
        animation: `fadeUp .35s ease ${index * 0.03}s both`,
      }}
    >
      {/* Photo / Emoji */}
      {r.photo ? (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--color-surface-2)',
          }}
        >
          <img
            src={photoSrc(r.photo)}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          style={{
            fontSize: 28,
            width: 52,
            height: 52,
            background: 'var(--color-surface-2)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {r.emoji}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {r.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Stars rating={r.rating} />
          {r.reviews > 0 && (
            <span style={{ color: 'var(--color-dim)', fontSize: 10 }}>({r.reviews})</span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 3,
            fontSize: 11,
            color: 'var(--color-dim)',
            alignItems: 'center',
          }}
        >
          <span>{r.dist}m</span>
          <span>{r.openTxt}</span>
          {r.priceLevel > 0 && <span>{'$'.repeat(r.priceLevel)}</span>}
        </div>
      </div>

      {/* Review Links */}
      <ReviewLinks restaurant={r} regionId={regionId} compact />
    </div>
  );
}
