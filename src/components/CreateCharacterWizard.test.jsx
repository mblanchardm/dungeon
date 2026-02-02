/**
 * Smoke tests for CreateCharacterWizard.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import CreateCharacterWizard from './CreateCharacterWizard.jsx';
import { ThemeProvider } from '../lib/ThemeContext.jsx';

describe('CreateCharacterWizard', () => {
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

  it('renders wizard with first step and Siguiente button', () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();
    render(
      <ThemeProvider>
        <CreateCharacterWizard onComplete={onComplete} onBack={onBack} />
      </ThemeProvider>
    );
    expect(screen.getByText(/Crear personaje/)).toBeInTheDocument();
    expect(screen.getByText(/Paso 1/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument();
  });

  it('advances to step 2 when race is selected and Siguiente is clicked', async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();
    render(
      <ThemeProvider>
        <CreateCharacterWizard onComplete={onComplete} onBack={onBack} />
      </ThemeProvider>
    );
    const humanRace = screen.getByRole('button', { name: /Human/ });
    await act(async () => { humanRace.click(); });
    const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
    await act(async () => { nextBtn.click(); });
    expect(screen.getByText(/Paso 2/)).toBeInTheDocument();
  });

  it('filters standard-array options so assigned values are not shown in other ability dropdowns', async () => {
    const onComplete = vi.fn();
    const onBack = vi.fn();
    render(
      <ThemeProvider>
        <CreateCharacterWizard onComplete={onComplete} onBack={onBack} />
      </ThemeProvider>
    );
    await act(async () => { screen.getByRole('button', { name: /Human/ }).click(); });
    await act(async () => { screen.getByRole('button', { name: /Siguiente/i }).click(); });
    await act(async () => { screen.getByRole('button', { name: /Fighter/i }).click(); });
    await act(async () => { screen.getByRole('button', { name: /Siguiente/i }).click(); });
    expect(screen.getByText(/Paso 3/)).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(6);
    const strSelect = selects[0];
    const dexSelect = selects[1];
    const strOptions = Array.from(strSelect.querySelectorAll('option')).map((o) => o.value);
    expect(strOptions).toContain('15');
    await act(async () => {
      fireEvent.change(strSelect, { target: { value: '15' } });
    });
    const dexOptionsAfter = Array.from(dexSelect.querySelectorAll('option')).map((o) => o.value);
    expect(dexOptionsAfter).not.toContain('15');
    expect(dexOptionsAfter).toContain('');
    expect(dexOptionsAfter).toContain('14');
  });
});
