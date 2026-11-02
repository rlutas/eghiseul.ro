# Audit SEO eghiseul.ro, 02.11.2026

**Metodă.** Am folosit date reale din GSC: Search Analytics pe `date`, `page`, `query`, `query,page` și `date,query`, plus URL Inspection pe 35 de URL-uri și Sitemaps API. Am rulat PageSpeed (mobil) și CrUX (origine + istoric pe 25 de săptămâni). Am luat cu curl toate cele 114 URL-uri din sitemap, ca mini-crawl pentru status, inlinkuri și număr de cuvinte în `<main>`. Jaccard-ul l-am calculat pe 5-shingle-uri, pe paginile de serviciu. Codul l-am citit doar ca să găsesc cauzele: **nu am editat nimic și nu am făcut commit.**

Notația: **[V]** = verificat, **[I]** = dedus.

---

## SEO Health Score: **72 / 100**

| Categorie | Pondere | Scor | Pe scurt |
|---|---|---|---|
| Technical SEO | 22% | 85 | Toate cele 114 URL-uri din sitemap dau 200 și sunt „Submitted and indexed”. Canonicalele se potrivesc. www→apex merge cu 308, TLS reparat. Robots e OK. HTML-ul e greu: 520–780 KB pe pagină. |
| Content Quality | 23% | 55 | Paginile comerciale sunt încă suprimate. Homepage-ul are cifre care contrazic paginile de serviciu. Loturile 3 și 4 sunt neterminate. Pe 40 de pagini scrie „Verificat de Echipa”. |
| On-Page SEO | 20% | 65 | Google pune **homepage-ul**, nu pagina de serviciu, pe query-urile comerciale de cazier. Titlurile sunt OK. |
| Schema | 10% | 75 | Organization + Person (autor real) + Service sunt corecte. `Product` are un shipping de 0 RON contrazis de pagină. FAQPage e doar Info. |
| Performance (CWV) | 10% | 95 | CrUX p75 la nivel de origine: LCP 1,34 s, **INP 125 ms**, CLS 0, TTFB 403 ms. Lighthouse dă 97 pe mobil. Trendul pe 25 de săptămâni e în degradare: TTFB 216→428 ms, LCP 1,04→1,40 s. |
| AI Search Readiness | 10% | 70 | Crawlerele AI sunt permise, `llms.txt` există. Dar `llms.txt` contrazice paginile la termen și preț. |
| Images | 5% | 75 [I] | Nu am auditat imaginile în profunzime. |

> Scorul măsoară sănătatea site-ului, nu vizibilitatea. Tehnic, site-ul e curat. Problema e de **încredere și relevanță pe clusterul comercial**, iar un scor de 72 o ascunde.

---

## Trendul în GSC [V]

### Pe săptămâni, tot site-ul

| Săptămâna | Clicuri | Impresii | Poziție |
|---|---|---|---|
| 03.08 | 24.183 | 846.573 | 6,1 |
| 10.08 | 22.516 | 814.334 | 6,3 |
| 17.08 (update-ul începe pe 20.08) | 14.833 | 458.155 | 6,2 |
| 24.08 | 4.223 | **27.363** | 5,6 |
| 07.09 | 5.228 | 31.651 | 4,3 |
| 21.09 (Sept spam update începe pe 24.09) | 4.310 | 33.658 | 5,5 |
| 05.10 | 4.247 | 31.403 | 5,4 |
| 12.10 | 3.907 | 33.376 | 7,4 |
| 19.10 | 2.652 | 20.614 | 7,0 |
| 26.10 (6 zile) | 2.114 | 16.262 | 5,2 |

Impresiile au scăzut cu **96%** pe 20.08 și n-au revenit deloc. A mai urmat o treaptă de **−40% pe 16–17.10**: impresiile în zilele lucrătoare au coborât de la ~5.600 la ~3.100.

### Pe clustere (impresii pe săptămână)

