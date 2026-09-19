# 19.09.2026 — documentero.ro: test A–Z pe live (transfer bancar) și ce a reparat
<!-- categorie: comenzi -->

## Pentru echipă

- Am făcut o comandă de test **pe site-ul live documentero.ro**, de la primul
  pas până la pagina de status: `E-260919-HJ9X9`, certificat de naștere,
  client „Test Documentero”, plată prin **transfer bancar**. Comanda stă în
  tabul „Așteptare plată” din admin, cu chipul „documentero”. **NU o
  procesați** — e test. Raul decide: „Confirmă plata” ca să vedem factura,
  numărul de registru și emailul de confirmare pe brandul documentero, sau
  anulare.
- Tot ce ține de client a mers pe brandul documentero: wizardul, checkout-ul,
  pagina de succes, pagina de status cu IBAN și încărcarea dovezii, contractul
  generat, footerul cu ANPC.
- Reparat în urma testului:
  - emailul cu datele de transfer pleca cu antetul eghiseul și cu link de
    status pe eghiseul.ro; acum e pe brandul comenzii;
  - până când domeniul documentero.ro e verificat în Resend, emailurile
    documentero pleacă de pe expeditorul eghiseul (altfel s-ar pierde);
  - pagina de succes nu mai oferă „Vrei un cont?” pe documentero (fără cont);
  - linkul „Politica de cookie-uri” din banner dădea 404 pe documentero;
    trimite acum la pagina de pe eghiseul.ro.
- Comanda `E-260919-ADXE7` (testul local de mai devreme) rămâne `pending`,
  neplătită; o închide cronul de abandon.

---

## Rezumat tehnic

### Fluxul verificat pe producție (Playwright, `documentero.ro`)

Pasul 1 (cod alocat `E-260919-HJ9X9`) → 2 manual (CNP `1900101300018`) → 3
stare civilă → 4 fără opțiuni → 5 act + selfie → 6 semnătură + 3 consimțăminte
→ 7 Sameday Standard 24H → 8 PF → submit (`pending`, `document_generated`,
`order_submitted`) → checkout `title` „Comanda ta — documentero.ro” →
„Plasează comanda — plătesc prin transfer” → `awaiting_payment` /
`awaiting_verification` / `bank_transfer` / `platform='documentero'` →
`/comanda/success/…?method=bank_transfer` → `/comanda/status/` cu IBAN,
referință, dovadă, istoric, contract.

### Reparate

- `src/app/api/orders/[id]/bank-transfer/route.ts`: `brandForOrder(order)` +
  `appBaseForOrder(order)` (select cu `platform`), `brand` în ambele
  șabloane (`bank-transfer-pending.ts` → `brandedEmailHtml({ brand })`),
  `from: brand.emailFrom`, `serviceName` fallback pe numele brandului; linkul
  de admin rămâne pe `NEXT_PUBLIC_APP_URL`.
- `src/lib/email/resend.ts`: `resolveFrom()` — `from` pe un domeniu care nu e
  în `RESEND_VERIFIED_DOMAINS` (implicit `eghiseul.ro`) cade pe expeditorul
  implicit, cu `console.warn`; altfel Resend răspunde 403 și emailul se
  pierde. Se aplică și confirmării de comandă (care deja trimitea cu
  `brand.emailFrom`). Test: `tests/unit/lib/email/resolve-from.test.ts`.
  ⚠️ După verificarea domeniului în Resend: `RESEND_VERIFIED_DOMAINS=eghiseul.ro,documentero.ro` în Vercel.
- `src/app/(order)/comanda/success/[orderId]/page.tsx`: `AccountOfferCard`
  doar pe `brand.id === 'eghiseul'` (ambele locuri).
- `src/components/consent/cookie-consent.tsx`: pe alt brand decât eghiseul,
  linkul politicii de cookie-uri e `${brand.legalBaseUrl}/politica-cookies/`.

### Neverificat / rămas

- Emailul clientului: conectorul Gmail din sesiune e pe alt cont; Raul se
  uită în inbox (`sishuletz@gmail.com`) după „Comanda E-260919-HJ9X9 — date
  de plată prin transfer bancar”. Prima versiune a plecat cu antetul eghiseul
  (reparat abia după test).
- După „Confirmă plata”: factura Oblio, numărul din registrul central cu
  `platform='documentero'`, emailul de confirmare, `success_url`.
- Preload inutil `logo-wide-white.webp` pe paginile `(order)` de pe
  documentero (avertisment consolă, nu eroare).
