import { CUISINE_CATEGORIES } from '../config/cuisine-types.js';

const CUISINE_LEVELS = [
  { label: '不喜歡', value: 0, color: 'var(--color-accent-2)' },
  { label: '普通', value: 0.5, color: 'var(--color-dim)' },
  { label: '喜歡', value: 0.8, color: 'var(--color-accent-3)' },
  { label: '最愛', value: 1.0, color: 'var(--color-accent)' },
];

const DIETARY_OPTIONS = [
  { key: 'vegetarian', label: '素食', emoji: '🥬' },
  { key: 'vegan', label: '純素', emoji: '🌱' },
  { key: 'halalOnly', label: '清真', emoji: '🕌' },
  { key: 'glutenFree', label: '無麩質', emoji: '🌾' },
];

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-dim)', margin: '0 0 10px', letterSpacing: 1 }}>
      {children}
    </p>
  );
}

export function ProfilePanel({ show, profile, onSetCuisine, onToggleDietary, onUpdateProfile, onReset, onClose }) {
  if (!show) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 10, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(2px)' }}
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
        <div style={{ width: 40, height: 4, background: 'var(--color-surface-2)', borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: 0 }}>
            👤 口味偏好
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

        {/* Cuisine Preferences */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>🍽️ 料理偏好</SectionLabel>
          <p style={{ fontSize: 11, color: 'var(--color-dim)', margin: '-6px 0 12px', opacity: 0.7 }}>
            設定越喜歡的料理類型，推薦時權重越高
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CUISINE_CATEGORIES.map((cat) => {
              const currentValue = profile.cuisines[cat.id] ?? 0.5;
              const level = CUISINE_LEVELS.reduce((closest, l) =>
                Math.abs(l.value - currentValue) < Math.abs(closest.value - currentValue) ? l : closest,
              );
              return (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 80, fontSize: 13, fontWeight: 500 }}>
                    {cat.emoji} {cat.label}
                  </span>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {CUISINE_LEVELS.map((l) => {
                      const isOn = Math.abs(currentValue - l.value) < 0.1;
                      return (
                        <button
                          key={l.value}
                          onClick={() => onSetCuisine(cat.id, l.value)}
                          style={{
                            flex: 1,
                            padding: '5px 0',
                            borderRadius: 8,
                            border: isOn ? `2px solid ${l.color}` : '2px solid var(--color-surface-2)',
                            background: isOn ? `${l.color}20` : 'transparent',
                            color: isOn ? l.color : 'var(--color-dim)',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all .15s',
                          }}
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>⚠️ 飲食限制</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DIETARY_OPTIONS.map((d) => {
              const isOn = profile.dietary[d.key];
              return (
                <button
                  key={d.key}
                  onClick={() => onToggleDietary(d.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: isOn ? '2px solid var(--color-accent-3)' : '2px solid var(--color-surface-2)',
                    background: isOn ? 'rgba(93,228,167,.12)' : 'transparent',
                    color: isOn ? 'var(--color-accent-3)' : 'var(--color-dim)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {d.emoji} {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>💰 價位偏好</SectionLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4].map((level) => {
              const isInRange = level >= profile.priceRange.min && level <= profile.priceRange.max;
              return (
                <button
                  key={level}
                  onClick={() => {
                    const { min, max } = profile.priceRange;
                    if (isInRange) {
                      // Shrink range
                      if (level === min && level === max) return; // can't shrink to nothing
                      if (level === min) onUpdateProfile({ priceRange: { min: min + 1, max } });
                      else if (level === max) onUpdateProfile({ priceRange: { min, max: max - 1 } });
                    } else {
                      // Expand range
                      onUpdateProfile({
                        priceRange: { min: Math.min(min, level), max: Math.max(max, level) },
                      });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 12,
                    border: isInRange ? '2px solid var(--color-accent)' : '2px solid var(--color-surface-2)',
                    background: isInRange ? 'rgba(245,158,66,.15)' : 'transparent',
                    color: isInRange ? 'var(--color-accent)' : 'var(--color-dim)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {'$'.repeat(level)}
                </button>
              );
            })}
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
          🔄 重設偏好
        </button>
      </div>
    </>
  );
}
