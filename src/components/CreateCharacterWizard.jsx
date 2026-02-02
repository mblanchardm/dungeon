import React, { useState } from 'react';
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

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
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
  abilityMode: 'standard', // 'standard' | 'manual'
  standardAssignments: {}, // { str: 15, dex: 14, ... } - which of 15,14,13,12,10,8 each ability got
  name: '',
  background: '', // background ID
  gold: 0,
  level: 1,
  spellsKnown: [], // spell IDs selected during creation
  selectedSkills: [], // skill names selected during creation
  equipmentChoices: {}, // { weapon: 0, armor: 1, ... } - index of chosen option per choice
};

export default function CreateCharacterWizard({ onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const { theme } = useTheme();

  const update = (partial) => setFormData((prev) => ({ ...prev, ...partial }));

  // Final ability scores (base + racial + subrace)
  const baseScores = formData.abilityMode === 'standard'
    ? { ...formData.standardAssignments }
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

  // Total steps: 5 base + 1 if caster
  const totalSteps = isCaster && spellsKnownCount > 0 ? 6 : 5;

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
      name: formData.name.trim() || 'Sin nombre',
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
    onComplete(char);
  };

  const canNext = () => {
    if (step === 1) return !!formData.race;
    if (step === 2) return !!formData.class;
    if (step === 3) {
      if (formData.abilityMode === 'standard') {
        const assigned = Object.values(formData.standardAssignments || {}).filter((v) => v != null);
        return assigned.length === 6 && new Set(assigned).size === 6;
      }
      const scores = formData.abilityScores || {};
      return ABILITIES.every((a) => {
        const v = scores[a.key];
        return v != null && v >= 3 && v <= 20;
      });
    }
    if (step === 4) return !!formData.name.trim();
    // Step 5 for casters: spell selection
    if (step === 5 && totalSteps === 6) {
      return formData.spellsKnown.length === spellsKnownCount;
    }
    // Final step: validate skills and expertise (Rogue needs 2 expertise)
    if (step === totalSteps) {
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

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    }`}>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-2xl text-white">
          <h1 className="text-2xl font-bold mb-1">Crear personaje</h1>
          <p className="text-sm text-gray-400">Paso {step} de {totalSteps}</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Race */}
        {step === 1 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">1. Elige una raza</h2>
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
                <h3 className="text-lg font-bold text-purple-300 mb-3">Subraza</h3>
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
            <h2 className="text-xl font-bold text-purple-400 mb-4">2. Elige una clase</h2>
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
            <label className="block text-sm text-gray-400 mb-2">Subclase (opcional)</label>
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
                <p className="text-sm text-gray-500">Sin subclases definidas para esta clase.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Ability scores */}
        {step === 3 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">3. Puntuación de características</h2>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => update({ abilityMode: 'standard', standardAssignments: {} })}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  formData.abilityMode === 'standard' ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                Array estándar
              </button>
              <button
                onClick={() => update({ abilityMode: 'manual' })}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  formData.abilityMode === 'manual' ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                Manual
              </button>
            </div>

            {formData.abilityMode === 'standard' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Asigna 15, 14, 13, 12, 10, 8 a cada característica (cada número una vez).</p>
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
                        ({abilityScoresFinal[a.key]} → +{getAbilityModifier(abilityScoresFinal[a.key])})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formData.abilityMode === 'manual' && (
              <div className="space-y-3">
                {ABILITIES.map((a) => (
                  <div key={a.key} className="flex items-center justify-between gap-2">
                    <span className="font-medium w-12">{a.label}</span>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={formData.abilityScores[a.key] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? '' : Math.min(20, Math.max(3, Number(e.target.value)));
                        update({
                          abilityScores: {
                            ...formData.abilityScores,
                            [a.key]: v === '' ? undefined : v,
                          },
                        });
                      }}
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 w-20"
                    />
                    {abilityScoresFinal[a.key] != null && (
                      <span className="text-purple-300">+{getAbilityModifier(abilityScoresFinal[a.key])}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Describe */}
        {step === 4 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">4. Describe a tu personaje</h2>
            <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Nombre del personaje"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 mb-4"
            />
            <label className="block text-sm text-gray-400 mb-1">Trasfondo</label>
            <select
              value={formData.background || ''}
              onChange={(e) => update({ background: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 mb-2"
            >
              <option value="">Elige un trasfondo...</option>
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
                    <strong>Habilidades:</strong> {bg.skillProficiencies.map((s) => SKILL_NAMES_ES[s] || s).join(', ')}
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
        {step === 5 && totalSteps === 6 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 className="text-xl font-bold text-purple-400 mb-2">5. Elige tus conjuros</h2>
            <p className="text-sm text-gray-400 mb-4">
              Selecciona {spellsKnownCount} conjuro{spellsKnownCount !== 1 ? 's' : ''} de nivel 0-{maxSpellLevel} para tu {formData.class}.
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
                      <span className="font-medium">{spell.name}</span>
                      <span className="text-purple-300 text-xs ml-2">{spell.level === 0 ? 'Truco' : `Nv.${spell.level}`}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{spell.description}</p>
                    </div>
                  </label>
                );
              })}
              {availableSpells.length === 0 && (
                <p className="text-sm text-gray-500">No hay conjuros disponibles para esta clase.</p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {formData.spellsKnown.length} / {spellsKnownCount} seleccionados
            </p>
          </div>
        )}

        {/* Step 5 or 6: Equipment / starting values */}
        {step === totalSteps && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">{totalSteps}. Valores iniciales</h2>
            
            {/* Skill Selection */}
            {skillChoices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-purple-300 mb-2">Elige {skillCount} habilidades</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Tu clase ({formData.class}) te permite elegir {skillCount} de las siguientes habilidades:
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
                  {formData.selectedSkills.length} / {skillCount} seleccionadas
                </p>
              </div>
            )}

            {/* Expertise (Rogue: 2 skills) */}
            {formData.class === 'Rogue' && formData.selectedSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-amber-400 mb-2">Experticia (2 habilidades)</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Elige 2 de tus habilidades para tener experticia (doble bonificación de competencia):
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
                  {(formData.selectedExpertise?.length ?? 0)} / 2 experticias
                </p>
              </div>
            )}

            {/* Starting Equipment Selection */}
            {startingEquipment.filter((e) => e.choice).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-amber-400 mb-2">Equipo inicial</h3>
                <p className="text-xs text-gray-400 mb-3">Elige una opción para cada categoría:</p>
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
                    <p className="text-xs text-gray-400 mb-1">También recibirás:</p>
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
                <span className="text-gray-400">Oro inicial</span>
                <input
                  type="number"
                  min={0}
                  value={gold}
                  onChange={(e) => update({ gold: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-24 bg-slate-700 text-white rounded px-2 py-1 text-right"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">HP máximo (nivel 1)</span>
                <span className="font-bold">{maxHP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AC (10 + DEX)</span>
                <span className="font-bold">{10 + dexMod}</span>
              </div>
              {formData.class && CLASS_SPELL_ABILITY[formData.class] && (
                <div className="flex justify-between">
                  <span className="text-gray-400">CD de conjuros</span>
                  <span className="font-bold">
                    {8 + 2 + getAbilityModifier(abilityScoresFinal[CLASS_SPELL_ABILITY[formData.class]] ?? 10)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">Al terminar se creará el personaje y podrás abrirlo desde la lista.</p>
          </div>
        )}

        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={goPrev}
            disabled={step === 1}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
          >
            Atrás
          </button>
          <button
            onClick={goNext}
            disabled={!canNext()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
          >
            {step === totalSteps ? 'Crear personaje' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
