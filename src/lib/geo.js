export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isInJapan(lat, lng) {
  return lat >= 24 && lat <= 46 && lng >= 122 && lng <= 146;
}

export function gmapUrl(name, lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&center=${lat},${lng}`;
}

export function tabelogSearchUrl(name) {
  return `https://tabelog.com/rstLst/?vs=1&sa=&sk=${encodeURIComponent(name)}`;
}
