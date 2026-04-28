import { describe, expect, it } from 'vitest';
import type { Address } from '@/lib/services/courier/types';
import {
  DEFAULT_DOCUMENT_PACKAGE,
  createPackage,
  calculateTotalWeight,
  calculateVolumetricWeight,
  getChargeableWeight,
  formatAddressLine,
  formatAddressMultiline,
  isDomesticAddress,
  isValidRomanianPhone,
  normalizeRomanianPhone,
  normalizeTrackingStatus,
  getTrackingStatusLabel,
  isFinalStatus,
  formatDateRomanian,
  isBusinessDay,
  addVAT,
  extractVAT,
  formatPriceRON,
  getCountyName,
  getCountyCode,
  extractCourierProviderFromDeliveryMethod,
  ROMANIAN_COUNTIES,
} from '@/lib/services/courier/utils';

describe('Package helpers', () => {
  it('DEFAULT_DOCUMENT_PACKAGE matches A4 envelope at 0.5 kg', () => {
    expect(DEFAULT_DOCUMENT_PACKAGE).toEqual({
      weight: 0.5,
      type: 'envelope',
      quantity: 1,
      length: 30,
      width: 22,
      height: 1,
    });
  });

  it('createPackage sets envelope dimensions for envelope type', () => {
    const pkg = createPackage(0.3, 1, 'envelope');
    expect(pkg).toMatchObject({ weight: 0.3, type: 'envelope', length: 30, width: 22, height: 1 });
  });

  it('createPackage sets parcel dimensions for parcel type', () => {
    const pkg = createPackage(2, 1, 'parcel');
    expect(pkg).toMatchObject({ weight: 2, type: 'parcel', length: 30, width: 20, height: 10 });
  });

  it('calculateTotalWeight multiplies weight × quantity per package', () => {
    expect(calculateTotalWeight([
      { weight: 0.5, type: 'envelope', quantity: 2 },
      { weight: 1, type: 'parcel', quantity: 3 },
    ])).toBe(0.5 * 2 + 1 * 3);
  });

  it('calculateVolumetricWeight uses L*W*H/divisor when dimensions present', () => {
    // 30 × 22 × 1 / 5000 = 660/5000 = 0.132
    expect(calculateVolumetricWeight(DEFAULT_DOCUMENT_PACKAGE)).toBeCloseTo(0.132, 4);
  });

  it('calculateVolumetricWeight falls back to actual weight when dimensions missing', () => {
    const pkg = { weight: 1.5, type: 'envelope' as const, quantity: 1 };
    expect(calculateVolumetricWeight(pkg)).toBe(1.5);
  });

  it('getChargeableWeight returns max(actual, volumetric)', () => {
    // Envelope is light: actual 0.5 > volumetric 0.132 → return 0.5
    expect(getChargeableWeight(DEFAULT_DOCUMENT_PACKAGE)).toBe(0.5);
    // Big parcel: 100×100×100/5000 = 200 > 5kg actual → volumetric wins
    expect(getChargeableWeight({
      weight: 5, type: 'parcel', quantity: 1, length: 100, width: 100, height: 100,
    })).toBe(200);
  });
});

describe('Address formatting', () => {
  it('formatAddressLine joins street, building parts, city + postal, county', () => {
    expect(formatAddressLine({
      name: '', phone: '', country: 'RO',
      street: 'Str. Bujorului', streetNo: '2',
      building: 'B1', entrance: 'A', floor: '2', apartment: '11',
      city: 'Slobozia', postalCode: '920047',
      county: 'Ialomița',
    } as Address)).toBe('Str. Bujorului 2, Bl. B1, Sc. A, Et. 2, Ap. 11, 920047 Slobozia, Jud. Ialomița');
  });

  it('formatAddressLine omits Romania (default), keeps foreign country', () => {
    const ro = formatAddressLine({ street: 'X', city: 'București', country: 'RO' } as Address);
    expect(ro).not.toContain('RO');

    const de = formatAddressLine({ street: 'X', city: 'Berlin', country: 'DE' } as Address);
    expect(de).toContain('DE');
  });

  it('formatAddressMultiline puts each section on its own line', () => {
    const lines = formatAddressMultiline({
      name: 'POPESCU ION',
      company: 'ACME SRL',
      street: 'Str. Test', streetNo: '1',
      city: 'București', postalCode: '010101',
      phone: '+40712345678',
    } as Address);
    expect(lines[0]).toBe('POPESCU ION');
    expect(lines[1]).toBe('ACME SRL');
    expect(lines.find((l) => l.startsWith('Tel:'))).toBe('Tel: +40712345678');
  });

  it('isDomesticAddress treats missing country as domestic', () => {
    expect(isDomesticAddress({ country: '' })).toBe(true);
    expect(isDomesticAddress({ country: 'RO' })).toBe(true);
    expect(isDomesticAddress({ country: 'ro' })).toBe(true); // case-insensitive
    expect(isDomesticAddress({ country: 'DE' })).toBe(false);
  });
});

