import { useEffect } from 'react';
import {
  CLASS_SPELL_ABILITY,
  CLASS_RESOURCES,
  getResourceMax,
  getTotalLevel,
  isMulticlassed,
  getMulticlassSpellSlots,
  getSpellSlotsForClass,
  getHitDiceByClass,
} from '../lib/characterModel.js';
import { calculateTotalAC } from '../lib/equipmentHelpers.js';
import { RACIAL_FEATURES_BY_RACE } from '../data/srd.js';

/**
 * Hook for character sheet updates and derived values.
 * @param {object} character - Character object
 * @param {function} onUpdate - Callback (partial) => void
 * @returns {object} - { update, maxHP, currentHP, inspiration, inspirationMax, gold, spellSlotsMax, levelKeys, setCurrentHP, setInspiration, setGold, setSpellSlot, resetLongRest }
 */
export function useCharacterSheet(character, onUpdate) {
  const update = (partial) => {
    if (!character) return;
    onUpdate({ ...character, ...partial, updatedAt: new Date().toISOString() });
  };

  const maxHP = character?.maxHP ?? 10;
  const currentHP = Math.min(maxHP, Math.max(0, character?.currentHP ?? maxHP));
  const inspiration = Math.min(character?.inspirationMax ?? 0, Math.max(0, character?.inspiration ?? 0));
  const inspirationMax = character?.inspirationMax ?? 0;
  const gold = Math.max(0, character?.gold ?? 0);
  const spellSlotsMax = (() => {
    if (!character?.class) return {};
    if (isMulticlassed(character)) return getMulticlassSpellSlots(character);
    if (CLASS_SPELL_ABILITY[character.class]) return getSpellSlotsForClass(character.class, character.level ?? 1) || {};
    return {};
  })();
  const levelKeys = Object.keys(spellSlotsMax).map(Number).sort((a, b) => a - b);

  const setCurrentHP = (v) => update({ currentHP: Math.min(maxHP, Math.max(0, v)) });
  const setInspiration = (v) => update({ inspiration: Math.min(inspirationMax, Math.max(0, v)) });
  const setGold = (v) => update({ gold: Math.max(0, v) });
  const setSpellSlot = (level, value) => {
    const max = spellSlotsMax[level] ?? 0;
    const next = { ...(character?.spellSlots || {}) };
    next[String(level)] = Math.min(max, Math.max(0, value));
    update({ spellSlots: next });
  };

  /** Summary of what a long rest will recover (for confirmation modal). */
  const getLongRestSummary = () => {
    const byClass = getHitDiceByClass(character);
    const totalHitDice = (Object.values(byClass).reduce((sum, c) => sum + (c.total ?? 0), 0) || character?.level) ?? 1;
    const usedHitDice = Object.values(byClass).reduce((sum, c) => sum + (c.used ?? 0), 0);
    const hitDiceRecovered = Math.max(1, Math.floor(totalHitDice / 2));
    const toRecover = Math.min(hitDiceRecovered, usedHitDice);
    const classesToReset = (character?.classes?.length ?? 0) > 0
      ? character.classes
      : (character?.class ? [{ name: character.class, level: character.level ?? 1 }] : []);
    const resourceMaxes = {};
    for (const cls of classesToReset) {
      const className = cls.name ?? cls.class;
      const classLevel = cls.level ?? 1;
      const classRes = CLASS_RESOURCES[className] || {};
      for (const [resId, def] of Object.entries(classRes)) {
        if (def.perRest === 'long') {
          const maxVal = getResourceMax(className, resId, { ...character, class: className, level: classLevel });
          if (maxVal > 0) resourceMaxes[resId] = Math.max(resourceMaxes[resId] ?? 0, maxVal);
        }
      }
    }
    const featureUses = {};
    const level = getTotalLevel(character) ?? character?.level ?? 1;
    const racialFeatures = RACIAL_FEATURES_BY_RACE[character?.race] || [];
    for (const feat of racialFeatures) {
      if (feat.usesPerLongRest != null && feat.usesPerLongRest > 0) {
        if (feat.availableAtLevel == null || level >= feat.availableAtLevel) {
          featureUses[feat.id] = feat.usesPerLongRest;
        }
      }
    }
    if (character?.race === 'Half-Orc' || character?.race === 'HalfOrc') featureUses.relentlessEndurance = 1;
    return { spellSlots: spellSlotsMax, resources: resourceMaxes, hitDiceRecovered: toRecover, featureUses };
  };

  const resetLongRest = () => {
    const slots = {};
    for (const [lev, max] of Object.entries(spellSlotsMax)) {
      slots[lev] = max;
    }
    const byClass = getHitDiceByClass(character);
    const totalHitDice = (Object.values(byClass).reduce((sum, c) => sum + (c.total ?? 0), 0) || character?.level) ?? 1;
    const usedHitDice = Object.values(byClass).reduce((sum, c) => sum + (c.used ?? 0), 0);
    const recovered = Math.max(1, Math.floor(totalHitDice / 2));
    const toRecover = Math.min(recovered, usedHitDice);
    const newByClass = {};
    let remaining = toRecover;
    for (const [cls, data] of Object.entries(byClass)) {
      const u = data.used ?? 0;
      const deduct = Math.min(u, remaining);
      newByClass[cls] = { total: data.total ?? 0, used: u - deduct };
      remaining -= deduct;
    }
    const res = { ...(character?.resources || {}) };
    const classesToReset = (character?.classes?.length ?? 0) > 0
      ? character.classes
      : (character?.class ? [{ name: character.class, level: character.level ?? 1 }] : []);
    const resourceMaxes = {};
    for (const cls of classesToReset) {
      const className = cls.name ?? cls.class;
      const classLevel = cls.level ?? 1;
      const classRes = CLASS_RESOURCES[className] || {};
      for (const [resId, def] of Object.entries(classRes)) {
        if (def.perRest === 'long') {
          const maxVal = getResourceMax(className, resId, { ...character, class: className, level: classLevel });
          if (maxVal > 0) resourceMaxes[resId] = Math.max(resourceMaxes[resId] ?? 0, maxVal);
        }
      }
    }
    for (const [resId, maxVal] of Object.entries(resourceMaxes)) {
      res[resId] = { current: maxVal, max: maxVal };
    }
    const featureUses = {};
    const level = getTotalLevel(character) ?? character?.level ?? 1;
    const racialFeatures = RACIAL_FEATURES_BY_RACE[character?.race] || [];
    for (const feat of racialFeatures) {
      if (feat.usesPerLongRest != null && feat.usesPerLongRest > 0) {
        if (feat.availableAtLevel == null || level >= feat.availableAtLevel) {
          featureUses[feat.id] = feat.usesPerLongRest;
        }
      }
    }
    if (character?.race === 'Half-Orc' || character?.race === 'HalfOrc') featureUses.relentlessEndurance = 1;
    update({
      currentHP: maxHP,
      inspiration: inspirationMax,
      spellSlots: slots,
      deathSaves: { success: 0, failure: 0 },
      hitDice: { byClass: newByClass },
      concentratingOn: null,
      resources: res,
      featureUses,
    });
  };

  // Auto-calculate AC from equipped armor and shield (unless manually overridden)
  useEffect(() => {
    if (!character || character.ACManual) return;
    const calculatedAC = calculateTotalAC(character);
    if (calculatedAC !== character.AC) {
      onUpdate({ ...character, AC: calculatedAC, updatedAt: new Date().toISOString() });
    }
  }, [character?.equipped?.armor, character?.equipped?.offHand, character?.abilityScores?.dex, character?.AC]);

  return {
    update,
    maxHP,
    currentHP,
    inspiration,
    inspirationMax,
    gold,
    spellSlotsMax,
    levelKeys,
    setCurrentHP,
    setInspiration,
    setGold,
    setSpellSlot,
    getLongRestSummary,
    resetLongRest,
  };
}
