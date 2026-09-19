# 19.09.2026 — documentero.ro: fundația celui de-al doilea brand
<!-- categorie: infrastructura -->

## Pentru echipă

Pornim un al doilea site, **documentero.ro**, doar pentru actele de stare
civilă (naștere, căsătorie, celibat, extrase multilingve). Se lucrează din
ACELAȘI admin, aceeași listă de comenzi, aceleași statusuri. Ce se schimbă
pentru voi: în lista de comenzi apare un filtru „Platformă” și o etichetă roșie
„documentero” pe comenzile venite de acolo. Clientul de pe documentero primește
emailuri și linkuri cu brandul documentero, nu eghiseul. Nu mutați comenzile
între branduri și nu trimiteți manual linkuri de pe eghiseul.ro unui client
documentero: linkurile generate din admin sunt deja pe domeniul corect. Site-ul
public documentero nu e încă lansat (pagina de acasă e „în curând"); designul
se alege acum.

---

## Rezumat tehnic

Spec: [`docs/technical/specs/multi-brand.md`](../technical/specs/multi-brand.md).
Analiza de business: [`docs/seo/2026-09-19-site-satelit-stare-civila.md`](../seo/2026-09-19-site-satelit-stare-civila.md).

- **Rutare pe host** în `next.config.ts` (`rewrites().beforeFiles`, `has: host`):
  `documentero.ro/x → /documentero/x`; rutele eghiseul dau 404 pe documentero;
  wizard/account/auth/api partajate. `src/proxy.ts` refuză calea internă
  `/documentero/*` pe orice host.
- **Grupuri de rute:** toate paginile eghiseul mutate în `src/app/(eghiseul)/`
  (header static), rutele partajate în `src/app/(order)/` (header ales per host
  + `BrandProvider`), `src/app/documentero/` nou. Root layout fără `Header`.
- **`src/lib/brand/`:** `BRANDS`, `brandFromHost`, `getBrand()`, `useBrand()`,
  `brandForOrder()` / `appBaseForOrder()`; `BRAND_HOST_OVERRIDES`,
  `DOCUMENTERO_EXTRA_HOSTS` pentru preview/local.
- **DB:** migrarea 181 `orders.platform` (default eghiseul, CHECK, index),
  stampilată în `POST /api/orders/draft` din host. Registru central:
  `supabase/registry/003_platform_documentero.sql` (de aplicat pe proiectul
  registrului — vezi spec).
- **Per comandă:** Stripe `success_url`/`cancel_url`, emailul de confirmare
  (antet, culori, `from`, contact, linie legală, link status),
  `buildResumeUrl` (recovery + follow-up telefonic), disclosure din wizard,
  WhatsApp/contact pe wizard/checkout/status/success, footer brand-aware pe
  rutele partajate.
- **Admin:** chip „Platformă" + `?platform=` în `/api/admin/orders/list`,
  badge „documentero".
- **SEO:** `buildPageMetadata({ brand })`, `robots.txt` + sitemap curatoriat
  pentru documentero, placeholder acasă `noindex`.
- **Teste:** `tests/unit/lib/brand/brands.test.ts` (9); `last-modified.test.ts`
  citește din `(eghiseul)`. 2.002 teste verzi.
