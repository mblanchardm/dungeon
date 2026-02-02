import React, { useState, useEffect, useRef } from 'react';
import { getAbilityModifier, CLASS_HIT_DIE, CLASS_RESOURCES, getResourceMax, getSpellSlotsForClass, isMulticlassed } from '../../lib/characterModel.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ShortRestModal({
  character,
  update,
  maxHP,
  currentHP,
  onClose,
}) {
  const { t } = useI18n();
  const modalRef = useRef(null);
  const previousActiveRef = useRef(null);

  const hitDie = CLASS_HIT_DIE[character?.class] ?? 8;
  const totalHitDice = character?.hitDice?.total ?? character?.level ?? 1;
  const usedHitDice = character?.hitDice?.used ?? 0;
  const availableHitDice = totalHitDice - usedHitDice;
  const conMod = getAbilityModifier(character?.abilityScores?.con ?? 10);
  const avgHeal = Math.floor((hitDie + 1) / 2) + conMod;

  const [diceToSpend, setDiceToSpend] = useState(1);

  useEffect(() => {
    previousActiveRef.current = document.activeElement;
    const el = modalRef.current;
    if (!el) return;
    el.setAttribute('tabIndex', '-1');
    el.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll('button, [href], input, select, textarea');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
      previousActiveRef.current?.focus?.();
    };
  }, [onClose]);

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

  const getPactSlotsForShortRest = () => {
    if (!character) return null;
    if (isMulticlassed(character)) {
      const warlockClass = character.classes?.find((c) => c.name === 'Warlock');
      if (!warlockClass) return null;
      return getSpellSlotsForClass('Warlock', warlockClass.level ?? 1);
    }
    if (character.class === 'Warlock') return getSpellSlotsForClass('Warlock', character.level ?? 1);
    return null;
  };

  const buildShortRestPayload = (newHP, newUsedHitDice) => {
    const payload = {
      currentHP: newHP,
      hitDice: { total: totalHitDice, used: newUsedHitDice },
      resources: getShortRestResourceUpdates(),
    };
    const pactSlots = getPactSlotsForShortRest();
    if (pactSlots && Object.keys(pactSlots).length > 0) {
      payload.spellSlots = { ...(character.spellSlots || {}), ...pactSlots };
    }
    return payload;
  };

  const handleRoll = () => {
    let totalHealing = 0;
    for (let i = 0; i < diceToSpend; i++) {
      const roll = Math.floor(Math.random() * hitDie) + 1;
      totalHealing += Math.max(1, roll + conMod);
    }
    const newHP = Math.min(maxHP, currentHP + totalHealing);
    update(buildShortRestPayload(newHP, usedHitDice + diceToSpend));
    onClose();
  };

  const handleAverage = () => {
    const avgPerDie = Math.floor((hitDie + 1) / 2) + conMod;
    const totalHealing = Math.max(diceToSpend, avgPerDie * diceToSpend);
    const newHP = Math.min(maxHP, currentHP + totalHealing);
    update(buildShortRestPayload(newHP, usedHitDice + diceToSpend));
    onClose();
  };

  const pactSlotsForRest = getPactSlotsForShortRest();
  const hasWarlockPact = pactSlotsForRest != null && Object.keys(pactSlotsForRest).length > 0;

  const desc = t('shortRest.description').replace('{{hitDie}}', String(hitDie)).replace('{{conMod}}', String(conMod));
  const availableLine = t('shortRest.available')
    .replace('{{available}}', String(availableHitDice))
    .replace('{{total}}', String(totalHitDice))
    .replace('{{heal}}', String(avgHeal * diceToSpend));
  const rollLabel = t('shortRest.roll').replace('{{count}}', String(diceToSpend)).replace('{{die}}', String(hitDie));
  const avgValue = Math.max(diceToSpend, (Math.floor((hitDie + 1) / 2) + conMod) * diceToSpend);
  const averageLabel = t('shortRest.average').replace('{{value}}', String(avgValue));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="short-rest-title">
      <div ref={modalRef} className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl outline-none" tabIndex={-1}>
        <h2 id="short-rest-title" className="text-xl font-bold text-amber-400 mb-4">{t('shortRest.title')}</h2>
        <p className="text-gray-300 text-sm mb-4">
          {desc}
        </p>
        {hasWarlockPact && (
          <p className="text-amber-200/90 text-xs mb-3">{t('shortRest.warlockNote')}</p>
        )}

        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">{t('shortRest.diceToSpend')}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDiceToSpend(Math.max(1, diceToSpend - 1))}
                disabled={diceToSpend <= 1}
                aria-label={t('shortRest.ariaLessDice')}
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-full text-xl font-bold focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                −
              </button>
              <span className="text-2xl font-bold text-white w-8 text-center">{diceToSpend}</span>
              <button
                onClick={() => setDiceToSpend(Math.min(availableHitDice, diceToSpend + 1))}
                disabled={diceToSpend >= availableHitDice}
                aria-label={t('shortRest.ariaMoreDice')}
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-full text-xl font-bold focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            {availableLine}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRoll}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {rollLabel}
          </button>
          <button
            onClick={handleAverage}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {averageLabel}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          {t('general.cancel')}
        </button>
      </div>
    </div>
  );
}
