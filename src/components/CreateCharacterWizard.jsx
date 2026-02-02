import React, { useState, useRef, useEffect } from 'react';
import {
  createCharacter,
  getAbilityModifier,
  applyRacialBonuses,
  CLASS_STARTING_GOLD,
  CLASS_SPELL_ABILITY,
  SPELL_SLOTS_BY_LEVEL,
  computeMaxHPLevel1,
  getSpellsKnownCountAtLevel,
  getMaxSpellLevelForCharacterLevel,
  SKILL_NAMES_ES,
} from '../lib/characterModel.js';
import { races, classes, subclasses, equipment, subraces, backgrounds } from '../data/srd.js';
import { spells } from '../data/srdSpells.js';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_MAX = 27;
const POINT_BUY_SCORES = [8, 9, 10, 11, 12, 13, 14, 15];
const DRAFT_STORAGE_KEY = 'dnd-wizard-draft';
const ABILITIES = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
];

const initialFormData = {
  race: '',
  subrace: '', // NEW: subrace ID
  class: '',
  subclass: '',
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  abilityMode: 'standard', // 'standard' | 'manual' | 'pointbuy' | 'roll'
  standardAssignments: {}, // { str: 15, dex: 14, ... } - which of 15,14,13,12,10,8 each ability got
  pointBuyScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }, // 8-15 only; total cost <= 27
  rollResults: [], // six 4d6-drop-lowest results when abilityMode === 'roll'
  rollAssignments: {}, // { str: 15, dex: 12, ... } when abilityMode === 'roll'
  name: '',
  background: '', // background ID
  gold: 0,
  level: 1,
  spellsKnown: [], // spell IDs selected during creation
  selectedSkills: [], // skill names selected during creation
  equipmentChoices: {}, // { weapon: 0, armor: 1, ... } - index of chosen option per choice
  abilityScoreInputs: {}, // raw string per ability while typing (manual mode); committed on blur
};

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : String(mod);
}

function roll4d6DropLowest() {
  const four = [1, 2, 3, 4].map(() => 1 + Math.floor(Math.random() * 6));
  four.sort((a, b) => b - a);
  return four[0] + four[1] + four[2];
}

