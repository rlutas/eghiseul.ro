import { describe, it, expect } from 'vitest';
import {
  resolveCivilTermTier,
  CIVIL_REGISTRATION_OPTIONS,
  DEFAULT_CIVIL_TERM_TIERS,
  type CivilTermTiers,
} from '@/lib/civil-status/delivery-terms';

/**
 * Unit tests for the civil-status delivery-term resolver — the logic that maps
 * the selected registration office (registrationPlace) onto a delivery-term tier
 * (slow / fast / default). Pure function, deterministic.
 */

describe('resolveCivilTermTier', () => {
  it('treats any București sector as SLOW (15-30)', () => {
    for (let i = 1; i <= 6; i++) {
      const r = resolveCivilTermTier(`București (Sectorul ${i})`);
      expect(r.tier).toBe('slow');
      expect(r.display).toBe('15-30 zile lucrătoare');
      expect(r.minDays).toBe(15);
      expect(r.maxDays).toBe(30);
    }
  });

  it('matches București without diacritics too', () => {
    expect(resolveCivilTermTier('Bucuresti').tier).toBe('slow');
  });

  it('maps a configured fast county to FAST (5-7)', () => {
    const r = resolveCivilTermTier('Satu Mare');
    expect(r.tier).toBe('fast');
    expect(r.display).toBe('5-7 zile lucrătoare');
    expect(r.minDays).toBe(5);
    expect(r.maxDays).toBe(7);
  });

  it('is case-insensitive for fast counties', () => {
    expect(resolveCivilTermTier('satu mare').tier).toBe('fast');
    expect(resolveCivilTermTier('SATU MARE').tier).toBe('fast');
  });

  it('falls back to DEFAULT (7-15) for any other county', () => {
    const r = resolveCivilTermTier('Cluj');
    expect(r.tier).toBe('default');
    expect(r.display).toBe('7-15 zile lucrătoare');
  });

  it('returns DEFAULT for empty / undefined input', () => {
    expect(resolveCivilTermTier(undefined).tier).toBe('default');
    expect(resolveCivilTermTier('').tier).toBe('default');
    expect(resolveCivilTermTier('   ').tier).toBe('default');
  });

  it('honors a custom tiers config (admin-edited)', () => {
    const custom: CivilTermTiers = {
      slow: { display: 'lent', minDays: 20, maxDays: 40 },
      fast: { display: 'rapid', minDays: 3, maxDays: 5, counties: ['Bihor', 'Timiș'] },
      default: { display: 'normal', minDays: 8, maxDays: 12 },
    };
    expect(resolveCivilTermTier('Bihor', custom).tier).toBe('fast');
    expect(resolveCivilTermTier('Bihor', custom).display).toBe('rapid');
    // Satu Mare is NOT in the custom fast list → default
    expect(resolveCivilTermTier('Satu Mare', custom).tier).toBe('default');
    // București still slow regardless of config
    expect(resolveCivilTermTier('București (Sectorul 2)', custom).tier).toBe('slow');
  });
});

describe('CIVIL_REGISTRATION_OPTIONS', () => {
  it('expands București into 6 sectors and excludes the bare "București"', () => {
    expect(CIVIL_REGISTRATION_OPTIONS).not.toContain('București');
    for (let i = 1; i <= 6; i++) {
      expect(CIVIL_REGISTRATION_OPTIONS).toContain(`București (Sectorul ${i})`);
    }
  });

  it('includes ordinary counties', () => {
    expect(CIVIL_REGISTRATION_OPTIONS).toContain('Cluj');
    expect(CIVIL_REGISTRATION_OPTIONS).toContain('Satu Mare');
  });

  it('every option resolves to a known tier', () => {
    for (const opt of CIVIL_REGISTRATION_OPTIONS) {
      const tier = resolveCivilTermTier(opt).tier;
      expect(['slow', 'fast', 'default']).toContain(tier);
    }
  });
});

describe('DEFAULT_CIVIL_TERM_TIERS', () => {
  it('has the expected baseline displays', () => {
    expect(DEFAULT_CIVIL_TERM_TIERS.slow.display).toBe('15-30 zile lucrătoare');
    expect(DEFAULT_CIVIL_TERM_TIERS.fast.display).toBe('5-7 zile lucrătoare');
    expect(DEFAULT_CIVIL_TERM_TIERS.default.display).toBe('7-15 zile lucrătoare');
    expect(DEFAULT_CIVIL_TERM_TIERS.fast.counties).toContain('Satu Mare');
  });
});