| Cluster | Săpt. 10.08 | Săpt. 07.09 | Săpt. 26.10 | Poziție acum |
|---|---|---|---|---|
| `/servicii/` | 42.181 | 1.154 | **534** (și scade) | 8,5 |
| calculatoare și tools | 369.135 | 25.174 | 13.353 | 4,3 |
| articole | 409.446 | 5.276 | 1.980 | 4,4 |
| homepage | 11.501 | 1.458 | 578 | **24,7** |

**Clusterul `/servicii/` nu dă niciun semn de recuperare** (regula 8: aici ar trebui să apară primul semnal). Scade în continuare.

### Pe topicuri: 03–16.08 față de 19.10–01.11 (clicuri / impresii / poziție)

| Topic | 03–16.08 | 19.10–01.11 |
|---|---|---|
| cazier | 771 / 29.877 / 7,0 | **16 / 1.043 / 27,7** |
| carte funciară / extras CF | 639 / 22.859 / 7,8 | 14 / 370 / 7,6 |
| constatator | 58 / 8.498 / 6,4 | 0 / 58 / 38,6 |
| stare civilă | 216 / 2.833 / 5,7 | 76 / 458 / **4,5**, se ține |
| brand „eghiseu*” | 183 / 1.290 | 73 / 419 |

Tiparul e clar. **Query-urile comerciale** sunt pe pozițiile 25–90: „cazier judiciar online” 28,5, „cazier fiscal online” 66,8, „certificat constatator” 36,2, „extras de carte funciara” 64. **Query-urile informaționale** stau pe 1–3: „valabilitate extras CF” 1,6, „duplicat certificat de nastere online” 1,5 cu 29 de clicuri, „schimbare certificat nastere vechi” 2,6.

### Pierderi mari, 01–14.09 față de 19.10–01.11

**Pagini:**

| Pagină | Clicuri | Impresii | Poziție |
|---|---|---|---|
| `/calculator/varsta-pensionare/` | 3.258→227 | 11.993→1.803 | 2,4→3,1 |
| `/calculator/calculator-impozit-auto/` | 1.885→1.178 | | |
| `/calculator/pensie-alimentara/` | 1.209→737 | | |
| `/calculator/calculator-indemnizatie-crestere-copil/` | 1.344→874 | | |
| `/tabel-varsta-pensionare-anticipata-femei/` | 335→60 | | |
| `/` | 192→82 | | 20,2→23,5 |

Dintre paginile de serviciu, singura cu volum e `/servicii/cazier-judiciar-online/`, rescrisă pe 06.10. Acolo impresiile au scăzut 279→99 și poziția a coborât **3,3→11,1**.

**Query-uri:**
- „calcul varsta pensionare legea noua”: 1.258→11 clicuri, 3.443→57 impresii, la poziție constantă (1,8→1,6).
- „calculator varsta pensionare”: 283→0.
- „calculator impozit auto 2026”: 531→262.
- „eghiseul.ro”: 138→54.

**Diagnosticul treptei din octombrie [V+I]:**
- Pe query-urile prezente în ambele ferestre (06–15.10 față de 20–29.10), **poziția e stabilă** și impresiile scad. Exemplu: „calcul pensie 2026” 298→9 la poziția 1. Asta arată o **cerere de știri care s-a stins** (legea pensiilor), nu o demotare.
- În plus, **1.069 de query-uri long-tail au dispărut**, cu 4.009 impresii. Asta e eroziune.
- Coincidența de calendar e notată la H3.

---

## CRITICAL

