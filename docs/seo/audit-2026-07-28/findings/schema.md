# Audit Schema.org / Structured Data — eghiseul.ro (28.07.2026)

Verificat LIVE (render_page.py --mode never, raw HTML — nu SPA, toate randate server-side):
homepage, `/servicii/cazier-auto-online/`, `/servicii/eliberare-certificat-de-nastere/`,
`/servicii/extras-de-carte-funciara/`, `/ancpi-nu-functioneaza/`, `/calculator/varsta-pensionare/`.
Cod sursă: `src/lib/seo/schema.ts`, `homepage-schema.ts`, `src/components/services/service-faq.tsx`,
`src/components/calculators/calculator-layout.tsx`, `src/components/articole/article-layout.tsx`.

## 1. Detectare per pagină (toate JSON-LD, `@context: https://schema.org` — corect)

| Pagină | Blocuri | Tipuri |
|---|---|---|
| `/` | 1 | Organization, WebSite, WebPage, ItemList, FAQPage |
| `/servicii/cazier-auto-online/` | 2 | Organization, WebSite, BreadcrumbList, Service, Product+AggregateOffer+AggregateRating+MerchantReturnPolicy+OfferShippingDetails+Brand, Person, WebPage · + FAQPage |
| `/servicii/eliberare-certificat-de-nastere/` | 2 | idem (Product/AggregateRating identic ca structură) |
| `/servicii/extras-de-carte-funciara/` | 2 | idem |
| `/ancpi-nu-functioneaza/` | 2 | Organization, WebSite, BreadcrumbList, Article, WebPage · + FAQPage |
| `/calculator/varsta-pensionare/` | 2 | Organization, WebSite, BreadcrumbList, WebApplication (+Offer preț 0, isAccessibleForFree, dateModified), WebPage · + FAQPage |

Toate blocurile: `valid: true` (parsează corect ca JSON), fără trunchiere. Microdata/RDFa: niciuna găsită (site-ul folosește exclusiv JSON-LD, conform convenției din cod).

## 2. Validare

