/**
 * Sărbătorile legale din România (Codul Muncii art. 139) + zile lucrătoare.
 * Folosit de calculatoarele de zile lucrătoare, dată și termene. Sărbătorile
 * mobile (Paște, Rusalii) sunt ancorate pe data Paștelui ortodox per an.
 */

const ORTHODOX_EASTER: Record<number, string> = {
  2024: '2024-05-05',
  2025: '2025-04-20',
  2026: '2026-04-12',
  2027: '2027-05-02',
  2028: '2028-04-16',
};

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function holidaysForYear(y: number): string[] {
  const days = [
    `${y}-01-01`, `${y}-01-02`, `${y}-01-06`, `${y}-01-07`, `${y}-01-24`,
    `${y}-05-01`, `${y}-06-01`, `${y}-08-15`, `${y}-11-30`, `${y}-12-01`, `${y}-12-25`, `${y}-12-26`,
  ];
  const e = ORTHODOX_EASTER[y];
  if (e) {
    const easter = new Date(`${e}T00:00:00`);
    const add = (n: number) => {
      const d = new Date(easter);
      d.setDate(d.getDate() + n);
      return isoOf(d);
    };
    days.push(add(-2), add(1), add(49), add(50)); // Vinerea Mare, a 2-a zi Paște, Rusalii (2 zile)
  }
  return days;
}

const _cache: Record<number, Set<string>> = {};
function holidaySet(year: number): Set<string> {
  if (!_cache[year]) _cache[year] = new Set(holidaysForYear(year));
  return _cache[year];
}

export function isHoliday(d: Date): boolean {
  return holidaySet(d.getFullYear()).has(isoOf(d));
}

export function isNonWorking(d: Date): boolean {
  const wd = d.getDay();
  return wd === 0 || wd === 6 || isHoliday(d);
}

/** Avansează peste zilele nelucrătoare până la prima zi lucrătoare. */
export function nextWorkingDay(d: Date): Date {
  const r = new Date(d);
  while (isNonWorking(r)) r.setDate(r.getDate() + 1);
  return r;
}

export { isoOf };
