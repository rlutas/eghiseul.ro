# 21.09.2026 — documentero.ro: Vercel și DNS verificate; un singur blocaj, căsuța de email
<!-- categorie: infrastructura -->

## Pentru echipă

Site-ul documentero.ro e în regulă tehnic (domeniu, redirecturi, deploy,
cron-uri, emailurile pleacă de pe `contact@documentero.ro` și ajung în Inbox,
nu în Spam).

**Adresa de contact a documentero este `contact@eghiseul.ro`** (decizie
Raul, 21.09: nu facem cutie separată până nu crește platforma). Emailurile
pleacă de pe `contact@documentero.ro`, dar când clientul dă „Reply” sau scrie
la adresa de pe site, mesajul vine în căsuța eghiseul, ca până acum. Răspundeți
cu numele documentero.ro dacă subiectul sau comanda (cod `E-…`, platformă
documentero) arată că omul a venit de acolo.

---

## Verificat

- Vercel, proiectul `eghiseul-ro`: `documentero.ro` Production,
  `www.documentero.ro` 308 → apex; HTTP → HTTPS 308; HSTS `max-age=63072000`;
  deploy-uri Production toate Ready, ultimul `fa7ea5d6`; `vercel.json` cu 10
  cron-uri (recovery-emails, lifecycle-emails, extra-payment-reminders…) —
  toate brand-aware prin `orders.platform`. `/comanda/certificat-nastere/` și
  `/comanda/status/` 200 pe host.
- Env: `NEXT_PUBLIC_GA_MEASUREMENT_ID_DOCUMENTERO` (Production) pus 21.09;
  `RESEND_VERIFIED_DOMAINS` nu e necesar (implicit include documentero.ro).
- DNS (Vercel): `resend._domainkey` TXT (DKIM), `send` TXT (SPF) + MX
  (Resend), CAA ×3, ALIAS-urile Vercel. Adăugat 21.09: `_dmarc` TXT
  `v=DMARC1; p=none; rua=mailto:contact@eghiseul.ro`.
- Fără MX pe apex, intenționat: `BRANDS.documentero.contactEmail =
  'contact@eghiseul.ro'` (site, emailuri, schema) și `defaultReplyToFor`
  alege `contactEmail` al brandului după domeniul din `from` → Reply-To
  `contact@eghiseul.ro`. Dacă vreodată se face cutia documentero: alias de
  domeniu în Zoho + TXT + MX `mx.zoho.eu` 10 / `mx2.zoho.eu` 20 /
  `mx3.zoho.eu` 50 în Vercel DNS, apoi `contactEmail` înapoi pe
  `contact@documentero.ro`.
- Emailuri: 6 teste (confirmare, transfer bancar, coș abandonat ×2, completare
  acte, act gata) primite în INBOX pe serviciiseonethut@gmail.com, sender
  `contact@documentero.ro`, Reply-To `contact@documentero.ro`
  (după fix-ul de azi).
