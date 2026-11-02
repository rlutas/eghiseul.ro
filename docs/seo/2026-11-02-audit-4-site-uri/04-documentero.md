# Audit SEO — documentero.ro, 02.11.2026

**Metodă.** Am luat datele din GSC prin API (`sc-domain:documentero.ro`, 15.09–01.11), am inspectat prin URL Inspection toate cele 18 URL-uri din sitemap și am rulat PageSpeed pe mobil pentru `/` și `/certificat-de-nastere/`. Am descărcat cu curl 14 pagini live, ca HTML static (o dată cu UA de browser, o dată cu UA GPTBot), și am citit `src/config/documentero-sitemap.ts` și `docs/documentero/continut-si-seo.md`.
**Ce n-am putut verifica:** SERP-ul live (fără snapshot `&pws=0` în rularea asta), GSC eghiseul (contul de serviciu n-are acces la `sc-domain:eghiseul.ro`, deci canibalizarea între branduri e doar dedusă) și comenzile sau GA4.
**[V]** = verificat · **[I]** = dedus.

Analiza competitorilor (`seo-competitie.md`) acoperă doar cazierul, nu stare civilă. N-am refăcut-o.

---

## SEO Health Score: **82 / 100**

| Categorie | Pondere | Scor | De ce |
|---|---|---|---|
| Technical SEO | 22% | 92 | 18/18 URL-uri „Submitted and indexed”, canonical identic cu cel ales de Google, robots curat, http/www → 308 spre apex, HSTS |
| Content Quality | 23% | 72 | Pagini adânci (1.100–2.460 de cuvinte), cu surse legale, fără date inventate. Doar 6 ghiduri, iar din 05.10 nu s-a mai publicat niciunul |
| On-Page SEO | 20% | 75 | Paginile de serviciu nu prind interogările principale. 2 title-uri și 7 descrieri sunt trunchiate |
| Schema | 10% | 85 | Service + Product/AggregateOffer + BreadcrumbList + Article cu Person real. Fără aggregateRating. FAQPage doar ca info |
| Performance (CWV) | 10% | 95 | Lab: Perf 98, LCP 1,1–1,2 s, CLS 0, TBT ≤30 ms. Field/CrUX: lipsă (trafic prea mic) |
| AI Search Readiness | 10% | 80 | GPTBot primește 200 și conținutul complet în HTML, `llms.txt` răspunde 200, toți boții AI au Allow |
| Images | 5% | 80 | Alt gol pe avatare (decorative, OK) și pe 2–6 imagini pe paginile de serviciu |

Calcul: 0,22·92 + 0,23·72 + 0,20·75 + 0,10·85 + 0,10·95 + 0,10·80 + 0,05·80 = **81,8**

---

## GSC: trendul [V]

Site lansat pe 21.09, deci nu există date din august. Spam update-ul din septembrie (24.09–08.10) **nu l-a lovit**: clicurile au crescut după el.

| Săptămâna (luni) | Clicuri | Afișări | Poziție medie |
|---|---|---|---|
| 21.09 | 9 | 468 | 9,5 |
| 28.09 | 2 | 462 | 13,3 |
| 05.10 | 20 | 600 | 8,7 |
| 12.10 | 20 | 663 | 7,4 |
| 19.10 | 13 | 509 | 8,4 |
| 26.10 | 21 | 510 | 9,0 |

Total 21.09–01.11: **85 de clicuri, ~3.200 de afișări**. Afișările stau pe palier, ~500–650 pe săptămână, de 4 săptămâni.

**Paginile, primele 3 săptămâni comparate cu ultimele 3** (clicuri / afișări / poziție):

