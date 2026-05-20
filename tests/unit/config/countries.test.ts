import { describe, expect, it } from 'vitest';
import {
  COUNTRIES,
  EU_COUNTRIES,
  NON_EU_COUNTRIES,
  getCountriesForForeignType,
} from '@/config/countries';

describe('countries config', () => {
  it('has all 27 EU member states', () => {
    expect(EU_COUNTRIES).toHaveLength(27);
  });

  it('lists Romania as part of the EU', () => {
    expect(EU_COUNTRIES).toContain('România');
  });

  it('uses official Romanian name "Țările de Jos" (not "Olanda")', () => {
    // Romanian government / MAE official usage post-2020 Dutch rebrand.
    expect(EU_COUNTRIES).toContain('Țările de Jos');
    expect(EU_COUNTRIES).not.toContain('Olanda');
  });

  it('does not list the UK in the EU (post-Brexit)', () => {
    expect(EU_COUNTRIES).not.toContain('Marea Britanie');
  });

  it('all EU countries also appear in COUNTRIES', () => {
    for (const c of EU_COUNTRIES) {
      expect(COUNTRIES).toContain(c);
    }
  });

  it('NON_EU_COUNTRIES is the complement of EU within COUNTRIES', () => {
    expect(NON_EU_COUNTRIES.length).toBe(COUNTRIES.length - EU_COUNTRIES.length);
    for (const c of NON_EU_COUNTRIES) {
      expect(EU_COUNTRIES).not.toContain(c);
    }
  });
});

describe('getCountriesForForeignType', () => {
  it('returns EU list for "eu"', () => {
    const list = getCountriesForForeignType('eu');
    expect(list).toEqual(EU_COUNTRIES);
  });

  it('returns NON-EU list for "non-eu"', () => {
    const list = getCountriesForForeignType('non-eu');
    expect(list).toEqual(NON_EU_COUNTRIES);
  });

  it('returns full world list when foreignType is undefined', () => {
    const list = getCountriesForForeignType(undefined);
    expect(list).toEqual(COUNTRIES);
  });

  it('"eu" list does not contain non-EU countries like USA', () => {
    const list = getCountriesForForeignType('eu');
    expect(list).not.toContain('Statele Unite ale Americii');
  });

  it('"non-eu" list contains common non-EU pickees', () => {
    const list = getCountriesForForeignType('non-eu');
    expect(list).toContain('Statele Unite ale Americii');
    expect(list).toContain('Marea Britanie');
    expect(list).toContain('Turcia');
  });
});
