# 02.11.2026 — Homepage: termene din setări, hub de servicii, fără schema Product
<!-- categorie: seo -->

## Pentru echipă

- Pe prima pagină și în fișierul citit de asistenții AI (ChatGPT, Perplexity) nu mai scrie „24-48 de ore” sau „instant pe email”. Termenul și prețul vin acum din Setări › Servicii, adică exact ce scrie pe pagina fiecărui serviciu.
- Dacă schimbi un termen sau un preț în admin, prima pagină se actualizează singură în cel mult o oră. Nu mai e nimic de corectat de mână acolo.
- Titlul și titlul mare de pe prima pagină nu mai încep cu „Cazier judiciar”: prima pagină prezintă firma, iar pentru cazier Google trebuie să trimită clienții pe pagina cazierului.
- Sub primul ecran e o listă nouă, „Ce documente obținem pentru tine”, cu legătură spre fiecare serviciu principal, instituția care îl eliberează, prețul și termenul.
- Dacă un client citează „24-48 de ore” sau „instant” de pe site, e un text vechi din cache-ul Google; termenul corect e cel de pe pagina serviciului.

---

Audit SEO 02.11.2026 (`docs/seo/2026-11-02-audit-4-site-uri/`), eghiseul: punctele 5, 7 și 12 din planul unic (H1, C1, M1 din `02-eghiseul.md`).

**Sursă unică pentru termen și preț (H1).**
- `src/lib/services/public-facts.ts` (nou): `getPublicServiceFacts(slugs)` citește `services` cu clientul anonim (fără cookies/`headers()`, paginile rămân statice) și întoarce `term = formatEstimatedDays()` (același text ca paginile `/servicii/*`), `urgentTerm = formatUrgentDays()`, `priceWithVat = base_price`. Serviciu lipsă/inactiv/preț 0 → cheie absentă → textul omite termenul, nu ghicește.
- `src/app/(eghiseul)/page.tsx`: `async`, `revalidate = 3600`, trimite faptele la FAQ, carduri și blocul nou. Build: `/` rămâne `○` (static, ISR 1h).
- `faq-data.tsx`: `HOMEPAGE_FAQ_ITEMS`/`HOMEPAGE_FAQS` → `buildHomepageFaqItems(facts)` + `toFaqSchemaPairs()`; răspunsul vizibil și textul FAQPage folosesc aceleași termene. Scos „24-48 de ore” (cazier), „instant pe email” (CF, constatator, rovinietă), „100% legale și oficiale”, „informații oficiale”.
- `featured-services.tsx`: fiecare card are „Termen: …” din DB; scoase „Termen 3-5 zile” hardcodat, „instant”, „duplicat oficial”, „Date oficiale firmă”. `how-it-works-section.tsx`, `why-us-section.tsx`: fără 24-48h/instant, fără „documente oficiale”.
- `src/app/layout.tsx`: meta description, og și twitter fără „24-48 ore”.
- `public/llms.txt` → `src/app/llms.txt/route.ts` (ISR 1h), prețuri/termene din `getPublicServiceFacts`. Corectat: CF „AUTOMAT în câteva minute, 89 RON + TVA” (DB: 2 zile lucrătoare, 89 cu TVA), identificare imobil „198 + TVA” (DB 298 cu TVA), cazier „PDF semnat electronic” → scan pe email + original prin curier, rovinieta marcată ca afiliere erovinieta.net. documentero are în continuare propriul `/llms.txt` (rewrite pe host).

Valori la livrare (DB): cazier judiciar/auto/integritate 3-5 zile lucrătoare (urgent 1-2), fiscal 1-3, extras CF 2 zile lucrătoare, constatator „câteva minute (24/7)” (config-ul chiar spune asta, deci rămâne), stare civilă 15-30.

**Homepage = hub de brand (C1).**
- Title: „eGhișeul.ro — Documente Online: Cazier, Carte Funciară” → „eGhișeul.ro — Servicii de obținere a documentelor, fără ghișeu”. H1: „Cazier Judiciar și Documente Online – Prin Avocat, Fără Cozi, Livrare prin Curier” → „eGhișeul.ro: servicii de obținere a documentelor – noi depunem cererea, tu primești actul”. `WebPage.name` din `homepage-schema.ts` aliniat.
- `src/components/home/service-links-section.tsx` (nou), imediat sub hero: 10 `<a href>` simple cu ancoră exactă (cazier judiciar online, certificat de integritate comportamentală, cazier auto online, cazier fiscal online, extras de carte funciară, certificat constatator online, certificat de naștere, certificat de căsătorie, certificat de celibat, extras multilingv de naștere) + instituția emitentă + preț/termen din DB. Rovinieta lipsește intenționat (afiliere).
- Pagina de cazier judiciar (rescrisă 06.10, îngheț 4 săptămâni) nu e atinsă.

**Schema (M1, eghiseul).** `productNode`, `PRODUCT_BRAND`, `MERCHANT_RETURN_POLICY`, `OFFER_SHIPPING_DETAILS` scoase din `src/lib/seo/schema.ts`; `buildServicePageGraph` emite Org + WebSite + BreadcrumbList + Service (cu `Offer`, preț + RON) [+ WebPage/Person]. `Product`-ul inline din `servicii/[slug]/page.tsx` scos și el. Motiv: `shippingRate: 0 RON` era fals (livrarea se plătește). Fără `aggregateRating`/`Review`. Verificat local: 0 `"@type":"Product"`, 0 `shippingRate` pe `/`, cazier, CF, copie-releveu, actualizare-adresa-cf. Nu e atins `documentero-schema.ts`, care are încă `Product` cu shipping 0.

Teste: `tests/unit/lib/services/public-facts.test.ts` (nou: termen din `processing_config`, fără „24-48”/„instant”/„oficial” în FAQ, termen omis când lipsește DB-ul), `tests/unit/lib/seo/schema.test.ts` (graf de 4 noduri, fără `shippingRate`).

De urmărit (indicatori din audit): `query,page` pe „cazier judiciar online” după 4 săptămâni (azi `/` 474 impresii vs serviciu 20); Rich Results fără Merchant listings.

- **documentero** (urmare): `documenteroServiceGraph` (`src/lib/seo/documentero-schema.ts`) nu mai emite `Product` cu `shippingRate 0`; prețul stă ca `AggregateOffer` pe nodul `Service`.