| Pagina | 21.09–11.10 | 12.10–01.11 | Direcție |
|---|---|---|---|
| /ghiduri/certificat-de-nastere-vechi-tipizat/ | 9 / 160 / 4,2 | **24 / 509 / 4,8** | ↑ motorul site-ului |
| /certificat-de-celibat/ | 4 / 382 / 7,3 | 12 / 357 / 5,7 | ↑ |
| /extras-multilingv/ | 9 / 307 / 7,7 | 7 / 223 / 7,2 | ↓ afișări −27% |
| /ghiduri/acte-necesare-duplicat-certificat-de-nastere/ | 0 / 152 / 12,8 | **0 / ~68** (total 220, după calcul) | ↓ |
| /ghiduri/certificat-de-nastere-pierdut/ | 3 / 219 / 13,0 | 2 / 127 / 12,8 | ↓ afișări −42% |
| /ghiduri/apostila-acte-stare-civila/ | 5 / 128 / 28,2 | 1 / 141 / 25,3 | ↔, poziție slabă |
| /certificat-de-nastere/ | 1 / 67 / 16,6 | 0 / 40 / 6,9 | ↓ afișări |
| /certificat-de-casatorie/ | 0 / 57 / 10,5 | 2 / 61 / 9,3 | ↔ |

**Interogările care contează și unde stăm acum** (afișări / poziție, 15.09–01.11):
- „certificat de celibat online” 36 / 6,3, **0 clicuri**; „anexa 18 stare civila” 30 / 7,8, 0 clicuri
- „certificat de nastere 2026” 42 / 5,0 (împărțită între ghidul „vechi” și „acte necesare”)
- „certificat de nastere online” 2 / 17. „duplicat certificat de nastere” 1 / 79. „certificat de nastere pierdut” 6 / 82, pe pagina de serviciu
- „certificat de casatorie (online)” 9+9 / 23–29. „certificat de celibat” 16 / 35
- „certificat de nastere multilingv” 9 / 23. „apostila” și variantele ei au ~70 de afișări pe poziții 46–86

---

## Ce e live din livrările de azi pe CJO
Nu se aplică aici. Pe documentero n-am găsit testimoniale inventate: blocul de recenzii trimite la profilul Google real (`g.page/r/CSfYKsVLbx7PEBM`), iar schema nu are `aggregateRating`/`Review` [V].

---

## Critical
Niciuna. Nimic nu blochează indexarea și nimic nu riscă o penalizare [V].

## High

### H1. Paginile de serviciu nu prind interogările principale, deci afișările stau pe loc
- **Observație [V]:** `/certificat-de-nastere/` are 107 afișări în 6 săptămâni. Pe „certificat de nastere online” e pe 17, pe „duplicat” pe 79–94, pe „pierdut” pe 82. `/certificat-de-casatorie/` are 118 afișări, pe poziții 23–40 la „certificat de casatorie (online)”. 70% din clicuri vin din 3 URL-uri, din care doar unul e pagină de serviciu. **[I]** Pe interogările astea, eghiseul (pe 20.09 era pe 1 la căsătorie și celibat) și Hub MAI ocupă locul. N-am putut confirma din GSC eghiseul (lipsește permisiunea).
- **Fix:** (1) Dă acces contului de serviciu `claude-seo@caziere` la `sc-domain:eghiseul.ro`, ca să măsurăm canibalizarea, nu să o ghicim. (2) Pe documentero, linkuri din conținutul ghidurilor cu trafic către pagina de serviciu, cu ancoră exactă: din „vechi-tipizat” → „duplicat certificat de naștere online”, din „acte-necesare” și „pierdut” → același. (3) Mutarea 301 de pe eghiseul se face doar după regula din `continut-si-seo.md`: când documentero îl depășește pe eghiseul pe aceeași interogare. Nu înainte.
- **Cum știm că n-a mers:** după 4 săptămâni, `/certificat-de-nastere/` tot sub 30 de afișări pe săptămână și tot în afara top 15 pe „certificat de nastere online”.
- **Indicator timpuriu:** afișările săptămânale pe `/certificat-de-nastere/` și `/certificat-de-casatorie/` (azi ~13 și ~20 pe săptămână).

