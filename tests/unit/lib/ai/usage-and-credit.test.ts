import { describe, it, expect } from 'vitest';
import { buildUsageRow, describeGeminiError, estimateGeminiCostUsd } from '@/lib/ai/usage-log';
import { normalizeCreditSettings, summarizeCredit, type UsageLogRow } from '@/lib/ai/gemini-credit';

describe('estimateGeminiCostUsd', () => {
  it('uses per-model prices per 1M tokens', () => {
    expect(estimateGeminiCostUsd('gemini-2.5-flash-lite', 1_000_000, 1_000_000)).toBeCloseTo(0.5, 6);
    expect(estimateGeminiCostUsd('gemini-2.5-flash', 1_000_000, 1_000_000)).toBeCloseTo(2.8, 6);
    // unknown model → dearer fallback
    expect(estimateGeminiCostUsd('gemini-x', 1_000_000, 0)).toBeCloseTo(0.3, 6);
  });
});

describe('buildUsageRow', () => {
  it('bills thinking tokens as output', () => {
    const row = buildUsageRow({
      feature: 'ocr_ci_front',
      model: 'gemini-2.5-flash-lite',
      usage: { promptTokenCount: 1500, candidatesTokenCount: 400, thoughtsTokenCount: 100, totalTokenCount: 2000 },
      ok: true,
      httpStatus: 200,
    });
    expect(row).toMatchObject({ platform: 'eghiseul', prompt_tokens: 1500, output_tokens: 500, total_tokens: 2000, ok: true });
    expect(row.est_cost_usd).toBeCloseTo((1500 * 0.1 + 500 * 0.4) / 1e6, 9);
  });
  it('a refused call costs 0', () => {
    const row = buildUsageRow({ feature: 'x', model: 'gemini-2.5-flash', ok: false, httpStatus: 402, errorCode: '402:credit_depleted' });
    expect(row).toMatchObject({ est_cost_usd: 0, ok: false, http_status: 402, error_code: '402:credit_depleted' });
  });
});

describe('describeGeminiError', () => {
  it('reads SDK status and credit depletion', () => {
    const err = Object.assign(new Error('[402 Payment Required] Your prepayment credits are depleted'), { status: 402 });
    expect(describeGeminiError(err)).toEqual({ status: 402, code: '402:credit_depleted' });
    expect(describeGeminiError(new Error('[GoogleGenerativeAI Error]: [429 Too Many Requests] quota'))).toEqual({ status: 429, code: '429:quota' });
  });
});

const row = (at: string, cost: number, platform = 'eghiseul', ok = true, feature = 'ocr_ci_front'): UsageLogRow => ({
  created_at: at,
  platform,
  feature,
  est_cost_usd: cost,
  ok,
  http_status: ok ? 200 : 402,
  error_code: ok ? null : '402',
});

describe('summarizeCredit', () => {
  const now = new Date('2026-11-10T12:00:00Z');

  it('without top-ups shows usage but no estimate', () => {
    const s = summarizeCredit({}, [row('2026-11-10T08:00:00Z', 0.01)], now);
    expect(s.remaining).toBeNull();
    expect(s.daysLeft).toBeNull();
    expect(s.lowCredit).toBe(false);
    expect(s.windows.today.total.calls).toBe(1);
    expect(s.settings.alert_below_usd).toBe(5);
  });

  it('subtracts usage of both platforms since the first top-up', () => {
    const rows = [
      row('2026-10-30T10:00:00Z', 5), // before top-up → ignored for balance
      row('2026-11-03T10:00:00Z', 1),
      row('2026-11-05T10:00:00Z', 2, 'cjo'),
      row('2026-11-10T10:00:00Z', 0.5, 'cjo', false, 'health_probe'),
    ];
    const s = summarizeCredit({ topups: [{ date: '2026-11-02', amount_usd: 20 }], alert_below_usd: 5 }, rows, now);
    expect(s.topupsTotal).toBe(20);
    expect(s.spentSinceFirstTopup).toBeCloseTo(3.5, 6);
    expect(s.remaining).toBeCloseTo(16.5, 6);
    expect(s.windows.d7.byPlatform.cjo.calls).toBe(2);
    expect(s.windows.d7.byPlatform.cjo.errors).toBe(1);
    // 03.11 10:00 is just outside the 7-day window ending 10.11 12:00
    expect(s.burnPerDay7d).toBeCloseTo(2.5 / 7, 6);
    expect(s.daysLeft).toBeCloseTo(16.5 / (2.5 / 7), 6);
    expect(s.lastError?.feature).toBe('health_probe');
    expect(s.lastCall?.ok).toBe(false);
    expect(s.lowCredit).toBe(false);
  });

  it('is low when under the threshold or under 7 days of burn', () => {
    const under = summarizeCredit({ topups: [{ date: '2026-11-02', amount_usd: 6 }], alert_below_usd: 5 }, [row('2026-11-09T10:00:00Z', 2)], now);
    expect(under.remaining).toBeCloseTo(4, 6);
    expect(under.lowCredit).toBe(true);
    const fast = summarizeCredit({ topups: [{ date: '2026-11-02', amount_usd: 60 }], alert_below_usd: 5 }, [row('2026-11-09T10:00:00Z', 49)], now);
    expect(fast.daysLeft!).toBeLessThan(7);
    expect(fast.lowCredit).toBe(true);
  });

  it('normalizes bad settings', () => {
    expect(normalizeCreditSettings({ topups: [{ date: '2026-11-02', amount_usd: -1 }, { date: 5 }], alert_below_usd: 'x' })).toEqual({
      topups: [],
      alert_below_usd: 5,
    });
  });
});
