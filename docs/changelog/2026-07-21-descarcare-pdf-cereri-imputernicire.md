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

## ⚠️ Pas ops necesar (AMBELE platforme) — CORECȚIE 2026-07-21
`CLOUDCONVERT_API_KEY` **NU există nicăieri** — verificat: `.env.local`, `.env*`,
`.vercel/` pe ambele repo-uri ȘI env-urile Vercel (Prod/Preview/Dev) ale ambelor
proiecte. Corecție față de o afirmație anterioară din acest changelog: **nici
eghiseul nu are cheia**. Implicații:
- Conversia DOCX→PDF în producție cade pe DOCX pe **AMBELE** platforme (fără
  regresie — codul e scris, doar convertorul lipsește). Colegii fără Word tot nu
  primesc PDF până se adaugă cheia.
- Preview-ul PDF „fidel" din admin eghiseul merge doar **local** (LibreOffice pe
  Mac), NU în prod.

**De făcut (Raul):** cont CloudConvert (https://cloudconvert.com), API key cu
scope `task.read` + `task.write`, apoi cheia se pune pe **ambele** proiecte
Vercel (Prod+Preview) + `.env.local` + redeploy. O singură cheie aprinde ambele
platforme. Nu se poate crea contul în locul lui (cont + facturare terță).

**Alternativă fără cheie:** generarea directă a cererilor/împuternicirilor ca PDF
(pdf-lib nativ, cum e deja la cazier-fiscal cerere) — zero servicii externe, dar
cere rescris fiecare template. Decizie amânată de Raul („lasă așa, o să vedem").

## Addendum — nume fișiere descărcate (CJO) + reordonare admin (eghiseul)

## Addendum — nume fișiere descărcate (CJO) + reordonare admin (eghiseul)
- **CJO** `doc/route.ts`: nume de descărcare prietenoase ca pe eghiseul, via
  `createSignedUrl(..., { download })` — `cerere-eliberare-pf-<nr>.pdf`,
  `imputernicire-<nr>.pdf`, `imputernicire-integritate-<nr>.pdf`,
  `contract-<nr>.pdf`. Operatorul diferențiază ușor documentele. Imaginile
  (CI/selfie) rămân inline neschimbate.
- **eghiseul** admin comandă: cardul „Proveniență client" mutat din grila de sus
  la baza paginii (info de context, nu operațional — sus îngreuna citirea).
