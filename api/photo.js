export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { ref, w } = req.query;
  const API_KEY = process.env.GOOGLE_MAPS_KEY;

  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });
  if (!ref) return res.status(400).json({ error: 'Missing photo reference' });

  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w || 120}&photoreference=${ref}&key=${API_KEY}`;
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) return res.status(response.status).end();

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
