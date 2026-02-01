/**
 * D&D 5e character data model and helpers.
 * Used by CreateCharacterWizard (write) and CharacterSheet (read/write).
 */

/** Ability modifier: (score - 10) / 2, round down */
export function getAbilityModifier(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  return Math.floor((n - 10) / 2);
}

/** Racial ability score increases (race -> { ability: +N }). */
export const RACIAL_BONUSES = {
  Human: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
  Elf: { dex: 2 },
  Dwarf: { con: 2 },
  Halfling: { dex: 2 },
  Tiefling: { cha: 2, int: 1 },
};

/** Class hit die (d8 = 8, etc.) for level 1 HP. */
export const CLASS_HIT_DIE = {
  Barbarian: 12,
  Bard: 8,
  Cleric: 8,
  Fighter: 10,
  Rogue: 8,
  Wizard: 6,
};

/** Default starting gold by class (simplified: single value). */
export const CLASS_STARTING_GOLD = {
  Barbarian: 70,
  Bard: 125,
  Cleric: 125,
  Fighter: 125,
  Rogue: 125,
  Wizard: 80,
};

/** Max spell slots by level for full casters (Bard, Cleric, Wizard). Format: level -> { 1: max, 2: max, ... }. */
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

/** Proficiency bonus by character level (1–20). */
export function getProficiencyBonus(level) {
  const n = Math.min(20, Math.max(1, Number(level) || 1));
  if (n <= 4) return 2;
  if (n <= 8) return 3;
  if (n <= 12) return 4;
  if (n <= 16) return 5;
  return 6;
}

/** Spellcasting classes use spell DC; primary ability for DC. */
export const CLASS_SPELL_ABILITY = {
  Bard: 'cha',
  Cleric: 'wis',
  Wizard: 'int',
};

/** Spells known by class and level. Bard/Cleric: 2 at 1, +1 per level; 14–15 both 15, then 16–20. Wizard: 6 at 1, +2 per level. */
export const SPELLS_KNOWN_BY_CLASS_LEVEL = {
  Bard: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : i <= 13 ? i + 1 : i <= 15 ? 15 : i])),
  Cleric: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : i <= 13 ? i + 1 : i <= 15 ? 15 : i])),
  Wizard: Object.fromEntries([...Array(21)].map((_, i) => [i, i === 0 ? 0 : 6 + (i - 1) * 2])),
};

/** Character levels that grant Ability Score Improvement (or feat). Summary display only. */
export const ASI_LEVELS = [4, 8, 12, 16, 19];

/** Returns max spells known for this class at this level. */
export function getSpellsKnownCountAtLevel(className, level) {
  const byClass = SPELLS_KNOWN_BY_CLASS_LEVEL[className];
  if (!byClass) return 0;
  const n = Number(level);
  if (Number.isNaN(n) || n < 1 || n > 20) return 0;
  return byClass[n] ?? 0;
}

/** Returns highest spell slot level available at this character level (1-9). */
export function getMaxSpellLevelForCharacterLevel(characterLevel) {
  const slots = SPELL_SLOTS_BY_LEVEL[characterLevel];
  if (!slots || typeof slots !== 'object') return 1;
  const levels = Object.keys(slots).map(Number).filter((n) => !Number.isNaN(n));
  return levels.length > 0 ? Math.max(...levels) : 1;
}

/** Default ability scores (no race applied). */
const DEFAULT_ABILITY_SCORES = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

/** Generate a simple unique id. */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Create a new character object with defaults. Overrides are merged on top.
 * @param {object} overrides
 * @returns {object}
 */
