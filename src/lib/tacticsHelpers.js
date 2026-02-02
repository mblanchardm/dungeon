/**
 * Tactics and guidance helpers for personalized character advice.
 * Generates play guides, combat tactics, equipment recommendations, and spell combos
 * based on character's class, race, ability scores, and known spells.
 */

import { getAbilityModifier } from './characterModel.js';
import { races, classes, subclasses, spells, equipment } from '../data/srd.js';
import { calculateArmorAC, calculateEquipmentImpact, getEquipmentById } from './equipmentHelpers.js';

/**
 * Generate personalized "How to Play" guide based on character's class + race + abilities.
 * @param {object} character - Character object with class, race, abilityScores
 * @returns {string} - Multi-line personalized play guide
 */
export function generatePlayGuide(character) {
  const cls = classes.find(c => c.id === character.class);
  const race = races.find(r => r.id === character.race);
  
  if (!cls) return '';
  
  // Base playstyle from class
  let guide = cls.playstyle || '';
  
  // Add race synergy if available
  if (race && cls.raceSynergies?.[race.id]) {
    guide += `\n\n**${race.name}:** ${cls.raceSynergies[race.id]}`;
  }
  
  // Add ability-based advice
  const abilityAdvice = getAbilityAdvice(character, cls);
  if (abilityAdvice) {
    guide += `\n\n**Tu build:** ${abilityAdvice}`;
  }
  
  return guide;
}

/**
 * Analyze character's ability scores and give personalized advice.
 * @param {object} character - Character with abilityScores
 * @param {object} cls - Class data with primaryAbility, secondaryAbility
 * @returns {string} - Personalized ability advice
 */
function getAbilityAdvice(character, cls) {
  const scores = character.abilityScores || {};
  const primaryMod = getAbilityModifier(scores[cls.primaryAbility] || 10);
  const secondaryMod = getAbilityModifier(scores[cls.secondaryAbility] || 10);
  
  const advice = [];
  
  // Primary stat analysis
  const primaryLabel = cls.primaryAbility?.toUpperCase() || 'PRINCIPAL';
  if (primaryMod >= 4) {
    advice.push(`${primaryLabel} excelente (+${primaryMod}): tus habilidades principales son muy efectivas`);
  } else if (primaryMod >= 2) {
    advice.push(`${primaryLabel} sólida (+${primaryMod}): buen rendimiento`);
  } else if (primaryMod <= 0) {
    advice.push(`${primaryLabel} baja (+${primaryMod}): dificulta tu rol principal, prioriza mejoras ASI`);
  }
  
  // Secondary stat
  const secondaryLabel = cls.secondaryAbility?.toUpperCase() || 'SECUNDARIA';
  if (secondaryMod >= 3) {
    advice.push(`${secondaryLabel} alta (+${secondaryMod}): gran versatilidad`);
  } else if (secondaryMod <= -1) {
    advice.push(`${secondaryLabel} débil (+${secondaryMod}): evita acciones basadas en esta stat`);
  }
  
  // Specific warnings by class
  if (cls.id === 'Wizard' && getAbilityModifier(scores.con || 10) <= 0) {
    advice.push('CON baja: cuidado con concentración y PV. Mantén distancia en combate');
  }
  if (cls.id === 'Barbarian' && getAbilityModifier(scores.dex || 10) <= 0) {
    advice.push('DES baja: AC vulnerable. Usa Rage y alta CON para compensar');
  }
  if ((cls.id === 'Bard' || cls.id === 'Cleric' || cls.id === 'Wizard') && getAbilityModifier(scores.con || 10) >= 3) {
    advice.push('CON alta: excelente para mantener concentración en conjuros');
  }
  
  return advice.length > 0 ? advice.join('. ') + '.' : '';
}

/**
 * Generate combat tactics guide (rotation + combos + situations).
 * @param {object} character - Character object
 * @returns {object} - { rotation: string[], combos: string[], situations: string[] }
 */
export function generateCombatGuide(character) {
  const cls = classes.find(c => c.id === character.class);
  const sub = subclasses.find(s => s.id === character.subclass);
  
  const guide = {
    rotation: [],
    combos: [],
    situations: []
  };
  
  // Class combat tactics
  if (cls?.combatTactics) {
    guide.rotation = Array.isArray(cls.combatTactics) ? cls.combatTactics : [cls.combatTactics];
  }
  
  // Subclass combos
  if (sub?.combos) {
    guide.combos = Array.isArray(sub.combos) ? sub.combos : [sub.combos];
  }
  
  // Add detected spell combos
  const spellCombos = detectSpellCombos(character);
  guide.combos.push(...spellCombos);
  
  // Situational advice (generic patterns based on class)
  guide.situations = generateSituationalAdvice(character, cls);
  
  return guide;
}

/**
 * Detect spell combos from character's known spells.
 * @param {object} character - Character with spellsKnown array
 * @returns {string[]} - Array of combo descriptions
 */
