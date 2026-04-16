export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { location, radius, type, language, keyword, pagetoken } = req.query;
  const API_KEY = process.env.GOOGLE_MAPS_KEY;

  if (!API_KEY) {
    return res.status(500).json({ status: 'ERROR', error: 'API key not configured' });
  }

  try {
    let url;

    if (pagetoken) {
      // Pagination: only pagetoken + key needed
      const params = new URLSearchParams({ pagetoken, key: API_KEY });
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
    } else {
      const params = new URLSearchParams({
        location: location || '0,0',
        radius: radius || '2000',
        key: API_KEY,
        language: language || 'zh-TW',
      });
      if (type) params.set('type', type);
      if (keyword) params.set('keyword', keyword);
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error.message });
  }
}
