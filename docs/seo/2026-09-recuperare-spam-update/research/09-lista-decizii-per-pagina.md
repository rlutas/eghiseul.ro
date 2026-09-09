# 09 — Lista de decizii per pagină (KEEP / REWRITE / CONSOLIDATE / DELETE)

Livrabilul cerut: **„ce ștergem, ce îmbunătățim, ce folosim"**, pagină cu pagină,
pentru toate cele **191 de URL-uri indexabile** ale eghiseul.ro, după Google
August 2026 Spam Update.

Fiecare verdict e legat de două surse măsurate, nu de impresii:

- **crawl** — Screaming Frog, 09.09.2026, [`docs/EXPORT SCREAMINGFROG/internal_all.csv`](../../../EXPORT%20SCREAMINGFROG/internal_all.csv) (415 rânduri, din care 235 HTML, 191 indexabile);
- **performanță în căutare** — GSC, [`../gsc/`](../gsc/): `full-3luni/` (07.06→06.09.2026) și `compare-post-vs-pre/` (23.08–08.09 vs 01–17.08).

Context obligatoriu, pe care documentul ăsta îl continuă fără să-l repete:
[`../07-date-gsc-analytics-business.md`](../07-date-gsc-analytics-business.md) (impactul măsurat) și
[`../../2026-08-24-spam-update-prabusire-organica.md`](../../2026-08-24-spam-update-prabusire-organica.md) (scorul de tipare AI per pagină).
Tabelul complet, cu toate coloanele, e în [`data/decizii-per-pagina.csv`](data/decizii-per-pagina.csv).

---

## TL;DR

| Verdict | Pagini | Clicuri / 3 luni | % din trafic |
|---|---:|---:|---:|
| **KEEP** — nu atinge | 37 | 93.115 | 48,8% |
| **KEEP + FIX** — defect punctual | 29 | 43.614 | 22,9% |
| **REWRITE** — cerere reală, pagină slabă | 32 | 53.606 | 28,1% |
| **CONSOLIDATE (301)** — dispare ca URL | 93 | 439 | **0,23%** |
| **DELETE (410)** | **0** | 0 | 0% |

**Cifra care contează: tai 93 din 191 de pagini indexabile (48,7% din amprentă)
și pierzi 0,23% din clicuri.** Nu e o alegere între trafic și igienă — cele 93
de pagini nu produc trafic. Sunt cost pur de amprentă pe un site aflat sub
clasificare de „scaled content".

**Zero ștergeri hard (410).** Pentru fiecare pagină scoasă din index există o
pagină-părinte tematic exactă către care se face 301. Vezi §2.3 pentru de ce
410 n-ar aduce nimic în plus aici.

---

## 1. Joinul: ce s-a potrivit și ce nu

Cheia de join = URL normalizat (`https`, fără `www`, fără query, fără slash final).
Fără normalizare joinul e greșit: GSC raportează **separat**
`/calculator/varsta-pensionare/` (31.080 clicuri) și `/calculator/varsta-pensionare`
(2 clicuri) — dacă suprascrii în loc să însumezi, cel mai bun calculator de pe site
apare cu 2 clicuri. Toate cifrele de mai jos sunt **agregate**, iar poziția e
**mediată ponderat cu expunerile**.

| | N | Observație |
|---|---:|---|
| URL-uri HTML crawlate | 235 | 233 × 200 OK + 2 × 400 (`/_next/image/…`, artefacte de crawl) |
| din care **indexabile** | **191** | universul acestui document |
| non-indexabile | 44 | 40 pagini de oraș cazier pe `noindex` + `/embed/ancpi/` + 2 × 400 + 1 canonicalizat (varianta `?utm_source=embed` a `/ancpi-nu-functioneaza/`) |
| URL-uri distincte în GSC (3 luni) | 207 | |
| **Join crawl ∩ GSC** | **175** | 91,6% din paginile indexabile au avut cel puțin o expunere |
| Indexabile fără NICIO expunere în 3 luni | **16** | greutate moartă — vezi mai jos |
| În GSC dar necrawlate | 32 | 41 de clicuri în total |

### 1.1 Cele 16 pagini indexabile cu zero expuneri în trei luni

Zero expuneri ≠ „au căzut la update" — înseamnă că Google nu le-a servit **niciodată**
în fereastra de trei luni, inclusiv în perioada în care site-ul mergea la vârf
(10–16.08, 4.000–5.900 clicuri/zi). E cel mai curat semnal de pagină inutilă din tot setul.

| Rută | Tip | Cuvinte | Inlinkuri |
|---|---|---:|---:|
| `/servicii/extras-de-carte-funciara/{arges, bacau, bihor, galati, gorj, hunedoara, ialomita, teleorman, vaslui}` (9) | loc-CF | 734–937 | 14 fiecare |
| `/certificat-constatator-de-baza` | articol | 989 | 6 |
| `/certificat-constatator-pfa` | articol | 863 | 5 |
| `/certificat-constatator-insolventa` | articol | 889 | 5 |
| `/cazier-judiciar-online-gratuit` | articol | 1.513 | 4 |
| `/schimbare-sediu-social-srl-ghid` | articol | 842 | 5 |
| `/suspendare-activitate-firma-ghid` | articol | 717 | 8 |
| `/transcriere-certificat-de-casatorie` | articol | 711 | 10 |

Toate 16 ies din index în lista de decizii (CONSOLIDATE).

### 1.2 Cele 32 de URL-uri din GSC care nu există în crawl

Nu sunt pagini pierdute — sunt **cadavre de WordPress** care încă primesc expuneri
prin redirect: `/categorii_servicii/*`, `/category/informatii-utile/*`, `/blog/page/2`,
`/comanda/*` (rute de wizard, corect necrawlate), `/wp-admin/*`,
6 PDF-uri de contract în `/wp-content/uploads/*` și
`/cookies-policy`. **41 de clicuri în total.** Trei merită atenție:

- **`/importanta-extras-de-carte-funciara-colectiva` — 19 clicuri.** E duplicatul CF
  colectivă 301-uit pe 24.08. Redirectul funcționează; apariția în GSC e coadă istorică. OK.
