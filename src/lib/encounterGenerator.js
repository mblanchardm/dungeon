/**
 * Generate NPCs for encounters by class and quantity.
 * Uses createCharacter + CLASS_HIT_DIE and getAbilityModifier for HP/AC.
 */
import { createCharacter, getAbilityModifier, computeHPGainForLevel } from './characterModel.js';
import { CLASS_HIT_DIE } from './classData.js';

const CLASS_LABEL_ES = {
  Barbarian: 'Bárbaro',
  Bard: 'Bardo',
  Cleric: 'Clérigo',
  Druid: 'Druida',
  Fighter: 'Guerrero',
  Monk: 'Monje',
  Paladin: 'Paladín',
  Ranger: 'Explorador',
  Rogue: 'Pícaro',
  Sorcerer: 'Hechicero',
  Warlock: 'Brujo',
  Wizard: 'Mago',
};

/**
 * Generate a display name for an NPC (e.g. "Guerrero 1", "Mago 2").
 * @param {string} className
 * @param {number} index 1-based index for this class
 * @returns {string}
 */
function npcName(className, index) {
  const label = CLASS_LABEL_ES[className] || className;
  return `${label} ${index}`;
}

/**
 * Standard NPC ability array (slightly above average for level 1).
 * Used when generating NPCs so HP/AC are consistent.
 */
const NPC_ABILITY_SCORES = { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 };

/**
 * Generate NPCs for an encounter.
 * @param {Array<{ className: string, quantity: number }>} spec - e.g. [{ className: 'Fighter', quantity: 3 }, { className: 'Wizard', quantity: 2 }]
 * @param {number} [defaultLevel=1] - level for each NPC
 * @returns {Array<object>} - array of character-like objects (full createCharacter result)
 */
export function generateEncounter(spec, defaultLevel = 1) {
  const result = [];
  for (const { className, quantity } of spec) {
    if (!className || quantity < 1) continue;
    const level = Math.max(1, Math.min(20, Number(defaultLevel) || 1));
    const conMod = getAbilityModifier(NPC_ABILITY_SCORES.con);
    const dexMod = getAbilityModifier(NPC_ABILITY_SCORES.dex);
    const hitDie = CLASS_HIT_DIE[className] ?? 8;
    let maxHP = hitDie + conMod;
    for (let l = 2; l <= level; l++) {
      maxHP += computeHPGainForLevel(className, conMod, true);
    }
    maxHP = Math.max(1, maxHP);
    const AC = 10 + dexMod;

    for (let i = 1; i <= quantity; i++) {
      const name = npcName(className, i);
      const npc = createCharacter({
        name,
        class: className,
        classes: [{ name: className, level }],
        level,
        abilityScores: { ...NPC_ABILITY_SCORES },
        maxHP,
        currentHP: maxHP,
        AC,
        ACManual: true,
      });
      result.push(npc);
    }
  }
  return result;
}
