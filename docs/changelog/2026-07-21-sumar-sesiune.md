# 2026-07-21 — Sumar sesiune (tot ce s-a livrat)

Index al lucrărilor din sesiune. Detaliile în docurile individuale.

## eghiseul.ro
- **Standby doar în „Așteptare client"** — status standby scos din grupul „În
  procesare" (nu se mai dubla). → `2026-07-21-standby-doar-in-asteptare-client.md`
- **Fix KYC: încărcările se suprascriau** (stale closure) — fiecare upload
  ștergea documentele anterioare; blocajul clientei străine. + 2 fixuri de race
  (PersonalDataStep, CompanyDocumentsStep) + clarificare bifă pașaport RO.
  → `2026-07-21-fix-kyc-upload-suprascriere.md`
- **Descărcare PDF** cereri/împuterniciri (colegi fără Word) — buton dă PDF.
  ⚠️ blocat de `CLOUDCONVERT_API_KEY` (nu există nicăieri — de creat cont).
  → `2026-07-21-descarcare-pdf-cereri-imputernicire.md`
- **Badge culori pe serviciu** în lista de comenzi + **timp relativ** („acum X
  zile") + **dată scurtată** (DD.MM). → `2026-07-21-badge-culori-servicii-admin.md`
- **Facturare străină verificată** — PF pe orice țară, mapare Oblio OK (state='-',
  fără CNP). → memorie `facturare-internationala`.
- **e-Factura caractere non-latine** (chirilic/grec) — cercetat + documentat, fix
  amânat. → `docs/technical/specs/efactura-caractere-non-latine.md`
- **„Unde s-a blocat clientul" — Faza 1** — coloană `current_step` pe draft
  (migrarea 129), lista admin arată pasul, resume revine la pasul corect.
  → `docs/plans/2026-07-21-client-blocat-in-formular.md`

## cazierjudiciaronline.com + ecazier.ro
- **Standby doar în „Așteptare client"** (paritate eghiseul).
- **Fix deploy eșuat** (funcție >250MB — loop existsSync → Turbopack împacheta tot
  proiectul) + **nume PDF prietenoase** la descărcare + **meniu „Cazier Judiciar
  Diaspora"** clarificat (cazier românesc, nu din alte țări).
- **„Solicită documente" (reupload) — LIVE** — operatorul cere documente specifice
  de la client (CI expirat, selfie neclar); link + email, standby, card progres.
  → `docs/session-logs/2026-07-21-solicita-documente-reupload.md`
- Fix signed URL documente expira (deja livrat separat).

## Operațional
- **DHL — analiză cost livrare + negociere** — 496 colete/95k RON/2 ani; fuel
  surcharge 27%→47% din apr 2026; taxăm 250 flat, pierdem pe distanțe. Cerere
  trimisă → răspuns account manager Adrian Tircavu, simulări tarif de bază 22.07.
  → `docs/operations/dhl-livrare-analiza-cost-negociere.md`

## Pași manuali rămași (Raul)
- **CJO**: `CLOUDCONVERT_API_KEY` (cont CloudConvert) pt PDF pe ambele platforme.
- **DHL**: aștept simulările tarif de bază de la Adrian (22.07 p.m.).
