// Structured cuisine category tree
// Each subcategory maps to a Google Places keyword for search

export const CUISINE_CATEGORIES = [
  {
    id: 'japanese',
    label: '日式',
    emoji: '🍱',
    keyword: '日本料理',
    subs: [
      { id: 'ramen', label: '拉麵', keyword: '拉麵' },
      { id: 'sushi', label: '壽司', keyword: '壽司' },
      { id: 'izakaya', label: '居酒屋', keyword: '居酒屋' },
      { id: 'yakiniku', label: '燒肉', keyword: '燒肉' },
      { id: 'donburi', label: '丼飯', keyword: '丼飯' },
      { id: 'tempura', label: '天婦羅', keyword: '天婦羅' },
      { id: 'udon', label: '烏龍麵', keyword: '烏龍麵' },
      { id: 'curry_jp', label: '咖哩', keyword: '日式咖哩' },
    ],
  },
  {
    id: 'taiwanese',
    label: '台式',
    emoji: '🥘',
    keyword: '台灣小吃',
    subs: [
      { id: 'xiaochi', label: '小吃', keyword: '小吃' },
      { id: 'biandang', label: '便當', keyword: '便當' },
      { id: 'beef_noodle', label: '牛肉麵', keyword: '牛肉麵' },
      { id: 'luwei', label: '滷味', keyword: '滷味' },
      { id: 'breakfast_tw', label: '早餐店', keyword: '早餐店' },
      { id: 'hotpot_tw', label: '火鍋', keyword: '火鍋' },
      { id: 'noodle_shop', label: '麵店', keyword: '麵店' },
    ],
  },
  {
    id: 'western',
    label: '西式',
    emoji: '🍕',
    keyword: '西餐',
    subs: [
      { id: 'pizza', label: '披薩', keyword: '披薩' },
      { id: 'burger', label: '漢堡', keyword: '漢堡' },
      { id: 'pasta', label: '義大利麵', keyword: '義大利麵' },
      { id: 'steak', label: '牛排', keyword: '牛排' },
      { id: 'brunch', label: '早午餐', keyword: '早午餐' },
      { id: 'sandwich', label: '三明治', keyword: '三明治' },
    ],
  },
  {
    id: 'chinese',
    label: '中式',
    emoji: '🥢',
    keyword: '中式料理',
    subs: [
      { id: 'jiangzhe', label: '江浙菜', keyword: '江浙菜' },
      { id: 'sichuan', label: '川菜', keyword: '川菜' },
      { id: 'cantonese', label: '港式', keyword: '港式' },
      { id: 'hotpot_cn', label: '火鍋', keyword: '火鍋' },
      { id: 'dimsum', label: '港式飲茶', keyword: '飲茶' },
      { id: 'dumpling', label: '水餃', keyword: '水餃' },
    ],
  },
  {
    id: 'korean',
    label: '韓式',
    emoji: '🌶️',
    keyword: '韓式料理',
    subs: [
      { id: 'kbbq', label: '韓式烤肉', keyword: '韓式烤肉' },
      { id: 'fried_chicken_kr', label: '韓式炸雞', keyword: '韓式炸雞' },
      { id: 'tofu_stew', label: '豆腐鍋', keyword: '豆腐鍋' },
      { id: 'bibimbap', label: '拌飯', keyword: '拌飯' },
      { id: 'kimbap', label: '飯捲', keyword: '飯捲' },
    ],
  },
  {
    id: 'southeast_asian',
    label: '東南亞',
    emoji: '🍛',
    keyword: '東南亞料理',
    subs: [
      { id: 'thai', label: '泰式', keyword: '泰式料理' },
      { id: 'vietnamese', label: '越式', keyword: '越南料理' },
      { id: 'indian', label: '印度咖哩', keyword: '印度料理' },
      { id: 'malay', label: '馬來西亞', keyword: '馬來西亞料理' },
    ],
  },
  {
    id: 'cafe_dessert',
    label: '咖啡/甜點',
    emoji: '☕',
    keyword: '咖啡廳',
    googleType: 'cafe',
    subs: [
      { id: 'cafe', label: '咖啡廳', keyword: '咖啡廳', googleType: 'cafe' },
      { id: 'dessert', label: '甜點店', keyword: '甜點', googleType: 'bakery' },
      { id: 'bakery', label: '麵包店', keyword: '麵包店', googleType: 'bakery' },
      { id: 'ice_cream', label: '冰品', keyword: '冰品' },
      { id: 'tea', label: '茶館', keyword: '茶館' },
    ],
  },
  {
    id: 'bar',
    label: '酒吧',
    emoji: '🍺',
    keyword: '酒吧',
    googleType: 'bar',
    subs: [
      { id: 'izakaya_bar', label: '居酒屋', keyword: '居酒屋' },
      { id: 'bar_pub', label: '酒吧', keyword: '酒吧', googleType: 'bar' },
      { id: 'bistro', label: '餐酒館', keyword: '餐酒館' },
      { id: 'wine_bar', label: '紅酒吧', keyword: '紅酒吧' },
    ],
  },
];

// Flat lookup: id → category data
export const CUISINE_MAP = {};
for (const cat of CUISINE_CATEGORIES) {
  CUISINE_MAP[cat.id] = cat;
  for (const sub of cat.subs) {
    CUISINE_MAP[sub.id] = sub;
  }
}

// Match restaurant name/types against cuisine categories
// Returns the best matching cuisine id or null
export function detectCuisine(restaurant) {
  const text = (restaurant.name || '').toLowerCase();
  const types = restaurant.types || [];

  // Check Google types first
  if (types.includes('cafe') || types.includes('coffee_shop')) return 'cafe_dessert';
  if (types.includes('bakery')) return 'cafe_dessert';
  if (types.includes('bar')) return 'bar';

  // Check name keywords
  for (const cat of CUISINE_CATEGORIES) {
    for (const sub of cat.subs) {
      if (text.includes(sub.keyword.toLowerCase()) || text.includes(sub.label.toLowerCase())) {
        return cat.id;
      }
    }
    if (text.includes(cat.keyword.toLowerCase()) || text.includes(cat.label.toLowerCase())) {
      return cat.id;
    }
  }

  return null;
}
