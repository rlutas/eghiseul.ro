# 21.09.2026 — Reply-To corect pe emailurile documentero
<!-- categorie: clienti -->

## Pentru echipă

Emailurile trimise clienților documentero (confirmare, transfer bancar,
coș abandonat, completare acte, act gata etc.) plecau corect de pe
`contact@documentero.ro`, dar dacă clientul apăsa „Reply”, răspunsul ajungea
la `contact@eghiseul.ro`. Reparat: răspunsul vine acum la
`contact@documentero.ro`. Verificați în căsuța documentero, nu doar în cea
eghiseul.

Șase emailuri de test au fost trimise pe serviciiseonethut@gmail.com (subiect
cu „[TEST documentero]”): confirmare comandă, transfer bancar, două de coș
abandonat, completare acte, act gata. Toate cu logo și linkuri documentero.

---

## Ce s-a verificat

- Toate căile de trimitere către client citesc brandul din `orders.platform`
  (`brandForOrder`) și dau `from: brand.emailFrom`: confirmare (Stripe și
  transfer), `bank-transfer`, `cancel`, cron `recovery-emails` (abandonate +
  drafturi, inclusiv cele 2 drafturi documentero din DB), cron
  `lifecycle-emails`, cron `extra-payment-reminders`, admin
  `request-completion`, `request-reupload`, `send-payment-link`, `modify`,
  `regenerate-extra-payment`, livrările `collaborator`/`ancpi`/`onrc`.
- Draftul primește `platform` din host la creare (`api/orders/draft`), deci
  recuperarea coșului pentru documentero pleacă pe documentero.
- Lipsea `replyTo` peste tot → `src/lib/email/resend.ts`:
  `defaultReplyToFor(from)`; fără schimbări la apelanți.
- Test real prin Resend: 6 emailuri, `from = documentero.ro
  <contact@documentero.ro>`, `reply-to = contact@documentero.ro`, ID-uri
  Resend `01a0c2c0-…`.
