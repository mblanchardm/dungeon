import { describe, it, expect, vi } from 'vitest';
import {
  getAbilityModifier,
  getProficiencyBonus,
  applyRacialBonuses,
  createCharacter,
  computeSpellDC,
  computeMaxHPLevel1,
  computeHPGainForLevel,
  levelUpCharacter,
  getSpellsKnownCountAtLevel,
  getResourceMax,
  getMaxSpellLevelForCharacterLevel,
  RACIAL_BONUSES,
  CLASS_HIT_DIE,
} from './characterModel.js';

describe('getAbilityModifier', () => {
  it('returns 0 for 10', () => {
    expect(getAbilityModifier(10)).toBe(0);
  });
  it('returns +1 for 12', () => {
    expect(getAbilityModifier(12)).toBe(1);
  });
  it('returns +5 for 20', () => {
    expect(getAbilityModifier(20)).toBe(5);
  });
  it('returns -1 for 8', () => {
    expect(getAbilityModifier(8)).toBe(-1);
  });
  it('returns 0 for NaN', () => {
    expect(getAbilityModifier(NaN)).toBe(0);
  });
});

describe('getProficiencyBonus', () => {
  it('returns 2 for levels 1-4', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
  });
  it('returns 3 for levels 5-8', () => {
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
  });
  it('returns 6 for level 20', () => {
    expect(getProficiencyBonus(20)).toBe(6);
  });
});

describe('applyRacialBonuses', () => {
  it('adds Tiefling bonuses to ability scores', () => {
    const base = { str: 10, dex: 10, con: 10, int: 13, wis: 10, cha: 16 };
    const result = applyRacialBonuses(base, 'Tiefling');
    expect(result.cha).toBe(18);
    expect(result.int).toBe(14);
    expect(result.str).toBe(10);
  });
  it('returns copy when race has no bonuses', () => {
    const base = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const result = applyRacialBonuses(base, 'Unknown');
    expect(result).toEqual(base);
    expect(result).not.toBe(base);
  });
});

