import { describe, expect, it } from 'vitest';
import {
  evaluateSelfCancel,
  cancelWindowRemainingMs,
  formatCancelCountdown,
  computeCancelRefundAmount,
  CANCEL_WINDOW_MS,
} from '@/lib/orders/self-cancel';

// The 30-min self-cancel window is a customer-facing legal commitment.
// Get this math wrong and we either refuse legitimate cancels or accept
// cancels we've already started processing.

describe('evaluateSelfCancel', () => {
  const now = Date.parse('2026-05-27T12:00:00.000Z');
  const tenMinAgo = new Date(now - 10 * 60 * 1000).toISOString();
  const fortyMinAgo = new Date(now - 40 * 60 * 1000).toISOString();

  it('allows cancel when status=paid and within 30 min window', () => {
    const r = evaluateSelfCancel({ status: 'paid', paid_at: tenMinAgo, now });
    expect(r.canCancel).toBe(true);
  });

  it('refuses when window expired', () => {
    const r = evaluateSelfCancel({ status: 'paid', paid_at: fortyMinAgo, now });
    expect(r.canCancel).toBe(false);
    if (!r.canCancel) {
      expect(r.code).toBe('window_expired');
      expect(r.reason).toMatch(/30 de minute/);
    }
  });

  it('refuses when already processing (status moved past paid)', () => {
    for (const status of ['processing', 'documents_generated', 'shipped', 'completed']) {
      const r = evaluateSelfCancel({ status, paid_at: tenMinAgo, now });
      expect(r.canCancel).toBe(false);
      if (!r.canCancel) expect(r.code).toBe('not_paid');
    }
  });

  it('refuses when already cancelled or refunded', () => {
    for (const status of ['cancellation_requested', 'cancelled', 'refunded']) {
      const r = evaluateSelfCancel({ status, paid_at: tenMinAgo, now });
      expect(r.canCancel).toBe(false);
      if (!r.canCancel) expect(r.code).toBe('already_cancelled');
    }
  });

  it('refuses when paid_at is missing or invalid', () => {
    expect(evaluateSelfCancel({ status: 'paid', paid_at: null, now }).canCancel).toBe(false);
    expect(evaluateSelfCancel({ status: 'paid', paid_at: 'not-a-date', now }).canCancel).toBe(
      false
    );
  });

  it('honors the exact 30 min boundary as cancellable (inclusive)', () => {
    // paid_at exactly 30 min ago — still allowed (now - paidAt === CANCEL_WINDOW_MS)
    const exactly30Min = new Date(now - CANCEL_WINDOW_MS).toISOString();
    const r = evaluateSelfCancel({ status: 'paid', paid_at: exactly30Min, now });
    expect(r.canCancel).toBe(true);
  });

  it('refuses one ms past the boundary', () => {
    const justPast = new Date(now - CANCEL_WINDOW_MS - 1).toISOString();
    const r = evaluateSelfCancel({ status: 'paid', paid_at: justPast, now });
    expect(r.canCancel).toBe(false);
  });
});

describe('cancelWindowRemainingMs', () => {
  const now = Date.parse('2026-05-27T12:00:00.000Z');

  it('returns full window when paid just now', () => {
    expect(cancelWindowRemainingMs(new Date(now).toISOString(), now)).toBe(CANCEL_WINDOW_MS);
  });

  it('returns 0 when expired', () => {
    expect(cancelWindowRemainingMs(new Date(now - 31 * 60 * 1000).toISOString(), now)).toBe(0);
  });

  it('returns 0 when paid_at missing or invalid', () => {
    expect(cancelWindowRemainingMs(null, now)).toBe(0);
    expect(cancelWindowRemainingMs('garbage', now)).toBe(0);
  });

  it('counts down correctly mid-window', () => {
    const tenMinAgo = new Date(now - 10 * 60 * 1000).toISOString();
    expect(cancelWindowRemainingMs(tenMinAgo, now)).toBe(20 * 60 * 1000);
  });
});

describe('formatCancelCountdown', () => {
  it('formats minutes:seconds with zero padding', () => {
    expect(formatCancelCountdown(30 * 60 * 1000)).toBe('30:00');
    expect(formatCancelCountdown(5 * 60 * 1000 + 7 * 1000)).toBe('05:07');
    expect(formatCancelCountdown(59 * 1000)).toBe('00:59');
    expect(formatCancelCountdown(0)).toBe('00:00');
  });

  it('clamps negative to 00:00', () => {
    expect(formatCancelCountdown(-1000)).toBe('00:00');
  });
});

describe('computeCancelRefundAmount', () => {
  it('returns 70% of total rounded to 2 decimals', () => {
    expect(computeCancelRefundAmount(100)).toBe(70);
    expect(computeCancelRefundAmount(278)).toBe(194.6);
    expect(computeCancelRefundAmount(99.99)).toBe(69.99);
  });

  it('handles zero gracefully', () => {
    expect(computeCancelRefundAmount(0)).toBe(0);
  });
});
