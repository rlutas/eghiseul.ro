# Audit SEO: cazierjudiciaronline.com (02.11.2026)

**Metodă.** Am folosit date GSC prin API (`sc-domain:cazierjudiciaronline.com`), URL Inspection pe 10 URL-uri, PSI și CrUX (origin, PHONE). Am descărcat cu curl toate cele 71 de URL-uri din sitemap și am verificat cele 91 de linkuri interne unice. Jaccard-ul e calculat pe shingle-uri de 5 cuvinte din `<main>`, o dată normal și o dată cu orașele și județele mascate. Codul l-am doar citit: n-am modificat nimic și n-am făcut niciun commit.
**[V]** = verificat · **[I]** = dedus.

> ⚠️ **Limita datelor [V]:** proprietatea de domeniu are date abia de la **20.09.2026**. Pentru 01.08–19.09 API-ul întoarce 0 rânduri. Cifra de „~4.400 clicuri/săpt. la început de septembrie" **nu se poate verifica de aici**, iar comparațiile de mai jos pornesc de la săptămâna 21.09.

---

## 1. SEO Health Score: **72 / 100**

| Categorie | Pondere | Scor | Motivul |
|---|---|---|---|
| Technical SEO | 22% | 85 | Indexare OK, canonical-urile se potrivesc, robots e corect. Dar `lastmod` e înghețat (10.06), există 1 link intern 404 și 6 pagini au în index versiunea veche, cu Review |
| Content Quality | 23% | 62 | Cele 3 orașe refăcute sunt bune (Jaccard 0,17 mascat). Celelalte 36 sunt din șablonul vechi (0,42–0,46). `/cazier-auto-online` e slabă. llms.txt are fapte false |
| On-Page SEO | 20% | 65 | Titlurile de oraș vechi sunt tranzacționale. Titlul de acasă duce încă unghiul HUB, iar H1-ul promite „1-2 Zile". Titlul de la auto are 92 de caractere și nu are diacritice |
| Schema | 10% | 60 | `Product`/`Merchant listing` pe un serviciu, `HowTo` și `LocalBusiness` pe acasă. GovernmentOffice e bun pe cele 3 orașe |
| Performance (CWV) | 10% | 95 | CrUX origin pe mobil: LCP 2,1 s, INP 133 ms, CLS 0. PSI mobil 98–100 |
| AI Search Readiness | 10% | 60 | Robots e deschis pentru crawlerii AI și „Pe scurt" există, dar doar pe 3 pagini. llms.txt contrazice site-ul |
| Images | 5% | 90 | Toate imaginile au alt. Puține imagini |

Calcul: 0,22·85 + 0,23·62 + 0,20·65 + 0,10·60 + 0,10·95 + 0,10·60 + 0,05·90 = **72**.

---

## 2. Trendul GSC [V]

### Pe săptămâni (luni–duminică)

| Săpt. | Clicuri | Impresii | CTR | Poz. |
|---|---|---|---|---|
| 21.09 | 3.823 | 95.754 | 3,99% | 5,0 |
| 28.09 | 3.006 | 84.938 | 3,54% | 5,1 |
| 05.10 | 2.802 | 82.975 | 3,38% | 5,4 |
| 12.10 | 2.443 | 86.369 | 2,83% | 5,2 |
| 19.10 | 1.376 | 65.966 | 2,09% | 6,2 |
| 26.10 (6 z) | 809 | 51.264 | 1,58% | 6,4 |

- **Două faze.**
  - **21.09 → 12.10:** impresiile sunt stabile (~85k), poziția la fel (5,0–5,4), iar CTR-ul scade de la 4,0% la 2,8%. Asta înseamnă că s-a schimbat SERP-ul (AIO, site-urile guvernamentale), nu rankingul nostru.
  - **De la 16–19.10:** poziția sare de la 5,2 la 6,2–6,4 și impresiile scad cu ~30–40%. **În CJO nu există niciun deploy între 15.10 și 01.11** (git log), deci saltul e extern [I]: reevaluarea de după update-ul din 24.09–08.10 și/sau extinderea AIO.
- **Toate tipurile de pagină scad, nu doar orașele.**
  - Paginile de oraș: CTR 4,9% (14.10) → 1,8% (27.10), poziția 4,3 → 5,7.
  - Acasă: poziția 6,8 → 9,9–10,4 în ultima săptămână, impresiile ÷3.
  - Mobil și desktop scad identic, deci nu e o problemă de dispozitiv.

### Pagini care au pierdut (21.09–04.10 față de 19.10–01.11, câte 14 zile)

Total: 6.854 → 2.197 clicuri (−68%).

