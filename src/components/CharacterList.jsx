import React, { useState, useRef } from 'react';
import ConfirmModal from './ConfirmModal.jsx';
import { exportCharacters, importCharacters } from '../lib/exportImport.js';
import { createCharacter } from '../lib/characterModel.js';
import { parsePdfToCharacterOverrides } from '../lib/pdfCharacterParser.js';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function CharacterList({
  characters,
  onCreateNew,
  onOpenCharacter,
  onDeleteCharacter,
  onImportReplace,
  onImportAdd,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'level' | 'modified'
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const characterToDelete = deletingId ? characters.find((c) => c.id === deletingId) : null;

  const filteredCharacters = characters.filter((c) =>
    (c.name || '').toLowerCase().includes(search.trim().toLowerCase())
  );
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (sortBy === 'name') {
      const na = (a.name || '').toLowerCase();
      const nb = (b.name || '').toLowerCase();
      return na.localeCompare(nb);
    }
    if (sortBy === 'level') {
      return (b.level ?? 1) - (a.level ?? 1);
    }
    // modified
    const ta = a.updatedAt || a.createdAt || '';
    const tb = b.updatedAt || b.createdAt || '';
    return tb.localeCompare(ta);
  });

  const handleDuplicate = (c) => {
    const clone = {
      ...JSON.parse(JSON.stringify(c)),
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dup-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: (c.name || t('list.noName')) + t('list.duplicateSuffix'),
    };
    onImportAdd?.([clone]);
  };

  const handleExport = () => {
    const json = exportCharacters(characters);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = t('export.filename').replace('{{date}}', dateStr);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = importCharacters(reader.result);
      if (result.ok) {
        setPendingImport(result.characters);
      } else {
        setImportError(result.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePdfSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError(null);
    setPdfPreview(null);
    setPdfLoading(true);
    try {
      const result = await parsePdfToCharacterOverrides(file);
      if (result.ok) {
        setPdfPreview({ overrides: result.overrides });
      } else {
        setPdfError(result.error || t('list.pdfError'));
      }
    } catch (_) {
      setPdfError(t('list.pdfError'));
    } finally {
      setPdfLoading(false);
    }
    e.target.value = '';
  };

  const handlePdfCreateConfirm = () => {
    if (!pdfPreview?.overrides) return;
    const char = createCharacter(pdfPreview.overrides);
    onImportAdd?.([char]);
    setPdfPreview(null);
  };

  const pdfPreviewMessage = pdfPreview?.overrides
    ? t('list.pdfPreviewBody')
        .replace('{{name}}', pdfPreview.overrides.name || t('list.noName'))
        .replace('{{class}}', pdfPreview.overrides.class || '—')
        .replace('{{level}}', String(pdfPreview.overrides.level ?? 1))
        .replace('{{hp}}', String(pdfPreview.overrides.maxHP ?? pdfPreview.overrides.currentHP ?? '—'))
        .replace('{{ac}}', String(pdfPreview.overrides.AC ?? '—'))
        .replace(
          '{{abilities}}',
          pdfPreview.overrides.abilityScores
            ? Object.entries(pdfPreview.overrides.abilityScores)
                .map(([k, v]) => `${k.toUpperCase()} ${v}`)
                .join(', ')
            : '—'
        )
    : '';

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    }`}>
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t('app.title')}</h1>
            <p className="text-sm text-purple-100">{t('list.noCharacters')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden bg-white/10">
              <button
                type="button"
                onClick={() => setLocale('es')}
                className={`px-2 py-1 text-sm font-medium ${locale === 'es' ? 'bg-white/30 text-white' : 'text-purple-200 hover:text-white'}`}
                aria-label="Español"
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2 py-1 text-sm font-medium ${locale === 'en' ? 'bg-white/30 text-white' : 'text-purple-200 hover:text-white'}`}
                aria-label="English"
              >
                EN
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-800/50 hover:bg-slate-700/50'} text-white`}
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mb-3 shadow-lg transition-all"
        >
          + {t('list.create')}
        </button>

        {characters.length > 0 && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('list.searchPlaceholder')}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-2 mb-2 border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              aria-label={t('list.searchPlaceholder')}
            />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-400">{t('list.sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600 focus:ring-2 focus:ring-purple-500"
                aria-label={t('list.sortBy')}
              >
                <option value="name">{t('list.sortByName')}</option>
                <option value="level">{t('list.sortByLevel')}</option>
                <option value="modified">{t('list.sortByModified')}</option>
              </select>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handleExport}
            className="flex-1 min-w-[100px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            {t('list.export')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[100px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            {t('list.import')}
          </button>
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={pdfLoading}
            className="flex-1 min-w-[100px] bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            {pdfLoading ? t('list.pdfLoading') : t('list.importFromPdf')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfSelect}
          />
        </div>
        {pdfError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {pdfError}
          </div>
        )}
        {importError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {importError}
          </div>
        )}

        {characters.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-gray-400">
            <p className="mb-4">{t('list.empty')}</p>
            <p className="text-sm">{t('list.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCharacters.map((c) => (
              <div
                key={c.id}
                className="bg-slate-800 rounded-xl p-4 shadow-lg text-white flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-white truncate">{c.name || t('list.noName')}</h2>
                  <p className="text-sm text-gray-400">
                    {c.race} • {c.class} • Nivel {c.level ?? 1}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onOpenCharacter(c.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                  >
                    {t('list.open')}
                  </button>
                  {onImportAdd && (
                    <button
                      onClick={() => handleDuplicate(c)}
                      className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-3 py-2 rounded-lg transition-all"
                      title={t('list.duplicate')}
                    >
                      {t('list.duplicate')}
                    </button>
                  )}
                  {onDeleteCharacter && (
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="bg-red-900 hover:bg-red-800 text-white font-semibold px-3 py-2 rounded-lg transition-all"
                      title={t('list.deleteTitle')}
                    >
                      {t('list.delete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          open={!!pdfPreview}
          title={t('list.pdfPreviewTitle')}
          message={pdfPreviewMessage}
          confirmLabel={t('list.pdfCreateConfirm')}
          cancelLabel={t('general.cancel')}
          onConfirm={handlePdfCreateConfirm}
          onCancel={() => setPdfPreview(null)}
        />

        <ConfirmModal
          open={!!deletingId}
          title={t('list.deleteTitle')}
          message={
            characterToDelete
              ? t('list.deleteMessage').replace('{{name}}', characterToDelete.name || t('list.thisCharacter'))
              : ''
          }
          confirmLabel={t('list.delete')}
          cancelLabel={t('general.cancel')}
          danger
          onConfirm={() => {
            if (deletingId) {
              onDeleteCharacter?.(deletingId);
              setDeletingId(null);
            }
          }}
          onCancel={() => setDeletingId(null)}
        />

        <ConfirmModal
          open={!!pendingImport?.length}
          title={t('list.importTitle')}
          message={t('list.importMessage').replace('{{count}}', String(pendingImport?.length ?? 0))}
          confirmLabel={t('list.replace')}
          cancelLabel={t('general.cancel')}
          secondaryLabel={t('list.add')}
          onSecondary={() => {
            if (pendingImport?.length) {
              onImportAdd?.(pendingImport);
              setPendingImport(null);
            }
          }}
          onConfirm={() => {
            if (pendingImport?.length) {
              onImportReplace?.(pendingImport);
              setPendingImport(null);
            }
          }}
          onCancel={() => setPendingImport(null)}
        />
      </div>
    </div>
  );
}