- **`/cum-aflam-numarul-carte-functionara-nr-cadastral`** (fără „si") — variantă veche de slug
  a articolului cu 4.041 de clicuri. Verifică o dată că redirectul e 301, nu 302.
- **6 PDF-uri de contract indexabile în `/wp-content/uploads/`** — contracte cu numele
  unor SRL-uri terțe, servite direct de pe domeniu. Nu-s un semnal de spam, dar n-au ce
  căuta în index: `X-Robots-Tag: noindex` sau 410. (Nu-s pagini HTML, deci nu intră în tabel.)

### 1.3 ⚠️ Două limitări de date, declarate

1. **Coloanele „Closest Near Duplicate Match" și „No. Near Duplicates" din crawl sunt
   GOALE pe toate cele 415 rânduri** — analiza de near-duplicate nu a fost rulată în
   Screaming Frog (la fel `Closest Semantically Similar Address`). Ca să nu rămână
   gaură în date, coloana de duplicat din tabelele de mai jos vine din măsurătoarea
   proprie de similaritate Jaccard (5-shingle, doar `<main>`) din
   [`data/05-perechi-similare.csv`](data/05-perechi-similare.csv), documentată în
   [`05-inventar-si-footprint-site.md`](05-inventar-si-footprint-site.md). E o sursă mai bună, nu una mai slabă:
   se calculează pe HTML-ul prerandat, fără header/footer.
2. **Nu există pe disc o sursă de backlinkuri** (Ahrefs/Moz/GSC-links). Singura listă
   verificabilă de linkuri externe e pachetul de advertoriale din
   [`../../2026-07-31-articole-backlinks-plan.md`](../../2026-07-31-articole-backlinks-plan.md): **10 dofollow live**, către 8 URL-uri
   (`/`, `/servicii/certificat-constatator-online`, `/servicii/cazier-fiscal-online`,
   `/servicii/extras-de-carte-funciara`, `/verificare-proprietar-imobil`,
   `/servicii/certificat-urbanism-informare`, `/cele-4-tipuri-de-certificat-constatator-online`,
   `/eliberare-certificat-constatator-onrc-ghid`, plus `/ancpi-nu-functioneaza` pe click.ro).
   Coloana `backlink_extern_cunoscut` din CSV marchează exact acele URL-uri. **Niciunul
   nu e propus pentru dispariție.** Pentru restul site-ului, „fără backlinkuri" înseamnă
   „fără backlink cunoscut" — dacă apare un export Ahrefs, lista de CONSOLIDATE se
   re-verifică înainte de execuție.
3. **Scorurile AI sunt de ASTĂZI, nu de la 24.08.** Între timp au fost rescrise cel puțin
   11 pagini din lista neagră a raportului din 24.08 (`certificat-constatator-cu-istoric`
   25,1→3,7; `rolul-si-atributiile-onrc-romania` 22,2→3,1; `taxa-cazier-judiciar` 22,9→8,3;
   `totul-despre-cartea-funciara-colectiva` 18,8→1,0 etc. — comparație în
   [`data/06-pre-update-source-scores.json`](data/06-pre-update-source-scores.json)). Documentul folosește scorul **curent**,
   ca să nu trimită la rescriere pagini deja rescrise. Fapt neplăcut care iese din join:
   **paginile rescrise pe 24.08 din familia „certificat constatator" au în continuare zero
   expuneri** — vezi §5.

---

## 2. Regula de decizie (declarată înainte, aplicată mecanic)

### 2.1 Variabilele

| Simbol | Ce e | Sursa |
|---|---|---|
| `C3` | clicuri, 07.06→06.09.2026 | GSC `full-3luni/Pagini.csv`, agregat |
| `I3` | expuneri, aceeași fereastră | idem |
| `Δpoz` | poziție 23.08–08.09 minus poziție 01–17.08 (pozitiv = cădere) | GSC `compare-post-vs-pre` |
| `W` | cuvinte în `<main>` (fără header/footer) | [`data/05-inventar-pagini.csv`](data/05-inventar-pagini.csv) |
| `AI` | tipare AI la 1.000 de cuvinte | [`data/06-pages.csv`](data/06-pages.csv) |
| `J` | similaritate Jaccard maximă cu orice altă pagină | [`data/05-perechi-similare.csv`](data/05-perechi-similare.csv) |
| `BL` | backlink extern cunoscut | tracker advertoriale (§1.3) |

### 2.2 Pragurile

- **cerere reală** = `I3 ≥ 500` SAU `C3 ≥ 50`
- **subțire** = `W < 800`
- **tipare AI peste prag** = `AI ≥ 10/1k` (pragul de acțiune fixat în raportul din 24.08)
- **duplicat** = `J ≥ 0,30` (pentru pagini non-locație) sau apartenența la un set de locație
- **demotare reală** = `Δpoz ≥ 5`

### 2.3 Regula, în ordine

```
R0  PROTECȚIE   dacă BL sau C3 ≥ 100  → pagina NU poate fi DELETE. (verificat: 0 încălcări)
R1  DELETE 410  dacă C3 = 0 ȘI I3 = 0 ȘI fără BL ȘI nu există o pagină-părinte
                tematic exactă către care să redirectez.
R2  CONSOLIDATE dacă C3 ≤ 20 ȘI I3 ≤ 1.500 ȘI fără BL          → 301 spre părinte
R3  REWRITE     dacă cerere reală ȘI (AI ≥ 10 SAU W < 800 SAU J ≥ 0,30 SAU Δpoz ≥ 5)
R4  KEEP + FIX  performantă, dar cu un defect punctual și localizabil
R5  KEEP        restul
```

**De ce `DELETE (410)` iese gol.** Regula din brief spune: consolidezi ori de câte ori
URL-ul are *orice* inlink sau clic istoric, ștergi hard doar când n-are niciunul. Pe site-ul
ăsta **fiecare pagină are cel puțin 2 inlinkuri interne**, din navigație și footer — deci
aplicată literal, regula dă zero ștergeri hard, mecanic. Am verificat dacă asta e un
artefact sau răspunsul corect, și e răspunsul corect din alt motiv: **410 e justificat doar
când 301 ar fi un soft-404**, adică n-ai unde să trimiți omul. Aici fiecare pagină de tăiat
are un părinte evident (`/servicii/extras-de-carte-funciara/gorj` → pagina de CF;
`/certificat-constatator-pfa` → ghidul celor 4 tipuri). 301 păstrează ce echitate există și
livrează utilizatorul unde trebuie; 410 aruncă și una și alta, în schimbul a nimic.
Inlinkurile interne sunt puse de noi, deci nu-s dovadă de valoare — le-am folosit doar ca
semnal secundar, iar semnalul operativ a fost backlink extern + clicuri istorice.

**Un singur avertisment la 301-uri:** nu redirecta nimic către homepage. Toate cele 93 de
301-uri din lista de mai jos merg către o pagină cu **aceeași intenție de căutare**
(pagina de serviciu sau ghidul-umbrelă al familiei). Un val de redirecturi către `/` s-ar
întoarce ca soft-404 în masă.

### 2.4 Excepțiile pe care le-am aplicat cu mâna (și de ce)

Regula mecanică diverge de verdictul final pe **55 de URL-uri**. Nu-s excepții ad-hoc:
33 din ele sunt calculatoare, 6 pagini legale, 2 pagini de locație — restul de 14 sunt punctuale. Toate se justifică pe date, nu pe gust.

| Clasă | N | Regula zicea | Verdict | De ce am suprascris |
|---|---:|---|---|---|
| **Calculatoare** | 33 | REWRITE (24) / CONSOLIDATE (9) / KEEP (7) | KEEP (24) / KEEP + FIX (16) | Clusterul de calculatoare **nu a fost demotat** — 103.469 de clicuri în 3 luni (54% din tot traficul) și pozițiile păstrate sau îmbunătățite (`calcul varsta pensionare legea noua` 2,33→2,03). Sunt și singurul set cu **0 propoziții identice** între pagini. `AI ≥ 10` pe un calculator măsoară textul explicativ din jur, nu produsul; a rescrie 24 de calculatoare care funcționează e exact riscul pe care nu ni-l permitem acum. Unde poziția chiar a căzut ≥8 locuri (`taxe-notariale` 7,84→64,84, `contributii-pfa` 5,80→22,60, `vechime-in-munca` 4,80→22,88, `diurna`, `impozit-chirie`, `taxa-judiciara-de-timbru`, `impozit-casa`, `concediu-maternitate`, `termene-judiciare`) SAU `AI ≥ 15` → **KEEP + FIX**: se curăță DOAR textul explicativ, nu formula, nu layoutul. 16 din 40 intră aici. |
| **Pagini legale / footer** | 6 | CONSOLIDATE (5 din 6) | KEEP | `/politica-de-confidentialitate` are scorul AI cel mai mare de pe site (35,8/1k) — e un fals pozitiv al lexiconului pe text juridic („reprezintă", „în conformitate cu", hedging). Paginile astea sunt obligatorii legal și sunt semnal de încredere, nu de spam. Nu se ating. |
| **Pagini de locație cu trafic** | 2 | REWRITE (`piatra-neamt` 26 clicuri, `extras…/bucuresti` 24) | CONSOLIDATE | Decizia pe seturile de locație se ia **pe set, nu pe pagină** (§6). Un set în care păstrezi 2 pagini și tai 40 rămâne un set de șablon, doar mai mic — și e exact tiparul pe care îl caută clasificatorul. |
| **`/ancpi-nu-functioneaza`** | 1 | REWRITE (20.867 clicuri, AI 15,1) | KEEP + FIX | Cererea a dispărut, nu poziția: portalul ANCPI a repornit pe 11–12.08 și poziția noastră a **urcat** 6,3→5,43. A investi ore de rescriere într-un articol de actualitate a cărui actualitate s-a încheiat = efort irosit. Curățare de tipare + o notă de actualizare, atât. |

Restul de 13 divergențe: `/servicii`, `/tools`, `/blog`, `/calculator` (hub-uri —
n-au trafic propriu prin construcție, dar sunt scheletul de navigație);
`/acte-necesare-certificat-de-nastere`, `/acte-necesare-casatorie`, `/cazier-fiscal-fara-spv`
(promovate cu mâna la **țintă de consolidare** — devin destinația unui 301, deci nu pot
dispărea ele însele); `/valabilitate-extras-de-carte-funciara` și `/sms-fals-amenda-ghiseul-ro`
(regula zicea REWRITE pentru că sunt sub 800 de cuvinte / au căzut, dar au AI 6,4 și 2,0/1k
și poziții în urcare — n-au ce să li se rescrie); `/cazier-si-certificat-de-integritate-pentru-profesori`
(sezonier, e septembrie); `/cazier-judiciar-vs-certificat-integritate-comportamentala` și
`/servicii/certificat-sarcini` (căderea nu vine din text — AI 3,5 și 5,2/1k — ci din
autoritatea clusterului); `/cat-poti-construi-pe-teren` (regula zicea REWRITE, dar dublează
un calculator care funcționează, deci merge la 301).
Lista completă, per URL, e în coloana `regula_mecanica` din
[`data/decizii-per-pagina.csv`](data/decizii-per-pagina.csv): oriunde diferă de `verdict`, decizia a fost luată cu mâna.

---

## 3. Sumar: verdict × tip de pagină

Format celulă: `număr pagini (clicuri în 3 luni)`.

| Tip pagină | KEEP | KEEP + FIX | REWRITE | CONSOLIDATE | Total pagini | Total clicuri 3L |
|---|---:|---:|---:|---:|---:|---:|
| calculator | 24 (83.275) | 16 (20.194) | — | — | **40** | **103.469** |
| articol | 6 (9.806) | 7 (22.895) | 12 (8.341) | 32 (211) | **57** | **41.253** |
| tool | — | — | 2 (32.925) | — | **2** | **32.925** |
| serviciu | — | 3 (314) | 17 (7.773) | 11 (29) | **31** | **8.116** |
| homepage | — | — | 1 (4.567) | — | **1** | **4.567** |
| legal | 5 (11) | 1 (190) | — | — | **6** | **201** |
| loc-CF | — | — | — | 42 (111) | **42** | **111** |
| loc-cazier | — | — | — | 8 (88) | **8** | **88** |
| hub | 2 (23) | 2 (21) | — | — | **4** | **44** |
| **TOTAL** | **37 (93.115)** | **29 (43.614)** | **32 (53.606)** | **93 (439)** | **191** | **190.774** |
Ce se citește din tabel:

- **Calculatoarele nu se rescriu** — 40 de pagini, 54% din tot traficul; unde se intervine
  (16 pagini) e strict curățare de text în jurul calculatorului, niciodată formula.
- **Toată chirurgia e pe articole și servicii**: 43 din cele 93 de consolidări sunt articole
  (32) și pagini de serviciu (11), cu **240 de clicuri în total pe 3 luni**.
- **Cele două seturi de locație dispar integral** (50 de pagini indexabile, 199 de clicuri),
  plus cele 40 de pagini de oraș pe `noindex` care nu apar în tabel (§6).
- **Nicio pagină cu peste 100 de clicuri nu iese din index.** Cea mai bine plasată pagină
  propusă pentru 301 are 26 de clicuri în trei luni.

---

## 4. Tabelul per URL

Toate cele 191 de pagini indexabile, o singură dată fiecare, grupate pe verdict și
sortate descrescător după clicuri/3 luni. `Jac` = similaritatea Jaccard maximă cu orice
altă pagină (gol = sub 0,20). `clic pre→post` și `poz pre→post` = ferestrele egale de 17
zile 01–17.08 vs 23.08–08.09.

### KEEP — 37 pagini, 93.115 clicuri/3 luni

| Rută | tip | cuv. | AI/1k | Jac | inlk | clic 3L | clic pre→post | poz pre→post | Motiv / ce faci |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/calculator/varsta-pensionare` | calculator | 1222 | 9.82 |  | 232 | 31082 | 7604→3604 | 5.75→2.56 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/calculator-impozit-auto` | calculator | 1082 | 12.94 |  | 232 | 22973 | 4051→2036 | 3.84→2.99 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/calculator-indemnizatie-crestere-copil` | calculator | 1820 | 9.34 |  | 3 | 8877 | 1852→1479 | 5.07→4.2 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/pensie-invaliditate` | calculator | 1224 | 13.89 |  | 2 | 7201 | 1476→760 | 5.56→2.18 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/tabel-varsta-pensionare-anticipata-femei` | articol | 2535 | 1.18 |  | 3 | 5444 | 1095→325 | 6.1→2.89 | 5.444 clicuri, AI 1,2/1k, poziția a URCAT 6,1→2,89 — nu o atinge |
| `/calculator/pensie-alimentara` | calculator | 1214 | 9.06 |  | 232 | 3298 | 1289→1180 | 3.15→1.46 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/verificare-proprietar-imobil` | articol | 1383 | 1.45 |  | 3 | 2492 | 1667→47 | 5.94→3.11 | 2.492 clicuri, AI 1,5/1k (deja rescrisă), backlink money.ro — nu o atinge |
| `/calculator/tva` | calculator | 1382 | 13.75 |  | 232 | 2240 | 537→97 | 4.76→3.06 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/termene-judiciare` | calculator | 1297 | 10.02 |  | 232 | 1830 | 528→3 | 3.65→9.48 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/estimare-pensie` | calculator | 1171 | 8.54 |  | 232 | 1648 | 824→58 | 3.79→2.83 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/calculator-procente` | calculator | 1481 | 12.83 |  | 232 | 1423 | 232→14 | 5.9→4.14 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/dividende` | calculator | 1379 | 10.15 |  | 232 | 1379 | 478→311 | 3.91→2 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania` | articol | 1049 | 0.95 |  | 4 | 1077 | 226→116 | 5.97→2.92 | 1.077 clicuri, AI 0,95/1k, poziția a URCAT 5,97→2,92 |
| `/calculator/dobanda-legala` | calculator | 1245 | 10.44 |  | 4 | 710 | 307→41 | 3.05→8.14 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/valabilitate-extras-de-carte-funciara` | articol | 781 | 6.4 |  | 4 | 374 | 117→34 | 3.8→1.86 | 374 clicuri, poziția a URCAT 3,8→1,86 |
| `/schimbare-certificat-de-nastere-vechi` | articol | 830 | 9.64 |  | 4 | 362 | 136→94 | 5.58→1.81 | 362 clicuri, poziția a URCAT 5,58→1,81 — singurul articol de stare civilă care merge |
| `/calculator/amenda-circulatie` | calculator | 1472 | 11.55 |  | 232 | 217 | 108→1 | 6.36→2.58 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/calculator-data` | calculator | 1459 | 6.85 |  | 2 | 116 | 62→1 | 7.61→3.44 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/zile-lucratoare` | calculator | 1203 | 13.3 |  | 2 | 97 | 45→0 | 8.72→10.5 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/taxe-srl` | calculator | 1072 | 8.4 |  | 4 | 58 | 34→0 | 18.22→6 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/sms-fals-amenda-ghiseul-ro` | articol | 1008 | 1.98 |  | 2 | 57 | 0→0 | 7.11→16.75 | conținut de utilitate publică, AI 2,0/1k — exact tipul de pagină care construiește încredere |
| `/calculator/impozit-pensie` | calculator | 1474 | 8.14 |  | 4 | 52 | 18→11 | 4.79→1.64 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator` | hub | 521 | 3.84 |  | 232 | 17 | 8→1 | 4.92→4.87 | hub de calculatoare — clusterul care a supraviețuit |
| `/calculator/penalitati-anaf` | calculator | 1568 | 8.29 |  | 4 | 17 | 10→0 | 5.45→5.9 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/spor-salarial` | calculator | 1307 | 11.48 |  | 2 | 17 | 5→1 | 5.2→1 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/zile-concediu-odihna` | calculator | 1344 | 11.16 |  | 6 | 15 | 0→1 | 5.88→5.33 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/rambursare-anticipata` | calculator | 997 | 10.03 |  | 4 | 9 | 4→0 | 6→— | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/blog` | hub | 1886 | 9.01 |  | 232 | 6 | 4→0 | 6.31→1.93 | hub de articole, 1.886 cuvinte, poziția a URCAT 6,31→1,93 |
| `/calculator/inflatie` | calculator | 1473 | 13.58 |  | 2 | 6 | 1→1 | 6.43→2 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/termeni-si-conditii` | legal | 1668 | 17.99 |  | 232 | 6 | 0→0 | 9.11→2.72 | pagină legală/footer — scorul AI e artefact de lexicon pe text juridic |
| `/calculator/credit-ipotecar` | calculator | 1265 | 8.7 |  | 232 | 5 | 2→0 | 18.76→10.27 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/calculator/concediu-paternal` | calculator | 1336 | 14.22 |  | 3 | 4 | 1→0 | 4.52→— | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/politica-de-anulare` | legal | 720 | 19.44 |  | 232 | 3 | 1→0 | 5.67→2.05 | pagină legală/footer — scorul AI e artefact de lexicon pe text juridic |
| `/calculator/grad-indatorare` | calculator | 1469 | 4.77 |  | 2 | 1 | 1→0 | 4.71→1.67 | calculator — clusterul care a supraviețuit; nu-l atinge |
| `/politica-cookies` | legal | 374 | 24.06 |  | 232 | 1 | 1→0 | 9.78→1.87 | pagină legală/footer — scorul AI e artefact de lexicon pe text juridic |
| `/politica-de-confidentialitate` | legal | 1119 | 35.75 |  | 232 | 1 | 0→0 | 7.44→86 | pagină legală/footer — scorul AI e artefact de lexicon pe text juridic |
| `/gdpr` | legal | 213 | 9.39 |  | 232 | 0 | 0→0 | 4→3.75 | pagină legală/footer — scorul AI e artefact de lexicon pe text juridic |

### KEEP + FIX — 29 pagini, 43.614 clicuri/3 luni

| Rută | tip | cuv. | AI/1k | Jac | inlk | clic 3L | clic pre→post | poz pre→post | Motiv / ce faci |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/ancpi-nu-functioneaza` | articol | 5827 | 15.1 |  | 7 | 20867 | 15164→44 | 6.3→5.43 | nu investi în ea — cererea a dispărut odată cu avaria (11-12.08), poziția a URCAT 6,3→5,43. Doar: actualizează cu „portalul a repornit", curăță AI 15,1/1k. E ținta a 4 backlinkuri. |
| `/calculator/salariu` | calculator | 1035 | 15.46 |  | 232 | 14075 | 1759→69 | 6.58→9.77 | calculator nedemotat, dar AI 15.5/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/calculator/concediu-medical` | calculator | 1534 | 17.6 |  | 232 | 2614 | 1288→415 | 4.53→2.65 | calculator nedemotat, dar AI 17.6/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/calculator/vechime-in-munca` | calculator | 1325 | 6.04 |  | 6 | 837 | 209→9 | 4.8→22.88 | demotare reală măsurată (4.80→22.88) pe un calculator care funcționează — curăță DOAR textul din jur (AI 6.0/1k), nu atinge formula, nu atinge layoutul |
| `/extras-carte-funciara-gratuit` | articol | 1127 | 9.76 |  | 4 | 711 | 391→4 | 7.77→5.71 | 711 clicuri, AI 9,8/1k — curățare de tipare, fără rescriere |
| `/taxa-cazier-judiciar` | articol | 847 | 8.26 |  | 4 | 702 | 173→13 | 7.27→6.83 | 62,9k expuneri pe 847 de cuvinte — extinde cu taxe reale, surse ANAF/IPJ (AI deja curățat 22,9→8,3) |
| `/calculator/contributii-pfa` | calculator | 1550 | 9.68 |  | 10 | 537 | 242→4 | 5.8→22.6 | demotare reală măsurată (5.80→22.60) pe un calculator care funcționează — curăță DOAR textul din jur (AI 9.7/1k), nu atinge formula, nu atinge layoutul |
| `/calculator/impozit-chirie` | calculator | 1299 | 9.24 |  | 6 | 487 | 274→20 | 4.99→16.72 | demotare reală măsurată (4.99→16.72) pe un calculator care funcționează — curăță DOAR textul din jur (AI 9.2/1k), nu atinge formula, nu atinge layoutul |
| `/cele-4-tipuri-de-certificat-constatator-online` | articol | 1269 | 3.15 |  | 10 | 479 | 108→4 | 5.95→3.23 | ținta de consolidare pentru 8 articole satelit + backlink startupcafe — extinde-o cu secțiunile preluate |
| `/calculator/indemnizatie-somaj` | calculator | 1337 | 20.94 |  | 232 | 456 | 250→1 | 5.78→3.02 | calculator nedemotat, dar AI 20.9/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/calculator/taxa-judiciara-de-timbru` | calculator | 1451 | 18.61 |  | 7 | 376 | 111→8 | 6.41→19.21 | demotare reală măsurată (6.41→19.21) pe un calculator care funcționează — curăță DOAR textul din jur (AI 18.6/1k), nu atinge formula, nu atinge layoutul |
| `/calculator/reabilitare` | calculator | 1353 | 19.22 |  | 5 | 290 | 58→19 | 6.08→4.52 | calculator nedemotat, dar AI 19.2/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/calculator/taxe-notariale` | calculator | 1376 | 13.81 |  | 232 | 253 | 128→3 | 7.84→64.84 | demotare reală măsurată (7.84→64.84) pe un calculator care funcționează — curăță DOAR textul din jur (AI 13.8/1k), nu atinge formula, nu atinge layoutul |
| `/contact` | legal | 207 | 19.32 |  | 232 | 190 | 80→0 | 5.06→2.38 | 207 de cuvinte pe 190 de clicuri — adaugă date reale de firmă (CUI, sediu, program, oameni). Cea mai ieftină reparație de E-E-A-T de pe site. |
| `/servicii/identificare-imobil` | serviciu | 2262 | 7.52 | 0.27 | 232 | 181 | 104→3 | 7.63→9.5 | 181 clicuri, AI 7,5 — doar curățare |
| `/servicii/identificare-imobile-proprietar` | serviciu | 2329 | 3.43 | 0.26 | 232 | 114 | 46→4 | 5.85→6.32 | primește certificat-detineri-imobile prin 301 |
| `/calculator/impozit-casa` | calculator | 1420 | 27.46 |  | 232 | 88 | 55→0 | 6.14→17.59 | demotare reală măsurată (6.14→17.59) pe un calculator care funcționează — curăță DOAR textul din jur (AI 27.5/1k), nu atinge formula, nu atinge layoutul |
| `/totul-despre-cartea-funciara-colectiva` | articol | 988 | 1.01 |  | 4 | 67 | 14→1 | 10.34→4.13 | deja rescrisă 24.08 (AI 18,8→1,0); doar verifică 301-ul duplicatului și adaugă surse |
| `/calculator/jugar-stanjen-in-mp` | calculator | 1372 | 15.31 |  | 232 | 61 | 17→10 | 6.59→2.12 | calculator nedemotat, dar AI 15.3/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/cazier-judiciar-vs-certificat-integritate-comportamentala` | articol | 1414 | 3.54 |  | 5 | 59 | 16→0 | 7.42→14.42 | 9,5k expuneri, căzută 7,42→14,42, AI 3,5 — nu textul e problema, ci autoritatea clusterului |
| `/calculator/cost-cadastru-intabulare` | calculator | 1462 | 27.36 |  | 3 | 42 | 19→1 | 6.69→2.91 | calculator nedemotat, dar AI 27.4/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/calculator/cat-pot-construi` | calculator | 1363 | 16.87 |  | 232 | 33 | 19→0 | 5.6→5.67 | calculator nedemotat, dar AI 16.9/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/calculator/concediu-maternitate` | calculator | 1335 | 6.74 |  | 3 | 22 | 15→0 | 5.45→15.76 | demotare reală măsurată (5.45→15.76) pe un calculator care funcționează — curăță DOAR textul din jur (AI 6.7/1k), nu atinge formula, nu atinge layoutul |
| `/servicii` | hub | 808 | 1.23 |  | 232 | 20 | 6→4 | 7.56→1.6 | hub-ul comercial: 808 de cuvinte, 370 de inlinkuri — merită să fie pagina care explică cine suntem și cum lucrăm |
| `/servicii/certificat-sarcini` | serviciu | 2301 | 5.22 | 0.35 | 232 | 19 | 5→0 | 5.05→5.56 | parte din șablonul topograf (Jaccard 0,35) dar serviciu vândut distinct — diferențiază textul |
| `/calculator/diurna` | calculator | 1287 | 4.66 |  | 2 | 17 | 2→0 | 6.43→44.36 | demotare reală măsurată (6.43→44.36) pe un calculator care funcționează — curăță DOAR textul din jur (AI 4.7/1k), nu atinge formula, nu atinge layoutul |
| `/cazier-si-certificat-de-integritate-pentru-profesori` | articol | 1335 | 15.73 |  | 3 | 10 | 2→2 | 6.27→2.56 | sezonier (septembrie) și țintă de digital PR — curăță AI 15,7/1k înainte de campanie |
| `/calculator/valabilitate-documente` | calculator | 766 | 20.89 |  | 232 | 6 | 3→0 | 8.22→2.88 | calculator nedemotat, dar AI 20.9/1k în text — curăță DOAR textul din jurul calculatorului, nu formula |
| `/tools` | hub | 147 | 13.61 |  | 2 | 1 | 0→0 | — | 147 de cuvinte, 1 clic — ori devine index real, ori noindex |

### REWRITE — 32 pagini, 53.606 clicuri/3 luni

| Rută | tip | cuv. | AI/1k | Jac | inlk | clic 3L | clic pre→post | poz pre→post | Motiv / ce faci |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/tools/verificare-rovinieta-online` | tool | 871 | 8.04 |  | 232 | 32589 | 5714→41 | 5.95→31.92 | cel mai mare activ comercial (32,6k clicuri) căzut 5,95→31,92; text subțire (871 cuv.) în jurul tool-ului |
| `/` | homepage | 2080 | 14.42 |  | 232 | 4567 | 540→216 | 9.27→23.91 | poziția a căzut 9,27→23,91; AI 14,4/1k; e locul unde se montează semnalele de încredere (Despre noi, echipă, autori) |
| `/cum-aflam-numarul-carte-functionara-si-nr-cadastral` | articol | 1585 | 13.25 |  | 7 | 4041 | 1361→360 | 5.44→2.84 | 4.041 clicuri / 81k expuneri dar AI 13,25/1k — cel mai valoros articol netratat |
| `/servicii/eliberare-certificat-de-nastere` | serviciu | 2973 | 13.45 | 0.32 | 232 | 1714 | 210→90 | 8.54→6.69 | cea mai mare pagină de serviciu (1.714 clicuri), AI 13,5/1k |
| `/servicii/cazier-auto-online` | serviciu | 2969 | 13.81 | 0.21 | 232 | 1692 | 248→11 | 5.8→6.32 | 1.692 clicuri, AI 13,8/1k |
| `/servicii/extras-de-carte-funciara` | serviciu | 3777 | 10.33 |  | 232 | 1549 | 878→4 | 7.84→22.32 | căzut 7,84→22,32, 63,7k expuneri, AI 10,3/1k; are backlink money.ro |
| `/amenda-rovinieta-2025-tarife-plata-online-ghid-complet` | articol | 849 | 20.02 |  | 2 | 1463 | 462→7 | 5.69→13.4 | AI 20,0/1k (cel mai prost articol cu trafic real), 849 cuv. la 79k expuneri, căzut 5,69→13,40 |
| `/ghid-complet-certificat-de-integritate-comportamentala` | articol | 685 | 11.68 |  | 3 | 925 | 163→0 | 3.45→5.44 | 925 clicuri pe 685 de cuvinte (thin), AI 11,7/1k, căzut 3,45→5,44 |
| `/informatii-cazier-auto-online` | articol | 780 | 5.13 |  | 4 | 822 | 192→13 | 5.51→3.5 | 822 clicuri / 35k expuneri pe 780 de cuvinte (thin) |
| `/servicii/cazier-fiscal-online` | serviciu | 2633 | 10.25 | 0.24 | 232 | 577 | 91→2 | 8.48→48.42 | căzut 8,48→48,42 (cea mai brutală demotare de serviciu), AI 10,3/1k |
| `/servicii/eliberare-certificat-de-celibat` | serviciu | 2428 | 14 | 0.25 | 232 | 488 | 82→30 | 5.7→4.37 | AI 14,0/1k; primește 3 articole de celibat prin 301 |
| `/servicii/extras-multilingv-certificat-nastere` | serviciu | 2450 | 12.65 | 0.75 | 232 | 481 | 85→10 | 5.71→3.36 | Jaccard 0,75 cu varianta de căsătorie — cel mai mare duplicat non-locație din site |
| `/servicii/cazier-judiciar-online` | serviciu | 4650 | 21.29 |  | 232 | 402 | 95→3 | 8.78→4.96 | AI 21,3/1k — cel mai prost scor de pe site pe pagina comercială #1 ca expuneri (42,7k) |
| `/tva-9-locuinte-31-iulie-2026` | articol | 2231 | 18.83 |  | 6 | 368 | 116→0 | 5.87→7.83 | AI 18,8/1k pe 368 de clicuri; conținut fiscal care trebuie datat și verificat |
| `/servicii/eliberare-certificat-de-casatorie` | serviciu | 2670 | 14.61 | 0.32 | 232 | 341 | 68→31 | 7.33→6.34 | AI 14,6/1k; Jaccard 0,32 cu pagina de naștere (același șablon de stare civilă) |
| `/curs-valutar` | tool | 487 | 14.37 |  | 232 | 336 | 256→0 | 8.04→34.5 | 186k expuneri pe 487 de cuvinte; căzut 8,04→34,50 — pagină subțire pe cerere mare |
| `/cum-vor-arata-documentele-de-stare-civila-2025` | articol | 1005 | 19.9 |  | 3 | 324 | 70→13 | 6.06→4.4 | AI 19,9/1k pe 324 de clicuri |
| `/cat-costa-cadastrul-si-intabularea` | articol | 1577 | 18.39 |  | 6 | 170 | 71→1 | 7.45→3.81 | AI 18,4/1k, 170 clicuri / 10,8k expuneri |
| `/eliberare-certificat-constatator-onrc-ghid` | articol | 848 | 15.33 |  | 5 | 168 | 57→5 | 8.66→4.11 | 20k expuneri, 848 cuv., AI 15,3/1k; are backlink dofollow (start-up.ro) — se rescrie, nu se atinge URL-ul |
| `/servicii/extras-plan-cadastral` | serviciu | 2189 | 5.48 | 0.37 | 232 | 137 | 41→0 | 6.73→44.5 | căzută 6,73→44,50; devine pagina-umbrelă pentru releveu/plan cadastral (primește 2 articole) |
| `/servicii/certificat-de-integritate-comportamentala` | serviciu | 2573 | 13.6 | 0.24 | 232 | 86 | 6→0 | 8.28→9.17 | AI 13,6/1k, 6,6k expuneri, 0 clicuri post-update |
| `/servicii/certificat-constatator-online` | serviciu | 3156 | 11.41 |  | 232 | 78 | 14→0 | 14.32→21.21 | 3 backlinkuri dofollow pe ea, dar poziție 14,3→21,2 și AI 11,4/1k |
| `/servicii/extras-multilingv-certificat-casatorie` | serviciu | 2458 | 12.21 | 0.75 | 232 | 56 | 15→0 | 6.74→12.67 | Jaccard 0,75 cu varianta de naștere — trebuie diferențiate sau unite |
| `/servicii/copie-carte-funciara` | serviciu | 2335 | 3 | 0.33 | 232 | 41 | 7→1 | 7.95→5 | devine pagina unică „copii de documente din arhiva OCPI" (primește 8 clone de șablon prin 301) |
| `/servicii/plan-amplasament-delimitare` | serviciu | 2282 | 5.7 | 0.39 | 232 | 41 | 24→0 | 7.72→14.78 | căzută 7,72→14,78; parte din șablonul topograf (Jaccard 0,39) |
| `/servicii/actualizare-adresa-cf` | serviciu | 2311 | 6.49 | 0.28 | 232 | 40 | 27→0 | 11.14→30.19 | căzută 11,14→30,19; parte din șablonul topograf |
| `/servicii/rovinieta-online` | serviciu | 759 | 11.86 |  | 232 | 39 | 10→1 | 7.85→22.43 | singura pagină de serviciu sub 800 de cuvinte (759) la 7,6k expuneri; căzută 7,85→22,43 |
| `/cazier-fiscal-fara-spv` | articol | 1946 | 4.62 |  | 2 | 38 | 27→0 | 10.95→10 | devine ghidul unic de cazier fiscal (primește 3 articole prin 301); 1.946 cuv., AI 4,6 — bază bună |
| `/rolul-si-atributiile-onrc-romania` | articol | 645 | 3.1 |  | 3 | 17 | 8→0 | 8.58→17.64 | 30k expuneri pe 645 de cuvinte; căzut 8,58→17,64; devine ghidul-umbrelă ONRC (primește radiere/suspendare/sediu) |
| `/servicii/certificat-urbanism-informare` | serviciu | 2230 | 9.87 | 0.22 | 232 | 11 | 7→0 | 16.68→78 | căzută 16,68→78,00; are backlink money.ro — se rescrie, nu se atinge URL-ul |
| `/acte-necesare-certificat-de-nastere` | articol | 714 | 8.4 |  | 6 | 3 | 0→0 | 8.67→— | devine ghidul unic de naștere (primește 6 articole prin 301); acum 714 cuvinte |
| `/acte-necesare-casatorie` | articol | 1375 | 10.91 |  | 2 | 2 | 1→0 | 10.29→2 | devine ghidul unic de căsătorie (primește 3 articole prin 301); AI 10,9/1k |

### CONSOLIDATE — 93 pagini, 439 clicuri/3 luni

| Rută | tip | cuv. | clic 3L | expuneri 3L | 301 → | Motiv |
|---|---|---:|---:|---:|---|---|
| `/cat-poti-construi-pe-teren` | articol | 1309 | 42 | 2025 | `/calculator/cat-pot-construi` | articolul dublează calculatorul cu același subiect (AI 16,8/1k vs calculatorul care funcționează). |
| `/servicii/cazier-judiciar-online/piatra-neamt` | loc-cazier | 1375 | 26 | 537 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/extras-de-carte-funciara/bucuresti` | loc-CF | 930 | 24 | 690 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/ce-este-un-releveu` | articol | 704 | 20 | 1208 | `/servicii/extras-plan-cadastral` | articol subțire de cadastru (căzut 6,96→75,88); pagina de serviciu are 2.189 de cuvinte pe același subiect. |
| `/radiere-firma-srl-ghid` | articol | 933 | 18 | 592 | `/rolul-si-atributiile-onrc-romania` | familia „firmă/ONRC": 0–18 clicuri, fără serviciu în spate. Ținta are 30k expuneri pe 645 de cuvinte și devine ghidul-umbrelă ONRC din materialul preluat. |
| `/cazier-fiscal-persoana-fizica` | articol | 1575 | 17 | 1482 | `/cazier-fiscal-fara-spv` | familia „cazier fiscal": 4 articole subțiri, 79 de clicuri pe toate. Ținta e cea mai lungă și cea mai curată (1.946 cuv., AI 4,6) și devine ghidul unic de fiscal. |
| `/certificat-de-nastere-pentru-buletin-pasaport` | articol | 2293 | 15 | 1131 | `/acte-necesare-certificat-de-nastere` | familia „certificat de naștere": 7 articole, 38 de clicuri pe toate, în 3 luni. Devin un singur ghid real; pagina de serviciu (1.714 clicuri) rămâne separată, comercială. |
| `/servicii/cazier-judiciar-online/ramnicu-valcea` | loc-cazier | 1352 | 15 | 476 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/extras-de-carte-funciara/brasov` | loc-CF | 961 | 15 | 799 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/apostila-de-la-haga-ghid-acte-obtinere` | articol | 1194 | 14 | 1166 | `/servicii/eliberare-certificat-de-nastere` | §5.7 — 14 clicuri; se reconstruiește ca pagină de serviciu abia dacă se lansează linia de traduceri+apostilă. |
| `/duplicat-certificat-de-casatorie` | articol | 1363 | 14 | 582 | `/acte-necesare-casatorie` | familia „căsătorie": 4 articole, 17 clicuri pe toate. Se unesc într-un singur ghid. |
| `/verificare-cazier-fiscal` | articol | 1902 | 14 | 503 | `/cazier-fiscal-fara-spv` | familia „cazier fiscal": 4 articole subțiri, 79 de clicuri pe toate. Ținta e cea mai lungă și cea mai curată (1.946 cuv., AI 4,6) și devine ghidul unic de fiscal. |
| `/servicii/cazier-judiciar-online/cluj-napoca` | loc-cazier | 1359 | 11 | 755 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/cazier-fiscal-firma` | articol | 1982 | 10 | 770 | `/cazier-fiscal-fara-spv` | familia „cazier fiscal": 4 articole subțiri, 79 de clicuri pe toate. Ținta e cea mai lungă și cea mai curată (1.946 cuv., AI 4,6) și devine ghidul unic de fiscal. |
| `/servicii/cazier-judiciar-online/focsani` | loc-cazier | 1333 | 10 | 672 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/cazier-judiciar-online/timisoara` | loc-cazier | 1364 | 9 | 697 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/extras-de-carte-funciara/braila` | loc-CF | 735 | 9 | 277 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/satu-mare` | loc-CF | 764 | 9 | 274 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/duplicat-certificat-de-nastere` | articol | 1348 | 8 | 382 | `/acte-necesare-certificat-de-nastere` | familia „certificat de naștere": 7 articole, 38 de clicuri pe toate, în 3 luni. Devin un singur ghid real; pagina de serviciu (1.714 clicuri) rămâne separată, comercială. |
| `/servicii/cazier-judiciar-online/persoana-fizica` | serviciu | 2188 | 8 | 667 | `/servicii/cazier-judiciar-online` | sub-pagină derivată din pagina-mamă, Jaccard 0,44 între ele, 9 clicuri combinat. §5.3. |
| `/extras-de-carte-funciara-pentru-casa-verde` | articol | 1114 | 7 | 496 | `/servicii/extras-de-carte-funciara` | articol de nișă cu 7 clicuri; pagina de serviciu acoperă intenția. |
| `/servicii/cazier-judiciar-online/constanta` | loc-cazier | 1373 | 6 | 778 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/cazier-judiciar-online/iasi` | loc-cazier | 1375 | 6 | 510 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/extras-de-carte-funciara/cluj` | loc-CF | 944 | 6 | 502 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/tulcea` | loc-CF | 736 | 6 | 97 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/valabilitate-certificat-de-celibat` | articol | 1657 | 6 | 92 | `/servicii/eliberare-certificat-de-celibat` | familia „celibat": 3 articole, 9 clicuri pe toate. Pagina de serviciu (488 de clicuri, 2.428 de cuvinte) acoperă deja intenția. |
| `/certificat-de-nastere-din-strainatate` | articol | 1382 | 5 | 317 | `/acte-necesare-certificat-de-nastere` | familia „certificat de naștere": 7 articole, 38 de clicuri pe toate, în 3 luni. Devin un singur ghid real; pagina de serviciu (1.714 clicuri) rămâne separată, comercială. |
| `/servicii/cazier-judiciar-online/satu-mare` | loc-cazier | 1382 | 5 | 290 | `/servicii/cazier-judiciar-online` | set de locație cazier/oraș: granularitate greșită (IPJ e per județ), 0,72 Jaccard, 75,7% boilerplate. Decizie pe set — §6.1. |
| `/servicii/extras-de-carte-funciara/arad` | loc-CF | 747 | 5 | 108 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/ilfov` | loc-CF | 919 | 5 | 77 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/ce-este-planul-cadastral` | articol | 626 | 4 | 215 | `/servicii/extras-plan-cadastral` | articol subțire de cadastru (căzut 6,96→75,88); pagina de serviciu are 2.189 de cuvinte pe același subiect. |
| `/certificat-de-nastere-pierdut` | articol | 1277 | 4 | 365 | `/acte-necesare-certificat-de-nastere` | familia „certificat de naștere": 7 articole, 38 de clicuri pe toate, în 3 luni. Devin un singur ghid real; pagina de serviciu (1.714 clicuri) rămâne separată, comercială. |
| `/servicii/copie-releveu` | serviciu | 2231 | 4 | 143 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/extras-de-carte-funciara/dolj` | loc-CF | 929 | 4 | 129 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/copie-arhiva-ocpi` | serviciu | 2347 | 3 | 115 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/copie-inventar-coordonate` | serviciu | 2308 | 3 | 68 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/extras-de-carte-funciara/constanta` | loc-CF | 954 | 3 | 152 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/maramures` | loc-CF | 737 | 3 | 40 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/valcea` | loc-CF | 741 | 3 | 96 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/transcriere-certificat-de-nastere` | articol | 1283 | 3 | 97 | `/acte-necesare-certificat-de-nastere` | familia „certificat de naștere": 7 articole, 38 de clicuri pe toate, în 3 luni. Devin un singur ghid real; pagina de serviciu (1.714 clicuri) rămâne separată, comercială. |
| `/certificat-constatator-cu-istoric` | articol | 810 | 2 | 230 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-constatator-pentru-banca` | articol | 1533 | 2 | 64 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-constatator-pentru-licitatie` | articol | 1248 | 2 | 27 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-de-celibat` | articol | 1455 | 2 | 104 | `/servicii/eliberare-certificat-de-celibat` | familia „celibat": 3 articole, 9 clicuri pe toate. Pagina de serviciu (488 de clicuri, 2.428 de cuvinte) acoperă deja intenția. |
| `/servicii/certificat-detineri-imobile` | serviciu | 2429 | 2 | 197 | `/servicii/identificare-imobile-proprietar` | clonă de șablon topograf; 2 clicuri în 3 luni. ⚠️ §5.2. |
| `/servicii/copie-contract-vanzare` | serviciu | 2246 | 2 | 97 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/copie-intabulare` | serviciu | 2310 | 2 | 58 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/copie-plan-cadastral` | serviciu | 2227 | 2 | 36 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/extras-cf-colectiv` | serviciu | 2316 | 2 | 39 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/extras-de-carte-funciara/alba` | loc-CF | 747 | 2 | 39 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/bistrita-nasaud` | loc-CF | 736 | 2 | 126 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/giurgiu` | loc-CF | 742 | 2 | 60 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/neamt` | loc-CF | 738 | 2 | 23 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/sibiu` | loc-CF | 950 | 2 | 130 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/suceava` | loc-CF | 944 | 2 | 18 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/certificat-de-celibat-pentru-casatorie-in-strainatate` | articol | 1574 | 1 | 77 | `/servicii/eliberare-certificat-de-celibat` | familia „celibat": 3 articole, 9 clicuri pe toate. Pagina de serviciu (488 de clicuri, 2.428 de cuvinte) acoperă deja intenția. |
| `/model-certificat-de-casatorie` | articol | 560 | 1 | 84 | `/acte-necesare-casatorie` | familia „căsătorie": 4 articole, 17 clicuri pe toate. Se unesc într-un singur ghid. |
| `/servicii/cazier-judiciar-online/persoana-juridica` | serviciu | 2160 | 1 | 496 | `/servicii/cazier-judiciar-online` | sub-pagină derivată din pagina-mamă, Jaccard 0,44 între ele, 9 clicuri combinat. §5.3. |
| `/servicii/extras-de-carte-funciara/buzau` | loc-CF | 745 | 1 | 38 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/covasna` | loc-CF | 748 | 1 | 22 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/iasi` | loc-CF | 951 | 1 | 100 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/olt` | loc-CF | 742 | 1 | 22 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/prahova` | loc-CF | 915 | 1 | 47 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/salaj` | loc-CF | 742 | 1 | 44 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/vrancea` | loc-CF | 746 | 1 | 27 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/cazier-judiciar-online-gratuit` | articol | 1513 | 0 | 0 | `/servicii/cazier-judiciar-online` | zero expuneri în 3 luni. ⚠️ §5.6 — pagina-țintă trebuie să spună explicit ce e gratuit și ce vindem noi. |
| `/certificat-constatator-de-baza` | articol | 989 | 0 | 0 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-constatator-insolventa` | articol | 889 | 0 | 0 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-constatator-pentru-fonduri-europene` | articol | 1391 | 0 | 57 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-constatator-pentru-notar` | articol | 1420 | 0 | 30 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/certificat-constatator-pfa` | articol | 863 | 0 | 0 | `/cele-4-tipuri-de-certificat-constatator-online` | familia „certificat constatator": 8 articole satelit, 6 clicuri pe toate, în 3 luni; 4 din ele cu ZERO expuneri. Ținta are 479 de clicuri + backlink. Vezi §5.1 — conținutul bun se mută, nu se aruncă. |
| `/inregistrare-nastere-copil-nou-nascut` | articol | 1447 | 0 | 40 | `/acte-necesare-certificat-de-nastere` | familia „certificat de naștere": 7 articole, 38 de clicuri pe toate, în 3 luni. Devin un singur ghid real; pagina de serviciu (1.714 clicuri) rămâne separată, comercială. |
| `/schimbare-sediu-social-srl-ghid` | articol | 842 | 0 | 0 | `/rolul-si-atributiile-onrc-romania` | familia „firmă/ONRC": 0–18 clicuri, fără serviciu în spate. Ținta are 30k expuneri pe 645 de cuvinte și devine ghidul-umbrelă ONRC din materialul preluat. |
| `/servicii/copie-plan-incadrare` | serviciu | 2203 | 0 | 59 | `/servicii/copie-carte-funciara` | clonă de șablon topograf/OCPI (Jaccard 0,29–0,39): 9 pagini, 20 de clicuri pe toate. ⚠️ §5.2 — cere confirmare Raul/Mircea înainte de execuție. |
| `/servicii/extras-de-carte-funciara/arges` | loc-CF | 924 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/bacau` | loc-CF | 737 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/bihor` | loc-CF | 937 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/botosani` | loc-CF | 735 | 0 | 27 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/calarasi` | loc-CF | 744 | 0 | 22 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/caras-severin` | loc-CF | 746 | 0 | 15 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/dambovita` | loc-CF | 747 | 0 | 55 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/galati` | loc-CF | 935 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/gorj` | loc-CF | 736 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/harghita` | loc-CF | 737 | 0 | 13 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/hunedoara` | loc-CF | 740 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/ialomita` | loc-CF | 741 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/mehedinti` | loc-CF | 743 | 0 | 17 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/mures` | loc-CF | 946 | 0 | 83 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/teleorman` | loc-CF | 734 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/timis` | loc-CF | 938 | 0 | 84 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/servicii/extras-de-carte-funciara/vaslui` | loc-CF | 735 | 0 | 0 | `/servicii/extras-de-carte-funciara` | set de locație CF/județ: 43% din pagină identică pe toate 42, AI 12–22/1k, 111 clicuri pe tot setul în 3 luni. Decizie pe set — §6.2. |
| `/suspendare-activitate-firma-ghid` | articol | 717 | 0 | 0 | `/rolul-si-atributiile-onrc-romania` | familia „firmă/ONRC": 0–18 clicuri, fără serviciu în spate. Ținta are 30k expuneri pe 645 de cuvinte și devine ghidul-umbrelă ONRC din materialul preluat. |
| `/transcriere-certificat-de-casatorie` | articol | 711 | 0 | 0 | `/acte-necesare-casatorie` | familia „căsătorie": 4 articole, 17 clicuri pe toate. Se unesc într-un singur ghid. |
---

## 5. Cazuri de judecat de om

Cele de mai jos sunt deciziile pe care **nu le pot lua eu singur din date**. Fiecare are
o recomandare, dar și motivul pentru care e discutabilă. Restul listei e mecanică.

### 5.1 Cele 8 articole „certificat constatator" rescrise pe 24.08 — și propuse acum pentru 301

`/certificat-constatator-de-baza`, `/certificat-constatator-pfa`,
`/certificat-constatator-insolventa`, `/certificat-constatator-cu-istoric`,
`/certificat-constatator-pentru-banca`, `/certificat-constatator-pentru-licitatie`,
`/certificat-constatator-pentru-notar`, `/certificat-constatator-pentru-fonduri-europene`.

**Datele:** 6 clicuri pe toate 8, în trei luni. Patru au **zero expuneri**. Scorurile AI au
fost curățate impecabil pe 24.08 (`cu-istoric` 25,1→3,7; `pfa` 22,8→7,0; `de-baza` 21,3→4,0;
`insolventa` 19,2→1,1) — și **n-a urmat nimic**: tot zero expuneri.

**Tensiunea:** cineva tocmai a plătit costul rescrierii lor. Le 301-ui acum înseamnă să
arunci munca aia. **Contraargumentul, mai tare:** rescrierea a demonstrat exact ce trebuia
demonstrat — nu textul era problema, ci existența a 8 pagini satelit pentru un subiect care
are deja o pagină cu 479 de clicuri (`/cele-4-tipuri-de-certificat-constatator-online`,
71k expuneri, cu backlink de la startupcafe.ro) și o pagină de serviciu cu 3 backlinkuri.
Munca de rescriere nu se pierde: **secțiunile bune se mută în ghidul celor 4 tipuri**,
care devine mai adânc, apoi se face 301.

**Recomandare: CONSOLIDATE, dar cu migrarea conținutului, nu cu ștergerea lui.**

### 5.2 Cele 8 clone de șablon topograf/OCPI — atinge o linie de business vie

`/servicii/copie-plan-cadastral`, `copie-plan-incadrare`, `copie-releveu`,
`copie-inventar-coordonate`, `copie-intabulare`, `copie-contract-vanzare`,
`copie-arhiva-ocpi`, `extras-cf-colectiv` (+ `certificat-detineri-imobile`).

**Datele:** ~2.300 de cuvinte fiecare, un singur șablon (Jaccard 0,29–0,39 între ele),
**20 de clicuri pe toate 9, în trei luni**.

**Tensiunea:** astea nu-s articole de content marketing, sunt **pagini de vânzare pentru
serviciile colaboratorului topograf**, o linie de venit activă cu decont lunar. A le comasa
înseamnă a reduce numărul de pagini de intrare ale unui business real, pe baza unui trafic
organic care oricum e zero. Comanda propriu-zisă merge pe `/comanda/<slug>`, deci fluxul de
comandă **nu se rupe** dacă pagina consolidată păstrează un CTA per tip de document — dar
orice link extern, ofertă sau QR care trimite direct la un `/servicii/copie-*` trebuie
inventariat înainte.

**Recomandare: CONSOLIDATE într-o singură pagină „copii de documente din arhiva OCPI"
(`/servicii/copie-carte-funciara`), cu secțiune + buton de comandă per document — dar
NUMAI după confirmarea lui Raul și a lui Mircea că nu există trafic offline/direct pe
URL-urile individuale.** Dacă există, alternativa e `noindex, follow` pe cele 8 (dispar din
amprentă, rămân accesibile), nu 301.

### 5.3 `/servicii/cazier-judiciar-online/persoana-fizica` și `/persoana-juridica`

9 clicuri combinat, Jaccard 0,44 între ele și ambele derivate din pagina-mamă. Mecanic:
consolidare clară. **Tensiunea:** sunt cele mai vechi pagini de pe site (05.01.2026) și
sunt candidatele naturale pentru landing page de Ads pe segmentul PJ, dacă se deblochează
contul. **Recomandare: CONSOLIDATE acum** (Ads e blocat oricum, iar când se deblochează,
landing page-ul de Ads n-are nevoie să fie indexabil). De revizuit dacă apare o campanie PJ.

### 5.4 `/curs-valutar` — 186.503 de expuneri pe 487 de cuvinte

E a doua pagină ca expuneri de pe site și e **în afara subiectului**: o platformă de
documente oficiale nu are motiv evident de existență pe „curs valutar". A căzut 8,04→34,50.
**Tensiunea:** 336 de clicuri e trafic real, iar tăierea unei pagini cu 186k expuneri pare
absurdă. **Contraargument:** relevanța tematică e chiar unul dintre lucrurile pe care le
evaluează clasificarea pe cluster; 487 de cuvinte pe un subiect ultra-competitiv e definiția
de „lățime fără adâncime". **Recomandare: REWRITE (a rămas în REWRITE), dar dacă la
următoarele două refresh-uri nu-și revine, e primul candidat la scoatere din index** — nu
pentru că e slabă, ci pentru că e străină de subiectul site-ului.

### 5.5 `/tools/verificare-rovinieta-online` — cel mai mare activ, cea mai mare cădere

32.589 de clicuri în 3 luni → **41 în ultimele 17 zile**. Poziția 5,95→31,92. Are doar 871 de
cuvinte în jurul tool-ului. **Tensiunea:** e singurul tool care a fost demolat, în timp ce
calculatoarele au supraviețuit — ceea ce sugerează că problema nu e „tool", ci contextul
(pagina de rovinietă e și cea mai apropiată de zona comercială blocată și de politica Google
Ads pe „documente de stat"). **Recomandare: REWRITE prioritar**, dar tratat ca experiment:
e cel mai bun test izolat pe care îl avem — un singur URL, cerere uriașă și constantă,
rezultat vizibil în expuneri în câteva săptămâni.

### 5.6 `/cazier-judiciar-online-gratuit`

Zero expuneri în trei luni, 1.513 cuvinte. Mecanic: dispare. **Tensiunea:** interogarea
„cazier judiciar online gratuit" există și e mare; pagina o vizează, dar Google n-a servit-o
niciodată. Un 301 către pagina de serviciu (plătită) pe o intenție „gratuit" e fix genul de
nepotrivire care produce nemulțumire. **Recomandare: CONSOLIDATE**, dar cu obligația ca
pagina-țintă să spună explicit, sus, care e varianta gratuită (ghișeu/ghiseul.ro) și ce
vindem noi. Altfel e mai onest un `noindex`.

### 5.7 `/apostila-de-la-haga-ghid-acte-obtinere`

14 clicuri, 1.166 expuneri, AI 10,1/1k → mecanic, consolidare. **Tensiunea:** există un
serviciu de traduceri + apostilă în analiză
([`docs/serviciu-traduceri-apostile/`](../../../serviciu-traduceri-apostile/)). Dacă serviciul se lansează, articolul e
fundația clusterului. **Recomandare: CONSOLIDATE acum** (pagina nu produce nimic și adaugă
la amprentă), cu nota că, la lansarea serviciului, se construiește o pagină de serviciu
adevărată — nu se reînvie articolul.

### 5.8 Cele 9 calculatoare sub 20 de clicuri

`grad-indatorare` (1), `concediu-paternal` (4), `inflatie` (6), `valabilitate-documente` (6),
`rambursare-anticipata` (9), `zile-concediu-odihna` (15), `spor-salarial` (17),
`penalitati-anaf` (17), `diurna` (17). Regula spune CONSOLIDATE; eu spun **KEEP**.
**Motivul:** clusterul de calculatoare e singurul semnal pozitiv rămas pe domeniu, are
0 propoziții identice între pagini și fiecare calculator e un instrument funcțional, nu text
reciclat — adică fix opusul definiției de „scaled content". Riscul de a slăbi singurul
cluster sănătos e mai mare decât câștigul din 9 pagini. **Dar e o judecată, nu o măsurătoare
— dacă la următorul refresh calculatoarele încep și ele să cadă, decizia asta se reevaluează
prima.**

### 5.9 Ce lipsește complet și nu apare ca verdict: paginile de încredere

Nu e o decizie de tăiere, dar iese din aceleași date: site-ul **nu are pagină „Despre noi",
nu are pagini de autor, nu are bylines** (auditul din [`05-inventar-si-footprint-site.md`](05-inventar-si-footprint-site.md) §1.3), în
timp ce 30 de pagini declară în JSON-LD un `Person` numit „Departamentul Juridic eGhișeul.ro"
care nu există nicăieri pe site, iar toate cele 31 de pagini de serviciu poartă **același
`aggregateRating` 4,9/457**. Pe un site clasificat drept conținut la scară, semnalele astea
sunt exact în direcția greșită. **Acțiune recomandată în paralel cu lista de mai sus:**
pagină Despre noi + echipă reală + autori reali pe articole; `aggregateRating` identic pe
31 de pagini — ori se dovedește cu recenzii reale, ori se scoate.

---

## 6. Seturile de pagini de locație — o singură decizie per set

### 6.1 Setul cazier judiciar / oraș — 48 de pagini (8 indexabile + 40 `noindex`)

| Măsură | Valoare | Sursă |
|---|---|---|
| Pagini construite | 48 (din 48 de orașe planificate) | `src/lib/seo/locations/cities.ts` |
| Indexabile | **8** (restul de 40 puse pe `noindex` la 28.07, după ce GSC a arătat că nu erau indexate) | crawl |
| Clicuri, 3 luni, cele 8 indexabile | **88** (media 11/pagină) | GSC |
| Clicuri, 3 luni, cele 40 `noindex` | **0** (și 0 expuneri) | GSC |
| Clicuri în ultimele 17 zile, tot setul | **1** | GSC compare |
| Cea mai bună pagină | `piatra-neamt`, 26 de clicuri | GSC |
| Jaccard median între ele (mascat pe nume de oraș) | **0,72** | [`data/05-similaritate-seturi.json`](data/05-similaritate-seturi.json) |
| Propoziții identice pe TOATE cele 48 | 33 (= 522 de cuvinte, 37,6% din pagina mediană) | idem |
| Boilerplate median | **75,7%** | [`data/06-boilerplate.json`](data/06-boilerplate.json) |
| Scor AI | 15,9–17,6/1k (prag de acțiune: 10) | [`data/06-pages.csv`](data/06-pages.csv) |

**Decizie recomandată: CONSOLIDATE tot setul — 301 pe toate 48 către
`/servicii/cazier-judiciar-online/`.**

Trei motive, în ordinea greutății:

1. **Granularitatea e greșită la nivel instituțional.** Cazierul judiciar se eliberează
   de IPJ — **o instituție per JUDEȚ**, nu per oraș. Nu există date locale reale la nivel
   de oraș (adresă, program, taxe) care să diferențieze `lugoj` de `turda`; de-aia
   propozițiile identice pe toate 48 acoperă 37,6% din pagină. E constatarea centrală și
   din cercetarea externă ([`03-pagini-locatie-programmatic.md`](03-pagini-locatie-programmatic.md)).
2. **Google a votat deja.** 40 din 48 n-au fost indexate niciodată — de-aia au primit
   `noindex` pe 28.07. Un set în care 83% din pagini sunt refuzate de index nu e un set
   care „mai are nevoie de puțină muncă".
3. **Nu există argument comercial.** 88 de clicuri în trei luni, 1 în ultimele 17 zile.

⚠️ **Nuanță față de recomandarea din [`03-pagini-locatie-programmatic.md`](03-pagini-locatie-programmatic.md) („rebuild, nu
delete").** Nu e o contrazicere, e o secvențiere. Cercetarea are dreptate că modelul
județean poate fi defensibil (IPJ = date reale per județ, exact ca OCPI). Dar reconstrucția
a 42 de pagini de județ, cu date reale verificate, e muncă de săptămâni pe un set care a
produs 88 de clicuri. **Ordinea corectă: întâi scoți amprenta actuală (301), apoi, DUPĂ ce
recuperarea e dovedită pe clusterul comercial, construiești eventual 5–10 pagini de județ
adevărate, ca test.** Nu 42 dintr-un foc — asta ar repeta exact greșeala care ne-a adus aici
(196 de pagini în 12 zile).

**Cele 40 de pagini `noindex` nu sunt în tabelul din §4** (nu-s indexabile), dar rămân live
și crawlabile, deci rămân în amprentă. Intră în același 301. Sunt: `alba-iulia, alexandria,
arad, bacau, baia-mare, barlad, bistrita, botosani, brasov, braila, bucuresti, buzau,
calarasi, craiova, deva, drobeta-turnu-severin, galati, giurgiu, ilfov, lugoj, medias,
miercurea-ciuc, onesti, oradea, pitesti, ploiesti, resita, sebes, sfantu-gheorghe, sibiu,
slatina, slobozia, suceava, targoviste, targu-jiu, targu-mures, tulcea, turda, vaslui, zalau`
— toate cu 0 clicuri și 0 expuneri în trei luni.

### 6.2 Setul extras de carte funciară / județ — 42 de pagini, toate indexabile

| Măsură | Valoare |
|---|---|
| Clicuri, 3 luni | **111** (media 2,6/pagină) |
| Clicuri în ultimele 17 zile | **1** (față de 38 în cele 17 zile dinainte) |
| Pagini cu 0 clicuri | **17 din 42** |
| Pagini cu 0 expuneri | **9 din 42** |
| Cea mai bună pagină | `bucuresti`, 24 de clicuri |
| Cuvinte | mediană 746; **27 din 42 sub 800** |
| Jaccard median (mascat pe județ) | **0,71**; 25 de propoziții identice pe toate 42 = 43% din pagina mediană |
| Scor AI | **12,0–22,5/1k** (mediană peste dublul pragului) |

**Decizie recomandată: CONSOLIDATE tot setul — 301 pe toate 42 către
`/servicii/extras-de-carte-funciara/`.**

Acesta e setul **mai greu de tăiat**, și merită spus de ce, cinstit. Spre deosebire de
cazier, aici granularitatea e **corectă**: OCPI/BCPI chiar e o instituție per județ, deci
paginile ar putea fi umplute cu date genuine (adresă, program, tarife, termene reale de
eliberare). Cercetarea externă recomandă rebuild, nu ștergere, și argumentul e valid.

**Dar datele spun altceva despre momentul de față:** deși granularitatea e bună, textul din
jur nu e — 43% din pagina mediană e identică pe toate 42, scorul AI e 12–22/1k, iar 27 din
42 sunt sub 800 de cuvinte. Adică setul are structura potrivită și conținutul greșit, ceea
ce, în definiția Google, e tot „little to no value". Iar prețul păstrării e 42 de pagini de
amprentă pentru **111 clicuri în trei luni (0,06% din trafic)**, pe un domeniu care e în
acest moment clasificat greșit și are nevoie să-și **reducă** suprafața de conținut generat
la scară, nu s-o justifice.

**Recomandarea operațională, în doi timpi:**

1. **Acum:** 301 pe toate 42 către pagina-mamă de CF. Scoate 42 de pagini din amprentă
   pentru un cost de 111 clicuri.
2. **După primul semn de recuperare** (expuneri în creștere pe clusterul `/servicii/`):
   reconstruiește **5 județe**, cu date OCPI reale și verificabile — Cluj, Timiș, Iași,
   Constanța, Brașov (cele cu cele mai multe expuneri istorice) — și măsoară-le 8 săptămâni
   înainte de a scrie a șasea. Dacă cele 5 nu produc, setul nu se mai reconstruiește.

**Alternativa, dacă Raul preferă să nu piardă structura:** `noindex, follow` pe toate 42 în
loc de 301. Scoate amprenta din index la fel de eficient, păstrează URL-urile și linkurile
interne, și e reversibil într-o zi. Costă un pas în plus (paginile rămân crawlabile, deci
rămân în bugetul de crawl) dar e decizia mai puțin ireversibilă. **Dacă ezitatul e real,
asta e varianta de ales — nu păstrarea în index.**

---

## 7. Ordinea de execuție

Lista de mai sus nu se execută în ordinea din tabel. Ordinea corectă e după
raportul efort/risc, pentru că refresh-urile SpamBrain vin la câteva săptămâni și
**vrei ca prima re-evaluare să prindă amprenta deja curățată**.

**Faza 0 — o zi de lucru, risc aproape zero (0,23% din clicuri):**
cele 93 de 301-uri din §4 + cele 40 de pagini de oraș pe `noindex` (§6.1). Apoi:
scoate din `sitemap.xml` tot ce a fost consolidat, scoate linkurile interne către
URL-urile dispărute (altfel rămân 14 inlinkuri per pagină de CF care duc în 301),
și pune `noindex` pe cele 6 PDF-uri de contract din `/wp-content/uploads/` (§1.2).
Asta taie **48,7% din amprenta indexabilă** într-o singură zi.

**Faza 1 — rescrierile care contează**, în ordinea cererii măsurate, nu a scorului AI:

| # | Pagina | De ce prima |
|---|---|---|
| 1 | `/tools/verificare-rovinieta-online` | 32.589 → 41 de clicuri; 871 de cuvinte; cel mai bun test izolat de recuperare (§5.5) |
| 2 | `/` (homepage) | 9,27→23,91; e și locul unde se montează semnalele de încredere din §5.9 |
| 3 | `/cum-aflam-numarul-carte-functionara-si-nr-cadastral` | 4.041 de clicuri cu AI 13,3/1k — cel mai valoros articol netratat |
| 4 | `/servicii/cazier-judiciar-online` | AI 21,3/1k (cel mai prost scor de pe site) pe pagina comercială cu cele mai multe expuneri |
| 5 | `/servicii/extras-de-carte-funciara` + `/servicii/cazier-fiscal-online` | cele două căderi de poziție cele mai mari dintre servicii (→22,3 și →48,4); ambele au backlinkuri |
| 6 | `/amenda-rovinieta-2025-…-ghid-complet` | AI 20,0/1k pe 79k expuneri |

**Faza 2 — semnalele de încredere** (§5.9). Nu-s în tabel fiindcă nu-s decizii de tăiere,
dar sunt singura parte din plan care schimbă *categoria* site-ului, nu doar textul:
Despre noi + echipă + autori reali + `aggregateRating` dovedit sau scos.

**Faza 3 — restul REWRITE și KEEP + FIX**, maximum 1–2 pagini pe săptămână. Cadența
contează: 196 de pagini publicate în 12 zile e tiparul care ne-a adus aici.

**Cum măsori dacă merge.** Nu clicurile — **expunerile pe clusterul `/servicii/`**, zilnic
în GSC (au fost 5.658/zi pe 20.08 → 99–172/zi de la 23.08, plat). Primul semn de recuperare
e o creștere a expunerilor, cu câteva săptămâni înainte de clicuri. Pozițiile se verifică
DOAR în SERP real cu `&pws=0`, pe interogări-țintă fixe — poziția medie din GSC se mișcă
din compoziție când dispare coada lungă și te minte în ambele direcții.

---

## 8. Verificările de sanitate (rulate, nu declarate)

| Verificare | Rezultat |
|---|---|
| Vreo pagină cu backlink cunoscut propusă pentru DELETE sau CONSOLIDATE? | **0** — toate cele 9 URL-uri cu backlink sunt KEEP, KEEP + FIX sau REWRITE |
| Vreo pagină cu ≥100 de clicuri/3 luni propusă pentru dispariție? | **0** — maximul dintre cele consolidate e 26 de clicuri |
| Vreo pagină apare de două ori în tabel? | **0** — 37 + 29 + 32 + 93 = 191 = numărul de pagini indexabile din crawl |
| Vreun 301 către homepage? | **0** — toate țintele sunt pagini cu aceeași intenție |
| Suma clicurilor din tabel vs total GSC | 190.774 din 190.815 (diferența de 41 = URL-urile legacy necrawlate din §1.2) |

---

## Fișiere

- [`data/decizii-per-pagina.csv`](data/decizii-per-pagina.csv) — tabelul complet, 191 de rânduri, 28 de coloane
  (inclusiv `regula_mecanica`, ca să se vadă unde judecata a bătut regula)
- [`data/05-perechi-similare.csv`](data/05-perechi-similare.csv), [`data/05-inventar-pagini.csv`](data/05-inventar-pagini.csv),
  [`data/06-pages.csv`](data/06-pages.csv) — sursele de similaritate, cuvinte și scor AI
- [`../gsc/`](../gsc/) — exporturile GSC brute
- [`../../../EXPORT SCREAMINGFROG/internal_all.csv`](../../../EXPORT%20SCREAMINGFROG/internal_all.csv) — crawl-ul

---

**Data:** 2026-09-09 · **Universul:** 191 de URL-uri indexabile (crawl Screaming Frog 09.09) ·
**Fereastra de performanță:** 07.06→06.09.2026 (3 luni) și 01–17.08 vs 23.08–08.09 (ferestre egale de 17 zile)
