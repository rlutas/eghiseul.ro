# Analiză prețuri curier — acuratețe & „să nu pierdem bani"

**Data:** 2026-06-24

## Surse de preț (real API vs estimat)

| Curier | Serviciu | Sursă | Formulă | File:Line |
|---|---|---|---|---|
| Sameday | Standard 24h | **ESTIMAT** | `14 + greutate*4` + 21% TVA | `sameday.ts:540` |
| Sameday | EasyBox locker | **ESTIMAT** | `(14 + greutate*4) * 0.85` | `sameday.ts:541` |
| Fan Courier | Standard | **API REAL** | `/reports/awb/internal-tariff` | `fancourier.ts:431` |
| Fan Courier | FANbox | **API REAL** | internal-tariff + service=FANbox | `fancourier.ts:506` |
| Fan Courier | fallback mock | ESTIMAT | `15 + greutate*5` | `fancourier.ts:1140` |

**Sameday NU are API public de quote** → prețul afișat e estimare; costul real se află la crearea AWB. Risc: real AWB poate diferi de estimare.

## Parametri curenți (verificat)
- Greutate default: **0.5 kg** (plic A4 documente) — `utils.ts:17` / `delivery-step.tsx:381`. Corect pentru plic; dacă se trimit cutii mai grele → preț real mai mare.
- Markup: **15%** (`DELIVERY_MARKUP_PERCENTAGE`, `delivery-step.tsx:65`). Rezonabil.
- **Minim livrare: 20 RON cu TVA** (`delivery-step.tsx`, decizie owner — acoperă procesare/plic). Floor pe toate quote-urile.

## Decizii (2026-06-24)
- **Păstrăm minim 20 RON** (cerință owner: nu pierdem pe procesare/plic). EasyBox iese la 20 (floored) — consistent, nu „prea scump".
- Greutate 0.5 kg + markup 15% = OK pentru plic de documente.

## Backlog (recomandări agent, neimplementate)
- **Monitoring quote vs AWB real** (Sameday): log `console.warn` la creare AWB când costul real diferă >2 RON de prețul oferit (`sameday.ts` createShipment). Gather data ca să validăm formula 14+4/kg.
- Dacă se confirmă că trimitem cutii mai grele, ajustează greutatea default sau oferă selecție.
- Eventual markup diferit pe lockere (+5%) dacă se dovedește risc.

Vezi `docs/changelog/2026-06-24-courier-options-pricing-kyc.md`.
