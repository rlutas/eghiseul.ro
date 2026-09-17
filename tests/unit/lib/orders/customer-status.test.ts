import { describe, it, expect } from 'vitest';
import { STATUS_OPTIONS } from '@/lib/admin/status-options';
import { CUSTOMER_STATUS, customerStatus, STATUS_TONE_CLASSES } from '@/lib/orders/customer-status';

/**
 * The account area used to carry its own short status map and fall back to
 * "În așteptare" for anything it did not know. Measured on production
 * 2026-09-17: a shipped order, one filed with the institution and one awaiting a
 * bank transfer all showed the same yellow "În așteptare" clock.
 *
 * This test is the guard: add a status to the admin list and it fails until the
 * customer wording exists too.
 */
describe('customer-facing order statuses', () => {
  it('describes every status an operator can set', () => {
    const missing = STATUS_OPTIONS.map((o) => o.value).filter((v) => !(v in CUSTOMER_STATUS));
    expect(missing, `statusuri fără traducere pentru client: ${missing.join(', ')}`).toEqual([]);
  });

  it('covers the statuses that never appear in the admin dropdown', () => {
    // Set by the app rather than by an operator, so they are not in
    // STATUS_OPTIONS — but a customer sees them.
    for (const status of ['draft', 'pending', 'pending_payment', 'abandoned']) {
      expect(CUSTOMER_STATUS[status], status).toBeDefined();
    }
  });

  it('distinguishes the three statuses that used to collapse into "În așteptare"', () => {
    const shipped = customerStatus('shipped');
    const filed = customerStatus('submitted_to_institution');
    const awaiting = customerStatus('awaiting_payment');

    expect(new Set([shipped.label, filed.label, awaiting.label]).size).toBe(3);
    expect(shipped.tone).toBe('done');
    expect(filed.tone).toBe('progress');
    expect(awaiting.tone).toBe('waiting');
  });

  it('marks refunded and cancelled as problems, not as pending work', () => {
    expect(customerStatus('refunded').tone).toBe('problem');
    expect(customerStatus('cancelled').tone).toBe('problem');
  });

  it('shows an unknown status verbatim instead of pretending it is pending', () => {
    expect(customerStatus('un_status_nou').label).toBe('un_status_nou');
  });

  it('falls back safely for a missing status', () => {
    expect(customerStatus(null).label).toBe('În așteptare');
    expect(customerStatus(undefined).label).toBe('În așteptare');
  });

  it('has classes for every tone used', () => {
    for (const entry of Object.values(CUSTOMER_STATUS)) {
      expect(STATUS_TONE_CLASSES[entry.tone], entry.label).toBeDefined();
    }
  });

  it('uses customer language, not operator language', () => {
    // "Trimis instituție" is what we do; the customer reads what happened to
    // their order.
    expect(customerStatus('submitted_to_institution').label).toBe('Depusă la instituție');
    expect(customerStatus('standby').label).not.toContain('SLA');
    expect(customerStatus('awaiting_payment').label).not.toContain('(');
  });
});
