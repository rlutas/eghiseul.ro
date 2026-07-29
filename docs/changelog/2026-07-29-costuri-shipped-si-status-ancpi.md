# Costuri interne: pop-up la Expediată + card legat de comandă · Status ANCPI pe identificare imobil

**Data:** 2026-07-29 (după-amiază) · Raportat de Raul + echipă

## 1. Pop-up-ul de costuri se deschide acum și la „Expediată"

**Problema:** dialogul „Cât ne-a costat?" apărea doar la tranziția în `completed`. Dar
momentul natural e generarea AWB-ului: comanda trece în `shipped`, iar traducerea /
apostila / legalizarea sunt certe (altfel n-aveai ce expedia). Echipa nu vedea
dialogul când sumele erau proaspete.

**Fix:** dialogul se deschide la prima tranziție în `shipped` SAU `completed`
(`COST_ASK_STATUSES`, `admin/orders/[id]/page.tsx`). Nu întreabă de două ori:
liniile deja înregistrate ies din `pending` prin `existingKeys`, deci la
`completed` ulterior dialogul nu mai are ce cere și nu apare.

## 2. Cardul „Cost intern & marjă" arată liniile DERIVATE din comandă

**Problema (raportată de echipă):** cardul afișa doar costurile deja înregistrate +
un formular liber (furnizor + categorie + sumă), fără nicio legătură cu ce e pe
comandă — colegii nu știau ce să completeze. API-ul calcula liniile lipsă
(`pending`) dar cardul nu le afișa nicăieri.

**Fix:** secțiune „De completat — de pe această comandă" în card: câte un rând per
linie derivată din opțiuni (traducere · limbă — document, legalizare, apostilă
notarială, taxa ONRC/ANCPI), cu suma pre-completată din tarif sau din ultima
plată și buton „Salvează" per rând — același payload ca dialogul (document +
limbă atașate). Formularul liber rămâne dedesubt pentru costuri neprevăzute.

## 3. Stare portal ANCPI pe serviciile de identificare (cerință Raul)

Identificarea de imobil se face în e-Terra, dar clientul nu vedea nicăieri că
ANCPI e picat — risc de comenzi plătite fără avertisment în plin blocaj.

- **Listă nouă `PLATFORM_DEPENDENT_SERVICES`** (`lib/services/platform-services.ts`):
  identificare-imobil, identificare-imobile-proprietar, copie-carte-funciara,
  copie-plan-cadastral, certificat-detineri-imobile → `ancpi`. NU sunt în
  `INSTANT_PLATFORM_SERVICES` — își păstrează termenul propriu, estimarea și
  fluxul; lista alimentează DOAR badge-ul de status.
- **Wizard:** sidebarul arată `SystemStatus` și pentru serviciile dependente
  (prin `platformStatusProvider()`), pe lângă cele instant.
- **Paginile de serviciu** `/servicii/identificare-imobil/` și
  `/servicii/identificare-imobile-proprietar/`: badge-ul live în hero, sub USP.
- **`SystemStatus` are prop nou `autoIssued`** (default true): pe serviciile
  manuale eticheta „Eliberare automată · 24/7" (falsă acolo) devine „Portal ANCPI".

## Fișiere

- `src/app/admin/orders/[id]/page.tsx` — trigger `shipped`, secțiunea „De completat"
- `src/lib/services/platform-services.ts` — `PLATFORM_DEPENDENT_SERVICES` + `platformStatusProvider()`
- `src/components/services/system-status.tsx` — prop `autoIssued`
- `src/components/orders/price-sidebar-modular.tsx` — badge pe dependente
- `src/app/servicii/identificare-imobil{,e-proprietar}/page.tsx` — badge în hero
