import React, { useState, useEffect } from 'react';
import {
  getAbilityModifier,
  SPELL_SLOTS_BY_LEVEL,
  CLASS_SPELL_ABILITY,
  CLASS_HIT_DIE,
  computeSpellDC,
  computeHPGainForLevel,
  levelUpCharacter,
  getSpellsKnownCountAtLevel,
  getMaxSpellLevelForCharacterLevel,
  getProficiencyBonus,
  ASI_LEVELS,
} from '../lib/characterModel.js';
import {
  generatePlayGuide,
  generateCombatGuide,
  generateEquipmentAdvice,
  generateSocialGuidance,
} from '../lib/tacticsHelpers.js';
import { races, classes, subclasses, spells, equipment, quickPurchases } from '../data/srd.js';
import ConfirmModal from './ConfirmModal.jsx';

const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const TABS = ['resumen', 'combate', 'hechizos', 'social', 'equipo', 'tacticas'];

export default function CharacterSheet({ character, onUpdate, onBack, onDeleteCharacter }) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [editingBasics, setEditingBasics] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpStep, setLevelUpStep] = useState(1);
  const [levelUpUseFixed, setLevelUpUseFixed] = useState(true);
  const [levelUpFullHeal, setLevelUpFullHeal] = useState(true);
  const [levelUpNewSpellIds, setLevelUpNewSpellIds] = useState([]);
  const [editingSpells, setEditingSpells] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(false);
  const [spellsKnownEdit, setSpellsKnownEdit] = useState([]);
  const [equipmentEdit, setEquipmentEdit] = useState([]);
  const [editForm, setEditForm] = useState({
    name: '',
    race: '',
    class: '',
    subclass: '',
    level: 1,
    background: '',
  });

  useEffect(() => {
    if (character) {
      setEditForm({
        name: character.name ?? '',
        race: character.race ?? '',
        class: character.class ?? '',
        subclass: character.subclass ?? '',
        level: character.level ?? 1,
        background: character.background ?? '',
      });
    }
  }, [character?.id]);

  if (!character) return null;

  const update = (partial) => {
    onUpdate({ ...character, ...partial, updatedAt: new Date().toISOString() });
  };

  const maxHP = character.maxHP ?? 10;
  const currentHP = Math.min(maxHP, Math.max(0, character.currentHP ?? maxHP));
  const inspiration = Math.min(character.inspirationMax ?? 0, Math.max(0, character.inspiration ?? 0));
  const inspirationMax = character.inspirationMax ?? 0;
  const gold = Math.max(0, character.gold ?? 0);
  const spellSlotsMax = CLASS_SPELL_ABILITY[character.class]
    ? SPELL_SLOTS_BY_LEVEL[character.level] || {}
    : {};
  const levelKeys = Object.keys(spellSlotsMax).map(Number).sort((a, b) => a - b);

  const setCurrentHP = (v) => update({ currentHP: Math.min(maxHP, Math.max(0, v)) });
  const setInspiration = (v) => update({ inspiration: Math.min(inspirationMax, Math.max(0, v)) });
  const setGold = (v) => update({ gold: Math.max(0, v) });
  const setSpellSlot = (level, value) => {
    const max = spellSlotsMax[level] ?? 0;
    const next = { ...(character.spellSlots || {}) };
    next[String(level)] = Math.min(max, Math.max(0, value));
    update({ spellSlots: next });
  };

  const resetLongRest = () => {
    const slots = {};
    for (const [lev, max] of Object.entries(spellSlotsMax)) {
      slots[lev] = max;
    }
    update({
      currentHP: maxHP,
      inspiration: inspirationMax,
      spellSlots: slots,
    });
  };

  const saveEditBasics = () => {
    const level = Math.min(20, Math.max(1, Number(editForm.level) || 1));
    const nextChar = {
      ...character,
      name: (editForm.name || '').trim() || character.name,
      race: editForm.race || character.race,
      class: editForm.class || character.class,
      subclass: (editForm.subclass || '').trim() || undefined,
      level,
      background: (editForm.background || '').trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    let spellSlots = character.spellSlots ?? {};
    let spellDC = character.spellDC;
    if (CLASS_SPELL_ABILITY[nextChar.class]) {
      const maxSlots = SPELL_SLOTS_BY_LEVEL[level] || {};
      spellSlots = {};
      for (const [lev, max] of Object.entries(maxSlots)) {
        spellSlots[lev] = max;
      }
      spellDC = computeSpellDC(nextChar);
    } else {
      spellSlots = {};
      spellDC = undefined;
    }
    update({ ...nextChar, spellSlots, spellDC });
    setEditingBasics(false);
  };

  const selectedRace = races.find((r) => r.name === editForm.race);
  const selectedClass = classes.find((c) => c.name === editForm.class);
  const selectedSubclass = subclasses.find((s) => s.name === editForm.subclass);
  const subclassesForClass = subclasses.filter((s) => s.classId === editForm.class);

  const hasUnsavedChanges = () => {
    const c = character;
    return (
      (editForm.name ?? '') !== (c.name ?? '') ||
      (editForm.race ?? '') !== (c.race ?? '') ||
      (editForm.class ?? '') !== (c.class ?? '') ||
      (editForm.subclass ?? '') !== (c.subclass ?? '') ||
      Number(editForm.level) !== Number(c.level ?? 1) ||
      (editForm.background ?? '') !== (c.background ?? '')
    );
  };

  const handleBackClick = () => {
    if (editingBasics && hasUnsavedChanges()) {
      setShowUnsavedConfirm(true);
    } else {
      onBack?.();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {onBack && (
            <button
              onClick={handleBackClick}
              className="text-purple-300 hover:text-white text-sm font-medium"
            >
              ← Volver a la lista
            </button>
          )}
          <button
            onClick={() => {
              if (!editingBasics && character) {
                setEditForm({
                  name: character.name ?? '',
                  race: character.race ?? '',
                  class: character.class ?? '',
                  subclass: character.subclass ?? '',
                  level: character.level ?? 1,
                  background: character.background ?? '',
                });
              }
              setEditingBasics((v) => !v);
            }}
            className="text-purple-300 hover:text-white text-sm font-medium"
          >
            {editingBasics ? 'Cerrar edición' : 'Editar datos básicos'}
          </button>
          {(character.level ?? 1) < 20 && (
            <button
              onClick={() => {
                setLevelUpStep(1);
                setLevelUpNewSpellIds([]);
                setShowLevelUpModal(true);
              }}
              className="text-green-400 hover:text-green-300 text-sm font-medium"
            >
              Subir de nivel
            </button>
          )}
          {onDeleteCharacter && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Eliminar personaje
            </button>
          )}
        </div>

        {editingBasics && (
          <div className="bg-slate-800 rounded-xl p-4 shadow-2xl text-white mb-6">
            <h2 className="text-lg font-bold text-purple-400 mb-4">Editar datos básicos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Raza</label>
                <select
                  value={editForm.race}
                  onChange={(e) => setEditForm((f) => ({ ...f, race: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="">—</option>
                  {races.map((r) => (
                    <option key={r.id} value={r.name} title={r.description}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {selectedRace && (
                  <p className="text-sm text-gray-400 mt-1">{selectedRace.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Clase</label>
                <select
                  value={editForm.class}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, class: e.target.value, subclass: '' }))
                  }
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="">—</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name} title={c.description}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {selectedClass && (
                  <p className="text-sm text-gray-400 mt-1">{selectedClass.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subclase (opcional)</label>
                <select
                  value={editForm.subclass}
                  onChange={(e) => setEditForm((f) => ({ ...f, subclass: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="">—</option>
                  {subclassesForClass.map((s) => (
                    <option key={s.id} value={s.name} title={s.description}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {selectedSubclass && (
                  <p className="text-sm text-gray-400 mt-1">{selectedSubclass.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nivel (1–20)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editForm.level}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      level: Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)),
                    }))
                  }
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Trasfondo (opcional)</label>
                <input
                  type="text"
                  value={editForm.background}
                  onChange={(e) => setEditForm((f) => ({ ...f, background: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveEditBasics}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingBasics(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-1">{character.name || 'Sin nombre'}</h1>
          <p className="text-sm text-purple-100">
            {character.class} {character.race} • Nivel {character.level ?? 1}
          </p>
          {(character.subclass || character.background) && (
            <p className="text-xs text-purple-200">
              {[character.subclass, character.background].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">HP</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={currentHP}
                onChange={(e) => setCurrentHP(parseInt(e.target.value, 10) || 0)}
                className="w-12 text-3xl font-bold bg-transparent border-b-2 border-white"
              />
              <span className="text-2xl font-bold">/{maxHP}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white text-center">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">AC</div>
            <div className="text-4xl font-bold">{character.AC ?? 10}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white text-center">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">CD</div>
            <div className="text-4xl font-bold">{character.spellDC ?? '—'}</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">Inspiración</div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setInspiration(inspiration - 1)}
                className="text-2xl font-bold"
                disabled={inspiration <= 0}
              >
                −
              </button>
              <span className="text-3xl font-bold">{inspiration}</span>
              <button
                onClick={() => setInspiration(inspiration + 1)}
                className="text-2xl font-bold"
                disabled={inspiration >= inspirationMax}
              >
                +
              </button>
            </div>
            {inspirationMax > 0 && (
              <p className="text-xs text-center opacity-90">/ {inspirationMax}</p>
            )}
          </div>
        </div>

        {levelKeys.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {levelKeys.map((lev) => {
              const max = spellSlotsMax[lev];
              const current = character.spellSlots?.[String(lev)] ?? max;
              return (
                <div key={lev} className="bg-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                    Hechizos Nv.{lev}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSpellSlot(lev, current - 1)}
                      className="text-xl font-bold text-blue-400"
                      disabled={current <= 0}
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold">
                      {current}/{max}
                    </span>
                    <button
                      onClick={() => setSpellSlot(lev, current + 1)}
                      className="text-xl font-bold text-blue-400"
                      disabled={current >= max}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 shadow-2xl text-white mb-6">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-4">Atributos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(ABILITY_LABELS).map(([key, label]) => {
                    const score = character.abilityScores?.[key] ?? 10;
                    const mod = getAbilityModifier(score);
                    return (
                      <div key={key} className="bg-slate-700 rounded-lg p-3 text-center">
                        <div className="text-3xl font-bold text-purple-300">+{mod}</div>
                        <div className="text-xs mt-1 text-gray-300">
                          {label} {score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {(() => {
                const playGuide = generatePlayGuide(character);
                if (!playGuide) return null;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-purple-400 mb-3">Cómo jugar este personaje</h2>
                    <div className="bg-slate-700 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-line">
                      {playGuide}
                    </div>
                  </div>
                );
              })()}
              {character.race && (
                <div>
                  <h2 className="text-xl font-bold text-purple-400 mb-3">
                    Rasgos {races.find((r) => r.name === character.race)?.name ?? character.race}
                  </h2>
                  <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300">
                    {(races.find((r) => r.name === character.race)?.traits) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {races.find((r) => r.name === character.race).traits.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{races.find((r) => r.name === character.race)?.description ?? character.race}</p>
                    )}
                  </div>
                </div>
              )}
              {character.subclass && (() => {
                const sub = subclasses.find((s) => s.name === character.subclass);
                if (!sub?.feature) return null;
                const f = sub.feature;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-purple-400 mb-3">{sub.name}</h2>
                    <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300">
                      <p className="font-bold text-purple-300 mb-2">{f.name}</p>
                      {f.trigger && <p><span className="text-gray-400">Reacción:</span> {f.trigger}</p>}
                      {f.cost && <p><span className="text-gray-400">Costo:</span> {f.cost}</p>}
                      {f.effect && <p><span className="text-gray-400">Efecto:</span> {f.effect}</p>}
                      {f.hint && <p className="text-amber-400 mt-1">{f.hint}</p>}
                    </div>
                  </div>
                );
              })()}
              {character.background && (
                <div>
                  <h2 className="text-xl font-bold text-purple-400 mb-3">Trasfondo</h2>
                  <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300">
                    {character.background}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'combate' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">Combate</h2>
                <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300">
                  AC {character.AC ?? 10} • HP {currentHP}/{maxHP}
                  {character.spellDC != null && ` • CD conjuros ${character.spellDC}`}
                </div>
              </div>
              {(() => {
                const combatGuide = generateCombatGuide(character);
                if (!combatGuide.rotation.length && !combatGuide.combos.length) return null;
                return (
                  <>
                    {combatGuide.rotation.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-red-400 mb-3">Tácticas de combate</h2>
                        <div className="bg-slate-700 rounded-lg p-4 text-sm text-gray-300">
                          <ol className="space-y-1 list-decimal list-inside">
                            {combatGuide.rotation.map((tactic, i) => (
                              <li key={i}>{tactic}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                    {combatGuide.combos.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-yellow-400 mb-3">Combos de habilidades</h2>
                        <div className="bg-slate-700 rounded-lg p-4 text-sm text-gray-300">
                          <ul className="space-y-2 list-disc list-inside">
                            {combatGuide.combos.map((combo, i) => (
                              <li key={i}>{combo}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              {character.class === 'Bard' && (inspirationMax ?? 0) > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-purple-400 mb-3">Inspiración Barda</h2>
                  <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300 space-y-1">
                    <p><span className="text-gray-400">Acción bonus:</span> Das 1d6 a aliado.</p>
                    <p><span className="text-gray-400">Suma a:</span> ataque, habilidad o salvación.</p>
                    <p><span className="text-gray-400">Usos:</span> {inspirationMax} por descanso largo.</p>
                    <p className="text-amber-400 mt-2">Usa antes de momentos críticos.</p>
                  </div>
                </div>
              )}
              {character.subclass && (() => {
                const sub = subclasses.find((s) => s.name === character.subclass);
                if (!sub?.feature) return null;
                const f = sub.feature;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-purple-400 mb-3">{f.name}</h2>
                    <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300 space-y-1">
                      {f.trigger && <p><span className="text-gray-400">Reacción:</span> {f.trigger}</p>}
                      {f.cost && <p><span className="text-gray-400">Costo:</span> {f.cost}</p>}
                      {f.effect && <p><span className="text-gray-400">Efecto:</span> {f.effect}</p>}
                      {f.hint && <p className="text-amber-400 mt-2">{f.hint}</p>}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'hechizos' && (
            <div className="space-y-6">
              {(character.spellDC != null || levelKeys.length > 0) && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {character.spellDC != null && (
                      <p className="text-lg font-bold">CD: {character.spellDC}</p>
                    )}
                    {CLASS_SPELL_ABILITY[character.class] && (
                      <p className="text-lg font-bold">
                        Ataque: +{getProficiencyBonus(character.level ?? 1) + getAbilityModifier(character.abilityScores?.[CLASS_SPELL_ABILITY[character.class]] ?? 10)}
                      </p>
                    )}
                  </div>
                  {levelKeys.length > 0 && (
                    <p className="text-xs text-purple-100 mt-1">
                      Espacios: {levelKeys.map((l) => `Nv.${l} ${character.spellSlots?.[String(l)] ?? 0}/${spellSlotsMax[l]}`).join(' • ')}
                    </p>
                  )}
                </div>
              )}
              <h2 className="text-xl font-bold text-purple-400 mb-2">Conjuros conocidos / preparados</h2>
              {!editingSpells ? (
                <>
                  {(character.spellsKnown ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400">Sin conjuros añadidos.</p>
                  ) : (
                    (() => {
                      const knownSpells = (character.spellsKnown ?? [])
                        .map((id) => spells.find((s) => s.id === id))
                        .filter(Boolean);
                      const byLevel = {};
                      knownSpells.forEach((spell) => {
                        const lev = spell.level;
                        if (!byLevel[lev]) byLevel[lev] = [];
                        byLevel[lev].push(spell);
                      });
                      const levelsOrdered = [0, ...levelKeys.filter((l) => l > 0)];
                      return (
                        <div className="space-y-4">
                          {levelsOrdered.map((lev) => {
                            const list = byLevel[lev] || [];
                            if (list.length === 0) return null;
                            const slotLine = lev === 0
                              ? ' (ilimitados)'
                              : ` (${character.spellSlots?.[String(lev)] ?? 0}/${spellSlotsMax[lev] ?? 0} espacios)`;
                            return (
                              <div key={lev}>
                                <h3 className="text-sm font-bold text-yellow-400 mb-2">
                                  {lev === 0 ? 'Trucos' : `Nivel ${lev}`}{slotLine}
                                </h3>
                                <div className="space-y-2">
                                  {list.map((spell) => (
                                    <div key={spell.id} className="bg-slate-700 rounded-lg p-3">
                                      <p className="font-bold text-white">{spell.name}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {spell.school && <span className="text-purple-300">{spell.school}</span>}
                                        {spell.school && ' · '}
                                        {spell.description}
                                      </p>
                                      {spell.hint && (
                                        <p className="text-xs text-amber-400 mt-1">{spell.hint}</p>
                                      )}
                                      {spell.tacticalUse && (
                                        <p className="text-xs text-amber-300 mt-1.5 italic">
                                          <span className="font-semibold">Táctica:</span> {spell.tacticalUse}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                  <button
                    onClick={() => {
                      setSpellsKnownEdit([...(character.spellsKnown ?? [])]);
                      setEditingSpells(true);
                    }}
                    className="mt-2 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                  >
                    Editar conjuros
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  {spells.map((spell) => (
                    <label key={spell.id} className="flex items-start gap-2 bg-slate-700 rounded-lg p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={spellsKnownEdit.includes(spell.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSpellsKnownEdit((prev) => [...prev, spell.id]);
                          } else {
                            setSpellsKnownEdit((prev) => prev.filter((x) => x !== spell.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{spell.name}</p>
                        <p className="text-xs text-gray-400">{spell.description}</p>
                      </div>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        update({ spellsKnown: spellsKnownEdit });
                        setEditingSpells(false);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingSpells(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              {(() => {
                const socialGuide = generateSocialGuidance(character);
                if (!socialGuide) return null;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-purple-400 mb-3">Guía de interacción</h2>
                    <div className="bg-slate-700 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-line">
                      {socialGuide}
                    </div>
                  </div>
                );
              })()}
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">Habilidades sociales y notas</label>
                <textarea
                  value={character.socialNotes ?? ''}
                  onChange={(e) => update({ socialNotes: e.target.value })}
                  onBlur={(e) => update({ socialNotes: e.target.value })}
                  placeholder="Notas sobre persuasión, interpretación, engaño..."
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 min-h-[120px] text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'equipo' && (
            <div className="space-y-6">
              {(() => {
                const equipAdvice = generateEquipmentAdvice(character);
                if (!equipAdvice) return null;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-green-400 mb-3">Guía de equipo</h2>
                    <div className="bg-slate-700 rounded-lg p-4 text-sm text-gray-300 space-y-2">
                      <p><span className="font-semibold text-green-300">Armas:</span> {equipAdvice.weapons}</p>
                      <p><span className="font-semibold text-green-300">Armadura:</span> {equipAdvice.armor}</p>
                      {equipAdvice.essentials?.length > 0 && (
                        <p><span className="font-semibold text-green-300">Esenciales:</span> {equipAdvice.essentials.join(', ')}</p>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-3">Oro</h2>
                <div className="flex items-center justify-center gap-3 bg-slate-700 rounded-lg p-4">
                  <button
                    onClick={() => setGold(gold - 1)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold w-8 h-8 rounded"
                  >
                    −
                  </button>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400 text-center">{gold}</p>
                    <p className="text-xs text-gray-400 text-center">po</p>
                  </div>
                  <button
                    onClick={() => setGold(gold + 1)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold w-8 h-8 rounded"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setGold(gold - 10)}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-1 rounded"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => setGold(gold + 10)}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-1 rounded"
                  >
                    +10
                  </button>
                </div>
              </div>
              {quickPurchases?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-400 mb-2">Transacciones rápidas</h3>
                  <div className="flex flex-wrap gap-2">
                    {quickPurchases.map((q) => {
                      const canAfford = gold >= q.cost;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          disabled={!canAfford}
                          onClick={() => {
                            if (!canAfford) return;
                            const current = character.equipment ?? [];
                            update({
                              gold: gold - q.cost,
                              equipment: [...current, q.id],
                            });
                          }}
                          className="bg-amber-800 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-3 rounded-lg transition-all"
                        >
                          {q.label} (-{q.cost} po)
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <h2 className="text-xl font-bold text-yellow-400 mb-2">Equipamiento</h2>
              {!editingEquipment ? (
                <>
                  {(character.equipment ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400">Sin equipo añadido.</p>
                  ) : (
                    <div className="space-y-2">
                      {(character.equipment ?? []).map((id) => {
                        const item = equipment.find((e) => e.id === id);
                        if (!item) return null;
                        return (
                          <div key={item.id} className="bg-slate-700 rounded-lg p-3">
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.category && <span>{item.category}</span>}
                              {item.category && item.cost && ' · '}
                              {item.cost && <span>{item.cost}</span>}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setEquipmentEdit([...(character.equipment ?? [])]);
                      setEditingEquipment(true);
                    }}
                    className="mt-2 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                  >
                    Editar equipo
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  {equipment.map((item) => (
                    <label key={item.id} className="flex items-start gap-2 bg-slate-700 rounded-lg p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={equipmentEdit.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEquipmentEdit((prev) => [...prev, item.id]);
                          } else {
                            setEquipmentEdit((prev) => prev.filter((x) => x !== item.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        update({ equipment: equipmentEdit });
                        setEditingEquipment(false);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingEquipment(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tacticas' && (
            <div className="space-y-6">
              {(() => {
                const combatGuide = generateCombatGuide(character);
                const hasGuide = combatGuide.rotation.length > 0 || combatGuide.combos.length > 0 || combatGuide.situations.length > 0;
                if (!hasGuide) return null;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-purple-400 mb-3">Guía táctica</h2>
                    <div className="bg-slate-700 rounded-lg p-4 space-y-4">
                      {combatGuide.rotation.length > 0 && (
                        <div>
                          <h3 className="text-md font-bold text-red-400 mb-2">Rotación sugerida</h3>
                          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                            {combatGuide.rotation.map((tactic, i) => (
                              <li key={i}>{tactic}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {combatGuide.combos.length > 0 && (
                        <div>
                          <h3 className="text-md font-bold text-yellow-400 mb-2">Combos destacados</h3>
                          <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                            {combatGuide.combos.map((combo, i) => (
                              <li key={i}>{combo}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {combatGuide.situations.length > 0 && (
                        <div>
                          <h3 className="text-md font-bold text-blue-400 mb-2">Situaciones comunes</h3>
                          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                            {combatGuide.situations.map((situation, i) => (
                              <li key={i}>{situation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">Notas de táctica y estrategia</label>
                <textarea
                  value={character.tacticsNotes ?? ''}
                  onChange={(e) => update({ tacticsNotes: e.target.value })}
                  onBlur={(e) => update({ tacticsNotes: e.target.value })}
                  placeholder="Prioridades en combate, uso de conjuros, trabajo en equipo..."
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 min-h-[120px] text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {(inspirationMax > 0 || levelKeys.length > 0) && (
          <button
            onClick={resetLongRest}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mb-4 shadow-lg transition-all"
          >
            Descanso largo
          </button>
        )}

        <div className="text-center text-gray-500 text-xs pb-4">
          <p>
            {character.name || 'Personaje'} • {character.class} Nivel {character.level ?? 1}
          </p>
        </div>

        <ConfirmModal
          open={showDeleteConfirm}
          title="Eliminar personaje"
          message={`¿Eliminar a ${character.name || 'este personaje'}?`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          danger
          onConfirm={() => {
            onDeleteCharacter?.(character.id);
            setShowDeleteConfirm(false);
            onBack?.();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <ConfirmModal
          open={showUnsavedConfirm}
          title="Cambios sin guardar"
          message="Hay cambios sin guardar. ¿Salir?"
          confirmLabel="Salir"
          cancelLabel="Cancelar"
          onConfirm={() => {
            setShowUnsavedConfirm(false);
            setEditingBasics(false);
            onBack?.();
          }}
          onCancel={() => setShowUnsavedConfirm(false)}
        />

        {showLevelUpModal && (() => {
          const newLevel = (character.level ?? 1) + 1;
          const maxSpellLevel = getMaxSpellLevelForCharacterLevel(newLevel);
          const spellsKnownCount = getSpellsKnownCountAtLevel(character.class, newLevel);
          const currentSpellsCount = (character.spellsKnown ?? []).length;
          const spellsToPickCount = Math.max(0, spellsKnownCount - currentSpellsCount);
          const showSpellStep = CLASS_SPELL_ABILITY[character.class] && spellsToPickCount > 0;
          const conMod = getAbilityModifier(character.abilityScores?.con ?? 10);
          const hpGainFixed = computeHPGainForLevel(character.class, conMod, true);
          const currentMaxHP = character.maxHP ?? 10;
          const newMaxHPIfFixed = currentMaxHP + hpGainFixed;
          const slotsAtNewLevel = SPELL_SLOTS_BY_LEVEL[newLevel] || {};
          const slotLevels = Object.keys(slotsAtNewLevel).map(Number).sort((a, b) => a - b);
          const profNew = getProficiencyBonus(newLevel);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog">
              <div className={`bg-slate-800 rounded-xl shadow-2xl w-full p-6 text-white border border-slate-700 ${levelUpStep === 2 || levelUpStep === 3 ? 'max-w-md' : 'max-w-sm'}`}>
                {levelUpStep === 1 && (
                  <>
                    <h3 className="text-lg font-bold text-purple-400 mb-4">
                      Subir a nivel {newLevel}
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-300 mb-2">Vida adicional (1d{CLASS_HIT_DIE[character.class] ?? 8} + mod CON):</p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="levelUpHp"
                              checked={!levelUpUseFixed}
                              onChange={() => setLevelUpUseFixed(false)}
                              className="rounded"
                            />
                            <span className="text-sm">Tirar dado</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="levelUpHp"
                              checked={levelUpUseFixed}
                              onChange={() => setLevelUpUseFixed(true)}
                              className="rounded"
                            />
                            <span className="text-sm">Tomar promedio ({hpGainFixed})</span>
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
                        <span className="text-sm">Restaurar toda la vida</span>
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLevelUpModal(false)}
                        className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => setLevelUpStep(showSpellStep ? 2 : 3)}
                        className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
                      >
                        Siguiente
                      </button>
                    </div>
                  </>
                )}

                {levelUpStep === 2 && (
                  <>
                    <h3 className="text-lg font-bold text-purple-400 mb-2">
                      Elige {spellsToPickCount} nuevo{spellsToPickCount !== 1 ? 's' : ''} conjuro{spellsToPickCount !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Conjuros de nivel 0 a {maxSpellLevel}.</p>
                    <div className="max-h-64 overflow-y-auto space-y-2 mb-6">
                      {spells
                        .filter((s) => s.level <= maxSpellLevel)
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
                                <span className="font-medium">{spell.name}</span>
                                {spell.level > 0 && <span className="text-gray-400"> (nv.{spell.level})</span>}
                                — {spell.description}
                              </span>
                            </label>
                          );
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                      {levelUpNewSpellIds.length} / {spellsToPickCount} seleccionados
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setLevelUpStep(1)}
                        className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={() => setLevelUpStep(3)}
                        disabled={levelUpNewSpellIds.length !== spellsToPickCount}
                        className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </>
                )}

                {levelUpStep === 3 && (
                  <>
                    <h3 className="text-lg font-bold text-purple-400 mb-4">
                      Resumen – Nivel {newLevel}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300 mb-6">
                      <li><strong className="text-white">Nivel:</strong> {character.level ?? 1} → {newLevel}</li>
                      <li>
                        <strong className="text-white">PV:</strong>{' '}
                        {levelUpUseFixed ? `+${hpGainFixed} (promedio). Nuevo máximo: ${currentMaxHP} + ${hpGainFixed} = ${newMaxHPIfFixed}` : `+? (tirada 1d${CLASS_HIT_DIE[character.class] ?? 8}+${conMod >= 0 ? '+' : ''}${conMod}). Nuevo máximo al confirmar.`}
                        {' · Restaurar toda la vida: '}{levelUpFullHeal ? 'sí' : 'no'}
                      </li>
                      <li><strong className="text-white">Bonificación de competencia:</strong> +{profNew}</li>
                      {CLASS_SPELL_ABILITY[character.class] && slotLevels.length > 0 && (
                        <li>
                          <strong className="text-white">Espacios de conjuro:</strong>{' '}
                          {slotLevels.map((l) => `${slotsAtNewLevel[l] ?? 0} nv.${l}`).join(', ')}
                        </li>
                      )}
                      {levelUpNewSpellIds.length > 0 && (
                        <li>
                          <strong className="text-white">Conjuros aprendidos:</strong>{' '}
                          {levelUpNewSpellIds.map((id) => spells.find((s) => s.id === id)?.name ?? id).join(', ')}
                        </li>
                      )}
                      {ASI_LEVELS.includes(newLevel) && (
                        <li className="text-amber-300">Mejora de característica o dote (aplicar en edición).</li>
                      )}
                    </ul>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setLevelUpStep(showSpellStep ? 2 : 1)}
                        className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={() => {
                          const next = levelUpCharacter(character, {
                            useFixed: levelUpUseFixed,
                            fullHeal: levelUpFullHeal,
                            newSpellIds: levelUpNewSpellIds.length > 0 ? levelUpNewSpellIds : undefined,
                          });
                          onUpdate(next);
                          setShowLevelUpModal(false);
                        }}
                        className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all"
                      >
                        Subir de nivel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
