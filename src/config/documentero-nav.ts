/**
 * documentero.ro public navigation — the five civil-status services and the
 * guides. Public URLs on the documentero host (no `/documentero/` prefix —
 * that is the internal route-group path, rewritten in next.config.ts).
 *
 * Order slugs are the DB `services.slug` values shared with eghiseul.
 */
export interface DocumenteroNavItem {
  label: string;
  href: string;
  /** DB service slug for the "Comandă" button; guides have none. */
  orderSlug?: string;
}

export const DOCUMENTERO_NAV: DocumenteroNavItem[] = [
  { label: 'Certificat de naștere', href: '/', orderSlug: 'certificat-nastere' },
  { label: 'Certificat de căsătorie', href: '/certificat-de-casatorie/', orderSlug: 'certificat-casatorie' },
  { label: 'Certificat de celibat', href: '/certificat-de-celibat/', orderSlug: 'certificat-celibat' },
  { label: 'Extras multilingv', href: '/extras-multilingv/', orderSlug: 'extras-multilingv-certificat-nastere' },
  { label: 'Ghiduri', href: '/ghiduri/' },
];

/** Public path of the order wizard for a documentero service. */
export function documenteroOrderHref(orderSlug: string): string {
  return `/comanda/${orderSlug}/`;
}
