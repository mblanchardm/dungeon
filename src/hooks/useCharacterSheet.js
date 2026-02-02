import { useEffect } from 'react';
import {
  SPELL_SLOTS_BY_LEVEL,
  CLASS_SPELL_ABILITY,
  CLASS_RESOURCES,
  getResourceMax,
} from '../lib/characterModel.js';
import { calculateTotalAC } from '../lib/equipmentHelpers.js';

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
  const spellSlotsMax = character?.class && CLASS_SPELL_ABILITY[character.class]
    ? SPELL_SLOTS_BY_LEVEL[character.level] || {}
    : {};
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

  const resetLongRest = () => {
    const slots = {};
    for (const [lev, max] of Object.entries(spellSlotsMax)) {
      slots[lev] = max;
    }
    const totalHitDice = character?.hitDice?.total ?? character?.level ?? 1;
    const usedHitDice = character?.hitDice?.used ?? 0;
    const recovered = Math.max(1, Math.floor(totalHitDice / 2));
    const newUsed = Math.max(0, usedHitDice - recovered);
    const res = { ...(character?.resources || {}) };
    const classRes = CLASS_RESOURCES[character?.class] || {};
    for (const [resId, def] of Object.entries(classRes)) {
      if (def.perRest === 'long') {
        const maxVal = getResourceMax(character.class, resId, character);
        if (maxVal > 0) res[resId] = { current: maxVal, max: maxVal };
      }
    }
    const featureUses = {};
    if (character?.race === 'Tiefling') featureUses.thaumaturgy = 1;
    if (character?.race === 'Dragonborn') featureUses.breathWeapon = 1;
    if (character?.race === 'Half-Orc' || character?.race === 'HalfOrc') featureUses.relentlessEndurance = 1;
    update({
      currentHP: maxHP,
      inspiration: inspirationMax,
      spellSlots: slots,
      deathSaves: { success: 0, failure: 0 },
      hitDice: { total: totalHitDice, used: newUsed },
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
    resetLongRest,
  };
}
