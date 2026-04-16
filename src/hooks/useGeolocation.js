import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const locate = useCallback(() => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setLoading(false);
      setError('瀏覽器不支援定位');
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLoc(c);
          setLoading(false);
          resolve(c);
        },
        () => {
          setLoading(false);
          setError('無法取得定位，請允許權限後重試');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }, []);

  return { loc, loading, error, setError, locate };
}
