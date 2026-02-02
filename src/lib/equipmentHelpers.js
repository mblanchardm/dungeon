/**
 * Equipment calculation helpers for dynamic stat display.
 * Calculates AC, attack bonuses, damage based on character's ability scores.
 */

import { getAbilityModifier, getProficiencyBonus } from './characterModel.js';
import { equipment } from '../data/srd.js';

/**
 * Calculate armor AC for a specific character
 * @param {object} character - Character with abilityScores
 * @param {object} armorItem - Equipment item with mechanics.type === 'armor'
 * @returns {number|null} - Calculated AC or null if not armor
 */
export function calculateArmorAC(character, armorItem) {
  const mech = armorItem?.mechanics;
  if (mech?.type !== 'armor') return null;

  const dexMod = getAbilityModifier(character.abilityScores?.dex ?? 10);
  let dexBonus = 0;

  if (mech.addDex) {
    dexBonus = mech.maxDex != null ? Math.min(dexMod, mech.maxDex) : dexMod;
  }

  return mech.baseAC + dexBonus;
}

/**
 * Calculate weapon attack and damage for a specific character
 * @param {object} character - Character with abilityScores and level
 * @param {object} weaponItem - Equipment item with mechanics.type === 'weapon'
 * @returns {object|null} - { attackBonus, damage, damageBonus, damageType, averageDamage } or null
 */
export function calculateWeaponStats(character, weaponItem) {
  const mech = weaponItem?.mechanics;
  if (mech?.type !== 'weapon') return null;

  const strMod = getAbilityModifier(character.abilityScores?.str ?? 10);
  const dexMod = getAbilityModifier(character.abilityScores?.dex ?? 10);
  const profBonus = getProficiencyBonus(character.level ?? 1);

  // Determine which ability modifier to use
  const isFinesse = mech.properties?.includes('finesse');
  const isRanged = mech.range != null && !mech.properties?.includes('thrown');
  const isThrown = mech.properties?.includes('thrown');

  let abilityMod;
  if (isFinesse) {
    // Finesse: use higher of STR/DEX
    abilityMod = Math.max(strMod, dexMod);
  } else if (isRanged) {
    // Ranged weapons use DEX
    abilityMod = dexMod;
  } else if (isThrown) {
    // Thrown can use STR or DEX (player's choice, we default to STR unless DEX is higher)
    abilityMod = Math.max(strMod, dexMod);
  } else {
    // Melee uses STR
    abilityMod = strMod;
  }

  return {
    attackBonus: abilityMod + profBonus,
    damage: mech.damage,
    damageBonus: abilityMod,
    damageType: mech.damageType,
    averageDamage: calculateAverageDamage(mech.damage, abilityMod),
    properties: mech.properties || [],
    range: mech.range,
    twoHanded: mech.twoHanded,
    versatileDamage: mech.versatileDamage
  };
}

/**
 * Calculate average damage from dice notation + modifier
 * @param {string} diceNotation - e.g., "1d8", "2d6"
 * @param {number} modifier - Ability modifier to add
 * @returns {number} - Average damage rounded down
 */
export function calculateAverageDamage(diceNotation, modifier) {
  if (!diceNotation) return modifier;
  
  // Parse "1d8", "2d6", etc.
  const match = diceNotation.match(/(\d+)d(\d+)/);
  if (!match) return modifier;
  
  const numDice = parseInt(match[1], 10);
  const dieSize = parseInt(match[2], 10);
  const avgRoll = numDice * ((dieSize + 1) / 2);
  
  return Math.floor(avgRoll + modifier);
}

/**
 * Calculate equipment impact showing upgrade/downgrade compared to current stats
 * @param {object} character - Character with AC, abilityScores, level
 * @param {object} item - Equipment item with mechanics
 * @returns {object|null} - Impact analysis or null if no mechanics
 */
export function calculateEquipmentImpact(character, item) {
  const mech = item?.mechanics;
  if (!mech) return null;

  if (mech.type === 'armor') {
    const newAC = calculateArmorAC(character, item);
    const currentAC = character.AC ?? 10;
    const strScore = character.abilityScores?.str ?? 10;
    
    // Check STR requirement
    const meetsStrRequirement = !mech.strRequirement || strScore >= mech.strRequirement;
    
    const warnings = [];
    if (mech.stealthDisadvantage) {
      warnings.push('Desventaja en Sigilo');
    }
    if (!meetsStrRequirement) {
      warnings.push(`Requiere FUE ${mech.strRequirement} (tienes ${strScore}): -10 pies velocidad`);
    }

    return {
      type: 'armor',
      armorType: mech.armorType,
      newAC,
      currentAC,
      acChange: newAC - currentAC,
      isUpgrade: newAC > currentAC,
      warnings,
      strRequired: mech.strRequirement,
      meetsStrRequirement
    };
  }

  if (mech.type === 'weapon') {
    const stats = calculateWeaponStats(character, item);
    if (!stats) return null;

    return {
      type: 'weapon',
      ...stats,
      displayDamage: `${stats.damage}${stats.damageBonus >= 0 ? '+' : ''}${stats.damageBonus}`,
      displayVersatile: stats.versatileDamage 
        ? `${stats.versatileDamage}${stats.damageBonus >= 0 ? '+' : ''}${stats.damageBonus}` 
        : null
    };
  }

  if (mech.type === 'shield') {
    const currentAC = character.AC ?? 10;
    return {
      type: 'shield',
      acBonus: mech.acBonus,
      currentAC,
      newAC: currentAC + mech.acBonus
    };
  }

  if (mech.type === 'consumable') {
    return {
      type: 'consumable',
      healing: mech.healing || null
    };
  }

  if (mech.type === 'gear') {
    return {
      type: 'gear',
      uses: mech.uses || null,
      light: mech.light || null,
      duration: mech.duration || null
    };
  }

  return null;
}

