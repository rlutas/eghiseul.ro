/**
 * Closed monthly settlements with the lawyer's cabinet, as sent and checked.
 * Pure data (safe in client components): the admin tab "Avocat — decont
 * cabinet" shows it as the history of what was settled and paid.
 *
 * Add one entry per month once Raul has checked the export. It stays
 * `paid: false` until the payment is confirmed.
 */
export interface AvocatSettlement {
  /** YYYY-MM */
  month: string;
  positions: number;
  /** Cabinet services, RON incl. VAT. */
  servicesTotal: number;
  /** Contract fees invoice (contracts × 15, VAT incl.). */
  onorarii: number;
  /** Monthly cabinet invoice (VAT incl.); 0 before September 2026. */
  facturaLunara: number;
  /** Transfer to the TM account, after dividend tax. */
  transfer: number;
  /** Split Raul / cabinet, percent for Raul. */
  splitRaul: number;
  /** When Raul checked the export (unknown for the first months). */
  checkedOn?: string;
  paid: boolean;
  /** Payment date, when known. */
  paidOn?: string;
  note?: string;
}

export const AVOCAT_SETTLEMENTS: AvocatSettlement[] = [
  {
    month: '2026-07', positions: 208, servicesTotal: 73284.49, onorarii: 3105, facturaLunara: 0, transfer: 7668,
    splitRaul: 50, paid: true,
    note: 'Include 21 de plăți prin vechiul WordPress.',
  },
  {
    month: '2026-08', positions: 186, servicesTotal: 54218.80, onorarii: 2790, facturaLunara: 0, transfer: 8397.04,
    splitRaul: 50, checkedOn: '2026-09-07', paid: true,
  },
  {
    month: '2026-09', positions: 151, servicesTotal: 43088.86, onorarii: 2265, facturaLunara: 1250, transfer: 3165.82,
    splitRaul: 55, checkedOn: '2026-10-06', paid: true, paidOn: '2026-10-06',
    note: 'Cheltuieli: angajați 12.000, programe 1.000, contabilitate 1.500, reclamă 800.',
  },
  {
    month: '2026-10', positions: 99, servicesTotal: 30924.92, onorarii: 1470, facturaLunara: 1250, transfer: 957.44,
    splitRaul: 55, checkedOn: '2026-11-03', paid: false,
    note: 'Toate 4 platformele; include o comandă prin proformă scăpată din septembrie și o apostilă plătită ca extra. Fără reclamă.',
  },
];

export function settlementTotal(s: AvocatSettlement): number {
  return Math.round((s.onorarii + s.facturaLunara + s.transfer) * 100) / 100;
}
