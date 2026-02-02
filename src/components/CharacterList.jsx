import React, { useState, useRef } from 'react';
import ConfirmModal from './ConfirmModal.jsx';
import { exportCharacters, importCharacters } from '../lib/exportImport.js';
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
  const fileInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const characterToDelete = deletingId ? characters.find((c) => c.id === deletingId) : null;

  const handleExport = () => {
    const json = exportCharacters(characters);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personajes-${new Date().toISOString().slice(0, 10)}.json`;
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
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleExport}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            {t('list.export')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            {t('list.import')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
        {importError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {importError}
          </div>
        )}

        {characters.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-gray-400">
            <p className="mb-4">Aún no tienes personajes.</p>
            <p className="text-sm">Pulsa "Crear personaje" para empezar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((c) => (
              <div
                key={c.id}
                className="bg-slate-800 rounded-xl p-4 shadow-lg text-white flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-white truncate">{c.name || 'Sin nombre'}</h2>
                  <p className="text-sm text-gray-400">
                    {c.race} • {c.class} • Nivel {c.level ?? 1}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onOpenCharacter(c.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                  >
                    Abrir
                  </button>
                  {onDeleteCharacter && (
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="bg-red-900 hover:bg-red-800 text-white font-semibold px-3 py-2 rounded-lg transition-all"
                      title="Eliminar personaje"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
