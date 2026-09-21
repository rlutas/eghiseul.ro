import { CERERE_DONE_STATUSES } from '@/lib/ancpi/cerere-scope';
import type { PropertyLike } from '@/lib/ancpi/cereri-for-order';

export type Etapa = 'toate' | 'de_depus' | 'depuse' | 'blocate' | 'livrate';

export interface FilterableOrder {
  friendly_order_id: string | null;
  status: string;
  customer_data: {
    property?: PropertyLike | null;
    ocpi_submission?: { registration_number?: string | null } | null;
  } | null;
  services: { name: string; slug: string } | null;
}

export interface CollabOrderFilters {
  etapa: Etapa;
  judet: string;
  cauta: string;
}

export function etapaOf(status: string): Exclude<Etapa, 'toate'> {
  if (CERERE_DONE_STATUSES.includes(status as never)) return 'livrate';
  if (status === 'submitted_to_institution') return 'depuse';
  // Parcate: blocate de instituție sau în așteptarea clientului — separate de
  // „de depus" ca să nu se amestece cu lucrările efectiv lucrabile (28.08).
  if (status === 'on_hold_institution' || status === 'standby') return 'blocate';
  return 'de_depus';
}

/** Fold pentru căutare: fără diacritice, lowercase. */
export function fold(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Filtrarea locală a listei colaboratorului. Când există text de căutare,
 * tabul de etapă NU se mai aplică: caută în toate comenzile. Altfel un număr
 * de comandă căutat din tabul implicit „De depus" nu găsea o comandă parcată
 * în „Blocate" (E-260728-VWFTT, standby, 21.09) și părea că nu există.
 * Județul rămâne aplicat și peste căutare — e o restrângere explicită.
 */
export function filterCollabOrders<T extends FilterableOrder>(orders: T[], f: CollabOrderFilters): T[] {
  const q = fold(f.cauta.trim());
  return orders.filter((o) => {
    if (!q && f.etapa !== 'toate' && etapaOf(o.status) !== f.etapa) return false;
    if (f.judet && o.customer_data?.property?.county !== f.judet) return false;
    if (!q) return true;
    const p = o.customer_data?.property;
    const haystack = fold(
      [
        o.friendly_order_id,
        p?.locality,
        p?.county,
        p?.carteFunciara,
        p?.cadastral,
        o.customer_data?.ocpi_submission?.registration_number,
        o.services?.name,
      ]
        .filter(Boolean)
        .join(' ')
    );
    return haystack.includes(q);
  });
}
