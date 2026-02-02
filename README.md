# Personajes D&D

A D&D 5e character creator and tracker: create characters, manage sheets, roll dice, track combat and spells. Data is stored in the browser (localStorage); no backend required.

## Commands

- **`npm run dev`** – Start the dev server (Vite).
- **`npm run build`** – Production build.
- **`npm run test`** – Run tests (Vitest).
- **`npm run test:watch`** – Run tests in watch mode.

## Project layout

- **`src/components/`** – React UI: `CharacterList`, `CharacterSheet`, `CreateCharacterWizard`, `DiceRoller`, modals, initiative tracker.
- **`src/lib/`** – Core logic: character model and calculations (`characterModel.js`), constants (`constants.js`), class data (`classData.js`), storage (`storage.js`), equipment helpers (`equipmentHelpers.js`), export/import (`exportImport.js`), theme and character context.
- **`src/data/`** – SRD data: races, classes, spells, equipment (`srd.js`, `srdSpells.js`).
- **`src/hooks/`** – `useCharacterSheet` for sheet updates and derived values.

## Character state and persistence

- **State:** The roster lives in `App` (`characters`). When viewing a sheet, `CharacterProvider` (see `src/lib/CharacterContext.jsx`) provides the current character and an `update` function so the sheet and children can read/update without prop drilling.
- **Persistence:** `src/lib/storage.js` reads and writes the roster to localStorage under a versioned format `{ version, characters }`. Load/save validate entries (e.g. require `id`) so invalid data does not corrupt the roster.

## Architecture notes

- **Character state:** Lives in `App` and is provided to the sheet via `CharacterProvider` (`src/lib/CharacterContext.jsx`). The sheet and its children read/update the current character through `useCharacterContext()`.
- **Level-up:** The level-up flow lives in `LevelUpModal` (`src/components/character-sheet/LevelUpModal.jsx`). It uses `levelUpCharacter` from `src/lib/characterModel.js` and calls the sheet’s `onConfirm(updatedCharacter)` when the user confirms.
- **i18n:** Translatable strings live under `src/i18n/locales/` (`es.json`, `en.json`). Components use `useI18n().t(key)` from `src/i18n/I18nContext.jsx` for UI strings. Locale is persisted in localStorage and can be switched from the character list.
