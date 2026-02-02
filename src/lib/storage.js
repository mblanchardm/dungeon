/**
 * Persist character roster to localStorage.
 * Versioned format: { version, characters } for future migrations.
 * Validation on load/save so invalid or malformed data does not corrupt the roster.
 */

import { t } from '../i18n/index.js';

const STORAGE_KEY = 'dnd-characters';
export const STORAGE_VERSION = 1;

const MAX_CHARACTERS = 500;

/**
 * Validate a single character object. Returns true if acceptable for roster.
 * @param {unknown} c
 * @returns {boolean}
 */
function isValidCharacter(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return false;
  const id = c.id;
  if (id == null || typeof id !== 'string' || id.trim() === '') return false;
  return true;
}

/**
 * Migrate a character to multiclass format if needed
 * @param {object} c - Character object
 * @returns {object} - Character with classes array if missing
 */
function migrateCharacter(c) {
  if (!c || typeof c !== 'object') return c;
  if (!c.classes || !Array.isArray(c.classes) || c.classes.length === 0) {
    const className = c.class || 'Fighter';
    const level = c.level ?? 1;
    return { ...c, class: className, classes: [{ name: className, level }] };
  }
  return c;
}

/**
 * Load character roster from localStorage. Invalid entries are filtered out.
 * @returns {Array<object>} List of valid character objects (max MAX_CHARACTERS).
 */
export function loadCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    let list = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === 'object' && parsed !== null && 'characters' in parsed) {
      list = parsed.characters;
      list = Array.isArray(list) ? list : [];
    }
    list = list.filter(isValidCharacter).slice(0, MAX_CHARACTERS);
    return list.map(migrateCharacter);
  } catch {
    return [];
  }
}

/**
 * Save character roster to localStorage. Only valid characters are written; payload is { version, characters }.
 * @param {Array<object>} characters - Roster to save (invalid entries are filtered, list capped at MAX_CHARACTERS).
 * @throws {Error} When localStorage quota is exceeded (e.g. QuotaExceededError).
 */
export function saveCharacters(characters) {
  const list = Array.isArray(characters) ? characters : [];
  const valid = list.filter(isValidCharacter).slice(0, MAX_CHARACTERS);
  try {
    const payload = { version: STORAGE_VERSION, characters: valid };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save characters:', e);
    const isQuotaError = e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014;
    throw new Error(isQuotaError ? t('app.saveErrorQuota') : t('app.saveError'));
  }
}
