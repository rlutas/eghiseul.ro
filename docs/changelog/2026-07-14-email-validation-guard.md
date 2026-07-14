# 2026-07-14 — Validare email anti-typo (wizard + submit + success page)

**Context:** E-260713-MG6MF — clientul a scris `mirceamester@gmail.com` (adresă inexistentă), ambele emailuri au bounce-uit, clientul n-avea de unde să știe că documentul e gata. Trei straturi de apărare adăugate:

## 1. Wizard (pas Contact) — sugestie typo în timp real

- Librăria **`@zootools/email-spell-checker`** (succesorul menținut al mailcheck.js: 1,8KB, Sift3, 39 domenii + 66 TLD-uri) + tabel RO custom (`gmail.ro`/`hotmail.ro`/`outlook.ro`/`icloud.ro` → `.com`; whitelist `yahoo.ro/.it/.de/.es/.co.uk`).
- `src/lib/email-typo.ts` (`suggestEmailCorrection`) + warning galben sub câmpul email cu buton „apasă pentru corectare" (`contact-step.tsx`).
- Teste: `tests/unit/lib/email-typo.test.ts` (5).

## 2. Submit (server-side) — guard MX pe domeniu

- `src/lib/email-mx.ts` (`emailDomainAcceptsMail`): `dns.resolveMx` + fallback A-record (RFC 5321), timeout 2,5s.
- **Fail-open**: doar răspunsuri DNS definitive (ENOTFOUND/ENODATA pe MX și A) resping comanda (`EMAIL_DOMAIN_INVALID`, 400, mesaj RO); timeout/erori infra = allow.
- Prinde domenii inexistente/typo (`gmail.ro`, `gmali.com` dacă clientul ignoră warningul). NU prinde local-part greșit pe domeniu valid — pentru asta e webhook-ul de bounce (vezi next steps).
- SMTP mailbox probing evitat intenționat (Gmail/Yahoo nu răspund corect + arde reputația IP).

## 3. Pagina de succes — verificare vizuală + status page

- **Servicii instant (CF + constatator):** box verde „Documentul se eliberează automat — de obicei în ~5 minute" cu link spre pagina de status + îndemn la refresh.
- **Toate serviciile:** box cu emailul introdus, mare și clar — „documentele se trimit AICI, verifică dacă e corect" + telefon/email de corectare. Dacă detectăm typo de domeniu → box roșu cu sugestia.

## Ce NU acoperă (și ce urmează) — NEXT STEPS

| # | Task | De ce |
|---|---|---|
| 1 | ~~Webhook Resend `email.bounced`~~ **FĂCUT** (`/api/webhooks/resend`): verificare semnătură Svix → marchează comenzile clientului (`email_bounced_at` + `email_bounce_reason`, migrarea 111, aplicată) → **banner roșu în admin pe comandă** (lângă email) + alertă pe contact@ cu comenzile și telefonul clientului. FĂRĂ SMS (decizie user). **Setup manual rămas:** Resend dashboard → Webhooks → endpoint `https://eghiseul.ro/api/webhooks/resend`, evenimente `email.bounced` + `email.complained` → secretul `whsec_...` în Vercel env ca `RESEND_WEBHOOK_SECRET` + redeploy. | Singura plasă pentru local-part greșit pe domeniu valid (cazul MG6MF) |
| 2 | GSC: Request indexing rămas pe 4 URL-uri (istoric, 2 pagini servicii, homepage) | fiecare cerere ~1 min (test live Google) |
| 3 | DMARC: după 2-4 săpt de rapoarte pe contact@ → `p=quarantine` | protecție anti-spoofing reală |
| 4 | ~~Clientul MG6MF~~ REZOLVAT — documentul trimis manual de Raul (14.07) | — |
| 5 | Re-check poziții SERP CF/constatator (~27 iul) + validare review snippets în GSC | măsurare plan SEO |
| 6 | OTS Agerpres „primul serviciu 100% automat 24/7" | decizie user (cost mic, slot SERP) |