### H2. Planul de conținut s-a oprit: niciun ghid nou din 05.10
- **Observație [V]:** există 6 ghiduri. `datePublished` e 19.09–05.10, după aceea nimic. Planul cerea 1–2 pe săptămână (`docs/documentero/continut-si-seo.md`), deci 4 săptămâni goale. Ghidul publicat pe 05.10 („vechi-tipizat”) a devenit în 3 săptămâni pagina cu cele mai multe clicuri de pe site (24, poziția 4,8). Formatul ăsta funcționează.
- **Fix:** reia ritmul de 1 ghid pe săptămână (regula 2: maximum 1–2), pe interogări unde avem deja afișări și n-avem pagină: „certificat de celibat online / anexa 18” (66 de afișări, 0 clicuri), „schimbare certificat nastere vechi in tip nou” (11 afișări, poziția 13), „certificat de naștere multilingv Italia” (6 afișări, poziția 24, poate fi o secțiune pe `/extras-multilingv/`), „duplicat certificat de nastere sector N” (6 afișări, poziția 8,5). Fiecare ghid nou primește cel puțin 5 linkuri din conținutul existent înainte de publicare (regula 5).
- **Cum știm că n-a mers:** ghidul nou nu strânge 50 de afișări în 21 de zile.
- **Indicator timpuriu:** numărul de interogări distincte pe săptămână în GSC (azi ~115 în 6 săptămâni).

### H3. Măsurarea săptămânală promisă nu s-a făcut
- **Observație [V]:** tabelul de măsurare din `continut-si-seo.md` are ultimul rând pe 21.09 („baseline”). Fără el nu știm dacă documentero îl depășește pe eghiseul, adică exact condiția pentru 301.
- **Fix:** un rând pe săptămână, din GSC API (afișări și poziție pe cele 4 interogări) plus un SERP `&pws=0&udm=14` pentru documentero și eghiseul.
- **Cum știm că n-a mers:** pe 30.11 tabelul încă se oprește la 21.09.
- **Indicator timpuriu:** un rând nou până luni, 09.11.

## Medium

### M1. Pagina de căsătorie n-a mai fost re-crawlată de la lansare
- **Observație [V]:** URL Inspection arată ultimul crawl pe 21.09 pentru `/certificat-de-casatorie/`, `/ghiduri/acte-necesare-duplicat-certificat-de-nastere/` și `/ghiduri/procura-din-strainatate-notar-consulat-avocat/`. Schema și sitemapul declară `dateModified` 06.10 (05.10 pentru procură), deci Google n-a văzut încă modificările. Restul paginilor au fost crawlate între 19 și 31.10.
- **Fix:** „Solicită indexarea” în GSC pentru cele 3 URL-uri. Adaugă linkuri în conținut către căsătorie din ghidurile cu crawl frecvent („vechi-tipizat”, „apostila”, „valabilitate celibat”: căsătoria în străinătate cere des și certificatul de căsătorie).
- **Cum știm că n-a mers:** `last_crawl_time` tot pe 21.09 la inspecția din 16.11.
- **Indicator timpuriu:** `gsc_inspect.py` pe cele 3 URL-uri.

### M2. Afișări fără clicuri pe celibat la interogările principale
- **Observație [V]:** „certificat de celibat online” 36 de afișări pe 6,3 și „anexa 18 stare civila” 30 pe 7,8: 0 clicuri pe amândouă. Title-ul („Certificat de Celibat Online (Anexa 18), Obținut prin Avocat”) e bun. Descrierea are 229 de caractere, iar partea care convinge (preț, termen, „fără să vii în țară”) cade după trunchiere **[I]**.
- **Fix:** în metadata paginii `src/app/documentero/certificat-de-celibat/` scurtează descrierea la ≤155 de caractere și pune prețul real și termenul în primele 100.
- **Cum știm că n-a mers:** CTR sub 3% pe interogările de celibat cu poziția ≤8, după 4 săptămâni.
- **Indicator timpuriu:** CTR-ul săptămânal al paginii (azi ~3,4% pe 12.10–01.11).

### M3. Pagina de serviciu și ghidurile se calcă pe aceleași interogări
- **Observație [V]:** „certificat de celibat” e împărțită între `/certificat-de-celibat/` (35,8) și ghidul de valabilitate (37,7). „certificat de nastere pierdut” e împărțită între serviciu (82) și ghid (75,6). „duplicat certificat de nastere” apare pe 3 URL-uri, toate pe poziții 79–85. Mai e și `/contact/`, care apare la „certificat de nastere multilingv”.
- **Fix:** fiecare ghid primește un link vizibil, sus, către serviciul lui („Vrei duplicatul? → /certificat-de-nastere/”), iar title-ul serviciului păstrează termenul tranzacțional, cel al ghidului pe cel informațional. Din `/contact/` scoate termenii-cheie de serviciu, dacă există în text.
- **Cum știm că n-a mers:** aceeași interogare tot pe 2+ URL-uri în GSC peste 4 săptămâni.
- **Indicator timpuriu:** numărul de interogări cu mai mult de un URL în dimensiunea query,page (azi 14).