- **Tipuri retrase de Google 2025** (Vehicle Listing, Claim Review, Estimated Salary, Learning Video, Special Announcement, Course Info): **niciuna prezentă** — grep pe tot `src/` confirmă zero utilizări reale. Curat.
- **HowTo**: neutilizat (comentariu explicit în `schema.ts` care îl exclude). Corect.
- **AggregateRating pe Organization**: absent intenționat (comentat în cod ca „self-serving" — decizie corectă, evită flag GSC din 13.07.2026).
- **Offer**: prețuri corecte, curente (ex. cazier auto 198 RON / 350 RON permis străinătate — reflectă prețul afișat pe pagină), `priceCurrency: RON`, URL absolut. OK.
- **Product node cu AggregateRating** — risc Critical: valorile `ratingValue: 4.9, reviewCount: 450` sunt **identice, hardcodate în cod sursă**, pe minimum 27 de pagini de servicii diferite (grep confirmă în `src/app/servicii/*/page.tsx`: copie-intabulare, extras-cf-colectiv, certificat-integritate, cazier-auto-online, cazier-judiciar-online + pf/pj, cazier-fiscal-online, extras-de-carte-funciara, eliberare-certificat-de-nastere/-casatorie/-celibat, identificare-imobil(e), certificat-constatator-online etc.). `rovinieta-online` are 4.8/89, template dinamic `[slug]/page.tsx` are 4.8/64 hardcodat ca default. Nu există (neverificat, dar nicio urmă în cod) un sistem real de colectare recenzii care să alimenteze aceste cifre — sunt literale în TSX, nu citite dintr-un tabel `reviews`. **Risc real de acțiune manuală Google pentru „structured markup spam" / rating neverificabil** — politica cere ratinguri provenite din recenzii reale ale utilizatorilor, nu cifre generice repetate identic pe zeci de pagini fără sursă.
- **FAQPage**: prezent pe homepage, toate paginile de servicii verificate, articol, calculator (component comun `ServiceFAQ` + `buildHomepageGraph`). Per politica actuală: **fără beneficiu SERP din 07.05.2026** (retras pentru toate site-urile) — nu e „greșit" tehnic, dar e prioritate Info, nu Critical, iar comentariul din `schema.ts` linia 12-14 care spune „FAQPage NOT included" e **stale/înșelător** — de fapt e inclus peste tot prin `service-faq.tsx`. Recomand corectarea comentariului ca să nu inducă în eroare viitoare dezvoltare.
- **WebApplication pe calculator**: tip valid, cu `offers.price=0`, `isAccessibleForFree`, `dateModified` — implementare corectă, deja acoperă rolul unui „SoftwareApplication".
- **Article**: are `datePublished`/`dateModified`, `author` (fallback Organization), `publisher`, `image` absolut — structură completă.

## 3. Oportunități ratate

- **Review individuale** (schema `Review`) lipsă sub `AggregateRating` — Google preferă și verifică mai des ratinguri susținute de recenzii individuale reale, nu doar agregat; ar reduce riscul de la punctul de mai sus dacă recenziile ar fi reale.
- **HowTo** pentru ghiduri (ex. articole „cum obții X"): NU recomand — retras de Google din sept. 2023, fără rich result.
- **SoftwareApplication/Product pe celelalte ~40 calculatoare**: nu au fost verificate individual (neverificat) — dacă toate folosesc `CalculatorLayout`, probabil au deja WebApplication; de confirmat că fiecare calculator chiar trece `faqs`/`tldr` corect.
- Nicio oportunitate clară de **LocalBusiness** — decizie corectă documentată deja (`location-seo-scope`): serviciile nu sunt legate de un sediu fizic vizitabil.

## 4. Neverificat (nu am colectat mai departe, conform instrucțiunii)

- Restul celor ~223 URL din sitemap (am verificat 5 pagini + homepage).
- Existența unui sistem real de recenzii (Trustpilot/Google Business) care ar justifica AggregateRating.
- Rich Results Test / Search Console → Enhancements (avertismente/acțiuni manuale active pe AggregateRating).
- VideoObject / Broadcast / Clip — nu am identificat conținut video pe paginile verificate.
- Celelalte ~40 calculatoare (verificat doar `varsta-pensionare`).

---

## Rezumat (max 15 rânduri)

JSON-LD e bine structurat tehnic (Organization/WebSite/BreadcrumbList/Service/Product/WebApplication/Article/FAQPage, `@context` https, URL-uri absolute, prețuri corecte) și **fără niciun tip retras de Google în 2025** (verificat prin grep pe tot `src/`) — curat pe acest punct critic.

**Risc Critical real**: `AggregateRating` de pe Product (paginile de servicii) e **hardcodat identic (4.9/450 review-uri) pe minimum 27 de pagini** diferite, plus alte valori fixe pe rovinieta și template-ul dinamic — nicio urmă de sursă reală de recenzii în cod. Asta e exact profilul de „structured markup spam" pe care Google îl sancționează cu acțiune manuală pe rich results. Recomandare: fie conectați un sistem real de recenzii (Google Business/Trustpilot) cu cifre diferite per serviciu, fie scoateți `AggregateRating`/`Product` până există date reale.

FAQPage e prezent peste tot (homepage, servicii, articol, calculator) dar **fără beneficiu SERP din 07.05.2026** — prioritate Info, nu urgent de scos; comentariul din `src/lib/seo/schema.ts:12-14` care spune „FAQPage NOT included" e stale și induce în eroare, merită corectat.

Oportunitate reală: `Review` individuale sub AggregateRating ar reduce riscul de mai sus dacă recenziile sunt reale. Nu recomand HowTo (retras). Neverificat: restul de ~215 URL din sitemap, celelalte ~40 calculatoare, Rich Results Test/GSC Enhancements pentru acțiuni manuale existente.

---

## Decizie proprietar — 28.07.2026

**`aggregateRating` rămâne așa cum este. NU se scoate.**

⚠️ Corectură la finding-ul de mai sus: agentul l-a marcat drept „hardcodat fără sursă reală",
sugerând risc de structured-data spam. **Fals.** Raul a confirmat că cifrele (4.9 / 450) provin
din **recenziile reale de pe Google Business Profile** — sunt doar copiate manual în cod, ca
instantaneu, nu generate.

Ce rămâne valabil ca observație (Low, nu Critical): cifra e **statică**, deci se depărtează de
realitate pe măsură ce se adună recenzii noi, iar aceeași valoare apare pe 28 de pagini de
servicii diferite.

**Plan agreat:** când numărul real de recenzii crește semnificativ, se actualizează valoarea în cod
(un singur loc de schimbat per pagină). Nu se scoate marcajul, nu se „repară" preventiv.
Se redeschide discuția DOAR dacă apare o acțiune manuală în Search Console pe „structured data".
