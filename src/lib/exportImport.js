/**
 * Export and import character roster as JSON file.
 * Validation rejects oversized or malformed imports; roster is never updated on failure.
 */

import { t } from '../i18n/index.js';

const MAX_CHARACTERS = 500;
const MAX_JSON_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * @param {Array<object>} characters
 * @returns {string} JSON string for download
 */
export function exportCharacters(characters) {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    characters: characters || [],
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * @param {string} jsonString
 * @returns {{ ok: true, characters: Array<object> } | { ok: false, error: string }}
 */
export function importCharacters(jsonString) {
  if (typeof jsonString !== 'string') {
    return { ok: false, error: t('import.invalidFormat') };
  }
  const byteLength = new TextEncoder().encode(jsonString).length;
  if (byteLength > MAX_JSON_BYTES) {
    return { ok: false, error: t('import.invalidFormat') };
  }
  try {
    const parsed = JSON.parse(jsonString);
    let list = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.characters)) {
      list = parsed.characters;
    } else {
      return { ok: false, error: t('import.invalidFormat') };
    }
    if (list.length > MAX_CHARACTERS) {
      return { ok: false, error: t('import.tooMany').replace('{{max}}', String(MAX_CHARACTERS)) };
    }
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (!c || typeof c !== 'object' || Array.isArray(c)) {
        return { ok: false, error: t('import.invalidCharacter').replace('{{index}}', String(i + 1)) };
      }
      const id = c.id;
      const name = c.name;
      if (id == null || typeof id !== 'string' || id.trim() === '' || name == null || typeof name !== 'string') {
        return { ok: false, error: t('import.invalidCharacter').replace('{{index}}', String(i + 1)) };
      }
    }
    return { ok: true, characters: list };
  } catch (e) {
    return { ok: false, error: t('import.invalidJson') };
  }
}
