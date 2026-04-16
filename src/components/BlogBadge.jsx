import { useState } from 'react';

export function BlogBadge({ blogData, loading }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div style={{ fontSize: 11, color: 'var(--color-dim)', marginTop: 6 }}>
        搜尋食記中...
      </div>
    );
  }

  if (!blogData) return null;

  const { blogCount, articles, tags } = blogData;

  return (
    <div style={{ marginTop: 10, animation: 'fadeUp .3s ease both' }}>
      {/* Blog count badge + tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {blogCount > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '4px 12px',
              borderRadius: 12,
              border: '1.5px solid var(--color-accent)',
              background: 'rgba(245,158,66,.1)',
              color: 'var(--color-accent)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            📝 {blogCount > 999 ? '999+' : blogCount} 篇食記
            <span style={{ fontSize: 9, opacity: 0.7 }}>{expanded ? '▲' : '▼'}</span>
          </button>
        )}

        {blogCount === 0 && !blogData.fallback && (
          <span style={{ fontSize: 11, color: 'var(--color-dim)' }}>📝 尚無食記</span>
        )}

        {/* Tags from blog content */}
        {tags?.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '3px 8px',
              borderRadius: 8,
              background: 'var(--color-surface-2)',
              color: 'var(--color-dim)',
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Expanded article list */}
      {expanded && articles?.length > 0 && (
        <div
          style={{
            marginTop: 8,
            background: 'var(--color-surface-2)',
            borderRadius: 12,
            padding: 12,
            animation: 'fadeUp .2s ease both',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-dim)', marginBottom: 8 }}>
            📖 相關食記
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: 'var(--color-accent-3)',
                  textDecoration: 'none',
                  lineHeight: 1.4,
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span style={{ color: 'var(--color-dim)', fontSize: 10, marginRight: 4 }}>
                  {article.source === 'ifoodie'
                    ? '愛食記'
                    : article.source === 'walkerland'
                      ? '窩客島'
                      : article.source === 'tabelog'
                        ? '食べログ'
                        : article.source === 'naver_blog'
                          ? 'Naver'
                          : '食記'}
                </span>
                {article.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
