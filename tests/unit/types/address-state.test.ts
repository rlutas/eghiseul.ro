import { describe, it, expect } from 'vitest';
import type { AddressState, DeliveryState } from '@/types/verification-modules';

/**
 * Type-level + structural tests for the AddressState/DeliveryState shape
 * after we extended AddressState with an optional `country?` field to
 * support international shipping (DHL / Poșta Română International).
 *
 * These tests run TypeScript through Vitest's typecheck phase plus at runtime
 * confirm that the field can be assigned/read without breaking existing
 * domestic-shipping shapes.
 */
describe('AddressState — international shipping fields', () => {
  it('accepts a Romanian (domestic) address without country', () => {
    const ro: AddressState = {
      county: 'Cluj',
      city: 'Cluj-Napoca',
      street: 'Memorandumului',
      number: '12',
      postalCode: '400114',
    };
    expect(ro.country).toBeUndefined();
    expect(ro.county).toBe('Cluj');
  });

  it('accepts an international address with country set', () => {
    const intl: AddressState = {
      county: '',
      city: 'München',
      street: 'Hauptstraße 25',
      number: '',
      postalCode: '80331',
      country: 'Germania',
    };
    expect(intl.country).toBe('Germania');
    // International shipments leave county empty
    expect(intl.county).toBe('');
  });

  it('country is optional (not required in type signature)', () => {
    const minimal: AddressState = {
      county: 'București',
      city: 'București',
      street: 'Calea Victoriei',
      number: '1',
    };
    expect(minimal).toBeDefined();
    expect(minimal.country).toBeUndefined();
  });
});

describe('DeliveryState — international courier providers', () => {
  it('accepts dhl_intl as courierProvider', () => {
    const dhl: DeliveryState = {
      method: 'courier',
      methodName: 'DHL Express International',
      price: 250,
      estimatedDays: 0,
      courierProvider: 'dhl_intl',
      courierService: 'DHL Express International',
      address: {
        county: '',
        city: 'Berlin',
        street: 'Unter den Linden 1',
        number: '',
        postalCode: '10117',
        country: 'Germania',
      },
    };
    expect(dhl.courierProvider).toBe('dhl_intl');
    expect(dhl.price).toBe(250);
    expect(dhl.address?.country).toBe('Germania');
  });

  it('accepts posta_intl as courierProvider', () => {
    const posta: DeliveryState = {
      method: 'courier',
      methodName: 'Poșta Română International',
      price: 100,
      estimatedDays: 0,
      courierProvider: 'posta_intl',
      courierService: 'Poșta Română International',
      address: {
        county: '',
        city: 'Wien',
        street: 'Stephansplatz 1',
        number: '',
        postalCode: '1010',
        country: 'Austria',
      },
    };
    expect(posta.courierProvider).toBe('posta_intl');
    expect(posta.price).toBe(100);
    expect(posta.address?.country).toBe('Austria');
  });

  it('email delivery never sets country', () => {
    const email: DeliveryState = {
      method: 'email',
      methodName: 'Email (PDF)',
      price: 0,
      estimatedDays: 0,
    };
    expect(email.address).toBeUndefined();
  });
});
