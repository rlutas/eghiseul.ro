# Două branduri, un deploy: eghiseul.ro + documentero.ro

**Stare:** fundația LIVE din 19.09.2026 (rutare pe host, brand pe comandă,
emailuri, admin). Paginile publice documentero se scriu separat (vezi
[`../../seo/2026-09-19-site-satelit-stare-civila.md`](../../seo/2026-09-19-site-satelit-stare-civila.md)
pentru DE CE și planul de conținut).

## Ce înseamnă

Același repo, același proiect Vercel (`eghiseul-ro`), aceeași bază de date,
același admin, același Stripe, aceeași firmă (eDigitalizare SRL), aceeași
avocată. Diferă doar fața publică: pe `documentero.ro` se văd numai actele de
stare civilă, cu brandul, header-ul, footer-ul și emailurile documentero.

Regula de aur: **brandul unei CERERI vine din host; brandul unei COMENZI vine
din `orders.platform`**, stampilat la crearea draftului și nemodificat după.
Un operator din admin (pe eghiseul.ro) care trimite un link de plată pentru o
comandă documentero trimite un link pe documentero.ro.

## Cum circulă cererea

```
documentero.ro/                → src/app/documentero/page.tsx          (rewrite, next.config.ts)
documentero.ro/<public>        → src/app/documentero/<public>/page.tsx (rewrite)
documentero.ro/robots.txt      → src/app/documentero/robots.txt/route.ts
documentero.ro/sitemap.xml     → src/app/documentero/sitemap.xml/route.ts
documentero.ro/<rută eghiseul> → 404 (nu există în grupul documentero)
documentero.ro/comanda|account|auth|completare|reincarca-poza|api → PARTAJATE, nerescrise
<orice host>/documentero/…     → 404 din src/proxy.ts (calea internă nu e URL public)
```

- `next.config.ts` → `rewrites().beforeFiles` cu `has: [{ type: 'host' }]`.
  Zero cost pentru cererile eghiseul (nu e middleware).
- `src/proxy.ts` refuză calea literală `/documentero/*` pe orice host
  (middleware-ul vede calea ORIGINALĂ, înainte de rewrite — un rewrite de
  blocare ar fi prins și cererile abia rescrise).
- Hosturi suplimentare (preview, local): `DOCUMENTERO_EXTRA_HOSTS` (pentru
  rewrite, la build) + `BRAND_HOST_OVERRIDES` (pentru `brandFromHost`, la
  runtime). ⚠️ `has: host` din rewrites compară hostname-ul FĂRĂ port, iar
  `brandFromHost` primește header-ul cu port: listează ambele forme. Local, fără
  `/etc/hosts`:

  ```bash
  DOCUMENTERO_EXTRA_HOSTS="documentero.127.0.0.1.nip.io,documentero.127.0.0.1.nip.io:3000" \
  BRAND_HOST_OVERRIDES="documentero=documentero.127.0.0.1.nip.io,documentero.127.0.0.1.nip.io:3000" \
  npx next dev -p 3000   # apoi http://documentero.127.0.0.1.nip.io:3000/
  ```
- Redirecturile din `next.config.ts` sunt istoria eghiseul (WordPress, cleanup
  301); toate primesc `missing: host documentero`, altfel `/despre/` și
  `/certificat-de-celibat/` de pe documentero erau redirecționate (prins la
  smoke, 19.09).

## Grupurile de rute

| Grup | Ce conține | Chrome |
|---|---|---|
| `src/app/(eghiseul)/` | toate paginile publice eghiseul + admin + colaborator + embed | `Header` + `WhatsAppFloat`, fix (static, fără `headers()`) |
| `src/app/(order)/` | `comanda`, `auth`, `completare`, `reincarca-poza`, `(customer)` — partajate | ales per host în `layout.tsx` (`getBrand()`; rutele sunt oricum dinamice) + `BrandProvider` |
| `src/app/documentero/` | paginile publice documentero | `HeaderDocumentero` + `FooterDocumentero` |
| rădăcină | `layout.tsx` (html/body, QueryProvider, CookieConsent, AttributionTracker), `api/`, `robots.ts`, `sitemap.ts`, `not-found`, `error` | — |

Header-ul eghiseul NU mai e în root layout: altfel ar fi trebuit citit hostul
în root (`headers()`), ceea ce ar fi făcut TOATE paginile eghiseul dinamice.

## Modulul de brand — `src/lib/brand/`

