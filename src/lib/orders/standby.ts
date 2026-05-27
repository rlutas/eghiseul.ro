// Standby (paused SLA) math. The admin can flip an order to status='standby'
// when blocked on the client (missing documents, signature, follow-up info).
// On exit, we shift the estimated_delivery_date forward by the number of
// business days the order spent paused.

import { addBusinessDays } from '@/lib/delivery-calculator';

export interface StandbyEnterResult {
  standby_started_at: string; // ISO timestamp
}

export interface StandbyExitInput {
  standby_started_at: string;
  standby_total_seconds: number;
  estimated_completion_date: string | null;
  now?: Date;
}

export interface StandbyExitResult {
  standby_started_at: null;
  standby_total_seconds: number;
  estimated_completion_date: string | null;
  pausedSeconds: number;
  pausedBusinessDays: number;
}

const SECONDS_PER_DAY = 86_400;

export function enterStandby(now: Date = new Date()): StandbyEnterResult {
  return { standby_started_at: now.toISOString() };
}

// Computes the new column values when an admin takes an order out of standby.
// Pure: no DB access. Caller is responsible for persisting + appending the
// order_history entry.
export function exitStandby(input: StandbyExitInput): StandbyExitResult {
  const now = input.now ?? new Date();
  const startedAt = Date.parse(input.standby_started_at);
  if (Number.isNaN(startedAt)) {
    throw new Error('exitStandby: invalid standby_started_at');
  }

  const pausedMs = Math.max(0, now.getTime() - startedAt);
  const pausedSeconds = Math.floor(pausedMs / 1000);

  // Round up to whole business days — if the order was paused for 6 hours
  // we still shift one business day, because the SLA is day-grained.
  const pausedBusinessDays = Math.ceil(pausedSeconds / SECONDS_PER_DAY);

  let nextEstimate = input.estimated_completion_date;
  if (nextEstimate && pausedBusinessDays > 0) {
    // Parse as date-only; addBusinessDays expects a Date.
    const base = new Date(nextEstimate);
    if (!Number.isNaN(base.getTime())) {
      const shifted = addBusinessDays(base, pausedBusinessDays);
      nextEstimate = shifted.toISOString().slice(0, 10);
    }
  }

  return {
    standby_started_at: null,
    standby_total_seconds: input.standby_total_seconds + pausedSeconds,
    estimated_completion_date: nextEstimate,
    pausedSeconds,
    pausedBusinessDays,
  };
}
