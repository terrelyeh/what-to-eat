import { useState, useCallback } from 'react';
import { storage } from '../services/storage.js';

const PROFILE_KEY = 'profile';

const DEFAULT_PROFILE = {
  version: 1,
  cuisines: {
    japanese: 0.5,
    taiwanese: 0.5,
    korean: 0.5,
    chinese: 0.5,
    western: 0.5,
    southeast_asian: 0.5,
    cafe_dessert: 0.5,
    bar: 0.5,
  },
  dietary: {
    vegetarian: false,
    vegan: false,
    halalOnly: false,
    glutenFree: false,
  },
  priceRange: { min: 1, max: 4 },
  scenario: null,
};

function loadProfile() {
  const saved = storage.get(PROFILE_KEY);
  if (saved && saved.version === 1) {
    // Merge with defaults for any new fields
    return {
      ...DEFAULT_PROFILE,
      ...saved,
      cuisines: { ...DEFAULT_PROFILE.cuisines, ...saved.cuisines },
      dietary: { ...DEFAULT_PROFILE.dietary, ...saved.dietary },
      priceRange: saved.priceRange || DEFAULT_PROFILE.priceRange,
    };
  }
  return { ...DEFAULT_PROFILE };
}

export function useProfile() {
  const [profile, setProfileState] = useState(loadProfile);

  const updateProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      storage.set(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const setCuisine = useCallback((cuisineId, value) => {
    setProfileState((prev) => {
      const next = {
        ...prev,
        cuisines: { ...prev.cuisines, [cuisineId]: value },
      };
      storage.set(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const toggleDietary = useCallback((key) => {
    setProfileState((prev) => {
      const next = {
        ...prev,
        dietary: { ...prev.dietary, [key]: !prev.dietary[key] },
      };
      storage.set(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const setScenario = useCallback((scenarioId) => {
    setProfileState((prev) => {
      const next = { ...prev, scenario: scenarioId };
      storage.set(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(() => {
    const fresh = { ...DEFAULT_PROFILE };
    storage.set(PROFILE_KEY, fresh);
    setProfileState(fresh);
  }, []);

  return {
    profile,
    updateProfile,
    setCuisine,
    toggleDietary,
    setScenario,
    resetProfile,
  };
}
