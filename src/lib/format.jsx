export function photoSrc(ref, w = 120) {
  if (!ref) return null;
  return `/api/photo?ref=${encodeURIComponent(ref)}&w=${w}`;
}

export function placeEmoji(googleTypes) {
  if (googleTypes?.includes('bakery')) return '\u{1F370}';
  if (googleTypes?.includes('cafe')) return '\u2615';
  return '\u{1F374}';
}

export function Stars({ rating }) {
  if (!rating)
    return (
      <span style={{ color: 'var(--color-dim)', fontSize: 12 }}>
        尚無評分
      </span>
    );
  const f = Math.floor(rating);
  const h = rating % 1 >= 0.3;
  return (
    <span style={{ color: 'var(--color-accent)', fontSize: 13, letterSpacing: 1 }}>
      {'★'.repeat(f)}
      {h ? '½' : ''}
      {'☆'.repeat(5 - f - (h ? 1 : 0))}
      <span style={{ color: 'var(--color-dim)', marginLeft: 4, fontSize: 12 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}
