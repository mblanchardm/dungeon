/**
 * Export and import character roster as JSON file.
 */

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
  try {
    const parsed = JSON.parse(jsonString);
    let list = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.characters)) {
      list = parsed.characters;
    } else {
      return { ok: false, error: 'Formato de archivo no válido.' };
    }
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (!c || typeof c !== 'object' || !c.id || !c.name) {
        return { ok: false, error: `Personaje en posición ${i + 1} no tiene id o name.` };
      }
    }
    return { ok: true, characters: list };
  } catch (e) {
    return { ok: false, error: 'El archivo no es JSON válido.' };
  }
}
