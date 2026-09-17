import { describe, it, expect } from 'vitest';
import {
  customerNextStep,
  estimatedReadyDate,
  formatReadyDate,
  NEXT_STEP_STATUSES,
  CUSTOMER_STATUS_KEYS,
} from '@/lib/orders/customer-next-step';
import { STATUS_OPTIONS } from '@/lib/admin/status-options';

describe('coverage', () => {
  it('describes every status the operator workflow can produce', () => {
    // The admin list is the source of truth for what exists. A status added
    // there without a next step here leaves the customer reading a label and
    // nothing else.
    for (const option of STATUS_OPTIONS) {
      expect(customerNextStep(option.value), option.value).not.toBeNull();
    }
  });

  it('describes every status the customer vocabulary knows', () => {
    for (const status of CUSTOMER_STATUS_KEYS) {
      expect(customerNextStep(status), status).not.toBeNull();
    }
  });

  it('does not describe statuses that do not exist', () => {
    for (const status of NEXT_STEP_STATUSES) {
      expect(CUSTOMER_STATUS_KEYS, status).toContain(status);
    }
  });

  it('returns null rather than inventing a next step', () => {
    expect(customerNextStep('ceva_nou')).toBeNull();
    expect(customerNextStep(null)).toBeNull();
  });
});

describe('who is acting', () => {
  it('names the institution where the wait is genuinely theirs', () => {
    // "În curs" for a file sitting at the IPJ is the answer that made people
    // call. Saying who holds it is the honest version.
    expect(customerNextStep('submitted_to_institution')?.actor).toBe('institutia');
    expect(customerNextStep('on_hold_institution')?.actor).toBe('institutia');
  });

  it('keeps the work ours while it is ours', () => {
    for (const status of ['paid', 'processing', 'documents_generated', 'la_tradus', 'document_ready']) {
      expect(customerNextStep(status)?.actor, status).toBe('noi');
    }
  });
});

describe('needsCustomerAction', () => {
  it('is true for exactly the statuses where the order cannot move without them', () => {
    const blocking = NEXT_STEP_STATUSES.filter((s) => customerNextStep(s)?.needsCustomerAction);
    expect(blocking.sort()).toEqual(
      ['awaiting_payment', 'draft', 'pending_payment', 'standby'].sort()
    );
  });

  it('is the single live status that blocks work — 15 orders sit there today', () => {
    expect(customerNextStep('standby')?.needsCustomerAction).toBe(true);
    expect(customerNextStep('standby')?.action?.kind).toBe('contact');
  });

  it('is false for everything we or the institution owe', () => {
    for (const status of ['processing', 'submitted_to_institution', 'on_hold_institution', 'shipped']) {
      expect(customerNextStep(status)?.needsCustomerAction, status).toBe(false);
    }
  });
});

describe('estimatedReadyDate', () => {
  const paidAt = '2026-09-01T10:00:00Z';

  it('prefers the date the team put on the order', () => {
    const estimate = estimatedReadyDate({
      status: 'processing',
      estimatedCompletionDate: '2026-09-10',
      paidAt,
      estimatedDays: 30,
    });
    expect(estimate?.source).toBe('set');
    expect(estimate?.date.toISOString().slice(0, 10)).toBe('2026-09-10');
  });

  it('falls back to payment + the service term — 205 of 439 paid orders have no date set', () => {
    const estimate = estimatedReadyDate({ status: 'processing', paidAt, estimatedDays: 5 });
    expect(estimate?.source).toBe('computed');
    expect(estimate?.date.toISOString().slice(0, 10)).toBe('2026-09-06');
  });

  it('uses creation when there is no payment timestamp', () => {
    const estimate = estimatedReadyDate({
      status: 'processing',
      createdAt: '2026-09-02T10:00:00Z',
      estimatedDays: 3,
    });
    expect(estimate?.date.toISOString().slice(0, 10)).toBe('2026-09-05');
  });

  it('gives no date while the clock is stopped', () => {
    // `on_hold_institution` explicitly pauses the term, and an order waiting on
    // the customer has no term at all. A date we know is wrong is worse than
    // none.
    for (const status of ['on_hold_institution', 'standby', 'awaiting_payment', 'pending_payment', 'draft']) {
      expect(
        estimatedReadyDate({ status, paidAt, estimatedDays: 5, estimatedCompletionDate: '2026-09-10' }),
        status
      ).toBeNull();
    }
  });

  it('gives no date for an order that is finished or ended', () => {
    for (const status of ['delivered', 'completed', 'cancelled', 'refunded']) {
      expect(estimatedReadyDate({ status, paidAt, estimatedDays: 5 }), status).toBeNull();
    }
  });

  it('gives no date when there is nothing to compute from', () => {
    expect(estimatedReadyDate({ status: 'processing' })).toBeNull();
    expect(estimatedReadyDate({ status: 'processing', paidAt, estimatedDays: 0 })).toBeNull();
    expect(estimatedReadyDate({ status: 'processing', paidAt: 'nu-i o dată', estimatedDays: 5 })).toBeNull();
  });
});

describe('formatReadyDate', () => {
  it('is a date, not an interval', () => {
    const text = formatReadyDate(new Date('2026-09-26T00:00:00Z'));
    expect(text).toContain('septembrie');
    expect(text).toMatch(/26/);
    expect(text).not.toContain('-');
  });
});
