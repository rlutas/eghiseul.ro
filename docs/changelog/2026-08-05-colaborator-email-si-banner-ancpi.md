# 2026-08-05 — Colaborator: email automat la comandă plătită + banner ANCPI pe toate serviciile topograf

## 1. Mircea nu primea emailuri la comenzile noi (raport echipă)

**Cauză:** emailul către colaborator pleca DOAR la asignarea manuală din admin (`assign-collaborator`); la plată nu exista nicio notificare. Comenzile din 04.08 (`E-260804-9K23B` plan-amplasament, `E-260804-YEYBF` copie-inventar-coordonate — ambele pe serviciile lui) apăreau în portalul /colaborator (care listează după `collaborator_service_assignments`), dar nimeni nu i-a spus că există. A treia comandă imobiliară din acea zi (`E-260804-ZRTSX`, identificare-imobil) NU e pe serviciile lui — aceea se asignează explicit.

**Fix:** `notifyCollaboratorsOfPaidOrder` în `src/lib/email/order-confirmation.ts` — după emailul de confirmare al clientului (în interiorul claim-ului atomic „exact o dată per comandă"), se caută colaboratorii cu assignment pe serviciul comenzii și fiecare primește heads-up branduit cu link spre portal. Best effort: eșecul nu blochează și nu eliberează claim-ul. Idempotency key `collab-newpaid-<orderId>-<collabId>`. Emailul de la asignarea manuală rămâne neschimbat.

## 2. Banner „portal ANCPI nefuncțional" pe TOATE serviciile topograf (cerere echipă)

Contextul: după incidentul ANCPI (13.07) nu se poate lucra NIMIC pe serviciile imobiliare, dar doar 5 servicii aveau badge-ul de stare. Extins `PLATFORM_DEPENDENT_SERVICES` (`src/lib/services/platform-services.ts`) cu restul de 11 servicii topograf: actualizare-adresa-cf, certificat-sarcini, certificat-urbanism-informare, copie-arhiva-ocpi, copie-contract-vanzare, copie-intabulare, copie-inventar-coordonate, copie-plan-incadrare, copie-releveu, extras-cf-colectiv, plan-amplasament-delimitare.

Efect dublu:
- **Wizard** (price-sidebar): badge live automat, prin `platformStatusProvider` — zero cod nou.
- **Paginile de servicii**: `<SystemStatus compact/>` — variantă NOUĂ, o singură linie roșie „Sistemul ANCPI este momentan indisponibil (din 14 iulie)", inserată în cardul de preț deasupra butonului „Comandă Acum" pe toate cele 13 pagini imobiliare (inclusiv identificare-imobil ×2, trecute de pe varianta mare pe compact — feedback Raul: caseta completă lungea prea mult landing-ul). Când sistemul e operațional, linia NU se randează deloc. Detaliile complete (griduri + mesajul „poți plasa comanda, se procesează cu prioritate") rămân în wizard, unde sidebar-ul folosește varianta full. Verificat vizual pe build local.

## Verificare

Build + typecheck + 1430 teste verzi. Emailul către colaborator se testează la următoarea comandă plătită pe un serviciu topograf (mirceadumitrean@yahoo.com — Yahoo, verifică spam prima dată).
