import { getSourcesForRegion } from '../config/review-sources.js';

/**
 * Compact mode: small icon buttons for restaurant cards
 * Full mode: larger buttons for SpinZone pick result
 */
export function ReviewLinks({ restaurant, regionId, compact = false }) {
  if (!regionId || !restaurant) return null;

  const sources = getSourcesForRegion(regionId);

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sources.map((s) => (
          <a
            key={s.id}
            href={s.urlBuilder(restaurant)}
            target="_blank"
            rel="noopener noreferrer"
            title={s.name}
            style={{
              padding: '4px 8px',
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 600,
              background: `${s.color}18`,
              color: s.color,
              textDecoration: 'none',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {s.icon} {s.name.length > 6 ? s.name.slice(0, 6) : s.name}
          </a>
        ))}
      </div>
    );
  }

  // Full mode
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {sources.map((s) => (
        <a
          key={s.id}
          href={s.urlBuilder(restaurant)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '9px 16px',
            borderRadius: 24,
            background: `${s.color}20`,
            border: `1.5px solid ${s.color}`,
            color: s.color,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {s.icon} {s.name}
        </a>
      ))}
    </div>
  );
}
