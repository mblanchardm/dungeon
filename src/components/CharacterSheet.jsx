import React, { useState, useEffect } from 'react';
import {
  getAbilityModifier,
  SPELL_SLOTS_BY_LEVEL,
  CLASS_SPELL_ABILITY,
  CLASS_HIT_DIE,
  computeSpellDC,
  getProficiencyBonus,
  SKILLS,
  SKILL_NAMES_ES,
  getSkillModifier,
  getSaveModifier,
  SAVING_THROWS,
  isMulticlassed,
  getClassDisplay,
  CLASS_RESOURCES,
  getResourceMax,
  PREPARED_CASTERS,
  getPreparedSpellCount,
  getSubclassLevel,
} from '../lib/characterModel.js';
import {
  generatePlayGuide,
  generateCombatGuide,
  generateEquipmentAdvice,
  generateSocialGuidance,
} from '../lib/tacticsHelpers.js';
import { races, classes, subclasses, equipment, quickPurchases, feats, conditions as srdConditions, languages as srdLanguages, RACIAL_FEATURES_BY_RACE } from '../data/srd.js';
import { useTheme } from '../lib/ThemeContext.jsx';
import { spells } from '../data/srdSpells.js';
import { calculateEquipmentImpact, getEquipmentById, calculateTotalAC, getCarryingCapacity, getEquipmentWeight } from '../lib/equipmentHelpers.js';
import { useCharacterSheet } from '../hooks/useCharacterSheet.js';
import { useCharacterContext } from '../lib/CharacterContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import DiceRoller from './DiceRoller.jsx';
import ShortRestModal from './character-sheet/ShortRestModal.jsx';
import InitiativeTracker from './character-sheet/InitiativeTracker.jsx';
import LevelUpModal from './character-sheet/LevelUpModal.jsx';

const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const RESOURCE_KEYS = {
  rage: 'sheet.resourceRage',
  inspiration: 'sheet.resourceInspiration',
  channelDivinity: 'sheet.resourceChannelDivinity',
  wildShape: 'sheet.resourceWildShape',
  actionSurge: 'sheet.resourceActionSurge',
  ki: 'sheet.resourceKi',
  layOnHands: 'sheet.resourceLayOnHands',
  sorceryPoints: 'sheet.resourceSorceryPoints',
};
const TABS = ['resumen', 'combate', 'hechizos', 'social', 'equipo', 'tacticas'];
const TAB_KEYS = {
  resumen: 'sheet.tabResumen',
  combate: 'sheet.tabCombate',
  hechizos: 'sheet.tabHechizos',
  social: 'sheet.tabSocial',
  equipo: 'sheet.tabEquipo',
  tacticas: 'sheet.tabTacticas',
};

