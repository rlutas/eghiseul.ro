import { describe, expect, it } from 'vitest';
import { normalizeCui, saveCuiPrefill, takeCuiPrefill } from '@/lib/constatator/cui-prefill';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => { map.delete(k); },
    setItem: (k, v) => { map.set(k, String(v)); },
  };
}

describe('normalizeCui', () => {
  it('strips the RO prefix, spaces and dots', () => {
    expect(normalizeCui('RO 14.399.840')).toBe('14399840');
    expect(normalizeCui('ro14399840')).toBe('14399840');
  });

  it('keeps short real CUIs (2 digits and up)', () => {
    expect(normalizeCui('795')).toBe('795');
  });

  it('rejects empty, 1-digit and over-10-digit input', () => {
    expect(normalizeCui('')).toBeNull();
    expect(normalizeCui('7')).toBeNull();
    expect(normalizeCui('12345678901')).toBeNull();
  });
});

describe('saveCuiPrefill / takeCuiPrefill', () => {
  it('hands the clean CUI over once, then forgets it', () => {
    const s = memoryStorage();
    saveCuiPrefill('RO 14399840', s);
    expect(takeCuiPrefill(s)).toBe('14399840');
    expect(takeCuiPrefill(s)).toBeNull();
  });

  it('does not store an invalid CUI', () => {
    const s = memoryStorage();
    saveCuiPrefill('abc', s);
    expect(s.length).toBe(0);
  });

  it('returns null without storage', () => {
    expect(takeCuiPrefill(undefined)).toBeNull();
  });
});
