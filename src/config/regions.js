// Region definitions — maps country codes to region IDs

export const REGIONS = {
  TW: { id: 'TW', name: '台灣', flag: '🇹🇼' },
  JP: { id: 'JP', name: '日本', flag: '🇯🇵' },
  KR: { id: 'KR', name: '韓國', flag: '🇰🇷' },
};

// Fallback for unknown countries
export const GLOBAL_REGION = { id: 'GLOBAL', name: '全球', flag: '🌍' };

export function getRegion(countryCode) {
  return REGIONS[countryCode] || GLOBAL_REGION;
}
