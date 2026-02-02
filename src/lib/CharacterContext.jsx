/**
 * Character context: provides current character and update function for the sheet tree.
 * Used so CharacterSheet and children read/update via one place instead of prop drilling.
 */

import React, { createContext, useContext, useMemo } from 'react';

const CharacterContext = createContext(null);

/**
 * @param {{ character: object, onUpdate: (updated: object) => void, children: React.ReactNode }} props
 */
export function CharacterProvider({ character, onUpdate, children }) {
  const value = useMemo(() => {
    const update = (partial) => {
      if (!character) return;
      onUpdate({ ...character, ...partial, updatedAt: new Date().toISOString() });
    };
    return { character, onUpdate, update };
  }, [character, onUpdate]);

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

/**
 * @returns {{ character: object, onUpdate: (o: object) => void, update: (partial: object) => void }}
 * @throws {Error} when used outside CharacterProvider
 */
export function useCharacterContext() {
  const ctx = useContext(CharacterContext);
  if (ctx == null) throw new Error('useCharacterContext must be used within CharacterProvider');
  return ctx;
}
