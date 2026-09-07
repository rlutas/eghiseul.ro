# 07.09.2026 — Verificarea campaniilor live (Google PAD + Meta constatator)

Verificat direct în conturi (Chrome, sesiunea lui Raul). Perioada: ultimele 30 de zile,
8 august – 6 septembrie 2026.

## Google Ads — cont eGhiseul 677-995-5005

Singura campanie care difuzează: **Search-Cadastru-Documente-2026-08 (PAD)** — restul contului
e eliminat sau întrerupt (SEARCH-2026-NOU: toate anunțurile respinse; ASSISTENTA NOU: întreruptă).

| | 30 zile |
|---|---|
| Cheltuit | **688,33 lei** |
| Conversii | **1** (valoare 89 lei) |
| Clicuri (raport termeni) | 179 · CTR 8,85% · CPC med. 2,81 lei |
| Buget | 40 lei/zi · stare „Eligibil (limitat) — sumă licitată limitată" |
| **Comenzi PAD în DB de la 18.08** | **0** |

**Deci: 688 de lei, zero comenzi de PAD.** Conversia raportată de Google are valoare 89 lei —
un extras CF, nu un PAD (216,59 lei). Cele 39 de comenzi imobiliare din perioadă vin din organic
(landing-uri: `/ancpi-nu-functioneaza/`, `/servicii/extras-de-carte-funciara/`).

### Unde se duc banii — termeni de căutare (top cost)

| Termen | Clicuri | Cost | Verdict |
|---|---|---|---|
| plan amplasament | 7 | 16,73 | ✅ pe țintă |
| cadastru online | 5 | 14,71 | ⚠️ generic |
| cf online | 5 | 13,82 | ⚠️ altă intenție (extras CF) |
| cadastral map | 4 | 11,86 | ❌ hărți, engleză |
| **asigurare locuinta pad** | 3 | 8,95 | ❌ **PAD = poliță de asigurare** |
| cadastre online | 3 | 8,88 | ⚠️ generic |
| plan de amplasament si delimitare a imobilului online | 3 | 8,85 | ✅ |
| ocpi online | 3 | 8,77 | ⚠️ caută instituția |
| terra cadastru | 3 | 7,82 | ❌ brand competitor |
| rgi online | 2 | 5,95 | ❌ altceva |

Doar ~3 din primii 10 termeni sunt pe intenția reală. Restul e trafic informațional plătit la
2,80 lei clicul.

### Toată perioada campaniei (18.08 – 07.09) — pe cuvânt cheie

| Cuvânt cheie | Potrivire | Clicuri | CTR | CPC | Cost | Conv. |
|---|---|---|---|---|---|---|
| "plan de amplasament si delimitare online" | expresie | 118 | 8,20% | 2,85 | **335,92** | 1 (89 lei) |
| [plan de amplasament si delimitare] | exactă | 80 | 8,05% | 2,67 | **213,67** | 0 |
| [plan amplasament si delimitare] | exactă | 31 | 10,47% | 2,85 | 88,30 | 0 |
| "pad imobil" | expresie | 21 | 10,19% | 2,96 | 62,07 | 0 |
| [plan de amplasament si delimitare a imobilului] | exactă | 14 | 11,02% | 2,80 | 39,16 | 0 |
| restul (5 cuvinte) | — | 0 | — | — | 0 | 0 |
| **TOTAL** | | **264** | | | **739,12** | **1** |

### Ce a adus efectiv reclama (comenzi cu `click_platform=google`)

| Comandă | Data | Serviciu | Valoare | Stare |
|---|---|---|---|---|
| E-260820-9B4TM | 20.08 | extras carte funciară | 89,00 | **plătită** |
| E-260824-8CEE5 | 24.08 | **plan de amplasament** | 216,59 | abandonată |
| E-260827-UAB7U | 27.08 | extras plan cadastral | 89,00 | **plătită** ← conversia raportată de Google |
| E-260827-WKZ7Q | 27.08 | **plan de amplasament** | 216,59 | abandonată |
| E-260831-7PMM8 | 31.08 | **plan de amplasament** | 216,59 | abandonată |
| E-260831-CKWVJ | 31.08 | extras plan cadastral | 89,00 | abandonată |
| E-260903-EHFK4 | 03.09 | extras carte funciară | 89,00 | **plătită** |

**7 comenzi începute, 3 plătite (267 lei), 4 abandonate (738,77 lei).** Conversia de 89 lei
raportată de Google e `E-260827-UAB7U` — **extras de plan cadastral, nu PAD**: omul a intrat pe
pagina de PAD dintr-un click de reclamă și a cumpărat produsul de 89 de lei.

**Diagnosticul real:** campania aduce oameni care chiar vor PAD — 3 comenzi de 216,59 lei au fost
începute. **Toate trei au fost abandonate la plată.** Nu traficul e problema, ci conversia pe
prețul de 216,59. Cine cumpără, cumpără produsul ieftin.

⚠️ Corecție față de nota inițială: atribuirea NU salvează cheia „gclid", ci `click_id` +
`click_platform`. Căutarea după „gclid" a dat fals-negativ — datele există.

### Ce s-a schimbat în cont (07.09, executat)

