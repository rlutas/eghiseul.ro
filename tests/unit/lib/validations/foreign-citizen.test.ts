import { describe, expect, it } from 'vitest';
import {
  validateForeignKyc,
  type ForeignKycValidationInput,
} from '@/lib/validations/foreign-citizen';

const VALID_CNP_M = '1850101400017';

const baseRomanian: ForeignKycValidationInput = {
  citizenship: 'romanian',
  cnp: VALID_CNP_M,
  firstName: 'Ion',
  lastName: 'Popescu',
  birthDate: '1985-01-01',
  address: { street: 'Str. Salcâmilor 5', city: 'București', county: 'București' },
};

const baseForeignEU: ForeignKycValidationInput = {
  citizenship: 'european',
  firstName: 'Hans',
  lastName: 'Mueller',
  birthDate: '1985-05-12',
  foreignData: {
    birthCity: 'Berlin',
    birthCountry: 'Germania',
    hasRomanianAddress: true,
  },
  address: { street: 'Str. Aviatorilor 10', city: 'București', county: 'București' },
};

describe('validateForeignKyc — Romanian citizen', () => {
  it('passes with all fields filled and valid CNP', () => {
    expect(validateForeignKyc(baseRomanian)).toBeNull();
  });

  it('fails when CNP is missing', () => {
    expect(validateForeignKyc({ ...baseRomanian, cnp: '' })).toBe('cnp_invalid');
  });

  it('fails when CNP is invalid (bad checksum)', () => {
    expect(validateForeignKyc({ ...baseRomanian, cnp: '1234567890123' })).toBe(
      'cnp_invalid'
    );
  });

  it('fails when first name missing', () => {
    expect(validateForeignKyc({ ...baseRomanian, firstName: '   ' })).toBe(
      'first_name_required'
    );
  });

  it('fails when birth date missing', () => {
    expect(validateForeignKyc({ ...baseRomanian, birthDate: '' })).toBe(
      'birth_date_required'
    );
  });
});

describe('validateForeignKyc — Foreign citizen, hasRomanianAddress = true', () => {
  it('passes with full foreign-EU data + Romanian address', () => {
    expect(validateForeignKyc(baseForeignEU)).toBeNull();
  });

  it('passes when CNP is empty (CNP optional for foreign)', () => {
    expect(validateForeignKyc({ ...baseForeignEU, cnp: undefined })).toBeNull();
  });

  it('passes when CNP empty string', () => {
    expect(validateForeignKyc({ ...baseForeignEU, cnp: '' })).toBeNull();
  });

  it('fails when CNP is provided but invalid', () => {
    expect(
      validateForeignKyc({ ...baseForeignEU, cnp: '1234567890123' })
    ).toBe('cnp_invalid');
  });

  it('fails when birth city missing', () => {
    expect(
      validateForeignKyc({
        ...baseForeignEU,
        foreignData: { ...baseForeignEU.foreignData, birthCity: '' },
      })
    ).toBe('birth_city_required');
  });

  it('fails when birth country missing', () => {
    expect(
      validateForeignKyc({
        ...baseForeignEU,
        foreignData: { ...baseForeignEU.foreignData, birthCountry: '' },
      })
    ).toBe('birth_country_required');
  });

  it('fails when Romanian address is incomplete (street missing)', () => {
    expect(
      validateForeignKyc({
        ...baseForeignEU,
        address: { ...baseForeignEU.address, street: '' },
      })
    ).toBe('street_required');
  });

  it('fails when Romanian address is incomplete (county missing)', () => {
    expect(
      validateForeignKyc({
        ...baseForeignEU,
        address: { ...baseForeignEU.address, county: '' },
      })
    ).toBe('county_required');
  });
});

describe('validateForeignKyc — Foreign citizen, hasRomanianAddress = false', () => {
  const baseForeignAbroad: ForeignKycValidationInput = {
    citizenship: 'foreign',
    firstName: 'John',
    lastName: 'Smith',
    birthDate: '1990-03-15',
    foreignData: {
      birthCity: 'New York',
      birthCountry: 'Statele Unite ale Americii',
      hasRomanianAddress: false,
      foreignAddress: '5th Avenue 1, New York, NY 10001',
    },
  };

  it('passes with foreign address filled, no Romanian address required', () => {
    expect(validateForeignKyc(baseForeignAbroad)).toBeNull();
  });

  it('passes WITHOUT Romanian address when hasRomanianAddress=false', () => {
    expect(
      validateForeignKyc({
        ...baseForeignAbroad,
        address: undefined, // Romanian address completely absent
      })
    ).toBeNull();
  });

  it('fails when foreignAddress is empty', () => {
    expect(
      validateForeignKyc({
        ...baseForeignAbroad,
        foreignData: {
          ...baseForeignAbroad.foreignData,
          foreignAddress: '',
        },
      })
    ).toBe('foreign_address_required');
  });

  it('still fails when birth city/country missing even abroad', () => {
    expect(
      validateForeignKyc({
        ...baseForeignAbroad,
        foreignData: {
          ...baseForeignAbroad.foreignData,
          birthCity: '',
        },
      })
    ).toBe('birth_city_required');
  });
});
