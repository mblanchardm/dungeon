import { describe, it, expect } from 'vitest';
import { calculateTotalAC, calculateEquipmentImpact } from './equipmentHelpers.js';

describe('equipmentHelpers', () => {
  const baseChar = {
    abilityScores: { str: 12, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    equipped: {},
    AC: 10,
  };

  describe('calculateTotalAC', () => {
    it('returns 10 + DEX mod when unarmored and no shield', () => {
      const char = { ...baseChar, abilityScores: { ...baseChar.abilityScores, dex: 14 } };
      const ac = calculateTotalAC(char);
      expect(ac).toBe(12); // 10 + 2
    });

    it('returns 10 when DEX is 10 (no modifier)', () => {
      const char = { ...baseChar, abilityScores: { ...baseChar.abilityScores, dex: 10 } };
      const ac = calculateTotalAC(char);
      expect(ac).toBe(10);
    });
  });

  describe('calculateEquipmentImpact', () => {
    it('returns null for item without mechanics', () => {
      const result = calculateEquipmentImpact(baseChar, { id: 'x', name: 'X' });
      expect(result).toBeNull();
    });

    it('returns armor type for armor item', () => {
      const armorItem = {
        id: 'leather',
        name: 'Leather Armor',
        mechanics: {
          type: 'armor',
          baseAC: 11,
          addDex: true,
          maxDex: null,
          armorType: 'light',
        },
      };
      const result = calculateEquipmentImpact(baseChar, armorItem);
      expect(result).not.toBeNull();
      expect(result.type).toBe('armor');
      expect(result.armorType).toBe('light');
      expect(result.newAC).toBe(13); // 11 + 2 DEX
    });
  });
});
