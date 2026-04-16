import { useState, useCallback } from 'react';

function formatTime(time) {
  // Google returns time as "HHMM" string, e.g. "1130"
  if (!time) return '';
  const h = time.slice(0, 2);
  const m = time.slice(2);
  return `${h}:${m}`;
}

function getClosingWarning(periods) {
  if (!periods || !periods.length) return null;

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find today's period
  const todayPeriod = periods.find((p) => p.open?.day === currentDay);
  if (!todayPeriod || !todayPeriod.close) return null;

  const closeMinutes =
    parseInt(todayPeriod.close.time.slice(0, 2)) * 60 +
    parseInt(todayPeriod.close.time.slice(2));

  const minutesLeft = closeMinutes - currentMinutes;

  if (minutesLeft <= 0) return null;
  if (minutesLeft <= 30) return { level: 'urgent', text: `⚠️ ${minutesLeft} 分鐘後打烊！` };
  if (minutesLeft <= 60) return { level: 'warning', text: `⚠️ 約 1 小時內打烊` };
  if (minutesLeft <= 120) return { level: 'info', text: `🕐 約 ${Math.round(minutesLeft / 60)} 小時後打烊` };
  return null;
}

function formatTodayHours(periods) {
  if (!periods || !periods.length) return null;

  const now = new Date();
  const currentDay = now.getDay();

  const todayPeriod = periods.find((p) => p.open?.day === currentDay);
  if (!todayPeriod) return '今日休息';

  const open = formatTime(todayPeriod.open?.time);
  const close = todayPeriod.close ? formatTime(todayPeriod.close.time) : '24:00';

  return `${open} – ${close}`;
}

export function usePlaceDetails() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async (placeId) => {
    if (!placeId) return;
    setLoading(true);
    setDetails(null);

    try {
      const lang = navigator.language || 'zh-TW';
      const qs = new URLSearchParams({ place_id: placeId, language: lang });
      const res = await fetch(`/api/place-details?${qs}`);
      const data = await res.json();

      if (data.status === 'OK' && data.result) {
        const r = data.result;
        const periods = r.opening_hours?.periods || null;

        setDetails({
          todayHours: formatTodayHours(periods),
          closingWarning: getClosingWarning(periods),
          weekdayText: r.opening_hours?.weekday_text || [],
          servesBeer: r.serves_beer,
          servesWine: r.serves_wine,
          servesVegetarian: r.serves_vegetarian_food,
          dineIn: r.dine_in,
          takeout: r.takeout,
          delivery: r.delivery,
          reservable: r.reservable,
          wheelchairAccessible: r.wheelchair_accessible_entrance,
        });
      }
    } catch {
      // Silently fail — details are supplementary
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDetails(null);
    setLoading(false);
  }, []);

  return { details, loading, fetchDetails, reset };
}
