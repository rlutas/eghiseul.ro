import { describe, it, expect } from 'vitest';
import {
  describeSavedAddress,
  isRomanianSavedAddress,
  toDeliveryAddressFormValues,
  usableSavedAddresses,
  type SavedDeliveryAddress,
} from '@/lib/delivery/saved-address';

function address(overrides: Partial<SavedDeliveryAddress> = {}): SavedDeliveryAddress {
  return {
    id: 'a1',
    label: 'Acasă',
    country: 'România',
    county: 'Satu Mare',
    city: 'Satu Mare',
    street: 'Str. Mihai Viteazu',
    number: '10',
    postalCode: '440001',
    ...overrides,
  };
}

describe('isRomanianSavedAddress', () => {
  it('accepts România, Romania and RO', () => {
    expect(isRomanianSavedAddress(address({ country: 'România' }))).toBe(true);
    expect(isRomanianSavedAddress(address({ country: 'Romania' }))).toBe(true);
    expect(isRomanianSavedAddress(address({ country: 'RO' }))).toBe(true);
  });

  it('treats a missing country as domestic (older rows had no field)', () => {
    expect(isRomanianSavedAddress(address({ country: undefined }))).toBe(true);
    expect(isRomanianSavedAddress(address({ country: '  ' }))).toBe(true);
  });

  it('rejects a foreign address — Fan Courier/Sameday cannot ship it', () => {
    expect(isRomanianSavedAddress(address({ country: 'Germania' }))).toBe(false);
  });
});

describe('usableSavedAddresses', () => {
  it('keeps only complete Romanian addresses, in the given order', () => {
    const result = usableSavedAddresses([
      address({ id: 'ok-1' }),
      address({ id: 'foreign', country: 'Italia' }),
      address({ id: 'no-street', street: '' }),
      address({ id: 'no-city', city: '   ' }),
      address({ id: 'bad-county', county: 'Nicăieri' }),
      address({ id: 'ok-2', county: 'SM' }), // county stored as a code
    ]);
    expect(result.map((a) => a.id)).toEqual(['ok-1', 'ok-2']);
  });
});

describe('toDeliveryAddressFormValues', () => {
  it('fills every field of the delivery form', () => {
    expect(
      toDeliveryAddressFormValues(
        address({ building: 'A2', staircase: 'B', floor: '3', apartment: '45' }),
      ),
    ).toEqual({
      street: 'Str. Mihai Viteazu',
      number: '10',
      building: 'A2',
      staircase: 'B',
      floor: '3',
      apartment: '45',
      city: 'Satu Mare',
      county: 'Satu Mare',
      postalCode: '440001',
    });
  });

  it('canonicalises the county so it matches an option of the dropdown', () => {
    expect(toDeliveryAddressFormValues(address({ county: 'SM' })).county).toBe('Satu Mare');
    expect(toDeliveryAddressFormValues(address({ county: 'bucuresti' })).county).toBe('București');
  });

  it('drops a postal code that is not 6 digits instead of failing validation', () => {
    expect(toDeliveryAddressFormValues(address({ postalCode: '4400' })).postalCode).toBe('');
    expect(toDeliveryAddressFormValues(address({ postalCode: undefined })).postalCode).toBe('');
  });

  it('returns empty strings, never undefined (the form fields are controlled)', () => {
    const values = toDeliveryAddressFormValues({ id: 'x', street: 'Str. A', city: 'Cluj-Napoca', county: 'Cluj' });
    expect(values.number).toBe('');
    expect(values.building).toBe('');
    expect(values.apartment).toBe('');
  });
});

describe('describeSavedAddress', () => {
  it('shows the label plus the street, city and county', () => {
    expect(describeSavedAddress(address())).toBe(
      'Acasă — Str. Mihai Viteazu 10, Satu Mare, Satu Mare',
    );
  });

  it('omits the dash when there is no label', () => {
    expect(describeSavedAddress(address({ label: null }))).toBe(
      'Str. Mihai Viteazu 10, Satu Mare, Satu Mare',
    );
  });
});
