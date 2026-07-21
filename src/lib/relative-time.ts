/**
 * Format a date string as a Romanian relative-time label
 * ("chiar acum", "acum 14 min", "acum 3h", "ieri", "acum 5 zile", "acum 2 săpt.").
 * Falls back to a short "DD.MM" absolute for anything older than a month.
 *
 * Ported from cazierjudiciaronline.com for parity in the admin orders list —
 * shown under the order number so the operator sees at a glance how long ago
 * the customer applied.
 */
export function formatRelative(dateStr: string, now: Date = new Date()): string {
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return 'chiar acum';
  if (diffMin < 60) return `acum ${diffMin} min`;
  if (diffHr < 24) return `acum ${diffHr}h`;
  if (diffDay === 1) return 'ieri';
  if (diffDay < 7) return `acum ${diffDay} zile`;
  if (diffDay < 30) return `acum ${Math.floor(diffDay / 7)} săpt.`;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}
