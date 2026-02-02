/**
 * Integration tests: CharacterSheet with context (short rest path).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import CharacterSheet from './CharacterSheet.jsx';
import { CharacterProvider } from '../lib/CharacterContext.jsx';
import { ThemeProvider } from '../lib/ThemeContext.jsx';
import { I18nProvider } from '../i18n/I18nContext.jsx';

const minimalCharacter = {
  id: 'test-1',
  name: 'Test Hero',
  race: 'Human',
  class: 'Fighter',
  level: 1,
  maxHP: 12,
  currentHP: 12,
  AC: 14,
  abilityScores: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 8 },
  proficiencies: { skills: [], saves: [], tools: [], weapons: [], armor: [], expertise: [] },
  hitDice: { total: 1, used: 0 },
  spellSlots: {},
  gold: 0,
  equipment: [],
  spellsKnown: [],
  languages: ['common'],
  conditions: [],
  classes: [{ name: 'Fighter', level: 1 }],
};

function renderSheet(character = minimalCharacter) {
  const onUpdate = vi.fn();
  render(
    <ThemeProvider>
      <I18nProvider>
        <CharacterProvider character={character} onUpdate={onUpdate}>
          <CharacterSheet
            onBack={() => {}}
            onDeleteCharacter={() => {}}
          />
        </CharacterProvider>
      </I18nProvider>
    </ThemeProvider>
  );
  return { onUpdate };
}

describe('CharacterSheet', () => {
  beforeEach(() => {
    const storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, value) => { storage[key] = value; },
      removeItem: (key) => { delete storage[key]; },
      clear: () => {},
      length: 0,
      key: () => null,
    });
  });

  it('renders character name and summary', () => {
    renderSheet();
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
    expect(screen.getByText(/Fighter.*Human/)).toBeInTheDocument();
  });

  it('shows HP on summary', () => {
    renderSheet();
    expect(screen.getByText('HP')).toBeInTheDocument();
  });

  it('shows short rest button when Combate tab is open', () => {
    renderSheet();
    const combateTab = screen.getByRole('button', { name: /Combate/i });
    expect(combateTab).toBeInTheDocument();
    act(() => { combateTab.click(); });
    expect(screen.getByText('Descanso corto')).toBeInTheDocument();
  });

  it('level-up flow: open modal, advance to summary, confirm updates character to level 2', async () => {
    const { onUpdate } = renderSheet();
    const levelUpBtn = screen.getByRole('button', { name: /Subir de nivel/i });
    expect(levelUpBtn).toBeInTheDocument();
    await act(async () => { levelUpBtn.click(); });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const nextBtn = within(dialog).getByRole('button', { name: /Siguiente/i });
    await act(async () => { nextBtn.click(); });
    const confirmLevelUpBtn = within(dialog).getByRole('button', { name: /Subir a nivel/i });
    await act(async () => { confirmLevelUpBtn.click(); });
    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.level).toBe(2);
    expect(lastCall.classes).toEqual([{ name: 'Fighter', level: 2 }]);
  });
});
