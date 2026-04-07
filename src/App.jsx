import { useState, useEffect, useCallback, useMemo } from "react";
import { RESTAURANTS } from "./restaurants";

// ─── Constants ───
const CUISINES = [
  { id: "all", label: "全部", emoji: "🍽️" },
  { id: "japanese", label: "日式", emoji: "🍱" },
  { id: "taiwanese", label: "台式", emoji: "🥢" },
  { id: "american", label: "美式", emoji: "🍔" },
  { id: "italian", label: "義式", emoji: "🍝" },
  { id: "korean", label: "韓式", emoji: "🥘" },
  { id: "chinese", label: "中式", emoji: "🥟" },
  { id: "other", label: "其他", emoji: "🌏" },
];

const DISTANCES = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "2km", value: 2000 },
];

const BUDGETS = [
  { label: "便宜", value: 1, symbol: "¥" },
  { label: "適中", value: 2, symbol: "¥¥" },
  { label: "偏貴", value: 3, symbol: "¥¥¥" t�(��쁱����耋��c��h���م�Ք�а��嵉��耋
�
�
�
�����)t�()����ЁIQ�L��l(��쁱����耋��7�f@���م�Ք�����(��쁱����耈̸�����م�Ք�̸����(��쁱����耈̸Ԭ���م�Ք�̸ԁ��(��쁱����耈и�����م�Ք�и����(��쁱����耈иԬ���م�Ք�иԁ��)t�()// ─── Helpers ───
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toR = d => d * Math.PI / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Stars({ rating }) {
  if (!rating) return <span style={{ color: "var(--dim)", fontSize: 12 }}>尚無評分</span>;
  const f = Math.floor(rating), h = rating % 1 >= 0.3;
  return (
    <span style={{ color: "var(--accent)", fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(f)}{h ? "½" : ""}{"☆".repeat(5 - f - (h ? 1 : 0))}
      <span style={{ color: "var(--dim)", marginLeft: 4, fontSize: 12 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function PriceTag({ level }) {
  if (!level) return <span style={{ color: "var(--dim)" }}>—</span>;
  return (
    <span style={{ color: "var(--accent3)", fontSize: 12 }}>
      {"¥".repeat(level)}<span style={{ opacity: 0.3 }}>{"¥".repeat(4 - level)}</span>
    </span>
  );
}

// ═══════════════════════════ APP ═══════════════════════════
export default function App() {
  const [loc, setLoc] = useState(null);
  const [locBusy, setLocBusy] = useState(false);
  const [locErr, setLocErr] = useState("");

  // Filter states
  const [cuisine, setCuisine] = useState("all");
  const [radius, setRadius] = useState(1000);
  const [budgets, setBudgets] = useState([]); // multi-select
  const [minRating, setMinRating] = useState(0);
  const [openOnly, setOpenOnly] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Picker states
  const [spinning, setSpinning] = useState(false);
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const [hist, setHist] = useState([]);

  // ─── Geolocation ───
  const locate = useCallback(() => {
    setLocBusy(true);
    setLocErr("");
    if (!navigator.geolocation) {
      setLocBusy(false);
      setLocErr("瀏覽器不支援定位");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocBusy(false);
      },
      () => {
        setLocBusy(false);
        setLocErr("無法取得定位，請允許權限後重試");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { locate(); }, [locate]);

  // ─── Computed restaurants ───
  const withDist = useMemo(() => {
    if (!loc) return RESTAURANTS.map(r => ({ ...r, dist: 9999 }));
    return RESTAURANTS.map(r => ({
      ...r,
      dist: Math.round(haversine(loc.lat, loc.lng, r.lat, r.lng)),
    }));
  }, [loc]);

  const filtered = useMemo(() => {
    return withDist.filter(r => {
      if (r.dist > radius) return false;
      if (cuisine !== "all" && r.cuisine !== cuisine) return false;
      if (budgets.length > 0 && !budgets.includes(r.priceLevel)) return false;
      if (minRating > 0 && r.tabelogRating < minRating) return false;
      if (openOnly && !r.open) return false;
      return true;
    }).sort((a, b) => a.dist - b.dist);
  }, [withDist, radius, cuisine, budgets, minRating, openOnly]);

  // cuisine counts (for filter tags)
  const cuisineCounts = useMemo(() => {
    const counts = {};
    withDist
      .filter(r => {
        if (r.dist > radius) return false;
        if (budgets.length > 0 && !budgets.includes(r.priceLevel)) return false;
        if (minRating > 0 && r.tabelogRating < minRating) return false;
        if (openOnly && !r.open) return false;
        return true;
      })
      .forEach(r => { counts[r.cuisine] = (counts[r.cuisine] || 0) + 1; });
    return counts;
  }, [withDist, radius, budgets, minRating, openOnly]);

  // cuisine label counts (for the filter panel tags)
  const cuisineLabelCounts = useMemo(() => {
    const counts = {};
    withDist
      .filter(r => {
        if (r.dist > radius) return false;
        if (budgets.length > 0 && !budgets.includes(r.priceLevel)) return false;
        if (minRating > 0 && r.tabelogRating < minRating) return false;
        if (openOnly && !r.open) return false;
        return true;
      })
      .forEach(r => { counts[r.cuisineLabel] = (counts[r.cuisineLabel] || 0) + 1; });
    return counts;
  }, [withDist, radius, budgets, minRating, openOnly]);

  // active filter count
  const activeFilters = (budgets.length > 0 ? 1 : 0) + (minRating > 0 ? 1 : 0) + (openOnly ? 1 : 0);

  // ─── Spin ───
  const spin = () => {
    if (!filtered.length || spinning) return;
    setSpinning(true);
    setDone(false);
    setPick(null);
    let n = 0;
    const total = 18 + Math.floor(Math.random() * 10);
    const go = () => {
      n++;
      const p = filtered[Math.floor(Math.random() * filtered.length)];
      setPick(p);
      if (n < total) {
        setTimeout(go, 50 + (n / total) * 300 + (n > total - 4 ? (n - total + 4) * 120 : 0));
      } else {
        setSpinning(false);
        setDone(true);
        setHist(h => [p, ...h].slice(0, 10));
      }
    };
    go();
  };

  const toggleBudget = (v) => {
    setBudgets(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const css = {
    "--bg": "#1a1714", "--sf": "#262220", "--sf2": "#312e2a",
    "--accent": "#f59e42", "--accent2": "#ff6b6b", "--accent3": "#5de4a7",
    "--tx": "#f5f0e8", "--dim": "#9c9488", "--tab": "#e8491b",
    "--fd": "'Fredoka','Noto Sans TC',sans-serif",
    "--fb": "'Noto Sans TC','DM Sans',sans-serif",
    "--r": "18px",
  };

  return (
    <div style={{ ...css, minHeight: "100vh", background: "var(--bg)", color: "var(--tx)", fontFamily: "var(--fb)", padding: "0 0 40px", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Noto+Sans+TC:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 0%,rgba(245,158,66,.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 100%,rgba(93,228,167,.05) 0%,transparent 50%)" }} />

      {/* Header */}
      <header style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "36px 16px 12px" }}>
        <div style={{ fontSize: 44, animation: "wobble 2.5s ease-in-out infinite" }}>🎰</div>
        <h1 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 32, margin: "8px 0 2px", background: "linear-gradient(135deg,var(--accent),var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>今天吃什麼？</h1>
        <p style={{ color: "var(--dim)", fontSize: 13, margin: "4px 0 0" }}>
          {locBusy ? "📡 定位中..." : loc ? "📍 已定位" : "❌ 無法定位"}
          {!loc && !locBusy && (
            <button onClick={locate} style={{ marginLeft: 8, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", fontSize: 11, cursor: "pointer" }}>🔄 重試</button>
          )}
        </p>
        {locErr && <p style={{ color: "var(--accent2)", fontSize: 12, margin: "4px 0 0" }}>⚠️ {locErr}</p>}
      </header>

      {/* Cuisine Tabs */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
          {CUISINES.map(c => {
            const on = cuisine === c.id;
            const count = c.id === "all" ? withDist.filter(r => r.dist <= radius).length : (cuisineCounts[c.id] || 0);
            return (
              <button key={c.id} onClick={() => { setCuisine(c.id); setPick(null); setDone(false); }}
                style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 40, border: on ? "2px solid var(--accent)" : "2px solid transparent", background: on ? "rgba(245,158,66,.15)" : "var(--sf)", color: on ? "var(--accent)" : "var(--dim)", fontFamily: "var(--fb)", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}>
                <span style={{ fontSize: 15 }}>{c.emoji}</span>{c.label}
                {count > 0 && <span style={{ fontSize: 10, opacity: 0.7, background: on ? "rgba(245,158,66,.2)" : "var(--sf2)", borderRadius: 10, padding: "1px 5px" }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Distance + Filter Row */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        {/* Distance buttons */}
        <div style={{ display: "flex", gap: 6, flex: 1 }}>
          {DISTANCES.map(d => {
            const on = radius === d.value;
            return (
              <button key={d.value} onClick={() => { setRadius(d.value); setPick(null); setDone(false); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: 40, border: on ? "2px solid var(--accent)" : "2px solid transparent", background: on ? "rgba(245,158,66,.15)" : "var(--sf)", color: on ? "var(--accent)" : "var(--dim)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .2s" }}>
                {d.label}
              </button>
            );
          })}
        </div>
        {/* Filter button */}
        <button onClick={() => setShowFilter(true)}
          style={{ position: "relative", padding: "8px 14px", borderRadius: 40, border: activeFilters > 0 ? "2px solid var(--accent)" : "2px solid var(--sf2)", background: activeFilters > 0 ? "rgba(245,158,66,.15)" : "var(--sf)", color: activeFilters > 0 ? "var(--accent)" : "var(--dim)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
          ⚙️ 篩選
          {activeFilters > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: "var(--accent2)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilters}</span>
          )}
        </button>
      </section>

      {/* Spin Zone */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 16px", marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 400, minHeight: 180, background: done ? "linear-gradient(145deg,rgba(245,158,66,.12),rgba(255,107,107,.08))" : "var(--sf)", borderRadius: "var(--r)", border: done ? "2px solid var(--accent)" : "2px solid var(--sf2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, transition: "all .4s", boxShadow: done ? "0 0 40px rgba(245,158,66,.15)" : "none", position: "relative", overflow: "hidden" }}>
          {done && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ position: "absolute", left: `${8 + Math.random() * 84}%`, top: -10, width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, borderRadius: Math.random() > .5 ? "50%" : "2px", background: ["var(--accent)", "var(--accent2)", "var(--accent3)", "#fff"][Math.floor(Math.random() * 4)], opacity: .7, animation: `confetti ${1.2 + Math.random() * 1.5}s ease-out ${i * .06}s forwards` }} />
              ))}
            </div>
          )}

          {!pick && !spinning && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
              <p style={{ color: "var(--dim)", fontSize: 14, margin: 0 }}>
                {filtered.length > 0 ? `共 ${filtered.length} 間餐廳，按下面按鈕隨機挑選！` : "沒有符合條件的餐廳"}
              </p>
            </div>
          )}

          {pick && (
            <div style={{ textAlign: "center", width: "100%", animation: spinning ? "tick .1s" : done ? "popIn .5s cubic-bezier(.17,.67,.21,1.25)" : "none" }}>
              <div style={{ fontSize: 48, marginBottom: 8, filter: spinning ? "blur(1px)" : "none" }}>
                {CUISINES.find(c => c.id === pick.cuisine)?.emoji || "🍴"}
              </div>
              <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: done ? 22 : 20, margin: "0 0 4px", color: done ? "var(--accent)" : "var(--tx)" }}>{pick.name}</h2>
              {done && (
                <div style={{ animation: "fadeUp .4s ease .2s both" }}>
                  <Stars rating={pick.tabelogRating} />
                  {pick.tabelogReviews > 0 && <span style={{ color: "var(--dim)", fontSize: 11, marginLeft: 4 }}>({pick.tabelogReviews} 則)</span>}
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8, fontSize: 13, color: "var(--dim)", flexWrap: "wrap" }}>
                    <span>📍 {pick.dist}m</span>
                    <PriceTag level={pick.priceLevel} />
                    <span>{pick.open ? "✅ 營業中" : "❌ 休息中"}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--dim)", margin: "6px 0 10px" }}>{pick.address}</p>
                  <a href={pick.tabelogUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", padding: "9px 24px", borderRadius: 24, background: "rgba(232,73,27,.2)", border: "1.5px solid var(--tab)", color: "var(--tab)", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                    🔍 查看食べログ
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={spin} disabled={!filtered.length || spinning}
          style={{ marginTop: 20, width: 220, height: 56, borderRadius: 60, border: "none", background: spinning ? "var(--sf2)" : "linear-gradient(135deg,var(--accent),var(--accent2))", color: spinning ? "var(--dim)" : "#fff", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 18, cursor: !filtered.length || spinning ? "not-allowed" : "pointer", boxShadow: spinning ? "none" : "0 6px 30px rgba(245,158,66,.3)", transition: "all .3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: spinning ? "scale(.96)" : "scale(1)", opacity: !filtered.length ? .4 : 1 }}>
          {spinning ? <><span style={{ animation: "spin .6s linear infinite", display: "inline-block" }}>🎰</span> 選擇中...</> : <>🎲 隨機挑選！</>}
        </button>
        {done && (
          <button onClick={spin} style={{ marginTop: 10, padding: "8px 20px", borderRadius: 40, border: "1.5px solid var(--sf2)", background: "transparent", color: "var(--dim)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            🔄 不喜歡？再轉一次
          </button>
        )}
      </section>

      {/* Restaurant List */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 16px" }}>
        <h3 style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 16, color: "var(--dim)", marginBottom: 12 }}>
          附近餐廳 ({filtered.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!filtered.length && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--dim)", fontSize: 14, background: "var(--sf)", borderRadius: "var(--r)" }}>
              沒有符合條件的餐廳 😢
            </div>
          )}
          {filtered.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, background: pick?.id === r.id && done ? "rgba(245,158,66,.1)" : "var(--sf)", borderRadius: 14, padding: "12px 14px", border: pick?.id === r.id && done ? "1.5px solid var(--accent)" : "1.5px solid transparent", animation: `fadeUp .35s ease ${i * .03}s both` }}>
              <div style={{ fontSize: 28, width: 52, height: 52, background: "var(--sf2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {CUISINES.find(c => c.id === r.cuisine)?.emoji || "🍴"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--accent3)", marginTop: 1 }}>{r.cuisineLabel}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Stars rating={r.tabelogRating} />
                  {r.tabelogReviews > 0 && <span style={{ color: "var(--dim)", fontSize: 10 }}>({r.tabelogReviews})</span>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 11, color: "var(--dim)", alignItems: "center" }}>
                  <span>{r.dist}m</span>
                  <PriceTag level={r.priceLevel} />
                  <span>{r.open ? "✅ 營業中" : "❌ 休息中"}</span>
                </div>
              </div>
              <a href={r.tabelogUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: "6px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(232,73,27,.15)", color: "var(--tab)", textDecoration: "none", textAlign: "center", flexShrink: 0, border: "1px solid rgba(232,73,27,.3)" }}>
                食べログ
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      {hist.length > 0 && (
        <section style={{ position: "relative", zIndex: 1, padding: "24px 16px 0" }}>
          <h3 style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 16, color: "var(--dim)", marginBottom: 12 }}>抽選紀錄</h3>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {hist.map((h, i) => (
              <div key={i} style={{ flex: "0 0 auto", background: "var(--sf)", borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 24 }}>{CUISINES.find(c => c.id === h.cuisine)?.emoji || "🍴"}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, whiteSpace: "nowrap" }}>{h.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ textAlign: "center", padding: "32px 16px 0", fontSize: 11, color: "var(--dim)", position: "relative", zIndex: 1, opacity: .5 }}>
        資料來源：食べログ（Tabelog）・只顯示已在食べログ登錄的餐廳
      </footer>

      {/* ─── Filter Panel (Bottom Sheet) ─── */}
      {showFilter && (
        <>
          {/* Overlay */}
          <div onClick={() => setShowFilter(false)} style={{ position: "fixed", inset: 0, zIndex: 10, background: "rgba(0,0,0,.6)", backdropFilter: "blur(2px)" }} />
          {/* Sheet */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 11, background: "var(--sf)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,.4)", animation: "slideUp .3s cubic-bezier(.17,.67,.21,1.05)" }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: "var(--sf2)", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 20, margin: 0 }}>篩選</h2>
              <button onClick={() => setShowFilter(false)} style={{ background: "var(--sf2)", border: "none", color: "var(--dim)", fontSize: 18, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Budget */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", margin: "0 0 10px", letterSpacing: 1 }}>預算</p>
              <div style={{ display: "flex", gap: 8 }}>
                {BUDGETS.map(b => {
                  const on = budgets.includes(b.value);
                  return (
                    <button key={b.value} onClick={() => toggleBudget(b.value)}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: on ? "2px solid var(--accent)" : "2px solid var(--sf2)", background: on ? "rgba(245,158,66,.15)" : "transparent", color: on ? "var(--accent)" : "var(--dim)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                      <div>{b.label}</div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{b.symbol}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min Rating */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", margin: "0 0 10px", letterSpacing: 1 }}>最低評分</p>
              <div style={{ display: "flex", gap: 8 }}>
                {RATINGS.map(r => {
                  const on = minRating === r.value;
                  return (
                    <button key={r.value} onClick={() => setMinRating(r.value)}
                      style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: on ? "2px solid var(--accent)" : "2px solid var(--sf2)", background: on ? "rgba(245,158,66,.15)" : "transparent", color: on ? "var(--accent)" : "var(--dim)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Open Only Toggle */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", margin: "0 0 2px", letterSpacing: 1 }}>營業狀態</p>
                  <p style={{ fontSize: 12, color: "var(--dim)", margin: 0, opacity: 0.7 }}>只顯示營業中的餐廳</p>
                </div>
                <button onClick={() => setOpenOnly(v => !v)}
                  style={{ width: 50, height: 28, borderRadius: 14, border: "none", background: openOnly ? "var(--accent3)" : "var(--sf2)", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: openOnly ? 24 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
                </button>
              </div>
            </div>

            {/* Cuisine Type Tags */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", margin: "0 0 10px", letterSpacing: 1 }}>料理類型</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(cuisineLabelCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => (
                    <div key={label} style={{ padding: "7px 12px", borderRadius: 20, background: "var(--sf2)", fontSize: 12, color: "var(--dim)", display: "flex", alignItems: "center", gap: 4 }}>
                      {label}
                      <span style={{ background: "rgba(245,158,66,.2)", color: "var(--accent)", borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Reset */}
            <button onClick={() => { setBudgets([]); setMinRating(0); setOpenOnly(false); setShowFilter(false); }}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1.5px solid var(--sf2)", background: "transparent", color: "var(--dim)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              🔄 重設篩選條件
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes wobble{0%,100%{transform:rotate(-6deg) scale(1)}50%{transform:rotate(6deg) scale(1.05)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes popIn{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:.9}100%{transform:translateY(180px) rotate(720deg);opacity:0}}
        @keyframes tick{0%{transform:scale(.95)}100%{transform:scale(1)}}
        @keyframes slideUp{0%{transform:translateY(100%)}100%{transform:translateY(0)}}
        *::-webkit-scrollbar{height:0;width:0}
      `}</style>
    </div>
  );
}
