// Per-courier threshold (in business days) after which a shipped order is
// auto-finalized to `completed`. Mirrors sister project policy:
// - Sameday: 5d (fast same-day/24h network)
// - Fan Courier: 7d (standard 24-48h with buffer)
// - DHL: 14d (international, longer SLA)
// - Poșta: 30d (slow, no real-time tracking)

export const AUTO_FINALIZE_THRESHOLDS_DAYS: Record<string, number> = {
  sameday: 5,
  fancourier: 7,
  dhl: 14,
  posta: 30,
};

// Default for any unknown courier — generous so we don't accidentally
// auto-complete an order that's actually still in transit.
export const AUTO_FINALIZE_DEFAULT_DAYS = 10;

// Threshold past which we Slack-alert "blocked in transit" — typically
// 2× the auto-finalize threshold.
export const BLOCKED_IN_TRANSIT_MULTIPLIER = 2;

export interface AutoFinalizeCandidate {
  id: string;
  friendly_order_id: string | null;
  courier_provider: string | null;
  shipped_at: string | null;
}

export interface AutoFinalizeDecision {
  shouldFinalize: boolean;
  isBlocked: boolean;
  daysSinceShipped: number;
  thresholdDays: number;
}

export function decideAutoFinalize(
  candidate: AutoFinalizeCandidate,
  now: Date = new Date()
): AutoFinalizeDecision {
  const courier = (candidate.courier_provider || '').toLowerCase();
  const thresholdDays =
    AUTO_FINALIZE_THRESHOLDS_DAYS[courier] ?? AUTO_FINALIZE_DEFAULT_DAYS;

  if (!candidate.shipped_at) {
    return {
      shouldFinalize: false,
      isBlocked: false,
      daysSinceShipped: 0,
      thresholdDays,
    };
  }

  const shippedAt = Date.parse(candidate.shipped_at);
  if (Number.isNaN(shippedAt)) {
    return {
      shouldFinalize: false,
      isBlocked: false,
      daysSinceShipped: 0,
      thresholdDays,
    };
  }

  const daysSinceShipped = Math.floor(
    (now.getTime() - shippedAt) / (24 * 60 * 60 * 1000)
  );

  return {
    shouldFinalize: daysSinceShipped >= thresholdDays,
    isBlocked: daysSinceShipped >= thresholdDays * BLOCKED_IN_TRANSIT_MULTIPLIER,
    daysSinceShipped,
    thresholdDays,
  };
}