| Fișier | Ce dă | De unde se apelează |
|---|---|---|
| `brands.ts` | `BRANDS`, `brandFromHost(host)`, `brandById(id)`, `brandSellsService()` | oriunde (date pure; și din `next.config`, teste) |
| `server.ts` | `getBrand()` (din `headers()`), `brandFromRequest(req)` | layout-uri dinamice, route handlers. ⚠️ `headers()` face ruta dinamică — nu din paginile statice eghiseul |
| `client.tsx` | `BrandProvider`, `useBrand()` | componente client din wizard/checkout/status/account |
| `for-order.ts` | `brandForOrder(order)`, `appBaseForOrder(order)` | emailuri, Stripe, linkuri de reluare — TOT ce vorbește despre o comandă |

Ce e per brand: nume, domeniu, `baseUrl`, email de contact, `emailFrom`
(Resend), logo + culori pentru emailuri, OG implicit, lista de servicii
vândute (`serviceSlugs`; `null` = toate, la eghiseul), `registryPlatform`,
linia legală.

## Unde se citește brandul comenzii

- `POST /api/orders/draft` scrie `platform` din host (`brandFromRequest`).
- Stripe `success_url`/`cancel_url` (`api/orders/[id]/payment`) — pe
  documentero.ro pentru comenzile documentero.
- Emailul de confirmare (`lib/email/order-confirmation.ts`): antet, culori,
  contact, linie legală, `from` și linkul de status, toate din brandul comenzii.
- `brandedEmailHtml({ brand })` și `ctaButton(label, url, brand)` — opțional;
  fără `brand` = eghiseul, deci cei 49 de apelanți existenți sunt neschimbați.
  De portat, pe măsură ce apar comenzi documentero: transfer bancar / dovadă,
  document gata, link completare, recovery/abandon, cerere de reîncărcare.
- `buildResumeUrl({ …, platform })` (recovery cron, follow-up telefonic).
- Registrul central: `allocateNumber({ platform: brandForOrder(order).registryPlatform })`
  în `lib/documents/auto-generate.ts` și `api/admin/orders/[id]/generate-document`
  (19.09). Decontul avocatei (`lib/admin/avocat-decont.ts`) etichetează rândurile
  documentero; `/api/admin/orders/counts` și exportul CSV primesc `platform`.

## Baza de date

- `orders.platform TEXT NOT NULL DEFAULT 'eghiseul' CHECK (eghiseul|documentero)`,
  index, migrarea `181_orders_platform.sql` (aplicată 19.09.2026, 1.357 de
  rânduri = eghiseul).
- Registrul central: `supabase/registry/003_platform_documentero.sql` extinde
  CHECK-ul de pe `number_registry.platform` cu `documentero`. Se aplică pe
  proiectul `registru-barou-central` (`ksqkttalapjlgugshuks`), NU pe DB-ul
  eghiseul.

## Admin

- Lista de comenzi: chip „Platformă” (Ambele / eghiseul.ro / documentero.ro),
  parametru `?platform=`; badge roșu „documentero” lângă codul comenzii.
- Restul admin-ului e comun: aceeași coadă, aceleași statusuri, același
  registru, aceeași facturare (aceeași serie Oblio — decizie 19.09).

## SEO per brand

- `buildPageMetadata({ …, brand: 'documentero' })` → canonical/OG absolute pe
  documentero.ro, `siteName`, OG implicit documentero, titlu `absolute` (nu
  primește șablonul `%s | eGhiseul.ro` din root).
- `src/app/documentero/layout.tsx` are `metadataBase` și titlul implicit
  documentero; `verification.google` se completează când există proprietatea GSC.
- Pagini legale proprii pe documentero (20.09): `/termeni-si-conditii/`,
  `/politica-de-confidentialitate/`, `/politica-de-anulare/`,
  `/politica-cookies/`; `Brand.legalBaseUrl` = originea brandului, fiecare
  brand servește aceleași patru căi.
- Rutele partajate (`(order)`: checkout, success, status, cont) iau titlul din
  `generateMetadata` al layout-ului `(order)` — pe documentero `title.absolute`
  + șablon `%s | documentero.ro`, `noindex`; pe eghiseul returnează `{}` și
  rămâne root-ul. Fără asta tab-ul arăta „eGhișeul.ro” (19.09).
