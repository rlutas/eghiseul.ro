# Email Setup — Resend (trimitere) + Zoho Mail (inbox)

**Domeniu:** `eghiseul.ro`
**DNS actual:** clausweb.ro (se mută pe Vercel la live)
**Ultima actualizare:** 2026-06-30

---

## Arhitectură (două straturi separate)

| Strat | Serviciu | Rol |
|-------|----------|-----|
| **Trimitere automată** | Resend (AWS SES, eu-west-1) | confirmări comandă, facturi, status, recovery cron |
| **Inbox uman** | Zoho Mail (free, 5 useri) | citești + răspunzi de pe contact@ / office@ / comenzi@ |

**Nu se bat cap în cap pe SPF**: Resend folosește subdomeniul `send.eghiseul.ro`
pentru return-path/SPF, iar Zoho folosește rootul `@`. SPF-uri separate, fără
conflict — NU trebuie combinate.

---

## Status (actualizat 2026-06-30)

**TRIMITERE (Resend) = LIVE ✅** — test trimis cu succes la serviciiseonethut@gmail.com (email id 0f3c9629-75c4-4a70-b9bf-9a23f6140576).

- [x] Cont Resend există, domeniu `eghiseul.ro` verificat (id `dc285a79-092c-4f28-aecb-0c3f29b25bfe`), `status: verified`
- [x] Cod integrat (`src/lib/email/resend.ts`), `RESEND_API_KEY` în `.env.local` + `.env.production.local`
- [x] `RESEND_FROM` / `RESEND_REPLY_TO` setate (`contact@eghiseul.ro`)
- [x] **DNS Resend la clausweb.ro** (3 record-uri, propagate) → Resend **verified**
- [ ] **⚠️ Vercel env (production):** `RESEND_API_KEY` + `RESEND_FROM` + `RESEND_REPLY_TO` — FĂRĂ astea nu trimite pe live
- [ ] **Cont Zoho Mail creat** + domeniu verificat (inbox uman — separat de trimitere)
- [ ] **DNS Zoho (verify TXT + MX + DKIM) la clausweb.ro**
- [ ] Cutii create: contact@, office@, comenzi@

> **Notă negative-cache:** verify Resend a durat ~16 min pentru că am declanșat verify înainte de a salva DKIM → resolverul Resend a cache-uit „lipsă DKIM"; SOA minimum clausweb = 86400s (24h). S-a curățat singur. Pe viitor: salvează TOATE record-urile ÎNAINTE de primul Verify.

---

## PARTEA 1 — Resend (DNS la clausweb.ro)

Adaugă în zona DNS `eghiseul.ro` (clausweb → cPanel → Zone Editor):

| Tip | Nume / Host | Valoare | Prioritate |
|-----|-------------|---------|------------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnPujhb+14WPt/u4RbreSklzyq35xxYeR1xdyDGW8VcB7X1xd6Xa1WFkZPtlIZoIPHP+5UqPPGYxUfXyStiocRYcVjLJDk54Gr3afjYR2XHpCpYXuJw/6O+SYYxesbfXhVa6zXkHAp347I13O0ppXccfhpJ9yZRvEZOJ5c1zVc1wIDAQAB` | — |
| MX  | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |

> Dacă clausweb cere FQDN complet la „Name", folosește `resend._domainkey.eghiseul.ro`
> și `send.eghiseul.ro`. Dacă cere doar host relativ, folosește `resend._domainkey` / `send`.

După propagare (5–30 min) → resend.com → Domains → eghiseul.ro → **Verify**.

---

## PARTEA 2 — Zoho Mail (inbox)

1. **zoho.com/mail** → Sign Up → **Free Plan** (Forever Free, 5 useri, 5GB/user)
2. Add domain `eghiseul.ro` → Zoho dă un **cod de verificare TXT** (unic per cont)
3. Pune la clausweb verificarea + MX + DKIM:

| Tip | Nume / Host | Valoare | Prioritate |
|-----|-------------|---------|------------|
| TXT | `@` | `zoho-verification=zb………..zmverify.zoho.com` *(din panoul Zoho)* | — |
| MX  | `@` | `mx.zoho.com` | 10 |
| MX  | `@` | `mx2.zoho.com` | 20 |
| MX  | `@` | `mx3.zoho.com` | 50 |
| TXT | `@` | `v=spf1 include:zoho.com ~all` | — |
| TXT | `zmail._domainkey` | *(cheia DKIM generată de Zoho, unică)* | — |

4. Creează cutiile: **contact@**, **office@**, **comenzi@**
5. Verifică domeniul în Zoho

> ⚠️ Un SINGUR record SPF pe root `@`. Aici e doar Zoho (`include:zoho.com`).
> Resend stă pe `send`, nu atinge rootul. Nu adăuga al doilea TXT SPF pe `@`.

---

## PARTEA 3 — DMARC (recomandat, după ce ambele merg)

| Tip | Nume | Valoare |
|-----|------|---------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@eghiseul.ro` |

`p=none` la start (doar monitorizare). Treci pe `p=quarantine` după 2–4 săptămâni dacă rapoartele sunt curate.

---

## PARTEA 4 — Vercel env (la production)

În Vercel → Project → Settings → Environment Variables (Production):

```
RESEND_API_KEY      = re_…           (din .env.production.local)
RESEND_FROM         = eGhișeul.ro <contact@eghiseul.ro>
RESEND_REPLY_TO     = contact@eghiseul.ro
```

---

## Verificare finală

```bash
# SPF root (Zoho)
dig +short TXT eghiseul.ro | grep spf1
# SPF/MX send (Resend)
dig +short TXT send.eghiseul.ro
dig +short MX  send.eghiseul.ro
# DKIM Resend
dig +short TXT resend._domainkey.eghiseul.ro
# DKIM Zoho
dig +short TXT zmail._domainkey.eghiseul.ro
# MX inbox (Zoho)
dig +short MX eghiseul.ro
```

Test trimitere (după Verify în Resend):
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"eGhișeul.ro <contact@eghiseul.ro>","to":"adresa-ta@gmail.com","subject":"test","html":"<p>merge</p>"}'
```
