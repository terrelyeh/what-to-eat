export function Header({ loading, loc, error, left, dailyLimit, onRetry }) {
  return (
    <header
      style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '36px 16px 12px',
      }}
    >
      <div style={{ fontSize: 44, animation: 'wobble 2.5s ease-in-out infinite' }}>
        🎰
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 32,
          margin: '8px 0 2px',
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        今天吃什麼？
      </h1>
      <p style={{ color: 'var(--color-dim)', fontSize: 13, margin: '4px 0 0' }}>
        {loading
          ? '📡 定位中...'
          : loc
            ? '📍 已定位'
            : '❌ 無法定位'}
        {!loc && !loading && (
          <button
            onClick={onRetry}
            style={{
              marginLeft: 8,
              padding: '3px 10px',
              borderRadius: 20,
              border: '1px solid var(--color-accent)',
              background: 'transparent',
              color: 'var(--color-accent)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            🔄 重試
          </button>
        )}
      </p>
      {error && (
        <p style={{ color: 'var(--color-accent-2)', fontSize: 12, margin: '4px 0 0' }}>
          ⚠️ {error}
        </p>
      )}
      <p
        style={{
          color: 'var(--color-dim)',
          fontSize: 11,
          margin: '2px 0 0',
          opacity: 0.5,
        }}
      >
        今日剩餘搜尋：{left} / {dailyLimit}
      </p>
    </header>
  );
}
