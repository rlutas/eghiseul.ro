/**
 * Navigation + indexing switch for cazierfiscal.com (third brand, 2026-11-10).
 * One service, so no mega menu: the order button goes straight to the wizard.
 */

/** Launched 10.11.2026: pages indexable, sitemap served. */
export const CAZIERFISCAL_INDEXABLE = true;

export const CAZIERFISCAL_ORDER_HREF = '/comanda/cazier-fiscal/';
export const CAZIERFISCAL_TRACK_HREF = '/comanda/status/';

export const CAZIERFISCAL_NAV = [
  { label: 'Cum funcționează', href: '/#cum-functioneaza' },
  { label: 'Preț', href: '/#pret' },
  { label: 'Ghiduri', href: '/ghiduri/' },
  { label: 'Despre', href: '/despre/' },
  { label: 'Contact', href: '/contact/' },
] as const;

/**
 * Guides published on the site. A guide goes here only once its page exists:
 * the footer, /ghiduri/ and the sitemap all read this list.
 */
export const CAZIERFISCAL_GUIDES: ReadonlyArray<{ href: string; label: string; hint: string; updated: string }> = [
  {
    href: '/ghiduri/cazier-fiscal-din-spv/',
    label: 'Cazier fiscal din SPV',
    hint: 'Cum îl ceri singur, gratuit, din Spațiul Privat Virtual, și ce faci dacă nu ai cont.',
    updated: '2026-11-11',
  },
  {
    href: '/ghiduri/cazier-fiscal-din-strainatate/',
    label: 'Cazier fiscal din străinătate',
    hint: 'SPV, împuternicit sau avocat; valabilitatea de 30 de zile, traducerea și apostila.',
    updated: '2026-11-11',
  },
];
