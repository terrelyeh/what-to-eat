import { useState, useEffect, useCallback, useMemo } from "react";

// ─── Constants ───
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
const DAILY_LIMIT = 30;
const STORAGE_KEY = "whatto_eat_daily";

const CUISINES = [
  { id: "all", label: "全部", emoji: "🍽️" },
  { id: "japanese", label: "日式", emoji: "🍱" },
  { id: "taiwanese", label: "台式", emoji: "🥢" },
  { id: "american", label: "美式", emoji: "🍔" },
  { id: "italian", label: "義式", emoji: "🍝" },
  { id: "korean", label: "韓式", emoji: "🥘" },
  { id: "chinese", label: "中式", emoji: "🥟" },
  { id: "cafe", label: "咖啡", emoji: "☕" },
  { id: "other", label: "其他", emoji: "🌏" },
];

const DISTANCES = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "2km", value: 2000 },
];

const BUDGETS = [
  { label: "便宜", value: 1, symbol: "$" },
  { label: "適中", value: 2, symbol: "$$" },
  { label: "偏貴", value: 3, symbol: "$$$" },
];

const RATINGS = [
  { label: "不限", value: 0 },
  { label: "3.0+", value: 3.0 },
  { label: "3.5+", value: 3.5 },
  { label: "4.0+", value: 4.0 },
  { label: "4.5+", value: 4.5 },
];

// ─── Cuisine detection from Google Places types ───
function detectCuisine(types, name) {
  const hay = [...(types || []), (name || "")].join(" ").toLowerCase();
  if (/japanese|sushi|ramen|izakaya|tempura|udon|soba|donburi|yakitori|tonkatsu|日本|壽司|拉麵|居酒屋/.test(hay)) return "japanese";
  if (/taiwanese|bubble.?tea|boba|滷肉|牛肉麵|台[式灣]|小吃/.test(hay)) return "taiwanese";
  if (/chinese|dim.?sum|hot.?pot|szechuan|cantonese|dumpling|中[式華]|火鍋|點心/.test(hay)) return "chinese";
  if (/korean|kimchi|bibimbap|韓[式國]/.test(hay)) return "korean";
  if (/american|burger|hamburger|steak|steakhouse|grill|美式/.test(hay)) return "american";
  if (/italian|pizza|pasta|trattoria|risotto|義[式大]/.test(hay)) return "italian";
  if (/cafe|coffee|咖啡/.test(hay)) return "cafe";
  return "other";
}

function cuisineLabel(id) {
  return CUISINES.find(c => c.id === id)?.label || "其他";
}

// ─── Rate limit helpers ───
function getRateLimit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: "", count: 0 };
    return JSON.parse(raw);
  } catch { return { date: "", count: 0 }; }
}
function bumpRateLimit() {
  const today = new Date().toISOString().slice(0, 10);
  const rl = getRateLimit();
  const count = rl.date === today ? rl.count + 1 : 1;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count })); } catch {}
  return count;
}
function canSearch() {
  const today = new Date().toISOString().slice(0, 10);
  const rl = getRateLimit();
  return rl.date !== today || rl.count < DAILY_LIMIT;
}
function remaining() {
  const today = new Date().toISOString().slice(0, 10);
  const rl = getRateLimit();
  return rl.date === today ? Math.max(0, DAILY_LIMIT - rl.count) : DAILY_LIMIT;
}

// ─── Helpers ───
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toR = d => d * Math.PI / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function tabelogUrl(name) {
  return `https://tabelog.com/rstLst/?vs=1&sa=&sk=${encodeURIComponent(name)}`;
}