### C1. Pe query-urile comerciale, Google rankează homepage-ul, nu pagina de serviciu, și pe poziții 25–60
- **Observație [V]:** pe 05.10–01.11 (query,page):
  - cazier judiciar comercial: **`/` are 474 de impresii la poziția 26,2**, iar `/servicii/cazier-judiciar-online/` are doar 20 la 14,2;
  - „cazier fiscal”: `/` are 181 de impresii la poziția **62,3**, iar `/servicii/cazier-fiscal-online/` 13 la 32,9;
  - cazier auto: `/` 156 la 27,9, iar pagina de serviciu 106 la 4,2. Aici pagina de serviciu câștigă.
  - Homepage-ul se bate direct pe „cazier”: H1-ul e „Cazier Judiciar și Documente Online – Prin Avocat…”, iar title-ul „…Documente Online: Cazier, Carte Funciară”. E pagina din lotul 3 încă neatinsă (`11-jurnal-executie.md` #21).
- **Fix:**
  - `src/app/(eghiseul)/page.tsx` + `src/components/home/*`: homepage devine **hub de brand**. H1-ul și title-ul nu mai țintesc „cazier judiciar”. Fiecare serviciu primește un link contextual, cu ancoră exactă, spre pagina lui.
  - Lotul 4 pe `/servicii/cazier-fiscal-online/`, `/servicii/certificat-constatator-online/`, `/servicii/extras-de-carte-funciara/`, ca la cazierul judiciar din 06.10: surse primare, „pe scurt”, date proprii.
  - Ritmul: maximum 1–2 pe săptămână (regula 2).
- **Cum știm că a eșuat:** după 4 săptămâni, `query,page` arată tot `/` ca URL principal pe „cazier judiciar online” / „cazier fiscal”.
- **Indicator:** raportul impresii pagină-de-serviciu / impresii homepage pe query-urile „cazier*”. Azi e 20/474.

### C2. Clusterul `/servicii/` continuă să scadă, la 10 săptămâni după curățenie
- **Observație [V]:** impresiile pe săptămână au mers 1.154 (07.09) → 842 (05.10) → 534 (26.10). Toate cele 32 de pagini sunt indexate. Câteva n-au mai fost crawlate de luni de zile: `copie-releveu` 29.07, `copie-inventar-coordonate` 01.08, `copie-arhiva-ocpi` 03.08, `copie-plan-cadastral` 05.08, `certificat-detineri-imobile` 28.07. Asta e o prioritate de crawl foarte scăzută. Similaritatea între paginile de serviciu e OK: maximum 0,31 (naștere↔căsătorie), adică sub prag. Deci nu mai e o problemă de șablon.
- **Inferență [I]:** suprimarea pare **la nivel de cluster sau de site pe intenția comercială**, nu pe pagini individuale. Informaționalele rankează pe 1–3 pe aceleași topicuri. Recuperarea depinde de un update viitor (core sau spam) care să reevalueze site-ul. Între timp, singura pârghie e calitatea paginilor comerciale (C1, H1, H2).
- **Fix:** nu schimbați URL-uri și nu adăugați pagini noi de serviciu. Continuați lotul 4 în ordinea pierderilor: cazier fiscal → constatator → extras CF → cazier auto. Paginile `copie-*` primesc linkuri din articolele relevante, nu doar din `extras-plan-cadastral`.
- **Cum știm că a eșuat:** impresiile pe `/servicii/` scad sub 400 pe săptămână timp de 3 săptămâni la rând.
- **Indicator:** impresiile săptămânale pe `/servicii/`, cu baseline 534.

---

## HIGH

### H1. Homepage-ul și `llms.txt` contrazic paginile de serviciu la termen și preț (regula 3)
- **Observație [V]:**
  - FAQ-ul de pe homepage (`src/components/home/faq-data.tsx`) spune „Cazierul judiciar online se obține **în 24-48 de ore**”. Pagina de serviciu și title-ul spun **3–5 zile**.
  - Meta description pe homepage: „Livrare … în 24-48 ore”.
  - `featured-services.tsx` / `how-it-works-section.tsx` spun că extrasul CF e „instant pe email”. Pagina de serviciu spune „de regulă în 24 de ore, max. 2 zile lucrătoare”, după fix-ul din 13.10.
  - `public/llms.txt` spune „eliberare AUTOMATĂ în câteva minute, **89 RON + TVA**”. Pagina spune 73,55 + TVA = **89 cu TVA**.
- **Fix:** o singură sursă pentru termen și preț în homepage și `llms.txt`: DB `services` / `formatEstimatedDays`, cum fac deja cardurile din articole. Scoateți „24-48 ore” de la cazier și „instant” de la CF.
- **Cum știm că a eșuat:** un `grep` după „24-48” sau „instant” în HTML-ul homepage-ului încă găsește termene la cazier sau la CF.
- **Indicator:** citările AI (ChatGPT/Perplexity) pe „eghiseul extras carte funciara”. Verificate manual, trebuie să redea termenul corect.

### H2. Pagina de cazier judiciar rescrisă pe 06.10 a pierdut poziție
- **Observație [V]:** `/servicii/cazier-judiciar-online/`: 279→99 impresii, poziția **3,3→11,1** (01–14.09 față de 19.10–01.11). Pe query-uri comerciale, 20 de impresii la poziția 14,2. Pagina are 4.089 de cuvinte în `<main>`, 13 FAQ-uri și 663 KB de HTML.
- **Inferență [I]:** nu pot separa efectul rescrierii de efectul September spam update (24.09–08.10). Nu revert-ați: conținutul nou e corect factual (scan, nu PDF eIDAS, taxa etc.).
- **Fix:** fără schimbări de structură 4 săptămâni, ca semnalul să se citească. Singura excepție e C1 (homepage), care îi ia canibalizarea.
- **Cum știm că a eșuat:** poziția pe pagină rămâne peste 10 la 4 săptămâni după fix-ul pe homepage.
- **Indicator:** poziția și impresiile paginii pe query-urile care conțin „cazier judiciar”.

### H3. Treapta de −40% pe articole și calculatoare din 16–17.10 vine la 2 zile după cardurile de vânzare din 14.10
- **Observație [V]:** pe 14.10 (`70079c4a`) au intrat carduri de produs cu preț, un rail sticky pe desktop și o bară fixă pe mobil (după 30% din pagină), pe **toate articolele și calculatoarele**. Pe 16–17.10, impresiile pe articole au scăzut ~50% și pe tools ~30%. `/servicii/` și homepage-ul, care nu au primit cardurile, nu au avut treaptă.
- **Inferență [I], încredere scăzută:** cea mai mare parte se explică prin cerere: poziția e stabilă pe query-urile comune, iar știrile despre pensii s-au stins. Și CJO, un alt repo fără schimbarea asta, a scăzut în aceeași perioadă. Corelația nu e dovadă. Dar o bară fixă de vânzare peste conținut informațional e exact tipul de semnal „page experience / intent dilution” care merită testat.
- **Fix (test, nu revert):** scoateți bara fixă de pe mobil doar pe 5 calculatoare cu cerere stabilă (`pensie-alimentara`, `dividende`, `calculator-indemnizatie-crestere-copil`, `concediu-medical`, `pensie-invaliditate`) timp de 3 săptămâni. Cardurile de la final rămân.
- **Cum știm că a eșuat (ipoteza):** impresiile la poziție egală nu diferă între grupul de test și restul calculatoarelor.
- **Indicator:** impresiile pe query-urile stabile ale acestor 5 pagini, comparate cu grupul de control.

### H4. Linkuri interne slabe spre articole (regula 5)
- **Observație [V]** din mini-crawl-ul pe 114 URL-uri:
  - mediana inlinkurilor din `<main>` e 7;
  - articole cu **2–3 inlinkuri contextuale**: `/verificare-proprietar-imobil/` (care încă aduce 67 de clicuri), `/tabel-varsta-pensionare-anticipata-femei/`, `/taxa-cazier-judiciar/`, `/valabilitate-extras-de-carte-funciara/`, `/informatii-cazier-auto-online/`, `/ghid-complet-certificat-de-integritate-comportamentala/`;
  - `/despre-noi/` nu are niciun referring URL în URL Inspection.
- **Fix:** 3–5 linkuri contextuale noi spre fiecare articol, din paginile de serviciu și din calculatoarele din același topic. Exemple: cazier auto → `/informatii-cazier-auto-online/`; extras CF → `/valabilitate-extras-de-carte-funciara/`.
- **Cum știm că a eșuat:** după următorul crawl Screaming Frog (cu Crawl Analysis), aceste pagini au tot sub 5 inlinkuri.
- **Indicator:** câte query-uri distincte are pe săptămână fiecare articol.

---

## MEDIUM

**M1. Schema `Product` pe servicii, cu `shippingRate: 0 RON` [V].**
- Sursa e `src/lib/seo/schema.ts:160`.
- Pe cazierul judiciar, pagina spune că livrarea în țară „se calculează la comandă, după adresă” și că Poșta Română costă 100 lei și DHL 250 lei. Schema declară deci un shipping gratuit care nu e adevărat pentru original.
- Fix: scoateți `shippingDetails`, sau restrângeți `Product` la serviciile doar digitale (CF, constatator). Alternativ, păstrați doar `Service` + `Offer`.
- Cum știm că a eșuat: Rich Results Test încă arată `shippingRate 0` pe cazier.

**M2. „documente oficiale” / „100% legale și oficiale” [V].**
- Apare în `faq-data.tsx:51-64` și `featured-services.tsx` („duplicat oficial”).
- Regula internă, din politica Google Ads, e să nu împerechem „oficial” cu „documente/acte”.
- Fix: reformulați: „eliberate de instituția competentă”.
- Cum știm că a eșuat: un `grep -i "oficial"` pe homepage încă găsește perechea.

**M3. Byline „Verificat de Echipa eGhișeul.ro” pe 40 de pagini [V].**
- Sursa e `calculator-layout.tsx:319`.
- Schema numește corect un `Person` real (Raul Luțaș), dar byline-ul vizibil nu o face (regula 3).
- Fix: „Verificat de Raul Luțaș”, cu link spre `/despre-noi/raul-lutas/`.

**M4. `/despre-noi/` are 507 cuvinte, nu are inlinkuri contextuale și a fost crawlat ultima dată pe 10.09 [V].**
- E pagina de încredere a site-ului.
- Fix: extindeți-o pe outline-ul din `research/04-…` (firma, avocatul, topograful, volum real de comenzi) și legați-o din paginile de serviciu.

**M5. TTFB și LCP în degradare pe 25 de săptămâni [V].**
- TTFB 216→428 ms, LCP 1.043→1.395 ms. Încă GOOD.
- HTML-ul are 520–780 KB pe paginile de serviciu, cu RSC payload.
- Fix: urmăriți. Dacă TTFB p75 trece de 600 ms, investigați ISR și cache-ul pe `/servicii/*`.

---

## LOW

- **L1.** URL Inspection arată referring URLs vechi de WP: `/page-sitemap.xml`, `/servicii-sitemap.xml`, `/categorii_servicii/...`, `/politica-de-confidentialitate-webserv-solutions-srl/`. Toate dau **404 [V]**. Sunt inofensive, dar dacă au backlinkuri: 301 spre `/sitemap.xml` și `/politica-de-confidentialitate/` (regula 6).
- **L2.** Query-urile „constatator” aterizează pe `/schimbare-certificat-de-nastere-vechi/`, la poziția 71 [V]. Relevanță greșită: verificați ancorele interne cu „constatator” de pe pagina aceea.
- **L3.** `llms.txt` listează rovinieta ca serviciu. Ea e afiliere (erovinieta.net). Marcați-o ca atare.
- **L4.** 64 de pagini au `dateModified: 2026-06-22` (ziua lotului) [V]. E data reală a lotului, nu umplutură. Atenție doar la actualizarea ei când se schimbă conținutul.

## INFO

- **FAQPage** e prezent pe homepage și pe toate paginile de serviciu și calculatoarele. Rich result-ul a fost retras în mai 2026. Nu aduce nimic, dar nici nu strică.
- **Ce am verificat ca live pe CJO** (`cazierjudiciaronline.com`) [V]:
  - pe homepage, cazier auto, Iași, Brașov și Timișoara: zero `Review`, zero `aggregateRating`, zero „Maria Popescu”, zero ONLINE10;
  - prețurile 198/278/298 sunt prezente;
  - paginile de oraș au title „program ghișee, adrese, online”, „Pe scurt” și `GovernmentOffice` (10–18 noduri pe pagină).
  - Observație: title-ul homepage-ului CJO e încă „…fără Cont pe HUB MAI · 198 lei” (M2 din analiza competiției, nelivrat).
- **Ce n-am verificat:** ecazier și documentero (în afara scope-ului), SERP live și AI Overview pe query-urile eghiseul, backlinkurile.
