# Webhook Resend — bounce/deliverability pe comenzi

**Endpoint:** `POST https://eghiseul.ro/api/webhooks/resend/` (⚠️ CU slash final — fără el Next.js dă 308)
**Cod:** `src/app/api/webhooks/resend/route.ts`
**Migrări:** 111 (`email_bounced_at`, `email_bounce_reason`), 112 (`email_last_delivered_at`, `email_last_opened_at`) — aplicate 2026-07-14
**Status:** LIVE, verificat end-to-end 2026-07-14 (test semnat → 200 → comandă marcată → alertă livrată pe contact@)

## De ce există

Incident E-260713-MG6MF (13 iul 2026): clientul a introdus o adresă Gmail inexistentă. Confirmarea și emailul „documentul e gata" au bounce-uit silențios — documentul stătea generat, clientul nu avea de unde să știe. Straturile de validare (sugestie typo în wizard + guard MX la submit — vezi `2026-07-14-email-validation-guard.md` în changelog) nu pot detecta un local-part greșit pe un domeniu valid. Webhook-ul e ultima plasă.

## Ce face

| Eveniment Resend | Acțiune |
|---|---|
| `email.bounced`, `email.complained`, `email.failed` | Marchează comenzile recente ale adresei (60 zile, max 5): `email_bounced_at` + `email_bounce_reason` → **banner roșu în admin** pe comandă, lângă email. Trimite alertă pe `contact@eghiseul.ro` (subiect „⚠️ Email BOUNCE: …") cu comenzile, motivul și telefonul clientului + link admin. |
| `email.delivered` | Stampilează `email_last_delivered_at` → „✓ Email livrat (data)" verde în admin. **Curăță flag-ul de bounce** (adresa corectată funcționează → bannerul roșu dispare singur). |
| `email.opened` | Stampilează `email_last_opened_at` → „deschis de client (data)" în admin. Cere **Open Tracking activat** pe domeniu în Resend (pixel; opțional). |
| orice altceva | ACK 200 fără procesare (Resend nu retrimite). |

## Securitate

- Semnătură **Svix** obligatorie (`svix-id`/`svix-timestamp`/`svix-signature`, HMAC-SHA256 peste `id.timestamp.body`, comparație timing-safe)
- Replay protection: timestamp mai vechi de 5 min = respins
- Fără `RESEND_WEBHOOK_SECRET` în env → **503** (endpoint mort intenționat)
- Cerere nesemnată/semnătură greșită → **401**

## Config (făcut 2026-07-14; de refăcut doar dacă se schimbă secretul)

1. Resend dashboard → Webhooks → endpoint `https://eghiseul.ro/api/webhooks/resend/`, evenimente: bounced, complained, failed, delivered, opened
2. Signing secret (`whsec_...`) → Vercel env `RESEND_WEBHOOK_SECRET` (production) → **redeploy** (env nou nu intră fără build; atenție: `ignoreCommand` anulează redeploy-uri fără diff de cod — fă commit real sau Redeploy din dashboard cu „use existing build cache" debifat)
3. Local: secretul e și în `.env.local` pentru teste semnate

## Test manual (semnat, ca de la Resend)

```bash
node -e "
const crypto=require('node:crypto'),fs=require('fs');
const secret=fs.readFileSync('.env.local','utf8').match(/^RESEND_WEBHOOK_SECRET=(.*)$/m)[1].trim();
const payload=JSON.stringify({type:'email.bounced',data:{email_id:'test-'+Date.now(),to:['adresa@exemplu.com'],subject:'[TEST]',bounce:{message:'550 test'}}});
const id='msg_test_'+Date.now(),ts=Math.floor(Date.now()/1000).toString();
const sig=crypto.createHmac('sha256',Buffer.from(secret.replace(/^whsec_/,''),'base64')).update(id+'.'+ts+'.'+payload).digest('base64');
fetch('https://eghiseul.ro/api/webhooks/resend/',{method:'POST',headers:{'Content-Type':'application/json','svix-id':id,'svix-timestamp':ts,'svix-signature':'v1,'+sig},body:payload}).then(async r=>console.log(r.status,await r.text()));
"
```

Așteptat: `200 {"received":true}` + comanda marcată + alertă pe contact@. Sanity rapid fără secret: POST gol → 401 (nu 503!).

## Legat de

- Validare email în wizard/submit: changelog `2026-07-14-email-validation-guard.md`
- DMARC (`_dmarc` p=none, Vercel DNS) + igienă linkuri: changelog `2026-07-13-email-bounce-dmarc.md`
- Infrastructura email (Zoho primire / Resend trimitere): memoria `email-zoho-resend`
