import { describe, expect, it } from 'vitest';
import {
  AUTO_FINALIZE_THRESHOLDS_DAYS,
  AUTO_FINALIZE_DEFAULT_DAYS,
  decideAutoFinalize,
} from '@/lib/courier/auto-finalize';

describe('AUTO_FINALIZE_THRESHOLDS_DAYS', () => {
  it('matches sister project policy values', () => {
    expect(AUTO_FINALIZE_THRESHOLDS_DAYS.sameday).toBe(5);
    expect(AUTO_FINALIZE_THRESHOLDS_DAYS.fancourier).toBe(7);
    expect(AUTO_FINALIZE_THRESHOLDS_DAYS.dhl).toBe(14);
    expect(AUTO_FINALIZE_THRESHOLDS_DAYS.posta).toBe(30);
  });
});

describe('decideAutoFinalize', () => {
  const now = new Date('2026-05-27T12:00:00.000Z');
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

  it('does not finalize freshly shipped Sameday orders', () => {
    const r = decideAutoFinalize(
      {
        id: '1',
        friendly_order_id: 'E-1',
        courier_provider: 'sameday',
        shipped_at: daysAgo(2),
      },
      now
    );
    expect(r.shouldFinalize).toBe(false);
    expect(r.thresholdDays).toBe(5);
    expect(r.daysSinceShipped).toBe(2);
  });

  it('finalizes Sameday at exactly 5 days', () => {
    const r = decideAutoFinalize(
      { id: '1', friendly_order_id: 'E-1', courier_provider: 'sameday', shipped_at: daysAgo(5) },
      now
    );
    expect(r.shouldFinalize).toBe(true);
  });

  it('finalizes Fan Courier at 7 days', () => {
    const r = decideAutoFinalize(
      { id: '1', friendly_order_id: 'E-1', courier_provider: 'fancourier', shipped_at: daysAgo(7) },
      now
    );
    expect(r.shouldFinalize).toBe(true);
    expect(r.thresholdDays).toBe(7);
  });

  it('finalizes DHL at 14 days', () => {
    expect(
      decideAutoFinalize(
        { id: '1', friendly_order_id: 'E-1', courier_provider: 'dhl', shipped_at: daysAgo(14) },
        now
      ).shouldFinalize
    ).toBe(true);
    expect(
      decideAutoFinalize(
        { id: '1', friendly_order_id: 'E-1', courier_provider: 'dhl', shipped_at: daysAgo(13) },
        now
      ).shouldFinalize
    ).toBe(false);
  });

  it('flags "blocked in transit" past 2× threshold', () => {
    const r = decideAutoFinalize(
      { id: '1', friendly_order_id: 'E-1', courier_provider: 'sameday', shipped_at: daysAgo(11) },
      now
    );
    expect(r.shouldFinalize).toBe(true);
    expect(r.isBlocked).toBe(true);
  });

  it('falls back to default 10 days for unknown courier', () => {
    const r = decideAutoFinalize(
      {
        id: '1',
        friendly_order_id: 'E-1',
        courier_provider: 'cargus',
        shipped_at: daysAgo(10),
      },
      now
    );
    expect(r.thresholdDays).toBe(AUTO_FINALIZE_DEFAULT_DAYS);
    expect(r.shouldFinalize).toBe(true);
  });

  it('handles null shipped_at without crashing', () => {
    const r = decideAutoFinalize(
      { id: '1', friendly_order_id: 'E-1', courier_provider: 'sameday', shipped_at: null },
      now
    );
    expect(r.shouldFinalize).toBe(false);
  });

  it('handles invalid shipped_at date string', () => {
    const r = decideAutoFinalize(
      { id: '1', friendly_order_id: 'E-1', courier_provider: 'sameday', shipped_at: 'not-a-date' },
      now
    );
    expect(r.shouldFinalize).toBe(false);
  });

  it('case-insensitive courier matching', () => {
    expect(
      decideAutoFinalize(
        { id: '1', friendly_order_id: 'E-1', courier_provider: 'SAMEDAY', shipped_at: daysAgo(6) },
        now
      ).shouldFinalize
    ).toBe(true);
  });
});
