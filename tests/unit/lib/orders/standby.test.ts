import { describe, expect, it } from 'vitest';
import { enterStandby, exitStandby } from '@/lib/orders/standby';

// Standby math drives both the SLA banner and the estimated delivery date
// the customer sees. Off-by-one here means promises slip without anyone
// noticing.

describe('enterStandby', () => {
  it('stamps the current ISO timestamp', () => {
    const now = new Date('2026-05-27T10:00:00.000Z');
    const r = enterStandby(now);
    expect(r.standby_started_at).toBe('2026-05-27T10:00:00.000Z');
  });
});

describe('exitStandby', () => {
  it('returns paused seconds and adds them to the running total', () => {
    const startedAt = '2026-05-27T10:00:00.000Z';
    const now = new Date('2026-05-27T16:00:00.000Z'); // +6h = 21600s
    const r = exitStandby({
      standby_started_at: startedAt,
      standby_total_seconds: 100,
      estimated_completion_date: null,
      now,
    });
    expect(r.pausedSeconds).toBe(21600);
    expect(r.standby_total_seconds).toBe(100 + 21600);
    expect(r.standby_started_at).toBeNull();
  });

  it('shifts estimated_completion_date by 1 business day when paused <24h', () => {
    // Friday → still Friday but bumped to Monday because we paused for 6h
    // (any non-zero pause rounds up to 1 day, then 1 BUSINESS day forward).
    const r = exitStandby({
      standby_started_at: '2026-05-27T10:00:00.000Z',
      standby_total_seconds: 0,
      estimated_completion_date: '2026-06-01', // Monday
      now: new Date('2026-05-27T16:00:00.000Z'),
    });
    expect(r.pausedBusinessDays).toBe(1);
    // Tuesday, June 2 2026 (Monday + 1 business day, no Romanian holiday)
    expect(r.estimated_completion_date).toBe('2026-06-02');
  });

  it('shifts by multiple business days when paused multiple days', () => {
    // Paused for 3.5 days → 4 calendar days → 4 business days forward
    const r = exitStandby({
      standby_started_at: '2026-05-27T10:00:00.000Z',
      standby_total_seconds: 0,
      estimated_completion_date: '2026-06-01', // Monday
      now: new Date('2026-05-30T22:00:00.000Z'),
    });
    expect(r.pausedBusinessDays).toBe(4);
    // Friday June 5
    expect(r.estimated_completion_date).toBe('2026-06-05');
  });

  it('does not modify estimate when null', () => {
    const r = exitStandby({
      standby_started_at: '2026-05-27T10:00:00.000Z',
      standby_total_seconds: 50,
      estimated_completion_date: null,
      now: new Date('2026-05-27T16:00:00.000Z'),
    });
    expect(r.estimated_completion_date).toBeNull();
  });

  it('throws on invalid standby_started_at', () => {
    expect(() =>
      exitStandby({
        standby_started_at: 'not-a-date',
        standby_total_seconds: 0,
        estimated_completion_date: null,
      })
    ).toThrow();
  });

  it('zero or negative duration produces zero shift', () => {
    const startedAt = '2026-05-27T10:00:00.000Z';
    // Clock skew: now < startedAt → still paused 0s, 0 days forward
    const r = exitStandby({
      standby_started_at: startedAt,
      standby_total_seconds: 0,
      estimated_completion_date: '2026-06-01',
      now: new Date('2026-05-27T09:59:00.000Z'),
    });
    expect(r.pausedSeconds).toBe(0);
    expect(r.pausedBusinessDays).toBe(0);
    expect(r.estimated_completion_date).toBe('2026-06-01');
  });
});
