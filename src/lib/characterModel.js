/**
 * D&D 5e character data model and helpers.
 * Used by CreateCharacterWizard (write) and CharacterSheet (read/write).
 */

import { SKILLS, SKILL_NAMES_ES, SAVING_THROWS, RACIAL_BONUSES } from './constants.js';
import {
  CLASS_HIT_DIE,
  CLASS_RESOURCES,
  CLASS_STARTING_GOLD,
  SPELL_SLOTS_BY_LEVEL,
  HALF_CASTER_SLOTS,
  WARLOCK_PACT_SLOTS,
  HALF_CASTER_CLASSES,
  PREPARED_CASTERS,
  CLASS_SPELL_ABILITY,
  SPELLS_KNOWN_BY_CLASS_LEVEL,
  ASI_LEVELS,
} from './classData.js';

export { SKILLS, SKILL_NAMES_ES, SAVING_THROWS, RACIAL_BONUSES };
export {
  CLASS_HIT_DIE,
  CLASS_RESOURCES,
  CLASS_STARTING_GOLD,
  SPELL_SLOTS_BY_LEVEL,
  HALF_CASTER_SLOTS,
  WARLOCK_PACT_SLOTS,
  HALF_CASTER_CLASSES,
  PREPARED_CASTERS,
  CLASS_SPELL_ABILITY,
  SPELLS_KNOWN_BY_CLASS_LEVEL,
  ASI_LEVELS,
};

/** Ability modifier: (score - 10) / 2, round down */
export function getAbilityModifier(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  return Math.floor((n - 10) / 2);
}

/**
 * Calculate skill modifier for a character.
 * @param {object} character - Character with abilityScores, proficiencies, level
 * @param {string} skillName - Skill name (e.g. 'Stealth')
 * @returns {number} - Skill modifier (ability mod + proficiency if proficient)
 */
export function getSkillModifier(character, skillName) {
  const ability = SKILLS[skillName];
  if (!ability) return 0;
  const abilityScore = character.abilityScores?.[ability] ?? 10;
  const mod = getAbilityModifier(abilityScore);
  const profBonus = getProficiencyBonus(character.level ?? 1);
  const isExpert = character.proficiencies?.expertise?.includes(skillName);
  const isProficient = character.proficiencies?.skills?.includes(skillName);
  const isBard = character.class === 'Bard';
  if (isExpert) return mod + profBonus * 2;
  if (isProficient) return mod + profBonus;
  if (isBard && (character.level ?? 1) >= 2) return mod + Math.floor(profBonus / 2); // Jack of All Trades
  return mod;
}

/**
 * Calculate saving throw modifier for a character.
 * @param {object} character - Character with abilityScores, proficiencies, level
 * @param {string} ability - Ability key (e.g. 'str', 'dex')
 * @returns {number} - Save modifier (ability mod + proficiency if proficient)
 */
export function getSaveModifier(character, ability) {
  const abilityScore = character.abilityScores?.[ability] ?? 10;
  const mod = getAbilityModifier(abilityScore);
  const isProficient = character.proficiencies?.saves?.includes(ability);
  const profBonus = isProficient ? getProficiencyBonus(character.level ?? 1) : 0;
  return mod + profBonus;
}

/** Compute max resource value for a class/resource */
export function getResourceMax(className, resourceId, character) {
  const def = CLASS_RESOURCES[className]?.[resourceId];
  if (!def) return 0;
  const level = character?.level ?? 1;
  const chaMod = Math.max(0, getAbilityModifier(character?.abilityScores?.cha ?? 10));
  if (def.maxFormula === 'level') return level;
  if (def.maxFormula === 'chaMod') return chaMod;
  if (def.maxFormula === 'level×5') return level * 5;
  if (resourceId === 'rage') {
    if (level >= 20) return 999; // Unlimited
    if (level >= 17) return 6;
    if (level >= 12) return 5;
    if (level >= 6) return 4;
    if (level >= 3) return 3;
    return 2;
  }
  if (resourceId === 'actionSurge') return level >= 17 ? 2 : level >= 2 ? 1 : 0;
  if (resourceId === 'wildShape') return level >= 20 ? 999 : level >= 2 ? 2 : 0;
  return Number(def.maxFormula) || 0;
}

