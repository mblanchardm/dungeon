/**
 * Quick Create: one-screen flow to create a character with defaults (standard array, suggested background, first skills/equipment/spells).
 */
import React, { useState } from 'react';
import {
  createCharacter,
  applyRacialBonuses,
  computeMaxHPLevel1,
  CLASS_STARTING_GOLD,
  CLASS_SPELL_ABILITY,
  getSpellsKnownCountAtLevel,
  getPreparedSpellCount,
  CANTRIPS_KNOWN_BY_CLASS_LEVEL,
  PREPARED_CASTERS,
  SPELL_SLOTS_BY_LEVEL,
  getSubclassLevel,
} from '../lib/characterModel.js';
import { races, classes, backgrounds, subraces, subclasses, spells } from '../data/srd.js';
import { useI18n } from '../i18n/I18nContext.jsx';

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const SUGGESTED_BACKGROUND_BY_CLASS = {
  Fighter: 'soldier', Cleric: 'acolyte', Rogue: 'criminal', Bard: 'entertainer', Wizard: 'sage',
  Ranger: 'outlander', Paladin: 'soldier', Barbarian: 'outlander', Monk: 'hermit', Druid: 'hermit',
  Sorcerer: 'sage', Warlock: 'charlatan',
};

function buildQuickCharacter({ race, className, name }) {
  const selectedRace = races.find((r) => r.id === race);
  const selectedClass = classes.find((c) => c.name === className);
  if (!selectedRace || !selectedClass) return null;

  const primaryAbility = selectedClass.primaryAbility || 'str';
  const secondaryAbility = selectedClass.secondaryAbility || 'dex';
  const abilityOrder = [primaryAbility, secondaryAbility, 'con', 'int', 'wis', 'cha'].filter(
    (a, i, arr) => arr.indexOf(a) === i
  );
  while (abilityOrder.length < 6) {
    const rest = ['str', 'dex', 'con', 'int', 'wis', 'cha'].filter((a) => !abilityOrder.includes(a));
    abilityOrder.push(rest[abilityOrder.length - 6 + rest.length] || 'str');
  }
  const standardAssignments = {};
  STANDARD_ARRAY.forEach((val, i) => {
    standardAssignments[abilityOrder[i]] = val;
  });
  let abilityScoresFinal = applyRacialBonuses(standardAssignments, race);
  const selectedSubrace = subraces.find((s) => s.raceId === race);
  if (selectedSubrace?.abilityBonus) {
    abilityScoresFinal = { ...abilityScoresFinal };
    for (const [ab, bonus] of Object.entries(selectedSubrace.abilityBonus)) {
      abilityScoresFinal[ab] = (abilityScoresFinal[ab] ?? 10) + bonus;
    }
  }
  if (race === 'Half-Elf') {
    const nonCha = ['str', 'dex', 'con', 'int', 'wis'];
    abilityScoresFinal = { ...abilityScoresFinal };
    abilityScoresFinal[nonCha[0]] = (abilityScoresFinal[nonCha[0]] ?? 10) + 1;
    abilityScoresFinal[nonCha[1]] = (abilityScoresFinal[nonCha[1]] ?? 10) + 1;
  }
  if (race === 'Variant Human') {
    abilityScoresFinal = { ...abilityScoresFinal };
    abilityScoresFinal.str = (abilityScoresFinal.str ?? 10) + 1;
    abilityScoresFinal.dex = (abilityScoresFinal.dex ?? 10) + 1;
  }

  const conMod = Math.floor(((abilityScoresFinal.con ?? 10) - 10) / 2);
  const dexMod = Math.floor(((abilityScoresFinal.dex ?? 10) - 10) / 2);
  const maxHP = computeMaxHPLevel1(className, conMod);
  const gold = CLASS_STARTING_GOLD[className] ?? 0;

  const bgId = SUGGESTED_BACKGROUND_BY_CLASS[className] || backgrounds[0]?.id;
  const selectedBackground = backgrounds.find((b) => b.id === bgId) || backgrounds[0];
  const classProficiencies = selectedClass.proficiencies || {};
  const skillChoices = classProficiencies.skillChoices || [];
  const skillCount = (classProficiencies.skillCount || 2) + (race === 'Half-Elf' ? 2 : 0) + (race === 'Variant Human' ? 1 : 0);
  const selectedSkills = skillChoices.slice(0, skillCount);
  const allSkillProficiencies = [...selectedSkills, ...(selectedBackground?.skillProficiencies || [])].filter(
    (s, i, arr) => arr.indexOf(s) === i
  );

  const startingEquipment = selectedClass.startingEquipment || [];
  const startEquipIds = [];
  startingEquipment.forEach((item) => {
    if (item.fixed) startEquipIds.push(...item.fixed);
    else if (item.choice && item.options) startEquipIds.push(...(item.options[0] || []));
  });

  let raceSpeed = selectedRace?.speed ?? 30;
  const characterLanguages = [...(selectedRace?.languages || ['common'])];

  const isCaster = CLASS_SPELL_ABILITY[className];
  const spellSlotsMax = isCaster ? (SPELL_SLOTS_BY_LEVEL[1] || {}) : {};
  const spellSlotsCurrent = { ...spellSlotsMax };
  const isPreparedCasterWithCantrips = PREPARED_CASTERS.includes(className) && ['Cleric', 'Druid'].includes(className);
  const spellsKnownCount = getSpellsKnownCountAtLevel(className, 1);
  const cantripsKnownCount = (CANTRIPS_KNOWN_BY_CLASS_LEVEL[className] && CANTRIPS_KNOWN_BY_CLASS_LEVEL[className][1]) || 0;
  const preparedCount = ['Cleric', 'Druid', 'Paladin'].includes(className)
    ? getPreparedSpellCount({ class: className, level: 1, abilityScores: abilityScoresFinal })
    : 0;

  const availableSpells = spells.filter((s) => s.level <= 1 && s.classes?.includes(className));
  const availableCantrips = availableSpells.filter((s) => s.level === 0);
  const availableLevel1 = availableSpells.filter((s) => s.level === 1);
  let spellsKnown = [];
  let spellsPrepared = undefined;
  if (isPreparedCasterWithCantrips) {
    spellsKnown = availableCantrips.slice(0, cantripsKnownCount).map((s) => s.id);
    spellsPrepared = availableLevel1.slice(0, preparedCount).map((s) => s.id);
  } else if (['Bard', 'Sorcerer', 'Warlock', 'Ranger', 'Wizard'].includes(className) && spellsKnownCount > 0) {
    spellsKnown = availableSpells.filter((s) => s.level >= 1).slice(0, spellsKnownCount).map((s) => s.id);
    if (className === 'Wizard') {
      const level1 = availableLevel1.slice(0, 6);
      spellsKnown = level1.map((s) => s.id);
    }
  }

  const subclassLvl = getSubclassLevel(className);
  const subclassesForClass = (subclasses || []).filter((s) => s.classId === className);
  const firstSubclass = subclassLvl === 1 && subclassesForClass.length > 0 ? subclassesForClass[0].name : undefined;

  const inspirationMax = className === 'Bard' ? Math.max(1, Math.floor(((abilityScoresFinal.cha ?? 10) - 10) / 2)) : 0;

  return createCharacter({
    name: name || 'New Character',
    race,
    class: className,
    subclass: firstSubclass,
    level: 1,
    background: selectedBackground?.id,
    abilityScores: abilityScoresFinal,
    maxHP,
    currentHP: maxHP,
    AC: 10 + dexMod,
    spellDC: isCaster ? 8 + 2 + Math.floor(((abilityScoresFinal[CLASS_SPELL_ABILITY[className]] ?? 10) - 10) / 2) : undefined,
    inspiration: inspirationMax,
    inspirationMax,
    spellSlots: spellSlotsCurrent,
    gold,
    spellsKnown,
    spellsPrepared,
    feats: race === 'Variant Human' ? [] : [],
    proficiencies: {
      saves: classProficiencies.saves || [],
      skills: allSkillProficiencies,
      expertise: [],
      tools: [...(classProficiencies.tools || []), ...(selectedBackground?.toolProficiencies || [])],
      armor: classProficiencies.armor || [],
      weapons: classProficiencies.weapons || [],
    },
    equipment: startEquipIds,
    speed: raceSpeed,
    languages: characterLanguages,
  });
}

