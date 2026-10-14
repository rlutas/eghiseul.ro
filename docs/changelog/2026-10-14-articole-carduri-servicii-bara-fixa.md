# 14.10.2026 — Articole și calculatoare: servicii cu preț și document, bară fixă pe telefon
<!-- categorie: seo -->

## Pentru echipă

- La finalul fiecărui articol și calculator, serviciile apar acum ca produse: poza documentului (întreagă), prețul, termenul și butonul „Comandă”, pe o bandă bleumarin, separată de întrebările frecvente.
- Pe telefon, după ce omul citește cam o treime din pagină, apare jos o bară mică cu documentul, prețul și „Comandă”. Se închide din „×” și nu mai apare o zi. Butonul de WhatsApp urcă deasupra ei.
- Pe calculator (ecran mare), articolele au în dreapta un card fix cu documentul principal al articolului.
- Prețurile vin din setările serviciilor: dacă schimbați un preț în admin, se schimbă și în articole.
- Pe calculatoare, „Calculatoare înrudite” stă acum deasupra documentelor, cu iconițe, iar caseta generică „Ai nevoie de un document? / Vezi serviciile / Sună-ne” de la final a fost scoasă.
- Fiecare click pe aceste butoane se vede în Google Analytics (evenimentul `article_service_click`), ca să știm ce articol aduce comenzi.

---

## Tehnic

- `src/lib/articles/service-cards.ts`: `getServiceCards(relatedServices)` citește `services` (base_price cu TVA, `formatEstimatedDays`) și specimenul (`SERVICE_SPECIMENS` + multilingv); serviciile inactive sau cu preț 0 (rovinietă) rămân linkuri simple („Citește și”).
- `src/components/articole/article-service-cards.tsx`: `ArticleServiceCards` (bandă, `#servicii-legate`), `ArticleRailCard` (sticky `top-28`, xl+), `ArticleInlineCta` (casetă în text), `DocumentThumb` (cadru A4 `aspect-[1/1.414]` + `object-contain`, deci documentul întreg).
- `src/components/articole/article-sticky-bar.tsx`: bară sub xl pe articole, pe toate lățimile pe calculatoare (`allWidths`); apare după 30% din pagină, dispare când banda de jos intră în ecran; închidere 24 h în `localStorage`; setează `html[data-sticky-bar]`, iar `WhatsAppFloat` urcă la `bottom-[92px]`.
- `TrackedLink`: `<Link>` real (crawlabil) + `gtag('event','article_service_click',{placement,service,page_path})` doar dacă gtag există (după consimțământ).
- `ArticleLayout` și `CalculatorLayout` devin `async`; FAQ pe articole pe o coloană (`twoColumns={false}`); `CalculatorLayout.SVC` primește `slug` (DB) lângă `href`.
- `CalculatorLayout`: „Calculatoare înrudite” mutat deasupra benzii de produse, carduri cu iconița din `CALCULATORS_NAV` (`CALC_ICONS` pe href); secțiunea CTA generică de la final scoasă.
- Caseta în text pusă pe `/cadastru-sistematic/` (extras CF pe numărul nou).
- Deschis: pe calculatoare, popup-ul de newsletter (`NewsletterPopup`) acoperă jumătate de ecran pe telefon și se suprapune cu bara.
