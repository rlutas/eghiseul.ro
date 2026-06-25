import { describe, it, expect } from 'vitest';
import { expiryStatus } from '@/lib/vehicles/expiry';

const NOW = new Date('2026-06-25T12:00:00');

describe('expiryStatus (mașini — ITP/RCA/rovinietă)', () => {
  it('verde când mai sunt > 30 zile', () => {
    const s = expiryStatus('2026-12-01', NOW);
    expect(s?.tone).toBe('green');
    expect(s?.days).toBeGreaterThan(30);
  });

  it('amber când expiră în ≤ 30 zile', () => {
    const s = expiryStatus('2026-07-10', NOW);
    expect(s?.tone).toBe('amber');
    expect(s?.days).toBe(15);
  });

  it('amber și azi (0 zile)', () => {
    expect(expiryStatus('2026-06-25', NOW)?.tone).toBe('amber');
  });

  it('roșu când e expirat', () => {
    const s = expiryStatus('2026-06-01', NOW);
    expect(s?.tone).toBe('red');
    expect(s?.days).toBe(-24);
    expect(s?.text).toContain('expirat');
  });

  it('null pentru dată lipsă sau invalidă', () => {
    expect(expiryStatus(null, NOW)).toBeNull();
    expect(expiryStatus('', NOW)).toBeNull();
    expect(expiryStatus('nu-i dată', NOW)).toBeNull();
  });
});
