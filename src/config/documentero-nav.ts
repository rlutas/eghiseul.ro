/**
 * documentero.ro public navigation and the switch that opens the site to
 * search engines. Public URLs on the documentero host (no `/documentero/`
 * prefix — that is the internal route-group path, rewritten in next.config.ts).
 */
export interface DocumenteroNavItem {
  label: string;
  href: string;
  /** DB service slug for the "Comandă" button; guides have none. */
  orderSlug?: string;
}

/**
 * While false: every documentero page is `noindex`, the sitemap is empty.
 * Flip to true only when the placeholders are gone (real reviews, team photo,
 * order count) and the launch checklist in docs/documentero/lansare.md is done.
 */
export const DOCUMENTERO_INDEXABLE = false;

export const DOCUMENTERO_NAV: DocumenteroNavItem[] = [
  { label: 'Certificat de naștere', href: '/certificat-de-nastere/', orderSlug: 'certificat-nastere' },
  { label: 'Căsătorie', href: '/certificat-de-casatorie/', orderSlug: 'certificat-casatorie' },
  { label: 'Celibat', href: '/certificat-de-celibat/', orderSlug: 'certificat-celibat' },
  { label: 'Extras multilingv', href: '/extras-multilingv/', orderSlug: 'extras-multilingv-certificat-nastere' },
  { label: 'Ghiduri', href: '/ghiduri/' },
];

/** Public path of the order wizard for a documentero service. */
export function documenteroOrderHref(orderSlug: string): string {
  return `/comanda/${orderSlug}/`;
}

/** Footer columns. Legal pages are the group's, hosted on eghiseul.ro until documentero gets its own. */
export const DOCUMENTERO_FOOTER = {
  certificate: [
    { label: 'Certificat de naștere', href: '/certificat-de-nastere/' },
    { label: 'Certificat de căsătorie', href: '/certificat-de-casatorie/' },
    { label: 'Certificat de celibat', href: '/certificat-de-celibat/' },
    { label: 'Extras multilingv naștere', href: '/extras-multilingv/' },
    { label: 'Extras multilingv căsătorie', href: '/extras-multilingv/#casatorie' },
  ],
  ghiduri: [
    { label: 'Certificat de naștere pierdut', href: '/ghiduri/certificat-de-nastere-pierdut/' },
    { label: 'Toate ghidurile', href: '/ghiduri/' },
  ],
  companie: [
    { label: 'Despre noi și avocatul nostru', href: '/despre/' },
    { label: 'Contact', href: '/contact/' },
  ],
} as const;
