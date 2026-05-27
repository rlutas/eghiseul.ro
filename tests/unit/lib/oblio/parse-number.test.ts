import { describe, expect, it } from 'vitest';
import { parseInvoiceNumber } from '@/lib/oblio/parse-number';

// Splits "EGH-0001" back into the seriesName + number parts the Oblio API
// expects. Used by the Storno + Reemite reissue flow — a wrong parse here
// means we cancel the wrong invoice (or none at all).

describe('parseInvoiceNumber', () => {
  it('parses the standard EGH-0001 format', () => {
    expect(parseInvoiceNumber('EGH-0001')).toEqual({
      seriesName: 'EGH',
      number: '0001',
    });
  });

  it('handles legacy rows without zero-padding', () => {
    expect(parseInvoiceNumber('EGH-1')).toEqual({
      seriesName: 'EGH',
      number: '1',
    });
    expect(parseInvoiceNumber('EGH-127')).toEqual({
      seriesName: 'EGH',
      number: '127',
    });
  });

  it('handles multi-segment series names by taking last numeric group', () => {
    // If we ever introduce series like "EGH-PJ-0001" for PJ invoices,
    // the seriesName carries the full prefix and the trailing digits
    // are the number.
    expect(parseInvoiceNumber('EGH-PJ-0001')).toEqual({
      seriesName: 'EGH-PJ',
      number: '0001',
    });
  });

  it('returns null for empty / whitespace input', () => {
    expect(parseInvoiceNumber('')).toBeNull();
    expect(parseInvoiceNumber('   ')).toBeNull();
  });

  it('returns null for malformed input (no dash, no trailing digits)', () => {
    expect(parseInvoiceNumber('EGH0001')).toBeNull();    // no dash
    expect(parseInvoiceNumber('EGH-')).toBeNull();        // no number
    expect(parseInvoiceNumber('EGH-ABC')).toBeNull();     // number not numeric
    expect(parseInvoiceNumber('-1234')).toBeNull();       // empty series
  });

  it('trims whitespace', () => {
    expect(parseInvoiceNumber('  EGH-0001  ')).toEqual({
      seriesName: 'EGH',
      number: '0001',
    });
  });
});