export function detectSpellCombos(character) {
  const knownIds = character.spellsKnown || [];
  const combos = [];
  
  // Predefined combo patterns
  const comboPatterns = [
    {
      spells: ['hechizar-persona', 'sugerencia'],
      combo: 'Control total: Hechizar Persona (1h) + Sugerencia (8h) = manipulación completa de NPC. Ideal fuera de combate.'
    },
    {
      spells: ['palabra-curativa', 'bendicion'],
      combo: 'Soporte: Bendición preventiva (+1d4 ataques/salvaciones) + Palabra Curativa reactiva = máximo uptime de aliados.'
    },
    {
      spells: ['invisibilidad', 'disfrazarse'],
      combo: 'Infiltración: Disfrazarse (apariencia) + Invisibilidad (escape) = espionaje perfecto.'
    },
    {
      spells: ['bola-de-fuego', 'onda-atronadora'],
      combo: 'AoE: Alterna Onda Atronadora (1er nivel, empuje) y Bola de Fuego (3er nivel, alto daño) según agrupación enemiga.'
    },
    {
      spells: ['bendicion', 'bola-de-fuego'],
      combo: 'Buff antes de AoE: Bendición primero (+1d4 grupo), luego Bola de Fuego (máximo daño).'
    },
    {
      spells: ['armadura-de-mago', 'dardo-magico'],
      combo: 'Wizard básico: Armadura de Mago al despertar (AC), Dardo Mágico para daño garantizado.'
    }
  ];
  
  comboPatterns.forEach(pattern => {
    const hasAll = pattern.spells.every(id => knownIds.includes(id));
    if (hasAll) {
      combos.push(pattern.combo);
    }
  });
  
  // Class-specific combos
  if (character.class === 'Bard' && (character.inspirationMax || 0) > 0) {
    if (knownIds.includes('palabra-curativa')) {
      combos.push('Revive + buff: Palabra Curativa (revive aliado) en un turno, Inspiración Barda (+1d6) en el siguiente = aliado de 0 a empoderado en 2 turnos.');
    }
    if (knownIds.includes('burla-viciosa')) {
      combos.push('Control enemigo: Burla Viciosa (desventaja) + Inspiración Barda (ventaja aliado) = swing de +2d6 en un round.');
    }
  }
  
  return combos;
}

/**
 * Generate situational combat advice based on class.
 * @param {object} character - Character object
 * @param {object} cls - Class data
 * @returns {string[]} - Array of situation → response patterns
 */
function generateSituationalAdvice(character, cls) {
  const situations = [];
  const knownIds = character.spellsKnown || [];
  
  // Caster situations
  if (cls?.spellAbility) {
    if (knownIds.includes('palabra-curativa')) {
      situations.push('Aliado cae a 0: Palabra Curativa (acción bonus)');
    }
    if (knownIds.includes('bola-de-fuego') || knownIds.includes('onda-atronadora')) {
      situations.push('Grupo enemigo agrupado: AoE (Bola de Fuego/Onda Atronadora)');
    }
    if (knownIds.includes('hechizar-persona')) {
      situations.push('Negociación hostil: Hechizar Persona fuera de combate');
    }
    if (knownIds.includes('burla-viciosa') || knownIds.includes('dardo-magico')) {
      situations.push('Sin espacios de conjuro: Cantrips (Burla Viciosa/Dardo Mágico)');
    }
  }
  
  // Martial situations
  if (cls?.id === 'Barbarian') {
    situations.push('Inicio de combate: Rage (acción bonus) para resistencia');
    situations.push('PV bajo: acepta daño, Rage mitiga');
    situations.push('Enemigo elite: Reckless Attack (ventaja) para burst');
  }
  
  if (cls?.id === 'Rogue') {
    situations.push('Enemigo aislado: posiciónate para Sneak Attack (aliado adyacente o ventaja)');
    situations.push('Después de atacar: Cunning Action Hide/Disengage (bonus)');
    situations.push('Enemigo enfoca a ti: Disengage + Dash = escape');
  }
  
  if (cls?.id === 'Fighter') {
    situations.push('PV bajo: Second Wind (bonus, cura 1d10+nivel)');
    situations.push('Enemigo elite: Action Surge (turno extra) para burst');
    situations.push('Múltiples enemigos débiles: Acción Adicional (2 ataques) en diferentes objetivos');
  }
  
  // Subclass situations
  const sub = subclasses.find(s => s.id === character.subclass);
  if (sub?.id === 'Colegio del Conocimiento' && character.inspirationMax > 0) {
    situations.push('Enemigo ataca aliado débil: Palabras Cortantes (reacción, resta 1d6)');
  }
  
  return situations;
}

/**
 * Generate equipment recommendations based on class + ability scores + owned items.
 * @param {object} character - Character with class, abilityScores, and equipment
 * @returns {object|null} - { weapons: string, armor: string, essentials: string[], upgrades: string[] }
 */
