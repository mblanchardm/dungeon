/**
 * Unit tests for tacticsHelpers.js
 * Testing personalized play guides, combat tactics, equipment advice, and spell combos
 */

import { describe, it, expect } from 'vitest';
import {
  generatePlayGuide,
  generateCombatGuide,
  detectSpellCombos,
  generateEquipmentAdvice,
  generateSocialGuidance,
} from './tacticsHelpers.js';

describe('generatePlayGuide', () => {
  it('should generate play guide for Tiefling Bard with high CHA', () => {
    const character = {
      class: 'Bard',
      race: 'Tiefling',
      abilityScores: { str: 10, dex: 14, con: 12, int: 13, wis: 10, cha: 18 },
    };
    
    const guide = generatePlayGuide(character);
    
    expect(guide).toContain('Apoyo versátil');
    expect(guide).toContain('Tiefling');
    expect(guide).toContain('CAR');
  });

  it('should generate play guide for Dwarf Barbarian with high CON', () => {
    const character = {
      class: 'Barbarian',
      race: 'Dwarf',
      abilityScores: { str: 16, dex: 12, con: 16, int: 8, wis: 10, cha: 8 },
    };
    
    const guide = generatePlayGuide(character);
    
    expect(guide).toContain('Tanque de daño');
    expect(guide).toContain('Dwarf');
    expect(guide).toContain('CON');
  });

  it('should handle character with no class gracefully', () => {
    const character = {
      class: 'UnknownClass',
      race: 'Human',
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    };
    
    const guide = generatePlayGuide(character);
    
    expect(guide).toBe('');
  });

  it('should provide ability advice for low primary stat', () => {
    const character = {
      class: 'Wizard',
      race: 'Human',
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    };
    
    const guide = generatePlayGuide(character);
    
    expect(guide).toContain('INT');
  });
});

describe('generateCombatGuide', () => {
  it('should generate combat rotation for Bard', () => {
    const character = {
      class: 'Bard',
      subclass: 'Colegio del Conocimiento',
      spellsKnown: ['palabra-curativa', 'burla-viciosa'],
      inspirationMax: 3,
    };
    
    const guide = generateCombatGuide(character);
    
    expect(guide.rotation).toBeDefined();
    expect(guide.rotation.length).toBeGreaterThan(0);
    expect(guide.rotation[0]).toContain('Palabra Curativa');
  });

  it('should generate combos for subclass', () => {
    const character = {
      class: 'Bard',
      subclass: 'Colegio del Conocimiento',
      spellsKnown: ['palabra-curativa'],
      inspirationMax: 3,
    };
    
    const guide = generateCombatGuide(character);
    
    expect(guide.combos).toBeDefined();
    expect(guide.combos.length).toBeGreaterThan(0);
  });

  it('should generate situational advice for Barbarian', () => {
    const character = {
      class: 'Barbarian',
      subclass: 'Berserker',
      spellsKnown: [],
    };
    
    const guide = generateCombatGuide(character);
    
    expect(guide.situations).toBeDefined();
    expect(guide.situations.length).toBeGreaterThan(0);
    expect(guide.situations.some(s => s.includes('Rage'))).toBe(true);
  });
});

describe('detectSpellCombos', () => {
  it('should detect Hechizar + Sugerencia combo', () => {
    const character = {
      class: 'Bard',
      spellsKnown: ['hechizar-persona', 'sugerencia', 'burla-viciosa'],
    };
    
    const combos = detectSpellCombos(character);
    
    expect(combos.length).toBeGreaterThan(0);
    expect(combos.some(c => c.includes('Hechizar Persona'))).toBe(true);
    expect(combos.some(c => c.includes('Sugerencia'))).toBe(true);
  });

  it('should detect Palabra Curativa + Bendición combo', () => {
    const character = {
      class: 'Cleric',
      spellsKnown: ['palabra-curativa', 'bendicion', 'rayo-curativo'],
    };
    
    const combos = detectSpellCombos(character);
    
    expect(combos.some(c => c.includes('Palabra Curativa'))).toBe(true);
    expect(combos.some(c => c.includes('Bendición'))).toBe(true);
  });

  it('should detect Bard-specific combos with Inspiración', () => {
    const character = {
      class: 'Bard',
      spellsKnown: ['palabra-curativa', 'burla-viciosa'],
      inspirationMax: 3,
    };
    
    const combos = detectSpellCombos(character);
    
    expect(combos.some(c => c.includes('Inspiración Barda'))).toBe(true);
  });

  it('should return empty array if no combos available', () => {
    const character = {
      class: 'Fighter',
      spellsKnown: [],
    };
    
    const combos = detectSpellCombos(character);
    
    expect(combos).toEqual([]);
  });
});

describe('generateEquipmentAdvice', () => {
  it('should generate advice for high DEX Rogue', () => {
    const character = {
      class: 'Rogue',
      abilityScores: { str: 10, dex: 18, con: 12, int: 12, wis: 10, cha: 10 },
    };
    
    const advice = generateEquipmentAdvice(character);
    
    expect(advice).toBeDefined();
    expect(advice.weapons).toContain('Finesse');
    expect(advice.weapons).toContain('DES alta');
  });

  it('should generate advice for high STR Barbarian', () => {
    const character = {
      class: 'Barbarian',
      abilityScores: { str: 18, dex: 10, con: 16, int: 8, wis: 10, cha: 8 },
    };
    
    const advice = generateEquipmentAdvice(character);
    
    expect(advice).toBeDefined();
    expect(advice.weapons).toContain('FUE alta');
  });

  it('should include armor advice for Wizard with high DEX', () => {
    const character = {
      class: 'Wizard',
      abilityScores: { str: 8, dex: 16, con: 12, int: 18, wis: 10, cha: 8 },
    };
    
    const advice = generateEquipmentAdvice(character);
    
    expect(advice).toBeDefined();
    expect(advice.armor).toContain('Armadura de Mago');
    expect(advice.armor).toContain('DES');
  });

  it('should return null for class without equipment guide', () => {
    const character = {
      class: 'UnknownClass',
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    };
    
    const advice = generateEquipmentAdvice(character);
    
    expect(advice).toBeNull();
  });

  it('should include essentials list', () => {
    const character = {
      class: 'Bard',
      abilityScores: { str: 10, dex: 14, con: 12, int: 10, wis: 10, cha: 18 },
    };
    
    const advice = generateEquipmentAdvice(character);
    
    expect(advice).toBeDefined();
    expect(advice.essentials).toBeDefined();
    expect(Array.isArray(advice.essentials)).toBe(true);
    expect(advice.essentials.length).toBeGreaterThan(0);
  });
});

describe('generateSocialGuidance', () => {
  it('should combine class and race social guidance', () => {
    const character = {
      class: 'Bard',
      race: 'Tiefling',
    };
    
    const guidance = generateSocialGuidance(character);
    
    expect(guidance).toContain('CAR');
    expect(guidance).toContain('Tiefling');
  });

  it('should handle character with no race', () => {
    const character = {
      class: 'Fighter',
      race: '',
    };
    
    const guidance = generateSocialGuidance(character);
    
    expect(guidance).toBeDefined();
  });

  it('should return empty string for unknown class', () => {
    const character = {
      class: 'UnknownClass',
      race: 'Human',
    };
    
    const guidance = generateSocialGuidance(character);
    
    expect(guidance).toBeDefined();
  });
});