/**
 * Get equipment item by ID
 * @param {string} id - Equipment ID
 * @returns {object|undefined} - Equipment item or undefined
 */
export function getEquipmentById(id) {
  return equipment.find((e) => e.id === id);
}

/**
 * Calculate total AC based on equipped armor and shield
 * @param {object} character - Character with equipped slots and abilityScores
 * @returns {number} - Total calculated AC
 */
export function calculateTotalAC(character) {
  const equipped = character.equipped || {};
  let baseAC = 10; // Unarmored
  let shieldBonus = 0;

  // Calculate armor AC
  if (equipped.armor) {
    const armorItem = getEquipmentById(equipped.armor);
    if (armorItem?.mechanics?.type === 'armor') {
      baseAC = calculateArmorAC(character, armorItem);
    }
  } else {
    // Unarmored: 10 + DEX mod
    const dexMod = getAbilityModifier(character.abilityScores?.dex ?? 10);
    baseAC = 10 + dexMod;
  }

  // Add shield bonus
  if (equipped.offHand) {
    const shieldItem = getEquipmentById(equipped.offHand);
    if (shieldItem?.mechanics?.type === 'shield') {
      shieldBonus = shieldItem.mechanics.acBonus;
    }
  }

  return baseAC + shieldBonus;
}

/**
 * Get all equipment of a specific type from inventory
 * @param {object} character - Character with equipment array
 * @param {string} type - Equipment type ('armor', 'weapon', 'shield', etc.)
 * @returns {object[]} - Array of equipment items matching type
 */
export function getEquipmentByType(character, type) {
  const owned = character.equipment ?? [];
  return owned
    .map((id) => getEquipmentById(id))
    .filter((item) => item?.mechanics?.type === type);
}

/** Default weights (lbs) for equipment types when not specified */
const DEFAULT_WEIGHTS = { weapon: 3, armor: 20, shield: 6 };

/**
 * Get carrying capacity in lbs (STR * 15)
 */
export function getCarryingCapacity(character) {
  const str = character?.abilityScores?.str ?? 10;
  return str * 15;
}

/**
 * Encumbrance thresholds (optional DMG rule: encumbered at STR * 5, heavily at STR * 10).
 * medium = STR * 15 (normal carrying capacity).
 * @param {object} character
 * @returns {{ medium: number, encumbered: number }}
 */
export function getEncumbranceThreshold(character) {
  const str = character?.abilityScores?.str ?? 10;
  return {
    medium: str * 15,
    encumbered: str * 5,
  };
}

/**
 * Sum weight of character's equipment
 */
export function getEquipmentWeight(character) {
  const ids = [
    character?.equipped?.mainHand,
    character?.equipped?.offHand,
    character?.equipped?.armor,
    ...(character?.equipment ?? []),
  ].filter(Boolean);
  let total = 0;
  ids.forEach((id) => {
    const item = getEquipmentById(id);
    if (item?.weight != null) total += item.weight;
    else if (item?.mechanics?.type) total += DEFAULT_WEIGHTS[item.mechanics.type] ?? 1;
    else total += 1;
  });
  return total;
}

/**
 * Suggest equipment upgrades based on what character owns
 * @param {object} character - Character with equipment and abilityScores
 * @returns {object} - { armor: string[], weapons: string[], other: string[] }
 */
export function suggestUpgrades(character) {
  const suggestions = {
    armor: [],
    weapons: [],
    other: []
  };

  const ownedArmor = getEquipmentByType(character, 'armor');
  const ownedWeapons = getEquipmentByType(character, 'weapon');
  const hasShield = getEquipmentByType(character, 'shield').length > 0;

  // Armor suggestions
  if (ownedArmor.length === 0) {
    suggestions.armor.push('No tienes armadura. Considera comprar armadura de cuero (10 po) o mejor.');
  } else {
    const bestArmor = ownedArmor.reduce((best, item) => {
      const ac = calculateArmorAC(character, item);
      const bestAC = best ? calculateArmorAC(character, best) : 0;
      return ac > bestAC ? item : best;
    }, null);

    if (bestArmor) {
      const currentAC = calculateArmorAC(character, bestArmor);
      // Find better armor options
      const betterArmor = equipment.filter((item) => {
        if (item.mechanics?.type !== 'armor') return false;
        const newAC = calculateArmorAC(character, item);
        return newAC > currentAC && !ownedArmor.some((o) => o.id === item.id);
      });

      if (betterArmor.length > 0) {
        const cheapest = betterArmor.sort((a, b) => a.costGold - b.costGold)[0];
        suggestions.armor.push(`Mejora de ${bestArmor.name}: considera ${cheapest.name} (${cheapest.cost})`);
      }
    }
  }

  // Shield suggestion
  if (!hasShield) {
    suggestions.other.push('Un escudo (+2 AC, 10 po) mejoraría tu defensa');
  }

  return suggestions;
}
