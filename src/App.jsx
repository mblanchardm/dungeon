import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { loadCharacters, saveCharacters } from './lib/storage.js';
import { createCharacter } from './lib/characterModel.js';
import { useTheme } from './lib/ThemeContext.jsx';
import { useI18n } from './i18n/I18nContext.jsx';
import { CharacterProvider } from './lib/CharacterContext.jsx';

const CharacterList = lazy(() => import('./components/CharacterList.jsx'));
const CreateCharacterWizard = lazy(() => import('./components/CreateCharacterWizard.jsx'));
const CharacterSheet = lazy(() => import('./components/CharacterSheet.jsx'));

function CharacterSheetRoute({ characters, onUpdate, onDeleteCharacter }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useI18n();
  const character = characters.find((c) => c.id === id);

  if (!character) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }`}>
        <div className="text-center">
          <p className="text-lg mb-4">{t('character.notFound')}</p>
          <button
            onClick={() => navigate('/')}
            className={theme === 'light' ? 'text-purple-600 hover:text-purple-800 font-medium' : 'text-purple-300 hover:text-white font-medium'}
          >
            {t('general.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <CharacterProvider character={character} onUpdate={onUpdate}>
      <CharacterSheet
        onBack={() => navigate('/')}
        onDeleteCharacter={(charId) => {
          onDeleteCharacter(charId);
          navigate('/');
        }}
      />
    </CharacterProvider>
  );
}

function App() {
  const [characters, setCharacters] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') document.title = t('app.title');
    else if (path === '/create') document.title = t('app.titleCreate');
    else if (path.startsWith('/character/')) {
      const id = path.split('/')[2];
      const char = characters.find((c) => c.id === id);
      document.title = char?.name ? t('app.titleSheetName').replace('{{name}}', char.name) : t('app.titleSheet');
    } else document.title = t('app.title');
  }, [location.pathname, characters, t]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let list = loadCharacters();
    if (list.length === 0) {
      try {
        list = [
          createCharacter({
          name: 'Jovani Vázquez',
          race: 'Tiefling',
          class: 'Bard',
          subclass: 'Colegio del Conocimiento',
          level: 4,
          background: 'Artista',
          abilityScores: { str: 8, dex: 14, con: 12, int: 14, wis: 10, cha: 20 },
          maxHP: 23,
          currentHP: 23,
          AC: 13,
          spellDC: 16,
          inspiration: 4,
          inspirationMax: 4,
          spellSlots: { 1: 4, 2: 3 },
          gold: 43,
        }),
      ];
        saveCharacters(list);
      } catch (e) {
        console.error('Failed to save default character:', e);
      }
    }
    setCharacters(list);
    setLoaded(true);
  }, []);

  const handleSaveError = (e) => {
    const msg = e?.message || 'No se pudo guardar. Considera exportar personajes o borrar algunos.';
    alert(msg);
  };

  const handleWizardComplete = (character) => {
    try {
      const next = [...characters, character];
      setCharacters(next);
      saveCharacters(next);
      setToast(t('app.saved'));
      navigate(`/character/${character.id}`);
    } catch (e) {
      handleSaveError(e);
    }
  };

  const handleDeleteCharacter = (id) => {
    try {
      const next = characters.filter((c) => c.id !== id);
      setCharacters(next);
      saveCharacters(next);
      setToast(t('app.saved'));
    } catch (e) {
      handleSaveError(e);
    }
  };

  const handleUpdateCharacter = (updated) => {
    try {
      const next = characters.map((c) => (c.id === updated.id ? updated : c));
      setCharacters(next);
      saveCharacters(next);
      setToast(t('app.saved'));
    } catch (e) {
      handleSaveError(e);
    }
  };

  const handleImportReplace = (list) => {
    try {
      setCharacters(list);
      saveCharacters(list);
      setToast(t('app.saved'));
    } catch (e) {
      handleSaveError(e);
    }
  };

  const handleImportAdd = (list) => {
    try {
      const next = [...characters, ...list];
      setCharacters(next);
      saveCharacters(next);
      setToast(t('app.saved'));
    } catch (e) {
      handleSaveError(e);
    }
  };

  if (!loaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }`}>
        <p className="text-lg">{t('app.loading')}</p>
      </div>
    );
  }

  return (
    <>
    <Suspense
      fallback={
        <div className={`min-h-screen flex items-center justify-center transition-colors ${
          theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
        }`}>
          <p className="text-lg">{t('app.loading')}</p>
        </div>
      }
    >
    <Routes>
      <Route
        path="/"
        element={
          <CharacterList
            characters={characters}
            onCreateNew={() => navigate('/create')}
            onOpenCharacter={(id) => navigate(`/character/${id}`)}
            onDeleteCharacter={handleDeleteCharacter}
            onImportReplace={handleImportReplace}
            onImportAdd={handleImportAdd}
          />
        }
      />
      <Route
        path="/create"
        element={
          <CreateCharacterWizard
            onComplete={handleWizardComplete}
            onBack={() => navigate('/')}
          />
        }
      />
      <Route
        path="/character/:id"
        element={
          <CharacterSheetRoute
            characters={characters}
            onUpdate={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
          />
        }
      />
    </Routes>
    </Suspense>
    {toast && (
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-lg max-w-md text-center text-sm font-medium flex items-center justify-center gap-2 ${
          toast === t('app.saved')
            ? 'bg-green-700 text-white'
            : 'bg-red-800 text-white'
        }`}
      >
        <span>{toast}</span>
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label={t('general.closeMessage')}
          className="opacity-80 hover:opacity-100 focus:ring-2 focus:ring-white rounded"
        >
          ×
        </button>
      </div>
    )}
    </>
  );
}

export default App;
