# 2026-08-24 — Prăbușirea organică: Google August 2026 Spam Update

## Ce s-a întâmplat (cronologie verificată)

| Zi | Clicuri GSC | Expuneri | Comenzi create (DB) |
|---|---|---|---|
| 10–16.08 | 4.000–5.900/zi (vârf istoric) | ~150–180K/zi | 30–40/zi |
| 19.08 | 3.457 | 108.807 | 38 |
| 20.08 | în cădere | în cădere | **7** |
| 21.08 | ≈0 pe servicii | ≈0 pe servicii | **0** |
| 22.08 | ≈0 pe servicii | ≈0 pe servicii | 1 |

**Cauza: Google August 2026 Spam Update** — rollout 18.08 → 21.08 (01:49 PDT),
suprapus exact peste cădere. Demotare algoritmică SpamBrain: **fără acțiune
manuală** (verificat: zero în GSC), indexare intactă (188 pagini), crawl sănătos
(94% OK, gazda fără probleme 90 zile). De-aia „totul pare curat" în GSC.

## Ce a tăiat exact (analiza decisivă)

Pe 21–22.08, Google a mai servit din site DOAR: **calculatoarele** (calcul
vârstă pensionare 165 clicuri/2 zile, impozit auto 105…) + **brandul**
(„eghiseul.ro"). **Toate interogările de servicii/documente = zero**: cazier
judiciar/fiscal/auto, constatator, extras CF, naștere, celibat. Verificat și în
SERP real (`pws=0`): dispărut din top 30 pe toate; supraviețuiește doar
căsătorie (#5, de pe #1).

CJO (același proprietar, același profil de business) = **neafectat**, #1 pe
„cazier judiciar online".

## Ipoteze eliminate (cu dovezi)

1. **NU backlinkurile plătite** — Google a confirmat explicit că update-ul nu
   vizează link spam și nici site reputation abuse. (Ipoteza inițială, retrasă.)
2. **NU paginile de județ în sine** — CJO are pagini de județ și MAI identice
   între ele (Jaccard 88–89% vs 79–82% la noi) și n-a fost lovit.
3. **NU tehnic** — 192 URL-uri din sitemap toate 200, zero noindex, canonicals
   corecte, robots curat.

## Ce vizează update-ul și ce se potrivește la noi

Update-ul aplică politicile on-page existente cu precizie mai mare, în 3 grupe:
**conținut la scară** (scaled content abuse, doorway, thin affiliation),
înșelăciune (cloaking, stuffing), igienă (hacked/UGC). Caz documentat aproape
identic: un site de calculatoare cu ~130 articole AI, căzut 278→20 vizitatori/zi
(update-ul din iunie) — „textbook scaled content abuse".

Profilul nostru vs CJO (auditul din 24.08, scor tipare AI per 1.000 cuvinte,
scriptul în `/tmp/audit/score.py` din sesiune — lexicon RO: promo, hedging,
false ranges, filler, „esențial/reprezintă", gerunzii de adâncime, em-dash,
liste cu **Termen:** ):

| Metric | eghiseul | CJO (neafectat) |
|---|---|---|
| Articole | 58 (+40 pagini servicii +41 calculatoare) | ~20 |
| Cadență publicare | **12 într-o zi** (16.06), 12 (22.06), 5 (31.07), 6 (07.08) | organic |
| Scor AI articole (mediană) | **10,0/1k** (vârf 20,7) | 5–8 |
| Scor pagini locație | **10,6–11,8/1k** | **5,0/1k** |
| Articole sub 800 cuvinte | 12 | puține |
| Em/en-dash pe site | 1.394 | mult mai puține/pagină |

Tipare dominante găsite (total site): promo 213, hedging 207, false ranges 110,
filler 49. Exemple reale din cel mai grav articol
(`/totul-despre-cartea-funciara-colectiva/`, 20,7/1k): „esențial" de 3 ori,
„reprezintă un document", „Este important ca…", secțiune generică „Concluzii",
14 liste cu `<strong>Termen:</strong>`.

**Concluzie**: discriminatorul dintre noi și CJO nu e o singură pagină, ci
CLUSTERUL — volum mare de conținut publicat în loturi, cu densitate dublă de
tipare AI, lățime fără adâncime (29 servicii × variante + 41 calculatoare + 58
articole). SpamBrain clasifică la nivel de site/cluster.

## Top pagini de reparat (scor AI, descrescător)

1. `/totul-despre-cartea-funciara-colectiva/` — 20,7
2. `/rolul-si-atributiile-onrc-romania/` — 19,5 (și thin: 565 cuvinte)
3. `/certificat-constatator-pfa/` — 16,0
4. `/certificat-constatator-cu-istoric/` — 15,9
5. `/acte-necesare-certificat-de-nastere/` — 15,7
6. `/cele-4-tipuri-de-certificat-constatator-online/` — 15,5
7. `/transcriere-certificat-de-casatorie/` — 15,2
8. `/importanta-extras-de-carte-funciara-colectiva/` — 14,8 (thin: 474)
9. `/certificat-constatator-de-baza/` — 14,8
10. `/taxa-cazier-judiciar/` — 14,3
+ toate paginile de locație cazier (11,0–11,8) și restul listei din raport.

## Plan de recuperare

Recuperarea după spam update = **luni**, prin refresh-uri SpamBrain. Nu există
cerere de reconsiderare (nu-i acțiune manuală); recrawl-ul NU ajută înainte de
a schimba paginile.

1. **Rescriere humanizer** pe articole în ordinea scorului (pragul de acțiune:
   tot ce e peste ~10/1k), cu adâncime reală (surse, cifre, specific), nu doar
   curățare de tipare. Thin (<800 cuvinte): extinde sau consolidează.
2. **Pagini de locație cazier** (16): diferențiere reală sau consolidare —
   țintă sub 5/1k, ca la CJO.
3. **Oprit publicarea în loturi.** Max 1–2 articole/săptămână, de calitate.
4. **Backlinkuri**: nu-s cauza; la următoarele advertoriale cerem
   `rel=sponsored` din start (igienă).
5. **Monitorizare**: expuneri GSC pe clusterul servicii, zilnic. Primul semn de
   recovery = expunerile, nu clicurile. SERP doar cu `pws=0`.
6. Venit pe termen scurt: Google Ads (respingerile de politică se tratează
   separat, `docs/ads/`).

## Surse

- seroundtable.com/google-august-2026-spam-update-41895.html (rollout 18–21.08,
  nu vizează link spam / site reputation)
- searchenginejournal.com/google-begins-rolling-out-the-august-2026-spam-update/586301/
- blog.on-page.ai/august-2026-spam-update/ (cele 14 politici, cazul site-ului
  de calculatoare, „recovery is measured in months, across refreshes")
- keywordseverywhere.com/news/google-algorithm-updates/august-2026-spam-update/
