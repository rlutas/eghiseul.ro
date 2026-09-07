# Regularizarea decontului cu Mircea — 07.09.2026

Recalcularea decontului din 26.08 (`decont-mircea-2026-08-26.md`), după ce au intrat
toate taxele OCPI și după ce au fost adăugate costurile care lipseau din primul calcul.

**Raport pentru Mircea:** https://claude.ai/code/artifact/7af1f9b5-d533-4689-b4f6-540bfba0854f

## Perioada

7 iulie – **31 august 2026** (inclusiv), 162 comenzi plătite (fără anulate/rambursate/test).
Cutoff-ul vechi (`E-260826-F7GHD`) e depășit — decontul se face acum cumulat pe toată
perioada, iar din el se scade ce s-a distribuit deja.

## Ce s-a schimbat față de 26.08

| | La 26.08 | Acum | Δ |
|---|---|---|---|
| Comenzi | 159 | 162 | +3 |
| Încasat cu TVA | 17.267,04 | 17.643,04 | +376,00 |
| Taxe OCPI | 2.035,00 | **3.055,00** | +1.020,00 |
| Comisioane Stripe | nescăzute | **451,55** | +451,55 |
| Comision 15 lei/comandă | nescăzut | **525,00** | +525,00 |
| Găzduire/infrastructură | nescăzută | **919,84** | +919,84 |

Cele 53 de comenzi plătite-nelucrate de la primul cutoff au fost lucrate; taxele lor OCPI
au intrat în sistem — exact rezerva #2 din documentul precedent.

## Calculul

| Pas | lei |
|---|---|
| Încasat cu TVA | 17.643,04 |
| − TVA 21% | −3.062,02 |
| **= Net fără TVA** | **14.581,02** |
| − Taxe OCPI | −3.055,00 |
| − Comisioane Stripe | −451,55 |
| − Comision colaborator (factură SM 153) | −525,00 |
| − Găzduire (500 lei/lună × 56 zile) | −919,84 |
| **= Profit brut** | **9.629,63** |
| − Impozit profit 16% | −1.540,74 |
| − Impozit dividende 16% | −1.294,22 |
| **= De distribuit** | **6.794,67** |
| **Parte/cap** | **3.397,34** |
| − distribuit la 26.08 | −4.316,61 |
| **= De recuperat de la fiecare** | **−919,27** |

## Factura de comision

Mirandsof SRL, seria SM nr. 153 / 28.08.2026: **525,00 fără TVA + 110,25 TVA = 635,25 lei**.
Înțelegerea era 15 lei/comandă **cu TVA inclus** (35 comenzi = 525 total, adică 433,88 net).
**Decizia lui Raul (07.09): se plătește ca atare, fără refacerea facturii**; diferența intră
în costurile perioadei, deci se suportă din profitul comun (efect ~32 lei/parte).

Pe extrasele de carte funciară nu s-a facturat comision — coerent cu clarificarea din 26.08
(acolo nu există onorariu per comandă).

## Reconciliere cu Revolut (parțială)

Transferuri către Mircea în extrasele disponibile (21.08 – 07.09): **3.200 lei**, plus 40 lei
taxe OCPI plătite direct cu cardul pe 21.08. Taxele înregistrate în sistem pe toată perioada
iulie–august: 3.055 lei (din care 2.795 înregistrate în august, 120 în septembrie).

Extrasele nu acoperă 07.07–20.08, deci soldul real (avans la Mircea vs. taxe consumate) se
poate stabili doar confruntând cu evidența lui. **De clarificat la următorul decont.**

## Ce s-a schimbat în cod (07.09)

`src/lib/collaborator/settlement.ts` rămâne sursa unică, dar modelul include acum toate
costurile: `computeSettlementBreakdown(collected, ocpi, { stripeFees, commission,
platformCost })`, plus `PLATFORM_COST_PER_MONTH = 500` și `platformCostForRange()`.

- Comisioanele Stripe vin reale, per comandă, din `stripe_payout_transactions`.
- Comisionul colaboratorului = suma `services.lawyer_fee_ron` pe comenzile perioadei.
- Găzduirea se alocă proporțional cu zilele din perioadă.
- Ambele UI-uri (`/colaborator/decont` și `/admin/colaboratori`) afișează pașii separat,
  deci Mircea vede aceleași cifre ca în raport, fără document separat.

## Deschise

1. **Soldul avansurilor pentru taxe** — de reconciliat cu evidența lui Mircea (vezi mai sus).
2. **Găzduirea**: 500 lei/lună e alocarea convenită pentru zona imobiliară; costul real de
   infrastructură (Netlify + Supabase + Prisma) e ~730 lei/lună, dar deservește toate
   platformele. Dacă se schimbă alocarea, se modifică `PLATFORM_COST_PER_MONTH`.
3. **Volumul a căzut după 20.08** (de la ~10 comenzi/zi la 1–2) — efectul actualizării Google
   din 20 august asupra traficului organic, nu o problemă de execuție.
