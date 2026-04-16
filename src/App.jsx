import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useNearbySearch } from './hooks/useNearbySearch.js';
import { useRecommendation } from './hooks/useRecommendation.js';
import { useRateLimit } from './hooks/useRateLimit.js';
import { usePlaceDetails } from './hooks/usePlaceDetails.js';
import { useProfile } from './hooks/useProfile.js';
import { useRegion } from './hooks/useRegion.js';
import { useBlogSearch } from './hooks/useBlogSearch.js';
import { toggleFavorite, toggleBlacklist, isFavorited, isBlacklisted } from './services/storage.js';
import { SCENARIO_MAP } from './config/scenarios.js';
import { Header } from './components/Header.jsx';
import { SearchBar } from './components/SearchBar.jsx';
import { CategoryPicker } from './components/CategoryPicker.jsx';
import { ScenarioPicker } from './components/ScenarioPicker.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { FilterPanel } from './components/FilterPanel.jsx';
import { ProfilePanel } from './components/ProfilePanel.jsx';
import { SpinZone } from './components/SpinZone.jsx';
import { RestaurantList } from './components/RestaurantList.jsx';
import { PickHistory } from './components/PickHistory.jsx';

export default function App() {
  const geo = useGeolocation();
  const { left, dailyLimit, canSearch, bump } = useRateLimit();
  const { list, busy, search } = useNearbySearch({ onBump: bump });
  const { profile, setCuisine, toggleDietary, setScenario, updateProfile, resetProfile } = useProfile();
  const regionHook = useRegion();
  const pd = usePlaceDetails();
  const blog = useBlogSearch();

  // Get active scenario config
  const activeScenario = profile.scenario ? SCENARIO_MAP[profile.scenario] : null;
  const weightOverrides = activeScenario?.overrides?.weightOverrides || null;

  const rec = useRecommendation(list, {
    cuisinePrefs: profile.cuisines,
    weightOverrides,
  });

  const [keyword, setKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [, forceUpdate] = useState(0);

  // Apply scenario overrides to filters
  useEffect(() => {
    if (activeScenario) {
      const o = activeScenario.overrides;
      if (o.radius) rec.setRadius(o.radius);
      if (o.priceLevels) rec.setPriceLevels(o.priceLevels);
      if (o.ratingMin > 0) rec.setRatingRange({ min: o.ratingMin, max: 5 });
      if (o.openOnly !== undefined) rec.setOpenOnly(o.openOnly);
    }
  }, [activeScenario]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial locate + search + region detection
  useEffect(() => {
    geo.locate().then((c) => {
      if (c) {
        search(c.lat, c.lng, '', rec.radius);
        regionHook.detect(c.lat, c.lng);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch place details + blog data when pick is done
  useEffect(() => {
    if (rec.done && rec.pick) {
      pd.fetchDetails(rec.pick.id);
      blog.search(rec.pick, regionHook.region?.id || 'GLOBAL');
    } else if (!rec.done) {
      pd.reset();
      blog.reset();
    }
  }, [rec.done, rec.pick?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Search handler ───
  const doSearch = useCallback(
    (kw, googleType) => {
      if (!canSearch()) {
        geo.setError(`今日搜尋已達 ${dailyLimit} 次上限`);
        return;
      }
      if (geo.loc) {
        rec.resetPick();
        geo.setError('');

        // Build keyword: combine scenario keyword + user keyword
        let finalKeyword = kw || '';
        if (!finalKeyword && activeScenario?.overrides?.keyword) {
          finalKeyword = activeScenario.overrides.keyword;
        }

        search(geo.loc.lat, geo.loc.lng, finalKeyword, rec.radius).then((result) => {
          if (result?.error) geo.setError(result.error);
        });
      }
    },
    [geo.loc, search, canSearch, dailyLimit, rec.radius, rec.resetPick, geo.setError, activeScenario],
  );

  const handleKeywordSearch = useCallback(
    (kw) => {
      const trimmed = (kw || '').trim();
      setActiveKeyword(trimmed);
      setKeyword(trimmed);
      setActiveCategory(null);
      setActiveSub(null);
      doSearch(trimmed);
    },
    [doSearch],
  );

  const handleClearKeyword = useCallback(() => {
    setActiveKeyword('');
    setKeyword('');
    setActiveCategory(null);
    setActiveSub(null);
    doSearch('');
  }, [doSearch]);

  const handleCategorySelect = useCallback(
    (catId, subId, keyword, googleType) => {
      setActiveCategory(catId);
      setActiveSub(subId);
      setActiveKeyword('');
      setKeyword('');
      doSearch(keyword, googleType);
    },
    [doSearch],
  );

  const handleCategoryClear = useCallback(() => {
    setActiveCategory(null);
    setActiveSub(null);
    doSearch('');
  }, [doSearch]);

  const handleScenarioSelect = useCallback(
    (scenarioId) => {
      setScenario(scenarioId);
      // Trigger a new search with scenario keyword if applicable
      if (scenarioId) {
        const scenario = SCENARIO_MAP[scenarioId];
        if (scenario?.overrides?.keyword) {
          doSearch(scenario.overrides.keyword);
          return;
        }
      }
      // Re-search with current keyword
      doSearch(activeKeyword);
    },
    [setScenario, doSearch, activeKeyword],
  );

  const handleToggleFavorite = useCallback((place) => {
    toggleFavorite(place);
    forceUpdate((n) => n + 1);
  }, []);

  const handleToggleBlacklist = useCallback((placeId) => {
    toggleBlacklist(placeId);
    forceUpdate((n) => n + 1);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        padding: '0 0 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(245,158,66,.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(93,228,167,.05) 0%, transparent 50%)',
        }}
      />

      <Header
        loading={geo.loading}
        loc={geo.loc}
        error={geo.error}
        left={left}
        dailyLimit={dailyLimit}
        onRetry={geo.locate}
      />

      {busy && (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-dim)' }}>
          <span style={{ fontSize: 28, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔍</span>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>搜尋附近餐廳中...</p>
        </div>
      )}

      {/* Scenario Picker */}
      <ScenarioPicker activeScenario={profile.scenario} onSelect={handleScenarioSelect} />

      {/* Search Bar */}
      <SearchBar
        keyword={keyword}
        activeKeyword={activeKeyword}
        busy={busy}
        filtered={rec.filtered}
        onKeywordChange={setKeyword}
        onSearch={handleKeywordSearch}
        onClear={handleClearKeyword}
      />

      {/* Category Picker */}
      <CategoryPicker
        busy={busy}
        activeCategory={activeCategory}
        activeSub={activeSub}
        onSelect={handleCategorySelect}
        onClear={handleCategoryClear}
      />

      {/* Filter + Profile buttons */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FilterBar
          radius={rec.radius}
          activeFilters={rec.activeFilters}
          onRadiusChange={rec.setRadius}
          onOpenFilter={() => setShowFilter(true)}
          onResetPick={rec.resetPick}
        />
        <button
          onClick={() => setShowProfile(true)}
          style={{
            padding: '8px 14px',
            borderRadius: 40,
            border: '2px solid var(--color-surface-2)',
            background: 'var(--color-surface)',
            color: 'var(--color-dim)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          👤 偏好
        </button>
      </section>

      <SpinZone
        filtered={rec.filtered}
        spinning={rec.spinning}
        pick={rec.pick}
        done={rec.done}
        busy={busy}
        onSpin={rec.spin}
        regionId={regionHook.region?.id || 'GLOBAL'}
        placeDetails={pd.details}
        placeDetailsLoading={pd.loading}
        blogData={blog.blogData}
        blogLoading={blog.loading}
        isFav={rec.pick ? isFavorited(rec.pick.id) : false}
        isBlocked={rec.pick ? isBlacklisted(rec.pick.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onToggleBlacklist={handleToggleBlacklist}
      />

      <RestaurantList
        filtered={rec.filtered}
        busy={busy}
        activeKeyword={activeKeyword}
        pick={rec.pick}
        done={rec.done}
        regionId={regionHook.region?.id || 'GLOBAL'}
      />

      <PickHistory hist={rec.hist} />

      <footer
        style={{
          textAlign: 'center',
          padding: '32px 16px 0',
          fontSize: 11,
          color: 'var(--color-dim)',
          position: 'relative',
          zIndex: 1,
          opacity: 0.5,
        }}
      >
        Powered by Google Places API
        {regionHook.region && regionHook.region.id !== 'GLOBAL'
          ? ` ・ ${regionHook.region.flag} ${regionHook.region.name}`
          : ''}
      </footer>

      {/* Panels */}
      <FilterPanel
        show={showFilter}
        ratingRange={rec.ratingRange}
        onRatingRangeChange={rec.setRatingRange}
        minReviews={rec.minReviews}
        onMinReviewsChange={rec.setMinReviews}
        priceLevels={rec.priceLevels}
        onPriceLevelsChange={rec.setPriceLevels}
        shopAge={rec.shopAge}
        onShopAgeChange={rec.setShopAge}
        openOnly={rec.openOnly}
        onOpenOnlyChange={rec.setOpenOnly}
        onClose={() => setShowFilter(false)}
        onReset={() => {
          rec.resetFilters();
          setShowFilter(false);
        }}
      />

      <ProfilePanel
        show={showProfile}
        profile={profile}
        onSetCuisine={setCuisine}
        onToggleDietary={toggleDietary}
        onUpdateProfile={updateProfile}
        onReset={() => {
          resetProfile();
          setShowProfile(false);
        }}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
}