export default function CharacterSheet({ onBack, onDeleteCharacter }) {
  const { character, onUpdate } = useCharacterContext();
  const { t, locale } = useI18n();
  const getSpellDisplayName = (spell) => (locale === 'en' && spell?.nameEn ? spell.nameEn : (spell?.name ?? ''));
  const [activeTab, setActiveTab] = useState('resumen');
  const [editingBasics, setEditingBasics] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [editingSpells, setEditingSpells] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(false);
  const [spellsKnownEdit, setSpellsKnownEdit] = useState([]);
  const [spellsPreparedEdit, setSpellsPreparedEdit] = useState([]);
  const [equipmentEdit, setEquipmentEdit] = useState([]);
  const [showCustomEquipForm, setShowCustomEquipForm] = useState(false);
  const [customEquipForm, setCustomEquipForm] = useState({ name: '', description: '', category: 'Equipo' });
  const [showShortRestModal, setShowShortRestModal] = useState(false);
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false);
  const [showInitiativeTracker, setShowInitiativeTracker] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [newSessionNote, setNewSessionNote] = useState('');
  const [showSessionNotes, setShowSessionNotes] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [spellSearch, setSpellSearch] = useState('');
  const [spellFilterSchool, setSpellFilterSchool] = useState('');
  const [spellFilterConcentration, setSpellFilterConcentration] = useState('');
  const [spellFilterRitual, setSpellFilterRitual] = useState('');
  const [spellFilterLevel, setSpellFilterLevel] = useState('');
  const [showCustomSpellForm, setShowCustomSpellForm] = useState(false);
  const [customSpellForm, setCustomSpellForm] = useState({ name: '', level: 0, description: '', school: '' });
  const [customSpellEditId, setCustomSpellEditId] = useState(null);
  const [spellToDeleteId, setSpellToDeleteId] = useState(null);
  const [showConcentrationConfirm, setShowConcentrationConfirm] = useState(false);
  const [concentrationSwitchSpell, setConcentrationSwitchSpell] = useState(null);
  const [expandedSpellIds, setExpandedSpellIds] = useState({});
  const [editingAttributes, setEditingAttributes] = useState(false);
  const [attributesEdit, setAttributesEdit] = useState({});
  const [equipmentSearch, setEquipmentSearch] = useState('');
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

  const {
    update,
    maxHP,
    currentHP,
    inspiration,
    inspirationMax,
    gold,
    spellSlotsMax,
    levelKeys,
    setCurrentHP,
    setInspiration,
    setGold,
    setSpellSlot,
    resetLongRest,
  } = useCharacterSheet(character, onUpdate);

  if (!character) return null;

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
    <div className={`min-h-screen p-4 transition-colors ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100' 
        : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    }`}>
      <div className="max-w-md mx-auto">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t('sheet.themeDark') : t('sheet.themeLight')}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'light' 
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={theme === 'light' ? t('sheet.themeDark') : t('sheet.themeLight')}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {onBack && (
            <button
              type="button"
              onClick={handleBackClick}
              className="text-purple-300 hover:text-white text-sm font-medium"
            >
              ← Volver a la lista
            </button>
          )}
          <button
            type="button"
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
            {editingBasics ? t('sheet.closeEdit') : t('sheet.editBasics')}
          </button>
          {(character.level ?? 1) < 20 && (character.class || (character.classes?.length ?? 0) > 0) && (
            <button
              type="button"
              onClick={() => setShowLevelUpModal(true)}
              className="text-green-400 hover:text-green-300 text-sm font-medium"
            >
              {t('sheet.levelUp')}
            </button>
          )}
          {onDeleteCharacter && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              {t('sheet.deleteCharacter')}
            </button>
          )}
        </div>

        {editingBasics && (
          <div className="bg-slate-800 rounded-xl p-4 shadow-2xl text-white mb-6">
            <h2 className="text-lg font-bold text-purple-400 mb-4">{t('sheet.editBasicsTitle')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('sheet.nameLabel')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('sheet.race')}</label>
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
                <label className="block text-sm text-gray-400 mb-1">{t('sheet.class')}</label>
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
                <label className="block text-sm text-gray-400 mb-1">{editForm.class === 'Wizard' ? t('sheet.subclassLabelWizard') : editForm.class === 'Fighter' ? t('sheet.subclassLabelFighter') : t('sheet.subclassOptional')}</label>
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
                <label className="block text-sm text-gray-400 mb-1">{t('sheet.levelLabel')}</label>
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
                <label className="block text-sm text-gray-400 mb-1">{t('sheet.backgroundOptional')}</label>
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
                  {t('sheet.save')}
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
          <div className="flex items-center gap-4">
            {/* Portrait */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-white/30 overflow-hidden flex items-center justify-center">
                {character.portraitUrl ? (
                  <img
                    src={character.portraitUrl}
                    alt={character.name || 'Retrato'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-white/50">👤</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-500 hover:bg-purple-400 rounded-full cursor-pointer flex items-center justify-center text-white text-sm shadow-lg" aria-label="Cambiar retrato">
                📷
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const MAX_PORTRAIT_KB = 500;
                      if (file.size > MAX_PORTRAIT_KB * 1024) {
                        alert(`La imagen es muy grande (${Math.round(file.size / 1024)} KB). Usa una imagen de menos de ${MAX_PORTRAIT_KB} KB para evitar problemas de almacenamiento.`);
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = reader.result;
                        if (result && typeof result === 'string' && result.length > MAX_PORTRAIT_KB * 1024) {
                          alert(`La imagen convertida es muy grande. Usa una imagen más pequeña.`);
                          return;
                        }
                        update({ portraitUrl: result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{character.name || 'Sin nombre'}</h1>
              <p className="text-sm text-purple-100">
                {character.class} {character.race} • Nivel {character.level ?? 1}
              </p>
              {(character.subclass || character.background) && (
                <p className="text-xs text-purple-200">
                  {[character.subclass, character.background].filter(Boolean).join(' • ')}
                </p>
              )}
              {!character.subclass && character.class && (subclasses || []).filter((s) => s.classId === character.class).length > 0 && (character.level ?? 1) >= (getSubclassLevel(character.class) ?? 0) && (
                <p className="text-xs text-amber-200/90 mt-1">
                  {t('sheet.subclassHint')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">HP</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={currentHP}
                onChange={(e) => {
                  const newHP = parseInt(e.target.value, 10) || 0;
                  setCurrentHP(newHP);
                  // Reset death saves when HP goes above 0
                  if (newHP > 0 && (character.deathSaves?.success > 0 || character.deathSaves?.failure > 0)) {
                    update({ deathSaves: { success: 0, failure: 0 } });
                  }
                }}
                className="min-w-[4rem] w-16 text-3xl font-bold bg-transparent border-b-2 border-white"
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
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">{t('sheet.resourceInspiration')}</div>
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

        {/* Death Saves - shown when HP is 0 */}
        {currentHP === 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-600 rounded-xl p-4 text-white mb-6">
            <div className="text-center mb-3">
              <span className="text-lg font-bold text-red-400">Salvaciones de Muerte</span>
              {(character.deathSaves?.failure ?? 0) >= 3 && (
                <p className="text-red-500 font-bold mt-1">MUERTO</p>
              )}
              {(character.deathSaves?.success ?? 0) >= 3 && (character.deathSaves?.failure ?? 0) < 3 && (
                <p className="text-green-400 font-bold mt-1">ESTABILIZADO</p>
              )}
            </div>
            <div className="flex justify-around">
              {/* Successes */}
              <div className="text-center">
                <p className="text-xs text-green-400 mb-2">Éxitos</p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      const current = character.deathSaves?.success ?? 0;
                      if (current > 0) {
                        update({ deathSaves: { ...character.deathSaves, success: current - 1 } });
                      }
                    }}
                    className="text-lg font-bold text-green-400 w-6 h-6 rounded-full border border-green-400 flex items-center justify-center"
                    disabled={(character.deathSaves?.success ?? 0) <= 0}
                  >
                    −
                  </button>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`w-5 h-5 rounded-full border-2 ${
                          (character.deathSaves?.success ?? 0) >= n
                            ? 'bg-green-500 border-green-500'
                            : 'border-green-400'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const current = character.deathSaves?.success ?? 0;
                      if (current < 3) {
                        const newSuccess = current + 1;
                        update({ deathSaves: { ...character.deathSaves, success: newSuccess } });
                        // Stabilize at 3 successes
                        if (newSuccess >= 3) {
                          update({ currentHP: 1, deathSaves: { success: 0, failure: 0 } });
                        }
                      }
                    }}
                    className="text-lg font-bold text-green-400 w-6 h-6 rounded-full border border-green-400 flex items-center justify-center"
                    disabled={(character.deathSaves?.success ?? 0) >= 3 || (character.deathSaves?.failure ?? 0) >= 3}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Failures */}
              <div className="text-center">
                <p className="text-xs text-red-400 mb-2">Fallos</p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      const current = character.deathSaves?.failure ?? 0;
                      if (current > 0) {
                        update({ deathSaves: { ...character.deathSaves, failure: current - 1 } });
                      }
                    }}
                    className="text-lg font-bold text-red-400 w-6 h-6 rounded-full border border-red-400 flex items-center justify-center"
                    disabled={(character.deathSaves?.failure ?? 0) <= 0}
                  >
                    −
                  </button>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`w-5 h-5 rounded-full border-2 ${
                          (character.deathSaves?.failure ?? 0) >= n
                            ? 'bg-red-500 border-red-500'
                            : 'border-red-400'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const current = character.deathSaves?.failure ?? 0;
                      if (current < 3) {
                        update({ deathSaves: { ...character.deathSaves, failure: current + 1 } });
                      }
                    }}
                    className="text-lg font-bold text-red-400 w-6 h-6 rounded-full border border-red-400 flex items-center justify-center"
                    disabled={(character.deathSaves?.failure ?? 0) >= 3}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              3 éxitos = estabilizado (1 HP) • 3 fallos = muerto
            </p>
          </div>
        )}

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
              {t(TAB_KEYS[tab])}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 shadow-2xl text-white mb-6">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-400">{t('sheet.attributes')}</h2>
                  {!editingAttributes ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributesEdit({ ...(character.abilityScores ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }) });
                        setEditingAttributes(true);
                      }}
                      className="text-sm text-purple-300 hover:text-purple-200"
                    >
                      {t('sheet.editAttributes')}
                    </button>
                  ) : null}
                </div>
                {editingAttributes ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(ABILITY_LABELS).map(([key, label]) => (
                        <div key={key} className="bg-slate-700 rounded-lg p-3">
                          <label className="block text-xs text-gray-400 mb-1">{label}</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={attributesEdit[key] ?? character.abilityScores?.[key] ?? 10}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              if (e.target.value === '') setAttributesEdit((prev) => ({ ...prev, [key]: '' }));
                              else if (!Number.isNaN(v)) setAttributesEdit((prev) => ({ ...prev, [key]: Math.min(30, Math.max(1, v)) }));
                            }}
                            onBlur={(e) => {
                              const v = parseInt(e.target.value, 10);
                              if (e.target.value === '' || Number.isNaN(v)) setAttributesEdit((prev) => ({ ...prev, [key]: character.abilityScores?.[key] ?? 10 }));
                              else setAttributesEdit((prev) => ({ ...prev, [key]: Math.min(30, Math.max(1, v)) }));
                            }}
                            className="w-full bg-slate-600 text-white rounded px-2 py-1 text-center"
                          />
                          <div className="text-xs text-purple-300 mt-1">
                            {t('sheet.attributeModifier')} {(() => { const val = Number(attributesEdit[key]); const n = !Number.isNaN(val) ? Math.min(30, Math.max(1, val)) : (character.abilityScores?.[key] ?? 10); const m = getAbilityModifier(n); return (m >= 0 ? '+' : '') + m; })()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...(character.abilityScores ?? {}) };
                          for (const k of Object.keys(ABILITY_LABELS)) {
                            const v = Number(attributesEdit[k]);
                            if (!Number.isNaN(v)) next[k] = Math.min(30, Math.max(1, v));
                          }
                          update({ abilityScores: next });
                          setEditingAttributes(false);
                          setAttributesEdit({});
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded text-sm"
                      >
                        {t('sheet.save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingAttributes(false); setAttributesEdit({}); }}
                        className="bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded text-sm"
                      >
                        {t('general.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(ABILITY_LABELS).map(([key, label]) => {
                      const score = character.abilityScores?.[key] ?? 10;
                      const mod = getAbilityModifier(score);
                      return (
                        <div key={key} className="bg-slate-700 rounded-lg p-3 text-center">
                          <div className="text-3xl font-bold text-purple-300">{mod >= 0 ? '+' : ''}{mod}</div>
                          <div className="text-xs mt-1 text-gray-300">
                            {label} {score}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Saving Throws */}
              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">{t('sheet.savingThrows')}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {SAVING_THROWS.map((save) => {
                    const mod = getSaveModifier(character, save);
                    const isProficient = character.proficiencies?.saves?.includes(save);
                    return (
                      <div
                        key={save}
                        className={`bg-slate-700 rounded-lg p-2 text-center ${isProficient ? 'ring-2 ring-green-500' : ''}`}
                      >
                        <div className="text-lg font-bold text-white">{mod >= 0 ? '+' : ''}{mod}</div>
                        <div className="text-xs text-gray-400">{ABILITY_LABELS[save]}</div>
                        {isProficient && <div className="text-xs text-green-400">●</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">{t('sheet.skills')}</h2>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {Object.entries(SKILLS).map(([skillName, ability]) => {
                    const mod = getSkillModifier(character, skillName);
                    const isProficient = character.proficiencies?.skills?.includes(skillName);
                    return (
                      <div
                        key={skillName}
                        className={`flex items-center justify-between bg-slate-700 rounded px-2 py-1 ${isProficient ? 'bg-green-900/30' : ''}`}
                      >
                        <span className="text-gray-300">
                          {isProficient && <span className="text-green-400 mr-1">●</span>}
                          {SKILL_NAMES_ES[skillName] || skillName}
                          <span className="text-gray-500 text-xs ml-1">({ABILITY_LABELS[ability]})</span>
                        </span>
                        <span className={`font-bold ${isProficient ? 'text-green-400' : 'text-white'}`}>
                          {mod >= 0 ? '+' : ''}{mod}
                        </span>
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
                  <h2 className="text-xl font-bold text-purple-400 mb-3">{t('sheet.background')}</h2>
                  <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300">
                    {character.background}
                  </div>
                </div>
              )}

              {/* Feats Section */}
              {(character.feats ?? []).length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-amber-400 mb-3">Dotes</h2>
                  <div className="space-y-2">
                    {(character.feats ?? []).map((featId) => {
                      const feat = feats.find((f) => f.id === featId);
                      if (!feat) return null;
                      return (
                        <div key={featId} className="bg-slate-700 rounded-lg p-3">
                          <p className="font-bold text-amber-300">{feat.name}</p>
                          <p className="text-sm text-gray-300">{feat.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Languages Section */}
              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">Idiomas</h2>
                <div className="flex flex-wrap gap-2">
                  {(character.languages ?? ['common']).map((langId) => {
                    const lang = srdLanguages.find((l) => l.id === langId);
                    return (
                      <span key={langId} className="bg-slate-700 px-3 py-1 rounded-full text-sm text-gray-300">
                        {lang?.name || langId}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Session Notes Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-cyan-400">Notas de Sesión</h2>
                  <button
                    onClick={() => setShowSessionNotes(!showSessionNotes)}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    {showSessionNotes ? 'Ocultar' : `Mostrar (${(character.sessionNotes ?? []).length})`}
                  </button>
                </div>
                
                {/* Add new note */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSessionNote}
                    onChange={(e) => setNewSessionNote(e.target.value)}
                    placeholder="Añadir nota de sesión..."
                    className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSessionNote.trim()) {
                        const note = {
                          id: Date.now(),
                          text: newSessionNote.trim(),
                          timestamp: new Date().toISOString(),
                        };
                        update({ sessionNotes: [note, ...(character.sessionNotes ?? [])] });
                        setNewSessionNote('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newSessionNote.trim()) {
                        const note = {
                          id: Date.now(),
                          text: newSessionNote.trim(),
                          timestamp: new Date().toISOString(),
                        };
                        update({ sessionNotes: [note, ...(character.sessionNotes ?? [])] });
                        setNewSessionNote('');
                      }
                    }}
                    disabled={!newSessionNote.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Notes list */}
                {showSessionNotes && (character.sessionNotes ?? []).length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(character.sessionNotes ?? []).map((note) => (
                      <div key={note.id} className="bg-slate-700 rounded-lg p-3 relative group">
                        <p className="text-sm text-gray-300 pr-6">{note.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.timestamp).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <button
                          onClick={() => {
                            update({
                              sessionNotes: (character.sessionNotes ?? []).filter((n) => n.id !== note.id),
                            });
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showSessionNotes && (character.sessionNotes ?? []).length === 0 && (
                  <p className="text-sm text-gray-500">Sin notas de sesión. Añade la primera arriba.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'combate' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">{t('sheet.combat')}</h2>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 uppercase">{t('sheet.initiative')}</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {(() => {
                        const dexMod = getAbilityModifier(character.abilityScores?.dex ?? 10);
                        const initBonus = character.initiativeBonus ?? 0;
                        const total = dexMod + initBonus;
                        return `${total >= 0 ? '+' : ''}${total}`;
                      })()}
                    </div>
                    <button
                      onClick={() => setShowInitiativeTracker(true)}
                      className="mt-1 text-xs text-amber-400 hover:text-amber-300"
                    >
                      {t('sheet.initiativeOrder')}
                    </button>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 uppercase">{t('sheet.speed')}</div>
                    <div className="text-2xl font-bold text-green-400">{t('sheet.speedFeet').replace('{{value}}', String(character.speed ?? 30))}</div>
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300">
                  AC {character.AC ?? 10} • HP {currentHP}/{maxHP}
                  {character.spellDC != null && ` • CD conjuros ${character.spellDC}`}
                </div>
              </div>

              {/* Action Economy */}
              <div>
                <h2 className="text-xl font-bold text-emerald-400 mb-3">{t('sheet.actionEconomy')}</h2>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={character.actionUsed?.action ?? false}
                      onChange={(e) => update({
                        actionUsed: { ...character.actionUsed, action: e.target.checked },
                      })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{t('sheet.action')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={character.actionUsed?.bonusAction ?? false}
                      onChange={(e) => update({
                        actionUsed: { ...character.actionUsed, bonusAction: e.target.checked },
                      })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{t('sheet.bonusAction')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={character.actionUsed?.reaction ?? false}
                      onChange={(e) => update({
                        actionUsed: { ...character.actionUsed, reaction: e.target.checked },
                      })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{t('sheet.reaction')}</span>
                  </label>
                </div>
              </div>

              {/* Concentration */}
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-3">{t('sheet.concentration')}</h2>
                {character.concentratingOn ? (
                  <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-cyan-300">
                        {spells.find((s) => s.id === character.concentratingOn)?.name ?? character.concentratingOn}
                      </p>
                      <p className="text-xs text-gray-400">{t('sheet.concentratingOn')}</p>
                    </div>
                    <button
                      onClick={() => update({ concentratingOn: null })}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      {t('sheet.breakConcentration')}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t('sheet.notConcentrating')}</p>
                )}
              </div>

              {/* Racial feature uses (e.g. Tiefling Thaumaturgy) */}
              {RACIAL_FEATURES_BY_RACE[character.race]?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-amber-400 mb-3">{t('sheet.racialTraits')}</h2>
                  <div className="space-y-2">
                    {RACIAL_FEATURES_BY_RACE[character.race].map((feat) => {
                      const max = feat.usesPerLongRest ?? 0;
                      const remaining = character.featureUses?.[feat.id] ?? max;
                      if (max <= 0) return null;
                      return (
                        <div key={feat.id} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                          <span className="font-medium text-amber-300">{feat.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => update({
                                featureUses: { ...character.featureUses, [feat.id]: Math.min(max, remaining + 1) },
                              })}
                              disabled={remaining >= max}
                              className="w-8 h-8 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-xl font-bold"
                            >
                              +
                            </button>
                            <span className="text-xl font-bold w-12 text-center">{remaining}/{max}</span>
                            <button
                              onClick={() => update({
                                featureUses: { ...character.featureUses, [feat.id]: Math.max(0, remaining - 1) },
                              })}
                              disabled={remaining <= 0}
                              className="w-8 h-8 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-xl font-bold"
                            >
                              −
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Class Resources */}
              {CLASS_RESOURCES[character.class] && Object.keys(CLASS_RESOURCES[character.class]).length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-orange-400 mb-3">Recursos</h2>
                  <div className="space-y-2">
                    {Object.entries(CLASS_RESOURCES[character.class]).filter(([, def]) => def).map(([resId]) => {
                      const maxVal = getResourceMax(character.class, resId, character);
                      if (maxVal <= 0) return null;
                      const stored = character.resources?.[resId];
                      const current = stored?.current ?? maxVal;
                      const max = stored?.max ?? maxVal;
                      const label = RESOURCE_KEYS[resId] ? t(RESOURCE_KEYS[resId]) : resId;
                      return (
                        <div key={resId} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                          <span className="font-medium text-orange-300">{label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => update({
                                resources: {
                                  ...character.resources,
                                  [resId]: { current: Math.max(0, current - 1), max },
                                },
                              })}
                              disabled={current <= 0}
                              className="w-8 h-8 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-xl font-bold"
                            >
                              −
                            </button>
                            <span className="text-xl font-bold w-12 text-center">{current}/{max}</span>
                            <button
                              onClick={() => update({
                                resources: {
                                  ...character.resources,
                                  [resId]: { current: Math.min(max, current + 1), max },
                                },
                              })}
                              disabled={current >= max}
                              className="w-8 h-8 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-xl font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">Condiciones</h2>
                {(character.conditions ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(character.conditions ?? []).map((condId) => {
                      const cond = srdConditions.find((c) => c.id === condId);
                      if (!cond) return null;
                      return (
                        <div key={condId} className="bg-red-900/50 border border-red-600 rounded-lg px-3 py-1 flex items-center gap-2">
                          <span className="text-sm text-red-300">{cond.name}</span>
                          <button
                            onClick={() => update({ conditions: (character.conditions ?? []).filter((c) => c !== condId) })}
                            className="text-red-400 hover:text-red-300 text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !(character.conditions ?? []).includes(e.target.value)) {
                      update({ conditions: [...(character.conditions ?? []), e.target.value] });
                    }
                    e.target.value = '';
                  }}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                >
                  <option value="">+ Añadir condición...</option>
                  {srdConditions.filter((c) => !(character.conditions ?? []).includes(c.id)).map((cond) => (
                    <option key={cond.id} value={cond.id}>{cond.name}</option>
                  ))}
                </select>
                {(character.conditions ?? []).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {(character.conditions ?? []).map((condId) => {
                      const cond = srdConditions.find((c) => c.id === condId);
                      if (!cond) return null;
                      return (
                        <div key={condId} className="bg-slate-700 rounded-lg p-2 text-sm">
                          <p className="font-bold text-red-300">{cond.name}</p>
                          <ul className="text-gray-400 text-xs list-disc list-inside">
                            {cond.effects.map((effect, i) => (
                              <li key={i}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {(() => {
                const combatGuide = generateCombatGuide(character);
                if (!combatGuide.rotation.length && !combatGuide.combos.length) return null;
                return (
                  <>
                    {combatGuide.rotation.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-red-400 mb-3">{t('sheet.combatTactics')}</h2>
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
                  <h2 className="text-xl font-bold text-purple-400 mb-3">{t('sheet.bardicInspiration')}</h2>
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
              <h2 className="text-xl font-bold text-purple-400 mb-2">
                {PREPARED_CASTERS.includes(character.class) ? t('sheet.spells.prepared') : t('sheet.spells.known')}
              </h2>
              {!editingSpells ? (
                <>
                  {/* Spell Search */}
                  <div className="space-y-2 mb-3">
                    <input
                      type="text"
                      value={spellSearch}
                      onChange={(e) => setSpellSearch(e.target.value)}
                      placeholder={t('sheet.spells.searchPlaceholder')}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={spellFilterSchool}
                        onChange={(e) => setSpellFilterSchool(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.school')}</option>
                        {[...new Set(spells.map((s) => s.school).filter(Boolean))].sort().map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        value={spellFilterConcentration}
                        onChange={(e) => setSpellFilterConcentration(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.concentration')}</option>
                        <option value="yes">{t('sheet.spells.filterYes')}</option>
                        <option value="no">{t('sheet.spells.filterNo')}</option>
                      </select>
                      <select
                        value={spellFilterRitual}
                        onChange={(e) => setSpellFilterRitual(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.ritual')}</option>
                        <option value="yes">{t('sheet.spells.filterYes')}</option>
                        <option value="no">{t('sheet.spells.filterNo')}</option>
                      </select>
                      <select
                        value={spellFilterLevel}
                        onChange={(e) => setSpellFilterLevel(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.level')}</option>
                        <option value="0">{t('sheet.spells.cantrip')}</option>
                        {[1,2,3,4,5,6,7,8,9].map((l) => (
                          <option key={l} value={l}>{t('sheet.spells.levelN').replace('{{n}}', String(l))}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {(() => {
                    const getSpellById = (id) => {
                      const custom = (character.customSpells ?? []).find((s) => s.id === id);
                      if (custom) return custom;
                      return spells.find((sp) => sp.id === id);
                    };
                    const isPrepared = PREPARED_CASTERS.includes(character.class);
                    const cantripIds = (character.spellsKnown ?? []).filter((id) => {
                      const s = getSpellById(id);
                      return s && s.level === 0;
                    });
                    const leveledSpellIds = isPrepared
                      ? (character.spellsPrepared ?? [])
                      : (character.spellsKnown ?? []).filter((id) => {
                          const s = getSpellById(id);
                          return s && s.level > 0;
                        });
                    const allSpellIds = [...cantripIds, ...leveledSpellIds];
                    if (allSpellIds.length === 0) {
                      return <p className="text-sm text-gray-400">{t('sheet.spells.noSpellsAdded')}</p>;
                    }
                    return (() => {
                      const knownSpells = allSpellIds
                        .map((id) => getSpellById(id))
                        .filter(Boolean)
                        .filter((spell) => {
                          if (spellSearch.trim() && !(getSpellDisplayName(spell) || spell.name || '').toLowerCase().includes(spellSearch.toLowerCase()) &&
                              !(spell.school && spell.school.toLowerCase().includes(spellSearch.toLowerCase())) &&
                              !(spell.description && spell.description.toLowerCase().includes(spellSearch.toLowerCase()))) return false;
                          if (spellFilterSchool && spell.school !== spellFilterSchool) return false;
                          const isConc = spell.duration && (spell.duration.includes('Concentración') || spell.duration.includes('Concentration'));
                          if (spellFilterConcentration === 'yes' && !isConc) return false;
                          if (spellFilterConcentration === 'no' && isConc) return false;
                          const isRitual = spell.ritual === true || (spell.castingTime && spell.castingTime.toLowerCase().includes('ritual'));
                          if (spellFilterRitual === 'yes' && !isRitual) return false;
                          if (spellFilterRitual === 'no' && isRitual) return false;
                          if (spellFilterLevel !== '' && spell.level !== Number(spellFilterLevel)) return false;
                          return true;
                        });
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
                              ? t('sheet.spells.slotsUnlimited')
                              : t('sheet.spells.slotsLine').replace('{{current}}', String(character.spellSlots?.[String(lev)] ?? 0)).replace('{{max}}', String(spellSlotsMax[lev] ?? 0));
                            return (
                              <div key={lev}>
                                <h3 className="text-sm font-bold text-yellow-400 mb-2">
                                  {lev === 0 ? t('sheet.spells.cantrip') : t('sheet.spells.levelN').replace('{{n}}', String(lev))}{slotLine}
                                </h3>
                                <div className="space-y-2">
                                  {list.map((spell) => {
                                    const isConcentration = spell.duration && (spell.duration.includes('Concentración') || spell.duration.includes('Concentration'));
                                    const isCurrentlyConcentrating = character.concentratingOn === spell.id;
                                    const isCustomSpell = (character.customSpells ?? []).some((s) => s.id === spell.id);
                                    const currentSlotsForLevel = spell.level > 0 ? (character.spellSlots?.[String(spell.level)] ?? 0) : null;
                                    const canUseSlot = spell.level > 0 && currentSlotsForLevel > 0;
                                    const castingLine = [spell.castingTime, spell.range, spell.components].filter(Boolean).join(' · ');
                                    const hasDetails = spell.description || spell.hint || (spell.scalesWithSlot && spell.upcastEffect) || spell.tacticalUse;
                                    const isExpanded = expandedSpellIds[spell.id];
                                    return (
                                      <div key={spell.id} className="bg-slate-700 rounded-lg p-3">
                                        <div className="flex justify-between items-start gap-2">
                                          <p className="font-bold text-white">
                                            {getSpellDisplayName(spell)}
                                            {isConcentration && (
                                              <span className="ml-2 text-cyan-400 text-xs font-normal">(C)</span>
                                            )}
                                          </p>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {spell.level > 0 && (
                                              <button
                                                type="button"
                                                onClick={() => setSpellSlot(spell.level, Math.max(0, currentSlotsForLevel - 1))}
                                                disabled={!canUseSlot}
                                                className="text-xs px-2 py-1 rounded bg-slate-600 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                                              >
                                                {t('sheet.spells.useSlot')}
                                              </button>
                                            )}
                                            {isConcentration && (
                                              <button
                                                onClick={() => {
                                                  if (character.concentratingOn && character.concentratingOn !== spell.id) {
                                                    setConcentrationSwitchSpell(spell.id);
                                                    setShowConcentrationConfirm(true);
                                                  } else if (!isCurrentlyConcentrating) {
                                                    update({ concentratingOn: spell.id });
                                                  } else {
                                                    update({ concentratingOn: null });
                                                  }
                                                }}
                                                className={`text-xs px-2 py-1 rounded ${isCurrentlyConcentrating ? 'bg-cyan-600 text-white' : 'bg-slate-600 hover:bg-cyan-600 text-gray-300'}`}
                                              >
                                                {isCurrentlyConcentrating ? t('sheet.spells.concentrating') : t('sheet.spells.concentrate')}
                                              </button>
                                            )}
                                            {isCustomSpell && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setCustomSpellEditId(spell.id);
                                                    setCustomSpellForm({ name: spell.name, level: spell.level, description: spell.description || '', school: spell.school || '' });
                                                    setShowCustomSpellForm(true);
                                                  }}
                                                  className="text-xs px-2 py-1 rounded bg-slate-600 hover:bg-cyan-600 text-gray-300"
                                                >
                                                  {t('sheet.spells.editCustom')}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setSpellToDeleteId(spell.id)}
                                                  className="text-xs px-2 py-1 rounded bg-slate-600 hover:bg-red-600 text-gray-300"
                                                >
                                                  {t('sheet.spells.removeCustom')}
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        {castingLine && (
                                          <p className="text-xs text-gray-500 mt-0.5">{castingLine}</p>
                                        )}
                                        {hasDetails && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => setExpandedSpellIds((prev) => ({ ...prev, [spell.id]: !prev[spell.id] }))}
                                              className="text-xs text-purple-300 hover:text-purple-200 mt-1"
                                            >
                                              {isExpanded ? t('sheet.spells.less') : t('sheet.spells.more')}
                                            </button>
                                            {isExpanded && (
                                              <div className="mt-2 space-y-1">
                                                {spell.school && (
                                                  <p className="text-xs text-purple-300">{spell.school}</p>
                                                )}
                                                {spell.description && (
                                                  <p className="text-xs text-gray-400">{spell.description}</p>
                                                )}
                                                {spell.hint && (
                                                  <p className="text-xs text-amber-400">{spell.hint}</p>
                                                )}
                                                {spell.scalesWithSlot && spell.upcastEffect && (
                                                  <p className="text-xs text-emerald-400">
                                                    <span className="font-semibold">{t('sheet.spells.upcast')}</span> {spell.upcastEffect}
                                                  </p>
                                                )}
                                                {spell.tacticalUse && (
                                                  <p className="text-xs text-amber-300 italic">
                                                    <span className="font-semibold">{t('sheet.spells.tactic')}</span> {spell.tacticalUse}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {!hasDetails && (
                                          <p className="text-xs text-gray-400 mt-0.5">
                                            {spell.school && <span className="text-purple-300">{spell.school}</span>}
                                            {spell.school && ' · '}
                                            {spell.description}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  })()}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (PREPARED_CASTERS.includes(character.class)) {
                          setSpellsPreparedEdit([...(character.spellsPrepared ?? [])]);
                        } else {
                          setSpellsKnownEdit([...(character.spellsKnown ?? [])]);
                        }
                        setEditingSpells(true);
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {PREPARED_CASTERS.includes(character.class) ? t('sheet.spells.prepareSpells') : t('sheet.spells.editSpells')}
                    </button>
                    <button
                      onClick={() => { setCustomSpellEditId(null); setCustomSpellForm({ name: '', level: 0, description: '', school: '' }); setShowCustomSpellForm(true); }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
                    >
                      + {t('sheet.spells.addCustom')}
                    </button>
                  </div>
                  {showCustomSpellForm && (
                    <div className="mt-3 bg-slate-700 rounded-lg p-4 space-y-3">
                      <h3 className="font-bold text-cyan-400">{customSpellEditId ? t('sheet.spells.editCustom') : t('sheet.spells.addCustomTitle')}</h3>
                      <input
                        type="text"
                        placeholder={t('sheet.spells.namePlaceholder')}
                        value={customSpellForm.name}
                        onChange={(e) => setCustomSpellForm({ ...customSpellForm, name: e.target.value })}
                        className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm"
                      />
                      <select
                        value={customSpellForm.level}
                        onChange={(e) => setCustomSpellForm({ ...customSpellForm, level: Number(e.target.value) })}
                        className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm"
                      >
                        {[0,1,2,3,4,5,6,7,8,9].map((l) => (
                          <option key={l} value={l}>{l === 0 ? t('sheet.spells.cantrip') : t('sheet.spells.levelN').replace('{{n}}', String(l))}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder={t('sheet.spells.schoolOptional')}
                        value={customSpellForm.school}
                        onChange={(e) => setCustomSpellForm({ ...customSpellForm, school: e.target.value })}
                        className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm"
                      />
                      <textarea
                        placeholder={t('sheet.spells.descriptionPlaceholder')}
                        value={customSpellForm.description}
                        onChange={(e) => setCustomSpellForm({ ...customSpellForm, description: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (customSpellEditId) {
                              const updated = { id: customSpellEditId, name: customSpellForm.name, level: customSpellForm.level, school: customSpellForm.school || undefined, description: customSpellForm.description };
                              const nextCustom = (character.customSpells ?? []).map((s) => (s.id === customSpellEditId ? updated : s));
                              update({ customSpells: nextCustom });
                              setCustomSpellEditId(null);
                            } else {
                              const id = `custom-${Date.now()}`;
                              const newSpell = { id, name: customSpellForm.name, level: customSpellForm.level, school: customSpellForm.school || undefined, description: customSpellForm.description };
                              const isPrepared = PREPARED_CASTERS.includes(character.class);
                              const next = {
                                customSpells: [...(character.customSpells ?? []), newSpell],
                              };
                              if (isPrepared) {
                                next.spellsKnown = customSpellForm.level === 0 ? [...(character.spellsKnown ?? []), id] : character.spellsKnown;
                                next.spellsPrepared = customSpellForm.level > 0 ? [...(character.spellsPrepared ?? []), id] : character.spellsPrepared;
                              } else {
                                next.spellsKnown = [...(character.spellsKnown ?? []), id];
                              }
                              update(next);
                            }
                            setCustomSpellForm({ name: '', level: 0, description: '', school: '' });
                            setShowCustomSpellForm(false);
                          }}
                          disabled={!customSpellForm.name.trim()}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded text-sm"
                        >
                          {customSpellEditId ? t('sheet.save') : t('sheet.spells.add')}
                        </button>
                        <button
                          onClick={() => { setShowCustomSpellForm(false); setCustomSpellForm({ name: '', level: 0, description: '', school: '' }); setCustomSpellEditId(null); }}
                          className="bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded text-sm"
                        >
                          {t('general.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : PREPARED_CASTERS.includes(character.class) ? (
                <div className="space-y-2">
                  <div className="space-y-2 mb-3">
                    <input
                      type="text"
                      value={spellSearch}
                      onChange={(e) => setSpellSearch(e.target.value)}
                      placeholder={t('sheet.spells.searchPlaceholder')}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={spellFilterSchool}
                        onChange={(e) => setSpellFilterSchool(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.school')}</option>
                        {[...new Set([...spells, ...(character.customSpells ?? [])].map((s) => s.school).filter(Boolean))].sort().map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        value={spellFilterConcentration}
                        onChange={(e) => setSpellFilterConcentration(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.concentration')}</option>
                        <option value="yes">{t('sheet.spells.filterYes')}</option>
                        <option value="no">{t('sheet.spells.filterNo')}</option>
                      </select>
                      <select
                        value={spellFilterRitual}
                        onChange={(e) => setSpellFilterRitual(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.ritual')}</option>
                        <option value="yes">{t('sheet.spells.filterYes')}</option>
                        <option value="no">{t('sheet.spells.filterNo')}</option>
                      </select>
                      <select
                        value={spellFilterLevel}
                        onChange={(e) => setSpellFilterLevel(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.level')}</option>
                        <option value="0">{t('sheet.spells.cantrip')}</option>
                        {[1,2,3,4,5,6,7,8,9].map((l) => (
                          <option key={l} value={l}>{t('sheet.spells.levelN').replace('{{n}}', String(l))}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {t('sheet.spells.prepareUpToSelected', { max: getPreparedSpellCount(character), selected: spellsPreparedEdit.length })}
                  </p>
                  {(() => {
                    const applySpellFilter = (spell) => {
                      const name = getSpellDisplayName(spell) || spell.name || '';
                      if (spellSearch.trim() && !name.toLowerCase().includes(spellSearch.toLowerCase()) &&
                          !(spell.school && spell.school.toLowerCase().includes(spellSearch.toLowerCase())) &&
                          !(spell.description && spell.description.toLowerCase().includes(spellSearch.toLowerCase()))) return false;
                      if (spellFilterSchool && spell.school !== spellFilterSchool) return false;
                      const isConc = spell.duration && (spell.duration.includes('Concentración') || spell.duration.includes('Concentration'));
                      if (spellFilterConcentration === 'yes' && !isConc) return false;
                      if (spellFilterConcentration === 'no' && isConc) return false;
                      const isRitual = spell.ritual === true || (spell.castingTime && spell.castingTime.toLowerCase().includes('ritual'));
                      if (spellFilterRitual === 'yes' && !isRitual) return false;
                      if (spellFilterRitual === 'no' && isRitual) return false;
                      if (spellFilterLevel !== '' && spell.level !== Number(spellFilterLevel)) return false;
                      return true;
                    };
                    const srdFiltered = spells.filter((spell) => {
                      if (!spell.classes?.includes(character.class) || spell.level <= 0) return false;
                      if (character.class === 'Wizard' || character.class === 'Paladin') {
                        if (!(character.spellsKnown ?? []).includes(spell.id)) return false;
                      }
                      return applySpellFilter(spell);
                    });
                    const customForPrepare = (character.customSpells ?? []).filter((s) => {
                      if (s.level <= 0) return false;
                      if (character.class === 'Wizard' || character.class === 'Paladin') {
                        if (!(character.spellsKnown ?? []).includes(s.id)) return false;
                      }
                      return applySpellFilter(s);
                    });
                    const allPreparedOptions = [...srdFiltered, ...customForPrepare];
                    const byLevel = {};
                    allPreparedOptions.forEach((spell) => {
                      const lev = spell.level;
                      if (!byLevel[lev]) byLevel[lev] = [];
                      byLevel[lev].push(spell);
                    });
                    const levelsOrdered = [0, ...levelKeys.filter((l) => l > 0)];
                    const preparedCount = getPreparedSpellCount(character);
                    return (
                      <div className="space-y-4">
                        {levelsOrdered.map((lev) => {
                          const list = byLevel[lev] || [];
                          if (list.length === 0) return null;
                          const selectedInLevel = list.filter((s) => spellsPreparedEdit.includes(s.id)).length;
                          return (
                            <div key={lev}>
                              <h3 className="text-sm font-bold text-yellow-400 mb-2">
                                {lev === 0 ? t('sheet.spells.cantrip') : t('sheet.spells.levelN').replace('{{n}}', String(lev))} — {t('sheet.spells.selectedCount', { selected: selectedInLevel, max: list.length })}
                              </h3>
                              <div className="space-y-2">
                                {list.map((spell) => {
                                  const selected = spellsPreparedEdit.includes(spell.id);
                                  const atLimit = spellsPreparedEdit.length >= preparedCount;
                                  const canToggle = selected || !atLimit;
                                  return (
                                    <label key={spell.id} className={`flex items-start gap-2 bg-slate-700 rounded-lg p-3 cursor-pointer ${!canToggle ? 'opacity-60' : ''}`}>
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(e) => {
                                          if (e.target.checked && spellsPreparedEdit.length < preparedCount) {
                                            setSpellsPreparedEdit((prev) => [...prev, spell.id]);
                                          } else if (!e.target.checked) {
                                            setSpellsPreparedEdit((prev) => prev.filter((x) => x !== spell.id));
                                          }
                                        }}
                                        disabled={!canToggle}
                                        className="mt-1"
                                      />
                                      <div>
                                        <p className="font-bold text-white text-sm">{getSpellDisplayName(spell)} <span className="text-purple-400 text-xs">Nv.{spell.level}</span></p>
                                        <p className="text-xs text-gray-400">{spell.description}</p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        update({ spellsPrepared: spellsPreparedEdit });
                        setEditingSpells(false);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t('sheet.save')}
                    </button>
                    <button
                      onClick={() => setEditingSpells(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t('general.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-2 mb-3">
                    <input
                      type="text"
                      value={spellSearch}
                      onChange={(e) => setSpellSearch(e.target.value)}
                      placeholder={t('sheet.spells.searchPlaceholder')}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={spellFilterSchool}
                        onChange={(e) => setSpellFilterSchool(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.school')}</option>
                        {[...new Set([...spells, ...(character.customSpells ?? [])].map((s) => s.school).filter(Boolean))].sort().map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        value={spellFilterConcentration}
                        onChange={(e) => setSpellFilterConcentration(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.concentration')}</option>
                        <option value="yes">{t('sheet.spells.filterYes')}</option>
                        <option value="no">{t('sheet.spells.filterNo')}</option>
                      </select>
                      <select
                        value={spellFilterRitual}
                        onChange={(e) => setSpellFilterRitual(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.ritual')}</option>
                        <option value="yes">{t('sheet.spells.filterYes')}</option>
                        <option value="no">{t('sheet.spells.filterNo')}</option>
                      </select>
                      <select
                        value={spellFilterLevel}
                        onChange={(e) => setSpellFilterLevel(e.target.value)}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="">{t('sheet.spells.level')}</option>
                        <option value="0">{t('sheet.spells.cantrip')}</option>
                        {[1,2,3,4,5,6,7,8,9].map((l) => (
                          <option key={l} value={l}>{t('sheet.spells.levelN').replace('{{n}}', String(l))}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {(() => {
                    const applySpellFilter = (spell) => {
                      const name = getSpellDisplayName(spell) || spell.name || '';
                      if (spellSearch.trim() && !name.toLowerCase().includes(spellSearch.toLowerCase()) &&
                          !(spell.school && spell.school.toLowerCase().includes(spellSearch.toLowerCase())) &&
                          !(spell.description && spell.description.toLowerCase().includes(spellSearch.toLowerCase()))) return false;
                      if (spellFilterSchool && spell.school !== spellFilterSchool) return false;
                      const isConc = spell.duration && (spell.duration.includes('Concentración') || spell.duration.includes('Concentration'));
                      if (spellFilterConcentration === 'yes' && !isConc) return false;
                      if (spellFilterConcentration === 'no' && isConc) return false;
                      const isRitual = spell.ritual === true || (spell.castingTime && spell.castingTime.toLowerCase().includes('ritual'));
                      if (spellFilterRitual === 'yes' && !isRitual) return false;
                      if (spellFilterRitual === 'no' && isRitual) return false;
                      if (spellFilterLevel !== '' && spell.level !== Number(spellFilterLevel)) return false;
                      return true;
                    };
                    const srdForKnown = spells.filter((spell) => spell.classes?.includes(character.class) && applySpellFilter(spell));
                    const customForKnown = (character.customSpells ?? []).filter(applySpellFilter);
                    const allKnownOptions = [...srdForKnown, ...customForKnown];
                    const byLevel = {};
                    allKnownOptions.forEach((spell) => {
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
                          const selectedInLevel = list.filter((s) => spellsKnownEdit.includes(s.id)).length;
                          return (
                            <div key={lev}>
                              <h3 className="text-sm font-bold text-yellow-400 mb-2">
                                {lev === 0 ? t('sheet.spells.cantrip') : t('sheet.spells.levelN').replace('{{n}}', String(lev))} — {t('sheet.spells.selectedCount', { selected: selectedInLevel, max: list.length })}
                              </h3>
                              <div className="space-y-2">
                                {list.map((spell) => (
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
                                      <p className="font-bold text-white text-sm">{getSpellDisplayName(spell)} <span className="text-purple-400 text-xs">{spell.level === 0 ? t('sheet.spells.cantrip') : `Nv.${spell.level}`}</span></p>
                                      <p className="text-xs text-gray-400">{spell.description}</p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        update({ spellsKnown: spellsKnownEdit });
                        setEditingSpells(false);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t('sheet.save')}
                    </button>
                    <button
                      onClick={() => setEditingSpells(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t('general.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (() => {
            const cls = classes.find((c) => c.name === character.class);
            const race = races.find((r) => r.name === character.race);
            return (
              <div className="space-y-6">
                {/* Social Role */}
                {cls?.socialRole && (
                  <div>
                    <h2 className="text-xl font-bold text-purple-400 mb-2">
                      {t('sheet.socialRole')} <span className="text-white">{cls.socialRole}</span>
                    </h2>
                    {cls.socialGuidance && (
                      <p className="text-sm text-gray-300 bg-slate-700 rounded-lg p-3">{cls.socialGuidance}</p>
                    )}
                  </div>
                )}

                {/* Key Social Skills */}
                {cls?.socialSkills?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-purple-300 mb-2">Habilidades clave</h3>
                    <div className="flex flex-wrap gap-2">
                      {cls.socialSkills.map((skill) => (
                        <span key={skill} className="bg-purple-700 text-white text-sm px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Scenarios */}
                {cls?.socialScenarios?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-purple-300 mb-3">Situaciones típicas</h3>
                    <div className="space-y-3">
                      {cls.socialScenarios.map((s) => (
                        <div key={s.situation} className="bg-slate-700 rounded-lg p-3">
                          <p className="font-semibold text-white mb-1">{s.situation}</p>
                          <p className="text-sm text-gray-300">{s.tactic}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Race social notes */}
                {race?.socialNotes && (
                  <div>
                    <h3 className="text-lg font-bold text-purple-300 mb-2">Notas de raza: {race.name}</h3>
                    <p className="text-sm text-gray-300 bg-slate-700 rounded-lg p-3">{race.socialNotes}</p>
                  </div>
                )}

                {/* General social guide from tacticsHelpers */}
                {(() => {
                  const socialGuide = generateSocialGuidance(character);
                  if (!socialGuide) return null;
                  return (
                    <div>
                      <h3 className="text-lg font-bold text-purple-300 mb-2">Guía adicional</h3>
                      <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-line">
                        {socialGuide}
                      </div>
                    </div>
                  );
                })()}

                {/* Player notes */}
                <div>
                  <label className="block text-sm font-bold text-purple-400 mb-2">{t('sheet.socialNotesLabel')}</label>
                  <textarea
                    value={character.socialNotes ?? ''}
                    onChange={(e) => update({ socialNotes: e.target.value })}
                    onBlur={(e) => update({ socialNotes: e.target.value })}
                    placeholder={t('sheet.socialNotesPlaceholder')}
                    className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 min-h-[120px] text-sm"
                  />
                </div>
              </div>
            );
          })()}

          {activeTab === 'equipo' && (
            <div className="space-y-6">
              <div className="bg-slate-700 rounded-lg p-3 text-sm">
                <span className="text-gray-400">Peso: </span>
                <span className={getEquipmentWeight(character) > getCarryingCapacity(character) ? 'text-red-400 font-bold' : 'text-white'}>
                  {getEquipmentWeight(character)} / {getCarryingCapacity(character)} lbs
                </span>
                {getEquipmentWeight(character) > getCarryingCapacity(character) && (
                  <span className="text-red-400 ml-2">(¡Sobrecargado!)</span>
                )}
              </div>
              {(() => {
                const equipAdvice = generateEquipmentAdvice(character);
                if (!equipAdvice) return null;
                return (
                  <div>
                    <h2 className="text-xl font-bold text-green-400 mb-3">{t('sheet.equipmentGuide')}</h2>
                    <div className="bg-slate-700 rounded-lg p-4 text-sm text-gray-300 space-y-2">
                      <p><span className="font-semibold text-green-300">Armas:</span> {equipAdvice.weapons}</p>
                      <p><span className="font-semibold text-green-300">Armadura:</span> {equipAdvice.armor}</p>
                      {equipAdvice.essentials?.length > 0 && (
                        <p><span className="font-semibold text-green-300">Esenciales:</span> {equipAdvice.essentials.join(', ')}</p>
                      )}
                      {equipAdvice.upgrades?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <p className="font-semibold text-amber-400 mb-1">Próximas compras recomendadas:</p>
                          <ul className="list-disc list-inside text-amber-300/80 space-y-1">
                            {equipAdvice.upgrades.map((upgrade, i) => (
                              <li key={i}>{upgrade}</li>
                            ))}
                          </ul>
                        </div>
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
              {/* Equipped Items Section */}
              {(character.equipped?.armor || character.equipped?.mainHand || character.equipped?.offHand) && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-green-400 mb-2">Equipado</h3>
                  <div className="space-y-2">
                    {character.equipped?.armor && (() => {
                      const item = getEquipmentById(character.equipped.armor);
                      if (!item) return null;
                      const impact = calculateEquipmentImpact(character, item);
                      return (
                        <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white">{item.name} <span className="text-green-400 text-xs">(Armadura)</span></p>
                              {impact?.type === 'armor' && (
                                <p className="text-sm text-green-400">AC: {impact.newAC}</p>
                              )}
                            </div>
                            <button
                              onClick={() => update({ equipped: { ...character.equipped, armor: null } })}
                              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                            >
                              Desequipar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                    {character.equipped?.mainHand && (() => {
                      const item = getEquipmentById(character.equipped.mainHand);
                      if (!item) return null;
                      const impact = calculateEquipmentImpact(character, item);
                      return (
                        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white">{item.name} <span className="text-blue-400 text-xs">(Mano principal)</span></p>
                              {impact?.type === 'weapon' && (
                                <p className="text-sm text-blue-400">
                                  +{impact.attackBonus} ataque · {impact.displayDamage} {impact.damageType}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => update({ equipped: { ...character.equipped, mainHand: null } })}
                              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                            >
                              Desequipar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                    {character.equipped?.offHand && (() => {
                      const item = getEquipmentById(character.equipped.offHand);
                      if (!item) return null;
                      const impact = calculateEquipmentImpact(character, item);
                      return (
                        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white">{item.name} <span className="text-purple-400 text-xs">(Mano secundaria)</span></p>
                              {impact?.type === 'shield' && (
                                <p className="text-sm text-purple-400">+{impact.acBonus} AC</p>
                              )}
                              {impact?.type === 'weapon' && (
                                <p className="text-sm text-purple-400">
                                  +{impact.attackBonus} ataque · {impact.displayDamage}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => update({ equipped: { ...character.equipped, offHand: null } })}
                              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                            >
                              Desequipar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold text-yellow-400 mb-2">Inventario</h2>
              {!editingEquipment ? (
                <>
                  {/* Equipment Search */}
                  {(character.equipment ?? []).length > 3 && (
                    <input
                      type="text"
                      value={equipmentSearch}
                      onChange={(e) => setEquipmentSearch(e.target.value)}
                      placeholder="Buscar en inventario..."
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-3 text-sm"
                    />
                  )}
                  {(character.equipment ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400">{t('sheet.noEquipment')}</p>
                  ) : (
                    <div className="space-y-2">
                      {(character.equipment ?? [])
                        .filter((id) => {
                          if (!equipmentSearch.trim()) return true;
                          const item = equipment.find((e) => e.id === id);
                          if (!item) return false;
                          return item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                            (item.category && item.category.toLowerCase().includes(equipmentSearch.toLowerCase()));
                        })
                        .map((id) => {
                        const item = equipment.find((e) => e.id === id);
                        if (!item) return null;
                        const impact = calculateEquipmentImpact(character, item);
                        const isEquippedArmor = character.equipped?.armor === id;
                        const isEquippedMainHand = character.equipped?.mainHand === id;
                        const isEquippedOffHand = character.equipped?.offHand === id;
                        const isEquipped = isEquippedArmor || isEquippedMainHand || isEquippedOffHand;

                        return (
                          <div key={item.id} className={`bg-slate-700 rounded-lg p-3 ${isEquipped ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.category && <span>{item.category}</span>}
                                  {item.category && item.cost && ' · '}
                                  {item.cost && <span>{item.cost}</span>}
                                </p>
                              </div>
                              {/* Equip buttons based on item type */}
                              {!isEquipped && impact?.type === 'armor' && (
                                <button
                                  onClick={() => update({ equipped: { ...character.equipped, armor: id } })}
                                  className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded ml-2"
                                >
                                  Equipar
                                </button>
                              )}
                              {!isEquipped && impact?.type === 'weapon' && (
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => update({ equipped: { ...character.equipped, mainHand: id } })}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                                    title="Mano principal"
                                  >
                                    Principal
                                  </button>
                                  {!item.mechanics?.twoHanded && (
                                    <button
                                      onClick={() => update({ equipped: { ...character.equipped, offHand: id } })}
                                      className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
                                      title="Mano secundaria"
                                    >
                                      Secundaria
                                    </button>
                                  )}
                                </div>
                              )}
                              {!isEquipped && impact?.type === 'shield' && (
                                <button
                                  onClick={() => update({ equipped: { ...character.equipped, offHand: id } })}
                                  className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded ml-2"
                                >
                                  Equipar
                                </button>
                              )}
                              {isEquipped && (
                                <span className="text-xs text-green-400 ml-2">Equipado</span>
                              )}
                            </div>

                            {/* Dynamic impact display */}
                            {impact?.type === 'armor' && (
                              <div className="mt-2 text-sm">
                                <span className={impact.isUpgrade ? 'text-green-400' : 'text-gray-400'}>
                                  AC: {impact.newAC}
                                  {impact.acChange !== 0 && (
                                    <span className={impact.acChange > 0 ? 'text-green-400' : 'text-red-400'}>
                                      {' '}({impact.acChange > 0 ? '+' : ''}{impact.acChange} vs actual)
                                    </span>
                                  )}
                                </span>
                                {impact.warnings?.map((w) => (
                                  <span key={w} className="text-yellow-400 text-xs block">{w}</span>
                                ))}
                              </div>
                            )}

                            {impact?.type === 'weapon' && (
                              <div className="mt-2 text-sm text-blue-400">
                                +{impact.attackBonus} para impactar · {impact.displayDamage} {impact.damageType}
                                <span className="text-gray-400 text-xs block">
                                  ~{impact.averageDamage} daño promedio
                                  {impact.displayVersatile && ` (${impact.displayVersatile} a dos manos)`}
                                </span>
                                {impact.range && (
                                  <span className="text-gray-400 text-xs block">
                                    Alcance: {impact.range.normal}/{impact.range.long} pies
                                  </span>
                                )}
                              </div>
                            )}

                            {impact?.type === 'shield' && (
                              <p className="mt-2 text-sm text-green-400">
                                +{impact.acBonus} AC (total: {impact.newAC})
                              </p>
                            )}

                            {impact?.type === 'consumable' && impact.healing && (
                              <p className="mt-2 text-sm text-pink-400">
                                Cura: {impact.healing}
                              </p>
                            )}
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
                    {t('sheet.editInventory')}
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-2">Selecciona los objetos que posees:</p>
                  {equipment.map((item) => {
                    const impact = calculateEquipmentImpact(character, item);
                    return (
                      <label key={item.id} className="flex items-start gap-2 bg-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-600">
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
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">
                            {item.name}
                            <span className="text-gray-400 font-normal ml-2">{item.cost}</span>
                          </p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                          {/* Show calculated stats in edit mode too */}
                          {impact?.type === 'armor' && (
                            <p className="text-xs text-green-400 mt-1">AC: {impact.newAC}</p>
                          )}
                          {impact?.type === 'weapon' && (
                            <p className="text-xs text-blue-400 mt-1">
                              +{impact.attackBonus} ataque · {impact.displayDamage}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        update({ equipment: equipmentEdit });
                        setEditingEquipment(false);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t('sheet.save')}
                    </button>
                    <button
                      onClick={() => setEditingEquipment(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t('general.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Equipment Section */}
              <div className="mt-6 pt-4 border-t border-slate-600">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-cyan-400">Equipo personalizado</h3>
                  <button
                    onClick={() => setShowCustomEquipForm(!showCustomEquipForm)}
                    className="text-xs bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded"
                  >
                    {showCustomEquipForm ? 'Cancelar' : '+ Añadir'}
                  </button>
                </div>

                {showCustomEquipForm && (
                  <div className="bg-slate-700 rounded-lg p-4 mb-3 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={customEquipForm.name}
                        onChange={(e) => setCustomEquipForm({ ...customEquipForm, name: e.target.value })}
                        placeholder="Espada mágica +1"
                        className="w-full bg-slate-600 text-white text-sm rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                      <select
                        value={customEquipForm.category}
                        onChange={(e) => setCustomEquipForm({ ...customEquipForm, category: e.target.value })}
                        className="w-full bg-slate-600 text-white text-sm rounded px-3 py-2"
                      >
                        <option value="Arma">Arma</option>
                        <option value="Armadura">Armadura</option>
                        <option value="Escudo">Escudo</option>
                        <option value="Equipo">Equipo</option>
                        <option value="Consumible">Consumible</option>
                        <option value="Mágico">Objeto mágico</option>
                        <option value="Tesoro">Tesoro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Descripción / Efectos</label>
                      <textarea
                        value={customEquipForm.description}
                        onChange={(e) => setCustomEquipForm({ ...customEquipForm, description: e.target.value })}
                        placeholder="+1 a ataques y daño. Brilla en presencia de orcos."
                        rows={2}
                        className="w-full bg-slate-600 text-white text-sm rounded px-3 py-2"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!customEquipForm.name.trim()) return;
                        const newItem = {
                          id: `custom-${Date.now()}`,
                          name: customEquipForm.name.trim(),
                          category: customEquipForm.category,
                          description: customEquipForm.description.trim(),
                          isCustom: true,
                        };
                        update({
                          customEquipment: [...(character.customEquipment ?? []), newItem],
                        });
                        setCustomEquipForm({ name: '', description: '', category: 'Equipo' });
                        setShowCustomEquipForm(false);
                      }}
                      disabled={!customEquipForm.name.trim()}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      Añadir objeto
                    </button>
                  </div>
                )}

                {(character.customEquipment ?? []).length === 0 && !showCustomEquipForm ? (
                  <p className="text-sm text-gray-500">
                    {t('sheet.noCustomEquipment')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(character.customEquipment ?? []).map((item) => (
                      <div key={item.id} className="bg-slate-700 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-bold text-white">
                              {item.name}
                              <span className="text-cyan-400 text-xs ml-2">{item.category}</span>
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              update({
                                customEquipment: (character.customEquipment ?? []).filter((e) => e.id !== item.id),
                              });
                            }}
                            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded ml-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                  placeholder={t('sheet.tacticsPlaceholder')}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 min-h-[120px] text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hit Dice and Rest buttons */}
        {(() => {
          const hitDie = CLASS_HIT_DIE[character.class] ?? 8;
          const totalHitDice = character.hitDice?.total ?? character.level ?? 1;
          const usedHitDice = character.hitDice?.used ?? 0;
          const availableHitDice = totalHitDice - usedHitDice;
          const conMod = getAbilityModifier(character.abilityScores?.con ?? 10);

          return (
            <div className="mb-4">
              {/* Hit Dice display */}
              <div className="bg-slate-800 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Dados de golpe</p>
                    <p className="text-xl font-bold text-white">
                      {availableHitDice}/{totalHitDice} <span className="text-purple-400">d{hitDie}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Curación por dado</p>
                    <p className="text-sm text-green-400">1d{hitDie} + {conMod >= 0 ? '+' : ''}{conMod} CON</p>
                  </div>
                </div>
              </div>

              {/* Rest buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShortRestDiceToSpend(Math.min(1, availableHitDice));
                    setShowShortRestModal(true);
                  }}
                  disabled={availableHitDice <= 0 || currentHP >= maxHP}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                  {t('combat.shortRest')}
                </button>
                <button
                  onClick={() => setShowLongRestConfirm(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                  {t('combat.longRest')}
                </button>
              </div>
            </div>
          );
        })()}

        <div className="text-center text-gray-500 text-xs pb-4">
          <p>
            {isMulticlassed(character)
              ? t('sheet.characterSummaryMulticlass').replace('{{name}}', character.name || t('list.noName')).replace('{{display}}', getClassDisplay(character))
              : t('sheet.characterSummary').replace('{{name}}', character.name || t('list.noName')).replace('{{level}}', String(character.level ?? 1))}
          </p>
        </div>

        {showInitiativeTracker && (
          <InitiativeTracker
            character={character}
            update={update}
            onClose={() => setShowInitiativeTracker(false)}
          />
        )}
        {showShortRestModal && (
          <ShortRestModal
            character={character}
            update={update}
            maxHP={maxHP}
            currentHP={currentHP}
            onClose={() => setShowShortRestModal(false)}
          />
        )}

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

        <ConfirmModal
          open={showLongRestConfirm}
          title={t('combat.longRestConfirmTitle')}
          message={t('combat.longRestConfirmMessage')}
          confirmLabel={t('general.confirm')}
          cancelLabel={t('general.cancel')}
          onConfirm={() => {
            resetLongRest();
            setShowLongRestConfirm(false);
          }}
          onCancel={() => setShowLongRestConfirm(false)}
        />

        <ConfirmModal
          open={showConcentrationConfirm}
          title={t('sheet.spells.concentrationSwitchTitle')}
          message={t('sheet.spells.concentrationSwitchMessage')
            .replace('{{from}}', (() => {
              const s = (character.customSpells ?? []).find((x) => x.id === character.concentratingOn) || spells.find((sp) => sp.id === character.concentratingOn);
              return getSpellDisplayName(s) ?? '';
            })())
            .replace('{{to}}', (() => {
              const s = (character.customSpells ?? []).find((x) => x.id === concentrationSwitchSpell) || spells.find((sp) => sp.id === concentrationSwitchSpell);
              return getSpellDisplayName(s) ?? '';
            })())}
          confirmLabel={t('general.confirm')}
          cancelLabel={t('general.cancel')}
          onConfirm={() => {
            if (concentrationSwitchSpell) update({ concentratingOn: concentrationSwitchSpell });
            setShowConcentrationConfirm(false);
            setConcentrationSwitchSpell(null);
          }}
          onCancel={() => {
            setShowConcentrationConfirm(false);
            setConcentrationSwitchSpell(null);
          }}
        />

        <ConfirmModal
          open={!!spellToDeleteId}
          title={t('sheet.spells.deleteCustomTitle')}
          message={t('sheet.spells.deleteCustomMessage')}
          confirmLabel={t('list.delete')}
          cancelLabel={t('general.cancel')}
          danger
          onConfirm={() => {
            if (!spellToDeleteId) return;
            const nextCustom = (character.customSpells ?? []).filter((s) => s.id !== spellToDeleteId);
            const nextKnown = (character.spellsKnown ?? []).filter((id) => id !== spellToDeleteId);
            const nextPrepared = (character.spellsPrepared ?? []).filter((id) => id !== spellToDeleteId);
            update({ customSpells: nextCustom, spellsKnown: nextKnown, spellsPrepared: nextPrepared });
            setSpellToDeleteId(null);
          }}
          onCancel={() => setSpellToDeleteId(null)}
        />

        <LevelUpModal
          open={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          character={character}
          onConfirm={(next) => {
            onUpdate(next);
            setShowLevelUpModal(false);
          }}
        />

        {/* Floating Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
          <button
            type="button"
            onClick={() => setShowPrintView(true)}
            aria-label="Imprimir o exportar a PDF"
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            title="Exportar / Imprimir"
          >
            📄
          </button>
          <button
            type="button"
            onClick={() => setShowDiceRoller(true)}
            aria-label="Lanzar dados"
            className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            title="Lanzar dados"
          >
            🎲
          </button>
        </div>

        {/* Dice Roller Modal */}
        <DiceRoller
          character={character}
          open={showDiceRoller}
          onClose={() => setShowDiceRoller(false)}
          onLogRoll={(roll) => {
            const entry = { timestamp: new Date().toISOString(), text: roll.description || `${roll.label}: ${roll.total}` };
            update({ sessionNotes: [...(character.sessionNotes ?? []), entry] });
          }}
        />

        {/* Print View Modal */}
        {showPrintView && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto print:max-h-none print:overflow-visible" id="print-sheet">
              <div className="p-6 print:p-4">
                {/* Print Header */}
                <div className="flex justify-between items-start mb-6 print:hidden">
                  <h2 className="text-2xl font-bold">Vista de impresión</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Imprimir / PDF
                    </button>
                    <button
                      onClick={() => setShowPrintView(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                {/* Character Sheet for Print */}
                <div className="border-2 border-gray-800 rounded-lg p-4 print:border-0 print:rounded-none">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-gray-300 print:break-inside-avoid">
                    {character.portraitUrl && (
                      <img src={character.portraitUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-400" />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{character.name || 'Sin nombre'}</h1>
                      <p className="text-sm text-gray-600">{character.race} {character.class} • Nivel {character.level}</p>
                      {character.background && <p className="text-xs text-gray-500">Trasfondo: {character.background}</p>}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-6 gap-2 mb-4 print:break-inside-avoid">
                    {Object.entries(ABILITY_LABELS).map(([key, label]) => {
                      const score = character.abilityScores?.[key] ?? 10;
                      const mod = getAbilityModifier(score);
                      return (
                        <div key={key} className="border border-gray-400 rounded p-2 text-center">
                          <div className="text-xs font-bold text-gray-600">{label}</div>
                          <div className="text-xl font-bold">{mod >= 0 ? '+' : ''}{mod}</div>
                          <div className="text-xs text-gray-500">{score}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Combat Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4 print:break-inside-avoid">
                    <div className="border border-gray-400 rounded p-3 text-center">
                      <div className="text-xs font-bold text-gray-600">AC</div>
                      <div className="text-2xl font-bold">{character.AC ?? 10}</div>
                    </div>
                    <div className="border border-gray-400 rounded p-3 text-center min-w-[4.5rem]">
                      <div className="text-xs font-bold text-gray-600">HP</div>
                      <div className="text-2xl font-bold">{currentHP}/{maxHP}</div>
                    </div>
                    <div className="border border-gray-400 rounded p-3 text-center">
                      <div className="text-xs font-bold text-gray-600">Velocidad</div>
                      <div className="text-2xl font-bold">{character.speed ?? 30}</div>
                    </div>
                    <div className="border border-gray-400 rounded p-3 text-center">
                      <div className="text-xs font-bold text-gray-600">CD Conjuros</div>
                      <div className="text-2xl font-bold">{character.spellDC ?? '—'}</div>
                    </div>
                  </div>

                  {/* Skills (2 columns) */}
                  <div className="mb-4 print:break-inside-avoid">
                    <h3 className="font-bold text-sm mb-2 border-b border-gray-300">HABILIDADES</h3>
                    <div className="grid grid-cols-2 gap-x-4 text-xs">
                      {Object.entries(SKILLS).map(([skillName, ability]) => {
                        const mod = getSkillModifier(character, skillName);
                        const isProficient = character.proficiencies?.skills?.includes(skillName);
                        return (
                          <div key={skillName} className="flex justify-between py-0.5 border-b border-gray-200">
                            <span>{isProficient && '●'} {SKILL_NAMES_ES[skillName] || skillName} ({ABILITY_LABELS[ability]})</span>
                            <span className="font-bold">{mod >= 0 ? '+' : ''}{mod}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equipment */}
                  {(character.equipment ?? []).length > 0 && (
                    <div className="mb-4 print:break-inside-avoid">
                      <h3 className="font-bold text-sm mb-2 border-b border-gray-300">EQUIPO</h3>
                      <div className="text-xs">
                        {(character.equipment ?? []).map((id) => {
                          const item = equipment.find((e) => e.id === id);
                          return item?.name || id;
                        }).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Spells */}
                  {(character.spellsKnown ?? []).length > 0 && (
                    <div className="mb-4 print:break-inside-avoid">
                      <h3 className="font-bold text-sm mb-2 border-b border-gray-300">CONJUROS</h3>
                      <div className="text-xs">
                        {(character.spellsKnown ?? []).map((id) => {
                          const spell = spells.find((s) => s.id === id);
                          return spell?.name || id;
                        }).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Languages & Feats */}
                  <div className="grid grid-cols-2 gap-4 text-xs print:break-inside-avoid">
                    <div>
                      <h3 className="font-bold text-sm mb-1 border-b border-gray-300">IDIOMAS</h3>
                      <p>{(character.languages ?? ['common']).map((id) => srdLanguages.find((l) => l.id === id)?.name || id).join(', ')}</p>
                    </div>
                    {(character.feats ?? []).length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-1 border-b border-gray-300">DOTES</h3>
                        <p>{(character.feats ?? []).map((id) => feats.find((f) => f.id === id)?.name || id).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
