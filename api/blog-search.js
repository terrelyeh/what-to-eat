// Blog / social search aggregator
// Searches for food blog articles + IG hashtag popularity + dish keywords
// Uses Google Custom Search JSON API (free tier: 100 queries/day)

const REGION_QUERIES = {
  TW: [
    { source: 'google_blog', template: (name) => `"${name}" 食記` },
    { source: 'ifoodie', template: (name) => `site:ifoodie.tw "${name}"` },
    { source: 'walkerland', template: (name) => `site:walkerland.com.tw "${name}"` },
  ],
  JP: [
    { source: 'tabelog', template: (name) => `site:tabelog.com "${name}"` },
    { source: 'google_blog', template: (name) => `"${name}" レビュー 食べログ` },
  ],
  KR: [
    { source: 'naver_blog', template: (name) => `site:blog.naver.com "${name}" 맛집` },
    { source: 'google_blog', template: (name) => `"${name}" 맛집 리뷰` },
  ],
  GLOBAL: [
    { source: 'google_blog', template: (name) => `"${name}" restaurant review` },
  ],
};

// Keywords for dish extraction from search snippets
const DISH_POSITIVE = {
  TW: ['必點', '推薦', '招牌', '必吃', '好吃', '超推', '人氣'],
  JP: ['おすすめ', '人気', '名物', '絶品'],
  KR: ['추천', '인기', '맛있'],
  GLOBAL: ['must try', 'recommend', 'signature', 'best', 'popular'],
};

const DISH_NEGATIVE = {
  TW: ['不推', '地雷', '踩雷', '失望', '普通', '不好吃'],
  JP: ['残念', 'いまいち', '微妙'],
  KR: ['별로', '실망'],
  GLOBAL: ['avoid', 'disappointing', 'overrated', 'mediocre'],
};

function extractDishes(snippets, region) {
  const positiveKw = DISH_POSITIVE[region] || DISH_POSITIVE.GLOBAL;
  const negativeKw = DISH_NEGATIVE[region] || DISH_NEGATIVE.GLOBAL;
  const recommended = [];
  const avoid = [];

  for (const snippet of snippets) {
    if (!snippet) continue;
    const text = snippet.toLowerCase();

    for (const kw of positiveKw) {
      if (text.includes(kw.toLowerCase())) {
        // Try to extract the dish name near the keyword
        const idx = text.indexOf(kw.toLowerCase());
        const context = snippet.slice(Math.max(0, idx - 20), idx + kw.length + 20).trim();
        if (context.length > 2 && !recommended.includes(context)) {
          recommended.push(context);
        }
        break;
      }
    }

    for (const kw of negativeKw) {
      if (text.includes(kw.toLowerCase())) {
        const idx = text.indexOf(kw.toLowerCase());
        const context = snippet.slice(Math.max(0, idx - 20), idx + kw.length + 20).trim();
        if (context.length > 2 && !avoid.includes(context)) {
          avoid.push(context);
        }
        break;
      }
    }
  }

  return {
    recommended: recommended.slice(0, 5),
    avoid: avoid.slice(0, 3),
  };
}

// In-memory cache (persists across warm serverless invocations)
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name, region, place_id } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing restaurant name' });
  }

  const regionId = region || 'GLOBAL';
  const cacheKey = `${place_id || name}_${regionId}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  const queries = REGION_QUERIES[regionId] || REGION_QUERIES.GLOBAL;
  const API_KEY = process.env.GOOGLE_SEARCH_KEY;
  const CX = process.env.GOOGLE_SEARCH_CX;

  // If no Custom Search API key, return a basic Google search fallback
  if (!API_KEY || !CX) {
    const fallback = {
      blogCount: 0,
      articles: queries.map((q) => ({
        title: `搜尋「${name}」食記`,
        url: `https://www.google.com/search?q=${encodeURIComponent(q.template(name))}`,
        source: q.source,
      })),
      socialScore: 0,
      dishes: { recommended: [], avoid: [] },
      tags: [],
      fallback: true,
    };
    cache.set(cacheKey, { data: fallback, ts: Date.now() });
    return res.status(200).json(fallback);
  }

  try {
    // Search all sources in parallel
    const searchPromises = queries.map(async (q) => {
      const params = new URLSearchParams({
        key: API_KEY,
        cx: CX,
        q: q.template(name),
        num: '5',
      });
      const url = `https://www.googleapis.com/customsearch/v1?${params}`;
      const resp = await fetch(url);
      if (!resp.ok) return { source: q.source, items: [], total: 0 };
      const data = await resp.json();
      return {
        source: q.source,
        items: data.items || [],
        total: parseInt(data.searchInformation?.totalResults || '0', 10),
      };
    });

    const results = await Promise.all(searchPromises);

    // Aggregate
    let totalBlogCount = 0;
    const articles = [];
    const allSnippets = [];

    for (const r of results) {
      totalBlogCount += r.total;
      for (const item of r.items) {
        articles.push({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          source: r.source,
        });
        if (item.snippet) allSnippets.push(item.snippet);
      }
    }

    // Extract dish recommendations from snippets
    const dishes = extractDishes(allSnippets, regionId);

    // Extract tags from snippets
    const tagKeywords = ['不限時', '有WiFi', 'Wi-Fi', '寵物友善', '寵物', '插座', '包廂', '停車'];
    const tags = tagKeywords.filter((tag) =>
      allSnippets.some((s) => s.includes(tag)),
    );

    const responseData = {
      blogCount: Math.min(totalBlogCount, 9999),
      articles: articles.slice(0, 8),
      socialScore: 0, // IG hashtag — placeholder, can be added later
      dishes,
      tags,
      fallback: false,
    };

    cache.set(cacheKey, { data: responseData, ts: Date.now() });
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
