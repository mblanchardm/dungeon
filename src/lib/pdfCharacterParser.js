/**
 * PDF character sheet parser.
 * This parser is designed for the ONESHOT character sheet template.
 * If you change the PDF layout, update the extraction logic (labels or positions) here.
 *
 * Uses label-based heuristics: looks for "Name:", "Class:", "STR", "HP", etc.
 * (English and Spanish) so it works with common one-shot / character sheet PDFs.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { spells } from '../data/srdSpells.js';
import { equipment, races, classes } from '../data/srd.js';

// Worker: serve from public/ so PDF import works offline and with strict CSP
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_LABELS = [
  { key: 'str', en: /\bSTR\b/i, es: /\bFUE\b/i },
  { key: 'dex', en: /\bDEX\b/i, es: /\bDES\b/i },
  { key: 'con', en: /\bCON\b/i, es: /\bCON\b/i },
  { key: 'int', en: /\bINT\b/i, es: /\bINT\b/i },
  { key: 'wis', en: /\bWIS\b/i, es: /\bSAB\b/i },
  { key: 'cha', en: /\bCHA\b/i, es: /\bCAR\b/i },
];

/**
 * Extract full text from an already-loaded PDF document (all pages).
 * @param {PDFDocumentProxy} doc
 * @returns {Promise<string>}
 */
async function extractTextFromDoc(doc) {
  const numPages = doc.numPages;
  const parts = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(' ');
    parts.push(text);
  }
  return parts.join('\n');
}

/**
 * Build a flat field name -> value map from getFieldObjects() result.
 * @param {Object<string, Array<Object>> | null} fieldObjects
 * @returns {Object<string, string>}
 */
function buildFieldMapFromFieldObjects(fieldObjects) {
  if (!fieldObjects || typeof fieldObjects !== 'object') return {};
  const fieldMap = {};
  for (const [name, widgets] of Object.entries(fieldObjects)) {
    if (!Array.isArray(widgets) || widgets.length === 0) continue;
    const first = widgets[0];
    let val = first?.value;
    if (val == null && first?.defaultValue != null) val = first.defaultValue;
    if (typeof val !== 'string') val = val != null ? String(val).trim() : '';
    else val = val.trim();
    if (first?.type === 'checkbox' && (val === 'On' || val === 'Yes' || val === '1')) val = '1';
    fieldMap[name] = val == null ? '' : String(val).trim();
  }
  return fieldMap;
}

/** Possible AcroForm field names per slot (case-insensitive match). */
const FORM_FIELD_NAMES = {
  name: ['Character Name', 'CharacterName', 'Name', 'Nombre', 'Personaje', 'PC Name'],
  class: ['Class', 'Clase', 'Class and Level'],
  race: ['Race', 'Raza'],
  level: ['Level', 'Nivel', 'Total Level', 'Nivel total', 'LEVEL', 'NIVEL'],
  str: ['STR', 'Strength', 'FUE', 'Fuerza', 'Str'],
  dex: ['DEX', 'Dexterity', 'DES', 'Destreza', 'Dex'],
  con: ['CON', 'Constitution', 'Constitución', 'Con'],
  int: ['INT', 'Intelligence', 'Inteligencia', 'Intel', 'Int'],
  wis: ['WIS', 'Wisdom', 'SAB', 'Sabiduría', 'Wis'],
  cha: ['CHA', 'Charisma', 'CAR', 'Carisma', 'Cha'],
  hp: ['HP', 'Hit Points', 'PV', 'Puntos de vida', 'Current HP', 'Max HP', 'HitPoints', 'CurrentHP', 'MaxHP'],
  ac: ['AC', 'Armor Class', 'CA', 'Clase de armadura'],
};

/**
 * Find first matching field value from field map (case-insensitive key match).
 * @param {Object<string, string>} fieldMap
 * @param {string[]} possibleNames
 * @returns {string | undefined}
 */
function getFormValue(fieldMap, possibleNames) {
  const keysLower = Object.keys(fieldMap).reduce((acc, k) => {
    acc[k.toLowerCase().trim()] = fieldMap[k];
    return acc;
  }, {});
  for (const candidate of possibleNames) {
    const key = candidate.toLowerCase().trim();
    if (keysLower[key] !== undefined && String(keysLower[key]).trim() !== '') return keysLower[key];
  }
  for (const [name, value] of Object.entries(fieldMap)) {
    if (value == null || String(value).trim() === '') continue;
    const nameLower = name.toLowerCase().trim();
    for (const candidate of possibleNames) {
      const cLower = candidate.toLowerCase().trim();
      if (nameLower === cLower || nameLower.includes(cLower) || cLower.includes(nameLower)) {
        return value;
      }
    }
  }
  return undefined;
}

