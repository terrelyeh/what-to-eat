import { useState, useCallback } from 'react';
import { fetchBlogData } from '../services/blog.js';

export function useBlogSearch() {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (restaurant, regionId) => {
    if (!restaurant || !regionId) return;
    setLoading(true);
    setBlogData(null);

    try {
      const data = await fetchBlogData(restaurant, regionId);
      setBlogData(data);
    } catch {
      // Silently fail — blog data is supplementary
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBlogData(null);
    setLoading(false);
  }, []);

  return { blogData, loading, search, reset };
}
