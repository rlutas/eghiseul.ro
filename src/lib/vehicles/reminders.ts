/**
 * Which reminders a saved vehicle is due for today. Pure, so the window and
 * the „once per expiry date" rule are testable without a database.
 *
 * Window: from 14 days before the expiry to 30 days after it — the same shape
 * as the document expiry reminder (`lib/lifecycle/rules.ts`). One email per
 * expiry DATE: `*_reminded_for` holds the date the last reminder was for, so
 * a renewed vehicle (new date) is reminded again, an unchanged one is not.
 */

import type { VehicleReminderKind } from '@/lib/email/templates/vehicle-reminder';

export const VEHICLE_REMINDER_LEAD_DAYS = 14;
export const VEHICLE_REMINDER_GRACE_DAYS = 30;

export interface VehicleReminderRow {
  itp_expiry: string | null;
  insurance_expiry: string | null;
  rovinieta_expiry: string | null;
  itp_reminded_for: string | null;
  insurance_reminded_for: string | null;
  rovinieta_reminded_for: string | null;
}

export interface DueReminder {
  kind: VehicleReminderKind;
  /** `YYYY-MM-DD` as stored. */
  expiry: string;
  expiresOn: Date;
  daysLeft: number;
}

const FIELDS: Array<{ kind: VehicleReminderKind; expiry: keyof VehicleReminderRow; reminded: keyof VehicleReminderRow }> = [
  { kind: 'rovinieta', expiry: 'rovinieta_expiry', reminded: 'rovinieta_reminded_for' },
  { kind: 'itp', expiry: 'itp_expiry', reminded: 'itp_reminded_for' },
  { kind: 'insurance', expiry: 'insurance_expiry', reminded: 'insurance_reminded_for' },
];

/** Whole days from `today` (local midnight) to the expiry date. */
export function daysUntil(expiry: string, today: Date): number {
  const d = new Date(`${expiry}T00:00:00`);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86_400_000);
}

export function vehicleRemindersDue(row: VehicleReminderRow, today: Date = new Date()): DueReminder[] {
  const due: DueReminder[] = [];
  for (const f of FIELDS) {
    const expiry = row[f.expiry];
    if (!expiry || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) continue;
    if (row[f.reminded] === expiry) continue;
    const daysLeft = daysUntil(expiry, today);
    if (Number.isNaN(daysLeft)) continue;
    if (daysLeft > VEHICLE_REMINDER_LEAD_DAYS || daysLeft < -VEHICLE_REMINDER_GRACE_DAYS) continue;
    due.push({ kind: f.kind, expiry, expiresOn: new Date(`${expiry}T00:00:00`), daysLeft });
  }
  return due;
}

/** The column that records the reminder, per kind. */
export function remindedColumn(kind: VehicleReminderKind): keyof VehicleReminderRow {
  return FIELDS.find((f) => f.kind === kind)!.reminded;
}
