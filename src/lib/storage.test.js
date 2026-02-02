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
      const loaded = loadCharacters();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
      expect(loaded[0].name).toBe('A');
      expect(loaded[0].class).toBe('Fighter');
      expect(loaded[0].classes).toEqual([{ name: 'Fighter', level: 1 }]);
    });
    it('returns characters from versioned format', () => {
      const list = [{ id: '1', name: 'A' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, characters: list }));
      const loaded = loadCharacters();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
      expect(loaded[0].name).toBe('A');
      expect(loaded[0].class).toBe('Fighter');
      expect(loaded[0].classes).toEqual([{ name: 'Fighter', level: 1 }]);
    });
    it('returns empty array when JSON is invalid', () => {
      localStorage.setItem(STORAGE_KEY, 'not json');
      expect(loadCharacters()).toEqual([]);
    });
    it('migrates characters with class but no classes array', () => {
      const list = [{ id: '1', name: 'A', class: 'Fighter', level: 3 }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, characters: list }));
      const loaded = loadCharacters();
      expect(loaded[0].classes).toEqual([{ name: 'Fighter', level: 3 }]);
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
