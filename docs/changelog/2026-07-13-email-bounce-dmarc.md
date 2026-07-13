# 2026-07-13 (noaptea) — Bounce comandă MG6MF, DMARC, igienă email

## Incident: emailuri bounce-uite la comanda E-260713-MG6MF

**Simptom:** clientul (MESTER MEDIA S.R.L.) nu a primit nici confirmarea, nici emailul „constatatorul e gata" — ambele `bounced` în Resend.

**Cauza reală:** adresa introdusă de client (`mirceamester@gmail.com`) **nu există la Gmail** — hard bounce instant. NU e o problemă de platformă.

**Verificat și exclus:**
- Ștergerea eghiseul de pe cPanel-ul de hosting NU a afectat nimic — nameserverele sunt pe Vercel (`ns1/ns2.vercel-dns.com`), acolo stau toate înregistrările (Zoho MX/SPF, Resend DKIM + send subdomain). Toate verzi.
- Alte emailuri trimise în aceeași zi de pe `comenzi@eghiseul.ro` → livrate normal.

**Rezolvare:** user sună clientul la +40723600877 pentru emailul corect → se actualizează comanda și se retrimit emailurile. Status comandă: `document_ready`.

## Fixuri deliverability (din Resend Insights)

1. **DMARC adăugat** (lipsea complet): `_dmarc.eghiseul.ro TXT "v=DMARC1; p=none; rua=mailto:contact@eghiseul.ro"` — Vercel DNS, rec_b59cbda109f38fcdd47e512c. `p=none` = monitoring (rapoartele vin pe contact@); după 2-4 săptămâni de rapoarte curate se poate trece la `p=quarantine`.
2. **Linkuri wa.me scoase din emailuri** (commit `5523423`): Resend marca mismatch domeniu-link (spam signal). `order-confirmation.ts` + `branded-layout.ts` → link spre `eghiseul.ro/contact`.
3. **Test livrare Gmail:** email de pe comenzi@ → serviciiseonethut@gmail.com = `delivered` ✅.

## GSC (aceeași sesiune)

- ✅ **Validate fix** pornit pe Review snippets (15 elemente, „Validarea începută" 13.07.2026) — după fix-ul Product schema `6d84852`
- ✅ Request indexing: `/extras-carte-funciara-gratuit/`
- ⏳ Rămase de cerut manual sau în sesiunea următoare: `/certificat-constatator-cu-istoric/`, `/servicii/extras-de-carte-funciara/`, `/servicii/certificat-constatator-online/`, homepage (fiecare cerere durează ~1 min — timpii Google)
