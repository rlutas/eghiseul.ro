# 01.10.2026 — Portalul topografului nu mai ascunde comenzile noi
<!-- categorie: comenzi -->

## Pentru echipă

Comanda E-261001-6JVWA (extras carte funciară) a fost plătită, iar topograful a
primit emailul, dar în portalul lui comanda nu apărea. Cauza: lista din portal
arăta maximum 200 de comenzi, începând cu cele mai vechi. Când s-au strâns 201
(din care 181 finalizate), cea mai nouă a căzut din listă.

Acum lista arată mereu TOATE lucrările deschise (de depus, depuse, blocate),
indiferent câte comenzi vechi există. La „Livrate” apar ultimele 300. Nu trebuie
făcut nimic: comanda apare de la sine după reîncărcarea paginii.

Dacă se mai întâmplă („a primit emailul, dar nu o vede”): comanda există și e
plătită, problema e în lista portalului. Anunțați imediat, nu o mutați și nu o
asignați manual.

---

## Ce s-a întâmplat

- 01.10.2026, 11:08: clientul plasează E-261001-6JVWA (Extras Carte Funciară,
  eghiseul). Plata trece, statusul devine `paid`.
- Emailul „Comandă nouă pe serviciul tău” pleacă la topograf
  (`notifyCollaboratorsOfPaidOrder` din `src/lib/email/order-confirmation.ts`).
  Emailul nu depinde de listă: îl trimite la orice comandă plătită pe un
  serviciu din `collaborator_service_assignments`.
- Topograful deschide portalul: comanda lipsește din „De depus” și din căutare.
  Link-ul direct din email (`/colaborator/orders/<id>`) mergea, pentru că pagina
  de detaliu verifică doar dreptul pe comandă, nu lista.

## Diagnostic

Verificat în DB:

| Ce | Valoare |
|---|---|
| `status` / `payment_status` | `paid` / `paid` |
| serviciu | `extras-carte-funciara`, alocat lui Mircea |
| `assigned_collaborator_id` | `NULL` (intră în scop prin serviciu, corect) |
| comenzi plătite în scopul lui Mircea | **201** (181 `completed`, 10 `standby`, 4 `on_hold_institution`, 3 `identification_pending_ocpi`, 1 `delivered`, 1 `submitted_to_institution`, 1 `paid`) |

`GET /api/collaborator/orders` făcea un singur query cu
`.order('priority', desc).order('created_at', asc).limit(200)`. Sortarea de la
cea mai veche + plafonul fix = la comanda 201, cea mai NOUĂ era tăiată. Exact
lucrarea care trebuia făcută prima dispărea, iar cele 181 finalizate ocupau
locurile.

Riscul era cunoscut: `STATUS_CURRENT.md` (21.09) nota „API-ul colaboratorului
taie la 200 comenzi (193 azi)”. Nu s-a reparat atunci; pragul a fost atins azi.

## Rezolvare

`src/app/api/collaborator/orders/route.ts` (commit `02b387c7`):

- două query-uri în paralel, construite din același `base()` (un builder nou per
  query, vezi capcana postgrest din `.claude/rules/database.md`):
  - **deschise**: `status NOT IN CERERE_DONE_STATUSES`, limită de siguranță
    1000 (practic: toate);
  - **finalizate**: `status IN CERERE_DONE_STATUSES`, cele mai recente 300
    (`created_at desc`).
- filtrele vechi rămân pe ambele: scope (serviciu sau `assigned_collaborator_id`),
  `payment_status = 'paid'`, fără `COLLAB_HIDDEN_STATUSES`, `?status=` opțional.
- rezultatul se combină și se sortează în memorie ca înainte: `priority` desc,
  apoi `created_at` asc.
- forma răspunsului nu se schimbă, deci pagina portalului nu s-a atins.

`/api/collaborator/cereri` (ZIP-ul de cereri, `MAX_ORDERS = 100`) exclude deja
statusurile finalizate, deci nu are aceeași problemă.

## Verificare

Aceleași filtre rulate în DB după fix: 19 lucrări deschise (toate în listă,
inclusiv E-261001-6JVWA) + 182 finalizate (sub plafonul de 300, toate în
„Livrate”). tsc + eslint fără erori. Deploy confirmat de Raul. Portalul nu a
fost deschis în browser de noi.

## Ce rămâne de urmărit

- Plafonul de 300 la „Livrate” se atinge peste câteva luni; atunci cele mai
  vechi livrate ies din listă (nu e lucru de făcut pe ele). Dacă vrea istoric
  complet, următorul pas e paginare pe „Livrate”, nu ridicarea limitei.
- Lecție: orice listă de lucru sortată de la cea mai veche are nevoie de
  plafon pe ce e TERMINAT, nu pe tot.
