// Review source plugin registry
// Each source is a plain object — adding a new region/source = adding an object

export const REVIEW_SOURCES = [
  // ─── Global ───
  {
    id: 'google_maps',
    name: 'Google Maps',
    icon: '🗺️',
    color: '#5de4a7',
    regions: ['GLOBAL'],
    urlBuilder: (r) =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}&center=${r.lat},${r.lng}`,
  },
  {
    id: 'tripadvisor',
    name: 'TripAdvisor',
    icon: '🦉',
    color: '#00af87',
    regions: ['GLOBAL'],
    urlBuilder: (r) =>
      `https://www.tripadvisor.com/Search?q=${encodeURIComponent(r.name)}`,
  },

  // ─── Japan 🇯🇵 ───
  {
    id: 'tabelog',
    name: '食べログ',
    icon: '🔍',
    color: '#e8491b',
    regions: ['JP'],
    urlBuilder: (r) =>
      `https://tabelog.com/rstLst/?vs=1&sa=&sk=${encodeURIComponent(r.name)}`,
  },
  {
    id: 'gurunavi',
    name: 'ぐるなび',
    icon: '🍴',
    color: '#e60012',
    regions: ['JP'],
    urlBuilder: (r) =>
      `https://r.gnavi.co.jp/search/?freeword=${encodeURIComponent(r.name)}`,
  },
  {
    id: 'hotpepper',
    name: 'Hot Pepper',
    icon: '🌶️',
    color: '#ff6600',
    regions: ['JP'],
    urlBuilder: (r) =>
      `https://www.hotpepper.jp/CSP/psh010/doBasic?SA=SA21&FW=${encodeURIComponent(r.name)}`,
  },

  // ─── Taiwan 🇹🇼 ───
  {
    id: 'ifoodie',
    name: '愛食記',
    icon: '📝',
    color: '#ff6b81',
    regions: ['TW'],
    urlBuilder: (r) =>
      `https://ifoodie.tw/explore/${encodeURIComponent(r.name)}/list`,
  },
  {
    id: 'walkerland',
    name: '窩客島',
    icon: '🌐',
    color: '#3b82f6',
    regions: ['TW'],
    urlBuilder: (r) =>
      `https://www.walkerland.com.tw/search?keyword=${encodeURIComponent(r.name)}`,
  },
  {
    id: 'google_blog_tw',
    name: '食記搜尋',
    icon: '📖',
    color: '#f59e42',
    regions: ['TW'],
    urlBuilder: (r) =>
      `https://www.google.com/search?q=${encodeURIComponent(r.name + ' 食記')}`,
  },

  // ─── Korea 🇰🇷 ───
  {
    id: 'mangoplate',
    name: 'Mango Plate',
    icon: '🥭',
    color: '#ff9500',
    regions: ['KR'],
    urlBuilder: (r) =>
      `https://www.mangoplate.com/search/${encodeURIComponent(r.name)}`,
  },
  {
    id: 'naver_map',
    name: 'Naver Map',
    icon: '🗺️',
    color: '#1ec800',
    regions: ['KR'],
    urlBuilder: (r) =>
      `https://map.naver.com/v5/search/${encodeURIComponent(r.name)}`,
  },
];

/**
 * Get review sources applicable to a given region.
 * Always includes GLOBAL sources.
 */
export function getSourcesForRegion(regionId) {
  return REVIEW_SOURCES.filter(
    (s) => s.regions.includes(regionId) || s.regions.includes('GLOBAL'),
  );
}
