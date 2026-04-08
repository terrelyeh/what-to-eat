export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { location, radius, type, language, keyword } = req.query;
  const API_KEY = process.env.VITE_GOOGLE_MAPS_KEY;

  if (!API_KEY) {
    return res.status(500).json({ status: 'ERROR', error: 'API key not configured' });
  }

  const params = new URLSearchParams({
    location: location || '0,0',
    radius: radius || '2000',
    type: type || 'restaurant',
    key: API_KEY,
    language: language || 'zh-TW',
  });
  if (keyword) params.set('keyword', keyword);

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error.message });
  }
}
