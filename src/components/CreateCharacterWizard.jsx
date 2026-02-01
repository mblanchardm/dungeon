import React, { useState } from 'react';
import {
  createCharacter,
  getAbilityModifier,
  applyRacialBonuses,
  CLASS_STARTING_GOLD,
  CLASS_SPELL_ABILITY,
  SPELL_SLOTS_BY_LEVEL,
  computeMaxHPLevel1,
} from '../lib/characterModel.js';
import { races, classes, subclasses } from '../data/srd.js';

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
  class: '',
  subclass: '',
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  abilityMode: 'standard', // 'standard' | 'manual'
  standardAssignments: {}, // { str: 15, dex: 14, ... } - which of 15,14,13,12,10,8 each ability got
  name: '',
  background: '',
  gold: 0,
  level: 1,
};

export default function CreateCharacterWizard({ onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const update = (partial) => setFormData((prev) => ({ ...prev, ...partial }));

  // Final ability scores (base + racial)
  const baseScores = formData.abilityMode === 'standard'
    ? { ...formData.standardAssignments }
    : { ...formData.abilityScores };
  const abilityScoresFinal = applyRacialBonuses(
    Object.keys(baseScores).length ? baseScores : formData.abilityScores,
    formData.race
  );
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

  const handleFinish = () => {
    const char = createCharacter({
      name: formData.name.trim() || 'Sin nombre',
      race: formData.race,
      class: formData.class,
      subclass: formData.subclass || undefined,
      level: formData.level || 1,
      background: formData.background.trim() || undefined,
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
    return true;
  };

  const goNext = () => {
    if (step < 5) setStep((s) => s + 1);
    else handleFinish();
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-2xl text-white">
          <h1 className="text-2xl font-bold mb-1">Crear personaje</h1>
          <p className="text-sm text-gray-400">Paso {step} de 5</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
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
                  onClick={() => update({ race: r.name })}
                  className={`w-full text-left py-3 px-4 rounded-xl transition-all ${
                    formData.race === r.name
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="font-bold block">{r.name}</span>
                  <span className="text-sm text-gray-400 block mt-0.5">{r.description}</span>
                </button>
              ))}
            </div>
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
                      {STANDARD_ARRAY.map((n) => (
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
            <label className="block text-sm text-gray-400 mb-1">Trasfondo (opcional)</label>
            <input
              type="text"
              value={formData.background || ''}
              onChange={(e) => update({ background: e.target.value })}
              placeholder="ej. Artesano, Soldado"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
            />
          </div>
        )}

        {/* Step 5: Equipment / starting values */}
        {step === 5 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl text-white mb-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">5. Valores iniciales</h2>
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
            {step === 5 ? 'Crear personaje' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