export default function QuickCreateModal({ open, onClose, onComplete }) {
  const { t } = useI18n();
  const [race, setRace] = useState('');
  const [className, setClassName] = useState('');

  const handleCreate = () => {
    if (!race || !className) return;
    const char = buildQuickCharacter({ race, className, name: t('list.noName') });
    if (char) {
      onComplete?.(char);
      setRace('');
      setClassName('');
      onClose?.();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog" aria-labelledby="quick-create-title">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-white border border-slate-700">
        <h2 id="quick-create-title" className="text-lg font-bold text-purple-400 mb-4">
          {t('wizard.quickCreate') || 'Quick create'}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {t('wizard.quickCreateDesc') || 'Pick race and class. Character will be created with standard array, suggested background, and default skills/spells.'}
        </p>
        <label className="block text-sm text-gray-400 mb-1">{t('wizard.stepRace') || 'Race'}</label>
        <select
          value={race}
          onChange={(e) => setRace(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-4 border border-slate-600"
          aria-label={t('wizard.stepRace') || 'Race'}
        >
          <option value="">—</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <label className="block text-sm text-gray-400 mb-1">{t('wizard.stepClass') || 'Class'}</label>
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-6 border border-slate-600"
          aria-label={t('wizard.stepClass') || 'Class'}
        >
          <option value="">—</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
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
            onClick={handleCreate}
            disabled={!race || !className}
            className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all"
          >
            {t('wizard.createCharacter')}
          </button>
        </div>
      </div>
    </div>
  );
}
