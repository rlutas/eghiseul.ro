# Auto-Finalize Delivered Cron

**Endpoint:** `POST /api/cron/auto-finalize-delivered`
**Schedule:** `0 6 * * *` (zilnic la 06:00 UTC)
**Auth:** `Authorization: Bearer <CRON_SECRET>`

## De ce există

Unele AWB-uri rămân blocate în status `shipped` pentru că API-ul curierului
nu raportează „delivered" niciodată (Poșta Română, livrări parțial trackable,
pickup point ridicat fără scan final). Comenzile acelea ar rămâne pentru
totdeauna în lista „expediate" și ar polua dashboard-ul operațional.

Cron-ul este o **plasă de siguranță, nu măsură primară**. Threshold-urile
sunt generoase intenționat — preferăm să așteptăm 5–30 zile decât să marcăm
„completed" o comandă care încă e în curs de livrare.

## Threshold-uri per curier

Definite în `src/lib/courier/auto-finalize.ts`:

| Curier         | Auto-finalize | Blocked-in-transit (alert) |
|----------------|---------------|-----------------------------|
| Sameday        | 5 zile        | 10 zile                     |
| Fan Courier    | 7 zile        | 14 zile                     |
| DHL            | 14 zile       | 28 zile                     |
| Poșta Română   | 30 zile       | 60 zile                     |
| Necunoscut     | 10 zile       | 20 zile                     |

Multiplicatorul „blocked in transit" e `2×` peste threshold-ul normal.

## Cum funcționează

1. Query: `SELECT ... FROM orders WHERE status='shipped' AND shipped_at IS NOT NULL LIMIT 500`.
2. Pentru fiecare comandă, `decideAutoFinalize` calculează zile-de-la-expediere
   și compară cu threshold-ul curierului.
3. Comenzile peste threshold sunt actualizate bulk la `status='completed'`.
4. Pentru fiecare, se inserează un rând în `order_history` cu
   `changed_by='system-cron'`, `event_type='status_change'`, și `new_value`
   conține `{ status: 'completed', previous_status: 'shipped', reason: 'auto_finalize' }`.
5. Comenzile care depășesc 2× threshold sunt logged cu `console.warn` și
   incluse în răspuns ca `blocked` — pentru monitorizare/alertare ulterioară.

## Dependențe schema

Migrația `045_shipped_at_column.sql` adaugă:

- `orders.shipped_at TIMESTAMPTZ` — populat când statusul devine `shipped`.
- Index parțial pe `(shipped_at) WHERE status='shipped'` pentru query-ul cron.
- Backfill din `order_history` pentru comenzi shipped existente.

`shipped_at` se populează în două locuri:
- `src/app/api/admin/orders/[id]/generate-awb/route.ts` — când se creează AWB.
- `src/app/api/admin/orders/[id]/status/route.ts` — pe override manual de status către `shipped`.

## Răspuns API

```json
{
  "success": true,
  "data": {
    "finalizedCount": 3,
    "blockedCount": 1,
    "processedAt": "2026-05-27T06:00:00.000Z",
    "finalized": [
      { "id": "...", "friendlyOrderId": "EGH-2026-001", "days": 7, "threshold": 5 }
    ],
    "blocked": [
      { "id": "...", "friendlyOrderId": "EGH-2026-007", "days": 13, "threshold": 5 }
    ]
  }
}
```

## Debug în development

În `NODE_ENV=development` există și `GET` care returnează deciziile fără să
modifice nimic:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/auto-finalize-delivered
```

## Teste

- `tests/unit/lib/courier/auto-finalize.test.ts` — 10 teste pe logica pură.
- `tests/unit/api/cron-auto-finalize-delivered.test.ts` — 10 teste pe endpoint
  (auth, threshold-uri, audit trail, error handling).
