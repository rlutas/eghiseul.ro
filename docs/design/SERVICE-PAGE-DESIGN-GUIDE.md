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

> **Sursă de adevăr:** `src/app/servicii/extras-de-carte-funciara/page.tsx` (CF). Lista de mai jos
> reflectă EXACT pagina CF live — fiecare secțiune cu fundalul ei. Regula de aur: **alternanță
> strictă** (niciodată două secțiuni cu același fundal una după alta). `<ReviewsSection />` și
> `<ServiceFAQ />` au fundal **`neutral-50`** intern — contează la alternanță.

| # | Secțiune | Fundal | Conținut |
|---|----------|--------|----------|
| 1 | **Hero** | **dark** `from-secondary-900 to-[#0C1A2F]` + dot-texture `opacity-5` | breadcrumb + 3 badge-uri (categorie aurie / „Eliberare în câteva minute" verde / instituție outline) + H1 (`Nume\nspan auriu`) + descriere + **USP box** auriu (`bg-primary-500/15`) + **info box** `bg-white/10 backdrop-blur` cu listă 4 pași; dreapta **price card** alb (`lg:justify-between`, `lg:self-center`). |
| 2 | **Trust strip** | **alb** `bg-white border-b` | 4 micro-statistici (tile `bg-primary-50`, valoare + label). |
| 3 | **Despre serviciu (SEO Intro)** | **`neutral-50`** | badge „Despre serviciu" + H2 „Ce este… și de unde se obține" + 2 paragrafe + 1 card alb „Cât costă și de unde" + dedesubt **2 carduri albe** „Cine poate cere" / „Ce acte și date" (în aceeași secțiune). |
| 4 | **Identificare / Ce îți trebuie** | **alb** | grid 4 carduri (**gradient tile** `from-primary-100 to-primary-200` + **hover-lift** `hover:-translate-y-1 hover:shadow-lg`) + notă cross-sell `bg-primary-50`. |
| 5 | **Preț & opțiuni** | **`neutral-50`** | 3 carduri mari: bază **featured** (`border-2 border-primary-500`), urgență **0 RON** (verde), add-on opțional. Prețuri **ex-TVA** headline + „+ TVA 21% · {total} RON cu TVA". |
| 6 | **Use cases — „Când ai nevoie"** | **alb** | grid 4 carduri (gradient tile + hover-lift) cu liste de scenarii bifate. |
| 7 | **`<ReviewsSection />`** | **`neutral-50`** (intern) | marquee animat cu recenzii reale Google. |
| 8 | **Cum funcționează** | **dark** + dot-texture | timeline conectat, 4 pași, cercuri gradient numerotate (`from-primary-400 to-primary-600`), badge „Proces simplu". |
| 9 | **Bine de știut** | **`neutral-50`** | 2 carduri (verde „fără taxă de urgență" + amber „edge case"). |
| 10 | **Specimen** | **alb** | badge „Specimen" + imagine înrămată (glow+ring) + coloană dreapta cu validitate legală + link **verificare ANCPI**; dedesubt 2 carduri albe „Ce conține" / „Cât valabil". |
| 11 | **Comparativ** | **`neutral-50`** | tabel eGhișeul vs alți operatori vs ghișeu vs portal (bifă/X, coloana eGhișeul `bg-primary-500`/`bg-primary-50`) + CTA. |
| 12 | **Conținut SEO suplimentar** | **alb** | proză țintită pe cluster (badge + H2 + listă + notă cross-sell). |
| 13 | **`<ServiceFAQ />`** | **`neutral-50`** (intern) | accordion + schema `FAQPage` automată. |
| 14 | **CTA final** | **dark** + dot-texture + glow radial + hairline auriu sus | titlu + subtext + `OrderButton` + `WhatsAppButton` + o linie „4,9 din peste 450 de recenzii Google". **Nu** aglomera (fără panel/badge/trust-row). |
| — | **`<MobileStickyCTA />`** (în afara `<main>`) + **`<Footer />`** | — | bară sticky mobil + footer. |

**Secvența de fundaluri (memoreaz-o):**
`dark → alb → neutral-50 → alb → neutral-50 → alb → neutral-50 → dark → neutral-50 → alb → neutral-50 → alb → neutral-50 → dark`

> Nu orice serviciu are toate secțiunile (ex: fără Specimen dacă nu există imagine; fără secțiunea
> 4/12 dacă nu e relevant SEO). Când **omiți** o secțiune, **verifică alternanța** — dacă scoaterea
> lasă două fundaluri identice lipite, mută `<ReviewsSection />` ca să rupi seria (în CF stă pe
> poziția 7, între Use cases `alb` și Cum funcționează `dark`). **Niciodată** Reviews `neutral-50`
> lipit direct de FAQ `neutral-50`.

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
