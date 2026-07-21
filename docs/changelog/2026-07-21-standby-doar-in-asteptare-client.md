# 2026-07-21 — Standby doar în „Așteptare client", nu și în „În procesare"

## Cerință
Comenzile pe status `standby` apăreau în DOUĂ tab-uri: „Așteptare client" ȘI „În
procesare". Raul a cerut să apară DOAR în „Așteptare client".

## Cauză
`standby` era inclus în `PROCESSING_GROUP` (regulă veche 2026-07-08: comenzile
parcate rămân vizibile în „În procesare"). Regulă inversată acum.

## Fix
Scos `'standby'` din `PROCESSING_GROUP` pe ambele platforme:

- **eghiseul.ro**: `src/lib/admin/orders-tabs.ts` (sursă unică — acoperă list,
  counts, export, badge-uri tab).
- **cazierjudiciaronline.com**: `src/app/api/admin/orders/route.ts` +
  `src/app/api/admin/orders/counts/route.ts` (grup duplicat în 2 fișiere).

Tab-ul „Așteptare client" folosește tot `.eq('status','standby')` — neschimbat.
`standby` rămâne vizibil în „Toate".