/**
 * Build character overrides from AcroForm field map.
 * @param {Object<string, string>} fieldMap
 * @returns {object} overrides for createCharacter()
 */
function mapFormFieldsToOverrides(fieldMap) {
  const overrides = {};
  const nameVal = getFormValue(fieldMap, FORM_FIELD_NAMES.name);
  if (nameVal && nameVal.length > 0 && nameVal.length < 80) overrides.name = nameVal;

  const classVal = getFormValue(fieldMap, FORM_FIELD_NAMES.class);
  if (classVal) {
    const normalized = normalizeClass(classVal);
    if (normalized) overrides.class = normalized;
  }

  const raceVal = getFormValue(fieldMap, FORM_FIELD_NAMES.race);
  if (raceVal) {
    const normalized = normalizeRace(raceVal);
    if (normalized) overrides.race = normalized;
  }

  const levelVal = getFormValue(fieldMap, FORM_FIELD_NAMES.level);
  if (levelVal != null) {
    const l = parseNum(String(levelVal));
    if (l != null && l >= 1 && l <= 20) overrides.level = l;
  }
  if (overrides.level == null && classVal) {
    const l = parseLevelFromClassAndLevelString(classVal);
    if (l != null && l >= 1 && l <= 20) overrides.level = l;
  }

  const abilityScores = {};
  for (const { key } of ABILITY_LABELS) {
    const val = getFormValue(fieldMap, FORM_FIELD_NAMES[key]);
    if (val != null) {
      const n = parseNum(String(val));
      if (n != null && n >= 3 && n <= 30) abilityScores[key] = n;
    }
  }
  if (Object.keys(abilityScores).length > 0) overrides.abilityScores = abilityScores;

  const hpVal = getFormValue(fieldMap, FORM_FIELD_NAMES.hp);
  if (hpVal != null) {
    const hp = parseNum(String(hpVal));
    if (hp != null && hp >= 1 && hp <= 999) {
      overrides.maxHP = hp;
      overrides.currentHP = hp;
    }
  }

  const acVal = getFormValue(fieldMap, FORM_FIELD_NAMES.ac);
  if (acVal != null) {
    const ac = parseNum(String(acVal));
    if (ac != null && ac >= 0 && ac <= 30) overrides.AC = ac;
  }

  return overrides;
}

/**
 * Try to parse a number from a string (handles "18", "18 ", " 18 ").
 * @param {string} s
 * @returns {number | null}
 */
