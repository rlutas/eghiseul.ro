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
  `src/lib/analytics/attribution.ts` **chiar captează** gclid/gbraid/wbraid, deci cauza e în cont:
  **auto-tagging-ul pare oprit**, sau clicurile pur și simplu nu produc comenzi.
- **10 cu `utm_`**, iar una are `click_id` de Meta (`m.facebook.com`) — deci pe Meta lanțul merge.

**Descoperire laterală, mai valoroasă decât ambele campanii:** printre cele 10 apar comenzi
**plătite** venite din **ChatGPT** și **Copilot**, gratuit:
`E-260907-A2VU3` (cazier PF, 476,50 lei, `utm_source=chatgpt.com`), `E-260907-F7654`
(constatator, 89 lei, referrer chatgpt.com), plus drafturi din `/ancpi-nu-functioneaza/`.
Traficul din motoarele AI convertește fără să plătim clicul.

## Ce facem

**Google, imediat:**
1. Negative keywords: `asigurare`, `polita`, `map`, `harta`, `terra`, `rgi`, `ocpi`, `gratuit`,
   `model`, `formular`, `anaf`.
2. Restrânge la potrivire exactă pe „plan de amplasament și delimitare" (+ variante) și scoate
   frazele generice de cadastru.
3. **Verifică auto-tagging-ul** (Administrator → Setări cont → Etichetare automată). Fără gclid nu
   știm niciodată ce aduce campania.
4. Dacă după încă 2 săptămâni nu apare o comandă de PAD: oprit. Volumul căutărilor (100–1K/lună)
   nu susține 40 lei/zi.

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
