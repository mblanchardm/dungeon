/**
 * D&D 5e class data: hit dice, resources, spell slots, prepared casters, etc.
 * Extracted from characterModel for separation of concerns.
 */

/** Class hit die (d8 = 8, etc.) for level 1 HP. */
export const CLASS_HIT_DIE = {
  Barbarian: 12,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Fighter: 10,
  Monk: 8,
  Paladin: 10,
  Ranger: 10,
  Rogue: 8,
  Sorcerer: 6,
  Warlock: 8,
  Wizard: 6,
};

/** Class resources: { className: { resourceId: { perRest: 'short'|'long', maxFormula: 'level'|'chaMod'|number } } } */
export const CLASS_RESOURCES = {
  Barbarian: { rage: { perRest: 'long', maxFormula: 'level' } },
  Bard: {},
  Cleric: { channelDivinity: { perRest: 'short', maxFormula: 1 } },
  Druid: { wildShape: { perRest: 'short', maxFormula: 2 } },
  Fighter: { actionSurge: { perRest: 'short', maxFormula: 1 } },
  Monk: { ki: { perRest: 'short', maxFormula: 'level' } },
  Paladin: { channelDivinity: { perRest: 'short', maxFormula: 1 }, layOnHands: { perRest: 'long', maxFormula: 'level×5' } },
  Ranger: {},
  Rogue: {},
  Sorcerer: { sorceryPoints: { perRest: 'long', maxFormula: 'level' } },
  Warlock: {},
  Wizard: {},
};

/** Default starting gold by class (simplified: single value). */
export const CLASS_STARTING_GOLD = {
  Barbarian: 70,
  Bard: 125,
  Cleric: 125,
  Druid: 50,
  Fighter: 125,
  Monk: 15,
  Paladin: 150,
  Ranger: 125,
  Rogue: 125,
  Sorcerer: 75,
  Warlock: 100,
  Wizard: 80,
};

/** Max spell slots by level for full casters (Bard, Cleric, Wizard). */
export const SPELL_SLOTS_BY_LEVEL = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
};

/** Half-caster spell slots (Paladin, Ranger). Spells start at level 2. */
export const HALF_CASTER_SLOTS = {
  1: {},
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

/** Warlock Pact Magic slots. All slots are same level, regain on short rest. */
export const WARLOCK_PACT_SLOTS = {
  1: { slots: 1, slotLevel: 1 },
  2: { slots: 2, slotLevel: 1 },
  3: { slots: 2, slotLevel: 2 },
  4: { slots: 2, slotLevel: 2 },
  5: { slots: 2, slotLevel: 3 },
  6: { slots: 2, slotLevel: 3 },
  7: { slots: 2, slotLevel: 4 },
  8: { slots: 2, slotLevel: 4 },
  9: { slots: 2, slotLevel: 5 },
  10: { slots: 2, slotLevel: 5 },
  11: { slots: 3, slotLevel: 5 },
  12: { slots: 3, slotLevel: 5 },
  13: { slots: 3, slotLevel: 5 },
  14: { slots: 3, slotLevel: 5 },
  15: { slots: 3, slotLevel: 5 },
  16: { slots: 3, slotLevel: 5 },
  17: { slots: 4, slotLevel: 5 },
  18: { slots: 4, slotLevel: 5 },
  19: { slots: 4, slotLevel: 5 },
  20: { slots: 4, slotLevel: 5 },
};

/** List of half-caster classes. */
export const HALF_CASTER_CLASSES = ['Paladin', 'Ranger'];

/** Classes that prepare spells each day (vs know spells). */
export const PREPARED_CASTERS = ['Wizard', 'Cleric', 'Druid', 'Paladin'];

/** Spellcasting classes use spell DC; primary ability for DC. */
export const CLASS_SPELL_ABILITY = {
  Bard: 'cha',
  Cleric: 'wis',
  Druid: 'wis',
  Paladin: 'cha',
  Ranger: 'wis',
  Sorcerer: 'cha',
  Warlock: 'cha',
  Wizard: 'int',
};

/** Spells known by class and level. */
export const SPELLS_KNOWN_BY_CLASS_LEVEL = {
  Bard: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : Math.min(22, i + 1)])),
  Cleric: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : 3])),
  Druid: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : 2])),
  Paladin: Object.fromEntries([...Array(21)].map((_, i) => [i, i < 2 ? 0 : Math.floor(i / 2) + 2])),
  Ranger: Object.fromEntries([...Array(21)].map((_, i) => [i, i < 2 ? 0 : i <= 3 ? 2 : i <= 5 ? 3 : i <= 7 ? 4 : i <= 9 ? 5 : i <= 11 ? 6 : i <= 13 ? 7 : i <= 15 ? 8 : i <= 17 ? 9 : i <= 19 ? 10 : 11])),
  Sorcerer: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : Math.min(15, i + 1)])),
  Warlock: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : i <= 9 ? Math.min(10, i + 1) : i <= 11 ? 11 : i <= 13 ? 12 : i <= 15 ? 13 : i <= 17 ? 14 : 15])),
  Wizard: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : 6 + (i - 1) * 2])),
};

/** Character levels that grant Ability Score Improvement (or feat). */
export const ASI_LEVELS = [4, 8, 12, 16, 19];
