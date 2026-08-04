# 2026-08-04 — Împuternicirea de apostilă pe stare civilă ieșea identică cu cea principală (E-260802-B5VNY)

## Simptom

Echipa: „generare împuternicire apostilă Haga pt astea de stare civilă nu merge bine" — `E-260802-B5VNY` (Certificat de Celibat + Apostilă Haga Spania + traducere spaniolă). Pe cazier judiciar aceeași combinație era OK.

## Cauză

Serviciile de stare civilă folosesc template-ul UNBR Anexa II (`src/templates/<slug>/imputernicire.docx`) cu tag-urile `{{ACTIVITATI_SC}}` + `{{AUTORITATE_SC}}` — NU `{{INSTITUTIE}}`. Fixul din 28.07 (delegation-aware) fusese aplicat doar pe `buildInstitutie`; `ACTIVITATI_SC`/`AUTORITATE_SC` se construiau exclusiv din slug-ul serviciului principal. Rezultat: împuternicirea delegației de **apostilă** ieșea identică cu cea principală — „Să obțină Certificatul de Celibat" + „OFICIUL DE STARE CIVILĂ SATU MARE", cu alt număr de delegație, zero mențiune de apostilă/prefectură. Pe judiciar mergea fiindcă template-ul shared folosește `{{INSTITUTIE}}`.

## Fix (`src/lib/documents/generator.ts`)

`buildActivitatiStareCivila` primește `delegationServiceType` (direct sau `bundled:...:<code>`, prin helperul nou `extractDelegationCode`); pe delegația `apostila_haga`:

- `ACTIVITATI_SC` → „Să obțină Apostila de la Haga pe Certificatul de Celibat" (fără detaliile căsătoriei — actul e deja emis, apostila doar se aplică);
- `AUTORITATE_SC` → „INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE" (din `DELEGATION_INSTITUTIE_MAP`).

Împuternicirea principală rămâne neschimbată. Teste noi în `tests/unit/lib/documents/generator.test.ts` (apostilă pe celibat/naștere/căsătorie, forma bundled, regresie pe delegația principală).

## De regenerat

Împuternicirea de apostilă de pe `E-260802-B5VNY` trebuie regenerată din admin după deploy (cea generată e cu textul vechi). Alte comenzi de stare civilă cu apostilă active — de verificat în listă.
