# Decont colaborator Mircea (topograf) — primul calcul, 26.08.2026

Primul decont calculat cu Mircea de la lansarea serviciilor imobiliare. Acest
document e punctul de referință: **următorul decont începe de la prima comandă
plătită DUPĂ cutoff-ul de mai jos.**

## Perioada acoperită (cutoff)

- **De la:** prima comandă plătită pe serviciile lui — `E-260707-XKS8C`, plătită 07.07.2026 (identificare-imobil)
- **Până la (INCLUSIV):** `E-260826-F7GHD`, plătită 26.08.2026 07:45 UTC (extras-carte-funciara, Todirești/Suceava)
- **159 comenzi plătite** în total (0 test; excluse anulate + rambursate)

## Scope / metodologie

Aceeași regulă ca `/api/collaborator/earnings`:
- comenzi cu `payment_status='paid'`, `status <> 'cancelled'`, `refunded_at IS NULL`
- pe serviciile din `collaborator_service_assignments` (18 servicii, colaborator `a105db13` / mirceadumitrean@yahoo.com) SAU `assigned_collaborator_id` = Mircea
- taxe OCPI din `order_supplier_costs` (furnizor ANCPI)
- comision din `services.lawyer_fee_ron` (15 lei; 0 pe extras-carte-funciara și certificat-urbanism)

Script: rulat ad-hoc cu `pg` pe pooler (vezi memoria proiectului); raport vizual:
https://claude.ai/code/artifact/e541ea9b-c68c-49a1-8ca6-57007d7d025c

**Din 26.08 (seara), metodologia trăiește în cod:**
`src/lib/collaborator/settlement.ts` e sursa unică de adevăr (cote, formulă,
cutoff) — `/colaborator/decont` și `/admin/colaboratori` o folosesc amândouă,
deci următorul decont se citește direct din pagină, nu se mai calculează
ad-hoc. La schimbarea cotelor (ex. micro în loc de 16%), se modifică DOAR acolo.

## Cifre

| | Sumă (lei) |
|---|---|
| Încasat de la clienți (cu TVA) | 17.267,04 |
| Net fără TVA (÷1,21) | 14.270,28 |
| TVA 21% | 2.996,76 |
| Taxe OCPI înregistrate (106 taxe ANCPI) | 2.035,00 |
| Comision Mircea din sistem (lawyer_fee_ron) | 525,00 |

### Profit și împărțeală 50/50 (Raul / Mircea)

| Pas | Sumă (lei) |
|---|---|
| Net după TVA | 14.270,28 |
| − Taxe OCPI | −2.035,00 |
| **= Profit brut** | **12.235,28** |
| − Impozit pe profit 16% | −1.957,64 |
| = Profit net | 10.277,64 |
| − Impozit pe dividende 16% (cota 2026, Legea 141/2025) | −1.644,42 |
| **= Net de distribuit** | **8.633,21** |
| **Raul 50%** | **4.316,61** |
| **Mircea 50%** | **4.316,61** |

### Pe serviciu

| Serviciu | Comenzi | Încasat cu TVA | Taxe OCPI | Comision |
|---|---|---|---|---|
| extras-carte-funciara | 124 | 11.626,98 | 1.800 | 0 |
| identificare-imobil | 17 | 3.346,20 | 80 | 255 |
| extras-plan-cadastral | 12 | 1.050,09 | 135 | 180 |
| identificare-imobile-proprietar | 3 | 594,00 | 20 | 45 |
| plan-amplasament-delimitare | 2 | 433,18 | 0 | 30 |
| copie-inventar-coordonate | 1 | 216,59 | 0 | 15 |

### Pe lună

| Luna | Comenzi | Încasat cu TVA | Taxe OCPI |
|---|---|---|---|
| Iulie 2026 | 54 | 5.986,97 | 965 |
| August 2026 (până 26.08) | 105 | 11.280,07 | 1.070 |

### Status la data calculului

94 completed + 1 delivered · 10 submitted_to_institution · 1 standby ·
**53 paid nelucrate** (6.078,24 lei încasați — backlog din perioada cu ePay ANCPI picat)

## Rezerve / de clarificat (rămase deschise la 26.08)

1. ~~**Extras CF are comision 0 în sistem**~~ **CLARIFICAT 26.08 (seara):**
   0 e CORECT — pe extras CF nu există onorariu per comandă (nici avocat, nici
   topograf; înțelegerea cu Mircea e împărțeala 50/50, nu tarif pe comandă).
   Cei „20 lei/extras CF" din discuție sunt **costul de eliberare ANCPI**, care
   e deja în sistem (`taxe-eliberare.ts`, precompletat la depunere, salvat în
   `order_supplier_costs`) și deja scăzut în calculul decontului. Migrarea 148
   (care pusese greșit 20 la onorariu) a fost anulată prin migrarea 149.
2. **Cele 53 de comenzi nelucrate** nu au taxă OCPI înregistrată încă — costurile
   reale ale perioadei vor crește când le lucrează (deci profitul de mai sus e
   supraevaluat cu ~1.000+ lei).
3. **Nescăzute din calcul:** comisioane Stripe (~2%, cca 345 lei); comisionul de
   15 lei/comandă dacă se plătește separat de împărțeala 50/50.
4. Calculul folosește impozit pe profit 16% — dacă firma e micro (1%/3% pe venit),
   se reface.

**Important:** comenzile nelucrate la cutoff intră în decontul ăsta pe partea de
încasări, iar taxele lor OCPI vor apărea DUPĂ cutoff — la următorul decont ori se
reconciliază manual taxele pe comenzile vechi, ori se scad retroactiv.
