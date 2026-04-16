export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng } = req.query;
  const API_KEY = process.env.GOOGLE_MAPS_KEY;

  if (!API_KEY) {
    return res.status(500).json({ status: 'ERROR', error: 'API key not configured' });
  }
  if (!lat || !lng) {
    return res.status(400).json({ status: 'ERROR', error: 'Missing lat/lng' });
  }

  try {
    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      result_type: 'country',
      key: API_KEY,
    });
    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const country = data.results[0].address_components?.find((c) =>
        c.types.includes('country'),
      );
      return res.status(200).json({
        country: country?.short_name || 'UNKNOWN',
        countryName: country?.long_name || 'Unknown',
      });
    }

    return res.status(200).json({ country: 'UNKNOWN', countryName: 'Unknown' });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error.message });
  }
}