| Pagină | Clicuri | Impresii | Poz. |
|---|---|---|---|
| /cazier-judiciar-online/iasi | 312 → 35 | 6.282 → 4.686 | 4,4 → 6,3 |
| /…/brasov | 305 → 39 | 4.296 → 2.879 | 4,6 → 6,8 |
| /…/constanta | 329 → 63 | 6.397 → 3.089 | 4,9 → 5,5 |
| /…/craiova | 312 → 76 | 3.436 → 2.381 | 3,6 → 4,2 |
| /…/timisoara | 292 → 73 | 5.197 → 3.375 | 4,3 → 6,0 |
| / (acasă) | 220 → 70 | 34.194 → 16.274 | 7,4 → 8,6 |
| /cerere-cazier-judiciar-model | 348 → 203 | 3.445 → 1.751 | 5,8 → 5,5 |
| /cazier-auto-online | 215 → 75 | 5.927 → 4.124 | 6,0 → 8,8 |
| /cazier-judiciar-gratuit | 126 → 35 | 13.724 → 5.150 | 6,0 → 9,4 |

### Query-uri care au pierdut

| Query | Clicuri | Impresii | Poz. |
|---|---|---|---|
| cazier iasi | 121 → 11 | 981 → 936 | 2,0 → 4,4 |
| cazier brasov | 85 → 12 | 427 → 337 | 3,2 → 5,3 |
| cazier timisoara | 85 → 18 | 686 → 618 | 2,3 → 5,5 |
| cazier judiciar online | 86 → 29 | 14.193 → 7.574 | 6,1 → 7,5 |
| cazier constanta | 73 → 17 | 693 → 641 | 2,0 → 4,7 |
| program cazier brasov | 56 → 4 | 481 → 470 | 2,0 → 6,5 |
| program cazier sibiu | 33 → 1 | 404 → 338 | 2,4 → 5,7 |
| cazier auto online | 60 → 31 | 725 → 773 | 2,6 → 5,7 |

**[I] Ce se vede:**
- Pe query-urile de oraș impresiile rămân, dar poziția coboară de pe ~2 pe 4–6, iar CTR-ul se prăbușește mai mult decât explică poziția. La „cazier iasi", CTR-ul scade de la 12% la 1,2%, deci și AIO + hub.mai/IPJ au urcat deasupra noastră.
- Paginile care au rămas aproape de poziția 2 țin clicurile mai bine: Craiova 4,2; Oradea 2,4; Galați 2,5; Bacău a crescut.

---

## 3. Ce s-a livrat azi: verificare live [V]

| Schimbare | Live? | Observație |
|---|---|---|
| Testimoniale inventate și schema Review scoase, recenzii Google reale | ✅ | Pe cele 71 de URL-uri: 0 `"@type":"Review"`, 0 „Maria Popescu/Andrei Ionescu". Secțiunea spune deschis că recenziile vin de pe profilul Google eGhișeul.ro (aceeași firmă, citite pe 19.09). **Dar Google are în index versiunea veche:** URL Inspection arată „Review snippets: ERROR – Multiple reviews without aggregateRating" pe acasă (crawl 30.10), auto (28.10), fiscal (28.10), diaspora (28.10) și integritate (02.11 08:12 UTC, înainte de deploy) → vezi C1 |
| Prețuri 198/278/298, fără ONLINE10 | ✅ | Pe tot sitemap-ul: 0 „ONLINE10", 0 „270 lei/RON". **Excepție: `public/llms.txt` mai are „250 RON" (rândurile 36 și 68)** → H1 |
| Iași/Brașov/Timișoara refăcute | ✅ | H1 „Cazier judiciar <Oraș>", „Pe scurt" sub H1, ghișeele înaintea formularului, 5–9 `GovernmentOffice` + `OpeningHoursSpecification`, „Verificat la 02.11.2026" în meta. Jaccard Iași↔Brașov: 0,15 normal / **0,17 mascat** (înainte 0,39/0,47). Iași a fost crawlat la 08:38 UTC, Timișoara pe 29.10, deci înainte de deploy (08:45 UTC) |

---

## 4. Constatări

### CRITIC

**C1. Google încă vede schema Review/Product cu erori pe 5 pagini comerciale. Trebuie forțat recrawl-ul.**
- **[V]** Ultimele crawl-uri sunt dinaintea deploy-ului de azi. Rich Results raportează **ERROR** la Review snippets pe `/`, `/cazier-auto-online`, `/cazier-fiscal-online`, `/cazier-judiciar-diaspora` și `/certificat-integritate-comportamentala`. Până la recrawl, Google judecă site-ul după recenziile inventate.
- **Fix:**
  1. În GSC › URL Inspection › „Request indexing" pe cele 5 pagini + Iași/Brașov/Timișoara (8 cereri, în limita zilnică).
  2. Actualizează `lastmod` (vezi H2) ca sitemap-ul să semnaleze schimbarea.
