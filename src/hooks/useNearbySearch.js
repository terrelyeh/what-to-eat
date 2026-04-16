import { useState, useCallback } from 'react';
import { haversine, isInJapan } from '../lib/geo.js';
import { placeEmoji } from '../lib/format.jsx';

const FOOD_TYPES = ['restaurant', 'cafe', 'bakery', 'meal_takeaway'];

function pickRandomSubset(arr, min = 2, max = 3) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function jitterRadius(base) {
  const factor = 0.8 + Math.random() * 0.4; // ±20%
  return Math.round(base * factor);
}

function mapPlace(p, userLat, userLng) {
  const pLat = p.geometry.location.lat;
  const pLng = p.geometry.location.lng;
  return {
    id: p.place_id,
    name: p.name,
    rating: p.rating || 0,
    reviews: p.user_ratings_total || 0,
    dist: Math.round(haversine(userLat, userLng, pLat, pLng)),
    priceLevel: p.price_level ?? -1, // -1 = unknown
    address: p.vicinity || '',
    open: p.opening_hours?.open_now,
    openTxt: p.opening_hours
      ? p.opening_hours.open_now
        ? '\u2705 營業中'
        : '\u274C 休息中'
      : '\u2014',
    photo: p.photos?.[0]?.photo_reference || null,
    lat: pLat,
    lng: pLng,
    emoji: placeEmoji(p.types),
    inJapan: isInJapan(pLat, pLng),
    types: p.types || [],
  };
}

async function fetchPage(token) {
  const qs = new URLSearchParams({ pagetoken: token });
  const res = await fetch(`/api/places?${qs}`);
  return res.json();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useNearbySearch({ onBump }) {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  const search = useCallback(
    async (lat, lng, keywordStr = '', searchRadius = 2000) => {
      setBusy(true);

      try {
        const lang = navigator.language || 'zh-TW';
        const radius = String(jitterRadius(searchRadius));
        let firstPageResponses;

        if (keywordStr) {
          const qs = new URLSearchParams({
            location: `${lat},${lng}`,
            radius,
            keyword: keywordStr,
            language: lang,
          });
          firstPageResponses = [await fetch(`/api/places?${qs}`).then((r) => r.json())];
        } else {
          // Randomize: pick 2-3 food types instead of all 4
          const types = pickRandomSubset(FOOD_TYPES);
          firstPageResponses = await Promise.all(
            types.map((type) => {
              const qs = new URLSearchParams({
                location: `${lat},${lng}`,
                radius,
                type,
                language: lang,
              });
              return fetch(`/api/places?${qs}`).then((r) => r.json());
            }),
          );
        }

        // Deduplicate + collect page tokens
        const seen = new Set();
        const merged = [];
        const pageTokens = [];

        for (const d of firstPageResponses) {
          if (d.status === 'OK' && d.results) {
            for (const p of d.results) {
              if (!seen.has(p.place_id)) {
                seen.add(p.place_id);
                merged.push(p);
              }
            }
            if (d.next_page_token) pageTokens.push(d.next_page_token);
          }
        }

        // Fetch additional pages (up to 2 more rounds)
        for (let round = 0; round < 2 && pageTokens.length > 0; round++) {
          await delay(2000); // Google requires ~2s before next_page_token is valid
          const tokens = [...pageTokens];
          pageTokens.length = 0;

          const pages = await Promise.all(tokens.map(fetchPage));
          for (const d of pages) {
            if (d.status === 'OK' && d.results) {
              for (const p of d.results) {
                if (!seen.has(p.place_id)) {
                  seen.add(p.place_id);
                  merged.push(p);
                }
              }
              if (d.next_page_token) pageTokens.push(d.next_page_token);
            }
          }
        }

        if (merged.length > 0) {
          setList(merged.map((p) => mapPlace(p, lat, lng)));
        } else {
          setList([]);
        }

        onBump?.();

        const bad = firstPageResponses.find(
          (d) => d.status !== 'OK' && d.status !== 'ZERO_RESULTS',
        );
        if (bad && merged.length === 0) {
          return { error: `API 錯誤：${bad?.status || 'UNKNOWN'}`, count: 0 };
        }

        return { error: null, count: merged.length, keywordStr };
      } catch {
        return { error: '無法連線 Google Places API', count: 0 };
      } finally {
        setBusy(false);
      }
    },
    [onBump],
  );

  return { list, busy, search };
}
