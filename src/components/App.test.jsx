/**
 * Integration tests: loading/saving roster and main routes.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { ThemeProvider } from '../lib/ThemeContext.jsx';
import { I18nProvider } from '../i18n/I18nContext.jsx';
import { loadCharacters, saveCharacters } from '../lib/storage.js';

vi.mock('../lib/storage.js', () => ({
  loadCharacters: vi.fn(() => []),
  saveCharacters: vi.fn(),
}));

function renderApp(initialRoute = '/') {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <App />
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(loadCharacters).mockReturnValue([]);
    vi.mocked(saveCharacters).mockClear();
    const storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, value) => { storage[key] = value; },
      removeItem: (key) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
      length: 0,
      key: () => null,
    });
  });

  it('shows loading then list when loadCharacters returns empty', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Personajes D&D/)).toBeInTheDocument();
  });

  it('shows character in list when loadCharacters returns one', async () => {
    vi.mocked(loadCharacters).mockReturnValue([
      { id: 'c1', name: 'Test Hero', class: 'Fighter', level: 1 },
    ]);
    renderApp('/');
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Test Hero/)).toBeInTheDocument();
  });

  it('navigates to create wizard when clicking create', async () => {
    vi.mocked(loadCharacters).mockReturnValue([]);
    renderApp('/');
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Crear personaje/));
    await waitFor(() => {
      expect(screen.getByText(/Raza|Paso 1/)).toBeInTheDocument();
    });
  });
});
