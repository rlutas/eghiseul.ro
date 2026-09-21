/**
 * documentero.ro public navigation and the switch that opens the site to
 * search engines. Public URLs on the documentero host (no `/documentero/`
 * prefix — that is the internal route-group path, rewritten in next.config.ts).
 */
export type DocumenteroServiceIcon = 'nastere' | 'casatorie' | 'celibat' | 'ue';

export interface DocumenteroServiceMenuItem {
  label: string;
  /** One line under the label in the mega menu. */
  hint: string;
  /** Public page for this service. */
  href: string;
  /** DB service slug — the menu's "Comandă" link goes straight to its wizard. */
  orderSlug: string;
  icon: DocumenteroServiceIcon;
}

export interface DocumenteroNavItem {
  label: string;
  href: string;
  /** When set, the item opens the services mega menu instead of being a plain link. */
  mega?: boolean;
}

/**
 * While false: every documentero page is `noindex`, the sitemap is empty.
 * Flip to true only when the placeholders are gone (team photo, order count)
 * and the launch checklist in docs/documentero/lansare.md is done.
 */
export const DOCUMENTERO_INDEXABLE = false;

/**
 * All five services, as listed in the "Servicii" mega menu (header, desktop
 * and mobile). Order = what sells most first. Each has its page and its
 * wizard; the mega menu shows both.
 */
export const DOCUMENTERO_SERVICES_MENU: DocumenteroServiceMenuItem[] = [
  { label: 'Certificat de naștere', hint: 'Duplicat: pierdut, deteriorat, model vechi', href: '/certificat-de-nastere/', orderSlug: 'certificat-nastere', icon: 'nastere' },
  { label: 'Certificat de căsătorie', hint: 'Duplicat, inclusiv cu mențiunea de divorț', href: '/certificat-de-casatorie/', orderSlug: 'certificat-casatorie', icon: 'casatorie' },
  { label: 'Certificat de celibat', hint: 'Anexa 18 (fosta Anexa 9), pentru căsătorie în străinătate', href: '/certificat-de-celibat/', orderSlug: 'certificat-celibat', icon: 'celibat' },
  { label: 'Extras multilingv de naștere', hint: 'Formularul UE, fără traducere și apostilă', href: '/extras-multilingv/', orderSlug: 'extras-multilingv-certificat-nastere', icon: 'ue' },
  { label: 'Extras multilingv de căsătorie', hint: 'Aceeași procedură, pentru actul de căsătorie', href: '/extras-multilingv/#casatorie', orderSlug: 'extras-multilingv-certificat-casatorie', icon: 'ue' },
];

/**
 * Header menu (Raul, 19.09.2026, second pass): the five service links made
 * the bar cramped, so services live in ONE "Servicii" mega menu; the rest
 * are plain links. No account entry — documentero sells without an account;
 * order tracking is the `/comanda/status/` page, as on eghiseul.
 */
export const DOCUMENTERO_NAV: DocumenteroNavItem[] = [
  { label: 'Servicii', href: '/#acte', mega: true },
  { label: 'Ghiduri', href: '/ghiduri/' },
  { label: 'Despre', href: '/despre/' },
  { label: 'Contact', href: '/contact/' },
];

/** Public path of the order wizard for a documentero service. */
export function documenteroOrderHref(orderSlug: string): string {
  return `/comanda/${orderSlug}/`;
}

/** Shared order-tracking page (code + email), served on this host with the documentero chrome. */
export const DOCUMENTERO_TRACK_HREF = '/comanda/status/';

/** Footer columns. The legal links are rendered directly in footer.tsx (documentero's own pages). */
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
    { label: 'Apostila pe acte de stare civilă', href: '/ghiduri/apostila-acte-stare-civila/' },
    { label: 'Toate ghidurile', href: '/ghiduri/' },
  ],
  companie: [
    { label: 'Despre noi și avocatul nostru', href: '/despre/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Urmărește comanda', href: DOCUMENTERO_TRACK_HREF },
  ],
} as const;
