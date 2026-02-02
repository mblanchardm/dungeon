import React, { useState, useEffect, useRef } from 'react';
import {
  getAbilityModifier,
  SPELL_SLOTS_BY_LEVEL,
  CLASS_SPELL_ABILITY,
  CLASS_HIT_DIE,
  computeHPGainForLevel,
  levelUpCharacter,
  getSpellsKnownCountAtLevel,
  getMaxSpellLevelForCharacterLevel,
  getProficiencyBonus,
  ASI_LEVELS,
  isMulticlassed,
  getTotalLevel,
  getSubclassLevel,
  meetsMulticlassPrereqs,
} from '../../lib/characterModel.js';
import { feats, subclasses, classes as srdClasses } from '../../data/srd.js';
import { spells } from '../../data/srdSpells.js';
import { CLASS_FEATURES_BY_LEVEL } from '../../data/classFeaturesByLevel.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import SpellPicker from '../SpellPicker.jsx';

const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

const REQ_ABILITY_MAP = { FUE: 'str', DES: 'dex', CON: 'con', INT: 'int', SAB: 'wis', CAR: 'cha' };

function meetsFeatRequirement(requirements, abilityScores) {
  if (!requirements || !abilityScores) return true;
  const match = requirements.match(/^([A-Z]{3})\s*(\d+)\+/);
  if (!match) return true;
  const [, ab, num] = match;
  const key = REQ_ABILITY_MAP[ab];
  if (!key) return true;
  const score = abilityScores[key] ?? 10;
  return score >= Number(num);
}

