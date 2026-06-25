/**
 * Status expirare pentru termenele mașinii (ITP / asigurare RCA / rovinietă).
 * Pur + testabil (acceptă `now` pentru teste deterministe).
 */
export type ExpiryTone = 'red' | 'amber' | 'green';

export interface ExpiryStatus {
  tone: ExpiryTone;
  days: number; // zile până la expirare (negativ = expirat)
  text: string;
}

export function expiryStatus(
  date: string | null | undefined,
  now: Date = new Date()
): ExpiryStatus | null {
  if (!date) return null;
  const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { tone: 'red', days, text: `expirat de ${-days} zile` };
  if (days <= 30) return { tone: 'amber', days, text: `expiră în ${days} zile` };
  return { tone: 'green', days, text: `valabil (${date})` };
}