function photoSrc(ref, w = 120) {
  return ref ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photoreference=${ref}&key=${API_KEY}` : null;
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
      {"$".repeat(level)}<span style={{ opacity: 0.3 }}>{"$".repeat(4 - level)}</span>
    </span>
  );
}

// ═══════════════════════════ APP ═══════════════════════════
export default function App() {
  const [loc, setLoc] = useState(null);
  const [locBusy, setLocBusy] = useState(false);
  const [locErr, setLocErr] = useState("");
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(remaining());

  // Filter states
  const [cuisine, setCuisine] = useState("all");
  const [radius, setRadius] = useState(1000);
  const [budgets, setBudgets] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [openOnly, setOpenOnly] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Picker states
  const [spinning, setSpinning] = useState(false);
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const [hist, setHist] = useState([]);

  // ─── Google Places Nearby Search ───
  const search = useCallback(async (lat, lng) => {
    if (!canSearch()) { setLocErr(`今日搜尋已達 ${DAILY_LIMIT} 次上限`); return; }
    setBusy(true); setLocErr("");
    const typeList = ["restaurant", "cafe", "bakery"];
    try {
      const responses = await Promise.all(typeList.map(type => {
        const qs = new URLSearchParams({
          location: `${lat},${lng}`, radius: "2000",
          type,
          language: navigator.language || "zh-TW",
        });
        return fetch(`/api/places?${qs}`).then(r => r.json());
      }));

      const seen = new Set();
      const merged = [];
      for (const d of responses) {
        if (d.status === "OK" && d.results) {
          for (const p of d.results) {
            if (!seen.has(p.place_id)) {
              seen.add(p.place_id);
              merged.push(p);
            }
          }
        }
      }

      if (merged.length > 0) {
        setList(merged.map((p, i) => {
          const cid = detectCuisine(p.types, p.name);
          return {
            id: p.place_id || i,
            name: p.name,
            rating: p.rating || 0,
            reviews: p.user_ratings_total || 0,
            dist: Math.round(haversine(lat, lng, p.geometry.location.lat, p.geometry.location.lng)),
            priceLevel: p.price_level || 0,
            address: p.vicinity || "",
            open: p.opening_hours?.open_now,
            openTxt: p.opening_hours ? (p.opening_hours.open_now ? "✅ 營業中" : "❌ 休息中") : "—",
            photo: p.photos?.[0]?.photo_reference || null,
            lat: p.geometry.location.lat,
            lng: p.geometry.location.lng,
            cuisine: cid,
            cuisineLabel: cuisineLabel(cid),
            tabelogUrl: tabelogUrl(p.name),
          };
        }));
        bumpRateLimit();
        setLeft(remaining());
      } else if (responses.every(d => d.status === "ZERO_RESULTS" || d.status === "OK")) {
        setList([]);
        setLocErr("附近找不到餐廳");
      } else {
        const bad = responses.find(d => d.status !== "OK" && d.status !== "ZERO_RESULTS");
        setLocErr(`API 錯誤：${bad?.status || "UNKNOWN"}`);
      }
    } catch (e) {
      setLocErr("無法連線 Google Places API");
    } finally { setBusy(false); }
  }, []);

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
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLoc(c);
        setLocBusy(false);
        search(c.lat, c.lng);
      },
      () => {
        setLocBusy(false);
        setLocErr("無法取得定位，請允許權限後重試");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [search]);

  useEffect(() => { locate(); }, [locate]);

  // ─── Filtering (client side on already-fetched results) ───
  const filtered = useMemo(() => {
    return list.filter(r => {
      if (r.dist > radius) return false;
      if (cuisine !== "all" && r.cuisine !== cuisine) return false;
      if (budgets.length > 0 && r.priceLevel > 0 && !budgets.includes(r.priceLevel)) return false;
      if (minRating > 0 && r.rating < minRating) return false;
      if (openOnly && !r.open) return false;
      return true;
    }).sort((a, b) => a.dist - b.dist);
  }, [list, radius, cuisine, budgets, minRating, openOnly]);

  // cuisine counts (within distance)
  const cuisineCounts = useMemo(() => {
    const counts = {};
    list.filter(r => r.dist <= radius).forEach(r => {
      counts[r.cuisine] = (counts[r.cuisine] || 0) + 1;
    });
    return counts;
  }, [list, radius]);

  // cuisine label counts for filter panel
  const cuisineLabelCounts = useMemo(() => {
    const counts = {};
    list
      .filter(r => {
        if (r.dist > radius) return false;
        if (budgets.length > 0 && r.priceLevel > 0 && !budgets.includes(r.priceLevel)) return false;
        if (minRating > 0 && r.rating < minRating) return false;
        if (openOnly && !r.open) return false;
        return true;
      })
      .forEach(r => { counts[r.cuisineLabel] = (counts[r.cuisineLabel] || 0) + 1; });
    return counts;
  }, [list, radius, budgets, minRating, openOnly]);

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
        <p style={{ color: "var(--dim)", fontSize: 11, margin: "2px 0 0", opacity: .5 }}>今日剩餘搜尋：{left} / {DAILY_LIMIT}</p>
      </header>

      {/* Loading */}
      {busy && <div style={{ textAlign: "center", padding: 24, color: "var(--dim)" }}><span style={{ fontSize: 28, display: "inline-block", animation: "spin 1s linear infinite" }}>🔍</span><p style={{ margin: "8px 0 0", fontSize: 14 }}>搜尋附近餐廳中...</p></div>}

      {/* Cuisine Tabs */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
          {CUISINES.map(c => {
            const on = cuisine === c.id;
            const count = c.id === "all" ? list.filter(r => r.dist <= radius).length : (cuisineCounts[c.id] || 0);
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
                {filtered.length > 0 ? `共 ${filtered.length} 間餐廳，按下面按鈕隨機挑選！` : busy ? "搜尋中..." : "沒有符合條件的餐廳"}
              </p>
            </div>
          )}

          {pick && (
            <div style={{ textAlign: "center", width: "100%", animation: spinning ? "tick .1s" : done ? "popIn .5s cubic-bezier(.17,.67,.21,1.25)" : "none" }}>
              {pick.photo && !spinning ? (
                <div style={{ width: 80, height: 80, borderRadius: 16, overflow: "hidden", margin: "0 auto 10px", boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
                  <img src={photoSrc(pick.photo, 200)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ fontSize: 48, marginBottom: 8, filter: spinning ? "blur(1px)" : "none" }}>
                  {CUISINES.find(c => c.id === pick.cuisine)?.emoji || "🍴"}
                </div>
              )}
              <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: done ? 22 : 20, margin: "0 0 4px", color: done ? "var(--accent)" : "var(--tx)" }}>{pick.name}</h2>
              {done && (
                <div style={{ animation: "fadeUp .4s ease .2s both" }}>
                  <Stars rating={pick.rating} />
                  {pick.reviews > 0 && <span style={{ color: "var(--dim)", fontSize: 11, marginLeft: 4 }}>({pick.reviews} 則)</span>}
                  <div style={{ marginTop: 4 }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(93,228,167,.1)", color: "var(--accent3)", border: "1px solid rgba(93,228,167,.2)" }}>
                      {CUISINES.find(c => c.id === pick.cuisine)?.emoji} {pick.cuisineLabel}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8, fontSize: 13, color: "var(--dim)", flexWrap: "wrap" }}>
                    <span>📍 {pick.dist}m</span>
                    <PriceTag level={pick.priceLevel} />
                    <span>{pick.openTxt}</span>
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

        <button onClick={spin} disabled={!filtered.length || spinning || busy}
          style={{ marginTop: 20, width: 220, height: 56, borderRadius: 60, border: "none", background: spinning ? "var(--sf2)" : "linear-gradient(135deg,var(--accent),var(--accent2))", color: spinning ? "var(--dim)" : "#fff", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 18, cursor: !filtered.length || spinning || busy ? "not-allowed" : "pointer", boxShadow: spinning ? "none" : "0 6px 30px rgba(245,158,66,.3)", transition: "all .3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: spinning ? "scale(.96)" : "scale(1)", opacity: !filtered.length || busy ? .4 : 1 }}>
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
          {!busy && !filtered.length && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--dim)", fontSize: 14, background: "var(--sf)", borderRadius: "var(--r)" }}>
              沒有符合條件的餐廳 😢
            </div>
          )}
          {filtered.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, background: pick?.id === r.id && done ? "rgba(245,158,66,.1)" : "var(--sf)", borderRadius: 14, padding: "12px 14px", border: pick?.id === r.id && done ? "1.5px solid var(--accent)" : "1.5px solid transparent", animation: `fadeUp .35s ease ${i * .03}s both` }}>
              {r.photo ? (
                <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "var(--sf2)" }}>
                  <img src={photoSrc(r.photo)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ fontSize: 28, width: 52, height: 52, background: "var(--sf2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {CUISINES.find(c => c.id === r.cuisine)?.emoji || "🍴"}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--accent3)", marginTop: 1 }}>{r.cuisineLabel}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Stars rating={r.rating} />
                  {r.reviews > 0 && <span style={{ color: "var(--dim)", fontSize: 10 }}>({r.reviews})</span>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 11, color: "var(--dim)", alignItems: "center" }}>
                  <span>{r.dist}m</span>
                  <PriceTag level={r.priceLevel} />
                  <span>{r.openTxt}</span>
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
        Powered by Google Places API・食べログ連結為站外搜尋
      </footer>

      {/* ─── Filter Panel (Bottom Sheet) ─── */}
      {showFilter && (
        <>
          <div onClick={() => setShowFilter(false)} style={{ position: "fixed", inset: 0, zIndex: 10, background: "rgba(0,0,0,.6)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 11, background: "var(--sf)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,.4)", animation: "slideUp .3s cubic-bezier(.17,.67,.21,1.05)" }}>
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
