# Ghid de design — pagini de servicii

**Referința aprobată:** `/servicii/extras-de-carte-funciara/` (Extras de Carte Funciară). Toate paginile de servicii urmează acest tipar. Confirmat 2026-06-16.

> Scop: orice pagină de serviciu nouă/refăcută arată și se comportă identic. Urmărește acest ghid + componentele partajate.

---

## 1. Principii

- **Stil:** „Accessible & Ethical" (gov) — contrast bun, `focus-visible` rings, touch targets ≥44px, `motion-reduce`, iconițe **lucide** (niciodată emoji).
- **Brand:** navy `secondary-900`/`#0C1A2F` (fundaluri închise) + auriu `primary-500` (accent/CTA). PJ cazier = temă albastră (excepție istorică).
- **Mobile-first:** majoritatea traficului e pe mobil. Verifică la 375px.
- **Consistență fundal (alternanță):** alb → `neutral-50` → alb → secțiune dark → … Nu pune două secțiuni cu același fundal una după alta.

## 2. Ordinea secțiunilor (canonică)

1. **Hero** (dark) — breadcrumb + badge-uri + H1 (`Nume\nspan Online` auriu) + descriere + USP box + listă pași; în dreapta **price card** (`lg:justify-between`).
2. **Trust strip** (alb) — 4 micro-statistici cu iconițe.
3. **Despre serviciu** (`neutral-50`) — badge „Despre serviciu" + H2 + proză + 1 card info onest.
4. **Cine poate cere + ce acte/date** (alb) — 2 carduri.
5. **Identificare / Ce îți trebuie** (alb) — grid carduri (gradient tile + hover-lift) + notă cross-sell.
6. **Preț & opțiuni** (`neutral-50`) — 3 carduri mari: serviciul de bază (featured), urgență 0 RON, extras opțional. Prețuri **fără TVA** + „+ TVA 21% · {total} RON cu TVA".
7. **Recenzii** (`neutral-50`) — `<ReviewsSection />` (marquee animat, recenzii reale).
8. **Cum funcționează** (dark) — timeline conectat, 4 pași, cercuri gradient numerotate.
9. **Bine de știut** (`neutral-50`) — 2 carduri (verde + amber) pentru USP-uri/edge cases.
10. **Specimen** (alb) — badge „Specimen" + imagine înrămată (glow+ring) + coloană dreapta cu validitate legală + link **verificare ANCPI**; sub el 2 carduri albe „Ce conține" / „Cât este valabil".
11. **Comparativ** (`neutral-50`) — tabel eGhișeul vs alți operatori vs ghișeu vs portal (bifă/X, coloana eGhișeul evidențiată) + CTA.
12. **Conținut SEO suplimentar** (alb) — proză țintită pe cluster (badge + H2).
13. **FAQ** (`<ServiceFAQ />`, `neutral-50`) — emite automat schema `FAQPage`.
14. **CTA final** (dark) — titlu + subtext + `OrderButton` + `WhatsAppButton` + o linie discretă „4,9 din peste 450 de recenzii Google". Fundal: glow radial subtil + hairline auriu sus. **Nu** aglomera (fără panel/badge/trust-row).
15. **`<MobileStickyCTA />`** (în afara `<main>`) + `<Footer />`.

> Nu orice serviciu are toate secțiunile — păstrează ordinea și fundalurile pentru cele incluse.

## 3. Componente partajate (refolosește, nu reinventa)

| Componentă | Rol |
|---|---|
| `components/services/order-button.tsx` (`OrderButton`) | CTA primar auriu; săgeata apare la **hover/focus**. |
| `components/services/whatsapp-button.tsx` (`WhatsAppButton`) | CTA secundar WhatsApp (verde). **NU** folosi „Sună-ne"/telefon. |
| `components/services/mobile-sticky-cta.tsx` (`MobileStickyCTA`) | Bară jos pe mobil; primește `basePrice`, calculează split TVA. |
| `components/services/google-reviews-badge.tsx` (`GoogleReviewsBadge`) | Badge Google în price card (`variant="bar"`). |
| `components/services/reviews-section.tsx` (`ReviewsSection`) | Carusel marquee cu recenzii reale. |
| `components/services/service-price.tsx` (`ServicePrice`) | Preț hero (split TVA). |
| `components/services/service-faq.tsx` (`ServiceFAQ`) | FAQ + schema `FAQPage`. |
| `lib/seo` — `buildPageMetadata`, `buildServicePageGraph`, `serviceUrl` | Metadata + schema `@graph` + URL-uri canonice. |
| `config/contact.ts` / `config/reviews.ts` | WhatsApp, Google reviews URL/label, recenzii reale. |

## 4. Reguli de conținut & SEO

- **Preț:** ex-VAT ca headline + „+ TVA 21% · {total} RON cu TVA". `base_price` din DB e cu TVA.
- **Titlu:** NU adăuga „| eGhișeul" — template-ul din `layout.tsx` adaugă „| eGhiseul.ro".
- **OG image:** `ogImage: '/og/default.png'` (până avem OG per-serviciu).
- **Schema:** `buildServicePageGraph` (Service+Offer+AggregateRating 4.9/`reviewCount`+WebPage+reviewedBy+Breadcrumb).
- **Recenzii:** afișează „**peste 450** de recenzii" + „4,9" (fără număr exact — `GOOGLE_REVIEW_COUNT_LABEL`).
- **FAQ:** acoperă exact-match queries (ce este/ce înseamnă/cine poate/ce acte/de unde/cât costă/cât valabil + „se poate gratuit?").
- **Internal linking:** către serviciile/articolele din cluster prin `serviceUrl()`.
- **Badge categorie** pe FIECARE secțiune cu header (pill `bg-primary-100 text-primary-700 rounded-full`).
- **Gramatică RO:** „Bine de știut" (nu „Bun"). Verifică diacriticele.

## 5. Reguli tehnice (ca să nu pice CI)

- Lint rulează pe **tot proiectul** (`eslint`), blochează pe orice **eroare**. Reguli care prind des:
  - `react/no-unescaped-entities` → folosește ghilimele românești „ … ” (nu `"` drepte) în JSX.
  - `@next/next/no-html-link-for-pages` → folosește `<Link>` din `next/link` pentru rute interne, nu `<a>`.
  - Importuri nefolosite = warning (nu blochează), dar curăță-le.
- Rulează înainte de commit: `npm run lint` (tot proiectul) + `npx tsc --noEmit` + `npm run build`.

## 6. Workflow per pagină (după acest ghid)

1. Analiză GSC/SEMrush pe cluster (vezi `docs/seo/`).
2. Construiește pagina pe acest tipar + componentele partajate.
3. `/ui-ux-pro-max` pass (mobil + accesibilitate).
4. `npm run lint` (tot) + `tsc` + `build` verde.
5. Finisează SEO (title/meta/schema/FAQ/internal links).
6. Commit + push pe `main`.
