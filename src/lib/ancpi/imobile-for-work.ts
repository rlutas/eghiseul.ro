/**
 * The properties (imobile) of an order, as the collaborator has to work them.
 *
 * The wizard stores the first imobil on `property` itself and every extra one
 * ("Adaugă un extras") in `property.additionalImobile`. The collaborator's
 * «Date pentru lucrare» card used to print only the first, so an order with
 * two CFs looked like an order with one — the second showed up only further
 * down, in the list of cereri (Mircea, 11.11.2026).
 *
 * Same "is this a real row" rule as `cereriForOrder`: an extra row the client
 * added and never filled in is not an imobil.
 */

export interface ImobilForWork {
  /** 1-based position — printed as „CF 1", „CF 2". */
  nr: number;
  locality?: string;
  imobilLocality?: string;
  carteFunciara?: string;
  cadastral?: string;
  topografic?: string;
}

interface ImobilLike {
  locality?: string | null;
  imobilLocality?: string | null;
  carteFunciara?: string | null;
  cadastral?: string | null;
  topografic?: string | null;
}

const text = (v: unknown): string | undefined => {
  const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
  return s || undefined;
};

export function imobileForWork(
  property: (ImobilLike & { additionalImobile?: ImobilLike[] | null }) | null | undefined
): ImobilForWork[] {
  if (!property) return [];
  const extras = Array.isArray(property.additionalImobile) ? property.additionalImobile : [];
  const mainUat = text(property.locality);
  const rows = [property as ImobilLike, ...extras]
    .map((i, index) => ({
      index,
      // An extra imobil without its own UAT is in the main one (same rule as the cerere).
      locality: text(i?.locality) ?? mainUat,
      imobilLocality: text(i?.imobilLocality),
      carteFunciara: text(i?.carteFunciara),
      cadastral: text(i?.cadastral),
      topografic: text(i?.topografic),
    }))
    // The main imobil always counts (identification orders have no CF yet).
    .filter((i) => i.index === 0 || i.carteFunciara || i.cadastral || i.topografic);
  return rows.map((r, position) => ({
    nr: position + 1,
    locality: r.locality,
    imobilLocality: r.imobilLocality,
    carteFunciara: r.carteFunciara,
    cadastral: r.cadastral,
    topografic: r.topografic,
  }));
}
