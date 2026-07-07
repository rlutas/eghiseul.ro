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
      // WordPress legacy taxonomy/category URLs that have no equivalent on the
      // new site (404 at cutover). Map each to the closest live page to keep
      // backlinks + indexed equity. Verified 2026-07-07 against the old WP
      // sitemap_index.xml (Yoast) vs the new site.
      { source: '/categorii_servicii/caziere', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/categorii_servicii/certificate-casatorie', destination: '/servicii/eliberare-certificat-de-casatorie/', permanent: true },
      { source: '/categorii_servicii/certificate-nastere', destination: '/servicii/eliberare-certificat-de-nastere/', permanent: true },
      { source: '/categorii_servicii/persoane-fizice', destination: '/servicii/', permanent: true },
      { source: '/categorii_servicii/persoane-juridice', destination: '/servicii/', permanent: true },
      { source: '/categorii_servicii/alte-servicii', destination: '/servicii/', permanent: true },
      { source: '/category/informatii-utile', destination: '/blog/', permanent: true },
      { source: '/category/informatii-utile/cazier-judiciar-online', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/category/informatii-utile/certificat-constatator', destination: '/servicii/certificat-constatator-online/', permanent: true },
      { source: '/category/informatii-utile/extras-de-carte-funciara', destination: '/servicii/extras-de-carte-funciara/', permanent: true },
      { source: '/cookies-policy', destination: '/politica-cookies/', permanent: true },
    ];
  },

  // Baseline security headers on every route. HSTS is already added by Vercel
  // at the edge, so it's not repeated here. CSP is intentionally omitted for
  // now — a strict policy needs testing against Stripe, GA, and the erovinieta
  // iframe; add it later as report-only first. These four are non-breaking.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Block MIME-type sniffing.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Anti-clickjacking — nothing legitimately frames our pages (the
          // rovinietă tool frames erovinieta.net as the parent, unaffected).
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Don't leak full URLs to third parties on cross-origin navigations.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Lock down browser features. camera=(self) stays enabled for the
          // KYC selfie capture; payment=(self) for Stripe wallet buttons.
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(), payment=(self), usb=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
