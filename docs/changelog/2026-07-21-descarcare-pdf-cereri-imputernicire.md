# 2026-07-21 — Descărcare PDF pentru cereri/împuterniciri (colegi fără Word)

## Problemă (ambele platforme)
Cererile și împuternicirile se generează ca **DOCX**. Colegii pe Windows fără
Microsoft Word nu le pot deschide aranjate — trebuiau să le descarce și să le
urce în Google Drive ca să le vadă/printeze. O colegă nu are deloc Word.

## Cauză
- **eghiseul.ro**: butonul „Descarcă" servea DOCX-ul brut. (PDF-ul exista deja
  la „Previzualizare", dar nu ca fișier de descărcat.)
- **cazierjudiciaronline.com**: conversia DOCX→PDF la generare folosea
  **LibreOffice cu cale hardcodată macOS** (`/Applications/LibreOffice.app/...`)
  — nu există pe Vercel → `execSync` arunca → returna null → se salva **DOCX**.
  Conversia era practic moartă în producție.

## Fix
### eghiseul.ro
- `preview-document` route: parametru nou `?download=1` → servește PDF-ul
  randat (CloudConvert) ca **attachment**; dacă PDF-ul nu se poate face, cade pe
  DOCX-ul original (nu pe HTML).
- Admin `handleDownloadDocument`: pentru documente `.docx`/`.doc` descarcă
  PDF-ul (via `preview-document?download=1`); pentru fișiere deja-PDF, direct.
- Butonul apare „Descarcă PDF" pentru documente Word, „Descarcă" pentru restul.

### cazierjudiciaronline.com
- `src/lib/docx-to-pdf.ts`: adăugat convertor **async prod-capable**
  (`convertDocxToPdfAsync` — CloudConvert în prod, soffice în dev) +
  `isPdfConversionAvailable()`. Convertorul sync vechi (macOS-only) rămas, dar
  nu se mai bazează pe el.
- `admin/orders/[id]/doc/route.ts`: pentru căile `.docx` convertește **la cerere**
  DOCX→PDF și cache-uiește `<cale>.pdf` în storage → și documentele VECHI se
  deschid ca PDF, fără regenerare. Fallback: DOCX-ul original.

## ⚠️ Pas ops necesar (CJO)
`CLOUDCONVERT_API_KEY` **NU e setat** pe cazierjudiciaronline.com. Fără el,
conversia CJO returnează null în prod (rămâne DOCX, fără regresie). De copiat
cheia din env-ul eghiseul → Vercel CJO (Production + Preview) + `.env.local`,
apoi redeploy.

## Addendum — nume fișiere descărcate (CJO) + reordonare admin (eghiseul)
- **CJO** `doc/route.ts`: nume de descărcare prietenoase ca pe eghiseul, via
  `createSignedUrl(..., { download })` — `cerere-eliberare-pf-<nr>.pdf`,
  `imputernicire-<nr>.pdf`, `imputernicire-integritate-<nr>.pdf`,
  `contract-<nr>.pdf`. Operatorul diferențiază ușor documentele. Imaginile
  (CI/selfie) rămân inline neschimbate.
- **eghiseul** admin comandă: cardul „Proveniență client" mutat din grila de sus
  la baza paginii (info de context, nu operațional — sus îngreuna citirea).