/**
 * Get spell slots for a class at a given level.
 * Handles full casters, half casters, and Warlock Pact Magic.
 */
export function getSpellSlotsForClass(className, level) {
  if (className === 'Warlock') {
    const pact = WARLOCK_PACT_SLOTS[level] || { slots: 0, slotLevel: 0 };
    // Warlock slots as object: { pactSlotLevel: numSlots }
    if (pact.slots === 0) return {};
    return { [pact.slotLevel]: pact.slots };
  }
  if (HALF_CASTER_CLASSES.includes(className)) {
    return HALF_CASTER_SLOTS[level] || {};
  }
  if (CLASS_SPELL_ABILITY[className]) {
    return SPELL_SLOTS_BY_LEVEL[level] || {};
  }
  return {};
}

/**
 * Check if a character is multiclassed
 * @param {object} character - Character object
 * @returns {boolean} - True if character has multiple classes
 */
export function isMulticlassed(character) {
  return (character.classes?.length ?? 0) > 1;
}

/**
 * Get display string for character's class(es)
 * @param {object} character - Character object
 * @returns {string} - e.g. "Fighter 3 / Wizard 2" or just "Fighter"
 */
export function getClassDisplay(character) {
  if (!character.classes || character.classes.length === 0) {
    return character.class || 'Sin clase';
  }
  if (character.classes.length === 1) {
    return character.classes[0].name;
  }
  return character.classes.map((c) => `${c.name} ${c.level}`).join(' / ');
}

/**
 * Get total character level (sum of all class levels)
 * @param {object} character - Character object
 * @returns {number} - Total level
 */
export function getTotalLevel(character) {
  if (!character.classes || character.classes.length === 0) {
    return character.level ?? 1;
  }
  return character.classes.reduce((sum, c) => sum + (c.level ?? 0), 0);
}

/**
 * Calculate multiclass spellcaster level for spell slot determination
 * Per PHB p.164: Full casters = class level, Half = level/2, Third = level/3
 * @param {object} character - Character with classes array
 * @returns {number} - Effective caster level for slot table
 */
export function getMulticlassCasterLevel(character) {
  const classes = character.classes || [];
  if (classes.length === 0) {
    // Single class fallback
    if (CLASS_SPELL_ABILITY[character.class]) {
      if (HALF_CASTER_CLASSES.includes(character.class)) {
        return Math.floor((character.level ?? 1) / 2);
      }
      return character.level ?? 1;
    }
    return 0;
  }
  
  let casterLevel = 0;
  for (const cls of classes) {
    if (cls.name === 'Warlock') continue; // Warlock uses Pact Magic, separate
    if (CLASS_SPELL_ABILITY[cls.name]) {
      if (HALF_CASTER_CLASSES.includes(cls.name)) {
        casterLevel += Math.floor(cls.level / 2);
      } else {
        casterLevel += cls.level;
      }
    }
  }
  return casterLevel;
}

/**
 * Get spell slots for a multiclass character
 * @param {object} character - Character object
 * @returns {object} - Spell slots by level
 */
export function getMulticlassSpellSlots(character) {
  const classes = character.classes || [];
  
  // Check for Warlock (uses separate Pact Magic)
  const warlockClass = classes.find((c) => c.name === 'Warlock');
  const warlockSlots = warlockClass ? getSpellSlotsForClass('Warlock', warlockClass.level) : {};
  
  // Calculate combined caster level for non-Warlock classes
  const casterLevel = getMulticlassCasterLevel(character);
  const regularSlots = casterLevel > 0 ? (SPELL_SLOTS_BY_LEVEL[casterLevel] || {}) : {};
  
  // Combine (Warlock slots are in addition to regular slots)
  const combined = { ...regularSlots };
  for (const [level, count] of Object.entries(warlockSlots)) {
    combined[level] = (combined[level] ?? 0) + count;
  }
  
  return combined;
}

