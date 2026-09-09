import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Match WordPress URL convention — preserves backlinks at migration cutover.
  // GSC has indexed all eghiseul.ro URLs with trailing slash; flipping this
  // post-launch would invalidate ~26M impressions of cached results.
  trailingSlash: true,

  async redirects() {
    return [
      // Variante de URL pe care le încearcă lumea pentru pagina „Despre noi".
      { source: '/despre/', destination: '/despre-noi/', permanent: true },
      { source: '/echipa/', destination: '/despre-noi/', permanent: true },
      { source: '/about/', destination: '/despre-noi/', permanent: true },
      // ─────────────────────────────────────────────────────────────────
      // Cleanup pagini de locație (09.09.2026) — August 2026 Spam Update.
      //
      // 48 de pagini de oraș (cazier) + 42 de județ (extras CF) au produs, pe
      // trei luni, 208 clicuri LA UN LOC — 0,1% din traficul site-ului, 5
      // clicuri per pagină per trimestru. În schimb: 33 de fraze identice pe
      // toate cele 48 de pagini de oraș (37,6% din pagina mediană), 25 pe toate
      // cele 42 de județe (43%), iar mascarea numelor proprii CREȘTEA
      // similaritatea dintre ele (0,66→0,72 și 0,56→0,71) — adică singurul
      // lucru care le diferenția era numele locului. 40 din 48 erau deja
      // refuzate la index de Google, dar rămâneau cross-linkate (49 inlinkuri
      // fiecare), deci plasa de doorway trăia mai departe în graful de linkuri.
      //
      // Orașele sunt enumerate explicit, NU cu wildcard: sub aceeași rută stau
      // /persoana-fizica/ și /persoana-juridica/, care sunt servicii reale.
      //
      // Analiza: docs/seo/2026-09-recuperare-spam-update/PLAN-RECUPERARE.md
      // ─────────────────────────────────────────────────────────────────
      { source: '/servicii/cazier-judiciar-online/cluj-napoca/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/timisoara/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/iasi/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/constanta/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/brasov/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/craiova/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/sibiu/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/oradea/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/arad/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/bucuresti/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/galati/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/ploiesti/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/bacau/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/pitesti/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/baia-mare/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/suceava/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/targu-mures/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/buzau/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/resita/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/drobeta-turnu-severin/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/zalau/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/slobozia/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/calarasi/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/giurgiu/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/alexandria/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/sfantu-gheorghe/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/miercurea-ciuc/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/braila/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/botosani/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/vaslui/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/ramnicu-valcea/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/deva/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/alba-iulia/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/bistrita/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/focsani/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/tulcea/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/targoviste/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/targu-jiu/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/piatra-neamt/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/slatina/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/satu-mare/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/ilfov/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/turda/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/medias/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/lugoj/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/barlad/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/sebes/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/servicii/cazier-judiciar-online/onesti/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      {
        source: '/servicii/extras-de-carte-funciara/:judet/',
        destination: '/servicii/extras-de-carte-funciara/',
        permanent: true,
      },

      // ─────────────────────────────────────────────────────────────────
      // Consolidare articole satelit (09.09.2026).
      //
      // 32 de articole care, pe trei luni, au adus 0–42 de clicuri fiecare și
      // acoperă subiecte deja tratate de pagina-țintă. Cazul care lămurește
      // totul: cele 4 articole de constatator rescrise pe 24.08 (scor de tipare
      // AI 25,1→3,7) au rămas cu ZERO expuneri — nu textul era problema, ci
      // existența a 8 pagini satelit pentru un subiect care are deja un ghid cu
      // 479 de clicuri.
      //
      // Verificat înainte de aplicare: zero lanțuri de redirect, zero backlinkuri
      // externe cunoscute către ele, toate țintele există.
      // Lista completă cu motivul per pagină:
      // docs/seo/2026-09-recuperare-spam-update/research/09-lista-decizii-per-pagina.md
      // ─────────────────────────────────────────────────────────────────
      { source: '/cat-poti-construi-pe-teren/', destination: '/calculator/cat-pot-construi/', permanent: true },
      { source: '/ce-este-un-releveu/', destination: '/servicii/extras-plan-cadastral/', permanent: true },
      { source: '/radiere-firma-srl-ghid/', destination: '/rolul-si-atributiile-onrc-romania/', permanent: true },
      { source: '/cazier-fiscal-persoana-fizica/', destination: '/cazier-fiscal-fara-spv/', permanent: true },
      { source: '/certificat-de-nastere-pentru-buletin-pasaport/', destination: '/acte-necesare-certificat-de-nastere/', permanent: true },
      { source: '/apostila-de-la-haga-ghid-acte-obtinere/', destination: '/servicii/eliberare-certificat-de-nastere/', permanent: true },
      { source: '/duplicat-certificat-de-casatorie/', destination: '/acte-necesare-casatorie/', permanent: true },
      { source: '/verificare-cazier-fiscal/', destination: '/cazier-fiscal-fara-spv/', permanent: true },
      { source: '/cazier-fiscal-firma/', destination: '/cazier-fiscal-fara-spv/', permanent: true },
      { source: '/duplicat-certificat-de-nastere/', destination: '/acte-necesare-certificat-de-nastere/', permanent: true },
      { source: '/extras-de-carte-funciara-pentru-casa-verde/', destination: '/servicii/extras-de-carte-funciara/', permanent: true },
      { source: '/valabilitate-certificat-de-celibat/', destination: '/servicii/eliberare-certificat-de-celibat/', permanent: true },
      { source: '/certificat-de-nastere-din-strainatate/', destination: '/acte-necesare-certificat-de-nastere/', permanent: true },
      { source: '/ce-este-planul-cadastral/', destination: '/servicii/extras-plan-cadastral/', permanent: true },
      { source: '/certificat-de-nastere-pierdut/', destination: '/acte-necesare-certificat-de-nastere/', permanent: true },
      { source: '/transcriere-certificat-de-nastere/', destination: '/acte-necesare-certificat-de-nastere/', permanent: true },
      { source: '/certificat-constatator-cu-istoric/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-constatator-pentru-banca/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-constatator-pentru-licitatie/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-de-celibat/', destination: '/servicii/eliberare-certificat-de-celibat/', permanent: true },
      { source: '/certificat-de-celibat-pentru-casatorie-in-strainatate/', destination: '/servicii/eliberare-certificat-de-celibat/', permanent: true },
      { source: '/model-certificat-de-casatorie/', destination: '/acte-necesare-casatorie/', permanent: true },
      { source: '/cazier-judiciar-online-gratuit/', destination: '/servicii/cazier-judiciar-online/', permanent: true },
      { source: '/certificat-constatator-de-baza/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-constatator-insolventa/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-constatator-pentru-fonduri-europene/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-constatator-pentru-notar/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/certificat-constatator-pfa/', destination: '/cele-4-tipuri-de-certificat-constatator-online/', permanent: true },
      { source: '/inregistrare-nastere-copil-nou-nascut/', destination: '/acte-necesare-certificat-de-nastere/', permanent: true },
      { source: '/schimbare-sediu-social-srl-ghid/', destination: '/rolul-si-atributiile-onrc-romania/', permanent: true },
      { source: '/suspendare-activitate-firma-ghid/', destination: '/rolul-si-atributiile-onrc-romania/', permanent: true },
      { source: '/transcriere-certificat-de-casatorie/', destination: '/acte-necesare-casatorie/', permanent: true },
      // Consolidare (24.08.2026, curatenie post spam-update): articol thin
      // (474 cuvinte), duplicat al ghidului principal de CF colectivă.
      {
        source: '/importanta-extras-de-carte-funciara-colectiva/',
        destination: '/totul-despre-cartea-funciara-colectiva/',
        permanent: true,
      },
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
        source: '/servicii/verificare-rovinieta-online/',
        destination: '/tools/verificare-rovinieta-online/',
        permanent: true,
      },
      // Slug-ul DB `rovinieta` era servit de /servicii/[slug] ÎN PARALEL cu
      // pagina reală, ambele 200 și ambele în sitemap — duplicat live, cu titlu
      // stricat („Rovinieta Online Online"). Găsit la auditul din 28.07.2026.
      // Zero trafic pe URL-ul dinamic în GSC (28 zile), deci redirectul nu
      // pierde nimic.
      {
        source: '/servicii/rovinieta/',
        destination: '/servicii/rovinieta-online/',
        permanent: true,
      },
      // Certificat de Integritate — canonical SEO page is at the WP-parity URL
      // /servicii/certificat-de-integritate-comportamentala/. Both the DB slug
      // and the no-"de" variant collapse there (single hop, no redirect chain).
      {
        source: '/servicii/certificat-integritate/',
        destination: '/servicii/certificat-de-integritate-comportamentala/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-integritate-comportamentala/',
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
        source: '/servicii/cazier-judiciar/',
        destination: '/servicii/cazier-judiciar-online/',
        permanent: true,
      },
      {
        source: '/servicii/cazier-judiciar-persoana-fizica/',
        destination: '/servicii/cazier-judiciar-online/persoana-fizica/',
        permanent: true,
      },
      {
        source: '/servicii/cazier-judiciar-persoana-juridica/',
        destination: '/servicii/cazier-judiciar-online/persoana-juridica/',
        permanent: true,
      },
      // Extras Carte Funciară — DB slug (no "de") -> WP-parity SEO URL that
      // holds the indexed traffic/backlinks (extras-DE-carte-funciara).
      {
        source: '/servicii/extras-carte-funciara/',
        destination: '/servicii/extras-de-carte-funciara/',
        permanent: true,
      },
      // Batch 2 services — DB slug -> hardcoded WP-parity SEO URL.
      // (/comanda/* keeps the DB slug for the order pipeline.)
      {
        source: '/servicii/cazier-fiscal/',
        destination: '/servicii/cazier-fiscal-online/',
        permanent: true,
      },
      {
        source: '/servicii/cazier-auto/',
        destination: '/servicii/cazier-auto-online/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-nastere/',
        destination: '/servicii/eliberare-certificat-de-nastere/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-casatorie/',
        destination: '/servicii/eliberare-certificat-de-casatorie/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-celibat/',
        destination: '/servicii/eliberare-certificat-de-celibat/',
        permanent: true,
      },
      {
        source: '/servicii/certificat-constatator/',
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
      {
        // /embed/* is MEANT to be framed by third parties (press embeds the
        // live ANCPI status widget). Later rule overrides the catch-all above.
        // ALLOWALL is intentionally invalid — browsers ignore it and fall back
        // to the CSP frame-ancestors, which is the real policy.
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
        ],
      },
    ];
  },
};

export default nextConfig;