export default function CreateCharacterWizard({ onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const getSpellDisplayName = (spell) => (locale === 'en' && spell?.nameEn ? spell.nameEn : (spell?.name ?? ''));
  const stepHeadingRef = useRef(null);

  const update = (partial) => setFormData((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.step === 'number' && parsed.formData && parsed.step >= 1) {
          setPendingDraft(parsed);
          setShowDraftPrompt(true);
          return;
        }
      }
    } catch (_) {}
    setShowDraftPrompt(false);
    setPendingDraft(null);
  }, []);

  useEffect(() => {
    if (showDraftPrompt || !formData) return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ step, formData }));
    } catch (_) {}
  }, [step, formData, showDraftPrompt]);

  useEffect(() => {
    stepHeadingRef.current?.focus?.();
  }, [step]);

  // Final ability scores (base + racial + subrace)
  const baseScores = formData.abilityMode === 'standard'
    ? { ...formData.standardAssignments }
    : formData.abilityMode === 'pointbuy'
      ? { ...formData.pointBuyScores }
      : formData.abilityMode === 'roll'
        ? { ...formData.rollAssignments }
        : { ...formData.abilityScores };
  let abilityScoresFinal = applyRacialBonuses(
    Object.keys(baseScores).length ? baseScores : formData.abilityScores,
    formData.race
  );
  // Apply subrace ability bonuses
  const selectedSubraceForScores = subraces.find((s) => s.id === formData.subrace);
  if (selectedSubraceForScores?.abilityBonus) {
    abilityScoresFinal = { ...abilityScoresFinal };
    for (const [ability, bonus] of Object.entries(selectedSubraceForScores.abilityBonus)) {
      abilityScoresFinal[ability] = (abilityScoresFinal[ability] ?? 10) + bonus;
    }
  }
  const conMod = getAbilityModifier(abilityScoresFinal.con ?? 10);
  const dexMod = getAbilityModifier(abilityScoresFinal.dex ?? 10);
  const maxHP = formData.class
    ? computeMaxHPLevel1(formData.class, conMod)
    : 10;
  const gold = formData.gold || (formData.class && CLASS_STARTING_GOLD[formData.class]) || 0;
  const spellSlotsMax = formData.class && CLASS_SPELL_ABILITY[formData.class]
    ? SPELL_SLOTS_BY_LEVEL[formData.level] || {}
    : {};
  const spellSlotsCurrent = {};
  for (const [level, max] of Object.entries(spellSlotsMax)) {
    spellSlotsCurrent[level] = max;
  }
  const inspirationMax = formData.class === 'Bard'
    ? Math.max(1, getAbilityModifier(abilityScoresFinal.cha ?? 10))
    : 0;

  // Spell selection for casters
  const isCaster = formData.class && CLASS_SPELL_ABILITY[formData.class];
  const maxSpellLevel = getMaxSpellLevelForCharacterLevel(1);
  const spellsKnownCount = formData.class ? getSpellsKnownCountAtLevel(formData.class, 1) : 0;
  const availableSpells = spells.filter(
    (s) => s.level <= maxSpellLevel && s.classes?.includes(formData.class)
  );

  // Total steps: 5 base + 1 if caster + 1 summary
  const totalSteps = isCaster && spellsKnownCount > 0 ? 7 : 6;

  // Get class proficiency data
  const selectedClass = classes.find((c) => c.id === formData.class);
  const classProficiencies = selectedClass?.proficiencies || {};
  const skillChoices = classProficiencies.skillChoices || [];
  const skillCount = classProficiencies.skillCount || 2;
  const startingEquipment = selectedClass?.startingEquipment || [];

  const handleFinish = () => {
    // Build proficiencies from class + selected skills
    const proficiencies = {
      saves: classProficiencies.saves || [],
      skills: formData.selectedSkills || [],
      armor: classProficiencies.armor || [],
      weapons: classProficiencies.weapons || [],
      tools: classProficiencies.tools || [],
    };

    // Gather starting equipment from choices + fixed items
    const startEquipIds = [];
    startingEquipment.forEach((item) => {
      if (item.fixed) {
        // Add all fixed items
        startEquipIds.push(...item.fixed);
      } else if (item.choice && item.options) {
        // Get selected option (default to first)
        const chosenIndex = formData.equipmentChoices[item.choice] ?? 0;
        const chosenItems = item.options[chosenIndex] || item.options[0] || [];
        startEquipIds.push(...chosenItems);
      }
    });

    // Get race and subrace data
    const selectedRace = races.find((r) => r.id === formData.race);
    const selectedSubrace = subraces.find((s) => s.id === formData.subrace);
    const selectedBackground = backgrounds.find((b) => b.id === formData.background);
    
    // Calculate speed (base race + subrace bonus)
    let raceSpeed = selectedRace?.speed ?? 30;
    if (selectedSubrace?.speedBonus) {
      raceSpeed += selectedSubrace.speedBonus;
    }
    
    // Gather languages from race + extra (race, subrace, background)
    let characterLanguages = [...(selectedRace?.languages || ['common'])];
    const extraLangPool = ['elvish', 'dwarvish', 'halfling', 'gnomish', 'giant', 'goblin', 'orc', 'abyssal', 'celestial', 'draconic'];
    const addExtraLanguage = () => {
      const next = extraLangPool.find((id) => !characterLanguages.includes(id));
      if (next) characterLanguages.push(next);
      else characterLanguages.push('elvish'); // fallback
    };
    const raceExtras = (selectedRace?.extraLanguages ?? 0) + (selectedSubrace?.extraLanguages ?? 0);
    for (let i = 0; i < raceExtras; i++) addExtraLanguage();
    const bgExtras = selectedBackground?.languages ?? 0;
    for (let i = 0; i < bgExtras; i++) addExtraLanguage();
    
    // Add background skill proficiencies and expertise
    const allSkillProficiencies = [...(formData.selectedSkills || [])];
    if (selectedBackground?.skillProficiencies) {
      selectedBackground.skillProficiencies.forEach((skill) => {
        if (!allSkillProficiencies.includes(skill)) {
          allSkillProficiencies.push(skill);
        }
      });
    }
    
    const finalProficiencies = {
      ...proficiencies,
      skills: allSkillProficiencies,
      expertise: formData.selectedExpertise || [],
      tools: [...(proficiencies.tools || []), ...(selectedBackground?.toolProficiencies || [])],
    };

    const char = createCharacter({
      name: formData.name.trim() || t('list.noName'),
      race: formData.race,
      subrace: formData.subrace || undefined,
      class: formData.class,
      subclass: formData.subclass || undefined,
      level: formData.level || 1,
      background: formData.background || undefined,
      abilityScores: abilityScoresFinal,
      maxHP,
      currentHP: maxHP,
      AC: 10 + dexMod,
      spellDC: formData.class && CLASS_SPELL_ABILITY[formData.class]
        ? 8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[formData.class]] ?? 10)
        : undefined,
      inspiration: inspirationMax,
      inspirationMax,
      spellSlots: spellSlotsCurrent,
      gold,
      spellsKnown: formData.spellsKnown || [],
      proficiencies: finalProficiencies,
      equipment: startEquipIds,
      speed: raceSpeed,
      languages: characterLanguages,
    });
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (_) {}
    onComplete(char);
  };

  const handleBack = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (_) {}
    onBack?.();
  };

  const canNext = () => {
    if (step === 1) return !!formData.race;
    if (step === 2) return !!formData.class;
    if (step === 3) {
      if (formData.abilityMode === 'standard') {
        const assigned = Object.values(formData.standardAssignments || {}).filter((v) => v != null);
        return assigned.length === 6 && new Set(assigned).size === 6;
      }
      if (formData.abilityMode === 'pointbuy') {
        const scores = formData.pointBuyScores || {};
        const totalCost = ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COSTS[scores[a.key]] ?? 0), 0);
        return ABILITIES.every((a) => {
          const v = scores[a.key];
          return v != null && v >= 8 && v <= 15;
        }) && totalCost <= POINT_BUY_MAX;
      }
      if (formData.abilityMode === 'roll') {
        const results = formData.rollResults || [];
        const assigned = Object.values(formData.rollAssignments || {}).filter((v) => v != null);
        if (results.length !== 6) return false;
        const resultsSorted = [...results].sort((a, b) => a - b);
        const assignedSorted = [...assigned].sort((a, b) => a - b);
        return assigned.length === 6 && resultsSorted.every((v, i) => v === assignedSorted[i]);
      }
      const scores = formData.abilityScores || {};
      return ABILITIES.every((a) => {
        const v = scores[a.key];
        return v != null && v >= 3 && v <= 20;
      });
    }
    if (step === 4) return !!formData.name.trim();
    // Step 5 for casters: spell selection
    if (step === 5 && totalSteps === 7) {
      return formData.spellsKnown.length === spellsKnownCount;
    }
    // Second-to-last step: validate skills and expertise (Rogue needs 2 expertise)
    if (step === totalSteps - 1) {
      const requiredSkills = skillCount || 0;
      if (formData.selectedSkills.length < requiredSkills) return false;
      if (formData.class === 'Rogue' && (formData.selectedExpertise?.length ?? 0) < 2) return false;
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (step < totalSteps) setStep((s) => s + 1);
    else handleFinish();
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const getValidationMessage = () => {
    if (step === 1 && !formData.race) return t('wizard.validationChooseRace');
    if (step === 2 && !formData.class) return t('wizard.validationChooseClass');
    if (step === 3) {
      if (formData.abilityMode === 'standard') {
        const assigned = Object.values(formData.standardAssignments || {}).filter((v) => v != null);
        if (assigned.length !== 6 || new Set(assigned).size !== 6) {
          return t('wizard.validationStandardArray');
        }
      } else {
        const scores = formData.abilityScores || {};
        const invalid = ABILITIES.some((a) => {
          const v = scores[a.key];
          return v == null || v < 3 || v > 20;
        });
        if (invalid) return t('wizard.validationManualScores');
      }
      if (formData.abilityMode === 'pointbuy') {
        const scores = formData.pointBuyScores || {};
        const totalCost = ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COSTS[scores[a.key]] ?? 0), 0);
        const invalidScores = ABILITIES.some((a) => {
          const v = scores[a.key];
          return v == null || v < 8 || v > 15;
        });
        if (invalidScores || totalCost > POINT_BUY_MAX) return t('wizard.validationPointBuy');
      }
      if (formData.abilityMode === 'roll') {
        const results = formData.rollResults || [];
        const assigned = Object.values(formData.rollAssignments || {}).filter((v) => v != null);
        if (results.length !== 6 || assigned.length !== 6) return t('wizard.rollDiceHint');
      }
    }
    if (step === 4 && !formData.name.trim()) return t('wizard.validationEnterName');
    if (step === 5 && totalSteps === 7 && formData.spellsKnown.length !== spellsKnownCount) {
      return t('wizard.validationChooseSpells').replace('{{count}}', String(spellsKnownCount));
    }
    if (step === totalSteps - 1) {
      const requiredSkills = skillCount || 0;
      if (formData.selectedSkills.length < requiredSkills) {
        return t('wizard.validationChooseSkills').replace('{{count}}', String(requiredSkills));
      }
      if (formData.class === 'Rogue' && (formData.selectedExpertise?.length ?? 0) < 2) {
        return t('wizard.validationChooseExpertise');
      }
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  if (showDraftPrompt && pendingDraft) {
    return (
      <div className={`min-h-screen p-4 transition-colors ${
        theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      }`}>
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl text-white">
            <h1 className="text-2xl font-bold mb-2">{t('wizard.title')}</h1>
            <p className="text-sm text-gray-400 mb-4">{t('wizard.draftPrompt')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...initialFormData, ...pendingDraft.formData });
                  setStep(Math.max(1, Math.min(pendingDraft.step, 7)));
                  setShowDraftPrompt(false);
                  setPendingDraft(null);
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold"
              >
                {t('wizard.draftContinue')}
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem(DRAFT_STORAGE_KEY);
                  } catch (_) {}
                  setShowDraftPrompt(false);
                  setPendingDraft(null);
                }}
                className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 rounded-xl font-semibold"
              >
                {t('wizard.draftStartOver')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    }`}>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-2xl text-white">
          <h1 className="text-2xl font-bold mb-1">{t('wizard.title')}</h1>
          <p className="text-sm text-gray-400">{t('wizard.stepOf').replace('{{step}}', String(step)).replace('{{total}}', String(totalSteps))}</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-lg font-semibold text-sm transition-all ${
                  step === s ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
                aria-label={`${t('wizard.stepOf').replace('{{step}}', String(s)).replace('{{total}}', String(totalSteps))}`}
                aria-current={step === s ? 'step' : undefined}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: Race */}
        {step === 1 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">1. {t('wizard.stepRace')}</h2>
            <div className="space-y-2">
              {races.map((r) => (
                <button
                  key={r.id}
                  onClick={() => update({ race: r.id, subrace: '' })}
                  className={`w-full text-left py-3 px-4 rounded-xl transition-all ${
                    formData.race === r.id
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="font-bold block">{r.name}</span>
                  <span className="text-sm text-gray-400 block mt-0.5">{r.description}</span>
                </button>
              ))}
            </div>
            
            {/* Subrace selection */}
            {formData.race && subraces.filter((s) => s.raceId === formData.race).length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-600">
                <h3 className="text-lg font-bold text-purple-300 mb-3">{t('wizard.subrace')}</h3>
                <div className="space-y-2">
                  {subraces.filter((s) => s.raceId === formData.race).map((sr) => (
                    <button
                      key={sr.id}
                      onClick={() => update({ subrace: sr.id })}
                      className={`w-full text-left py-3 px-4 rounded-xl transition-all ${
                        formData.subrace === sr.id
                          ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <span className="font-bold block">{sr.name}</span>
                      <span className="text-sm text-gray-400 block mt-0.5">{sr.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Class */}
        {step === 2 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">2. {t('wizard.stepClass')}</h2>
            <div className="space-y-2 mb-4">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update({ class: c.name, subclass: '' })}
                  className={`w-full text-left py-3 px-4 rounded-xl transition-all ${
                    formData.class === c.name
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="font-bold block">{c.name}</span>
                  <span className="text-sm text-gray-400 block mt-0.5">{c.description}</span>
                </button>
              ))}
            </div>
            <label className="block text-sm text-gray-400 mb-2">{t('wizard.subclassOptional')}</label>
            <div className="space-y-2">
              {subclasses
                .filter((s) => s.classId === formData.class)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => update({ subclass: formData.subclass === s.name ? '' : s.name })}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm ${
                      formData.subclass === s.name
                        ? 'bg-purple-700 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-gray-400 block mt-0.5">{s.description}</span>
                  </button>
                ))}
              {subclasses.filter((s) => s.classId === formData.class).length === 0 && formData.class && (
                <p className="text-sm text-gray-500">{t('wizard.noSubclasses')}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Ability scores */}
        {step === 3 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">3. {t('wizard.stepAbilities')}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => update({ abilityMode: 'standard', standardAssignments: {} })}
                className={`flex-1 min-w-0 py-2 rounded-lg font-semibold ${
                  formData.abilityMode === 'standard' ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                {t('wizard.standardArray')}
              </button>
              <button
                onClick={() => update({ abilityMode: 'pointbuy' })}
                className={`flex-1 min-w-0 py-2 rounded-lg font-semibold ${
                  formData.abilityMode === 'pointbuy' ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                {t('wizard.pointBuy')}
              </button>
              <button
                onClick={() => update({ abilityMode: 'roll', rollResults: [], rollAssignments: {} })}
                className={`flex-1 min-w-0 py-2 rounded-lg font-semibold ${
                  formData.abilityMode === 'roll' ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                {t('wizard.rollDice')}
              </button>
              <button
                onClick={() => update({ abilityMode: 'manual' })}
                className={`flex-1 min-w-0 py-2 rounded-lg font-semibold ${
                  formData.abilityMode === 'manual' ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                {t('wizard.manual')}
              </button>
            </div>

            {formData.abilityMode === 'standard' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">{t('wizard.abilityHintStandard')}</p>
                {ABILITIES.map((a) => (
                  <div key={a.key} className="flex items-center justify-between gap-2">
                    <span className="font-medium w-12">{a.label}</span>
                    <select
                      value={formData.standardAssignments[a.key] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : undefined;
                        update({
                          standardAssignments: {
                            ...formData.standardAssignments,
                            [a.key]: v,
                          },
                        });
                      }}
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                    >
                      <option value="">—</option>
                      {STANDARD_ARRAY.filter(
                        (n) =>
                          formData.standardAssignments[a.key] === n ||
                          !Object.entries(formData.standardAssignments || {}).some(
                            ([k, v]) => k !== a.key && v === n
                          )
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    {abilityScoresFinal[a.key] != null && (
                      <span className="text-purple-300 w-8">
                        ({abilityScoresFinal[a.key]} → {formatModifier(getAbilityModifier(abilityScoresFinal[a.key]))})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formData.abilityMode === 'roll' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">{t('wizard.rollDiceHint')}</p>
                {formData.rollResults.length !== 6 ? (
                  <button
                    type="button"
                    onClick={() => update({
                      rollResults: [
                        roll4d6DropLowest(),
                        roll4d6DropLowest(),
                        roll4d6DropLowest(),
                        roll4d6DropLowest(),
                        roll4d6DropLowest(),
                        roll4d6DropLowest(),
                      ],
                      rollAssignments: {},
                    })}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold"
                  >
                    {t('wizard.rollAll')}
                  </button>
                ) : (
                  <>
                    <p className="text-sm text-amber-300">
                      {t('wizard.rollDice')}: [{formData.rollResults.slice().sort((a, b) => a - b).join(', ')}]
                    </p>
                    {ABILITIES.map((a) => (
                      <div key={a.key} className="flex items-center justify-between gap-2">
                        <span className="font-medium w-12">{a.label}</span>
                        <select
                          value={formData.rollAssignments[a.key] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value ? Number(e.target.value) : undefined;
                            update({
                              rollAssignments: {
                                ...formData.rollAssignments,
                                [a.key]: v,
                              },
                            });
                          }}
                          className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                        >
                          <option value="">—</option>
                          {formData.rollResults.filter(
                            (n) =>
                              formData.rollAssignments[a.key] === n ||
                              !Object.entries(formData.rollAssignments || {}).some(
                                ([k, v]) => k !== a.key && v === n
                              )
                          ).map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        {abilityScoresFinal[a.key] != null && (
                          <span className="text-purple-300 w-8">
                            ({abilityScoresFinal[a.key]} → {formatModifier(getAbilityModifier(abilityScoresFinal[a.key]))})
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {formData.abilityMode === 'pointbuy' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">{t('wizard.pointBuyHint')}</p>
                <p className="text-sm text-amber-300">
                  {t('wizard.pointsUsed').replace('{{used}}', String(ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COSTS[formData.pointBuyScores?.[a.key]] ?? 0), 0))).replace('{{max}}', String(POINT_BUY_MAX))}
                </p>
                {ABILITIES.map((a) => (
                  <div key={a.key} className="flex items-center justify-between gap-2">
                    <span className="font-medium w-12">{a.label}</span>
                    <select
                      value={formData.pointBuyScores?.[a.key] ?? 8}
                      onChange={(e) => update({
                        pointBuyScores: {
                          ...formData.pointBuyScores,
                          [a.key]: Number(e.target.value),
                        },
                      })}
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                    >
                      {POINT_BUY_SCORES.map((n) => (
                        <option key={n} value={n}>{n} (cost {POINT_BUY_COSTS[n]})</option>
                      ))}
                    </select>
                    {abilityScoresFinal[a.key] != null && (
                      <span className="text-purple-300">{formatModifier(getAbilityModifier(abilityScoresFinal[a.key]))}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formData.abilityMode === 'manual' && (
              <div className="space-y-3">
                {ABILITIES.map((a) => {
                  const rawValue = formData.abilityScoreInputs?.[a.key];
                  const displayValue = rawValue !== undefined && rawValue !== '' ? rawValue : (formData.abilityScores[a.key] ?? '');
                  return (
                    <div key={a.key} className="flex items-center justify-between gap-2">
                      <span className="font-medium w-12">{a.label}</span>
                      <input
                        type="number"
                        min={3}
                        max={20}
                        value={displayValue}
                        onChange={(e) => {
                          update({
                            abilityScoreInputs: {
                              ...formData.abilityScoreInputs,
                              [a.key]: e.target.value,
                            },
                          });
                        }}
                        onBlur={() => {
                          const str = formData.abilityScoreInputs?.[a.key];
                          const parsed = str === '' || str === undefined ? undefined : Number(str);
                          const clamped = parsed === undefined || Number.isNaN(parsed)
                            ? undefined
                            : Math.min(20, Math.max(3, parsed));
                          update({
                            abilityScores: {
                              ...formData.abilityScores,
                              [a.key]: clamped,
                            },
                            abilityScoreInputs: (() => {
                              const next = { ...formData.abilityScoreInputs };
                              delete next[a.key];
                              return next;
                            })(),
                          });
                        }}
                        className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 w-20"
                      />
                      {abilityScoresFinal[a.key] != null && (
                        <span className="text-purple-300">{formatModifier(getAbilityModifier(abilityScoresFinal[a.key]))}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Describe */}
        {step === 4 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">4. {t('wizard.stepDescribe')}</h2>
            <label className="block text-sm text-gray-400 mb-1">{t('wizard.nameLabel')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder={t('wizard.namePlaceholder')}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 mb-4"
            />
            <label className="block text-sm text-gray-400 mb-1">{t('wizard.backgroundLabel')}</label>
            <select
              value={formData.background || ''}
              onChange={(e) => update({ background: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 mb-2"
            >
              <option value="">{t('wizard.backgroundChoose')}</option>
              {backgrounds.map((bg) => (
                <option key={bg.id} value={bg.id}>{bg.name}</option>
              ))}
            </select>
            {formData.background && (() => {
              const bg = backgrounds.find((b) => b.id === formData.background);
              return bg && (
                <div className="bg-slate-700 rounded-lg p-3 text-sm">
                  <p className="text-gray-300">{bg.description}</p>
                  <p className="text-purple-400 mt-2">
                    <strong>{t('wizard.skillsLabel')}:</strong> {bg.skillProficiencies.map((s) => SKILL_NAMES_ES[s] || s).join(', ')}
                  </p>
                  <p className="text-amber-400">
                    <strong>{bg.feature}:</strong> {bg.featureDesc}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Step 5: Spell selection (only for casters) */}
        {step === 5 && totalSteps === 7 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-2">5. {t('wizard.stepSpells')}</h2>
            <p className="text-sm text-gray-400 mb-4">
              {t('wizard.spellsHint').replace('{{count}}', String(spellsKnownCount)).replace('{{max}}', String(maxSpellLevel)).replace('{{class}}', formData.class)}
            </p>
            <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
              {availableSpells.map((spell) => {
                const selected = formData.spellsKnown.includes(spell.id);
                const atLimit = formData.spellsKnown.length >= spellsKnownCount;
                const canToggle = selected || !atLimit;
                return (
                  <label
                    key={spell.id}
                    className={`flex items-start gap-2 cursor-pointer rounded-lg p-3 ${canToggle ? 'hover:bg-slate-700' : 'opacity-60'} ${selected ? 'bg-purple-700' : 'bg-slate-700'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        if (selected) {
                          update({ spellsKnown: formData.spellsKnown.filter((id) => id !== spell.id) });
                        } else if (formData.spellsKnown.length < spellsKnownCount) {
                          update({ spellsKnown: [...formData.spellsKnown, spell.id] });
                        }
                      }}
                      disabled={!canToggle}
                      className="rounded mt-0.5"
                    />
                    <div>
                      <span className="font-medium">{getSpellDisplayName(spell)}</span>
                      <span className="text-purple-300 text-xs ml-2">{spell.level === 0 ? t('wizard.spellCantrip') : t('wizard.spellLevel').replace('{{level}}', String(spell.level))}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{spell.description}</p>
                    </div>
                  </label>
                );
              })}
              {availableSpells.length === 0 && (
                <p className="text-sm text-gray-500">{t('wizard.noSpells')}</p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {t('wizard.selectedSpells').replace('{{current}}', String(formData.spellsKnown.length)).replace('{{total}}', String(spellsKnownCount))}
            </p>
          </div>
        )}

        {/* Second-to-last step: Equipment / starting values */}
        {step === totalSteps - 1 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">{totalSteps - 1}. {t('wizard.stepValues')}</h2>
            
            {/* Skill Selection */}
            {skillChoices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-purple-300 mb-2">{t('wizard.chooseSkills').replace('{{count}}', String(skillCount))}</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {t('wizard.skillsHint').replace('{{class}}', formData.class).replace('{{count}}', String(skillCount))}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {skillChoices.map((skill) => {
                    const selected = formData.selectedSkills.includes(skill);
                    const atLimit = formData.selectedSkills.length >= skillCount;
                    const canToggle = selected || !atLimit;
                    return (
                      <label
                        key={skill}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          canToggle ? 'hover:bg-slate-600' : 'opacity-50'
                        } ${selected ? 'bg-purple-700' : 'bg-slate-700'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            if (selected) {
                              update({ selectedSkills: formData.selectedSkills.filter((s) => s !== skill) });
                            } else if (formData.selectedSkills.length < skillCount) {
                              update({ selectedSkills: [...formData.selectedSkills, skill] });
                            }
                          }}
                          disabled={!canToggle}
                          className="rounded"
                        />
                        <span className="text-sm">{SKILL_NAMES_ES[skill] || skill}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t('wizard.skillsSelected').replace('{{current}}', String(formData.selectedSkills.length)).replace('{{count}}', String(skillCount))}
                </p>
              </div>
            )}

            {/* Expertise (Rogue: 2 skills) */}
            {formData.class === 'Rogue' && formData.selectedSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-amber-400 mb-2">{t('wizard.expertise')}</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {t('wizard.expertiseHint')}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {formData.selectedSkills.map((skill) => {
                    const selected = formData.selectedExpertise?.includes(skill);
                    const atLimit = (formData.selectedExpertise?.length ?? 0) >= 2;
                    const canToggle = selected || !atLimit;
                    return (
                      <label
                        key={skill}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          canToggle ? 'hover:bg-slate-600' : 'opacity-50'
                        } ${selected ? 'bg-amber-700' : 'bg-slate-700'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            if (selected) {
                              update({ selectedExpertise: (formData.selectedExpertise || []).filter((s) => s !== skill) });
                            } else if ((formData.selectedExpertise?.length ?? 0) < 2) {
                              update({ selectedExpertise: [...(formData.selectedExpertise || []), skill] });
                            }
                          }}
                          disabled={!canToggle}
                          className="rounded"
                        />
                        <span className="text-sm">{SKILL_NAMES_ES[skill] || skill}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t('wizard.expertiseCount').replace('{{current}}', String(formData.selectedExpertise?.length ?? 0))}
                </p>
              </div>
            )}

            {/* Starting Equipment Selection */}
            {startingEquipment.filter((e) => e.choice).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-amber-400 mb-2">{t('wizard.startingEquipment')}</h3>
                <p className="text-xs text-gray-400 mb-3">{t('wizard.equipmentHint')}</p>
                <div className="space-y-3">
                  {startingEquipment.filter((e) => e.choice).map((item) => {
                    const chosenIndex = formData.equipmentChoices[item.choice] ?? 0;
                    return (
                      <div key={item.choice} className="bg-slate-700 rounded-lg p-3">
                        <p className="text-sm font-semibold text-amber-300 mb-2">{item.label || item.choice}</p>
                        <div className="space-y-1">
                          {item.options.map((optionItems, idx) => {
                            const optionNames = optionItems.map((id) => {
                              const eq = equipment.find((e) => e.id === id);
                              return eq?.name || id;
                            }).join(' + ');
                            return (
                              <label
                                key={idx}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                  chosenIndex === idx ? 'bg-amber-700' : 'bg-slate-600 hover:bg-slate-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`equip-${item.choice}`}
                                  checked={chosenIndex === idx}
                                  onChange={() => update({
                                    equipmentChoices: { ...formData.equipmentChoices, [item.choice]: idx }
                                  })}
                                  className="accent-amber-500"
                                />
                                <span className="text-sm">{optionNames}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Show fixed items */}
                {startingEquipment.filter((e) => e.fixed).length > 0 && (
                  <div className="mt-3 p-2 bg-slate-700 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{t('wizard.alsoReceive')}</p>
                    <p className="text-sm text-gray-300">
                      {startingEquipment
                        .filter((e) => e.fixed)
                        .flatMap((e) => e.fixed)
                        .map((id) => {
                          const eq = equipment.find((e) => e.id === id);
                          return eq?.name || id;
                        })
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('wizard.initialGold')}</span>
                <input
                  type="number"
                  min={0}
                  value={gold}
                  onChange={(e) => update({ gold: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-24 bg-slate-700 text-white rounded px-2 py-1 text-right"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('wizard.maxHp')}</span>
                <span className="font-bold">{maxHP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('wizard.ac')}</span>
                <span className="font-bold">{10 + dexMod}</span>
              </div>
              {formData.class && CLASS_SPELL_ABILITY[formData.class] && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('wizard.spellDC')}</span>
                  <span className="font-bold">
                    {8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[formData.class]] ?? 10)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">{t('wizard.finishHint')}</p>
          </div>
        )}

        {/* Last step: Summary */}
        {step === totalSteps && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">{totalSteps}. {t('wizard.stepSummary')}</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-400">{t('wizard.summaryName')}:</span>{' '}
                <span className="font-bold">{formData.name.trim() || t('list.noName')}</span>
              </div>
              <div>
                <span className="text-gray-400">{t('wizard.summaryRace')}:</span>{' '}
                {races.find((r) => r.id === formData.race)?.name ?? formData.race}
                {formData.subrace && (
                  <> ({subraces.find((s) => s.id === formData.subrace)?.name ?? formData.subrace})</>
                )}
              </div>
              <div>
                <span className="text-gray-400">{t('wizard.summaryClass')}:</span>{' '}
                {formData.class}
                {formData.subclass && ` (${formData.subclass})`}
              </div>
              {formData.background && (
                <div>
                  <span className="text-gray-400">{t('wizard.summaryBackground')}:</span>{' '}
                  {backgrounds.find((b) => b.id === formData.background)?.name ?? formData.background}
                </div>
              )}
              <div>
                <span className="text-gray-400">{t('wizard.summaryAbilities')}:</span>{' '}
                {ABILITIES.map((a) => (
                  <span key={a.key} className="mr-2">
                    {a.label} {abilityScoresFinal[a.key] ?? 10} ({formatModifier(getAbilityModifier(abilityScoresFinal[a.key] ?? 10))})
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span><span className="text-gray-400">{t('wizard.summaryHp')}:</span> {maxHP}</span>
                <span><span className="text-gray-400">{t('wizard.ac')}:</span> {10 + dexMod}</span>
                <span><span className="text-gray-400">{t('wizard.summaryGold')}:</span> {gold}</span>
                {formData.class && CLASS_SPELL_ABILITY[formData.class] && (
                  <span>
                    <span className="text-gray-400">{t('wizard.spellDC')}:</span>{' '}
                    {8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[formData.class]] ?? 10)}
                  </span>
                )}
              </div>
              {formData.selectedSkills.length > 0 && (
                <div>
                  <span className="text-gray-400">{t('wizard.summarySkills')}:</span>{' '}
                  {formData.selectedSkills.map((s) => SKILL_NAMES_ES[s] || s).join(', ')}
                  {(formData.selectedExpertise?.length ?? 0) > 0 && (
                    <> · {t('wizard.summaryExpertise')}: {formData.selectedExpertise.map((s) => SKILL_NAMES_ES[s] || s).join(', ')}</>
                  )}
                </div>
              )}
              <div>
                <span className="text-gray-400">{t('wizard.summaryEquipment')}:</span>{' '}
                {(() => {
                  const startEquipIds = [];
                  startingEquipment.forEach((item) => {
                    if (item.fixed) startEquipIds.push(...item.fixed);
                    else if (item.choice && item.options) {
                      const idx = formData.equipmentChoices[item.choice] ?? 0;
                      startEquipIds.push(...(item.options[idx] || item.options[0] || []));
                    }
                  });
                  return startEquipIds.map((id) => equipment.find((e) => e.id === id)?.name || id).join(', ') || '—';
                })()}
              </div>
            </div>
          </div>
        )}

        {validationMessage && (
          <p className="mb-4 text-sm text-amber-400 text-center" role="status">
            {validationMessage}
          </p>
        )}

        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={handleBack}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {t('general.cancel')}
            </button>
          )}
          <button
            onClick={goPrev}
            disabled={step === 1}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
          >
            {t('general.back')}
          </button>
          <button
            onClick={goNext}
            disabled={!canNext()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
          >
            {step === totalSteps ? t('wizard.createCharacter') : t('wizard.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
