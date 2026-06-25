# 2026-06-25 — OCR din PDF + clarificare document RO CEI

## OCR din PDF (act de identitate)
Mulți clienți încarcă **PDF** (nu poză) pentru act. Funcțiile de extragere din `document-ocr.ts` strip-uiau prefixul data-URL doar pentru imagini (`/^data:image\/\w+;base64,/`) — dacă base64-ul venea cu prefix `data:application/pdf;base64,`, nu era curățat → Gemini primea date corupte.

Fix: regex generic `/^data:[^;]+;base64,/` în toate cele 6 extractoare → orice tip (imagine sau PDF) e curățat corect. Gemini procesează PDF nativ, deci datele se extrag acum și din PDF (act CI, pașaport, RO CEI). Upload-ul deja trimitea `mimeType: application/pdf` + base64 raw; ruta `/api/ocr/extract` pasează mimeType prin.

## Clarificare document RO CEI Reader
Clienții nu înțelegeau ce e PDF-ul RO CEI. Text actualizat în wizard (pasul 2, CI nou):
- Titlu banner: „Pas final — **documentul care îți confirmă adresa**".
- Explicație: „Pe cărțile de identitate noi adresa **nu mai apare tipărită** — e doar în cip. Acest PDF e documentul care îți **confirmă adresa de domiciliu**."
- Titlu card upload: „PDF care confirmă adresa (RO CEI Reader)".

## Verificat
Build OK, **1089 teste verzi**.
