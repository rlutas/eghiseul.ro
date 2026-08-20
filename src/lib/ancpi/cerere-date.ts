/**
 * The date printed on a cerere: today, in Bucharest, dd.MM.yyyy.
 *
 * The collaborator signs and files the cerere the same day he downloads it, so
 * generation time is the filing date. Explicit timezone because Vercel runs UTC
 * and a cerere generated at 01:30 RO time must not be dated the day before.
 */
export function cerereDateRo(now: Date = new Date()): string {
  return now.toLocaleDateString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
