# 2026-08-17 — Sameday: predarea plicului în easybox (primul kilometru)

## Problema semnalată

Colega a generat AWB Sameday din admin și AWB-ul iese cu **ridicare de la sediu**, deși noi vrem să
ducem plicul la easybox (mai ieftin). Verificat: nu e setare greșită, ci lipsă de funcționalitate —
`src/lib/services/courier/sameday.ts` trimitea mereu `pickupPoint` (punctul din cont, Satu Mare) și
nu folosea deloc `oohFirstMile`.

Livrarea aleasă de client (acasă sau easybox) e o chestiune separată — ea rămâne exact cum a ales el.

## Ce s-a livrat

**Setare nouă:** Admin → Setări → Curieri → „Predare colete Sameday (easybox)":
comutator + selectorul de easybox (lista se încarcă din județul expeditorului). Salvată în
`admin_settings` sub cheia `sameday_dropoff` (`{enabled, oohId, name}`).

Când e activă, orice AWB Sameday se emite cu `oohFirstMile = <oohId>` — și cel cu livrare acasă
(service 7), și cel cu livrare în easybox la client (service 15 + `oohLastMile`). Observația de pe
AWB primește `Predare: <easybox>` ca să se vadă în listă unde ducem plicul.

| Fișier | Rol |
|---|---|
| `src/lib/services/courier/types.ts` | `ShipmentRequest.dropoffLockerId` |
| `src/lib/services/courier/sameday.ts` | `awbRequest.oohFirstMile` la creare AWB |
| `src/lib/admin/sameday-dropoff.ts` | citește setarea (server) |
| `src/app/api/admin/orders/[id]/generate-awb/route.ts` | aplică setarea la AWB-ul din admin |
| `src/app/api/courier/ship/route.ts` | idem, pe endpointul generic |
| `src/app/api/admin/settings/route.ts` | `sameday_dropoff` în `ALLOWED_KEYS` |
| `src/app/admin/settings/page.tsx` | UI-ul din tabul Curieri |

Fan Courier nu are echivalent în API (clientul lor nici nu suportă predare/ridicare din FANbox la
emitere), deci setarea e strict pentru Sameday.

## Ce am verificat live (`POST /api/awb/estimate-cost`, cont de producție)

| Test | Rezultat |
|---|---|
| acasă (service 7), fără `oohFirstMile` | 200 → 28,75 RON net |
| acasă (service 7), cu `oohFirstMile=1012` | 200 → **28,75 RON** (același tarif) |
| fără `pickupPoint` | 400 „PickupPoint este invalid!" |
| easybox client (service 15) + `oohLastMile` | 400 — limitarea știută a estimării pe locker |

Deci: `pickupPoint` rămâne obligatoriu chiar și cu predare în easybox, iar **API-ul nu arată niciun
preț mai mic**. Dacă economia e reală, vine din contract (ridicarea de la sediu facturată separat) —
**de confirmat pe prima factură Sameday după activare**.

## De făcut

- [ ] Alege easybox-ul de predare din Setări → Curieri (Satu Mare: `1012` OMV Coandă, `308` MOL Satu Mare)
- [ ] La primul AWB emis cu setarea activă, verifică pe eticheta Sameday că apare predarea în easybox
- [ ] Verifică pe factura următoare dacă dispare/scade linia de ridicare
