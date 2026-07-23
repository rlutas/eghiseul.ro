# Modifică comanda: limbă traducere + țară apostilă + termen automat (2026-07-23)

## Problema (raportată de Raul)

În dialogul admin „Modifică comanda", adăugarea Traducerii Autorizate pleca cu
descrierea „în limba engleză" și fără posibilitatea de a alege limba; la fel
apostila fără țară. Opțiunile deja plătite nu erau marcate distinct, extras-urile
nu se vedeau calculate live, iar termenul comenzii nu se actualiza — echipa nu
știa că are de făcut și o traducere.

## Ce s-a livrat

### 1. Selectoare limbă/țară în dialog (paritate cu wizard-ul)
- Traducere selectată → dropdown „Limba traducerii" (`TRANSLATION_LANGUAGES`).
- Apostilă Haga/Notari selectată → dropdown „Țara de utilizare"
  (`APOSTILA_COUNTRIES`), țară partajată între cele două tipuri (convenția
  wizard-ului).
- Datele intră în `selected_options[].metadata.{language,country}` — exact
  shape-ul pe care admin detail / contract / normalize îl afișează deja
  (Limba: X / Țara: Y).
- Validare pe ambele părți: client (înainte de preview/apply) + server 400
  (`MISSING_LANGUAGE` / `MISSING_COUNTRY`) — DOAR pentru opțiunile NOU
  adăugate; rândurile legacy fără metadata nu blochează alte modificări.

### 2. Reguli de dependență (ca în wizard)
Legalizare cere Traducere; Apostilă Notari cere Legalizare — checkbox-uri
disabled cu explicație + cascade la debifare (traducerea scoasă → cad și
legalizarea + notari).

### 3. „Plătit deja" + calcul live
- Opțiunile existente pe comandă au badge gri „Plătit deja" (vs. „Nou" verde).
- Sub listă: total live „Opțiuni selectate: X RON (+ custom Y)" + impact
  termen „⏸ termen +N zile lucrătoare" — feedback instant la bifare;
  diff-ul autoritar rămâne pe „Calculează diferența".

### 4. Termen actualizat automat la apply
`computeAddedTermShiftDays` (pure, în `modify-diff.ts`): traducere +2z,
legalizare +1z, apostilă Haga/Notari +1z, cetățean străin +7z (maxDays,
pesimist). La apply, `estimated_completion_date` se împinge cu suma zilelor
codurilor NOU adăugate (`addBusinessDaysISO` — acum exportat); scoaterile NU
scurtează termenul. Nota „termen extins cu N zile (X → Y)" intră în
order_history + toast în dialog. Echipa vede deadline-ul real.

### 5. Sumar cu detalii
`describeChanges` include limba/țara: „adăugat: traducere (Germană), apostilă
Haga (Italia)" — pe Stripe, email client, proformă, audit.

### 6. Migrația 132 (rulată)
Descrierea „în limba engleză" înlocuită cu textul generic („în limba de care
ai nevoie") la traducere pe: cazier-fiscal, cazier-judiciar, cazier PF, cazier
PJ — era sursa lui „se pune engleza automat".

## Teste
`tests/unit/lib/orders/modify-diff.test.ts`: +6 (describeChanges cu metadata,
shift 2z/sumare/idempotent pe existente/fără negativ/coduri fără impact).
Total suite: 1228 verzi; tsc + lint curate.

## Rămas din backlog-ul v2 (nefăcut, de discutat)
- Rânduri multiple de serviciu custom per modificare.
- Dropdown de servicii custom frecvente cu preț presetat.
- Confirmare contabil pe denumirile libere în Oblio.
