import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Match WordPress URL convention — preserves backlinks at migration cutover.
  // GSC has indexed all eghiseul.ro URLs with trailing slash; flipping this
  // post-launch would invalidate ~26M impressions of cached results.
  trailingSlash: true,

  async redirects() {
    return [
      // Orphan English route from an early iteration — collapse into the
      // Romanian canonical /servicii/[slug]/ to avoid duplicate content.
      {
        source: '/services/:slug',
        destination: '/servicii/:slug/',
        permanent: true,
      },
      {
        source: '/services/:slug/order',
        destination: '/comanda/:slug/',
        permanent: true,
      },
      // /servicii/rovinieta-online/ este acum o pagină reală (cumpărare rovinietă,
      // intenție „rovinieta online" ~134K impresii) — NU se mai redirectează.
      // Vechiul /servicii/verificare-rovinieta-online/ (16K clickuri GSC) nu are
      // pagină → îl trimitem la tool-ul real de verificare din /tools/.
      {
        source: '/servicii/verificare-rovinieta-online',
        destination: '/tools/verificare-rovinieta-online/',
        permanent: true,
      },
      // Extras multilingv (naștere/căsătorie) — rankau pe WP dar nu au pagină în Next.
      // 301 către pagina de eliberare relevantă (evită 404; recuperează link equity).
      {
        source: '/servicii/extras-multilingv-certificat-nastere',
        destination: '/servicii/eliberare-certificat-de-nastere/',
        permanent: true,
      },
      {
        source: '/servicii/extras-multilingv-certificat-casatorie',
        destination: '/servicii/eliberare-certificat-de-casatorie/',
        permanent: true,
      },
      // Certificat de Integritate — canonical SEO page is at the WP-parity URL
      // /servicii/certificat-de-integritate-comportamentala/. Both the DB slug
      // and the no-"de" variant collapse there (single hop, no redirect chain).
      {
        source: '/servicii/certificat-integritate',
        destination: '/servicii/certificat-de-integritate-comportamentala/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-integritate-comportamentala',
        destination: '/servicii/certificat-de-integritate-comportamentala/',
        permanent: true,
      },
      {
        source: '/comanda/certificat-integritate-comportamentala',
        destination: '/comanda/certificat-integritate/',
        permanent: true,
      },
      // Cazier Judiciar — DB slugs are served by the dynamic /servicii/[slug]
      // route and would duplicate the hand-tuned hardcoded pages under
      // /servicii/cazier-judiciar-online/*. Canonicalize to the SEO URLs.
      // (Only /servicii/* — /comanda/* keeps DB slugs for the order pipeline.)
      {
        source: '/servicii/cazier-judiciar',
        destination: '/servicii/cazier-judiciar-online/',
        permanent: true,
      },
      {
        source: '/servicii/cazier-judiciar-persoana-fizica',
        destination: '/servicii/cazier-judiciar-online/persoana-fizica/',
        permanent: true,
      },
      {
        source: '/servicii/cazier-judiciar-persoana-juridica',
        destination: '/servicii/cazier-judiciar-online/persoana-juridica/',
        permanent: true,
      },
      // Extras Carte Funciară — DB slug (no "de") -> WP-parity SEO URL that
      // holds the indexed traffic/backlinks (extras-DE-carte-funciara).
      {
        source: '/servicii/extras-carte-funciara',
        destination: '/servicii/extras-de-carte-funciara/',
        permanent: true,
      },
      // Batch 2 services — DB slug -> hardcoded WP-parity SEO URL.
      // (/comanda/* keeps the DB slug for the order pipeline.)
      {
        source: '/servicii/cazier-fiscal',
        destination: '/servicii/cazier-fiscal-online/',
        permanent: true,
      },
      {
        source: '/servicii/cazier-auto',
        destination: '/servicii/cazier-auto-online/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-nastere',
        destination: '/servicii/eliberare-certificat-de-nastere/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-casatorie',
        destination: '/servicii/eliberare-certificat-de-casatorie/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-celibat',
        destination: '/servicii/eliberare-certificat-de-celibat/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-constatator',
        destination: '/servicii/certificat-constatator-online/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
