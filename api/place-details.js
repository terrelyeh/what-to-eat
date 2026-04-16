export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { place_id, language } = req.query;
  const API_KEY = process.env.GOOGLE_MAPS_KEY;

  if (!API_KEY) {
    return res.status(500).json({ status: 'ERROR', error: 'API key not configured' });
  }
  if (!place_id) {
    return res.status(400).json({ status: 'ERROR', error: 'Missing place_id' });
  }

  // Only request the fields we need to minimize cost
  const fields = [
    'opening_hours',
    'serves_beer',
    'serves_wine',
    'serves_vegetarian_food',
    'dine_in',
    'takeout',
    'delivery',
    'reservable',
    'wheelchair_accessible_entrance',
  ].join(',');

  try {
    const params = new URLSearchParams({
      place_id,
      fields,
      key: API_KEY,
      language: language || 'zh-TW',
    });
    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error.message });
  }
}
