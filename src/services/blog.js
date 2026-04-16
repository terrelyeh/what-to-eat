import { storage } from './storage.js';

const CACHE_PREFIX = 'blog_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fetch blog/social data for a restaurant.
 * Checks localStorage cache first (7 day TTL).
 */
export async function fetchBlogData(restaurant, regionId) {
  const cacheKey = `${CACHE_PREFIX}${restaurant.id}_${regionId}`;

  // Check local cache
  const cached = storage.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const qs = new URLSearchParams({
      name: restaurant.name,
      region: regionId,
      place_id: restaurant.id,
    });
    const res = await fetch(`/api/blog-search?${qs}`);
    if (!res.ok) return null;

    const data = await res.json();

    // Cache locally
    storage.set(cacheKey, { data, ts: Date.now() });

    return data;
  } catch {
    return null;
  }
}

/**
 * Normalize blog count to a 0-1 score for the recommendation engine.
 * Uses logarithmic scale: 0 articles = 0, 100+ articles = 1.0
 */
export function normalizeBlogScore(blogCount) {
  if (!blogCount || blogCount <= 0) return 0;
  return Math.min(1, Math.log10(blogCount + 1) / 2);
}
