import { describe, expect, it } from 'vitest';
import {
  describeDisputeRow,
  disputedChargeId,
  disputeStatusRo,
  isDisputeRow,
} from '@/lib/accounting/disputes';

describe('disputedChargeId', () => {
  it('reads the charge from a chargeback withdrawal', () => {
    expect(disputedChargeId('Chargeback withdrawal for ch_3Ton2UHGb8JBHhcl1stLZfNI')).toBe(
      'ch_3Ton2UHGb8JBHhcl1stLZfNI'
    );
    expect(disputedChargeId('Chargeback withdrawal for py_3SurUyHGb8JBHhcl0ojAQEk7')).toBe(
      'py_3SurUyHGb8JBHhcl0ojAQEk7'
    );
  });
  it('returns null without a reference', () => {
    expect(disputedChargeId('Chargeback reversal')).toBeNull();
    expect(disputedChargeId(null)).toBeNull();
  });
});

describe('isDisputeRow', () => {
  it('detects dispute rows by reporting category or description', () => {
    expect(isDisputeRow({ type: 'adjustment', description: 'x', raw: { reporting_category: 'dispute' } })).toBe(true);
    expect(isDisputeRow({ type: 'adjustment', description: 'Chargeback reversal', raw: {} })).toBe(true);
    expect(isDisputeRow({ type: 'stripe_fee', description: 'Card Dispute Countered Fee (2026-02-21)', raw: {} })).toBe(true);
  });
  it('ignores ordinary rows', () => {
    expect(isDisputeRow({ type: 'charge', description: 'Plată Extras Carte Funciară', raw: { reporting_category: 'charge' } })).toBe(false);
    expect(isDisputeRow({ type: 'stripe_fee', description: 'Billing - Usage Fee', raw: {} })).toBe(false);
  });
});

describe('describeDisputeRow', () => {
  it('explains the 08.09.2026 withdrawal (−79,99 + 100 lei fee) under review', () => {
    const text = describeDisputeRow(
      { type: 'adjustment', gross_bani: -7999, fee_bani: 10000, description: 'Chargeback withdrawal for ch_x' },
      { status: 'under_review', reason: 'product_unacceptable', evidenceDueBy: '2026-10-16' },
      { invoice_number: 'EGI2024-24278', client_name: 'Client', available_on: '2026-07-07' }
    );
    expect(text).toMatch(/^Dispută bancară: retras 79,99 lei \+ 100,00 lei comision Stripe/);
    expect(text).toContain('contestată de noi, așteptăm decizia băncii');
    expect(text).toContain('produs neconform');
    expect(text).toContain('factura inițială EGI2024-24278');
    expect(text).not.toContain('termen răspuns');
  });

  it('shows the deadline while we still have to answer', () => {
    const text = describeDisputeRow(
      { type: 'adjustment', gross_bani: -7999, fee_bani: 10000, description: null },
      { status: 'needs_response', reason: 'fraudulent', evidenceDueBy: '2026-10-16' },
      null
    );
    expect(text).toContain('termen răspuns 2026-10-16');
  });

  it('labels the reversal and the fee lines', () => {
    expect(
      describeDisputeRow({ type: 'adjustment', gross_bani: 35000, fee_bani: -10000, description: 'Chargeback reversal' }, null, null)
    ).toMatch(/^Dispută bancară: bani returnați nouă 350,00 lei/);
    expect(
      describeDisputeRow({ type: 'stripe_fee', gross_bani: -10000, fee_bani: 0, description: 'Card Dispute Countered Fee' }, null, null)
    ).toMatch(/^Comision Stripe pentru dispută/);
  });
});

describe('disputeStatusRo', () => {
  it('maps Stripe statuses', () => {
    expect(disputeStatusRo('won')).toBe('câștigată, banii revin');
    expect(disputeStatusRo('lost')).toContain('storno');
    expect(disputeStatusRo(null)).toBe('stare necunoscută');
  });
});
