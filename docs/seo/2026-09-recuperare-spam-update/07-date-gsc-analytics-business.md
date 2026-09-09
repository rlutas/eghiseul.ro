# Datele reale: GSC + GA4 + comenzi (export 2026-09-09)

Toate cifrele de mai jos sunt măsurate, nu estimate. Sursele brute sunt în
`gsc/` (exporturi CSV din Search Console, proprietatea **`https://eghiseul.ro/`**
de pe contul `serviciiseonethut@gmail.com`, `/u/1/`) și în DB-ul de producție.

- `gsc/full-3luni/` — 07.06 → 06.09.2026, site întreg
- `gsc/compare-post-vs-pre/` — **23.08–08.09** vs **01–17.08** (ferestre egale, 17 zile)

---

## 1. Cât am pierdut, exact

| | 01–17.08 (înainte) | 23.08–08.09 (după) | Δ |
|---|---|---|---|
| Clicuri | 54.414 | 11.703 | **−78%** |
| Expuneri | 1.959.562 | 74.405 | **−96%** |
| CTR | 2,8% | 16,3% | +13,5 pp |
| Poziție medie | 6,2 | 5,0 | −1,2 |

CTR-ul „îmbunătățit" și poziția „mai bună" sunt un artefact: a dispărut coada
lungă de expuneri (unde stăteam pe locul 10–30), au rămas doar interogările pe
care stăteam deja pe locul 1–3.

### Pe tipuri de pagină (aceleași două ferestre)

| Tip | Pagini | Clicuri înainte | Clicuri după | Δ | Expuneri înainte | Expuneri după | Δ |
|---|---:|---:|---:|---:|---:|---:|---:|
| calculator | 44 | 23.926 | 10.159 | −58% | 738.111 | 55.423 | −92% |
| articole | 68 | 21.932 | 1.084 | **−95%** | 936.039 | 12.346 | −99% |
| tools (rovinietă) | 1 | 5.714 | 41 | **−99%** | 163.660 | 259 | −100% |
| **pagini de serviciu** | 30 | 2.076 | 195 | **−91%** | 82.919 | 2.304 | −97% |
| homepage | 1 | 540 | 216 | −60% | 28.703 | 3.291 | −89% |
| pagini de locație | 43 | 59 | 8 | −86% | 2.632 | 439 | −83% |

---

## 2. Ce a supraviețuit: DOAR calculatoarele + brandul

Interogările cu peste 20 de clicuri în fereastra de după sunt, fără excepție,
calculatoare de pensii/impozite/indemnizații — plus `eghiseul.ro` (brand).
Pozițiile lor sunt neschimbate sau mai bune:

| Interogare | Clic înainte | Clic după | Poz. înainte | Poz. după |
|---|---:|---:|---:|---:|
| calcul varsta pensionare legea noua | 555 | **1.405** | 2,33 | 2,03 |
| impozit auto 2026 | 1.156 | 917 | 2,00 | 2,02 |
| calculator impozit auto 2026 | 353 | 590 | 2,02 | 1,64 |
| calculator varsta pensionare | 353 | 466 | 2,18 | 2,18 |
| calculator indemnizatie crestere copil 2026 | 187 | 261 | 2,00 | 1,15 |
| eghiseul.ro (brand) | 101 | 157 | 1,03 | 1,06 |

**Concluzie 1: NU e o demotare uniformă de domeniu.** Dacă ar fi fost, ar fi
căzut și calculatoarele. Clasificarea lovește anumite clustere, nu tot site-ul.

---

## 3. ⚠️ Corecție importantă: o parte din pierdere NU e update-ul

Cea mai mare pierdere individuală de expuneri e articolul
`/ancpi-nu-functioneaza/`: **566.789 → 527**. Dar interogările lui
(`ancpi`, `ancpi functioneaza`, `eterra`, `geoportal ancpi`, `epay ancpi`)
erau generate de **avaria ANCPI** din 13 iulie. Portalul a repornit etapizat pe
11–12 august → **cererea în sine a dispărut**, nu poziția noastră
(pe `ancpi` poziția chiar s-a îmbunătățit, 6,74 → 4,71).

La fel, o parte din calculatoare are sezonalitate.

Deci pierderea de 1,9 milioane de expuneri e un amestec de:
- (a) **demotare algoritmică reală** — verificabilă prin căderea poziției;
- (b) **dispariția cererii** (povestea ANCPI s-a încheiat).

### Pagini cu demotare REALĂ (poziția a căzut ≥3 locuri, expuneri înainte >1.000)

Doar **20 de pagini** din 189 se califică:

