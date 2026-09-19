/**
 * documentero.ro public navigation and the switch that opens the site to
 * search engines. Public URLs on the documentero host (no `/documentero/`
 * prefix — that is the internal route-group path, rewritten in next.config.ts).
 */
export interface DocumenteroNavChild {
  label: string;
  /** One-line hint shown under the label in the dropdown. */
  hint: string;
  /** Public page for this variant. */
  href: string;
  /** DB service slug — the dropdown's "Comandă" link goes straight to its wizard. */
  orderSlug: string;
}

export interface DocumenteroNavItem {
  label: string;
  href: string;
  /** DB service slug for the "Comandă" button; guides have none. */
  orderSlug?: string;
  /**
   * Variants shown in a dropdown (desktop) or indented (mobile). The parent
   * link still goes to `href`; each child goes to its own page + wizard.
   */
  children?: DocumenteroNavChild[];
}

/**
 * While false: every documentero page is `noindex`, the sitemap is empty.
 * Flip to true only when the placeholders are gone (team photo, order count)
 * and the launch checklist in docs/documentero/lansare.md is done.
 */
export const DOCUMENTERO_INDEXABLE = false;

/**
 * Header menu, in the order Raul asked for (19.09.2026): the three
 * certificates, then the multilingual extract with its two variants, then
 * guides. No account entry — documentero has no customer account in the
 * menu; order tracking is the `/comanda/status/` page, as on eghiseul.
 */
export const DOCUMENTERO_NAV: DocumenteroNavItem[] = [
  { label: 'Certificat naștere', href: '/certificat-de-nastere/', orderSlug: 'certificat-nastere' },
  { label: 'Certificat căsătorie', href: '/certificat-de-casatorie/', orderSlug: 'certificat-casatorie' },
  { label: 'Certificat celibat', href: '/certificat-de-celibat/', orderSlug: 'certificat-celibat' },
  {
    label: 'Extras multilingv',
    href: '/extras-multilingv/',
    orderSlug: 'extras-multilingv-certificat-nastere',
    children: [
      {
        label: 'Extras multilingv de naștere',
        hint: 'Formularul UE al actului de naștere',
        href: '/extras-multilingv/',
        orderSlug: 'extras-multilingv-certificat-nastere',
      },
      {
        label: 'Extras multilingv de căsătorie',
        hint: 'Formularul UE al actului de căsătorie',
        href: '/extras-multilingv/#casatorie',
        orderSlug: 'extras-multilingv-certificat-casatorie',
      },
    ],
  },
  { label: 'Ghiduri', href: '/ghiduri/' },
];

/** Public path of the order wizard for a documentero service. */
export function documenteroOrderHref(orderSlug: string): string {
  return `/comanda/${orderSlug}/`;
}

/** Shared order-tracking page (code + email), served on this host with the documentero chrome. */
export const DOCUMENTERO_TRACK_HREF = '/comanda/status/';

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
    { label: 'Urmărește comanda', href: DOCUMENTERO_TRACK_HREF },
  ],
} as const;
