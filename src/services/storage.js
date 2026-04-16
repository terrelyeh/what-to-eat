// ─── Storage Service Interface ───
// Swappable backend: localStorage now, Supabase later.
// All app code imports from this file — never touches localStorage directly.

import { createContext, useContext } from 'react';

const PREFIX = 'whatto_eat_';

function key(name) {
  return `${PREFIX}${name}`;
}

// ─── LocalStorageService ───

class LocalStorageService {
  get(name) {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
    } catch {}
  }

  delete(name) {
    try {
      localStorage.removeItem(key(name));
    } catch {}
  }

  /**
   * Get with TTL check. Returns null if expired.
   */
  getWithTTL(name) {
    const entry = this.get(name);
    if (!entry || !entry.ts) return null;
    if (entry.ttl && Date.now() - entry.ts > entry.ttl) {
      this.delete(name);
      return null;
    }
    return entry.data;
  }

  /**
   * Set with TTL metadata.
   */
  setWithTTL(name, data, ttl) {
    this.set(name, { data, ts: Date.now(), ttl });
  }
}

// ─── Future: SupabaseStorageService ───
// class SupabaseStorageService {
//   constructor(supabaseClient, userId) { ... }
//   async get(name) { ... }
//   async set(name, value) { ... }
//   async delete(name) { ... }
// }

// ─── Singleton + Context ───

export const storage = new LocalStorageService();

export const StorageContext = createContext(storage);

export function useStorage() {
  return useContext(StorageContext);
}

// ─── History helpers ───
// These use the singleton directly for convenience.
// In a Supabase world, they'd be async and use the context.

const HISTORY_KEY = 'history';
const MAX_HISTORY = 50;

export function getHistory() {
  return storage.get(HISTORY_KEY) || { visited: [], blacklist: [], favorites: [] };
}

export function saveHistory(history) {
  storage.set(HISTORY_KEY, history);
}

export function addVisited(place) {
  const h = getHistory();
  h.visited = h.visited.filter((v) => v.placeId !== place.id);
  h.visited.unshift({
    placeId: place.id,
    name: place.name,
    visitedAt: new Date().toISOString(),
    lat: place.lat,
    lng: place.lng,
  });
  h.visited = h.visited.slice(0, MAX_HISTORY);
  saveHistory(h);
  return h;
}

export function toggleBlacklist(placeId) {
  const h = getHistory();
  const idx = h.blacklist.indexOf(placeId);
  if (idx >= 0) {
    h.blacklist.splice(idx, 1);
  } else {
    h.blacklist.push(placeId);
  }
  saveHistory(h);
  return h;
}

export function toggleFavorite(place) {
  const h = getHistory();
  const idx = h.favorites.findIndex((f) => f.placeId === place.id);
  if (idx >= 0) {
    h.favorites.splice(idx, 1);
  } else {
    h.favorites.push({
      placeId: place.id,
      name: place.name,
      rating: place.rating,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      emoji: place.emoji,
      photo: place.photo,
      addedAt: new Date().toISOString(),
    });
  }
  saveHistory(h);
  return h;
}

export function isBlacklisted(placeId) {
  return getHistory().blacklist.includes(placeId);
}

export function isFavorited(placeId) {
  return getHistory().favorites.some((f) => f.placeId === placeId);
}