| Pagina | Tip | Poz. înainte | Poz. după |
|---|---|---:|---:|
| /calculator/taxe-notariale/ | calculator | 7,84 | 64,84 |
| /servicii/cazier-fiscal-online/ | serviciu | 8,48 | 48,42 |
| /servicii/extras-plan-cadastral/ | serviciu | 6,73 | 44,50 |
| /curs-valutar/ | articol | 8,04 | 34,50 |
| /tools/verificare-rovinieta-online/ | tool | 5,95 | 31,92 |
| /calculator/contributii-pfa/ | calculator | 5,80 | 22,60 |
| **/** (homepage) | homepage | 9,27 | 23,91 |
| /servicii/extras-de-carte-funciara/ | serviciu | 7,84 | 22,32 |
| /calculator/impozit-chirie/ | calculator | 4,99 | 16,72 |
| /rolul-si-atributiile-onrc-romania/ | articol | 8,58 | 17,64 |
| /amenda-rovinieta-2025-…-ghid-complet/ | articol | 5,69 | 13,40 |
| /servicii/plan-amplasament-delimitare/ | serviciu | 7,72 | 14,78 |
| /cazier-judiciar-vs-certificat-integritate…/ | articol | 7,42 | 14,42 |
| /servicii/certificat-constatator-online/ | serviciu | 14,32 | 21,21 |
| /calculator/termene-judiciare/ | calculator | 3,65 | 9,48 |
| /calculator/salariu/ | calculator | 6,58 | 9,77 |
| (+ încă 4 calculatoare) | | | |

Repartiție: **9 calculatoare, 5 pagini de serviciu, 4 articole, 1 tool, homepage**.
În paralel, **39 de pagini și-au păstrat sau îmbunătățit poziția** (18 calculatoare,
16 articole, 5 servicii).

⚠️ Avertisment metodologic: „poziția medie" e mediată pe interogările servite.
Când dispare coada lungă, media se mișcă din compoziție, nu neapărat din
demotare. Tabelul de mai sus e un indiciu puternic, nu o dovadă per pagină.
Verificarea fermă se face în SERP real cu `&pws=0`, pe interogări-țintă fixe.

---

## 4. Cifra care decide soarta paginilor de locație

Pe **3 luni** (07.06 → 06.09), reparția clicurilor pe tipuri de pagină:

| Tip | Pagini | Clicuri | % din total | Clicuri / pagină |
|---|---:|---:|---:|---:|
| calculator | 45 | 103.486 | 54,2% | 2.300 |
| articole | 88 | 41.836 | 21,9% | 475 |
| tools | 3 | 32.590 | 17,1% | 10.863 |
| pagini de serviciu | 34 | 8.128 | 4,3% | 239 |
| homepage | 1 | 4.567 | 2,4% | 4.567 |
| **pagini de locație** | **43** | **208** | **0,1%** | **5** |

**43 de pagini de locație au produs 208 clicuri în TREI LUNI.** Cea mai bună
(`/servicii/cazier-judiciar-online/piatra-neamt/`) a făcut 26 de clicuri.

**Concluzie 2:** setul de pagini de locație e risc de footprint fără niciun
venit. Chiar dacă n-ar fi ele cauza demotării, nu există argument comercial
pentru a le păstra în forma actuală.

---

## 5. Impactul pe bani (DB producție, comenzi plătite, fără test)

| Săptămâna | Comenzi | Venit (RON) |
|---|---:|---:|
| 06.07 | 27 | 10.723 |
| 13.07 | 52 | 20.701 |
| 20.07 | 52 | 14.118 |
| 27.07 | 44 | 11.579 |
| 03.08 | 54 | 11.909 |
| 10.08 | 74 | 15.047 |
| **17.08** | **52** | **11.394** |
| **24.08** | **20** | **6.681** |
| **31.08** | **17** | **2.628** |
| 07.09 (parțial) | 12 | 4.276 |

Ruptura e pe 21.08 (3 comenzi) și 22–23.08 (zero). De atunci: **1–7 comenzi/zi**,
față de 15–21/zi înainte. Aproximativ **−70% comenzi, −75% venit**.

## 6. GA4 (ultimele 28 de zile, față de perioada anterioară)

| Metrică | Valoare | Δ |
|---|---:|---:|
| Utilizatori activi | 23K | −43,9% |
| Sesiuni Organic Search | 27K | **−44,1%** |
| Sesiuni Direct | 2,4K | −23,5% |
| Sesiuni „AI Assistant" | 100 | −90,5% |
| Rata de cumpărare | 0,5% | −6,5% |

Fereastra de 28 de zile include și zile dinainte de cădere, deci subestimează.
⚠️ GA4 e în spatele bannerului de consimțământ — cifrele lui sunt sub-numărate
prin construcție; **GSC (cerere) + DB (bani) sunt sursele de decizie**, GA4 e
doar pentru mixul de canale. Proprietatea: `eGhiseul.ro`, GA4 `422029610`,
tot pe contul `serviciiseonethut@gmail.com`.

---

## Ce iau mai departe din date

1. Clasificarea e **pe cluster, nu pe domeniu** — calculatoarele au rămas
   intacte, ba chiar au urcat. Deci există un semnal pozitiv de păstrat.
2. **Clusterul comercial (servicii) e cel executat**: −91% clicuri, −97%
   expuneri, iar 5 pagini de serviciu au căzut 6–40 de poziții.
3. **Articolele au fost lovite la fel de tare ca serviciile** (−95% clicuri) —
   asta susține ipoteza „conținut la scară", nu ipoteza „doorway pe locații".
4. **Paginile de locație nu contează comercial** (0,1% din clicuri) — decizia
   despre ele se ia pe risc, nu pe venit pierdut.
5. O parte din prăbușirea expunerilor (ANCPI) e **cerere dispărută**, nu
   penalizare — nu o pune la socoteala recuperării, altfel măsori greșit.
