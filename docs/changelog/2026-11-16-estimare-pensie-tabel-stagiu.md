# 16.11.2026 — Calculatorul de estimare pensie: tabel pe ani de stagiu; verificări după deploy
<!-- categorie: seo -->

## Pentru echipă

A doua pagină de pensii refăcută azi. Calculatorul de estimare a pensiei are acum un tabel care răspunde direct la întrebarea „ce pensie am la 15, 20, 25, 30, 35, 40 sau 45 de ani de muncă”, pentru trei niveluri de salariu.

Pentru voi nu se schimbă nimic în lucrul cu comenzile.

---

## Ce am schimbat: `/calculator/estimare-pensie/`

- Secțiune nouă, prima după calculator: „Ce pensie ai la 15, 20, 25, 30, 35, 40 sau 45 de ani de stagiu?”, cu pensia estimată la jumătate din salariul mediu, la medie și la o dată și jumătate media.
- Precizare că sumele mici sunt rezultatul formulei, iar sub indemnizația socială pentru pensionari statul plătește diferența. Fără sumă, pentru că pragul nu a fost verificat la sursă azi.
- Data actualizării: 16.11.2026.

Formula a fost mutată din componenta calculatorului în `src/lib/pensii-estimare.ts` (`VPR`, `SAL_MEDIU`, `puncteStabilitate()`, `estimeazaPensia()`), ca tabelul și calculatorul să nu poată da cifre diferite.

| Stagiu | Jumătate din medie | La medie | 1,5 × media |
|---|---|---|---|
| 15 ani | 608 lei | 1.215 lei | 1.823 lei |
| 25 de ani | 1.013 lei | 2.025 lei | 3.038 lei |
| 35 de ani | 1.924 lei | 3.341 lei | 4.759 lei |
| 45 de ani | 3.139 lei | 4.961 lei | 6.784 lei |

Moștenit, neverificat din nou azi: valoarea punctului de referință de 81 de lei și câștigul salarial mediu brut de 9.192 lei erau deja în calculator. Dacă una se schimbă, se schimbă într-un singur loc.

Teste: `tests/unit/lib/pensii-estimare.test.ts` (4).

## Verificări pe site-ul live, 16.11

- `/calculator/varsta-pensionare/`: tabelele noi și „62 de ani și 6 luni” apar în pagina servită.
- cazierfiscal.com: `AW-18570965428` e în bundle, iar eticheta de conversie e în pagina de succes. Rămâne verificarea în browser, cu acord de cookie-uri, și comanda de test.

## CJO: unde e acum (Search Console, clicuri pe zi)

| Săptămâna | L | Ma | Mi | J | V | S | D | Medie luni–vineri | Poziție |
|---|---|---|---|---|---|---|---|---|---|
| 05.10 | 541 | 526 | 615 | 490 | 282 | 83 | 265 | 491 | 5,3 |
| 12.10 | 556 | 506 | 480 | 419 | 234 | 81 | 167 | 439 | 5,2 |
| 19.10 | 332 | 283 | 254 | 217 | 142 | 41 | 107 | 246 | 6,2 |
| 26.10 | 217 | 174 | 174 | 121 | 90 | 33 | 74 | 155 | 6,3 |
| 02.11 | 151 | 162 | 153 | 131 | 77 | 41 | 76 | 135 | 6,5 |
| 09.11 | 172 | 139 | 129 | 152 | 94 | 42 | – | 137 | 6,6 |

Căderea s-a oprit: 135 → 137 pe zi. Nu e încă urcare. CJO e cu 72% sub începutul lui octombrie, iar poziția medie încă alunecă ușor. Joi și vineri din ultima săptămână sunt peste săptămâna dinainte (152 față de 131, 94 față de 77); luni e peste, marți și miercuri sub.
