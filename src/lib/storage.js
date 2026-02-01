/**
 * Persist character roster to localStorage.
 * Versioned format: { version, characters } for future migrations.
 */

const STORAGE_KEY = 'dnd-characters';
export const STORAGE_VERSION = 1;

/**
 * @returns {Array<object>}
 */
export function loadCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && 'characters' in parsed) {
      const list = parsed.characters;
      return Array.isArray(list) ? list : [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * @param {Array<object>} characters
 */
export function saveCharacters(characters) {
  try {
    const payload = { version: STORAGE_VERSION, characters: characters || [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save characters:', e);
  }
}