### M4. Ghidul de apostilă prinde interogări generale pe care nu are cum să le câștige
- **Observație [V]:** 269 de afișări, poziția 26,7. Le aduc „apostila”, „ce inseamna apostila”, „apostila de la haga pret”, pe poziții 46–86. Pe nișa lui („apostila certificat de nastere”) e pe 54–61.
- **Fix:** nu-l lărgi spre „ce e apostila”, unde câștigă Prefectura și MAE. Întărește partea specifică: un tabel țară → apostilă da/nu pentru actele de stare civilă, o secțiune separată „apostila pe certificatul de naștere” și link din `/certificat-de-nastere/`.
- **Cum știm că n-a mers:** „apostila certificat de nastere” tot sub poziția 30 în 6 săptămâni.
- **Indicator timpuriu:** poziția pe „apostila certificat (de) nastere”.

## Low

- **L1 [V]** Title-uri peste ~60 de caractere: ghidul de valabilitate celibat are 97, procura 79. Descrieri peste 160: 7 pagini (procura 257, home 228, celibat 229). Fix: în metadata fiecărei pagini. Indicator: snippet rescris în SERP.
- **L2 [V]** `alt=""` pe 6 imagini pe naștere și căsătorie, 2 pe celibat și extras. Avatarele recenziilor sunt decorative și pot rămâne așa; pozele de proces trebuie descrise.
- **L3 [V]** Sitemapul pune `lastmod` 2026-10-06 pe 11 din 18 URL-uri, inclusiv pe Termeni. **[I]** Dacă nu toate s-au schimbat pe 06.10, e lastmod de umplutură (regula 3). Fix: `src/config/documentero-sitemap.ts`, data reală pe fiecare pagină.
- **L4 [V]** GSC raportează URL-uri cu fragment (`#s1`, `#s2`, `#s3`, `#s5`) pe „vechi-tipizat”. Sunt sitelinkuri „sari la secțiune”, deci un semn bun. Nu e nimic de reparat.
- **L5 Info [V]** Există FAQPage pe home, pe cele 4 servicii și pe 3 ghiduri. Google nu mai afișează rich results FAQ din mai 2026: nu aduce nimic, dar nici nu strică. Nu e nevoie de acțiune.
- **L6 [V]** CrUX n-are date de teren (trafic prea mic). Lab-ul e excelent. Speed Index 4,1–4,3 s e singurul scor sub 0,8. INP nu se poate măsura până nu există date de teren.

---

## Ce e în regulă [V]
- 18/18 indexate, Google acceptă canonical-ul declarat peste tot, robots închide `/comanda/`, `/api/`, `/account/`.
- Fiecare pagină are neafiliere, firma, ANPC/SOL („nu suntem” apare de 3 ori, ANPC de 9 ori). Termenul „oficial” apare doar în sens juridic („uz oficial”, „a oficia”), deci nicăieri ca „acte oficiale”.
- Autorul din Article e o persoană reală, cu pagină pe eghiseul. Datele `datePublished`/`dateModified` diferă de la pagină la pagină, deci nu sunt de umplutură.
- Conținutul e servit integral în HTML: GPTBot îl vede fără JS. `llms.txt` răspunde 200.
- Fiecare pagină din sitemap primește linkuri interne de pe toate cele 14 pagini descărcate, cu excepția ghidurilor noi: valabilitate celibat are 4, „vechi-tipizat” 7, acte necesare 8. **Ghidul cu cele mai multe clicuri are printre cele mai puține linkuri primite.** Merită 3–4 linkuri în text, din serviciul de naștere și din ghidul „pierdut” (legat de H1).
