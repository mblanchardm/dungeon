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
} from '../../lib/characterModel.js';
import { feats } from '../../data/srd.js';
import { spells } from '../../data/srdSpells.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

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
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (open && character) {
      setLevelUpStep(isMulticlassed(character) ? 0 : 1);
      setLevelUpNewSpellIds([]);
      setLevelUpTargetClass(character.classes?.[0]?.name || character.class || '');
      setLevelUpHpRollResult(null);
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

  try {
    const totalLevel = getTotalLevel(character);
    const newTotalLevel = totalLevel + 1;
    const multiclass = isMulticlassed(character);
    const targetClassForLevel = levelUpTargetClass || (character.classes?.[0]?.name) || character.class;
    const targetClassCurrentLevel = character.classes?.find((c) => c.name === targetClassForLevel)?.level ?? 1;
    const targetClassNewLevel = targetClassCurrentLevel + 1;
    const maxSpellLevel = getMaxSpellLevelForCharacterLevel(newTotalLevel);
    const spellsKnownCount = getSpellsKnownCountAtLevel(targetClassForLevel, targetClassNewLevel);
    const currentSpellsCount = (character.spellsKnown ?? []).length;
    const spellsToPickCount = Math.max(0, spellsKnownCount - currentSpellsCount);
    const showSpellStep = CLASS_SPELL_ABILITY[targetClassForLevel] && spellsToPickCount > 0;
    const conMod = getAbilityModifier(character.abilityScores?.con ?? 10);
    const hpGainFixed = computeHPGainForLevel(targetClassForLevel, conMod, true);
    const currentMaxHP = character.maxHP ?? 10;
    const newMaxHPIfFixed = currentMaxHP + hpGainFixed;
    const slotsAtNewLevel = SPELL_SLOTS_BY_LEVEL[newTotalLevel] || {};
    const slotLevels = Object.keys(slotsAtNewLevel).map(Number).sort((a, b) => a - b);
    const profNew = getProficiencyBonus(newTotalLevel);
    const showClassStep = multiclass && levelUpStep === 0;

    const needsASI = ASI_LEVELS.includes(newTotalLevel);
    const asiValid = !needsASI || (
      (levelUpASIChoice === 'ability' && levelUpASIAbilities.first && levelUpASIAbilities.second) ||
      (levelUpASIChoice === 'feat' && !!levelUpFeatId)
    );

    const levelUpTotalSteps = (multiclass ? 1 : 0) + 1 + (showSpellStep ? 1 : 0) + 1;
    const levelUpStepDisplay = showClassStep ? 1 : (levelUpStep === 1 ? (multiclass ? 2 : 1) : (levelUpStep === 2 ? (multiclass ? 3 : 2) : (multiclass ? 4 : (showSpellStep ? 3 : 2))));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog" aria-labelledby="level-up-modal-title">
        <div ref={modalRef} tabIndex={-1} className={`bg-slate-800 rounded-xl shadow-2xl w-full p-6 text-white border border-slate-700 ${levelUpStep === 2 || levelUpStep === 3 ? 'max-w-md' : 'max-w-sm'}`}>
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
              >
                {(character.classes ?? []).map((c) => (
                  <option key={c.name} value={c.name}>{t('levelUp.classLevelOption').replace('{{class}}', c.name).replace('{{level}}', String(c.level))}</option>
                ))}
              </select>
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
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
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
                      <button
                        type="button"
                        onClick={() => {
                          const die = CLASS_HIT_DIE[targetClassForLevel] ?? 8;
                          const roll = 1 + Math.floor(Math.random() * die);
                          const gain = Math.max(1, roll + conMod);
                          setLevelUpHpRollResult(gain);
                        }}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm font-medium"
                      >
                        {t('levelUp.rollHp')}
                      </button>
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
                  onClick={() => setLevelUpStep(showSpellStep ? 2 : 3)}
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {t('levelUp.next')}
                </button>
              </div>
            </>
          )}

          {levelUpStep === 2 && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-2">
                {t('levelUp.stepSpellsTitle').replace('{{count}}', String(spellsToPickCount))}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{t('levelUp.spellsUpTo').replace('{{max}}', String(maxSpellLevel))}</p>
              <div className="max-h-64 overflow-y-auto space-y-2 mb-6">
                {spells
                  .filter((s) => s.level <= maxSpellLevel && s.classes?.includes(targetClassForLevel) && !(character.spellsKnown ?? []).includes(s.id))
                  .map((spell) => {
                    const selected = levelUpNewSpellIds.includes(spell.id);
                    const atLimit = levelUpNewSpellIds.length >= spellsToPickCount;
                    const canToggle = selected || !atLimit;
                    return (
                      <label
                        key={spell.id}
                        className={`flex items-start gap-2 cursor-pointer rounded p-2 ${canToggle ? 'hover:bg-slate-700' : 'opacity-60'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            if (selected) {
                              setLevelUpNewSpellIds((prev) => prev.filter((id) => id !== spell.id));
                            } else if (levelUpNewSpellIds.length < spellsToPickCount) {
                              setLevelUpNewSpellIds((prev) => [...prev, spell.id]);
                            }
                          }}
                          disabled={!canToggle}
                          className="rounded mt-0.5"
                        />
                        <span className="text-sm">
                          <span className="font-medium">{getSpellDisplayName(spell)}</span>
                          {spell.level > 0 && <span className="text-gray-400"> ({t('wizard.spellLevel').replace('{{level}}', String(spell.level))})</span>}
                          — {spell.description}
                        </span>
                      </label>
                    );
                  })}
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {t('levelUp.selectedCount').replace('{{current}}', String(levelUpNewSpellIds.length)).replace('{{total}}', String(spellsToPickCount))}
              </p>
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
                  onClick={() => setLevelUpStep(3)}
                  disabled={levelUpNewSpellIds.length !== spellsToPickCount}
                  className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('levelUp.next')}
                </button>
              </div>
            </>
          )}

          {levelUpStep === 3 && (
            <>
              <h3 id="level-up-modal-title" className="text-lg font-bold text-purple-400 mb-4">
                {t('levelUp.stepSummary').replace('{{level}}', String(newTotalLevel))}
              </h3>
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
                        onChange={(e) => setLevelUpFeatId(e.target.value)}
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
                          <div className="bg-slate-700 rounded p-2 text-sm">
                            <p className="font-bold text-white">{feat.name}</p>
                            <p className="text-gray-300">{feat.description}</p>
                                  {feat.requirements && <p className="text-amber-400 text-xs mt-1">{t('levelUp.featRequirement').replace('{{req}}', feat.requirements)}</p>}
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLevelUpStep(showSpellStep ? 2 : 1)}
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
