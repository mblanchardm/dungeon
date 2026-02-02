import React, { useState, useRef, useEffect } from 'react';
import {
  createCharacter,
  getAbilityModifier,
  applyRacialBonuses,
  CLASS_STARTING_GOLD,
  CLASS_SPELL_ABILITY,
  SPELL_SLOTS_BY_LEVEL,
  computeMaxHPLevel1,
  computeHPGainForLevel,
  getSpellsKnownCountAtLevel,
  getPreparedSpellCount,
  getMaxSpellLevelForCharacterLevel,
  CANTRIPS_KNOWN_BY_CLASS_LEVEL,
  PREPARED_CASTERS,
  SKILL_NAMES_ES,
  getSubclassLevel,
  SKILLS,
  meetsMulticlassPrereqs,
  getMulticlassSpellSlots,
  getHitDiceByClass,
} from '../lib/characterModel.js';
import { races, classes, subclasses, equipment, subraces, backgrounds, feats } from '../data/srd.js';
import { spells } from '../data/srdSpells.js';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import SpellPicker from './SpellPicker.jsx';

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
  classMode: 'single', // 'single' | 'multiclass'
  class2: '',
  subclass2: '',
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
  spellsKnown: [], // spell IDs selected during creation (known casters + Wizard spellbook)
  cantripsKnown: [], // Cleric/Druid cantrip IDs only
  spellsPrepared: [], // Cleric/Druid/Paladin prepared spell IDs only
  selectedSkills: [], // skill names selected during creation
  equipmentChoices: {}, // { weapon: 0, armor: 1, ... } - index of chosen option per choice
  abilityScoreInputs: {}, // raw string per ability while typing (manual mode); committed on blur
  halfElfAbilityBonuses: null, // { str: 1, dex: 1 } or null - +1 to two abilities (Half-Elf only)
  variantHumanAbilityBonuses: null, // { str: 1, dex: 1 } or null - +1 to two abilities (Variant Human only)
  variantHumanFeat: '', // feat id (Variant Human only)
  customBackgroundName: '', // when background === 'custom'
  customBackgroundSkills: [], // 2 skills
  customBackgroundTools: [], // 1 tool
  customBackgroundLanguages: [], // 2 languages
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
  // Half-Elf: +1 to two other abilities (player choice)
  if (formData.race === 'Half-Elf' && formData.halfElfAbilityBonuses && typeof formData.halfElfAbilityBonuses === 'object') {
    abilityScoresFinal = { ...abilityScoresFinal };
    for (const [ability, bonus] of Object.entries(formData.halfElfAbilityBonuses)) {
      if (bonus && ability !== 'cha') abilityScoresFinal[ability] = (abilityScoresFinal[ability] ?? 10) + bonus;
    }
  }
  // Variant Human: +1 to two abilities (player choice; any two)
  if (formData.race === 'Variant Human' && formData.variantHumanAbilityBonuses && typeof formData.variantHumanAbilityBonuses === 'object') {
    abilityScoresFinal = { ...abilityScoresFinal };
    for (const [ability, bonus] of Object.entries(formData.variantHumanAbilityBonuses)) {
      if (bonus) abilityScoresFinal[ability] = (abilityScoresFinal[ability] ?? 10) + bonus;
    }
  }
  const conMod = getAbilityModifier(abilityScoresFinal.con ?? 10);
  const dexMod = getAbilityModifier(abilityScoresFinal.dex ?? 10);
  const maxHP = formData.class
    ? computeMaxHPLevel1(formData.class, conMod)
    : 10;
  const isMulticlass = formData.classMode === 'multiclass' && !!formData.class2 && formData.class2 !== formData.class;
  // When multiclass, spell step uses the first caster class (so Fighter/Wizard gets Wizard spells)
  const spellClass = isMulticlass
    ? ([formData.class, formData.class2].find((c) => c && CLASS_SPELL_ABILITY[c]) || formData.class)
    : formData.class;
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

  // Spell selection for casters (uses spellClass so multiclass Fighter/Wizard gets Wizard spell step)
  const isCaster = spellClass && CLASS_SPELL_ABILITY[spellClass];
  const maxSpellLevel = getMaxSpellLevelForCharacterLevel(1);
  const spellsKnownCount = spellClass ? getSpellsKnownCountAtLevel(spellClass, 1) : 0;
  const cantripsKnownCount = (spellClass && CANTRIPS_KNOWN_BY_CLASS_LEVEL[spellClass]) ? (CANTRIPS_KNOWN_BY_CLASS_LEVEL[spellClass][1] ?? 0) : 0;
  const preparedCount = (spellClass && ['Cleric', 'Druid', 'Paladin'].includes(spellClass))
    ? getPreparedSpellCount({ class: spellClass, level: 1, abilityScores: abilityScoresFinal })
    : 0;
  const isPreparedCasterWithCantrips = spellClass && PREPARED_CASTERS.includes(spellClass) && ['Cleric', 'Druid'].includes(spellClass);
  const hasSpellStep = isCaster && (
    (spellClass === 'Wizard' && spellsKnownCount > 0) ||
    (['Bard', 'Sorcerer', 'Warlock', 'Ranger'].includes(spellClass) && spellsKnownCount > 0) ||
    (isPreparedCasterWithCantrips && (cantripsKnownCount + preparedCount > 0)) ||
    (spellClass === 'Paladin' && (isMulticlass ? 2 : formData.level) >= 2 && preparedCount > 0)
  );
  const availableSpells = spells.filter(
    (s) => s.level <= maxSpellLevel && s.classes?.includes(spellClass)
  );
  const availableCantrips = availableSpells.filter((s) => s.level === 0);
  const availableSpellsLevel1Plus = availableSpells.filter((s) => s.level >= 1);

  // Total steps: 1 Race, 2 Class, 3 Background, 4 Abilities, 5 Name, 6 Spells (if caster), 7 Skills & equipment, 8 Summary
  const totalSteps = hasSpellStep ? 8 : 7;

  // Get class proficiency data
  const selectedClass = classes.find((c) => c.id === formData.class);
  const classProficiencies = selectedClass?.proficiencies || {};
  const skillChoices = classProficiencies.skillChoices || [];
  const skillCountBase = classProficiencies.skillCount || 2;
  const skillCount = skillCountBase + (formData.race === 'Half-Elf' ? 2 : 0) + (formData.race === 'Variant Human' ? 1 : 0);
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
    const selectedBackground = formData.background === 'custom'
      ? {
          id: 'custom',
          name: (formData.customBackgroundName || '').trim() || 'Custom',
          skillProficiencies: Array.isArray(formData.customBackgroundSkills) ? formData.customBackgroundSkills : [],
          toolProficiencies: Array.isArray(formData.customBackgroundTools) ? formData.customBackgroundTools : [],
          languages: 0,
        }
      : backgrounds.find((b) => b.id === formData.background);
    
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
    if (formData.background === 'custom' && Array.isArray(formData.customBackgroundLanguages)) {
      formData.customBackgroundLanguages.forEach((lang) => {
        if (!characterLanguages.includes(lang)) characterLanguages.push(lang);
      });
    }
    
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

    const multiclass = formData.classMode === 'multiclass' && formData.class2 && formData.class2 !== formData.class;
    const charLevel = multiclass ? 2 : (formData.level || 1);
    const charClasses = multiclass
      ? [{ name: formData.class, level: 1 }, { name: formData.class2, level: 1 }]
      : [];
    const charMaxHP = multiclass
      ? computeMaxHPLevel1(formData.class, conMod) + computeHPGainForLevel(formData.class2, conMod, true)
      : maxHP;
    const charSpellSlots = multiclass && charClasses.length > 0
      ? getMulticlassSpellSlots({
          classes: charClasses,
          level: charLevel,
          abilityScores: abilityScoresFinal,
        })
      : spellSlotsCurrent;
    const charHitDice = multiclass && charClasses.length > 0
      ? { byClass: charClasses.reduce((acc, c) => ({ ...acc, [c.name]: { total: 1, used: 0 } }), {}) }
      : undefined;
    const firstCasterForDC = multiclass ? ([formData.class, formData.class2].find((c) => c && CLASS_SPELL_ABILITY[c])) : formData.class;
    const charSpellDC = firstCasterForDC && CLASS_SPELL_ABILITY[firstCasterForDC]
      ? 8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[firstCasterForDC]] ?? 10)
      : (formData.class && CLASS_SPELL_ABILITY[formData.class]
          ? 8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[formData.class]] ?? 10)
          : undefined);

    const char = createCharacter({
      name: formData.name.trim() || t('list.noName'),
      race: formData.race,
      subrace: formData.subrace || undefined,
      class: formData.class,
      subclass: formData.subclass || undefined,
      ...(multiclass ? { classes: charClasses, level: charLevel } : { level: formData.level || 1 }),
      background: formData.background || undefined,
      customBackground: formData.background === 'custom' ? {
        name: (formData.customBackgroundName || '').trim() || 'Custom',
        skillProficiencies: Array.isArray(formData.customBackgroundSkills) ? formData.customBackgroundSkills : [],
        toolProficiencies: Array.isArray(formData.customBackgroundTools) ? formData.customBackgroundTools : [],
        languages: Array.isArray(formData.customBackgroundLanguages) ? formData.customBackgroundLanguages : [],
      } : undefined,
      abilityScores: abilityScoresFinal,
      maxHP: charMaxHP,
      currentHP: charMaxHP,
      AC: 10 + dexMod,
      spellDC: charSpellDC,
      inspiration: inspirationMax,
      inspirationMax,
      spellSlots: charSpellSlots,
      ...(charHitDice ? { hitDice: charHitDice } : {}),
      gold,
      spellsKnown: isPreparedCasterWithCantrips ? (formData.cantripsKnown || []) : (formData.spellsKnown || []),
      spellsPrepared: isPreparedCasterWithCantrips ? (formData.spellsPrepared || []) : undefined,
      halfElfAbilityBonuses: formData.race === 'Half-Elf' ? (formData.halfElfAbilityBonuses || undefined) : undefined,
      feats: formData.race === 'Variant Human' && formData.variantHumanFeat ? [formData.variantHumanFeat] : [],
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
    if (step === 2) {
      if (!formData.class) return false;
      const subclassLvl = getSubclassLevel(formData.class);
      const subclassesForClass = subclasses.filter((s) => s.classId === formData.class);
      if (subclassLvl === 1 && subclassesForClass.length > 0 && !formData.subclass) return false;
      if (formData.classMode === 'multiclass') {
        if (!formData.class2 || formData.class2 === formData.class) return false;
        const subclassLvl2 = getSubclassLevel(formData.class2);
        const subclassesForClass2 = subclasses.filter((s) => s.classId === formData.class2);
        if (subclassLvl2 === 1 && subclassesForClass2.length > 0 && !formData.subclass2) return false;
      }
      return true;
    }
    if (step === 4 && formData.classMode === 'multiclass' && formData.class2) {
      const prereq = meetsMulticlassPrereqs(
        { abilityScores: abilityScoresFinal },
        formData.class2
      );
      if (!prereq.ok) return false;
    }
    if (step === 3) return true; // Background (optional)
    if (step === 4) {
      if (formData.race === 'Variant Human') {
        const vhBonuses = formData.variantHumanAbilityBonuses && typeof formData.variantHumanAbilityBonuses === 'object';
        const vhKeys = vhBonuses ? Object.keys(formData.variantHumanAbilityBonuses) : [];
        const twoAbilities = vhKeys.length === 2 && vhKeys[0] !== vhKeys[1];
        const oneFeat = !!(formData.variantHumanFeat && formData.variantHumanFeat.trim());
        if (!twoAbilities || !oneFeat) return false;
      }
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
    if (step === 5) return !!formData.name.trim();
    // Step 6 for casters: spell selection
    if (step === 6 && totalSteps === 8) {
      if (isPreparedCasterWithCantrips) {
        return (formData.cantripsKnown?.length ?? 0) === cantripsKnownCount && (formData.spellsPrepared?.length ?? 0) === preparedCount;
      }
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
    if (step === 2) {
      if (!formData.class) return t('wizard.validationChooseClass');
      const subclassLvl = getSubclassLevel(formData.class);
      const subclassesForClass = subclasses.filter((s) => s.classId === formData.class);
      if (subclassLvl === 1 && subclassesForClass.length > 0 && !formData.subclass) return t('wizard.validationChooseSubclass');
      if (formData.classMode === 'multiclass') {
        if (!formData.class2 || formData.class2 === formData.class) return t('wizard.validationChooseSecondClass');
        const subclassLvl2 = getSubclassLevel(formData.class2);
        const subclassesForClass2 = subclasses.filter((s) => s.classId === formData.class2);
        if (subclassLvl2 === 1 && subclassesForClass2.length > 0 && !formData.subclass2) return t('wizard.validationChooseSubclassSecond');
      }
    }
    if (step === 4 && formData.classMode === 'multiclass' && formData.class2) {
      const prereq = meetsMulticlassPrereqs(
        { abilityScores: abilityScoresFinal },
        formData.class2
      );
      if (!prereq.ok && prereq.missing?.length) {
        return t('wizard.multiclassPrereqMissing').replace('{{missing}}', prereq.missing.join(', '));
      }
    }
    if (step === 4) {
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
    if (step === 5 && !formData.name.trim()) return t('wizard.validationEnterName');
    if (step === 6 && totalSteps === 8) {
      if (isPreparedCasterWithCantrips) {
        const cantOk = (formData.cantripsKnown?.length ?? 0) === cantripsKnownCount;
        const prepOk = (formData.spellsPrepared?.length ?? 0) === preparedCount;
        if (!cantOk || !prepOk) return t('wizard.validationChooseSpells').replace('{{count}}', String(cantripsKnownCount + preparedCount));
      } else if (formData.spellsKnown.length !== spellsKnownCount) {
        return t('wizard.validationChooseSpells').replace('{{count}}', String(spellsKnownCount));
      }
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
                  setStep(Math.max(1, Math.min(pendingDraft.step, 8)));
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
          <p id="wizard-step-indicator" className="text-sm text-gray-400" aria-live="polite">
            {t('wizard.stepOf').replace('{{step}}', String(step)).replace('{{total}}', String(totalSteps))}
          </p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps} aria-labelledby="wizard-step-indicator">
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
                  onClick={() => update({
                    race: r.id,
                    subrace: '',
                    halfElfAbilityBonuses: r.id === 'Half-Elf' ? (formData.halfElfAbilityBonuses ?? null) : null,
                    variantHumanAbilityBonuses: r.id === 'Variant Human' ? (formData.variantHumanAbilityBonuses ?? null) : null,
                    variantHumanFeat: r.id === 'Variant Human' ? (formData.variantHumanFeat || '') : '',
                  })}
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
            {formData.race && (() => {
              const raceData = races.find((r) => r.id === formData.race);
              const best = raceData?.bestClasses ?? [];
              const decent = raceData?.decentClasses ?? [];
              if (best.length === 0 && decent.length === 0) return null;
              return (
                <p className="text-sm text-amber-200/90 mb-4" role="status">
                  {best.length > 0 && <span>{t('wizard.suggestedBest')}: {best.join(', ')}. </span>}
                  {decent.length > 0 && <span>{t('wizard.suggestedDecent')}: {decent.join(', ')}.</span>}
                </p>
              );
            })()}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => update({ classMode: 'single', class2: '', subclass2: '' })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  formData.classMode === 'single'
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {t('wizard.singleClass')}
              </button>
              <button
                type="button"
                onClick={() => update({ classMode: 'multiclass', class2: formData.class2 && formData.class2 !== formData.class ? formData.class2 : '', subclass2: '' })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  formData.classMode === 'multiclass'
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {t('wizard.multiclass')}
              </button>
            </div>
            {formData.classMode === 'multiclass' && <label className="block text-sm text-gray-400 mb-2">{t('wizard.firstClass')}</label>}
            <div className="space-y-2 mb-4">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update({ class: c.name, subclass: '', ...(formData.classMode === 'multiclass' && formData.class2 === c.name ? { class2: '' } : {}) })}
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
            {(() => {
              const subclassLvl = getSubclassLevel(formData.class);
              const hasSubclasses = subclasses.filter((s) => s.classId === formData.class).length > 0;
              if (subclassLvl === 1 && hasSubclasses) {
                return <label className="block text-sm text-amber-300 mb-2">{t('wizard.subclassRequired')}</label>;
              }
              if (subclassLvl != null && subclassLvl > 1 && hasSubclasses) {
                return <p className="text-xs text-gray-400 mb-2">{t('wizard.subclassLater').replace('{{level}}', String(subclassLvl))}</p>;
              }
              return <label className="block text-sm text-gray-400 mb-2">{formData.class === 'Wizard' ? t('sheet.subclassLabelWizard') : formData.class === 'Fighter' ? t('sheet.subclassLabelFighter') : t('wizard.subclassOptional')}</label>;
            })()}
            <div className="space-y-2 mb-4">
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
            {formData.classMode === 'multiclass' && (
              <>
                <label className="block text-sm text-amber-300 mb-2">{t('wizard.secondClass')}</label>
                <div className="space-y-2 mb-4">
                  {classes
                    .filter((c) => c.name !== formData.class)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => update({ class2: formData.class2 === c.name ? '' : c.name, subclass2: '' })}
                        className={`w-full text-left py-3 px-4 rounded-xl transition-all ${
                          formData.class2 === c.name
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        <span className="font-bold block">{c.name}</span>
                        <span className="text-sm text-gray-400 block mt-0.5">{c.description}</span>
                      </button>
                    ))}
                </div>
                {formData.class2 && (() => {
                  const subclassLvl2 = getSubclassLevel(formData.class2);
                  const hasSubclasses2 = subclasses.filter((s) => s.classId === formData.class2).length > 0;
                  if (subclassLvl2 === 1 && hasSubclasses2) {
                    return <label className="block text-sm text-amber-300 mb-2">{t('wizard.subclassRequiredSecond')}</label>;
                  }
                  if (subclassLvl2 != null && subclassLvl2 > 1 && hasSubclasses2) {
                    return <p className="text-xs text-gray-400 mb-2">{t('wizard.subclassLater').replace('{{level}}', String(subclassLvl2))}</p>;
                  }
                  return <label className="block text-sm text-gray-400 mb-2">{t('wizard.subclassOptional')}</label>;
                })()}
                {formData.class2 && (
                  <div className="space-y-2">
                    {subclasses
                      .filter((s) => s.classId === formData.class2)
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => update({ subclass2: formData.subclass2 === s.name ? '' : s.name })}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm ${
                            formData.subclass2 === s.name
                              ? 'bg-purple-700 text-white'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-xs text-gray-400 block mt-0.5">{s.description}</span>
                        </button>
                      ))}
                    {subclasses.filter((s) => s.classId === formData.class2).length === 0 && (
                      <p className="text-sm text-gray-500">{t('wizard.noSubclasses')}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Ability scores */}
        {/* Step 3: Background */}
        {step === 3 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">3. {t('wizard.stepBackground')}</h2>
            {formData.class && (() => {
              const suggested = (() => {
                const map = { Fighter: ['soldier'], Cleric: ['acolyte'], Rogue: ['criminal', 'charlatan'], Bard: ['entertainer'], Wizard: ['sage'], Ranger: ['outlander'], Paladin: ['soldier', 'acolyte'], Barbarian: ['outlander'], Monk: ['hermit'], Druid: ['hermit'], Sorcerer: ['sage'], Warlock: ['sage', 'charlatan'] };
                return map[formData.class] ?? [];
              })();
              if (suggested.length === 0) return null;
              const suggestedNames = suggested.map((id) => backgrounds.find((b) => b.id === id)?.name ?? id).join(', ');
              return (
                <p className="text-sm text-amber-200/90 mb-4" role="status">
                  {t('wizard.suggestedBackgrounds')}: {suggestedNames}
                </p>
              );
            })()}
            <label className="block text-sm text-gray-400 mb-1">{t('wizard.backgroundLabel')}</label>
            <select
              value={formData.background || ''}
              onChange={(e) => update({ background: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 mb-2"
              aria-label={t('wizard.backgroundLabel')}
            >
              <option value="">{t('wizard.backgroundChoose')}</option>
              {backgrounds.map((bg) => (
                <option key={bg.id} value={bg.id}>{bg.name}</option>
              ))}
              <option value="custom">{t('wizard.backgroundCustom') || 'Custom'}</option>
            </select>
            {formData.background === 'custom' && (
              <div className="bg-slate-700 rounded-lg p-4 space-y-3 mb-4">
                <label className="block text-sm text-gray-400">{t('wizard.customBackgroundName') || 'Background name'}</label>
                <input
                  type="text"
                  value={formData.customBackgroundName || ''}
                  onChange={(e) => update({ customBackgroundName: e.target.value.trim() })}
                  placeholder={t('wizard.customBackgroundNamePlaceholder') || 'e.g. Merchant'}
                  className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 border border-slate-500"
                />
                <label className="block text-sm text-gray-400">{t('wizard.customBackgroundSkills') || 'Choose 2 skills'}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SKILLS || {}).filter((s) => (formData.customBackgroundSkills || []).includes(s) || (formData.customBackgroundSkills || []).length < 2).map((skill) => {
                    const selected = (formData.customBackgroundSkills || []).includes(skill);
                    const atLimit = (formData.customBackgroundSkills || []).length >= 2;
                    const canToggle = selected || !atLimit;
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          const prev = formData.customBackgroundSkills || [];
                          if (selected) update({ customBackgroundSkills: prev.filter((x) => x !== skill) });
                          else if (prev.length < 2) update({ customBackgroundSkills: [...prev, skill] });
                        }}
                        disabled={!canToggle}
                        className={`px-3 py-1 rounded-lg text-sm ${selected ? 'bg-purple-600 text-white' : 'bg-slate-600 text-gray-300'} ${!canToggle ? 'opacity-50' : ''}`}
                      >
                        {SKILL_NAMES_ES[skill] || skill}
                      </button>
                    );
                  })}
                </div>
                <label className="block text-sm text-gray-400">{t('wizard.customBackgroundTool') || 'Choose 1 tool'}</label>
                <select
                  value={(formData.customBackgroundTools || [])[0] || ''}
                  onChange={(e) => update({ customBackgroundTools: e.target.value ? [e.target.value] : [] })}
                  className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 border border-slate-500"
                >
                  <option value="">—</option>
                  {[...new Set((backgrounds || []).flatMap((b) => (Array.isArray(b.toolProficiencies) ? b.toolProficiencies : [])))].map((tool) => (
                    <option key={tool} value={tool}>{tool}</option>
                  ))}
                </select>
                <label className="block text-sm text-gray-400">{t('wizard.customBackgroundLanguages') || 'Choose 2 languages'}</label>
                <div className="flex flex-wrap gap-2">
                  {['elvish', 'dwarvish', 'halfling', 'gnomish', 'giant', 'goblin', 'orc', 'abyssal', 'celestial', 'draconic'].filter((lang) => (formData.customBackgroundLanguages || []).includes(lang) || (formData.customBackgroundLanguages || []).length < 2).map((lang) => {
                    const selected = (formData.customBackgroundLanguages || []).includes(lang);
                    const atLimit = (formData.customBackgroundLanguages || []).length >= 2;
                    const canToggle = selected || !atLimit;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          const prev = formData.customBackgroundLanguages || [];
                          if (selected) update({ customBackgroundLanguages: prev.filter((x) => x !== lang) });
                          else if (prev.length < 2) update({ customBackgroundLanguages: [...prev, lang] });
                        }}
                        disabled={!canToggle}
                        className={`px-3 py-1 rounded-lg text-sm capitalize ${selected ? 'bg-purple-600 text-white' : 'bg-slate-600 text-gray-300'} ${!canToggle ? 'opacity-50' : ''}`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {formData.background && formData.background !== 'custom' && (() => {
              const bg = backgrounds.find((b) => b.id === formData.background);
              return bg && (
                <div className="bg-slate-700 rounded-lg p-3 text-sm">
                  <p className="text-gray-300">{bg.description}</p>
                  <p className="text-purple-400 mt-2">
                    <strong>{t('wizard.skillsLabel')}:</strong> {bg.skillProficiencies?.map((s) => SKILL_NAMES_ES[s] || s).join(', ') ?? ''}
                  </p>
                  {bg.feature && (
                    <p className="text-amber-400">
                      <strong>{bg.feature}:</strong> {bg.featureDesc ?? ''}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Step 4: Abilities */}
        {step === 4 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">4. {t('wizard.stepAbilities')}</h2>
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
                      <span className="text-purple-300 shrink-0">
                        ({(formData.standardAssignments[a.key] ?? '—')} → {abilityScoresFinal[a.key]} {formatModifier(getAbilityModifier(abilityScoresFinal[a.key]))})
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
                      className="text-sm py-1.5 px-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium mb-2"
                    >
                      {t('wizard.rerollAll')}
                    </button>
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
                {(() => {
                  const used = ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COSTS[formData.pointBuyScores?.[a.key]] ?? 0), 0);
                  const left = POINT_BUY_MAX - used;
                  return (
                    <>
                      <p className="text-sm text-amber-300">
                        {t('wizard.pointsUsed').replace('{{used}}', String(used)).replace('{{max}}', String(POINT_BUY_MAX))}
                      </p>
                      <p className={`text-sm font-medium ${left < 0 ? 'text-red-400' : 'text-purple-300'}`}>
                        {t('wizard.pointsLeft').replace('{{left}}', String(left))}
                      </p>
                    </>
                  );
                })()}
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

            {(formData.race === 'Half-Elf' || formData.race === 'Variant Human') && (
              <p className="text-xs text-gray-400 mt-3" role="note">
                {t('wizard.racialBonusesApplied')}
              </p>
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

            {formData.race === 'Half-Elf' && (() => {
              const halfElfKeys = Object.keys(formData.halfElfAbilityBonuses || {}).sort();
              const firstKey = halfElfKeys[0] || '';
              const secondKey = halfElfKeys[1] || '';
              return (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-sm text-purple-300 mb-2">{t('wizard.halfElfAbilityHint')}</p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{t('wizard.halfElfFirst')}</span>
                      <select
                        value={firstKey}
                        onChange={(e) => {
                          const first = e.target.value || null;
                          const second = secondKey && secondKey !== first ? secondKey : null;
                          const next = {};
                          if (first) next[first] = 1;
                          if (second) next[second] = 1;
                          update({ halfElfAbilityBonuses: Object.keys(next).length ? next : null });
                        }}
                        className="bg-slate-700 text-white rounded-lg px-2 py-1 border border-slate-600"
                      >
                        <option value="">—</option>
                        {ABILITIES.filter((a) => a.key !== 'cha').map((a) => (
                          <option key={a.key} value={a.key}>{a.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{t('wizard.halfElfSecond')}</span>
                      <select
                        value={secondKey}
                        onChange={(e) => {
                          const second = e.target.value || null;
                          const first = firstKey || null;
                          const next = {};
                          if (first) next[first] = 1;
                          if (second && second !== first) next[second] = 1;
                          update({ halfElfAbilityBonuses: Object.keys(next).length ? next : null });
                        }}
                        className="bg-slate-700 text-white rounded-lg px-2 py-1 border border-slate-600"
                      >
                        <option value="">—</option>
                        {ABILITIES.filter((a) => a.key !== 'cha').map((a) => (
                          <option key={a.key} value={a.key} disabled={a.key === firstKey}>{a.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              );
            })()}

            {formData.race === 'Variant Human' && (() => {
              const vhKeys = Object.keys(formData.variantHumanAbilityBonuses || {}).sort();
              const firstKey = vhKeys[0] || '';
              const secondKey = vhKeys[1] || '';
              return (
                <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
                  <p className="text-sm text-purple-300 mb-2">{t('wizard.variantHumanAbilityHint')}</p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{t('wizard.variantHumanFirst')}</span>
                      <select
                        value={firstKey}
                        onChange={(e) => {
                          const first = e.target.value || null;
                          const second = secondKey && secondKey !== first ? secondKey : null;
                          const next = {};
                          if (first) next[first] = 1;
                          if (second) next[second] = 1;
                          update({ variantHumanAbilityBonuses: Object.keys(next).length ? next : null });
                        }}
                        className="bg-slate-700 text-white rounded-lg px-2 py-1 border border-slate-600"
                      >
                        <option value="">—</option>
                        {ABILITIES.map((a) => (
                          <option key={a.key} value={a.key}>{a.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{t('wizard.variantHumanSecond')}</span>
                      <select
                        value={secondKey}
                        onChange={(e) => {
                          const second = e.target.value || null;
                          const first = firstKey || null;
                          const next = {};
                          if (first) next[first] = 1;
                          if (second && second !== first) next[second] = 1;
                          update({ variantHumanAbilityBonuses: Object.keys(next).length ? next : null });
                        }}
                        className="bg-slate-700 text-white rounded-lg px-2 py-1 border border-slate-600"
                      >
                        <option value="">—</option>
                        {ABILITIES.map((a) => (
                          <option key={a.key} value={a.key} disabled={a.key === firstKey}>{a.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('wizard.variantHumanFeat')}</label>
                    <select
                      value={formData.variantHumanFeat || ''}
                      onChange={(e) => update({ variantHumanFeat: e.target.value || '' })}
                      className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 w-full max-w-md"
                    >
                      <option value="">—</option>
                      {feats.map((f) => (
                        <option key={f.id} value={f.id}>{locale === 'en' && f.nameEn ? f.nameEn : (f.name || f.id)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })()}

            {formData.class && (() => {
              const charForPrereq = { abilityScores: abilityScoresFinal };
              const otherClasses = classes.filter((c) => c.name !== formData.class);
              const missingPrereqs = otherClasses
                .map((c) => ({ class: c.name, result: meetsMulticlassPrereqs(charForPrereq, c.name) }))
                .filter(({ result }) => !result.ok && result.missing?.length);
              if (missingPrereqs.length === 0) return null;
              return (
                <details className="mt-4 pt-4 border-t border-slate-600" aria-label={t('wizard.multiclassPrereqHint')}>
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-purple-300">
                    {t('wizard.multiclassPrereqHint')}
                  </summary>
                  <ul className="mt-2 text-xs text-amber-200/90 space-y-1 list-disc list-inside">
                    {missingPrereqs.map(({ class: className, result }) => (
                      <li key={className}>
                        {t('wizard.multiclassPrereqForClass').replace('{{class}}', className).replace('{{missing}}', result.missing.join(', '))}
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })()}
          </div>
        )}

        {/* Step 5: Name */}
        {step === 5 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">5. {t('wizard.stepDescribe')}</h2>
            <label className="block text-sm text-gray-400 mb-1">{t('wizard.nameLabel')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder={t('wizard.namePlaceholder')}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 mb-4"
            />
          </div>
        )}

        {/* Step 6: Spell selection (only for casters) */}
        {step === 6 && totalSteps === 8 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-2">6. {t('wizard.stepSpells')}</h2>
            {isPreparedCasterWithCantrips ? (
              <>
                <p className="text-sm text-gray-400 mb-3">
                  {t('wizard.spellsHintClericDruid')} {t('wizard.spellsHintCantrips').replace('{{count}}', String(cantripsKnownCount))}. {t('wizard.spellsHintPrepared').replace('{{count}}', String(preparedCount))}.
                </p>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">{t('wizard.chooseCantrips').replace('{{count}}', String(cantripsKnownCount))}</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableCantrips.map((spell) => {
                      const selected = (formData.cantripsKnown || []).includes(spell.id);
                      const atLimit = (formData.cantripsKnown || []).length >= cantripsKnownCount;
                      const canToggle = selected || !atLimit;
                      return (
                        <label
                          key={spell.id}
                          className={`flex items-start gap-2 cursor-pointer rounded-lg p-2 ${canToggle ? 'hover:bg-slate-700' : 'opacity-60'} ${selected ? 'bg-purple-700' : 'bg-slate-700'}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              if (selected) {
                                update({ cantripsKnown: (formData.cantripsKnown || []).filter((id) => id !== spell.id) });
                              } else if ((formData.cantripsKnown || []).length < cantripsKnownCount) {
                                update({ cantripsKnown: [...(formData.cantripsKnown || []), spell.id] });
                              }
                            }}
                            disabled={!canToggle}
                            className="rounded mt-0.5"
                          />
                          <span className="font-medium text-sm">{getSpellDisplayName(spell)}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('wizard.selectedSpells').replace('{{current}}', String((formData.cantripsKnown || []).length)).replace('{{total}}', String(cantripsKnownCount))}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">{t('wizard.choosePrepared').replace('{{count}}', String(preparedCount))}</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableSpellsLevel1Plus.map((spell) => {
                      const selected = (formData.spellsPrepared || []).includes(spell.id);
                      const atLimit = (formData.spellsPrepared || []).length >= preparedCount;
                      const canToggle = selected || !atLimit;
                      return (
                        <label
                          key={spell.id}
                          className={`flex items-start gap-2 cursor-pointer rounded-lg p-2 ${canToggle ? 'hover:bg-slate-700' : 'opacity-60'} ${selected ? 'bg-purple-700' : 'bg-slate-700'}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              if (selected) {
                                update({ spellsPrepared: (formData.spellsPrepared || []).filter((id) => id !== spell.id) });
                              } else if ((formData.spellsPrepared || []).length < preparedCount) {
                                update({ spellsPrepared: [...(formData.spellsPrepared || []), spell.id] });
                              }
                            }}
                            disabled={!canToggle}
                            className="rounded mt-0.5"
                          />
                          <span className="font-medium text-sm">{getSpellDisplayName(spell)}</span>
                          <span className="text-purple-300 text-xs">{t('wizard.spellLevel').replace('{{level}}', String(spell.level))}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('wizard.selectedSpells').replace('{{current}}', String((formData.spellsPrepared || []).length)).replace('{{total}}', String(preparedCount))}</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-3">
                  {t('wizard.spellsHint').replace('{{count}}', String(spellsKnownCount)).replace('{{max}}', String(maxSpellLevel)).replace('{{class}}', formData.class)}
                </p>
                <SpellPicker
                  spells={availableSpells}
                  selectedIds={formData.spellsKnown}
                  onChange={(ids) => update({ spellsKnown: ids })}
                  maxCount={spellsKnownCount}
                  getSpellDisplayName={getSpellDisplayName}
                  t={t}
                  searchPlaceholder={t('wizard.spellSearchPlaceholder')}
                  maxHeight="max-h-72"
                />
              </>
            )}
          </div>
        )}

        {/* Second-to-last step: Equipment / starting values */}
        {step === totalSteps - 1 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-purple-400 mb-4">{totalSteps - 1}. {t('wizard.stepValues')}</h2>
            
            {/* From background (read-only) */}
            {(() => {
              const selectedBackground = formData.background === 'custom'
                ? { skillProficiencies: formData.customBackgroundSkills || [], toolProficiencies: formData.customBackgroundTools || [] }
                : backgrounds.find((b) => b.id === formData.background);
              const backgroundSkills = selectedBackground?.skillProficiencies ?? [];
              const backgroundTools = selectedBackground?.toolProficiencies ?? [];
              if (backgroundSkills.length === 0 && backgroundTools.length === 0) return null;
              return (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-2">{t('wizard.fromBackground')}</h3>
                  {backgroundSkills.length > 0 && (
                    <p className="text-sm text-gray-300 mb-1">
                      {t('wizard.skillsLabel')}: {backgroundSkills.map((s) => SKILL_NAMES_ES[s] || s).join(', ')}
                    </p>
                  )}
                  {backgroundTools.length > 0 && (
                    <p className="text-sm text-gray-300">{t('wizard.toolsLabel')}: {Array.isArray(backgroundTools) ? backgroundTools.join(', ') : backgroundTools}</p>
                  )}
                </div>
              );
            })()}

            {/* From class: Skill Selection */}
            {skillChoices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-purple-300 mb-2">{t('wizard.fromClass')} {t('wizard.chooseSkills').replace('{{count}}', String(skillCount))}</h3>
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
                  {t('wizard.expertiseHint')} {t('wizard.expertiseDoubleProficiency')}
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
                {/* Combined list: You receive fixed + chosen */}
                <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                  <p className="text-xs font-semibold text-amber-300 mb-2">{t('wizard.youReceive')}</p>
                  <p className="text-sm text-gray-300">
                    {(() => {
                      const ids = [];
                      startingEquipment.forEach((item) => {
                        if (item.fixed) ids.push(...item.fixed);
                        else if (item.choice && item.options) {
                          const idx = formData.equipmentChoices[item.choice] ?? 0;
                          ids.push(...(item.options[idx] || item.options[0] || []));
                        }
                      });
                      return ids.map((id) => {
                        const eq = equipment.find((e) => e.id === id);
                        return eq?.name || id;
                      }).join(', ') || '—';
                    })()}
                  </p>
                </div>
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
            {!formData.background && (
              <p className="text-xs text-amber-400/90 mb-3" role="status">{t('wizard.summaryBackgroundOptional')}</p>
            )}
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
                {isMulticlass
                  ? `${formData.class} 1 / ${formData.class2} 1`
                  : `${formData.class}${formData.subclass ? ` (${formData.subclass})` : ''}`}
              </div>
              {formData.background && (
                <div>
                  <span className="text-gray-400">{t('wizard.summaryBackground')}:</span>{' '}
                  {formData.background === 'custom' ? (formData.customBackgroundName?.trim() || 'Custom') : (backgrounds.find((b) => b.id === formData.background)?.name ?? formData.background)}
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
                <span><span className="text-gray-400">{t('wizard.summaryHp')}:</span> {isMulticlass ? (computeMaxHPLevel1(formData.class, conMod) + computeHPGainForLevel(formData.class2, conMod, true)) : maxHP}</span>
                <span><span className="text-gray-400">{t('wizard.ac')}:</span> {10 + dexMod}</span>
                <span><span className="text-gray-400">{t('wizard.summaryGold')}:</span> {gold}</span>
                {(spellClass && CLASS_SPELL_ABILITY[spellClass]) && (
                  <span>
                    <span className="text-gray-400">{t('wizard.spellDC')}:</span>{' '}
                    {8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[spellClass]] ?? 10)}
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
