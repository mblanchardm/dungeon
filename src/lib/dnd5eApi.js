/**
 * Optional D&D 5e API client (dnd5eapi.co).
 * Fetches and caches classes, races, class levels. Falls back to local data when offline or API fails.
 * Enable with USE_DND_API = true (or env) to prefer API for spell slots, spells known, class features.
 */

const API_BASE = 'https://www.dnd5eapi.co/api';
const USE_DND_API = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_DND_API === 'true';

const cache = {
  classes: null,
  races: null,
  classLevels: {}, // { [slug]: levelData }
};

/** Map API slug to app class name (e.g. 'bard' -> 'Bard'). */
function slugToClassName(slug) {
  if (!slug || typeof slug !== 'string') return slug;
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

/**
 * Fetch JSON from API. Returns null on failure.
 * @param {string} path - e.g. '/classes'
 * @returns {Promise<object|null>}
 */
async function fetchApi(path) {
  if (!USE_DND_API) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

/**
 * Get list of classes from API or null (caller uses local fallback).
 * @returns {Promise<{ name: string, slug: string }[]|null>}
 */
export async function getApiClasses() {
  if (!USE_DND_API) return null;
  if (cache.classes) return cache.classes;
  const data = await fetchApi('/classes');
  if (!data?.results) return null;
  cache.classes = data.results.map((c) => ({
    name: slugToClassName(c.index || c.name),
    slug: c.index || c.name,
  }));
  return cache.classes;
}

/**
 * Get list of races from API or null.
 * @returns {Promise<{ name: string, slug: string }[]|null>}
 */
export async function getApiRaces() {
  if (!USE_DND_API) return null;
  if (cache.races) return cache.races;
  const data = await fetchApi('/races');
  if (!data?.results) return null;
  cache.races = data.results.map((r) => ({
    name: slugToClassName(r.index || r.name),
    slug: r.index || r.name,
  }));
  return cache.races;
}

/**
 * Get level data for a class (spellcasting, features) from API.
 * @param {string} classSlug - e.g. 'bard'
 * @param {number} level - 1-20
 * @returns {Promise<object|null>}
 */
export async function getApiClassLevel(classSlug, level) {
  if (!USE_DND_API || !classSlug) return null;
  const key = `${classSlug}-${level}`;
  if (cache.classLevels[key]) return cache.classLevels[key];
  const data = await fetchApi(`/classes/${classSlug}/levels/${level}`);
  if (!data) return null;
  cache.classLevels[key] = data;
  return data;
}

/**
 * Get all level data for a class (1-20). Returns null on failure.
 * @param {string} classSlug - e.g. 'bard'
 * @returns {Promise<object[]|null>}
 */
export async function getApiClassLevels(classSlug) {
  if (!USE_DND_API || !classSlug) return null;
  const levels = [];
  for (let l = 1; l <= 20; l++) {
    const levelData = await getApiClassLevel(classSlug, l);
    if (!levelData) return null;
    levels.push(levelData);
  }
  return levels;
}

/** Whether the API is enabled (caller can use for feature flag). */
export function isDndApiEnabled() {
  return USE_DND_API;
}