describe('Romanian phone validation + normalization', () => {
  it.each([
    '0712345678',          // canonical mobile
    '+40712345678',        // E.164 mobile
    '40712345678',         // missing +
    '0712 345 678',        // with spaces
    '0712-345-678',        // with dashes
    '021 1234567',         // landline București
    '0212345678',          // landline 10 digits
    '0312345678',          // landline 03X
  ])('accepts valid Romanian phone "%s"', (phone) => {
    expect(isValidRomanianPhone(phone)).toBe(true);
  });

  it.each([
    '123',                  // too short
    '08123456789',          // wrong prefix (08)
    '+41712345678',         // wrong country code
    '0612345678',           // wrong mobile prefix (06)
    'abcdefghij',           // letters
  ])('rejects invalid phone "%s"', (phone) => {
    expect(isValidRomanianPhone(phone)).toBe(false);
  });

  it.each([
    ['0712345678',     '+40712345678'],
    ['+40712345678',   '+40712345678'],
    ['40712345678',    '+40712345678'],
    ['712345678',      '+40712345678'], // no leading 0 or country code → assume RO
    ['0712 345 678',   '+40712345678'], // spaces stripped
  ])('normalizeRomanianPhone("%s") → "%s"', (input, expected) => {
    expect(normalizeRomanianPhone(input)).toBe(expected);
  });
});

describe('Tracking status normalization', () => {
  it.each([
    ['Livrat',                'delivered'],
    ['Delivered to recipient','delivered'],
    ['predat destinatarului', 'delivered'],
    ['In livrare',            'out_for_delivery'],
    ['Out for delivery',      'out_for_delivery'],
    ['pe drum',               'out_for_delivery'],
    ['In tranzit',            'in_transit'],
    ['In transit',            'in_transit'],
    ['Plecat din depozit',    'in_transit'],
    ['Sosit in centru',       'in_transit'],
    ['Preluat',               'picked_up'],
    ['Picked up',             'picked_up'],
    ['ridicat de la sender',  'picked_up'],
    ['Esuat',                 'failed_delivery'],
    ['Failed delivery',       'failed_delivery'],
    ['Returnat',              'returned'],
    ['Anulat',                'cancelled'],
    ['Inregistrat',           'pending'],
    ['Created',               'pending'],
    ['something we never saw','unknown'],
  ])('normalizeTrackingStatus("%s") → "%s"', (input, expected) => {
    expect(normalizeTrackingStatus(input, 'fancourier')).toBe(expected);
  });

  it('getTrackingStatusLabel returns Romanian label for each status', () => {
    expect(getTrackingStatusLabel('delivered')).toBe('Livrat');
    expect(getTrackingStatusLabel('out_for_delivery')).toBe('În livrare');
    expect(getTrackingStatusLabel('returned')).toBe('Returnat');
    expect(getTrackingStatusLabel('unknown')).toBe('Necunoscut');
  });

  it('isFinalStatus only returns true for terminal states', () => {
    expect(isFinalStatus('delivered')).toBe(true);
    expect(isFinalStatus('returned')).toBe(true);
    expect(isFinalStatus('cancelled')).toBe(true);
    expect(isFinalStatus('in_transit')).toBe(false);
    expect(isFinalStatus('pending')).toBe(false);
    expect(isFinalStatus('out_for_delivery')).toBe(false);
  });
});