function parseNum(s) {
  if (s == null || s === '') return null;
  const n = parseInt(String(s).trim(), 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Extract level (1-20) from a "Class and Level" style string (e.g. "Cleric 3", "Guerrero 5").
 * @param {string} str
 * @returns {number | null}
 */
function parseLevelFromClassAndLevelString(str) {
  if (str == null || String(str).trim() === '') return null;
  const s = String(str).trim();
  const match = s.match(/\s+(\d{1,2})\s*$/);
  if (match) {
    const l = parseNum(match[1]);
    if (l != null && l >= 1 && l <= 20) return l;
  }
  const parts = s.split(/\s+/);
  if (parts.length >= 1) {
    const last = parts[parts.length - 1];
    const l = parseNum(last);
    if (l != null && l >= 1 && l <= 20) return l;
  }
  return null;
}

/**
 * Build character overrides from extracted PDF text using label-based heuristics.
 * @param {string} fullText
 * @returns {object} overrides for createCharacter()
 */
function mapTextToOverrides(fullText) {
  const overrides = {};
  const text = fullText.replace(/\s+/g, ' ');

  // Name: "Name: X" or "Nombre: X" or "Character Name: X"
  const nameMatch = text.match(/(?:Name|Nombre|Character Name|Personaje)\s*:?\s*([A-Za-zÀ-ÿ0-9'\s\-]+?)(?=\s*(?:Class|Clase|Race|Raza|Level|Nivel)|$)/i);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    if (name.length > 0 && name.length < 80) overrides.name = name;
  }

  // Class: "Class: Fighter" or "Clase: Guerrero"
  const classMatch = text.match(/(?:Class|Clase)\s*:?\s*([A-Za-zÀ-ÿ\s]+?)(?=\s*(?:Level|Nivel|Race|Raza)|$)/i);
  if (classMatch) {
    const cls = classMatch[1].trim();
    const normalized = normalizeClass(cls);
    if (normalized) overrides.class = normalized;
  }

  // Race: "Race: Elf" or "Raza: Elfo"
  const raceMatch = text.match(/(?:Race|Raza)\s*:?\s*([A-Za-zÀ-ÿ\s]+?)(?=\s*(?:Class|Clase|Level|Nivel)|$)/i);
  if (raceMatch) {
    const race = raceMatch[1].trim();
    const normalized = normalizeRace(race);
    if (normalized) overrides.race = normalized;
  }

  // Level: "Level 5" or "Nivel 5" or "Level: 5"
  const levelMatch = text.match(/(?:Level|Nivel)\s*:?\s*(\d{1,2})/i);
  if (levelMatch) {
    const l = parseNum(levelMatch[1]);
    if (l != null && l >= 1 && l <= 20) overrides.level = l;
  }

  // Ability scores: look for "STR 18" or "STR: 18" or "FUE 18" (Spanish)
  const abilityScores = {};
  for (const { key, en, es } of ABILITY_LABELS) {
    const re = new RegExp(`(?:${en.source}|${es.source})\\s*:?\\s*(\\d{1,2})`, 'i');
    const m = text.match(re);
    if (m) {
      const n = parseNum(m[1]);
      if (n != null && n >= 3 && n <= 30) abilityScores[key] = n;
    }
  }
  if (Object.keys(abilityScores).length > 0) overrides.abilityScores = abilityScores;

  // HP: "HP 45" or "PV 45" or "Hit Points: 45"
  const hpMatch = text.match(/(?:HP|PV|Hit Points|Puntos de vida)\s*:?\s*(\d+)/i);
  if (hpMatch) {
    const hp = parseNum(hpMatch[1]);
    if (hp != null && hp >= 1 && hp <= 999) {
      overrides.maxHP = hp;
      overrides.currentHP = hp;
    }
  }

  // AC: "AC 16" or "CA 16" or "Armor Class: 16"
  const acMatch = text.match(/(?:AC|CA|Armor Class|Clase de armadura)\s*:?\s*(\d+)/i);
  if (acMatch) {
    const ac = parseNum(acMatch[1]);
    if (ac != null && ac >= 0 && ac <= 30) overrides.AC = ac;
  }

  return overrides;
}

/** Map common class names (English/Spanish/informal) to app class id. */
function normalizeClass(str) {
  const s = (str || '').toLowerCase().trim();
  const map = {
    barbarian: 'Barbarian', bárbaro: 'Barbarian', barbaro: 'Barbarian',
    bard: 'Bard', bardo: 'Bard',
    cleric: 'Cleric', clérigo: 'Cleric', clerigo: 'Cleric',
    druid: 'Druid', druida: 'Druid',
    fighter: 'Fighter', guerrero: 'Fighter',
    monk: 'Monk', monje: 'Monk',
    paladin: 'Paladin', paladín: 'Paladin',
    ranger: 'Ranger', guardabosques: 'Ranger',
    rogue: 'Rogue', pícaro: 'Rogue', picaro: 'Rogue',
    sorcerer: 'Sorcerer', hechicero: 'Sorcerer',
    warlock: 'Warlock', brujo: 'Warlock',
    wizard: 'Wizard', mago: 'Wizard',
  };
  for (const [k, v] of Object.entries(map)) {
    if (s === k || s.includes(k)) return v;
  }
  return str || '';
}

/** Map common race names to app race id. */
function normalizeRace(str) {
  const s = (str || '').toLowerCase().trim();
  const map = {
    human: 'Human', humano: 'Human', humana: 'Human',
    elf: 'Elf', elfo: 'Elf', elfa: 'Elf',
    dwarf: 'Dwarf', enano: 'Dwarf', enana: 'Dwarf',
    halfling: 'Halfling', mediano: 'Halfling',
    tiefling: 'Tiefling',
    dragonborn: 'Dragonborn', dracónido: 'Dragonborn',
    'half-orc': 'Half-Orc', 'half orc': 'Half-Orc', 'semi-orco': 'Half-Orc',
    gnome: 'Gnome', gnomo: 'Gnome',
    'half-elf': 'Half-Elf', 'half elf': 'Half-Elf', 'semi-elfo': 'Half-Elf',
  };
  for (const [k, v] of Object.entries(map)) {
    if (s === k || s.includes(k)) return v;
  }
  return str || '';
}

/**
 * Match spell names from text to SRD spell ids; unmatched go to customSpells.
 * @param {string} fullText
 * @param {string} className - for prepared casters
 * @returns {{ spellsKnown: string[], customSpells: object[] }}
 */
function matchSpellsFromText(fullText, className) {
  const spellsKnown = [];
  const customSpells = [];
  const spellNames = spells.map((s) => ({ id: s.id, name: s.name, nameEn: s.nameEn || s.name, level: s.level }));
  const preparedCasters = ['Cleric', 'Druid', 'Paladin', 'Wizard'];
  const isPrepared = preparedCasters.includes(className);

  // Heuristic: look for lines or blocks that look like spell names (title case, no numbers)
  // Many PDFs list spells as "Fireball", "Cure Wounds" etc. Search for known spell names in text.
  for (const sp of spellNames) {
    const nameEn = (sp.nameEn || sp.name || '').trim();
    const nameEs = (sp.name || '').trim();
    if (!nameEn && !nameEs) continue;
    const reEn = new RegExp(`\\b${escapeRe(nameEn)}\\b`, 'i');
    const reEs = new RegExp(`\\b${escapeRe(nameEs)}\\b`, 'i');
    if (reEn.test(fullText) || reEs.test(fullText)) {
      spellsKnown.push(sp.id);
    }
  }

  return { spellsKnown, customSpells };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Substrings that identify AcroForm fields containing spell names (key name, case-insensitive). */
const SPELL_FIELD_KEY_SUBSTRINGS = ['spell', 'cantrip', 'conjuro', 'conjuros', 'spells', 'cantrips'];

/**
 * Collect non-empty values from form fields whose names look like spell fields.
 * @param {Object<string, string>} fieldMap
 * @returns {string[]}
 */
function getSpellValuesFromFieldMap(fieldMap) {
  if (!fieldMap || typeof fieldMap !== 'object') return [];
  const values = [];
  const keySubs = SPELL_FIELD_KEY_SUBSTRINGS.map((s) => s.toLowerCase());
  for (const [name, value] of Object.entries(fieldMap)) {
    if (value == null || String(value).trim() === '') continue;
    const nameLower = name.toLowerCase().trim();
    if (keySubs.some((sub) => nameLower.includes(sub))) {
      values.push(String(value).trim());
    }
  }
  return values;
}

/**
 * Match spell names from collected form values to SRD spell ids (reuses matchSpellsFromText logic).
 * @param {string[]} valueStrings - e.g. from getSpellValuesFromFieldMap
 * @param {string} className
 * @returns {{ spellsKnown: string[], customSpells: object[] }}
 */
function matchSpellsFromFormValues(valueStrings, className) {
  if (!valueStrings || valueStrings.length === 0) return { spellsKnown: [], customSpells: [] };
  const combined = valueStrings.join(' ');
  return matchSpellsFromText(combined, className);
}

/**
 * Match equipment names from text to SRD equipment ids; unmatched go to customEquipment.
 * @param {string} fullText
 * @returns {{ equipment: string[], customEquipment: object[] }}
 */
function matchEquipmentFromText(fullText) {
  const equipmentIds = [];
  const customEquipment = [];
  for (const eq of equipment) {
    const name = (eq.name || '').trim();
    if (!name) continue;
    const re = new RegExp(`\\b${escapeRe(name)}\\b`, 'i');
    if (re.test(fullText)) equipmentIds.push(eq.id);
  }
  return { equipment: equipmentIds, customEquipment };
}

/**
 * Merge text-based overrides into primary overrides only for missing or empty fields.
 * @param {object} primary
 * @param {object} fromText
 */
function mergeTextOverridesInto(primary, fromText) {
  for (const [key, value] of Object.entries(fromText)) {
    if (value === undefined) continue;
    const existing = primary[key];
    if (existing === undefined || existing === '' || (typeof existing === 'number' && isNaN(existing))) {
      primary[key] = value;
    }
    if (key === 'abilityScores' && fromText.abilityScores && typeof primary.abilityScores === 'object') {
      for (const [ab, score] of Object.entries(fromText.abilityScores)) {
        if (primary.abilityScores[ab] == null && score != null) primary.abilityScores[ab] = score;
      }
    }
  }
}

/**
 * Parse a PDF file and return character overrides for createCharacter().
 * Tries AcroForm fields first when present; falls back to text extraction.
 * @param {File} file - PDF file
 * @returns {Promise<{ ok: true, overrides: object } | { ok: false, error: string }>}
 */
export async function parsePdfToCharacterOverrides(file) {
  if (!file || file.type !== 'application/pdf') {
    return { ok: false, error: 'Invalid or missing PDF file.' };
  }

  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (e) {
    return { ok: false, error: 'Could not read file.' };
  }

  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (e) {
    return { ok: false, error: 'Could not read PDF. The file may be corrupted or password-protected.' };
  }

  let fullText = '';
  try {
    fullText = await extractTextFromDoc(doc);
  } catch (e) {
    // Text extraction can fail on some PDFs; we may still have form fields
  }

  let fieldObjects = null;
  try {
    fieldObjects = await doc.getFieldObjects();
  } catch (e) {
    // No AcroForm or unsupported
  }

  let overrides = {};
  const hasFormFields = fieldObjects && typeof fieldObjects === 'object' && Object.keys(fieldObjects).length > 0;

  if (hasFormFields) {
    const fieldMap = buildFieldMapFromFieldObjects(fieldObjects);
    const formOverrides = mapFormFieldsToOverrides(fieldMap);
    if (formOverrides.name || formOverrides.class) {
      overrides = { ...formOverrides };
      const spellValues = getSpellValuesFromFieldMap(fieldMap);
      if (spellValues.length > 0) {
        const { spellsKnown: skForm, customSpells: csForm } = matchSpellsFromFormValues(spellValues, overrides.class || '');
        if (skForm.length > 0) overrides.spellsKnown = skForm;
        if (csForm.length > 0) overrides.customSpells = csForm;
      }
      if (fullText && fullText.trim().length >= 10) {
        const textOverrides = mapTextToOverrides(fullText);
        mergeTextOverridesInto(overrides, textOverrides);
      }
    }
  }

  if (!overrides.name && !overrides.class) {
    if (!fullText || fullText.trim().length < 10) {
      return { ok: false, error: 'No text found in PDF. Unsupported or invalid PDF.' };
    }
    overrides = mapTextToOverrides(fullText);
  }

  // Validation: require at least name or class
  if (!overrides.name && !overrides.class) {
    return { ok: false, error: 'Could not find character name or class in PDF. Unsupported format.' };
  }

  // Spell and equipment matching from text when available (merge with form-based spells)
  if (fullText && fullText.trim().length >= 10) {
    const className = overrides.class || '';
    const { spellsKnown: spellsFromText, customSpells: customFromText } = matchSpellsFromText(fullText, className);
    if (spellsFromText.length > 0) {
      const existing = overrides.spellsKnown || [];
      overrides.spellsKnown = [...new Set([...existing, ...spellsFromText])];
    }
    if (customFromText.length > 0) {
      const existing = overrides.customSpells || [];
      overrides.customSpells = [...existing, ...customFromText];
    }
    const { equipment: equipmentIds, customEquipment } = matchEquipmentFromText(fullText);
    if (equipmentIds.length > 0) overrides.equipment = equipmentIds;
    if (customEquipment.length > 0) overrides.customEquipment = customEquipment;
  }

  if (!overrides.name) overrides.name = 'Imported character';
  if (!overrides.class) overrides.class = 'Fighter';
  if (!overrides.level) overrides.level = 1;
  if (!overrides.abilityScores) overrides.abilityScores = {};
  if (!overrides.maxHP) overrides.maxHP = 10;
  if (overrides.currentHP == null) overrides.currentHP = overrides.maxHP;
  if (!overrides.AC) overrides.AC = 10;

  // Normalize race/class to known app ids so createCharacter gets valid data
  const raceIds = races.map((r) => r.id);
  if (overrides.race && !raceIds.includes(overrides.race)) overrides.race = 'Human';
  const classIds = classes.map((c) => c.id);
  if (overrides.class && !classIds.includes(overrides.class)) overrides.class = 'Fighter';
  overrides.feats = Array.isArray(overrides.feats) ? overrides.feats : [];

  return { ok: true, overrides };
}
