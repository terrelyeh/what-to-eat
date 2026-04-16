import { detectCuisine } from '../config/cuisine-types.js';

const DEFAULT_WEIGHTS = {
  distance: 0.25,
  rating: 0.20,
  reviewCount: 0.10,
  freshness: 0.20,
  cuisineMatch: 0.15,
  blogScore: 0.10, // Phase 4
};

/**
 * Score a restaurant on a 0-1 scale based on multiple signals.
 */
export function scoreRestaurant(restaurant, context) {
  const {
    maxDist = 2000,
    visited = [],
    cuisinePrefs = null,
    weightOverrides = null,
    blogScores = null, // { [placeId]: normalizedScore }
  } = context;

  const weights = weightOverrides
    ? { ...DEFAULT_WEIGHTS, ...weightOverrides }
    : DEFAULT_WEIGHTS;

  // Distance: closer is better
  const distScore = Math.max(0, 1 - restaurant.dist / maxDist);

  // Rating: 0-5 → 0-1
  const ratingScore = (restaurant.rating || 3.0) / 5.0;

  // Review count: logarithmic
  const reviewScore = Math.min(1, Math.log10(Math.max(1, restaurant.reviews)) / 3);

  // Freshness: 1.0 if never visited, linear decay over 14 days
  const lastVisit = visited.find((v) => v.placeId === restaurant.id);
  let freshnessScore = 1.0;
  if (lastVisit) {
    const daysSince = (Date.now() - new Date(lastVisit.visitedAt).getTime()) / 86400000;
    freshnessScore = Math.min(1, daysSince / 14);
  }

  // Cuisine match: use profile preferences
  let cuisineScore = 0.5; // neutral default
  if (cuisinePrefs) {
    const detectedCuisine = detectCuisine(restaurant);
    if (detectedCuisine && cuisinePrefs[detectedCuisine] !== undefined) {
      cuisineScore = cuisinePrefs[detectedCuisine];
    }
  }

  // Blog score: from cached blog data, fallback to neutral
  const blogScore = blogScores?.[restaurant.id] ?? 0.5;

  const total =
    weights.distance * distScore +
    weights.rating * ratingScore +
    weights.reviewCount * reviewScore +
    weights.freshness * freshnessScore +
    weights.cuisineMatch * cuisineScore +
    weights.blogScore * blogScore;

  return total;
}

/**
 * Weighted random pick: higher-scored restaurants are more likely.
 */
export function weightedRandomPick(scoredList) {
  if (!scoredList.length) return null;
  const totalWeight = scoredList.reduce((sum, item) => sum + item.score, 0);
  if (totalWeight === 0) {
    return scoredList[Math.floor(Math.random() * scoredList.length)].restaurant;
  }
  let random = Math.random() * totalWeight;
  for (const item of scoredList) {
    random -= item.score;
    if (random <= 0) return item.restaurant;
  }
  return scoredList[scoredList.length - 1].restaurant;
}
