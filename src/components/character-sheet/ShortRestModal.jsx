import React, { useState, useEffect, useRef } from 'react';
import { getAbilityModifier, CLASS_HIT_DIE, CLASS_RESOURCES, getResourceMax } from '../../lib/characterModel.js';

export default function ShortRestModal({
  character,
  update,
  maxHP,
  currentHP,
  onClose,
}) {
  const hitDie = CLASS_HIT_DIE[character?.class] ?? 8;
  const totalHitDice = character?.hitDice?.total ?? character?.level ?? 1;
  const usedHitDice = character?.hitDice?.used ?? 0;
  const availableHitDice = totalHitDice - usedHitDice;
  const conMod = getAbilityModifier(character?.abilityScores?.con ?? 10);
  const avgHeal = Math.floor((hitDie + 1) / 2) + conMod;

  const [diceToSpend, setDiceToSpend] = useState(1);

  const getShortRestResourceUpdates = () => {
    const res = { ...character.resources };
    const classRes = CLASS_RESOURCES[character?.class] || {};
    for (const [resId, def] of Object.entries(classRes)) {
      if (def.perRest === 'short') {
        const maxVal = getResourceMax(character.class, resId, character);
        if (maxVal > 0) res[resId] = { current: maxVal, max: maxVal };
      }
    }
    return res;
  };

  const handleRoll = () => {
    let totalHealing = 0;
    for (let i = 0; i < diceToSpend; i++) {
      const roll = Math.floor(Math.random() * hitDie) + 1;
      totalHealing += Math.max(1, roll + conMod);
    }
    const newHP = Math.min(maxHP, currentHP + totalHealing);
    update({
      currentHP: newHP,
      hitDice: {
        total: totalHitDice,
        used: usedHitDice + diceToSpend,
      },
      resources: getShortRestResourceUpdates(),
    });
    onClose();
  };

  const handleAverage = () => {
    const avgPerDie = Math.floor((hitDie + 1) / 2) + conMod;
    const totalHealing = Math.max(diceToSpend, avgPerDie * diceToSpend);
    const newHP = Math.min(maxHP, currentHP + totalHealing);
    update({
      currentHP: newHP,
      hitDice: {
        total: totalHitDice,
        used: usedHitDice + diceToSpend,
      },
      resources: getShortRestResourceUpdates(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="short-rest-title">
      <div ref={modalRef} className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h2 id="short-rest-title" className="text-xl font-bold text-amber-400 mb-4">Descanso corto</h2>
        <p className="text-gray-300 text-sm mb-4">
          Gasta dados de golpe para recuperar PV. Cada dado cura 1d{hitDie} + {conMod} (CON).
        </p>

        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">Dados a gastar:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDiceToSpend(Math.max(1, diceToSpend - 1))}
                disabled={diceToSpend <= 1}
                aria-label="Menos dados"
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-full text-xl font-bold focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                −
              </button>
              <span className="text-2xl font-bold text-white w-8 text-center">{diceToSpend}</span>
              <button
                onClick={() => setDiceToSpend(Math.min(availableHitDice, diceToSpend + 1))}
                disabled={diceToSpend >= availableHitDice}
                aria-label="Más dados"
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-full text-xl font-bold focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Disponibles: {availableHitDice}/{totalHitDice} • Curación estimada: ~{avgHeal * diceToSpend} PV
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRoll}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Tirar ({diceToSpend}d{hitDie})
          </button>
          <button
            onClick={handleAverage}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Promedio (+{Math.max(diceToSpend, (Math.floor((hitDie + 1) / 2) + conMod) * diceToSpend)})
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
