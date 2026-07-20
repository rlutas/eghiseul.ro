# A afectat migrarea WP→Next.js SEO-ul? — analiză pe date (2026-07-20)

> Cutover DNS: **7 iulie 2026**. Surse: exporturi GSC `gsc-data/` (WP-era 13 feb 2025–13 iun 2026, 486 zile; „ultimele 3 luni" 19 apr–18 iul 2026, 91 zile, cu serie zilnică peste cutover + raport Coverage), plus `SEO-ANALYSIS-2026-06-22.md` (pre) și `STRATEGY-2026-07-13-post-cutover.md` (post, incl. verificări incognito 13 iul).

## TL;DR

1. **Migrarea NU a pierdut trafic existent.** Clicuri/zi post-cutover (8–17 iul: **2.150/zi**) ≥ baseline pre-cutover (9 iun–6 iul: **2.003/zi**; ferestre pe aceleași zile ale săptămânii: 2.200 → 2.150, adică **−2%**). Expuneri **+12%**. Zero prăbușiri pe top pagini/query-uri.
2. **Pozițiile pe query-urile cash-cow s-au ținut**: impozit auto 1,68→1,73, calculator impozit 1,56→1,65, verificare rovinietă 3,32→3,76, calculator salariu net 4,16→4,38 — derive de 0,1–0,6 poziții, nimic structural. Mai multe query-uri comerciale chiar au **urcat** (cazier auto 4,9→2,8; cazier judiciar online 6,6→6,1; constatator 8,1→6,6).
3. **Costul plauzibil al migrării = plafonarea creșterii, nu pierdere absolută.** Creșterea YoY a clicurilor a decelerat de la **+32%** (iunie, pe WP) la **+3%** (8–18 iul, pe Next) exact la cutover, deși expunerile YoY au rămas **+35%** → un gol de ~**300–450 clicuri/zi (−13…−18%)** față de trend. Confundat însă parțial cu compresia CTR din AI Overviews (CTR scădea YoY și înainte de cutover: 4,6% iul 2025 → 3,5% iul 2026).
4. **Problemele mari sunt pre-existente, nu de migrare**: Carte Funciară (hub 8,15→13,62, −92% clicuri — declin vizibil deja în datele 3-luni majoritar WP), cazier fiscal (query 4,4→8,5), dispariția clusterului „ghiseul.ro plata impozit" (~30 cl/zi în era WP, sub top-1000 acum). Indexarea 66/204 e o **oportunitate nerealizată** (pagini noi, fără istoric), nu trafic pierdut: cele 43 location pages cu date = doar **55 clicuri/3 luni**.
5. **Poziția medie site a slăbit 5,0→5,5 post-cutover** — în principal efect de mix (156 pagini indexate din 1 iul, față de 66; paginile noi long-tail intră pe poziții 10–45 și trag media în jos), nu pierdere pe paginile vechi. Alertă reală de urmărit: CTR 3,76%→3,51%.

---

## 1. Date & metodologie

| Sursă | Fereastră | Ce acoperă |
|---|---|---|
| Export „J" (WP-era) | 13 feb 2025 – 13 iun 2026 (486 z) | 100% WordPress. Interogări/Pagini agregate + serie zilnică |
| Export „N" (3 luni) | 19 apr – 18 iul 2026 (91 z) | **79 zile WP + 12 zile Next** (blend!). Serie zilnică peste cutover |
| Coverage (N) | până la 10 iul | indexate/neindexate zilnic |
| STRATEGY 13.07 | citire GSC live 13 iul | verificări incognito pe 5 query-uri cheie |

**Cum se citește:** singura măsură „curată" a migrării e **seria zilnică** (pre vs post 7 iul) + **YoY pe aceleași ferestre**. Comparațiile per-pagină/query J vs N sunt orientative: fereastra N e 87% WP, iar cl/zi din J includ **două sezoane de iarnă** (vârful impozit auto ian–mar) → scăderile de clicuri/zi pe impozit/pensii între J și N sunt **sezoniere**, nu pierderi; **compară pozițiile**, nu clicurile.

## 2. Seria zilnică: pre vs post cutover (site-level)

| Fereastră | Clicuri/zi | Expuneri/zi | CTR | Poziție |
|---|--:|--:|--:|--:|
| 19 apr–16 mai | 2.066 | 53.300 | 3,88% | 6,16 |
| 12 mai–8 iun | 1.981 | 53.236 | 3,72% | 5,34 |
| 9 iun–6 iul (4 săpt. pre) | 2.003 | 54.651 | 3,67% | 5,08 |
| 24 iun–3 iul (10 z, matched pe zilele săpt.) | 2.200 | 58.518 | 3,76% | 5,00 |
| **8–17 iul (10 z post)** | **2.150** | **61.201** | **3,51%** | **5,50** |

- Primele zile post-cutover au fost chiar cele mai bune (8 iul: 3.002 clicuri — record de fereastră), apoi normalizare la 1.950–2.200.
- Poziția medie +0,42 mai slabă e dominată de **mix**: +90 pagini noi indexate din 1 iul intră pe poziții 6–45 cu expuneri și aproape zero clicuri (vezi §5), plus expuneri +12%.

### YoY pe aceleași ferestre (controlul sezonier)

| Fereastră | 2025 (WP) | 2026 | YoY clicuri | YoY expuneri |
|---|--:|--:|--:|--:|
| 19 apr–18 mai | 1.033/zi | 2.080/zi | **+101%** | +80% |
| 19 mai–8 iun | 1.379/zi | 1.967/zi | **+43%** | +46% |
| 9 iun–6 iul | 1.519/zi | 2.003/zi | **+32%** | +43% |
| **8–18 iul (post-cutover)** | 2.020/zi | 2.079/zi | **+3%** | **+35%** |

Decelerarea +32%→+3% coincide cu cutover-ul, dar expunerile cresc în continuare (+35%) → problema e **CTR/poziție pe zilele post**, nu vizibilitatea. Estimare cost vs trend: dacă YoY se menținea la +25–30%, ~2.450–2.600 cl/zi; realizat 2.080–2.150 → **gol de ~300–450 cl/zi**. Parte din gol e AI Overviews (vezi limitări), parte e re-crawl/re-rank post-migrare — separarea exactă nu e posibilă din aceste date.

## 3. Categorii de pagini (cl/zi normalizat; J=486 z, N=91 z)

⚠️ Delta% de aici e **trend blend + sezon**, nu efect pur de migrare (J include 2× sezonul ian–mar).

| Categorie | Pagini J→N | cl/zi J | cl/zi N | Δ | Citire corectă |
|---|---|--:|--:|--:|---|
| Calculatoare + tools (cash-cow) | 18→46 | 2.478 | 1.725 | −30% | Sezonier (impozit auto −62% e vârf ian–mar în J). Pozițiile țin: rovinietă 6,0→**4,4**, salariu 5,1→5,2, impozit 5,9→5,7. +14 calculatoare noi aduc deja ~11 cl/zi |
| Articole blog | 62→53 | 247 | 128 | −48% | Majoritar sezon (pensii). Pierderi reale de poziție: anii-lucrați 5,2→6,4, amendă-rovinietă 4,6→6,6 |
| Pagini servicii | 17→32 | 184 | 101 | −45% | Mixt: cazier auto **+215%** (5,0→4,3), celibat 6,6→5,7 vs naștere 6,3→6,9, cazier fiscal 7,0→9,2, **CF hub 8,2→13,6** |
| Homepage | 1→1 | 99 | 84 | −15% | Poziție 6,6→7,2; preia și intenția „cazier" (canibalizare cu pagina de serviciu, problemă cunoscută) |
| Location pages (CF județe + cazier orașe) | 0→43 | 0 | 0,6 | nou | **55 clicuri / 3.557 expuneri în total** — neindexate/abia intrate |

## 4. Top query-uri: poziție înainte (J, 16 luni WP) vs după (N, 3 luni blend)

Top 20 după clicuri WP-era (poziția = comparabil valid; cl/zi J vs N distorsionat de sezon):

| Query | Poz J | Poz N | Δ | Notă |
|---|--:|--:|--:|---|
| verificare rovinieta | 3,32 | 3,76 | +0,4 | stabil |
| impozit auto 2026 | 1,68 | 1,73 | +0,1 | cash-cow intact |
| calculator impozit auto 2026 | 1,56 | 1,65 | +0,1 | intact |
| verificare rovinieta fara serie sasiu | 2,73 | 3,82 | +1,1 | de urmărit |
| calcul impozit auto 2026 | 1,40 | 1,87 | +0,5 | intact |
| calcul varsta pensionare legea noua | 2,42 | 2,73 | +0,3 | stabil |
| verificare rovinieta online | 3,35 | 3,75 | +0,4 | stabil |
| calculator salariu net | 4,16 | 4,38 | +0,2 | stabil (CTR tot mic) |
| calculator varsta pensionare anticipata | 3,89 | 4,49 | +0,6 | ușor minus |
| rovinieta verificare | 3,78 | 3,84 | +0,1 | stabil |
| ghiseul.ro plata impozit | 4,19 | absent top-1000 | — | cluster „plata impozit" dispărut (pre-migrare?, vezi §6) |
| calculator pensie invaliditate | 2,66 | 2,17 | **−0,5** | mai bine |
| ghiseul ro impozit | 3,50 | absent | — | idem |
| verifica rovinieta | 3,75 | 4,02 | +0,3 | stabil |
| ghiseul | 4,33 | absent | — | idem |
| calculator indemnizatie crestere copil | 2,57 | 3,40 | +0,8 | de urmărit |
| tabel varsta pensionare anticipata femei | 4,03 | 4,60 | +0,6 | ușor minus |
| impozit auto | 2,33 | 2,29 | 0,0 | stabil |
| verificare rovinieta dupa numar | 4,32 | 4,38 | +0,1 | stabil |
| pensie anticipata femei 1967 | 3,36 | 5,48 | **+2,1** | pierdere reală (articol pensii) |

Median Δ pe top 20 măsurabile: **+0,3 poziții** (ușoară slăbire, fără colaps).

**Query-uri comerciale (servicii):**

| Query | Poz J | Poz N | Verdict |
|---|--:|--:|---|
| cazier auto online | 3,52 | **2,66** | câștig |
| cazier auto | 4,93 | **2,83** | câștig |
| cazier judiciar online | 6,64 | **6,07** | mai bine (dar rankează homepage, nu pagina) |
| cazier online | 6,59 | **5,57** | mai bine |
| certificat constatator (+online) | 8,13 / 7,69 | **6,58 / 6,67** | mai bine (dar rankează articolul) |
| certificat de celibat | 5,79 | **4,82** | mai bine |
| certificat de casatorie (+online) | 1,82 / 2,75 | 1,98 / **2,04** | ținut/câștigat (#1 incognito 13.07) |
| certificat de nastere online | 2,64 | 3,63 | **minus** (#3 incognito, centruldevize peste noi) |
| cazier fiscal online | 4,42 | **8,52** | **pierdere reală** |
| extras carte funciara (+online) | 6,53 / 7,17 | absent top-1000 | **colaps CF** (pre-existent, vezi §6) |

## 5. Indexarea (66/204) — impact cuantificat separat

Serie Coverage („toate paginile cunoscute", până 10 iul):

| Perioadă | Indexate | Neindexate |
|---|--:|--:|
| 24 apr – 30 iun (WP + sitemap nou trimis) | 66 | 64–65 |
| 1 iul – 10 iul (snapshot nou) | **156** | **479** |

Breakdown neindexate (snapshot 10 iul): 379 „accesată cu crawlere – neindexată" + 78 „descoperită – neindexată" (majoritar URL-uri legacy WP + pagini noi în coadă) + 12×404 + 5 redirect + 2 robots + 1 noindex + 1 403 + 1 alt 4xx.

**Cuantificare impact:** indexarea NU a costat trafic existent — toate paginile care aduceau clicuri în era WP sunt prezente și primesc clicuri și în N (nicio pagină top-25 dispărută, cu excepția `/servicii/verificare-rovinieta-online/` = **redirect intenționat** către `/tools/`, care a și urcat 6,0→4,4). Costul e **oportunitate nerealizată**: cele ~90 location pages construite în iunie (42 CF județe + 48 cazier orașe) livrează azi **55 clicuri și 3.557 expuneri pe 3 luni** (max: piatra-neamț 15 cl poz 6,9; cluj-napoca 10 cl poz 8,3; restul 0–4 clicuri, poziții 6–45). Ținta din STRATEGY (66→180+ indexate în 4 săpt.) e pe drum (156 la 1 iul), dar „crawled – not indexed" 379 rămâne blocajul principal.

## 6. Pierzători vs câștigători (pagini)

**Pierderi reale de poziție** (nu doar sezon):

| Pagina | cl/zi J→N | Poz J→N | Diagnostic |
|---|---|---|---|
| /servicii/extras-de-carte-funciara/ | 15,7→1,2 | 8,15→**13,62** | **pre-existent** — confirmat pe date majoritar-WP la 13.07 (poz 13,74); cauza = competiție „gratuit ANCPI/MyEterra" + efunciara/cfunciara, nu migrarea |
| /servicii/cazier-fiscal-online/ | 29,1→9,0 | 7,03→9,16 | regres real; datare incertă (fereastra N e blend) — de verificat în GSC UI compare |
| /anii-lucrati-in-strainatate…/ | 43,9→12,5 | 5,22→6,36 | poziție −1,1 + sezon pensii |
| /amenda-rovinieta-2025…/ | 23,4→15,2 | 4,57→6,64 | slăbire + titlu cu „2025" învechit |
| /servicii/eliberare-certificat-de-nastere/ | 70,6→31,7 | 6,33→6,85 | motorul comercial, sub presiune (centruldevize #1) |
| cluster „ghiseul.ro plata impozit / ghiseul ro impozit / ghiseul" | ~68 cl/zi J | sub top-1000 | intenția „plată impozit oficial" nu ne mai matchează; doar „ghiseul.ro cazier*" a rămas (~3,7 cl/zi). Probabil re-clasificare Google pre/peri-cutover; de datat în GSC UI |
| /contact/ | 4,9→1,2 | 7,1→7,7 | pagina a fost 404 până la 22.06 (reconstruită) — cost de migrare mic, recuperabil |

**Câștigători:**

| Pagina | cl/zi J→N | Poz J→N |
|---|---|---|
| /servicii/cazier-auto-online/ | 9,4→**29,7** (+215%) | 5,04→**4,26** |
| /tools/verificare-rovinieta-online/ | 605→561 (sezon) | 6,0→**4,38** |
| /calculator/varsta-pensionare/ | 228→**271** (+19%) | 5,35→5,7 |
| /calculator/calculator-procente/ | 12,1→**18,5** (+53%) | 5,14→5,36 |
| 14 calculatoare noi (pensie alimentară, concediu medical, estimare pensie, dividende…) | 0→**~11 cl/zi** | 3,9–12,7 |
| /ancpi-nu-functioneaza/ (13.07, pe căderea ANCPI) | 0→365 clicuri în ~6 zile | 4,88 |
| /extras-carte-funciara-gratuit/ (13.07) | 0→18 cl | 5,4 |

## 7. Concluzii

1. **Migrarea nu a costat traficul existent.** La nivel de site: clicuri −2% (matched weekdays), expuneri +12%, top-20 query-uri median +0,3 poziții, cash-cows intacte. Pentru o migrare full-stack WP→Next cu schimbare de sitemap, e un rezultat foarte bun — validează munca de paritate URL/redirects din iunie (38/40 top earners, ship-blockerele rezolvate pe 22.06).
2. **Costul măsurabil e golul față de trend: ~300–450 cl/zi (−13…−18% vs counterfactual +25–30% YoY)** — dar cel puțin o parte e AI Overviews / compresie CTR (fenomen care preceda cutover-ul: CTR YoY −25% deja din primăvară) și volatilitate normală de re-crawl (12 zile e puțin). Re-măsoară la 4 săptămâni post-cutover (4 aug) înainte de a-l trata drept pierdere permanentă.
3. **Ce pare pierdere de migrare, de fapt nu e**: CF (declin pre-existent, competitiv), impozit auto/pensii (sezon), /servicii/verificare-rovinieta-online (redirect intenționat), location pages (pagini noi fără istoric, încă neindexate).
4. **Efecte de migrare reale, mici și adresabile**: poziția medie diluată de mix-ul de pagini noi (cosmetic), CTR −0,25pp site-level, /contact/ (recuperat), plus 2 semne de întrebare de datat în GSC UI: **cazier fiscal** (4,4→8,5) și **clusterul „ghiseul plata impozit"**.
5. **Indexarea 66→156/204+** e problema #1 de execuție post-cutover (era deja diagnosticată în STRATEGY 13.07, Front A) — dar e blocaj de creștere, nu regres.

## 8. Acțiuni recomandate

1. **Re-măsurare 4 aug** (4 săpt. post-cutover): re-rulează seria zilnică + YoY; abia atunci verdict final pe golul de trend. Nu lua decizii de arhitectură pe 12 zile de date.
2. **Datare în GSC UI (compare date ranges)** pentru cele 2 regresii nedatabile din exporturi: `cazier fiscal online` (query + pagină) și clusterul `ghiseul.ro plata impozit` — dacă ruptura e la 7 iul, e de migrare (verifică redirect/canonical/titlu pagină); dacă e mai veche, e algoritmică.
3. **Continuă Front A (indexare)** din STRATEGY 13.07 — request indexing pe top 30 location pages, IndexNow/Bing; 379 „crawled-not-indexed" e blocajul; curăță legacy WP (feeds, category, wp-content) cu 410/redirect ca să nu dilueze crawl budget-ul.
4. **CTR watch**: CTR site 3,76→3,51% + „verificare rovinieta fara serie sasiu" +1,1 poz — verifică snippet-urile/titlurile paginilor migrate cu cele mai mari expuneri (rovinietă, salariu) vs varianta WP din SERP-cache; rich snippets (FAQ/breadcrumb) active?
5. **Nu atinge ce merge**: cazier auto, căsătorie, celibat, constatator au urcat post-migrare — zero modificări pe aceste pagini în afara planului GEO deja stabilit.
6. **CF și naștere** rămân priorități competitive (nu de migrare) — deja acoperite de Front B/D din STRATEGY 13.07.

## 9. Limitări ale datelor

- **Ferestre asimetrice**: WP-era = 16 luni agregat (include 2× vârful ian–mar), post = 12 zile dintr-o fereastră 87% WP. Comparațiile de clicuri/zi per pagină/query sunt distorsionate sezonier; doar pozițiile și seria zilnică sunt solide.
- **12 zile post-cutover** = fereastră prea scurtă pentru verdict pe poziții (re-crawl-ul complet durează 4–8 săpt.).
- **Căderea ANCPI (13–20 iul)** umflă ușor traficul post: `/ancpi-nu-functioneaza/` ≈ 365 clicuri (~1,7% din clicurile ferestrei post) + query-uri „site ancpi nu functioneaza". Fără ele, clicuri/zi post ≈ 2.113 — concluziile nu se schimbă.
- **AI Overviews** (prezent pe toate cele 5 query-uri comerciale testate la 13.07) comprimă CTR independent de migrare — imposibil de separat exact de efectul de migrare în golul YoY.
- **Exporturile Interogări = top 1000** (cutoff ~9 clicuri în N): „absent" înseamnă sub cutoff, nu neapărat zero.
- **Coverage se oprește la 10 iul** și snapshot-urile GSC sunt discrete (salt 66→156 raportat la 1 iul); cifra reală curentă de indexare cere GSC UI.
- Nu există export per-pagină cu split pre/post cutover — deltele per-vertical post-cutover pur nu sunt calculabile din CSV-uri; sursa complementară = citirile live din STRATEGY 13.07.

---
**Autor:** analiză generată pe exporturile din `gsc-data/`, 2026-07-20. Script de calcul reproductibil: normalizare cl/zi (J÷486, N÷91), poziții ponderate cu expuneri.
