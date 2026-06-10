# Sesiune 2026-06-10 (9) — Polish mobil round 2 (titlu secundar, KYC, bară sticky)

**Status:** ✅ Aplicat (tsc/lint/build OK)

Feedback mobil + ce s-a făcut:

## 1. Titlu „Certificat Integritate" trunchiat (`Certifi…`)
`options-step.tsx`: titlul serviciului secundar stătea pe același rând cu badge-ul + prețul → se trunchia pe mobil. Acum titlul e **full-width pe rândul lui** (fără trunchiere), iar badge-ul „Serviciu secundar" e **sub** el. Numele e mereu vizibil. (commit 9b66c57)

## 2. Bifa „✓ Selfie" inutilă la pasul KYC
`KYCDocumentsStep.tsx`: stepper-ul de progres documente se afișa și pentru un singur document (doar selfie) → „✓ Selfie" izolat, fără sens. Acum apare **doar pentru 2+ documente**. (commit 9b66c57)

## 4. Bară sticky de plată cu sumar comandă (mobil)
`checkout/[orderId]/page.tsx`: bara de jos arăta doar „Total de plată". Acum arată **ce** plătești: numele serviciului (+ PF/PJ) + „N opțiuni · Total: X RON" + butonul de plată. (commit pending)

## 3. Facturare — casete pe un rând? → RECOMANDARE: rămân stivuite
Casetele de sursă facturare (PF/„altă persoană"/PJ) au icon + label + **descriere**. 2-3 pe rând pe mobil le-ar înghesui/trunchia descrierile. Stivuit (`grid-cols-1`, actual) e mai citeț. **Nu am modificat** — de confirmat cu userul dacă vrea totuși 2 pe rând.

## 5. „Am dat de la ultimu pas plata înapoi și…" (mesaj tăiat)
Posibil o problemă la revenirea din pagina de checkout în wizard — de clarificat cu userul (mesajul s-a oprit).

## Verificare
`tsc --noEmit` 0, `eslint` 0 erori, `npm run build` OK.