- Iconițe: convențiile de fișier din segmentul RĂDĂCINĂ (`src/app/icon.png`,
  `apple-icon.png`) se injectează pe orice pagină, deci documentero are
  `src/app/documentero/icon.png` + `apple-icon.png` (Next păstrează iconițele
  statice ale celui mai adânc segment). `proxy.ts` exceptează exact aceste două
  căi de la 404-ul pe `/documentero/*`; `/favicon.ico` e rescris pe host către
  `public/images/documentero/favicon.ico`, iar cel eghiseul stă în
  `public/favicon.ico` (nu mai e injectat ca `<link>`).
- Header documentero: `DOCUMENTERO_NAV` + `DOCUMENTERO_SERVICES_MENU`
  (`src/config/documentero-nav.ts`) — „Servicii” cu mega-meniu, fără cont;
  urmărirea comenzii e `/comanda/status/` (`DOCUMENTERO_TRACK_HREF`).
- Sitemap documentero e CURATORIAT: `src/config/documentero-sitemap.ts`. O
  pagină intră acolo doar când e scrisă și gata de index. Placeholder-ul de
  acasă e `noindex`.
- Schema documentero: `src/lib/seo/documentero-schema.ts` (`Organization` cu
  `parentOrganization` eghiseul.ro, `WebSite`, `Service`+`Product` pe servicii,
  `Article` cu autorul real pe ghiduri, `FAQPage` pe acasă; fără `aggregateRating`).
- Paginile publice: `src/app/documentero/` (acasă, `certificat-de-casatorie`,
  `certificat-de-celibat`, `extras-multilingv`, `ghiduri`, `ghiduri/<slug>`,
  `despre`, `contact`), componente în `src/components/documentero/`, prețuri din
  DB prin `src/lib/documentero/services.ts`, `noindex` până la
  `DOCUMENTERO_INDEXABLE` (`src/config/documentero-nav.ts`).

## Cum adaugi un al treilea brand

1. `BRANDS` în `src/lib/brand/brands.ts` + `BrandId`.
2. `rewrites()` în `next.config.ts` (hostul + un nou grup `src/app/<brand>/`)
   și `proxy.ts` (calea internă).
3. CHECK pe `orders.platform` (migrare) + CHECK în registrul central +
   `RegistryPlatform`.
4. Header/footer proprii, layout cu `BrandProvider`, robots + sitemap.
5. Domeniu în Vercel, GSC, GA4, Resend (domeniu verificat pentru `emailFrom`).

## Verificare locală

```bash
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: documentero.ro" http://127.0.0.1:3000/            # 200, pagina documentero
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: documentero.ro" http://127.0.0.1:3000/calculator/ # 404
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: eghiseul.ro"    http://127.0.0.1:3000/documentero/ # 404
curl -s -H "Host: documentero.ro" http://127.0.0.1:3000/robots.txt                                    # Sitemap: https://documentero.ro/sitemap.xml
```

Teste: `tests/unit/lib/brand/brands.test.ts`.

## Rămase (în ordinea în care dor)

1. ~~Alocarea numerelor de Barou cu `platform` din comandă~~ — 19.09.
2. ~~Emailurile din fluxul de comandă care încă nu primesc `brand`~~ — 20.09:
   13 șabloane + 17 apelanți; `brandedEmailHtml` repictează literalele
   eghiseul (`repaintForBrand`). Rămân eghiseul-only, intenționat: emailurile
   interne (dovadă plată, colaborator), marketing/warmup/campanii, contact,
   avarii, remindere auto; `unsubscribeUrlFor` duce la pagina eghiseul.
3. ~~Texte cu „eghiseul.ro” în wizard/KYC/login~~ — 20.09 (selfie, semnătură,
   transfer, auth, register, upload/completare, specimen, contract docx).
4. ~~`verification.google`~~ — 20.09 (meta tag; TXT în DNS dacă proprietatea e Domain).
5. ~~Logo email și OG implicit~~ — 20.09 (`public/images/brand/documentero-email-logo.png`,
   `public/og/documentero-default.png`).
6. `src/types/supabase.ts` nu cunoaște `orders.platform` (migrarea 181):
   selecturile tipate cad pe `SelectQueryError`; se folosește clientul
   `as any`. De regenerat tipurile la prima ocazie.
7. Ținta hyperlinkului din `contract-prestari.docx` rămâne T&C eghiseul
   (`word/_rels` nu se templetizează); textul vizibil urmează brandul.
8. Pagina de dezabonare (`/api/contacts/unsubscribe`) e eghiseul-branded.
