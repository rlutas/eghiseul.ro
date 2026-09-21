# 21.09.2026 — documentero.ro: Vercel și DNS verificate; un singur blocaj, căsuța de email
<!-- categorie: infrastructura -->

## Pentru echipă

Site-ul documentero.ro e în regulă tehnic (domeniu, redirecturi, deploy,
cron-uri, emailurile pleacă de pe `contact@documentero.ro` și ajung în Inbox,
nu în Spam).

**Un lucru NU merge încă**: adresa `contact@documentero.ro` nu poate PRIMI
email. Dacă un client dă „Reply” la un email de la documentero sau scrie la
adresa de pe site, mesajul lui se pierde. Până se rezolvă (Raul, în Zoho),
clienții documentero sunt de urmărit pe WhatsApp și prin formularul de contact
de pe site (acela merge, ajunge în căsuța eghiseul cu „[documentero]” în
subiect).

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
- Lipsă: MX pe apex și TXT de verificare Zoho → `contact@documentero.ro` nu
  primește. Pași: Zoho Mail → Domains → add `documentero.ro` ca alias de
  domeniu (org eDigitalizare), copiază TXT-ul de verificare; Vercel DNS →
  TXT-ul Zoho + MX `mx.zoho.eu` 10 / `mx2.zoho.eu` 20 / `mx3.zoho.eu` 50; în
  Zoho, alias `contact@documentero.ro` pe cutia care primește deja
  contact@eghiseul.ro.
- Emailuri: 6 teste (confirmare, transfer bancar, coș abandonat ×2, completare
  acte, act gata) primite în INBOX pe serviciiseonethut@gmail.com, sender
  `contact@documentero.ro`, Reply-To `contact@documentero.ro`
  (după fix-ul de azi).