export function createCharacter(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? generateId(),
    name: overrides.name ?? '',
    race: overrides.race ?? '',
    subrace: overrides.subrace ?? undefined,
    class: overrides.class ?? '',
    subclass: overrides.subclass ?? undefined,
    level: overrides.level ?? 1,
    background: overrides.background ?? undefined,
    abilityScores: { ...DEFAULT_ABILITY_SCORES, ...(overrides.abilityScores || {}) },
    maxHP: overrides.maxHP ?? 10,
    currentHP: overrides.currentHP ?? overrides.maxHP ?? 10,
    AC: overrides.AC ?? 10,
    spellDC: overrides.spellDC ?? undefined,
    inspiration: overrides.inspiration ?? 0,
    inspirationMax: overrides.inspirationMax ?? 0,
    spellSlots: overrides.spellSlots ?? {},
    gold: overrides.gold ?? 0,
    spellsKnown: overrides.spellsKnown ?? [],
    equipment: overrides.equipment ?? [],
    socialNotes: overrides.socialNotes ?? '',
    tacticsNotes: overrides.tacticsNotes ?? '',
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    ...overrides,
  };
}

/**
 * Apply racial bonuses to ability scores. Returns new object.
 */
export function applyRacialBonuses(abilityScores, race) {
  const bonus = RACIAL_BONUSES[race];
  if (!bonus) return { ...abilityScores };
  const next = { ...abilityScores };
  for (const [abil, delta] of Object.entries(bonus)) {
    next[abil] = (next[abil] ?? 10) + delta;
  }
  return next;
}

/**
 * Compute spell save DC: 8 + proficiency + ability modifier.
 */
export function computeSpellDC(character) {
  const ability = CLASS_SPELL_ABILITY[character.class];
  if (!ability) return undefined;
  const score = character.abilityScores?.[ability] ?? 10;
  const mod = getAbilityModifier(score);
  const prof = getProficiencyBonus(character.level ?? 1);
  return 8 + prof + mod;
}

/**
 * Compute max HP at level 1: hit die + CON modifier (minimum 1).
 */
export function computeMaxHPLevel1(className, conModifier) {
  const die = CLASS_HIT_DIE[className] ?? 8;
  const total = die + (conModifier ?? 0);
  return Math.max(1, total);
}

/**
 * HP gain for one level (levels 2+): fixed average or roll.
 * useFixed true: floor(hitDie/2) + 1 + conModifier (minimum 1).
 * useFixed false: random(1..hitDie) + conModifier (minimum 1).
 */
export function computeHPGainForLevel(className, conModifier, useFixed) {
  const die = CLASS_HIT_DIE[className] ?? 8;
  const con = conModifier ?? 0;
  const gain = useFixed
    ? Math.floor(die / 2) + 1 + con
    : Math.floor(Math.random() * die) + 1 + con;
  return Math.max(1, gain);
}

/**
 * Level up character by 1: new level, HP gain, spell slots/DC, optional full heal and new spells.
 * options: { useFixed: boolean, fullHeal: boolean, newSpellIds?: string[] }.
 * Returns new character object; does not mutate. No-op if level >= 20.
 */
export function levelUpCharacter(character, options = {}) {
  const { useFixed = false, fullHeal = true, newSpellIds } = options;
  const level = Number(character.level) || 1;
  if (level >= 20) return { ...character };

  const newLevel = level + 1;
  const conMod = getAbilityModifier(character.abilityScores?.con ?? 10);
  const hpGain = computeHPGainForLevel(character.class, conMod, useFixed);
  const currentMax = character.maxHP ?? 10;
  const newMaxHP = currentMax + hpGain;
  const nextChar = {
    ...character,
    level: newLevel,
    maxHP: newMaxHP,
    currentHP: fullHeal ? newMaxHP : Math.min(newMaxHP, character.currentHP ?? currentMax),
    updatedAt: new Date().toISOString(),
  };

  if (CLASS_SPELL_ABILITY[character.class]) {
    const maxSlots = SPELL_SLOTS_BY_LEVEL[newLevel] || {};
    nextChar.spellSlots = {};
    for (const [lev, max] of Object.entries(maxSlots)) {
      nextChar.spellSlots[lev] = max;
    }
    nextChar.spellDC = computeSpellDC({ ...nextChar, level: newLevel });
  } else {
    nextChar.spellSlots = nextChar.spellSlots ?? {};
  }

  if (newSpellIds?.length) {
    nextChar.spellsKnown = [...(character.spellsKnown ?? []), ...newSpellIds];
  }

  return nextChar;
}
