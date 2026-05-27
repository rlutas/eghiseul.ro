import { describe, expect, it } from 'vitest';
import {
  estimateFromSelectedOptions,
  OPTION_DELIVERY_IMPACT,
} from '@/lib/delivery-calculator';

// Tests the wizard-facing helper added 2026-05-27 after a user reported the
// sticky summary showed "1-2 zile lucrătoare" even when extras (apostila,
// traducere, legalizare) were added. The helper mirrors the cazier-
// judiciaronline.com logic so customers see the same estimate on both sites:
//
//   base (standard 2-4 OR urgent 1-2)
//   + traducere       1-2
//   + legalizare      1
//   + apostila_haga   1
//   + apostila_notari 1
//   (bundled duplicates collapsed)
//   + courier leg (only when picked)
//
// Use a Wednesday at 09:00 RO so the date math is deterministic (no
// noon-cutoff, no weekend skip, no holiday near the start).
const FIXED_ORDER_DATE = new Date('2026-09-23T06:00:00.000Z'); // 09:00 Bucharest, Wed

describe('estimateFromSelectedOptions — base cases', () => {
  it('returns the service baseDays when no add-ons selected', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    // The calculator collapses baseDays into a single step with min === max.
    expect(est.minDays).toBe(4);
    expect(est.maxDays).toBe(4);
    expect(est.breakdown).toHaveLength(1);
    expect(est.breakdown[0].step).toBe('Procesare');
  });

  it('switches to "urgent" (1-2 zile) when urgenta is selected for main service', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [{ code: 'urgenta' }],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(1);
    expect(est.maxDays).toBe(2);
    expect(est.breakdown[0].step).toBe('Procesare urgentă');
  });

  it('ignores urgenta when it is bundled under a secondary service', () => {
    // Bundled urgency belongs to the secondary service's processing slot —
    // it doesn't move the main service's timeline.
    const est = estimateFromSelectedOptions({
      selectedOptions: [
        { code: 'urgenta', bundledFor: { parentOptionId: 'integritate-xyz' } },
      ],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(4);
    expect(est.breakdown[0].step).toBe('Procesare');
  });
});

describe('estimateFromSelectedOptions — document add-ons accumulate', () => {
  it('adds 1-2 days for traducere', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [{ code: 'traducere' }],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(4 + 1);
    expect(est.maxDays).toBe(4 + 2);
  });

  it('adds 1 day each for legalizare, apostila_haga and apostila_notari', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [
        { code: 'legalizare' },
        { code: 'apostila_haga' },
        { code: 'apostila_notari' },
      ],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(4 + 1 + 1 + 1);
    expect(est.maxDays).toBe(4 + 1 + 1 + 1);
  });

  it('reproduces the production scenario reported by the user', () => {
    // The exact combo from the bug screenshot: urgent + apostila Haga +
    // traducere + legalizare + apostila notari. Expected:
    //   urgent     1-2
    //   traducere  1-2
    //   legalizare 1
    //   apostila   1
    //   notari     1
    //   = min 5, max 7
    const est = estimateFromSelectedOptions({
      selectedOptions: [
        { code: 'urgenta' },
        { code: 'apostila_haga' },
        { code: 'traducere' },
        { code: 'legalizare' },
        { code: 'apostila_notari' },
      ],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(5);
    expect(est.maxDays).toBe(7);
  });
});

describe('estimateFromSelectedOptions — bundled add-ons dedupe', () => {
  it('counts a document add-on only once when it appears in both main and bundled', () => {
    // Real scenario: user picks Apostilă Haga both at the top level (for
    // Cazier Judiciar) and again under "Certificat Integritate" sub-service.
    // The apostille is performed once; the timeline must not double up.
    const est = estimateFromSelectedOptions({
      selectedOptions: [
        { code: 'apostila_haga' },
        {
          code: 'apostila_haga',
          bundledFor: { parentOptionId: 'integritate-xyz' },
        },
      ],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(5);
    expect(est.maxDays).toBe(5);
  });

  it('still counts distinct codes individually even if all are bundled', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [
        { code: 'apostila_haga', bundledFor: { parentOptionId: 'p1' } },
        { code: 'traducere', bundledFor: { parentOptionId: 'p1' } },
      ],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.minDays).toBe(4 + 1 + 1);
    expect(est.maxDays).toBe(4 + 1 + 2);
  });
});

describe('estimateFromSelectedOptions — courier leg', () => {
  it('skips courier when includeCourierLeg is false (Step 2/3 sidebar)', () => {
    // Before the user reaches Step 4 (delivery) there's no courier picked.
    // The badge on Step 2 must NOT include a courier guess — otherwise the
    // total flips when the user finally picks one.
    const est = estimateFromSelectedOptions({
      selectedOptions: [],
      baseDays: 4,
      orderDate: FIXED_ORDER_DATE,
      includeCourierLeg: false,
    });
    expect(est.breakdown.find((s) => /DHL|Fan|Sameday|Poș/.test(s.step))).toBeUndefined();
  });

  it('adds 1-3 days for Fan Courier when picked', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [],
      baseDays: 4,
      courier: 'fan',
      orderDate: FIXED_ORDER_DATE,
    });
    expect(est.minDays).toBe(4 + 1);
    expect(est.maxDays).toBe(4 + 3);
  });
});

describe('OPTION_DELIVERY_IMPACT contract', () => {
  // Pins the per-code timing constants so any future change to the table
  // triggers a deliberate review (these numbers come from operations + must
  // match cazierjudiciaronline.com's static table to keep pricing/timing
  // parity across the two products).
  it('has the four expected document add-on codes', () => {
    expect(Object.keys(OPTION_DELIVERY_IMPACT).sort()).toEqual([
      'apostila_haga',
      'apostila_notari',
      'legalizare',
      'traducere',
    ]);
  });

  it('matches the sister-project numbers exactly', () => {
    expect(OPTION_DELIVERY_IMPACT.traducere).toEqual({ name: 'Traducere', minDays: 1, maxDays: 2 });
    expect(OPTION_DELIVERY_IMPACT.legalizare).toEqual({ name: 'Legalizare', minDays: 1, maxDays: 1 });
    expect(OPTION_DELIVERY_IMPACT.apostila_haga).toEqual({ name: 'Apostilă Haga', minDays: 1, maxDays: 1 });
    expect(OPTION_DELIVERY_IMPACT.apostila_notari).toEqual({ name: 'Apostilă Notari', minDays: 1, maxDays: 1 });
  });
});