/** Proficiency bonus by character level (1–20). */
export function getProficiencyBonus(level) {
  const n = Math.min(20, Math.max(1, Number(level) || 1));
  if (n <= 4) return 2;
  if (n <= 8) return 3;
  if (n <= 12) return 4;
  if (n <= 16) return 5;
  return 6;
}

/** Get max number of spells a prepared caster can prepare. */
export function getPreparedSpellCount(character) {
  const className = character?.class;
  if (!PREPARED_CASTERS.includes(className)) return 0;
  const level = character?.level ?? 1;
  if (className === 'Paladin' && level < 2) return 0;
  const wis = getAbilityModifier(character?.abilityScores?.wis ?? 10);
  const int = getAbilityModifier(character?.abilityScores?.int ?? 10);
  const cha = getAbilityModifier(character?.abilityScores?.cha ?? 10);
  if (className === 'Wizard') return level + int;
  if (className === 'Cleric' || className === 'Druid') return level + wis;
  if (className === 'Paladin') return Math.floor(level / 2) + cha;
  return 0;
}

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
    ACManual: overrides.ACManual ?? false, // If true, AC is manually set and not auto-calculated
    spellDC: overrides.spellDC ?? undefined,
    inspiration: overrides.inspiration ?? 0,
    // Death saves tracking
    deathSaves: {
      success: 0,
      failure: 0,
      ...(overrides.deathSaves || {})
    },
    // Hit dice for short rests
    hitDice: {
      total: overrides.level ?? 1,
      used: 0,
      ...(overrides.hitDice || {})
    },
    // Proficiencies (skills, saves, tools, weapons, armor)
    proficiencies: {
      skills: [],
      saves: [],
      tools: [],
      weapons: [],
      armor: [],
      expertise: [],
      ...(overrides.proficiencies || {})
    },
    // ASIs/Feats taken at levels 4, 8, 12, 16, 19
    asisTaken: overrides.asisTaken ?? [],
    // Feats list (feat IDs)
    feats: overrides.feats ?? [],
    // Speed in feet (default 30, modified by race)
    speed: overrides.speed ?? 30,
    // Initiative bonus (beyond DEX, from feats like Alert)
    initiativeBonus: overrides.initiativeBonus ?? 0,
    // Active conditions (condition IDs)
    conditions: overrides.conditions ?? [],
    // Concentration: spellId if concentrating on a spell, null otherwise
    concentratingOn: overrides.concentratingOn ?? null,
    // Class resources: { rage: { current: 2, max: 2 }, ... }; max computed from level
    resources: overrides.resources ?? {},
    // Languages known (language IDs)
    languages: overrides.languages ?? ['common'],
    // Multiclass support: array of { className, level } if multiclassed
    // Primary class is still in 'class' field for backwards compatibility
    classes: overrides.classes ?? [], // e.g. [{ name: 'Fighter', level: 3 }, { name: 'Wizard', level: 2 }]
    // Character portrait (base64 data URL or external URL)
    portraitUrl: overrides.portraitUrl ?? null,
    // Session notes / adventure log (array of timestamped entries)
    sessionNotes: overrides.sessionNotes ?? [],
    // Prepared spells (for Wizard, Cleric, Druid, Paladin); spell IDs
    spellsPrepared: overrides.spellsPrepared ?? [],
    // Current encounter: { order: [{ id, name, initiative, isPlayer }], currentIndex }
    currentEncounter: overrides.currentEncounter ?? null,
    // Action economy this turn: { action: false, bonusAction: false, reaction: false }
    actionUsed: overrides.actionUsed ?? { action: false, bonusAction: false, reaction: false },
    // Racial/class feature uses (resets on long rest): { thaumaturgy: 0 }
    featureUses: overrides.featureUses ?? {},
    inspirationMax: overrides.inspirationMax ?? 0,
    spellSlots: overrides.spellSlots ?? {},
    gold: overrides.gold ?? 0,
    spellsKnown: overrides.spellsKnown ?? [],
    equipment: overrides.equipment ?? [],
    // Custom equipment items (magic items, treasures, homebrew)
    customEquipment: overrides.customEquipment ?? [],
    // Custom/homebrew spells
    customSpells: overrides.customSpells ?? [],
    // Equipped slots for active gear affecting stats
    equipped: {
      armor: null,      // equipment id for worn armor
      mainHand: null,   // equipment id for primary weapon
      offHand: null,    // equipment id for shield or secondary weapon
      ...(overrides.equipped || {})
    },
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
 * options: { useFixed: boolean, fullHeal: boolean, newSpellIds?: string[], targetClassName?: string }.
 * For multiclass, targetClassName specifies which class to level. Returns new character object; does not mutate. No-op if level >= 20.
 */
