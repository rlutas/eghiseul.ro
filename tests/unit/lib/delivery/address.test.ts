import { describe, it, expect } from 'vitest';
import { hasDeliveryAddressData, isEmailOnlyDelivery } from '@/lib/delivery/address';

describe('hasDeliveryAddressData', () => {
  it('is false for null/undefined', () => {
    expect(hasDeliveryAddressData(null)).toBe(false);
    expect(hasDeliveryAddressData(undefined)).toBe(false);
  });

  it('is false for the all-empty object the wizard saves on email orders', () => {
    // E-260721-VJWWN, exact shape from the DB
    expect(
      hasDeliveryAddressData({
        city: '',
        county: '',
        number: '',
        street: '',
        country: '',
        postalCode: '',
        recipientName: '',
        recipientPhone: '',
      }),
    ).toBe(false);
  });

  it('is false when values are whitespace only', () => {
    expect(hasDeliveryAddressData({ street: '   ', city: '\n' })).toBe(false);
  });

  it('is true for a real street address', () => {
    expect(hasDeliveryAddressData({ street: 'Bd. Unirii', city: 'București' })).toBe(true);
  });

  it('is true when only the recipient was captured', () => {
    expect(hasDeliveryAddressData({ street: '', recipientName: 'Popescu Ion' })).toBe(true);
  });
});

describe('isEmailOnlyDelivery', () => {
  const emailOrder = {
    deliveryType: 'email',
    address: { street: '', city: '', recipientName: '', recipientPhone: '' },
    courierProvider: null,
    trackingNumber: null,
  };

  it('hides the card for an email order with an empty address object', () => {
    expect(isEmailOnlyDelivery(emailOrder)).toBe(true);
  });

  it('hides the card when no address is stored at all', () => {
    expect(isEmailOnlyDelivery({ ...emailOrder, address: null })).toBe(true);
  });

  it('keeps the card when a courier is attached', () => {
    expect(isEmailOnlyDelivery({ ...emailOrder, courierProvider: 'sameday' })).toBe(false);
  });

  it('keeps the card when an AWB exists', () => {
    expect(isEmailOnlyDelivery({ ...emailOrder, trackingNumber: '2SD1234' })).toBe(false);
  });

  it('keeps the card when a real address was filled in', () => {
    expect(
      isEmailOnlyDelivery({ ...emailOrder, address: { street: 'Bd. Unirii 3', city: 'București' } }),
    ).toBe(false);
  });

  it('keeps the card for courier deliveries', () => {
    expect(isEmailOnlyDelivery({ ...emailOrder, deliveryType: 'courier' })).toBe(false);
  });
});
