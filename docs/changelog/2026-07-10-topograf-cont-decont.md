# 2026-07-10 — Cont real topograf + decont lunar + privacy în /colaborator

## Cont

- **Cont real creat**: `mirceadumitrean@yahoo.com` (folosit de 2 persoane — cont comun,
  fără audit per persoană, acceptat), rol `collaborator`, **16 servicii cadastrale** alocate.
  Script: `scripts/create-topograf-account.mjs` (idempotent, exclude `extras-carte-funciara`
  — aia e livrată automat de workerul ANCPI, topograful nu trebuie s-o vadă).
- Contul de test `mircea@yahoo.com` (parolă slabă) **șters**.

## Privacy — fără date de client în portal

- API-urile `/api/collaborator/orders` (listă + detaliu) returnează din `customer_data`
  **doar `property`** (județ/localitate/CF/cadastral/topografic + proprietar/adresă la
  serviciile de identificare — alea sunt obiectul lucrării). Contact/billing/personal
  nu mai pleacă de pe server.
- Lista: coloana „Client" → „Localitate". Detaliul: fără Client/Email/Telefon.
- Documentele din detaliu: **doar upload-urile colaboratorului** (`metadata.source='collaborator'`)
  — contractul/cererea clientului conțin date personale și nu-i aparțin.

## Livrare automată la upload (decizie Raul)

- `upload-pdf` apelează direct `deliverCollaboratorResult()` după atașare: document vizibil
  clientului + status `document_ready` + email (idempotent 24h). Un singur buton:
  „Încarcă PDF și trimite clientului". Butonul „Marchează gata" a dispărut din UI
  (endpoint-ul `mark-ready` rămâne ca fallback API).

## Decont lunar

- **Pagină nouă** `/colaborator/decont` (nav „Decont lunar"): selector lună (12 luni),
  carduri Comenzi plătite + Onorariu total, tabel cu comenzi (fără date client).
- **API nou** `GET /api/collaborator/earnings?month=YYYY-MM`.
- **Regulă de decontare** (decizie Raul): onorariu per comandă **plătită**, luna = luna
  plății (`paid_at`), excluse anulate/rambursate; comenzile de test apar în listă
  (marcate) dar nu se plătesc.
- **Aliniat și calculul din admin** (`/api/admin/collaborators/orders`): înainte număra
  TOATE comenzile non-draft după `created_at` (inclusiv neplătite/anulate) — acum aceeași
  regulă ca portalul, cifrele bat la decontare.
- **Migrația 107**: `lawyer_fee_ron = 15` pe `identificare-imobil` + `extras-plan-cadastral`
  (scăpate de migrația 087 — decontul arăta 0 RON); `extras-carte-funciara` rămâne 0
  intenționat (worker ANCPI, fără topograf).

## Asignare per-comandă (identificările rămân la echipa internă)

- Identificare-imobil + identificare-imobile-proprietar **scoase din alocările pe serviciu**
  ale topografului (14 servicii rămase) — echipa internă le lucrează implicit.
- **Migrația 108**: `orders.assigned_collaborator_id` + RLS extins — colaboratorul vede o
  comandă dacă serviciul e alocat LUI **sau** comanda i-a fost trimisă explicit.
- **Admin**: în „Procesare comandă" (`/admin/orders/[id]`) — select „Colaborator (topograf)"
  + Trimite/Retrage (`POST /api/admin/orders/[id]/assign-collaborator`, permisiune
  `orders.manage`); colaboratorul primește email cu link la comandă.
- `requireCollaboratorForOrder` + lista + decontul acceptă ambele căi de scop.

## Serviciile mele

- Pagină nouă `/colaborator/servicii` (+ nav): serviciu, preț client, onorariul lui
  (15 RON — linia „Onorariu Topograf" de pe factură). API: `GET /api/collaborator/services`.

## Verificat local (mobil, cont real)

Login → listă comenzi fără date client → detaliu doar cu datele de lucrare → decont
iulie 2026: 2 comenzi × 15 = 30.00 RON, corect.
