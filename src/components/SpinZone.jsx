import { Stars, photoSrc } from '../lib/format.jsx';
import { ReviewLinks } from './ReviewLinks.jsx';
import { BlogBadge } from './BlogBadge.jsx';
import { DishRecommendation } from './DishRecommendation.jsx';

function PlaceDetailsBadges({ details, loading }) {
  if (loading) {
    return (
      <div style={{ fontSize: 11, color: 'var(--color-dim)', marginTop: 6 }}>
        載入詳細資訊...
      </div>
    );
  }
  if (!details) return null;

  return (
    <div style={{ marginTop: 8, animation: 'fadeUp .3s ease both' }}>
      {/* Opening hours */}
      {details.todayHours && (
        <div style={{ fontSize: 12, color: 'var(--color-dim)', marginBottom: 4 }}>
          🕐 今日 {details.todayHours}
        </div>
      )}

      {/* Closing warning */}
      {details.closingWarning && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 8,
            display: 'inline-block',
            marginBottom: 6,
            background:
              details.closingWarning.level === 'urgent'
                ? 'rgba(255,107,107,.15)'
                : details.closingWarning.level === 'warning'
                  ? 'rgba(245,158,66,.15)'
                  : 'rgba(93,228,167,.1)',
            color:
              details.closingWarning.level === 'urgent'
                ? 'var(--color-accent-2)'
                : details.closingWarning.level === 'warning'
                  ? 'var(--color-accent)'
                  : 'var(--color-accent-3)',
          }}
        >
          {details.closingWarning.text}
        </div>
      )}

      {/* Attribute tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {details.dineIn && <AttrTag>🍽️ 內用</AttrTag>}
        {details.takeout && <AttrTag>📦 外帶</AttrTag>}
        {details.delivery && <AttrTag>🛵 外送</AttrTag>}
        {details.reservable && <AttrTag>📞 可訂位</AttrTag>}
        {details.servesBeer && <AttrTag>🍺 有酒</AttrTag>}
        {details.servesVegetarian && <AttrTag>🥬 素食</AttrTag>}
        {details.wheelchairAccessible && <AttrTag>♿ 無障礙</AttrTag>}
      </div>
    </div>
  );
}

function AttrTag({ children }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 6,
        background: 'var(--color-surface-2)',
        color: 'var(--color-dim)',
      }}
    >
      {children}
    </span>
  );
}

export function SpinZone({
  filtered,
  spinning,
  pick,
  done,
  busy,
  onSpin,
  // Region
  regionId,
  // Place details
  placeDetails,
  placeDetailsLoading,
  // Blog data
  blogData,
  blogLoading,
  // History actions
  isFav,
  isBlocked,
  onToggleFavorite,
  onToggleBlacklist,
}) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '0 16px',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Display Area */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          minHeight: 180,
          background: done
            ? 'linear-gradient(145deg, rgba(245,158,66,.12), rgba(255,107,107,.08))'
            : 'var(--color-surface)',
          borderRadius: 'var(--radius)',
          border: done ? '2px solid var(--color-accent)' : '2px solid var(--color-surface-2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          transition: 'all .4s',
          boxShadow: done ? '0 0 40px rgba(245,158,66,.15)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Confetti */}
        {done && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${8 + Math.random() * 84}%`,
                  top: -10,
                  width: 6 + Math.random() * 6,
                  height: 6 + Math.random() * 6,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  background: ['var(--color-accent)', 'var(--color-accent-2)', 'var(--color-accent-3)', '#fff'][
                    Math.floor(Math.random() * 4)
                  ],
                  opacity: 0.7,
                  animation: `confetti ${1.2 + Math.random() * 1.5}s ease-out ${i * 0.06}s forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!pick && !spinning && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
            <p style={{ color: 'var(--color-dim)', fontSize: 14, margin: 0 }}>
              {filtered.length > 0
                ? `共 ${filtered.length} 間餐廳，按下面按鈕隨機挑選！`
                : busy
                  ? '搜尋中...'
                  : '沒有符合條件的餐廳'}
            </p>
          </div>
        )}

        {/* Pick Display */}
        {pick && (
          <div
            style={{
              textAlign: 'center',
              width: '100%',
              animation: spinning ? 'tick .1s' : done ? 'popIn .5s cubic-bezier(.17,.67,.21,1.25)' : 'none',
            }}
          >
            {pick.photo && !spinning ? (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  overflow: 'hidden',
                  margin: '0 auto 10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,.3)',
                }}
              >
                <img src={photoSrc(pick.photo, 200)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ fontSize: 48, marginBottom: 8, filter: spinning ? 'blur(1px)' : 'none' }}>
                {pick.emoji}
              </div>
            )}
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: done ? 22 : 20,
                margin: '0 0 4px',
                color: done ? 'var(--color-accent)' : 'var(--color-text)',
              }}
            >
              {pick.name}
            </h2>
            {done && (
              <div style={{ animation: 'fadeUp .4s ease .2s both' }}>
                <Stars rating={pick.rating} />
                {pick.reviews > 0 && (
                  <span style={{ color: 'var(--color-dim)', fontSize: 11, marginLeft: 4 }}>
                    ({pick.reviews} 則)
                  </span>
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'center',
                    marginTop: 8,
                    fontSize: 13,
                    color: 'var(--color-dim)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>📍 {pick.dist}m</span>
                  <span>{pick.openTxt}</span>
                  {pick.priceLevel > 0 && (
                    <span>{'$'.repeat(pick.priceLevel)}</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-dim)', margin: '6px 0 4px' }}>
                  {pick.address}
                </p>

                {/* Place Details (opening hours, tags) */}
                <PlaceDetailsBadges details={placeDetails} loading={placeDetailsLoading} />

                {/* Review Links — region-aware */}
                <div style={{ marginTop: 12 }}>
                  <ReviewLinks restaurant={pick} regionId={regionId} />
                </div>

                {/* Blog data + Dish recommendations */}
                <BlogBadge blogData={blogData} loading={blogLoading} />
                <DishRecommendation dishes={blogData?.dishes} />

                {/* Favorite / Blacklist */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
                  <button
                    onClick={() => onToggleFavorite?.(pick)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: isFav ? 'var(--color-accent)' : 'var(--color-surface-2)',
                      background: isFav ? 'rgba(245,158,66,.12)' : 'transparent',
                      color: isFav ? 'var(--color-accent)' : 'var(--color-dim)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isFav ? '❤️ 已收藏' : '🤍 收藏'}
                  </button>
                  <button
                    onClick={() => onToggleBlacklist?.(pick.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: isBlocked ? 'var(--color-accent-2)' : 'var(--color-surface-2)',
                      background: isBlocked ? 'rgba(255,107,107,.12)' : 'transparent',
                      color: isBlocked ? 'var(--color-accent-2)' : 'var(--color-dim)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isBlocked ? '🚫 已封鎖' : '🚫 黑名單'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spin Button */}
      <button
        onClick={onSpin}
        disabled={!filtered.length || spinning || busy}
        style={{
          marginTop: 20,
          width: 220,
          height: 56,
          borderRadius: 60,
          border: 'none',
          background: spinning
            ? 'var(--color-surface-2)'
            : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
          color: spinning ? 'var(--color-dim)' : '#fff',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 18,
          cursor: !filtered.length || spinning || busy ? 'not-allowed' : 'pointer',
          boxShadow: spinning ? 'none' : '0 6px 30px rgba(245,158,66,.3)',
          transition: 'all .3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transform: spinning ? 'scale(.96)' : 'scale(1)',
          opacity: !filtered.length || busy ? 0.4 : 1,
        }}
      >
        {spinning ? (
          <>
            <span style={{ animation: 'spin .6s linear infinite', display: 'inline-block' }}>🎰</span> 選擇中...
          </>
        ) : (
          <>🎲 隨機挑選！</>
        )}
      </button>

      {done && (
        <button
          onClick={onSpin}
          style={{
            marginTop: 10,
            padding: '8px 20px',
            borderRadius: 40,
            border: '1.5px solid var(--color-surface-2)',
            background: 'transparent',
            color: 'var(--color-dim)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          🔄 不喜歡？再轉一次
        </button>
      )}
    </section>
  );
}
