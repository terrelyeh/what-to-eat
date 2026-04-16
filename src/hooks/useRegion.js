import { useState, useCallback } from 'react';
import { getRegion, GLOBAL_REGION } from '../config/regions.js';
import { storage } from '../services/storage.js';

const CACHE_KEY = 'region';

export function useRegion() {
  const [region, setRegion] = useState(() => {
    const cached = storage.get(CACHE_KEY);
    if (cached?.countryCode) return getRegion(cached.countryCode);
    return null;
  });
  const [loading, setLoading] = useState(false);

  const detect = useCallback(async (lat, lng) => {
    if (!lat || !lng) return;

    // Check cache first (same session)
    const cached = storage.get(CACHE_KEY);
    if (cached?.countryCode) {
      setRegion(getRegion(cached.countryCode));
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      const res = await fetch(`/api/geocode?${qs}`);
      const data = await res.json();

      const countryCode = data.country || 'UNKNOWN';
      const r = getRegion(countryCode);
      setRegion(r);
      storage.set(CACHE_KEY, { countryCode, countryName: data.countryName });
    } catch {
      setRegion(GLOBAL_REGION);
    } finally {
      setLoading(false);
    }
  }, []);

  return { region, loading, detect };
}
