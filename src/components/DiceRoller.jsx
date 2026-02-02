import React, { useState } from 'react';
import { getEquipmentById, calculateWeaponStats } from '../lib/equipmentHelpers.js';

const DICE = [
  { sides: 4, label: 'd4', color: 'from-green-500 to-green-700' },
  { sides: 6, label: 'd6', color: 'from-blue-500 to-blue-700' },
  { sides: 8, label: 'd8', color: 'from-purple-500 to-purple-700' },
  { sides: 10, label: 'd10', color: 'from-pink-500 to-pink-700' },
  { sides: 12, label: 'd12', color: 'from-red-500 to-red-700' },
  { sides: 100, label: 'd100', color: 'from-gray-500 to-gray-700' },
];

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} - Result between 1 and sides
 */
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * DiceRoller component - floating dice roller with quick rolls
 * @param {object} props
 * @param {object} props.character - Character for modifier-based rolls
 * @param {boolean} props.open - Whether the roller is open
 * @param {function} props.onClose - Close callback
 */
export default function DiceRoller({ character, open, onClose, onLogRoll }) {
  const [lastRoll, setLastRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);
  const [quickRollAdvantage, setQuickRollAdvantage] = useState('normal'); // 'normal' | 'advantage' | 'disadvantage'

  const handleRoll = (sides, label, modifier = 0, modLabel = '', advMode = 'normal') => {
    setIsRolling(true);

    setTimeout(() => {
      let result, result2, usedResult, isCrit, isFumble;
      if (sides === 20 && (advMode === 'advantage' || advMode === 'disadvantage')) {
        const r1 = rollDie(20);
        const r2 = rollDie(20);
        result = r1;
        result2 = r2;
        usedResult = advMode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
        isCrit = advMode === 'advantage' ? (r1 === 20 || r2 === 20) : (r1 === 20 && r2 === 20);
        isFumble = advMode === 'advantage' ? (r1 === 1 && r2 === 1) : (r1 === 1 || r2 === 1);
      } else {
        result = rollDie(sides);
        result2 = null;
        usedResult = result;
        isCrit = sides === 20 && result === 20;
        isFumble = sides === 20 && result === 1;
      }
      const total = usedResult + modifier;

      const roll = {
        label: modLabel || label,
        sides,
        result: usedResult,
        result1: result2 != null ? result : undefined,
        result2,
        modifier,
        total,
        isCrit,
        isFumble,
        advMode: sides === 20 ? advMode : 'normal',
        timestamp: Date.now(),
      };

      setLastRoll(roll);
      setRollHistory((prev) => [roll, ...prev.slice(0, 9)]);
      setIsRolling(false);
    }, 300);
  };

  const logLastRoll = () => {
    if (!lastRoll || !onLogRoll) return;
    const desc = lastRoll.result1 != null && lastRoll.result2 != null
      ? `${lastRoll.label}: ${lastRoll.result1}, ${lastRoll.result2} → ${lastRoll.result}${lastRoll.modifier !== 0 ? ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}` : ''} = ${lastRoll.total}`
      : `${lastRoll.label}: ${lastRoll.result}${lastRoll.modifier !== 0 ? ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}` : ''} = ${lastRoll.total}`;
    onLogRoll({ ...lastRoll, description: desc });
  };

  const handleDamageRoll = (diceNotation, modifier, label) => {
    const match = (diceNotation || '').match(/(\d+)d(\d+)/);
    if (!match) return handleRoll(6, 'd6', modifier, label);
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    let total = 0;
    for (let i = 0; i < count; i++) total += rollDie(sides);
    total += modifier;
    const roll = {
      label,
      sides,
      result: total - modifier,
      modifier,
      total,
      isCrit: false,
      isFumble: false,
      timestamp: Date.now(),
    };
    setLastRoll(roll);
    setRollHistory((prev) => [roll, ...prev.slice(0, 9)]);
  };

  const weaponItem = character?.equipped?.mainHand ? getEquipmentById(character.equipped.mainHand) : null;
  const weaponStats = weaponItem && character ? calculateWeaponStats(character, weaponItem) : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white" id="dice-roller-title">Lanzar Dados</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar lanzador de dados"
            className="text-gray-400 hover:text-white text-2xl leading-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
          >
            ×
          </button>
        </div>

        {/* Last Roll Display */}
        <div className="bg-slate-700 rounded-xl p-6 mb-4 text-center min-h-[120px] flex flex-col items-center justify-center">
          {isRolling ? (
            <div className="text-4xl animate-bounce">🎲</div>
          ) : lastRoll ? (
            <>
              <div className={`text-5xl font-bold ${
                lastRoll.isCrit ? 'text-green-400' : 
                lastRoll.isFumble ? 'text-red-400' : 
                'text-white'
              }`}>
                {lastRoll.total}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {lastRoll.label}: {lastRoll.result1 != null && lastRoll.result2 != null
                  ? `${lastRoll.result1}, ${lastRoll.result2} → ${lastRoll.result}`
                  : lastRoll.result}
                {lastRoll.modifier !== 0 && ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}`}
              </div>
              {lastRoll.isCrit && <div className="text-green-400 font-bold mt-1">¡CRÍTICO!</div>}
              {lastRoll.isFumble && <div className="text-red-400 font-bold mt-1">¡PIFIA!</div>}
              {onLogRoll && (
                <button
                  onClick={logLastRoll}
                  className="mt-2 text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded"
                >
                  Añadir al historial de sesión
                </button>
              )}
            </>
          ) : (
            <div className="text-gray-500">Pulsa un dado para lanzar</div>
          )}
        </div>

        {/* Dice Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4" role="group" aria-labelledby="dice-roller-title">
          {DICE.map(({ sides, label, color }) => (
            <button
              key={sides}
              onClick={() => handleRoll(sides, label)}
              disabled={isRolling}
              aria-label={`Tirar ${label}`}
              className={`bg-gradient-to-br ${color} text-white font-bold py-3 px-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all text-sm focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* d20 with Advantage/Disadvantage */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleRoll(20, 'd20', 0, '', 'normal')}
            disabled={isRolling}
            aria-label="Tirar d20"
            className="flex-1 bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all text-sm focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            d20
          </button>
          <button
            onClick={() => handleRoll(20, 'd20 ventaja', 0, 'd20 ventaja', 'advantage')}
            disabled={isRolling}
            aria-label="Tirar d20 con ventaja"
            className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all text-sm focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            d20 ventaja
          </button>
          <button
            onClick={() => handleRoll(20, 'd20 desventaja', 0, 'd20 desventaja', 'disadvantage')}
            disabled={isRolling}
            aria-label="Tirar d20 con desventaja"
            className="flex-1 bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all text-sm focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            d20 desventaja
          </button>
        </div>

        {/* Quick Rolls with modifiers (if character provided) */}
        {character && (
          <div className="border-t border-slate-600 pt-4 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tiradas rápidas</p>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setQuickRollAdvantage('normal')}
                className={`flex-1 py-1 rounded text-xs font-medium ${quickRollAdvantage === 'normal' ? 'bg-amber-600 text-white' : 'bg-slate-600 text-gray-400'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setQuickRollAdvantage('advantage')}
                className={`flex-1 py-1 rounded text-xs font-medium ${quickRollAdvantage === 'advantage' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-gray-400'}`}
              >
                Ventaja
              </button>
              <button
                onClick={() => setQuickRollAdvantage('disadvantage')}
                className={`flex-1 py-1 rounded text-xs font-medium ${quickRollAdvantage === 'disadvantage' ? 'bg-rose-600 text-white' : 'bg-slate-600 text-gray-400'}`}
              >
                Desventaja
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Attack roll (weapon-aware) */}
              <button
                onClick={() => {
                  const mod = weaponStats ? weaponStats.attackBonus : (() => {
                    const strMod = Math.floor(((character.abilityScores?.str ?? 10) - 10) / 2);
                    const dexMod = Math.floor(((character.abilityScores?.dex ?? 10) - 10) / 2);
                    const level = character.level ?? 1;
                    const profBonus = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6;
                    return Math.max(strMod, dexMod) + profBonus;
                  })();
                  handleRoll(20, 'd20', mod, 'Ataque', quickRollAdvantage);
                }}
                disabled={isRolling}
                className="bg-red-700 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm disabled:opacity-50"
              >
                Ataque
              </button>
              {/* Saving throw - DEX */}
              <button
                onClick={() => {
                  const dexMod = Math.floor(((character.abilityScores?.dex ?? 10) - 10) / 2);
                  handleRoll(20, 'd20', dexMod, 'Salvación DES', quickRollAdvantage);
                }}
                disabled={isRolling}
                className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm disabled:opacity-50"
              >
                Salv. DES
              </button>
              {/* Perception */}
              <button
                onClick={() => {
                  const wisMod = Math.floor(((character.abilityScores?.wis ?? 10) - 10) / 2);
                  const isProficient = character.proficiencies?.skills?.includes('Perception');
                  const level = character.level ?? 1;
                  const profBonus = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6;
                  const mod = wisMod + (isProficient ? profBonus : 0);
                  handleRoll(20, 'd20', mod, 'Percepción', quickRollAdvantage);
                }}
                disabled={isRolling}
                className="bg-green-700 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm disabled:opacity-50"
              >
                Percepción
              </button>
              {/* Stealth */}
              <button
                onClick={() => {
                  const dexMod = Math.floor(((character.abilityScores?.dex ?? 10) - 10) / 2);
                  const isProficient = character.proficiencies?.skills?.includes('Stealth');
                  const level = character.level ?? 1;
                  const profBonus = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6;
                  const mod = dexMod + (isProficient ? profBonus : 0);
                  handleRoll(20, 'd20', mod, 'Sigilo', quickRollAdvantage);
                }}
                disabled={isRolling}
                className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm disabled:opacity-50"
              >
                Sigilo
              </button>
              {/* Weapon damage (if equipped) */}
              {weaponStats && (
                <button
                  onClick={() => {
                    setIsRolling(true);
                    setTimeout(() => {
                      handleDamageRoll(
                        weaponStats.damage,
                        weaponStats.damageBonus ?? 0,
                        `Daño (${weaponItem?.name || 'arma'})`
                      );
                      setIsRolling(false);
                    }, 300);
                  }}
                  disabled={isRolling}
                  className="col-span-2 bg-orange-700 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm disabled:opacity-50"
                >
                  Daño {weaponStats.damage || ''}{weaponStats.damageBonus != null && weaponStats.damageBonus !== 0 ? ` ${weaponStats.damageBonus >= 0 ? '+' : ''}${weaponStats.damageBonus}` : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <div className="border-t border-slate-600 pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Historial</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {rollHistory.map((roll, i) => (
                <div key={roll.timestamp} className={`flex justify-between text-sm ${i === 0 ? 'text-white' : 'text-gray-500'}`}>
                  <span>{roll.label}</span>
                  <span>
                    {roll.result1 != null && roll.result2 != null
                      ? `${roll.result1}, ${roll.result2} → `
                      : ''}
                    {roll.result}
                    {roll.modifier !== 0 && ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`}
                    {' = '}
                    <span className={`font-bold ${roll.isCrit ? 'text-green-400' : roll.isFumble ? 'text-red-400' : ''}`}>
                      {roll.total}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
