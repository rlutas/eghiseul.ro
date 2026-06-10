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
      // Rovinieta WP variant — both URLs exist in GSC; we canonicalize to
      // the verificare-rovinieta-online one (16K clicks vs 133 clicks).
      {
        source: '/servicii/rovinieta-online',
        destination: '/servicii/verificare-rovinieta-online/',
        permanent: true,
      },
      // Certificat de Integritate slug shortened (was -comportamentala).
      {
        source: '/servicii/certificat-integritate-comportamentala',
        destination: '/servicii/certificat-integritate/',
        permanent: true,
      },
      {
        source: '/comanda/certificat-integritate-comportamentala',
        destination: '/comanda/certificat-integritate/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
