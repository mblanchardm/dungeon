import { describe, it, expect } from 'vitest';
import { exportCharacters, importCharacters } from './exportImport.js';

describe('exportImport', () => {
  describe('exportCharacters', () => {
    it('returns JSON string with characters', () => {
      const chars = [{ id: '1', name: 'Test' }];
      const json = exportCharacters(chars);
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.characters).toEqual(chars);
      expect(parsed.version).toBe(1);
    });
  });

  describe('importCharacters', () => {
    it('returns characters from valid JSON array', () => {
      const chars = [{ id: '1', name: 'Test' }];
      const result = importCharacters(JSON.stringify(chars));
      expect(result.ok).toBe(true);
      expect(result.characters).toEqual(chars);
    });

    it('returns characters from versioned format', () => {
      const chars = [{ id: '1', name: 'Test' }];
      const payload = { version: 1, characters: chars };
      const result = importCharacters(JSON.stringify(payload));
      expect(result.ok).toBe(true);
      expect(result.characters).toEqual(chars);
    });

    it('returns error for invalid JSON', () => {
      const result = importCharacters('not json');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('JSON');
    });

    it('returns error for invalid format (no array or characters)', () => {
      const result = importCharacters(JSON.stringify({ foo: 'bar' }));
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Formato');
    });

    it('returns error when character missing id or name', () => {
      const chars = [{ id: '1', name: 'OK' }, { name: 'NoId' }];
      const result = importCharacters(JSON.stringify(chars));
      expect(result.ok).toBe(false);
      expect(result.error).toContain('posición 2');
    });
  });
});
