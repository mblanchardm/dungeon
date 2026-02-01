import React, { useState, useRef } from 'react';
import ConfirmModal from './ConfirmModal.jsx';
import { exportCharacters, importCharacters } from '../lib/exportImport.js';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-1">Personajes D&D</h1>
          <p className="text-sm text-purple-100">Tu lista de personajes</p>
        </div>

        <button
          onClick={onCreateNew}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mb-3 shadow-lg transition-all"
        >
          + Crear personaje
        </button>
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleExport}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            Exportar todo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            Importar
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
          title="Eliminar personaje"
          message={
            characterToDelete
              ? `¿Eliminar a ${characterToDelete.name || 'este personaje'}?`
              : ''
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
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
          title="Importar personajes"
          message={`¿Reemplazar lista actual o añadir los ${pendingImport?.length ?? 0} personajes importados?`}
          confirmLabel="Reemplazar"
          cancelLabel="Cancelar"
          secondaryLabel="Añadir"
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
