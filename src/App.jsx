import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { loadCharacters, saveCharacters } from './lib/storage.js';
import { createCharacter } from './lib/characterModel.js';
import CharacterList from './components/CharacterList.jsx';
import CreateCharacterWizard from './components/CreateCharacterWizard.jsx';
import CharacterSheet from './components/CharacterSheet.jsx';

function CharacterSheetRoute({ characters, onUpdate, onDeleteCharacter }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const character = characters.find((c) => c.id === id);

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-lg mb-4">Personaje no encontrado.</p>
          <button
            onClick={() => navigate('/')}
            className="text-purple-300 hover:text-white font-medium"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <CharacterSheet
      character={character}
      onUpdate={onUpdate}
      onBack={() => navigate('/')}
      onDeleteCharacter={(charId) => {
        onDeleteCharacter(charId);
        navigate('/');
      }}
    />
  );
}

function App() {
  const [characters, setCharacters] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let list = loadCharacters();
    if (list.length === 0) {
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
    }
    setCharacters(list);
    setLoaded(true);
  }, []);

  const handleWizardComplete = (character) => {
    const next = [...characters, character];
    setCharacters(next);
    saveCharacters(next);
    navigate(`/character/${character.id}`);
  };

  const handleDeleteCharacter = (id) => {
    const next = characters.filter((c) => c.id !== id);
    setCharacters(next);
    saveCharacters(next);
  };

  const handleUpdateCharacter = (updated) => {
    const next = characters.map((c) => (c.id === updated.id ? updated : c));
    setCharacters(next);
    saveCharacters(next);
  };

  const handleImportReplace = (list) => {
    setCharacters(list);
    saveCharacters(list);
  };

  const handleImportAdd = (list) => {
    const next = [...characters, ...list];
    setCharacters(next);
    saveCharacters(next);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
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
  );
}

export default App;
