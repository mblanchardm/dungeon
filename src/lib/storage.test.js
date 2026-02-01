import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadCharacters, saveCharacters, STORAGE_VERSION } from './storage.js';

const STORAGE_KEY = 'dnd-characters';

describe('storage', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, value) => {
        mockStorage[key] = value;
      },
      removeItem: (key) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      length: 0,
      key: () => null,
    });
  });

  describe('loadCharacters', () => {
    it('returns empty array when nothing stored', () => {
      expect(loadCharacters()).toEqual([]);
    });
    it('returns parsed array when stored as array (legacy)', () => {
      const list = [{ id: '1', name: 'A' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      expect(loadCharacters()).toEqual(list);
    });
    it('returns characters from versioned format', () => {
      const list = [{ id: '1', name: 'A' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, characters: list }));
      expect(loadCharacters()).toEqual(list);
    });
    it('returns empty array when JSON is invalid', () => {
      localStorage.setItem(STORAGE_KEY, 'not json');
      expect(loadCharacters()).toEqual([]);
    });
  });

  describe('saveCharacters', () => {
    it('writes versioned payload', () => {
      const list = [{ id: '1', name: 'A' }];
      saveCharacters(list);
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw);
      expect(parsed.version).toBe(STORAGE_VERSION);
      expect(parsed.characters).toEqual(list);
    });
  });
});
