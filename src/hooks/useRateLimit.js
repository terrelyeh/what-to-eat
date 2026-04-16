import { useState, useCallback } from 'react';
import { storage } from '../services/storage.js';

const DAILY_LIMIT = 30;
const STORAGE_KEY = 'daily';

function getRateLimit() {
  return storage.get(STORAGE_KEY) || { date: '', count: 0 };
}

function getRemaining() {
  const today = new Date().toISOString().slice(0, 10);
  const rl = getRateLimit();
  return rl.date === today ? Math.max(0, DAILY_LIMIT - rl.count) : DAILY_LIMIT;
}

export function useRateLimit() {
  const [left, setLeft] = useState(getRemaining);

  const canSearch = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const rl = getRateLimit();
    return rl.date !== today || rl.count < DAILY_LIMIT;
  }, []);

  const bump = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const rl = getRateLimit();
    const count = rl.date === today ? rl.count + 1 : 1;
    storage.set(STORAGE_KEY, { date: today, count });
    setLeft(Math.max(0, DAILY_LIMIT - count));
    return count;
  }, []);

  return { left, dailyLimit: DAILY_LIMIT, canSearch, bump };
}