- **Cum știm că a eșuat:** peste 7 zile URL Inspection arată tot „Review snippets" sau un `last_crawl_time` < 02.11 08:45 UTC.
- **Indicator:** în GSC › Enhancements › Review snippets numărul de itemi scade la 0.

### HIGH

**H1. `public/llms.txt` contrazice site-ul și conține fapte false.**
- **[V]** Ce e greșit în fișier:
  - r.13 și r.27: „Companies (PJ) do NOT have a criminal record". Site-ul are însă `/cazier-judiciar-persoane-juridice-ghid` (SRL, SA…), iar Legea 290/2004 acoperă persoanele juridice.
  - r.24 și r.68: „10 RON tax stamp at counter", dar `/taxa-cazier-judiciar` spune „gratuit la ghișeu".
  - r.36 și r.68: „250 RON".
  - r.13: linkul „Cazier Judiciar Online" duce la `/cazier-judiciar-online/bucuresti`, nu la homepage. Commit-ul c82e599c a reparat asta pe CTA-uri, nu și aici.
- **De ce contează [I]:** AIO și LLM-urile citesc fișierul. Un fapt fals despre PJ ne scoate din citările pentru „cazier firma".
- **Fix:** rescrie r.13, 24, 27, 36 și 68 din `public/llms.txt` după paginile live.
- **Cum știm că a eșuat:** un `grep -E "250 RON|10 RON|do NOT have a criminal" public/llms.txt` găsește ceva.
- **Indicator:** răspunsul Perplexity/ChatGPT la „cazier judiciar firma online" (verificare manuală lunară).

**H2. `lastmod` e unic și înghețat pentru toate cele 39 de orașe (10.06), deși cele 3 refăcute au „Verificat la 02.11.2026".**
- **[V]** `src/config/sitemap-dates.ts` exportă un singur `CJO_CITY_DATE`, folosit în `src/app/sitemap.ts:216`. Pentru acasă, auto, fiscal și integritate lastmod-ul e tot 10.06, deși azi s-au schimbat recenziile, prețurile și conținutul.
- **Fix:**
  - lastmod per oraș din `verifiedAt` (datele din `[city]/page.tsx`);
  - actualizează `PAGE_DATES.home/auto/fiscal/integritate` la 2026-11-02, doar acolo unde conținutul s-a schimbat real (regula 3: fără date de umplutură);
  - retrimite sitemap-ul în GSC (ultima trimitere: 21.09).
- **Cum știm că a eșuat:** `curl /sitemap.xml | grep -A1 iasi` arată tot 2026-10-06.
- **Indicator:** în GSC, `last_crawl_time` pe paginile schimbate < 7 zile.