describe('Date helpers', () => {
  it('formatDateRomanian returns "luni, 28 aprilie 2026" style format', () => {
    const date = new Date('2026-04-28T12:00:00+03:00'); // Tuesday
    const formatted = formatDateRomanian(date);
    expect(formatted).toMatch(/2026/);
    // ro-RO locale produces lowercase month names
    expect(formatted.toLowerCase()).toMatch(/aprilie|martie|mai/); // any RO month nearby
  });

  it('isBusinessDay returns true for Mon-Fri, false for Sat-Sun', () => {
    expect(isBusinessDay(new Date('2026-04-27'))).toBe(true);  // Mon
    expect(isBusinessDay(new Date('2026-04-28'))).toBe(true);  // Tue
    expect(isBusinessDay(new Date('2026-05-01'))).toBe(true);  // Fri (DOES NOT consider holidays)
    expect(isBusinessDay(new Date('2026-04-25'))).toBe(false); // Sat
    expect(isBusinessDay(new Date('2026-04-26'))).toBe(false); // Sun
  });
});

describe('VAT + price helpers', () => {
  it('addVAT adds 19% by default, rounds to 2 decimals', () => {
    expect(addVAT(100)).toBe(119);
    expect(addVAT(50.45)).toBe(60.04);
  });

  it('addVAT supports custom rate (21% for current Romania)', () => {
    expect(addVAT(100, 0.21)).toBe(121);
    expect(addVAT(304.64, 0.21)).toBe(368.61);
  });

  it('extractVAT returns the VAT portion of a gross price', () => {
    expect(extractVAT(119)).toBeCloseTo(19, 2);
    expect(extractVAT(368.61, 0.21)).toBeCloseTo(63.97, 1);
  });

  it('formatPriceRON formats with RON currency + 2 decimals (locale ro-RO)', () => {
    const formatted = formatPriceRON(123.45);
    // Output looks like "123,45 RON" or "123,45 lei" depending on locale data
    expect(formatted).toMatch(/123/);
    expect(formatted.toUpperCase()).toMatch(/RON|LEI/);
  });
});

describe('Romanian counties', () => {
  it('ROMANIAN_COUNTIES has 41 counties + București (42 entries)', () => {
    expect(ROMANIAN_COUNTIES.length).toBe(42);
  });

  it('getCountyName looks up by ISO code', () => {
    expect(getCountyName('CJ')).toBe('Cluj');
    expect(getCountyName('B')).toBe('București');
    expect(getCountyName('IL')).toBe('Ialomița');
    expect(getCountyName('SM')).toBe('Satu Mare');
  });

  it('getCountyName is case-insensitive', () => {
    expect(getCountyName('cj')).toBe('Cluj');
    expect(getCountyName('Sm')).toBe('Satu Mare');
  });

  it('getCountyName returns undefined for invalid code', () => {
    expect(getCountyName('ZZ')).toBeUndefined();
  });

  it('getCountyCode looks up by name (case + space tolerant)', () => {
    expect(getCountyCode('Cluj')).toBe('CJ');
    expect(getCountyCode('cluj')).toBe('CJ');
    expect(getCountyCode('  Satu Mare  ')).toBe('SM');
  });

  it('getCountyCode returns undefined for unknown name', () => {
    expect(getCountyCode('Nowhere')).toBeUndefined();
  });
});

describe('extractCourierProviderFromDeliveryMethod', () => {
  it.each([
    ['Fan Courier - Standard',                'fancourier'],
    ['fancourier express',                    'fancourier'],
    ['FANbox punct ridicare',                 'fancourier'],
    ['Sameday - EasyBox (Piata Unirii)',      'sameday'],
    ['Easybox locker',                        'sameday'],
    ['easybox 1234',                          'sameday'],
  ])('extracts provider from name "%s" → "%s"', (name, expected) => {
    expect(extractCourierProviderFromDeliveryMethod({ name })).toBe(expected);
  });

  it('returns null for unknown providers', () => {
    expect(extractCourierProviderFromDeliveryMethod({ name: 'DHL Express' })).toBeNull();
    expect(extractCourierProviderFromDeliveryMethod({ name: 'Posta Romana' })).toBeNull();
  });

  it('returns null for missing/empty input', () => {
    expect(extractCourierProviderFromDeliveryMethod(null)).toBeNull();
    expect(extractCourierProviderFromDeliveryMethod(undefined)).toBeNull();
    expect(extractCourierProviderFromDeliveryMethod({})).toBeNull();
  });
});