export default function LevelUpModal({ open, onClose, character, onConfirm }) {
  const { t, locale } = useI18n();
  const getSpellDisplayName = (spell) => (locale === 'en' && spell?.nameEn ? spell.nameEn : (spell?.name ?? ''));
  const [levelUpStep, setLevelUpStep] = useState(1);
  const [levelUpUseFixed, setLevelUpUseFixed] = useState(true);
  const [levelUpFullHeal, setLevelUpFullHeal] = useState(true);
  const [levelUpNewSpellIds, setLevelUpNewSpellIds] = useState([]);
  const [levelUpASIChoice, setLevelUpASIChoice] = useState('ability');
  const [levelUpASIAbilities, setLevelUpASIAbilities] = useState({ first: '', second: '' });
  const [levelUpFeatId, setLevelUpFeatId] = useState('');
  const [levelUpTargetClass, setLevelUpTargetClass] = useState('');
  const [levelUpHpRollResult, setLevelUpHpRollResult] = useState(null);
  const [levelUpSubclass, setLevelUpSubclass] = useState('');
  const [levelUpFeatAbilityBonus, setLevelUpFeatAbilityBonus] = useState('');
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (open && character) {
      setLevelUpStep(isMulticlassed(character) ? 0 : 1);
      setLevelUpNewSpellIds([]);
      setLevelUpTargetClass(character.classes?.[0]?.name || character.class || '');
      setLevelUpHpRollResult(null);
      setLevelUpSubclass(character.subclass ?? '');
    }
  }, [open, character]);

  useEffect(() => {
    if (levelUpUseFixed) setLevelUpHpRollResult(null);
  }, [levelUpUseFixed]);

  useEffect(() => {
    if (open && modalRef.current) {
      previousActiveElement.current = document.activeElement;
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      if (first) first.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key !== 'Tab' || !modalRef.current?.contains(document.activeElement)) return;
        const focusableEls = [...modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled);
        if (focusableEls.length === 0) return;
        const last = focusableEls[focusableEls.length - 1];
        const firstEl = focusableEls[0];
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElement.current?.focus) previousActiveElement.current.focus();
      };
    }
  }, [open, onClose]);

  if (!open) return null;
  if (!character) return null;

  try {
    const totalLevel = getTotalLevel(character);
    const newTotalLevel = totalLevel + 1;
    const multiclass = isMulticlassed(character);
    const targetClassForLevel = levelUpTargetClass || (character.classes?.[0]?.name) || character.class;
    const isAddingNewClass = targetClassForLevel && !(character.classes ?? []).some((c) => c.name === targetClassForLevel);
    const targetClassCurrentLevel = isAddingNewClass ? 0 : (character.classes?.find((c) => c.name === targetClassForLevel)?.level ?? 1);
    const targetClassNewLevel = targetClassCurrentLevel + 1;
    const maxSpellLevel = getMaxSpellLevelForCharacterLevel(newTotalLevel);
    const spellsKnownCount = getSpellsKnownCountAtLevel(targetClassForLevel, targetClassNewLevel);
    const currentSpellsCount = (character.spellsKnown ?? []).length;
    const spellsToPickCount = Math.max(0, spellsKnownCount - currentSpellsCount);
    const isPreparedNoSpellPick = ['Cleric', 'Druid', 'Paladin'].includes(targetClassForLevel);
    const showSpellStep = CLASS_SPELL_ABILITY[targetClassForLevel] && spellsToPickCount > 0 && !isPreparedNoSpellPick;
    const subclassLevelForClass = getSubclassLevel(targetClassForLevel);
    const subclassesForTargetClass = (subclasses || []).filter((s) => s.classId === targetClassForLevel);
    const showSubclassStep = subclassLevelForClass != null && targetClassNewLevel === subclassLevelForClass && subclassesForTargetClass.length > 0;
    const conMod = getAbilityModifier(character.abilityScores?.con ?? 10);
    const hpGainFixed = computeHPGainForLevel(targetClassForLevel, conMod, true);
    const currentMaxHP = character.maxHP ?? 10;
    const newMaxHPIfFixed = currentMaxHP + hpGainFixed;
    const slotsAtNewLevel = SPELL_SLOTS_BY_LEVEL[newTotalLevel] || {};
    const slotLevels = Object.keys(slotsAtNewLevel).map(Number).sort((a, b) => a - b);
    const profNew = getProficiencyBonus(newTotalLevel);
    const showClassStep = multiclass && levelUpStep === 0;
    const needsASI = ASI_LEVELS.includes(targetClassNewLevel);

    const selectedFeat = levelUpFeatId ? feats.find((f) => f.id === levelUpFeatId) : null;
    const featAbilityBonusKeys = selectedFeat?.abilityBonus && typeof selectedFeat.abilityBonus === 'object' ? Object.keys(selectedFeat.abilityBonus) : [];
    const needsFeatAbilityChoice = levelUpASIChoice === 'feat' && levelUpFeatId && featAbilityBonusKeys.length > 0;
    const asiValid = !needsASI || (
      (levelUpASIChoice === 'ability' && levelUpASIAbilities.first && levelUpASIAbilities.second) ||
      (levelUpASIChoice === 'feat' && !!levelUpFeatId && (!needsFeatAbilityChoice || !!levelUpFeatAbilityBonus))
    );

    const levelUpTotalSteps = (multiclass ? 1 : 0) + 1 + (showSubclassStep ? 1 : 0) + (showSpellStep ? 1 : 0) + 1;
    const levelUpStepDisplay = showClassStep ? 1 : levelUpStep === 1 ? (multiclass ? 2 : 1) : levelUpStep === 2 ? (multiclass ? 3 : 2) : levelUpStep === 3 ? (multiclass ? 4 : (showSubclassStep ? 3 : 2)) : levelUpTotalSteps;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog" aria-labelledby="level-up-modal-title">
        <div ref={modalRef} tabIndex={-1} className={`bg-slate-800 rounded-xl shadow-2xl w-full p-6 text-white border border-slate-700 ${levelUpStep >= 2 ? 'max-w-md' : 'max-w-sm'}`}>
          <p className="text-xs text-gray-400 mb-3">
            {t('levelUp.stepOf').replace('{{step}}', String(levelUpStepDisplay)).replace('{{total}}', String(levelUpTotalSteps))}
          </p>
          {showClassStep && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-4">
                {t('levelUp.stepClass')}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{t('levelUp.stepClassDesc').replace('{{total}}', String(character.level ?? totalLevel)).replace('{{newTotal}}', String(newTotalLevel))}</p>
              <select
                value={levelUpTargetClass || character.classes?.[0]?.name || ''}
                onChange={(e) => setLevelUpTargetClass(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-6"
                aria-describedby="level-up-class-hint"
              >
                {(character.classes ?? []).map((c) => (
                  <option key={c.name} value={c.name}>{t('levelUp.classLevelOption').replace('{{class}}', c.name).replace('{{level}}', String(c.level))}</option>
                ))}
                {(srdClasses ?? []).filter((c) => !(character.classes ?? []).some((pc) => pc.name === c.name)).map((c) => {
                  const prereq = meetsMulticlassPrereqs(character, c.name);
                  const disabled = !prereq.ok;
                  const label = prereq.ok
                    ? (t('levelUp.addClassOption') || `${c.name} (1st level)`).replace('{{class}}', c.name)
                    : (t('levelUp.prereqNotMet') || `${c.name} — requires ${(prereq.missing || []).join(', ')}`).replace('{{class}}', c.name).replace('{{missing}}', (prereq.missing || []).join(', '));
                  return (
                    <option key={c.name} value={c.name} disabled={disabled} title={!prereq.ok ? (prereq.missing || []).join(', ') : undefined}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {levelUpTargetClass && (() => {
                const existing = (character.classes ?? []).find((c) => c.name === levelUpTargetClass);
                if (existing) return null;
                const prereq = meetsMulticlassPrereqs(character, levelUpTargetClass);
                if (prereq.ok) return null;
                return (
                  <p id="level-up-class-hint" className="text-xs text-amber-400 mb-4" role="status">
                    {t('levelUp.prereqNotMetDetail')?.replace('{{class}}', levelUpTargetClass).replace('{{missing}}', (prereq.missing || []).join(', ')) ?? `${levelUpTargetClass} requires ${(prereq.missing || []).join(', ')} (you don't meet prerequisites).`}
                  </p>
                );
              })()}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => setLevelUpStep(1)}
                  disabled={levelUpTargetClass && !(character.classes ?? []).some((c) => c.name === levelUpTargetClass) && !meetsMulticlassPrereqs(character, levelUpTargetClass).ok}
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('levelUp.next')}
                </button>
              </div>
            </>
          )}

          {levelUpStep === 1 && !showClassStep && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-4">
                {t('levelUp.stepHpTitle').replace('{{level}}', String(newTotalLevel))}{multiclass ? ` (${targetClassForLevel})` : ''}
              </h3>
              {(() => {
                const features = CLASS_FEATURES_BY_LEVEL[targetClassForLevel]?.[targetClassNewLevel];
                if (!features || features.length === 0) return null;
                return (
                  <p className="text-sm text-amber-200/90 mb-4" role="status">
                    {t('levelUp.thisLevelYouGain')}: {features.join(', ')}
                  </p>
                );
              })()}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-300 mb-2">{t('levelUp.hpLabel').replace('{{die}}', String(CLASS_HIT_DIE[targetClassForLevel] ?? 8))}</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="levelUpHp"
                        checked={!levelUpUseFixed}
                        onChange={() => setLevelUpUseFixed(false)}
                        className="rounded"
                      />
                      <span className="text-sm">{t('levelUp.rollDie')}</span>
                    </label>
                    {!levelUpUseFixed && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const die = CLASS_HIT_DIE[targetClassForLevel] ?? 8;
                            const roll = 1 + Math.floor(Math.random() * die);
                            const gain = Math.max(1, roll + conMod);
                            setLevelUpHpRollResult(gain);
                          }}
                          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm font-medium"
                          aria-label={t('levelUp.rollForMe') || 'Roll for me'}
                        >
                          {levelUpHpRollResult == null ? (t('levelUp.rollForMe') || 'Roll for me') : (t('levelUp.rollAgain') || 'Roll again')}
                        </button>
                        {levelUpHpRollResult != null && (
                          <span className="text-sm text-purple-300">
                            1d{CLASS_HIT_DIE[targetClassForLevel] ?? 8} {conMod >= 0 ? '+' : ''}{conMod} (CON) = {levelUpHpRollResult}
                          </span>
                        )}
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="levelUpHp"
                        checked={levelUpUseFixed}
                        onChange={() => setLevelUpUseFixed(true)}
                        className="rounded"
                      />
                      <span className="text-sm">{t('levelUp.takeAverage').replace('{{value}}', String(hpGainFixed))}</span>
                    </label>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={levelUpFullHeal}
                    onChange={(e) => setLevelUpFullHeal(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{t('levelUp.restoreAllHp')}</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => setLevelUpStep(multiclass ? 0 : 1)}
                  className="flex-1 min-w-[80px] bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded-lg transition-all"
                  style={{ display: multiclass ? 'block' : 'none' }}
                >
                  {t('levelUp.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setLevelUpStep(showSubclassStep ? 2 : showSpellStep ? 3 : 4)}
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.next')}
                </button>
              </div>
            </>
          )}

          {levelUpStep === 2 && showSubclassStep && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-2">
                {t('levelUp.stepSubclassTitle')}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{t('levelUp.stepSubclassOptional')}</p>
              <select
                value={levelUpSubclass}
                onChange={(e) => setLevelUpSubclass(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-6"
              >
                <option value="">—</option>
                {subclassesForTargetClass.map((s) => (
                  <option key={s.id} value={s.name} title={s.description}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLevelUpStep(1)}
                  className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setLevelUpStep(showSpellStep ? 3 : 4)}
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.next')}
                </button>
              </div>
            </>
          )}

          {levelUpStep === 3 && showSpellStep && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-2">
                {t('levelUp.stepSpellsTitle').replace('{{count}}', String(spellsToPickCount))}
              </h3>
              <p className="text-sm text-gray-400 mb-2">{t('levelUp.spellsUpTo').replace('{{max}}', String(maxSpellLevel))}</p>
              <SpellPicker
                spells={spells.filter(
                  (s) => s.level <= maxSpellLevel && s.classes?.includes(targetClassForLevel) && !(character.spellsKnown ?? []).includes(s.id)
                )}
                selectedIds={levelUpNewSpellIds}
                onChange={setLevelUpNewSpellIds}
                maxCount={spellsToPickCount}
                getSpellDisplayName={getSpellDisplayName}
                t={t}
                searchPlaceholder={t('wizard.spellSearchPlaceholder')}
                selectedSpellsKey="levelUp.selectedCount"
                maxHeight="max-h-64"
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setLevelUpStep(showSubclassStep ? 2 : 1)}
                  className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setLevelUpStep(4)}
                  disabled={levelUpNewSpellIds.length !== spellsToPickCount}
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('levelUp.next')}
                </button>
              </div>
            </>
          )}

          {levelUpStep === 4 && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-4">
                {t('levelUp.stepSummary').replace('{{level}}', String(newTotalLevel))}
              </h3>
              {(() => {
                const features = CLASS_FEATURES_BY_LEVEL[targetClassForLevel]?.[targetClassNewLevel];
                if (!features || features.length === 0) return null;
                return (
                  <p className="text-sm text-amber-200/90 mb-4" role="status">
                    {t('levelUp.thisLevelYouGain')}: {features.join(', ')}
                  </p>
                );
              })()}
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li><strong className="text-white">{t('levelUp.summaryLevel')}:</strong> {totalLevel} → {newTotalLevel}{multiclass ? ` (${targetClassForLevel})` : ''}</li>
                <li>
                  <strong className="text-white">{t('levelUp.summaryHp')}:</strong>{' '}
                  {levelUpUseFixed
                    ? t('levelUp.hpFixedLine').replace(/\{\{gain\}\}/g, String(hpGainFixed)).replace('{{current}}', String(currentMaxHP)).replace('{{new}}', String(newMaxHPIfFixed))
                    : levelUpHpRollResult != null
                      ? t('levelUp.hpRolledLine').replace('{{gain}}', String(levelUpHpRollResult)).replace('{{current}}', String(currentMaxHP)).replace('{{new}}', String(currentMaxHP + levelUpHpRollResult))
                      : t('levelUp.hpRollLine').replace('{{die}}', String(CLASS_HIT_DIE[targetClassForLevel] ?? 8)).replace('{{mod}}', (conMod >= 0 ? '+' : '') + conMod)}
                  {' · '}{t('levelUp.restoreAllHp')}: {levelUpFullHeal ? t('levelUp.restoreHpYes') : t('levelUp.restoreHpNo')}
                </li>
                <li><strong className="text-white">{t('levelUp.summaryProficiency')}:</strong> +{profNew}</li>
                {CLASS_SPELL_ABILITY[targetClassForLevel] && slotLevels.length > 0 && (
                  <li>
                    <strong className="text-white">{t('levelUp.summarySpellSlots')}:</strong>{' '}
                    {slotLevels.map((l) => `${slotsAtNewLevel[l] ?? 0} nv.${l}`).join(', ')}
                  </li>
                )}
                {levelUpNewSpellIds.length > 0 && (
                  <li>
                    <strong className="text-white">{t('levelUp.summarySpellsLearned')}:</strong>{' '}
                    {levelUpNewSpellIds.map((id) => getSpellDisplayName(spells.find((s) => s.id === id)) || id).join(', ')}
                  </li>
                )}
                {levelUpSubclass && (
                  <li>
                    <strong className="text-white">{t('levelUp.stepSubclassTitle')}:</strong> {levelUpSubclass}
                  </li>
                )}
              </ul>

              {ASI_LEVELS.includes(newTotalLevel) && (
                <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-bold text-amber-400 mb-3">{t('levelUp.asiOrFeat')}</h4>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setLevelUpASIChoice('ability')}
                      className={`flex-1 py-2 rounded-lg font-semibold ${levelUpASIChoice === 'ability' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-gray-300'}`}
                    >
                      {t('levelUp.ability')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevelUpASIChoice('feat')}
                      className={`flex-1 py-2 rounded-lg font-semibold ${levelUpASIChoice === 'feat' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-gray-300'}`}
                    >
                      {t('levelUp.feat')}
                    </button>
                  </div>

                  {levelUpASIChoice === 'ability' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">{t('levelUp.abilityHint')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={levelUpASIAbilities.first}
                          onChange={(e) => setLevelUpASIAbilities({ ...levelUpASIAbilities, first: e.target.value })}
                          className="bg-slate-700 text-white rounded px-2 py-1"
                        >
                          <option value="">{t('levelUp.abilityFirst')}</option>
                          {Object.entries(ABILITY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label} ({character.abilityScores?.[key] ?? 10})</option>
                          ))}
                        </select>
                        <select
                          value={levelUpASIAbilities.second}
                          onChange={(e) => setLevelUpASIAbilities({ ...levelUpASIAbilities, second: e.target.value })}
                          className="bg-slate-700 text-white rounded px-2 py-1"
                        >
                              <option value="">{t('levelUp.abilitySecond')}</option>
                          {Object.entries(ABILITY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label} ({character.abilityScores?.[key] ?? 10})</option>
                          ))}
                        </select>
                      </div>
                      {levelUpASIAbilities.first && (
                        <p className="text-xs text-amber-300">
                          {levelUpASIAbilities.first === levelUpASIAbilities.second
                            ? t('levelUp.asiPreviewSingle').replace('{{ability}}', ABILITY_LABELS[levelUpASIAbilities.first])
                            : levelUpASIAbilities.second
                              ? t('levelUp.asiPreviewTwo').replace('{{first}}', ABILITY_LABELS[levelUpASIAbilities.first]).replace('{{second}}', ABILITY_LABELS[levelUpASIAbilities.second])
                              : t('levelUp.asiSelectSecond')}
                        </p>
                      )}
                    </div>
                  )}

                  {levelUpASIChoice === 'feat' && (
                    <div className="space-y-2">
                      <select
                        value={levelUpFeatId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setLevelUpFeatId(id);
                          const f = feats.find((x) => x.id === id);
                          const keys = f?.abilityBonus && typeof f.abilityBonus === 'object' ? Object.keys(f.abilityBonus) : [];
                          if (keys.length === 1) setLevelUpFeatAbilityBonus(keys[0]);
                          else setLevelUpFeatAbilityBonus('');
                        }}
                        className="w-full bg-slate-700 text-white rounded px-2 py-2"
                      >
                        <option value="">{t('levelUp.selectFeat')}</option>
                        {feats.filter((f) => !(character.feats ?? []).includes(f.id)).map((feat) => {
                          const qualifies = meetsFeatRequirement(feat.requirements, character.abilityScores);
                          return (
                            <option
                              key={feat.id}
                              value={feat.id}
                              disabled={!qualifies}
                            >
                              {feat.name}{!qualifies ? ` (${t('levelUp.featRequirementNotMet')})` : ''}
                            </option>
                          );
                        })}
                      </select>
                      {levelUpFeatId && (() => {
                        const feat = feats.find((f) => f.id === levelUpFeatId);
                        return feat && (
                          <div className="bg-slate-700 rounded p-2 text-sm space-y-2">
                            <p className="font-bold text-white">{feat.name}</p>
                            <p className="text-gray-300">{feat.description}</p>
                            {feat.requirements && <p className="text-amber-400 text-xs">{t('levelUp.featRequirement').replace('{{req}}', feat.requirements)}</p>}
                            {featAbilityBonusKeys.length > 0 && (
                              <div>
                                <label className="text-xs text-gray-400 block mb-1">{t('levelUp.featAbilityBonus')}</label>
                                <select
                                  value={featAbilityBonusKeys.length === 1 ? featAbilityBonusKeys[0] : levelUpFeatAbilityBonus}
                                  onChange={(e) => setLevelUpFeatAbilityBonus(e.target.value)}
                                  className="w-full bg-slate-600 text-white rounded px-2 py-1 text-sm"
                                >
                                  <option value="">{t('levelUp.featChooseAbility')}</option>
                                  {featAbilityBonusKeys.map((key) => (
                                    <option key={key} value={key}>{ABILITY_LABELS[key]} ({character.abilityScores?.[key] ?? 10} → {(character.abilityScores?.[key] ?? 10) + 1})</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {needsASI && !asiValid && (
                <p className="mb-4 text-sm text-amber-400" role="status">{t('levelUp.validationAsi')}</p>
              )}

              {needsASI && asiValid && (() => {
                const base = { ...character.abilityScores };
                let preview = { ...base };
                if (levelUpASIChoice === 'ability' && levelUpASIAbilities.first) {
                  if (levelUpASIAbilities.first === levelUpASIAbilities.second) {
                    preview[levelUpASIAbilities.first] = Math.min(20, (preview[levelUpASIAbilities.first] ?? 10) + 2);
                  } else if (levelUpASIAbilities.second) {
                    preview[levelUpASIAbilities.first] = Math.min(20, (preview[levelUpASIAbilities.first] ?? 10) + 1);
                    preview[levelUpASIAbilities.second] = Math.min(20, (preview[levelUpASIAbilities.second] ?? 10) + 1);
                  }
                } else if (levelUpASIChoice === 'feat' && levelUpFeatId && (levelUpFeatAbilityBonus || (featAbilityBonusKeys.length === 1 && featAbilityBonusKeys[0]))) {
                  const ab = levelUpFeatAbilityBonus || featAbilityBonusKeys[0];
                  if (ab) preview[ab] = Math.min(20, (preview[ab] ?? 10) + 1);
                }
                const mods = Object.entries(ABILITY_LABELS).map(([key, label]) => `${label} ${getAbilityModifier(preview[key] ?? 10) >= 0 ? '+' : ''}${getAbilityModifier(preview[key] ?? 10)}`).join(', ');
                return (
                  <p className="mb-4 text-sm text-purple-300" role="status">
                    {t('levelUp.newModifiers')}: {mods}
                  </p>
                );
              })()}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLevelUpStep(showSpellStep ? 3 : showSubclassStep ? 2 : 1)}
                  className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.back')}
                </button>
                <button
                  type="button"
                  disabled={!asiValid}
                  onClick={() => {
                    let next = levelUpCharacter(character, {
                      useFixed: levelUpUseFixed,
                      fullHeal: levelUpFullHeal,
                      newSpellIds: levelUpNewSpellIds.length > 0 ? levelUpNewSpellIds : undefined,
                      targetClassName: multiclass ? targetClassForLevel : undefined,
                      hpGainOverride: !levelUpUseFixed && levelUpHpRollResult != null ? levelUpHpRollResult : undefined,
                    });
                    if (levelUpSubclass && levelUpSubclass.trim()) {
                      next = { ...next, subclass: levelUpSubclass.trim() };
                    }
                    if (ASI_LEVELS.includes(newTotalLevel)) {
                      const asiRecord = {
                        level: newTotalLevel,
                        choice: levelUpASIChoice,
                      };

                      if (levelUpASIChoice === 'ability' && levelUpASIAbilities.first) {
                        const newScores = { ...next.abilityScores };
                        if (levelUpASIAbilities.first === levelUpASIAbilities.second) {
                          newScores[levelUpASIAbilities.first] = Math.min(20, (newScores[levelUpASIAbilities.first] ?? 10) + 2);
                          asiRecord.abilities = { [levelUpASIAbilities.first]: 2 };
                        } else if (levelUpASIAbilities.second) {
                          newScores[levelUpASIAbilities.first] = Math.min(20, (newScores[levelUpASIAbilities.first] ?? 10) + 1);
                          newScores[levelUpASIAbilities.second] = Math.min(20, (newScores[levelUpASIAbilities.second] ?? 10) + 1);
                          asiRecord.abilities = { [levelUpASIAbilities.first]: 1, [levelUpASIAbilities.second]: 1 };
                        }
                        next = { ...next, abilityScores: newScores };
                      } else if (levelUpASIChoice === 'feat' && levelUpFeatId) {
                        asiRecord.featId = levelUpFeatId;
                        next = {
                          ...next,
                          feats: [...(next.feats ?? []), levelUpFeatId],
                        };
                        const abilityToBoost = levelUpFeatAbilityBonus || (featAbilityBonusKeys.length === 1 ? featAbilityBonusKeys[0] : null);
                        if (abilityToBoost) {
                          const newScores = { ...next.abilityScores };
                          newScores[abilityToBoost] = Math.min(20, (newScores[abilityToBoost] ?? 10) + 1);
                          next = { ...next, abilityScores: newScores };
                          asiRecord.abilities = { [abilityToBoost]: 1 };
                        }
                      }

                      next = {
                        ...next,
                        asisTaken: [...(next.asisTaken ?? []), asiRecord],
                      };
                    }

                    onConfirm(next);
                    setLevelUpASIChoice('ability');
                    setLevelUpASIAbilities({ first: '', second: '' });
                    setLevelUpFeatId('');
                    setLevelUpFeatAbilityBonus('');
                  }}
                  className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.confirmToLevel').replace('{{level}}', String(newTotalLevel))}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error('Level-up modal render error', err);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog" aria-labelledby="level-up-modal-title">
        <div className="bg-slate-800 rounded-xl shadow-2xl w-full p-6 text-white border border-slate-700 max-w-sm">
          <p id="level-up-modal-title" className="text-sm text-gray-300 mb-4">{t('levelUp.errorOpen')}</p>
          <p className="text-xs text-amber-400 mb-4 font-mono break-all" aria-live="polite">{err?.message ?? String(err)}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg"
          >
            {t('levelUp.close')}
          </button>
        </div>
      </div>
    );
  }
}