**H3. Cele 36 de orașe nerefăcute păstrează formatul tranzacțional („online…, fără drum la poliție"), cu formularul primul și blocul de 38 de orașe.**
- **[V]**
  - Exemplu, Craiova: primul H2 e „Comandă cazierul online"; 43 de linkuri interne unice, din care ~38 sunt blocul de orașe; 3 FAQ.
  - Jaccard mascat între ele: 0,42–0,46. Sub pragul de 0,65, dar de 2,5× mai mare decât la cele refăcute.
  - Pierderile cele mai mari sunt pe Constanța (329→63), Craiova (312→76), Târgu Mureș (242→54), Sibiu (228→46), Ploiești (237→68) și Satu Mare (164→12).
- **Fix:** același model ca Iași, 1–2 orașe pe săptămână (regula 2), în ordinea clicurilor pierdute: Constanța, Târgu Mureș, Sibiu, Ploiești, Satu Mare, Buzău, Arad.
- **Cum știm că a eșuat:** la 3–4 săptămâni după rescriere, poziția pe „cazier <oraș>" nu revine sub 4 sau CTR-ul la poziție egală nu crește. Comparația se face cu Iași/Brașov/Timișoara ca grup de test față de cele nerefăcute ca grup de control.
- **Indicator:** poziția medie pe „program cazier <oraș>" pe paginile refăcute față de cele nerefăcute.

**H4. Homepage-ul alunecă: poziția 7,4 → 10+, impresiile ÷2 (34k → 16k).**
- **[V]**
  - Title-ul e „…fără Cont pe HUB MAI · 198 lei", iar H1-ul e „Cazier Judiciar Online în 1-2 Zile", deși standardul afișat e 3–5 zile.
  - Pagina are încă „Actualizat: 6 octombrie 2026", deși azi s-au schimbat recenziile.
  - Poziția pe „cazier judiciar online" e 6,1 → 7,5, iar pe „cazier online" 6,3 → 8,3.
- **Fix:** în `src/app/page.tsx`:
  - H1 coerent cu termenul standard (de ex. „Cazier judiciar online prin avocat");
  - un title fără HUB, pe ce primești în plus: hârtie, apostilă, traducere, diaspora;
  - data „Actualizat" reală.
- **Cum știm că a eșuat:** CTR-ul pe `/` scade sub 0,4% la poziție egală în 3 săptămâni.
- **Indicator:** impresiile pe `/` revin peste 2.500/zi în zilele lucrătoare.

### MEDIUM

**M1. Schema `Product` + `AggregateOffer` pe un serviciu declanșează „Merchant listings".**
- **[V]** Merchant listings dau warning-uri: `shippingDetails`, `hasMerchantReturnPolicy`, `validFrom`. Paginile afectate: `/`, auto, fiscal, diaspora, integritate, urgent, eliberare, ghid-reabilitare.
- **[V]** Pe acasă există în plus `HowTo` (Google nu-l mai afișează) și `LocalBusiness` + `OpeningHoursSpecification` pentru un serviciu online.
- **Fix:** păstrează `Service` + `Offer` + `Organization`. Scoate `Product`, `HowTo` și `LocalBusiness` din `src/app/page.tsx` și din cele 7 pagini de mai sus.
- **Cum știm că a eșuat:** după recrawl, GSC mai raportează „Merchant listings" pe domeniu.

**M2. `/cazier-auto-online` e slabă: poziția 6,0 → 8,8, iar pe „cazier auto online" 2,6 → 5,7.**
- **[V]** Title de 92 de caractere, fără diacritice („Sanctiuni", „Obtine"). H2-uri fără diacritice („Aplica", „Intrebari Frecvente"). 1.382 de cuvinte și doar 5 linkuri interne.
- **Fix:** în `src/app/cazier-auto-online/page.tsx`:
  - title ≤ 60 de caractere, cu diacritice;
  - un H2 „Cazier rutier = cazier auto", plus DRPCIV, valabilitate și „e legal?";
  - linkuri contextuale spre integritate și cazierul judiciar.
- **Indicator:** impresii noi pe „cazier rutier" și „istoric sanctiuni".

**M3. `/cazier-judiciar-gratuit` pierde poziții: 6,0 → 9,4, impresii 13,7k → 5,1k.**
- **[I]** E un query informațional, unde AIO răspunde direct cu hub.mai.
- **Fix:** un „Pe scurt" cu pașii concreți pe hub.mai (cine poate, ce semnătură îi trebuie) și datele verificate. Nu adăuga text nou de umplutură.
- **Indicator:** poziția revine sub 7.

**M4. „4.9/5 Rating Google" apare ca badge în hero-ul fiecărei pagini de serviciu, deși ratingul e al profilului eGhișeul.ro.**
- **[V]** Dezvăluirea apare doar mai jos, în secțiunea de recenzii.
- **[I]** Regula 3 cere ca sursa să fie reală și curentă. Fiind alt brand, badge-ul din hero poate fi citit drept rating CJO.
- **Fix:** scrie „4,9/5 pe Google (eGhișeul.ro, aceeași firmă)" direct în badge, sau scoate badge-ul din hero.

### LOW

**L1. Un link intern duce la 404.**
- **[V]** `src/app/ghid-reabilitare-cazier/page.tsx:944` are `href="/cazier-judiciar-online"`, care întoarce **404**: ruta are doar `[city]`.
- **Fix:** linkul să ducă la `/`, ca restul CTA-urilor (c82e599c).

**L2. FAQPage pe toate paginile.** E doar informativ: Google a retras rich results pentru FAQ în mai 2026. Nu trebuie scos, dar nu aduce nimic.

**L3. Formularea „Eliberat de Poliția Română" ca badge în trust bar și „Cazierul judiciar este un document oficial" în textul de acasă.** Faptul e corect, dar regula 7 cere verbul la noi („obținem") și evitarea perechii oficial + document în zona de trust.

**L4. Recrawl Bing.** IndexNow e configurat (2f5f49ac). După fix-urile H1/H2, trimite manual cele ~10 URL-uri schimbate.

---

## 5. Ce NU recomand

- Pagini noi pe comune sau sectoare. Încalcă regulile 1–2: e profilul infocazier.
- Revenirea la formular deasupra textului pe cele 3 orașe refăcute, înainte de 3–4 săptămâni de date.
- Explicarea scăderii doar prin AIO. Saltul de poziție de la 16–19.10 e real și afectează tot site-ul, inclusiv acasă și auto, care nu au intenție locală.
