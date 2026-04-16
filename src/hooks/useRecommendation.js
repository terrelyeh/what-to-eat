import { useState, useMemo, useCallback } from 'react';
import { scoreRestaurant, weightedRandomPick } from '../services/recommendation.js';
import { getHistory, addVisited } from '../services/storage.js';

const DEFAULT_FILTERS = {
  radius: 1000,
  ratingRange: { min: 0, max: 5 },
  minReviews: 0,
  priceLevels: [],    // empty = no filter
  shopAge: 'any',     // 'any' | 'new' | 'established'
  openOnly: true,     // default ON
};

export function useRecommendation(list, { cuisinePrefs = null, weightOverrides = null } = {}) {
  const [radius, setRadius] = useState(DEFAULT_FILTERS.radius);
  const [ratingRange, setRatingRange] = useState(DEFAULT_FILTERS.ratingRange);
  const [minReviews, setMinReviews] = useState(DEFAULT_FILTERS.minReviews);
  const [priceLevels, setPriceLevels] = useState(DEFAULT_FILTERS.priceLevels);
  const [shopAge, setShopAge] = useState(DEFAULT_FILTERS.shopAge);
  const [openOnly, setOpenOnly] = useState(DEFAULT_FILTERS.openOnly);

  const [spinning, setSpinning] = useState(false);
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const [hist, setHist] = useState([]);

  // Load history for scoring
  const history = useMemo(() => getHistory(), [list, pick]);

  const filtered = useMemo(() => {
    return list
      .filter((r) => {
        // Distance
        if (r.dist > radius) return false;
        // Rating range
        if (ratingRange.min > 0 && r.rating < ratingRange.min) return false;
        if (ratingRange.max < 5 && r.rating > ratingRange.max) return false;
        // Min reviews
        if (minReviews > 0 && r.reviews < minReviews) return false;
        // Price level (empty = no filter, -1 = unknown = pass through)
        if (priceLevels.length > 0 && r.priceLevel >= 0 && !priceLevels.includes(r.priceLevel)) return false;
        // Shop age
        if (shopAge === 'new' && r.reviews >= 30) return false;
        if (shopAge === 'established' && r.reviews < 200) return false;
        // Open only
        if (openOnly && r.open === false) return false;
        // Blacklist
        if (history.blacklist.includes(r.id)) return false;
        return true;
      })
      .sort((a, b) => a.dist - b.dist);
  }, [list, radius, ratingRange, minReviews, priceLevels, shopAge, openOnly, history.blacklist]);

  // Score all filtered restaurants
  const scoredList = useMemo(() => {
    return filtered.map((r) => ({
      restaurant: r,
      score: scoreRestaurant(r, {
        maxDist: radius,
        visited: history.visited,
        cuisinePrefs,
        weightOverrides,
      }),
    }));
  }, [filtered, radius, history.visited, cuisinePrefs, weightOverrides]);

  const activeFilters =
    (ratingRange.min > 0 || ratingRange.max < 5 ? 1 : 0) +
    (minReviews > 0 ? 1 : 0) +
    (priceLevels.length > 0 ? 1 : 0) +
    (shopAge !== 'any' ? 1 : 0) +
    (openOnly ? 1 : 0);

  const spin = useCallback(() => {
    if (!scoredList.length || spinning) return;
    setSpinning(true);
    setDone(false);
    setPick(null);

    let n = 0;
    const total = 18 + Math.floor(Math.random() * 10);
    const go = () => {
      n++;
      // During animation: uniform random for visual variety
      const p = filtered[Math.floor(Math.random() * filtered.length)];
      setPick(p);
      if (n < total) {
        setTimeout(
          go,
          50 + (n / total) * 300 + (n > total - 4 ? (n - total + 4) * 120 : 0),
        );
      } else {
        // Final pick: weighted random
        const finalPick = weightedRandomPick(scoredList);
        setPick(finalPick);
        setSpinning(false);
        setDone(true);
        setHist((h) => [finalPick, ...h].slice(0, 10));
        // Record visit
        addVisited(finalPick);
      }
    };
    go();
  }, [filtered, scoredList, spinning]);

  const resetPick = useCallback(() => {
    setPick(null);
    setDone(false);
  }, []);

  const resetFilters = useCallback(() => {
    setRatingRange(DEFAULT_FILTERS.ratingRange);
    setMinReviews(DEFAULT_FILTERS.minReviews);
    setPriceLevels(DEFAULT_FILTERS.priceLevels);
    setShopAge(DEFAULT_FILTERS.shopAge);
    setOpenOnly(DEFAULT_FILTERS.openOnly);
  }, []);

  return {
    // Distance (handled by FilterBar, not FilterPanel)
    radius,
    setRadius,
    // Filter states
    ratingRange,
    setRatingRange,
    minReviews,
    setMinReviews,
    priceLevels,
    setPriceLevels,
    shopAge,
    setShopAge,
    openOnly,
    setOpenOnly,
    // Computed
    filtered,
    activeFilters,
    // Spin
    spinning,
    pick,
    done,
    hist,
    spin,
    resetPick,
    resetFilters,
    // History
    history,
  };
}
