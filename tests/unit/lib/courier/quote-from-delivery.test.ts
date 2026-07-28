/**
 * Cotația curierului dedusă din `delivery_method`.
 *
 * Context (28.07.2026): niciuna dintre cele 5 comenzi Sameday cu livrare în
 * easybox nu avea AWB, fiindcă lockerul ales nu se salva nicăieri, iar Sameday
 * cere id-ul lui (`oohLastMile`). Acum lockerul se scrie pe `delivery_method`
 * și în `courier_quote`; pentru comenzile vechi, numele se recuperează din
 * denumirea afișată.
 */
import { describe, expect, it } from 'vitest';
import { extractCourierQuote } from '@/lib/courier/quote-from-delivery';

describe('extractCourierQuote', () => {
  it('folosește lockerul salvat pe delivery_method (comenzi noi)', () => {
    expect(
      extractCourierQuote({
        name: 'Livrare România · Sameday - EasyBox (easybox Kripton)',
        service: 'LOCKER_NEXTDAY',
        locker_id: '3386',
        locker_name: 'easybox Kripton',
        locker_address: 'Str. Octavian Augustus, Nr. 3, Brasov',
      })
    ).toEqual({
      service: 'LOCKER_NEXTDAY',
      lockerId: '3386',
      lockerName: 'easybox Kripton',
      lockerAddress: 'Str. Octavian Augustus, Nr. 3, Brasov',
    });
  });

  it('recuperează numele lockerului din denumire când id-ul lipsește (comenzi vechi)', () => {
    const q = extractCourierQuote({
      name: 'Livrare România · Sameday - EasyBox (easybox Kripton)',
      service: 'LOCKER_NEXTDAY',
    });
    expect(q?.lockerName).toBe('easybox Kripton');
    expect(q?.lockerId).toBeUndefined(); // → AWB-ul NU se poate emite automat
    expect(q?.service).toBe('LOCKER_NEXTDAY');
  });

  it('deduce serviciul din denumire când nu e salvat', () => {
    expect(extractCourierQuote({ name: 'Fan Courier - FANbox Cluj' })?.service).toBe('FANbox');
    expect(extractCourierQuote({ name: 'Sameday - Standard 24h' })?.service).toBe('STANDARD_24H');
    expect(extractCourierQuote({ name: 'Fan Courier - Standard' })?.service).toBe('Standard');
  });

  it('serviciul salvat bate deducerea din denumire', () => {
    expect(
      extractCourierQuote({ name: 'Livrare România · Sameday - Standard', service: 'LOCKER_NEXTDAY' })?.service
    ).toBe('LOCKER_NEXTDAY');
  });

  it('nu confundă parantezele din alte denumiri cu un locker', () => {
    // Livrare la adresă: fără paranteză finală → fără locker.
    const q = extractCourierQuote({ name: 'Livrare România · Sameday - Next Day' });
    expect(q?.lockerName).toBeUndefined();
  });

  it('null pentru metodă lipsă sau nerecunoscută', () => {
    expect(extractCourierQuote(null)).toBeNull();
    expect(extractCourierQuote({ name: 'Ridicare personală' })).toBeNull();
  });
});
