# 2026-08-03 — AWB Sameday easybox pica pe rezolvarea adresei (E-260723-VJ39N)

## Simptom

Comanda **E-260723-VJ39N** (easybox Targu Neamt 10, București) avea `lockerId` salvat (backfill 28.07), dar „Generează AWB" din admin a picat cu eroare. Colega a emis AWB-ul manual din contul Sameday (`1ONBLN521485335`) și l-a introdus în admin.

## Cauză

`SamedayProvider.createShipment` rezolva **întâi** județul/orașul din adresa de domiciliu (`resolveCountyId`/`resolveCityId`) și arunca `Could not resolve location` dacă nu găsea orașul — **înainte** de ramura de locker, deși pentru livrarea în locker adresa e irelevantă (destinatarul OOH = doar nume/telefon/email + `oohLastMile`).

Pentru București pica **mereu**: verificat pe API-ul real, județul Sameday `Bucuresti` (id 1) conține doar orașele `Sectorul 1..6` — nu există orașul „Bucuresti". Comanda avea `delivery_address.city = "Bucuresti"` fără sector → `resolveCityId` → null → `ShipmentError`.

## Fix (`src/lib/services/courier/sameday.ts`)

1. Determinarea serviciului (LOCKER_NEXTDAY/PUDO_NEXTDAY) mutată **înaintea** rezolvării geo; la OOH cu `lockerId` rezolvarea județ/oraș se **sare complet**.
2. Ramura de destinatar folosește `isOohWithLocker` (nu doar `isLocker`) — PUDO cu lockerId nu mai poate nimeri ramura de adresă cu ID-uri null.
3. Fallback în `resolveCityId`: „Sector N" (orice variantă cu cifră) se mapează explicit pe „Sectorul N" — pentru livrări la domiciliu în București.

## Admin (`src/app/admin/orders/[id]/page.tsx`)

La livrarea în locker, blocul „Adresa livrare" (domiciliu) **nu se mai afișează** în cardul Livrare — încurca operatorul (coletul merge la easybox, nu acasă). Rămân: locker (punct + adresă) și **Destinatar** (nume · telefon, necesar pentru AWB), mutat în secțiunea Locker.

## Test

`tests/unit/lib/courier/sameday-locker-awb.test.ts` — locker cu adresă București emite AWB fără niciun apel `/api/geolocation`, payload cu `oohLastMile`/`oohType=0` și destinatar fără county/city; plus maparea „Sector 6"→„Sectorul 6" la domiciliu.
