import { describe, expect, it } from 'vitest';
import { VPR, estimeazaPensia, puncteStabilitate } from '@/lib/pensii-estimare';

describe('estimare pensie (Legea 360/2023)', () => {
  it('gives no stability points up to 25 years', () => {
    expect(puncteStabilitate(15)).toBe(0);
    expect(puncteStabilitate(25)).toBe(0);
  });

  it('adds 0.5, 0.75 and 1 point per year on the three bands', () => {
    expect(puncteStabilitate(30)).toBe(2.5);
    expect(puncteStabilitate(35)).toBe(6.25);
    expect(puncteStabilitate(40)).toBe(11.25);
  });

  it('35 years at the average wage is 41.25 points', () => {
    const e = estimeazaPensia(35, 1);
    expect(e.totalPuncte).toBe(41.25);
    expect(Math.round(e.pensie)).toBe(Math.round(41.25 * VPR));
  });

  it('scales contribution points with the wage ratio, not the stability points', () => {
    const jumatate = estimeazaPensia(40, 0.5);
    expect(jumatate.puncteContributivitate).toBe(20);
    expect(jumatate.puncteStabilitate).toBe(11.25);
  });
});