describe('createCharacter', () => {
  it('returns object with defaults when no overrides', () => {
    const c = createCharacter({});
    expect(c).toHaveProperty('id');
    expect(c.name).toBe('');
    expect(c.race).toBe('');
    expect(c.class).toBe('');
    expect(c.level).toBe(1);
    expect(c.abilityScores).toEqual({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    expect(c.maxHP).toBe(10);
    expect(c.currentHP).toBe(10);
    expect(c.gold).toBe(0);
    expect(c.spellsKnown).toEqual([]);
    expect(c.equipment).toEqual([]);
  });
  it('merges overrides', () => {
    const c = createCharacter({ name: 'Test', level: 4 });
    expect(c.name).toBe('Test');
    expect(c.level).toBe(4);
    expect(c.maxHP).toBe(10);
  });
});

describe('computeSpellDC', () => {
  it('returns undefined for non-caster', () => {
    expect(computeSpellDC({ class: 'Fighter', abilityScores: {} })).toBeUndefined();
  });
  it('returns 8 + prof + mod for Bard', () => {
    const char = { class: 'Bard', level: 1, abilityScores: { cha: 18 } };
    expect(computeSpellDC(char)).toBe(8 + 2 + 4);
  });
});

describe('computeMaxHPLevel1', () => {
  it('returns hit die + CON mod for Bard', () => {
    expect(computeMaxHPLevel1('Bard', 1)).toBe(8 + 1);
  });
  it('returns at least 1', () => {
    expect(computeMaxHPLevel1('Wizard', -5)).toBe(1);
  });
});

describe('computeHPGainForLevel', () => {
  it('fixed: d8 class with CON mod +1 returns 6', () => {
    expect(computeHPGainForLevel('Bard', 1, true)).toBe(6);
  });
  it('fixed: d8 class with CON mod 0 returns 5', () => {
    expect(computeHPGainForLevel('Bard', 0, true)).toBe(5);
  });
  it('fixed: returns at least 1', () => {
    expect(computeHPGainForLevel('Wizard', -5, true)).toBe(1);
  });
  it('roll: returns integer in valid range for d8 and CON mod +1', () => {
    const die = CLASS_HIT_DIE['Bard'];
    const conMod = 1;
    for (let i = 0; i < 30; i++) {
      const gain = computeHPGainForLevel('Bard', conMod, false);
      expect(Number.isInteger(gain)).toBe(true);
      expect(gain).toBeGreaterThanOrEqual(1);
      expect(gain).toBeLessThanOrEqual(die + conMod);
    }
  });
});

describe('levelUpCharacter', () => {
  it('returns character unchanged when level is 20', () => {
    const c = { level: 20, maxHP: 100, class: 'Bard' };
    const result = levelUpCharacter(c, { useFixed: true, fullHeal: true });
    expect(result.level).toBe(20);
    expect(result.maxHP).toBe(100);
  });
  it('level 4 Bard with useFixed and fullHeal: level 5, maxHP + 6, currentHP = new maxHP, spellSlots and spellDC updated', () => {
    const c = {
      id: 'b',
      level: 4,
      maxHP: 23,
      currentHP: 10,
      class: 'Bard',
      abilityScores: { con: 12, cha: 18 },
      spellSlots: { 1: 4, 2: 3 },
      spellDC: 14,
    };
    const result = levelUpCharacter(c, { useFixed: true, fullHeal: true });
    expect(result.level).toBe(5);
    expect(result.maxHP).toBe(23 + 6); // d8 fixed: 5 + CON mod 1 = 6
    expect(result.currentHP).toBe(result.maxHP);
    expect(result.spellSlots).toEqual({ 1: 4, 2: 3, 3: 2 });
    expect(result.spellDC).toBe(8 + 3 + 4); // prof 3, cha 18 mod 4
  });
  it('non-caster: level and HP updated, spellSlots empty, spellDC undefined', () => {
    const c = {
      id: 'f',
      level: 2,
      maxHP: 15,
      currentHP: 15,
      class: 'Fighter',
      abilityScores: { con: 14 },
      spellSlots: {},
    };
    const result = levelUpCharacter(c, { useFixed: true, fullHeal: false });
    expect(result.level).toBe(3);
    expect(result.maxHP).toBe(15 + 8); // d10 fixed: floor(10/2)+1+2 = 8
    expect(result.currentHP).toBe(15); // no full heal
    expect(result.spellSlots).toEqual({});
    expect(result.spellDC).toBeUndefined();
  });
  it('merges newSpellIds into spellsKnown', () => {
    const c = {
      id: 'b',
      level: 4,
      maxHP: 23,
      currentHP: 23,
      class: 'Bard',
      abilityScores: { con: 12, cha: 18 },
      spellsKnown: ['palabra-curativa', 'hechizar-persona'],
      spellSlots: { 1: 4, 2: 3 },
      spellDC: 14,
    };
    const result = levelUpCharacter(c, { useFixed: true, fullHeal: true, newSpellIds: ['sugerencia'] });
    expect(result.level).toBe(5);
    expect(result.spellsKnown).toEqual(['palabra-curativa', 'hechizar-persona', 'sugerencia']);
  });
});

describe('getSpellsKnownCountAtLevel', () => {
  it('returns correct count for Bard at levels 1 and 5', () => {
    expect(getSpellsKnownCountAtLevel('Bard', 1)).toBe(4);
    expect(getSpellsKnownCountAtLevel('Bard', 5)).toBe(8);
  });
  it('returns correct count for Wizard at levels 1 and 5', () => {
    expect(getSpellsKnownCountAtLevel('Wizard', 1)).toBe(6);
    expect(getSpellsKnownCountAtLevel('Wizard', 5)).toBe(14);
  });
  it('returns 0 for Paladin (prepared caster)', () => {
    expect(getSpellsKnownCountAtLevel('Paladin', 2)).toBe(0);
    expect(getSpellsKnownCountAtLevel('Paladin', 5)).toBe(0);
  });
  it('returns correct count for Ranger and Sorcerer', () => {
    expect(getSpellsKnownCountAtLevel('Ranger', 2)).toBe(2);
    expect(getSpellsKnownCountAtLevel('Ranger', 5)).toBe(4);
    expect(getSpellsKnownCountAtLevel('Sorcerer', 1)).toBe(2);
    expect(getSpellsKnownCountAtLevel('Sorcerer', 20)).toBe(21);
  });
  it('returns 0 for unknown class or level 0', () => {
    expect(getSpellsKnownCountAtLevel('Fighter', 5)).toBe(0);
    expect(getSpellsKnownCountAtLevel('Bard', 0)).toBe(0);
  });
});

describe('getResourceMax', () => {
  it('returns 1 Channel Divinity at level 1-5 for Cleric/Paladin', () => {
    expect(getResourceMax('Cleric', 'channelDivinity', { level: 1 })).toBe(1);
    expect(getResourceMax('Cleric', 'channelDivinity', { level: 5 })).toBe(1);
    expect(getResourceMax('Paladin', 'channelDivinity', { level: 3 })).toBe(1);
  });
  it('returns 2 Channel Divinity at level 6+ for Cleric/Paladin', () => {
    expect(getResourceMax('Cleric', 'channelDivinity', { level: 6 })).toBe(2);
    expect(getResourceMax('Paladin', 'channelDivinity', { level: 10 })).toBe(2);
  });
});

describe('getMaxSpellLevelForCharacterLevel', () => {
  it('returns 1 for level 1', () => {
    expect(getMaxSpellLevelForCharacterLevel(1)).toBe(1);
  });
  it('returns 3 for level 5', () => {
    expect(getMaxSpellLevelForCharacterLevel(5)).toBe(3);
  });
  it('returns 5 for level 10', () => {
    expect(getMaxSpellLevelForCharacterLevel(10)).toBe(5);
  });
});
