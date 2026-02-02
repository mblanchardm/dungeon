/**
 * Shared spell picker: search, group by level, expandable description, "X of Y chosen", "Show more".
 * Used by CreateCharacterWizard (step 6) and LevelUpModal (spell step).
 */

import React, { useState } from 'react';

const SPELL_LIST_INITIAL = 25;

export default function SpellPicker({
  spells = [],
  selectedIds = [],
  onChange,
  maxCount = 0,
  getSpellDisplayName = (s) => s?.name ?? '',
  t = (key) => key,
  searchPlaceholder = 'Search spells...',
  spellCantripKey = 'wizard.spellCantrip',
  spellLevelKey = 'wizard.spellLevel',
  spellComponentsKey = 'wizard.spellComponents',
  showMoreKey = 'wizard.showMoreSpells',
  selectedSpellsKey = 'wizard.selectedSpells',
  maxHeight = 'max-h-72',
  id,
}) {
  const [search, setSearch] = useState('');
  const [expandedSpellId, setExpandedSpellId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const q = (search || '').trim().toLowerCase();
  const filtered = q
    ? spells.filter(
        (s) =>
          (getSpellDisplayName(s) || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      )
    : spells;
  const toShow =
    showAll || filtered.length <= SPELL_LIST_INITIAL
      ? filtered
      : filtered.slice(0, SPELL_LIST_INITIAL);
  const byLevel = {};
  toShow.forEach((s) => {
    const l = s.level ?? 0;
    if (!byLevel[l]) byLevel[l] = [];
    byLevel[l].push(s);
  });
  const levels = Object.keys(byLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const selected = selectedIds;
  const atLimit = selected.length >= maxCount;
  const handleToggle = (spellId, checked) => {
    if (checked) {
      if (selected.length < maxCount) onChange([...selected, spellId]);
    } else {
      onChange(selected.filter((id) => id !== spellId));
    }
  };

  return (
    <div className="space-y-3" id={id}>
      <p className="text-sm font-semibold text-purple-300">
        {t(selectedSpellsKey)
          .replace('{{current}}', String(selected.length))
          .replace('{{total}}', String(maxCount))}
      </p>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
        aria-label={searchPlaceholder}
      />
      <div className={`${maxHeight} overflow-y-auto space-y-3`}>
        {levels.map((level) => (
          <div key={level}>
            <h4 className="text-sm font-bold text-purple-300 mb-2 sticky top-0 bg-slate-800 py-1 z-10">
              {level === 0 ? t(spellCantripKey) : t(spellLevelKey).replace('{{level}}', String(level))}
            </h4>
            <div className="space-y-2">
              {byLevel[level].map((spell) => {
                const selectedThis = selected.includes(spell.id);
                const canToggle = selectedThis || !atLimit;
                const expanded = expandedSpellId === spell.id;
                return (
                  <div
                    key={spell.id}
                    className={`rounded-lg overflow-hidden ${selectedThis ? 'bg-purple-700' : 'bg-slate-700'} ${canToggle ? 'hover:bg-slate-600' : 'opacity-60'}`}
                  >
                    <label className="flex items-start gap-2 cursor-pointer p-3">
                      <input
                        type="checkbox"
                        checked={selectedThis}
                        onChange={(e) => handleToggle(spell.id, e.target.checked)}
                        disabled={!canToggle}
                        className="rounded mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => setExpandedSpellId(expanded ? null : spell.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setExpandedSpellId(expanded ? null : spell.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expanded}
                      >
                        <span className="font-medium">{getSpellDisplayName(spell)}</span>
                        {spell.level > 0 && (
                          <span className="text-purple-300 text-xs ml-2">
                            {t(spellLevelKey).replace('{{level}}', String(spell.level))}
                          </span>
                        )}
                        {expanded && (
                          <div className="mt-2 text-xs text-gray-300 border-t border-slate-600 pt-2">
                            <p>{spell.description}</p>
                            {spell.components && (
                              <p className="mt-1 text-gray-400">
                                {t(spellComponentsKey)}: {spell.components}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {!showAll && filtered.length > SPELL_LIST_INITIAL && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-sm text-purple-300 hover:text-purple-200 bg-slate-700 rounded-lg"
          >
            {t(showMoreKey) || `Show more (${filtered.length - SPELL_LIST_INITIAL} more)`}
          </button>
        )}
      </div>
      {spells.length === 0 && (
        <p className="text-sm text-gray-500">{t('wizard.noSpells')}</p>
      )}
    </div>
  );
}