export function generateEquipmentAdvice(character) {
  const cls = classes.find(c => c.id === character.class);
  if (!cls?.equipmentGuide) return null;
  
  const { weapons, armor, essentials } = cls.equipmentGuide;
  const scores = character.abilityScores || {};
  const owned = character.equipment ?? [];
  
  // Get owned items by type
  const ownedItems = owned.map(id => getEquipmentById(id)).filter(Boolean);
  const ownedArmor = ownedItems.filter(i => i.mechanics?.type === 'armor');
  const ownedWeapons = ownedItems.filter(i => i.mechanics?.type === 'weapon');
  const hasShield = ownedItems.some(i => i.mechanics?.type === 'shield');
  
  // Personalize weapon advice based on STR/DEX
  const strMod = getAbilityModifier(scores.str || 10);
  const dexMod = getAbilityModifier(scores.dex || 10);
  
  let weaponAdvice = weapons;
  if (ownedWeapons.length > 0) {
    const bestWeapon = ownedWeapons[0];
    const impact = calculateEquipmentImpact(character, bestWeapon);
    if (impact?.type === 'weapon') {
      weaponAdvice = `Tienes ${bestWeapon.name} (+${impact.attackBonus} ataque, ${impact.displayDamage} daño). `;
    }
  }
  if (dexMod > strMod + 1) {
    weaponAdvice += `Tu DES alta (+${dexMod}) favorece armas Finesse.`;
  } else if (strMod > dexMod + 1) {
    weaponAdvice += `Tu FUE alta (+${strMod}) favorece armas pesadas.`;
  }
  
  // Personalize armor advice based on DEX and owned armor
  let armorAdvice = armor;
  if (ownedArmor.length > 0) {
    // Find best armor by AC
    const bestArmor = ownedArmor.reduce((best, item) => {
      const ac = calculateArmorAC(character, item);
      const bestAC = best ? calculateArmorAC(character, best) : 0;
      return ac > bestAC ? item : best;
    }, null);
    
    if (bestArmor) {
      const currentAC = calculateArmorAC(character, bestArmor);
      armorAdvice = `Tienes ${bestArmor.name} (AC ${currentAC}). `;
      
      // Find potential upgrades
      const betterArmor = equipment.filter(item => {
        if (item.mechanics?.type !== 'armor') return false;
        const newAC = calculateArmorAC(character, item);
        return newAC > currentAC && !owned.includes(item.id);
      }).sort((a, b) => (a.costGold || 0) - (b.costGold || 0));
      
      if (betterArmor.length > 0) {
        const nextUpgrade = betterArmor[0];
        const upgradeAC = calculateArmorAC(character, nextUpgrade);
        armorAdvice += `Próxima mejora: ${nextUpgrade.name} (AC ${upgradeAC}, ${nextUpgrade.cost}).`;
      } else {
        armorAdvice += 'Tienes la mejor armadura disponible.';
      }
    }
  } else {
    // No armor - give advice based on class
    if (cls.id === 'Wizard' || cls.id === 'Sorcerer') {
      if (dexMod >= 3) {
        armorAdvice += ` Con DES +${dexMod}, tu AC con Armadura de Mago sería ${13 + dexMod}.`;
      }
    } else if (dexMod >= 4 && (cls.id === 'Rogue' || cls.id === 'Bard')) {
      armorAdvice += ` DES excelente (+${dexMod}): considera cuero tachonado (AC ${12 + dexMod}).`;
    } else {
      armorAdvice += ' Considera comprar armadura para mejorar tu defensa.';
    }
  }
  
  // Build upgrade suggestions
  const upgrades = [];
  
  if (!hasShield && cls.id !== 'Wizard' && cls.id !== 'Barbarian') {
    upgrades.push('Escudo (+2 AC, 10 po) - mejora defensa significativa');
  }
  
  if (ownedWeapons.length === 0) {
    if (dexMod > strMod) {
      upgrades.push('Estoque (1d8 finesse, 25 po) o Arco corto (1d6, 25 po)');
    } else {
      upgrades.push('Espada larga (1d8/1d10, 15 po) o Hacha grande (1d12, 30 po)');
    }
  }
  
  if (!ownedItems.some(i => i.id === 'pocion-curar')) {
    upgrades.push('Poción de curar (2d4+2 PV, 50 po) - siempre ten una de emergencia');
  }
  
  return {
    weapons: weaponAdvice,
    armor: armorAdvice,
    essentials: essentials || [],
    upgrades
  };
}

/**
 * Generate social guidance combining class and race notes.
 * @param {object} character - Character with class and race
 * @returns {string} - Combined social guidance
 */
export function generateSocialGuidance(character) {
  const cls = classes.find(c => c.id === character.class);
  const race = races.find(r => r.id === character.race);
  
  let guidance = '';
  
  if (cls?.socialGuidance) {
    guidance += cls.socialGuidance;
  }
  
  if (race?.socialNotes) {
    if (guidance) guidance += '\n\n';
    guidance += `**${race.name}:** ${race.socialNotes}`;
  }
  
  return guidance;
}