1. **Auto-tagging: VERIFICAT — este PORNIT** („Etichetare automată: Da"). Deci gclid chiar se
   adaugă pe linkuri. Testat și lanțul de redirect: `?gclid=` supraviețuiește atât pe 308-ul de
   trailing slash, cât și pe cel de la `www`. **Concluzia dură: cele 264 de clicuri chiar nu au
   produs comenzi** — nu e o problemă de măsurare.
2. **Întrerupt „pad imobil"** (expresie) — sursa termenului „asigurare locuinta pad".
3. **Adăugate cuvinte cheie negative** la nivel de campanie: `asigurare`, `polita`, `harta`,
   `map`, `terra`, `rgi`, `"cadastru online"`, `"cadastre online"`, `"cf online"`,
   `"ocpi online"`, `"cadastral map"`, `"carte funciara"`.
4. Rămân active doar variantele de „plan de amplasament și delimitare" (1 expresie + 3 exacte).
5. **Buget redus de la 40 la 20 lei/zi** (decizia lui Raul).
6. **Plafonul CPC scăzut de la 3,00 la 1,80 lei.** Strategia e „Maximizați clicurile" cu plafon —
   plafonul de 3 lei nu limita nimic (CPC realizat 2,80). La 1,80 obținem mai multe clicuri pe
   același buget, doar pe termenii exacti rămași.

## Meta — cont eGhiseul.ro Ads (1562160259035101)

Campania `New Sales campaign` (META_Constatator_2026-09) — **activă**, 75 lei/zi.

| Anunț | Cheltuit | Afișări | Rezultate |
|---|---|---|---|
| C4 Verificare partener | 106,49 | 3.369 | **1** initiate checkout |
| C1 Deadline bancă | 79,51 | 3.009 | 0 |
| C0 Cover | 36,28 | 1.608 | 0 |
| C3 Licitație fonduri | 13,16 | 759 | 0 |
| **Total** | **235,44** | **8.745** | **1 IC, 0 achiziții** |

CPM ≈ 27 lei — rezonabil. Dar în 4 zile: 1 initiate checkout, nicio vânzare confirmată.
Comenzi de constatator plătite de la 03.09: 3 × 89 lei — fără dovadă că vin din Meta.

## Problema care le acoperă pe amândouă: nu putem măsura

Din **721 de comenzi** cu date de atribuire de la 1 august:

- **0 cu `gclid`** — niciun click din Google Ads nu ajunge identificat în comenzi. Codul
  `src/lib/analytics/attribution.ts` chiar captează gclid/gbraid/wbraid, auto-tagging-ul e pornit,
  iar parametrul supraviețuiește redirectărilor (testat). **Deci clicurile chiar nu produc
  comenzi** — 264 de clicuri, zero comenzi de PAD.
- **10 cu `utm_`**, iar una are `click_id` de Meta (`m.facebook.com`) — deci pe Meta lanțul merge.

**Descoperire laterală, mai valoroasă decât ambele campanii:** printre cele 10 apar comenzi
**plătite** venite din **ChatGPT** și **Copilot**, gratuit:
`E-260907-A2VU3` (cazier PF, 476,50 lei, `utm_source=chatgpt.com`), `E-260907-F7654`
(constatator, 89 lei, referrer chatgpt.com), plus drafturi din `/ancpi-nu-functioneaza/`.
Traficul din motoarele AI convertește fără să plătim clicul.

## Ce facem

**Google — făcut pe 07.09** (negative, „pad imobil" întrerupt, buget 20 lei/zi, plafon CPC 1,80).

**Ce rămâne de făcut, în ordinea impactului:**
1. **Checkout-ul de PAD** — 3 din 3 comenzi de 216,59 lei au fost abandonate la plată. Aici se
   pierd banii, nu în Ads. De verificat: prețul e vizibil înainte de formular? Câți pași are?
   Se cere ceva ce omul nu are la îndemână (număr cadastral, act de proprietate)?
2. **Anunțul NU se atinge** deocamdată: CTR 8,61% e bun, iar orice editare a unui RSA trece prin
   review — pe o politică unde restul contului e deja respins, riscul e să pierdem singura
   campanie care difuzează.
3. **Verdict în 2 săptămâni:** la ~280 lei cheltuiți cu setarea nouă, dacă nu apare o comandă de
   PAD plătită, se oprește. Volumul (100–1K căutări/lună) nu susține mai mult.

**Meta:** rămâne 5 zile fără modificări, conform planului din `meta/05-plan-test-constatator.md`.
La evaluare se judecă CTR și CPM, nu vânzările (bugetul e prea mic pentru concluzii). C4
(„verificare partener") e singurul care a produs ceva — dacă tendința ține, restul se opresc și
se fac variații pe unghiul lui.

**De explorat, cu prioritate mai mare decât ambele:** traficul din ChatGPT/Copilot aduce deja
comenzi plătite fără cost per click. Merită conținut construit special pentru citare în răspunsuri
AI (vezi `docs/seo/` și skill-ul GEO), nu buget de reclamă.

## Costurile de reclamă intră în decontul colaboratorului

Cheltuiala de reclamă pe serviciile lucrate împreună (cadastru/PAD → Mircea) e **cost real** și se
scade din profit înainte de împărțeala 50/50. Mecanism nou (07.09):

- tabela `collaborator_period_costs` (migrarea 152): denumire, sumă, lună, categorie
- API `/api/admin/collaborators/costs` (GET/POST/DELETE)
- panou **„Cheltuieli de perioadă"** în /admin/colaboratori
- `settlement.ts` le scade prin `otherCosts`; apar ca rând separat în portalul colaboratorului

⚠️ **Nu au fost introduse retroactiv.** Decontul comunicat lui Mircea pe 07.09 (3.907,07 lei/parte)
NU conține cei 688,33 lei de Google Ads din august. Dacă intră, partea fiecăruia scade cu ~240 lei.
Decizia e a lui Raul.
