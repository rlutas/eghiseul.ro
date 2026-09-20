# 20.09.2026 — documentero.ro: pagini legale proprii, toate emailurile pe brandul comenzii, textele eghiseul scoase din flux, OG + logo email, linkuri din eghiseul
<!-- categorie: seo -->

## Pentru echipă

- **Comenzile de test** `E-260919-HJ9X9` și `E-260919-ADXE7` (client „Test
  Documentero") sunt **șterse** din admin. Nu mai apar nicăieri.
- documentero.ro are acum **paginile lui legale**: termeni și condiții,
  confidențialitate, anulare și rambursare, cookie-uri. Regulile de anulare
  (30 de minute / 70% / 100%) sunt aceleași ca pe eghiseul. Raul citește §4
  (transfer bancar) și §6 (două cazuri fără rambursare specifice stării civile).
- **Toate emailurile către client** urmează brandul comenzii: document gata,
  completare, reîncărcare poză, plată suplimentară, link de plată, anulare,
  recuperare comandă, recenzie, expirare, cross-sell, transfer bancar,
  confirmare. Pe documentero: antet verde, logo documentero, contact
  `contact@documentero.ro`, butoane mentă, linkuri pe documentero.ro. Pe
  eghiseul nimic nu s-a schimbat. Expeditorul `contact@documentero.ro` e
  activ (domeniul verificat în Resend).
- În wizardul documentero nu mai apare nimic „eghiseul": nota de selfie,
  declarația de la semnătură, textul de transfer, paginile de upload și
  completare, ecranele de login, specimenele (ascunse pe documentero).
  Contractul de prestări scrie „documentero.ro" și trimite la termenii de pe
  documentero.ro.
- Recenzia după livrare se cere și clienților documentero, pe același profil
  Google al firmei.
- Linkuri din eghiseul spre documentero: footer + pagina „eliberare certificat
  de naștere".
- Search Console: tokenul e în site. Dacă proprietatea e de tip Domain,
  Raul adaugă și TXT în DNS (Vercel): `google-site-verification=R5wF7Ny…`.
- `www.documentero.ro` → 308 spre apex (verificat).

---

## Rezumat tehnic

### Pagini legale (`src/app/documentero/{termeni-si-conditii,politica-de-confidentialitate,politica-de-anulare,politica-cookies}/page.tsx`)

`LegalLayoutDocumentero` (`src/components/documentero/legal-layout.tsx`),
`buildPageMetadata({ brand: 'documentero' })`, JSON-LD cu
`documenteroOrganizationNode`/`documenteroBreadcrumb`, `revalidate 86400`.
Textul eghiseul restrâns la stare civilă + avocat; §4 paragraf nou pentru
transfer bancar (procedura din admin); `politica-de-anulare` citește
`processing_config.allow_self_cancel` filtrat pe `DOCUMENTERO_SERVICE_SLUGS`.
`BRANDS.documentero.legalBaseUrl = 'https://documentero.ro'`; footer cu
`Link`-uri relative + „Politica de cookie-uri"; bannerul de cookie-uri înapoi
la `/politica-cookies/` pe ambele branduri; 4 intrări în
`src/config/documentero-sitemap.ts` (0.3, yearly).

### Emailuri pe brandul comenzii

- 13 șabloane în `src/lib/email/templates/` primesc `brand?: Brand` și îl dau
  la `brandedEmailHtml`; textele hard-codate „eGhișeul.ro"/contact vin din
  `input.brand ?? BRANDS.eghiseul` (ieșirea eghiseul identică byte-cu-byte,
  verificat pe toate 13).
- 17 apelanți: select cu `platform`, `brandForOrder(order)`,
  `from: brand.emailFrom`, linkuri de site din `appBaseForOrder(order)`
  (ONRC/ANCPI/colaborator deliver, reupload finalize + rutele token,
  extra-payment-link + Stripe `success_url`, cancel, request-reupload,
  request-completion, send-payment-link, phone-contact,
  regenerate-extra-payment, modify, cron recovery/lifecycle/extra-payment).
  `orders.platform` lipsește din tipurile Supabase generate → client `as any`
  (tiparul din `bank-transfer`).
- `lifecycle-emails`: `servicePathForBrand()` (documentero nu are
  `/servicii/`), cross-sell filtrat cu `brandSellsService`, recenzia se
  trimite pe orice brand (profilul Google e al firmei).
- `brandedEmailHtml` → `repaintForBrand()`: literalele eghiseul din conținut
  (`#ECB95F` CTA, `#0B1B33` titluri) devin `emailCtaBg`/`emailHeaderBg` ale
  brandului; fără asta butoanele rămâneau aurii pe documentero.
- `resolveFrom`: implicit `eghiseul.ro,documentero.ro` (DKIM/SPF confirmate
  în DNS pe 20.09).
- Rămase: `unsubscribeUrlFor(contact)` = pagina eghiseul (funcționează de pe
  orice host); `SOCIAL_PROOF` în recovery pasul 2 = ratingul firmei (real).

### Fluxul de comandă fără „eghiseul"

`SelfieLegalNotice` (contact + fraza despre servicii), `SignatureStep`
(declarația), `BankTransferDetails`, `AuthLogo` (lockup documentero pe fond
închis), register, `generateMetadata` pe layout-urile `reincarca-poza` /
`completare`, `price-sidebar-modular` + `SpecimenInfoButton` (specimenul doar
pe eghiseul: imaginile au sigla eGHIȘEUL). Contract:
`src/templates/shared/contract-prestari.docx` cu `{{TC_URL}}` și
`{{SITE_NAME}}` (generator: `brandForOrder({ platform })`; `platform` în
contextul din `auto-generate.ts` și `generate-document/route.ts`). ⚠️ Ținta
hyperlinkului din docx rămâne T&C eghiseul (rels nu se templetizează);
textul vizibil urmează brandul.

### Assets, linkuri, măsurători

- `public/og/documentero-default.png` (1200×630) și
  `public/images/brand/documentero-email-logo.png` (660×160), randate din
  marcă + Bricolage.
- eghiseul → documentero: footer (text, coloana Contact) +
  `eliberare-certificat-de-nastere` → `documentero.ro/certificat-de-nastere/`.
- Jaccard (5-shingles, `<main>`): față de surorile eghiseul 0,001–0,003;
  între paginile documentero maxim 0,19 mascat. Scan de tipare AI: curat.
- GSC: `verification.google` în `src/app/documentero/layout.tsx`.
- Comenzile de test șterse din `orders` (FK-uri CASCADE/SET NULL).

Verificat: `tsc` curat, `vitest` 1999 verzi, previzualizare a două emailuri
documentero (document gata, transfer bancar) randate local.