export function levelUpCharacter(character, options = {}) {
  const { useFixed = false, fullHeal = true, newSpellIds, targetClassName } = options;
  const classes = character.classes || [];
  if (classes.length === 0 && !character.class) return character;
  const totalLevel = classes.length > 0
    ? classes.reduce((sum, c) => sum + (c.level ?? 0), 0)
    : (Number(character.level) || 1);
  if (totalLevel >= 20) return { ...character };

  const newTotalLevel = totalLevel + 1;
  const conMod = getAbilityModifier(character.abilityScores?.con ?? 10);

  // Determine which class to level (for HP, spells, hit die)
  let targetClass = character.class;
  let updatedClasses = classes;
  if (classes.length > 0) {
    const chosen = targetClassName
      ? classes.find((c) => c.name === targetClassName)
      : classes[0];
    targetClass = chosen?.name ?? character.class;
    updatedClasses = classes.map((c) =>
      c.name === targetClass
        ? { ...c, level: (c.level ?? 1) + 1 }
        : c
    );
  } else {
    // Pre-migration: single class without classes array
    targetClass = character.class;
    updatedClasses = [{ name: character.class, level: newTotalLevel }];
  }

  const hpGain = computeHPGainForLevel(targetClass, conMod, useFixed);
  const currentMax = character.maxHP ?? 10;
  const newMaxHP = currentMax + hpGain;
  const targetClassNewLevel = updatedClasses.find((c) => c.name === targetClass)?.level ?? 1;

  const nextChar = {
    ...character,
    level: newTotalLevel,
    class: updatedClasses.length === 1 ? updatedClasses[0].name : character.class,
    classes: updatedClasses,
    maxHP: newMaxHP,
    currentHP: fullHeal ? newMaxHP : Math.min(newMaxHP, character.currentHP ?? currentMax),
    updatedAt: new Date().toISOString(),
  };

  // Spell slots/DC based on total caster level (use getMulticlassSpellSlots)
  const casterLevel = getMulticlassCasterLevel({ ...nextChar, classes: updatedClasses });
  const maxSlots = casterLevel > 0 ? SPELL_SLOTS_BY_LEVEL[casterLevel] || {} : {};
  const warlockClass = updatedClasses.find((c) => c.name === 'Warlock');
  const warlockSlots = warlockClass ? getSpellSlotsForClass('Warlock', warlockClass.level) : {};
  nextChar.spellSlots = { ...maxSlots };
  for (const [lev, count] of Object.entries(warlockSlots)) {
    nextChar.spellSlots[lev] = (nextChar.spellSlots[lev] ?? 0) + count;
  }
  if (CLASS_SPELL_ABILITY[targetClass]) {
    nextChar.spellDC = computeSpellDC({ ...nextChar, level: targetClassNewLevel, class: targetClass });
  } else if (!nextChar.spellDC && character.spellDC) {
    nextChar.spellDC = character.spellDC;
  }

  if (newSpellIds?.length) {
    nextChar.spellsKnown = [...(character.spellsKnown ?? []), ...newSpellIds];
  }

  nextChar.hitDice = {
    total: newTotalLevel,
    used: character.hitDice?.used ?? 0,
  };

  return nextChar;
}
