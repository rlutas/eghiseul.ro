import { describe, expect, it } from 'vitest';
import { isAbandonDue } from '@/lib/orders/abandon-due';

const now = Date.parse('2026-11-11T21:45:00Z');

describe('isAbandonDue', () => {
  it('ciornă veche, trimisă acum 6 minute → NU e abandonată (E-261111-EMRB4)', () => {
    expect(
      isAbandonDue({ created_at: '2026-11-11T11:27:27Z', submitted_at: '2026-11-11T21:39:56Z' }, now, 30)
    ).toBe(false);
  });

  it('trimisă acum 31 de minute → abandonată', () => {
    expect(
      isAbandonDue({ created_at: '2026-11-11T11:27:27Z', submitted_at: '2026-11-11T21:14:00Z' }, now, 30)
    ).toBe(true);
  });

  it('exact 30 de minute → încă nu', () => {
    expect(isAbandonDue({ created_at: '2026-11-11T10:00:00Z', submitted_at: '2026-11-11T21:15:00Z' }, now, 30)).toBe(false);
  });

  it('fără submitted_at → se numără de la created_at', () => {
    expect(isAbandonDue({ created_at: '2026-11-11T21:00:00Z', submitted_at: null }, now, 30)).toBe(true);
    expect(isAbandonDue({ created_at: '2026-11-11T21:30:00Z' }, now, 30)).toBe(false);
  });

  it('fără nicio dată validă → rămâne neatinsă', () => {
    expect(isAbandonDue({ created_at: null, submitted_at: null }, now, 30)).toBe(false);
    expect(isAbandonDue({ created_at: 'nu-e-data' }, now, 30)).toBe(false);
  });
});
