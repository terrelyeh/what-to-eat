// Scenario/mood definitions — each maps to search parameter overrides

export const SCENARIOS = [
  {
    id: 'quick_lunch',
    label: '快速午餐',
    emoji: '☀️',
    desc: '便宜、近、外帶友善',
    overrides: {
      radius: 500,
      priceLevels: [1, 2],
      googleTypes: ['meal_takeaway', 'restaurant'],
      keyword: null,
      ratingMin: 0,
      openOnly: true,
    },
  },
  {
    id: 'date_night',
    label: '約會晚餐',
    emoji: '🌙',
    desc: '高評分、氣氛好',
    overrides: {
      radius: 2000,
      priceLevels: [2, 3, 4],
      googleTypes: ['restaurant'],
      keyword: null,
      ratingMin: 4.0,
      openOnly: true,
    },
  },
  {
    id: 'late_night',
    label: '宵夜',
    emoji: '🌃',
    desc: '深夜營業中',
    overrides: {
      radius: 1000,
      priceLevels: [],
      googleTypes: ['restaurant', 'meal_takeaway'],
      keyword: '宵夜 深夜',
      ratingMin: 0,
      openOnly: true,
    },
  },
  {
    id: 'exploring',
    label: '探索冒險',
    emoji: '🧭',
    desc: '沒去過的新店',
    overrides: {
      radius: 2000,
      priceLevels: [],
      googleTypes: null, // use random
      keyword: null,
      ratingMin: 3.5,
      openOnly: true,
      // Special: boost freshness weight, suppress cuisine match
      weightOverrides: {
        freshness: 0.35,
        cuisineMatch: 0.05,
      },
    },
  },
  {
    id: 'business',
    label: '商務餐',
    emoji: '💼',
    desc: '體面、可訂位',
    overrides: {
      radius: 1000,
      priceLevels: [3, 4],
      googleTypes: ['restaurant'],
      keyword: null,
      ratingMin: 4.0,
      openOnly: true,
    },
  },
  {
    id: 'takeout',
    label: '外帶',
    emoji: '🏠',
    desc: '附近、快速取餐',
    overrides: {
      radius: 500,
      priceLevels: [],
      googleTypes: ['meal_takeaway'],
      keyword: null,
      ratingMin: 0,
      openOnly: true,
    },
  },
  {
    id: 'comfort',
    label: '療癒美食',
    emoji: '🫶',
    desc: '熟悉的味道',
    overrides: {
      radius: 1000,
      priceLevels: [1, 2],
      googleTypes: ['restaurant', 'meal_takeaway'],
      keyword: null,
      ratingMin: 3.5,
      openOnly: true,
      // Special: boost cuisine match
      weightOverrides: {
        cuisineMatch: 0.30,
        freshness: 0.10,
      },
    },
  },
];

export const SCENARIO_MAP = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
