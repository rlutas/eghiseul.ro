# Sameday — integrare curier (features & API)

Tot ce știm despre integrarea Sameday. Verificat LIVE pe `api.sameday.ro` (2026-06-24).
Client: `src/lib/services/courier/sameday.ts`. Spec veche: `../technical/specs/sameday-api-integration.md`. Doc oficial API: `descarca-documentatia-api.pdf` (acest folder).

## Credențiale & mediu (env)
```
SAMEDAY_USERNAME=...
SAMEDAY_PASSWORD=...
SAMEDAY_USE_DEMO=false   # true → https://sameday-api.demo.zitec.com ; false → https://api.sameday.ro
```

## Autentificare
`POST /api/authenticate`
- Headers: `X-AUTH-USERNAME`, `X-AUTH-PASSWORD`, `Content-Type: application/x-www-form-urlencoded`
- Body: `remember_me=1&_format=json`
- Răspuns: `{ token, expire_at_utc, ... }`
- Apoi toate request-urile: header `X-AUTH-TOKEN: <token>`. Token cache-uit până la expirare; 401 → re-auth o dată.

## Endpoint-uri folosite
| Scop | Endpoint | Note |
|---|---|---|
| Auth | `POST /api/authenticate` | vezi mai sus |
| Județe | `GET /api/geolocation/county?countPerPage=50` | `{data:[{id,name}]}` — ex. Cluj id=14 |
| Orașe | `GET /api/geolocation/city?county={id}&countPerPage=500&page=N&name=X` | paginat; ex. Cluj-Napoca id=5479 |
| Pickup points | `GET /api/client/pickup-points?countPerPage=100` | `defaultPickupPoint` + `contactPersons[].default` |
| Lockere EasyBox | `GET /api/client/ooh-locations?listingType=0&countryCode=RO&countPerPage=500&page=N` | toate lockerele RO; **paginare în paralel** (perf) |
| **Estimare cost** | `POST /api/awb/estimate-cost` | **preț real fără AWB** — vezi mai jos |
| Creare AWB | `POST /api/awb` | returnează `{awbNumber, awbCost, pdfLink}` |

## Service IDs (`SAMEDAY_SERVICES`)
`STANDARD_24H=7`, `LOCKER_NEXTDAY=15`, `PUDO_NEXTDAY=57`, `STANDARD_RETURN=10`, `LOCKER_RETURN=24`.

## Estimare cost — `POST /api/awb/estimate-cost` (VERIFICAT LIVE)
Payload (același ca la AWB, recipient minim):
```json
{
  "packageType":"1", "packageNumber":"1", "packageWeight":"0.5",
  "service":"7", "awbPayment":"1", "cashOnDelivery":"0",
  "insuredValue":"0", "thirdPartyPickup":"0",
  "awbRecipient": { "name":"Estimare","phoneNumber":"0700000000","personType":"0",
                    "county":"14","city":"5479","address":"...","postalCode":"" },
  "parcels":[{"weight":"0.5","width":"22","length":"30","height":"1"}],
  "pickupPoint":"<id>"
}
```
**Răspuns:** `{ "amount": 28.6, "currency": "Ron", "time": 24 }` — `amount` = tarif **net RON (fără TVA)**, `time` = ore. (Confirmat owner: +21% TVA la final.)

- **Standard (service 7)**: merge cu county+city → preț real. Ex. 0.5kg Cluj→Cluj = **28.6 RON**.
- **Locker (service 15)**: întoarce **400** fără un locker specific (`oohLastMile`). La quote-time nu avem locker ales → în cod facem **fallback la `standard*0.85`**.

## Flux preț în app
1. `sameday.getQuotes` → încearcă `getEstimatedQuotes` (estimate-cost real); fallback la `getBasePriceQuotes` (`14+4/kg`) dacă eșuează.
2. UI (`delivery-step.tsx`): `applyMarkup` **+15%** + **floor minim 20 RON cu TVA**.
3. TVA 21% adăugat (price → priceWithVAT).
> ✅ Confirmat (owner, 2026-06-24): pe factura Sameday `amount` apare **fără TVA**; cei 21% se adaugă la factura finală. Tratamentul din cod (amount = net + 21%) e corect.

## Important
- **Greutate default 0.5 kg** (plic documente) — `DEFAULT_DOCUMENT_PACKAGE` în `courier/utils.ts`. Dacă se trimit cutii mai grele → preț mai mare.
- Estimarea veche `14+4/kg` SUBESTIMA (16 vs 28.6 real) → pierdeam bani. Acum folosim estimate-cost real.
- Lockere: încărcate o dată (cache module-level, TTL 10 min), filtrare county/city client-side.

## Test live (script ad-hoc)
Auth → geolocation/county → city → pickup-points → estimate-cost. Confirmat 200 + `amount`. (Script temporar, nu commit-uit; reface oricând cu env-ul.)

## Monitoring (implementat)
- La creare AWB (`api/courier/ship`): compară `result.priceWithVAT` (cost real curier) cu `orders.delivery_price` (încasat). Dacă real − încasat > 1 RON → `console.warn [Courier cost mismatch]` (audit „nu pierdem bani").

## Backlog
- Preț real locker: estimate-cost cu service=15 + `oohLastMile` întoarce încă 400 (validare strictă Sameday, fără eroare pe câmp). Acum fallback `standard*0.85`. De reluat cu payload-ul exact din AWB locker reușit (după prima livrare locker reală).
- Monitoring quote vs `awbCost` real la creare AWB.
