# 2026-06-27 — Politici confidențialitate / GDPR / cookies extinse

## Context
T&C fusese rescris complet (sesiunea 2026-06-26). Cele 3 pagini legale rămase
(politică confidențialitate 59 linii, GDPR 44, cookies 46) erau subțiri față de
modelul cazierjudiciaronline.com (533 linii) și nu acopereau colaboratorii
(topograf, avocat) ca persoane împuternicite.

## Modificări

### Politica de Confidențialitate (`/politica-de-confidentialitate`)
Rescrisă din 6 → 12 secțiuni:
- Operator de date (eDigitalizare SRL, CUI RO49278701, sediu complet)
- Date colectate pe categorii (identificare, contact, documente/imagini,
  semnătură electronică, plată, tehnice)
- Scop, temei legal (art. 6 GDPR)
- **Destinatari + persoane împuternicite (art. 28 GDPR)**: autorități emitente,
  avocat partener, topograf autorizat (portal colaborator), furnizori tehnici
  (Stripe, Supabase, AWS S3, Google Gemini AI, Resend, SMSLink, Oblio,
  Fan Courier, Sameday, CloudConvert)
- Transferuri internaționale (EU-US DPF, clauze standard art. 46)
- Durata stocării pe categorii, securitate, drepturi GDPR, cookies, contact/ANSPDCP
- BreadcrumbList structured data

### GDPR (`/gdpr`)
- Secțiune nouă „Persoane împuternicite (art. 28 GDPR)" cu link către politica completă
- Drepturi cu referințe la articole, BreadcrumbList

### Politica de Cookies (`/politica-cookies`)
- Secțiune nouă „Cookie-uri și date personale" cu legături către confidențialitate/GDPR
- BreadcrumbList, link-uri interne via next/link

## Verificare
- `npx eslint` pe cele 3 pagini: clean (ghilimele „" literale, fără escape)
- `npm run build`: success, toate 3 prerendate static
