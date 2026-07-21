# 2026-07-21 — Fix: încărcările KYC se suprascriau (client blocat la pasul documente)

## Simptom
Comandă cazier PF, cetățean străin (pașaport irlandez) — E-260721-VJWWN.
Clienta încarcă pașaportul (preview vizibil), dar la „Continuă" apărea:
> Nu poți continua — încarcă: Pașaportul, Selfie cu actul de identitate

Deși pașaportul era încărcat. Reproducea și pe alte fluxuri multi-document.

## Cauză (stale closure)
În `KYCDocumentsStep.tsx`:
- `handleFileSelect` are `deps: []` → identitate stabilă → apelează PERMANENT
  `handleUpload` de la primul render.
- Acel `handleUpload` are în closure `personalKyc?.uploadedDocuments` de la
  primul render = **array GOL**.
- `handleUpload` face `uploadedDocuments: [...filteredDocs, newDoc]`, iar
  reducerul `UPDATE_PERSONAL_KYC` face merge care ÎNLOCUIEȘTE cheia.
- `filteredDocs` pornea mereu din array-ul gol → fiecare încărcare nouă
  ȘTERGEA documentele încărcate anterior. Supraviețuia doar ULTIMUL.

Flux străin = 3 documente aici (pașaport + selfie + permis rezidență) →
imposibil să le ai pe toate. Ultimul (permis rezidență) rămânea, de-aia NU
apărea în lista de lipsuri — doar pașaport + selfie. Afecta și românii pe ruta
manuală (act față+spate+selfie) și cazierul auto (permis față+verso).

## Fix
Ref la starea curentă `personalKyc`; `handleUpload` citește
`personalKycRef.current?.uploadedDocuments` (și `.kycValidation`) în loc de
closure-ul învechit → append-urile sunt aditive, nu mai suprascriu.

Fișier: `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx`.
Fără migrare — clienta reîncarcă documentele după deploy.

## Clarificare: cetățean român cu pașaport străin
Clienta E-260721-VJWWN e cetățean ROMÂN cu pașaport străin (dublă cetățenie),
NU străină → NU are nevoie de permis de rezidență. Ruta corectă: rămâne
„cetățean român" + alege „Pașaport" la pasul 2 → scanăm pașaportul (extragem ce
putem, non-blocking, OCR-ul suportă pașapoarte non-RO) → fără permis rezidență.
Ea bifase greșit „Sunt cetățean străin". Am clarificat textul bifei în
`contact-step.tsx`: „Ești român, dar ai doar pașaport străin? NU bifa — alegi
«Pașaport» la pasul următor."

## Audit toate formularele (aceeași clasă de bug)
Scanate toate modulele wizard. Niciun alt `[]`-freeze ca la KYC. DOUĂ fișiere
aveau aceeași formă read-filter-spread-replace, dar cu array-ul în deps → risc
mai îngust: RACE la încărcări async suprapuse (a doua încărcare în zbor
suprascrie prima). Reparate preventiv cu același ref:
- `PersonalDataStep.tsx` (scanări pas 2, OCR 2–10s → suprapunere probabilă) —
  `personalKycRef` pt `uploadedDocuments` + `ocrResults` + `kycValidation`.
- `CompanyDocumentsStep.tsx` (documente PJ, gap FileReader) — `companyKycRef`.
Restul modulelor (vehicle, property, civil-status, constatator, company-data,
contact) = SAFE (fără append de array din closure, sau doar merge scalar).
