# 09.11.2026 — Ce arătau logurile Vercel: campaniile tăiate, salvarea pierdută, căutarea din registru
<!-- categorie: automatizari -->

## Pentru echipă

- **Campaniile de email (Black Friday)**: trimiterea zilnică se oprea la jumătate în 07.11 și 09.11, fiindcă depășea 5 minute. Emailurile plecate au ajuns la clienți, dar cifra „trimise” din Marketing rămânea în urmă: la cazier judiciar scria 344, deși plecaseră 501. Acum trimiterea se oprește singură înainte de limită și continuă a doua zi. Cifra „trimise” se numără din lista reală de trimiteri, deci e corectă.
- **Salvarea comenzii în formular**: o salvare a căzut pe 04.11 fără nicio explicație (E-261104-W9VR4, cetățean străin, neplătită). Cauza a fost în verificarea de sesiune care rulează înaintea fiecărei salvări. Acum, dacă verificarea are o problemă, salvarea merge mai departe. Paginile cu cont (admin, cont client) trimit la login, ca până acum.
- **Registrul de numere (Setări)**: căutarea cu virgulă sau paranteze, de exemplu „Popescu, Ion”, dădea eroare. Acum merge.
- Bounce-urile la emailuri sunt 1–1,9% pe zi și nu există nicio plângere de spam, deci sub pragul de oprire de 3%.
- **De știut, nereparat**: pe cazierjudiciaronline, cererile și împuternicirile generate din admin se salvează ca Word (DOCX), nu ca PDF. Conversia în PDF are nevoie de un cont CloudConvert, care nu e configurat. Decizia e a lui Raul.

---

## Sursa

Logurile Vercel, citite pe 09.11 cu `vercel logs --json`, pe ultimele 7 zile, pentru erorile 5xx și cele de nivel error. Token-ul CLI expirase pe 06.11. Un singur `vercel whoami` l-a reîmprospătat fără login în browser. MCP-ul Vercel dă în continuare 403 pe ambele proiecte.

Erorile 5xx pe eghiseul în 7 zile au fost doar acestea patru:

| Când (UTC) | Rută | Cauză |
|---|---|---|
| 04.11 14:42 | `PATCH /api/orders/draft/` 500 | sursa `serverless-middleware`, fără niciun log; cererea nu a ajuns la rută |
| 07.11 07:40, 09.11 07:40 | `GET /api/cron/email-campaigns/` 504 | `Task timed out after 300 seconds` |
| 09.11 07:14 | `GET /api/admin/settings/number-registry/` 500 | `Failed to count number registry entries: { message: '' }` |

## Ce s-a schimbat

- **`src/app/api/cron/email-campaigns/route.ts`**: `RUN_DEADLINE_MS = 240_000`. Bucla iese înainte de `maxDuration`, iar o rulare tăiată nu marchează campania `done`. `sent_count` vine din `count(email_campaign_sends where sent_at is not null)`. Contactele revendicate de rulările omorâte rămân sărite, deci nu se trimite nimic de două ori.
- **`src/proxy.ts`**: `updateSession()` stă în try/catch. La eroare, `/api` și paginile publice trec mai departe. `/admin`, `/account`, `/kyc` și `/orders` (fără `/orders/new`) fac redirect la login.
- **`number-registry/route.ts`**: caracterele `, ( ) " \` din textul căutat sunt înlocuite cu spațiu înainte de `or()`. Logul include acum și statusul HTTP.

## Neverificat

- Pentru 500-ul din middleware nu există log, deci nu știu sigur că a fost o excepție din `getUser()`. Dacă a fost o cădere a platformei, try/catch-ul nu ajută, dar formularul reîncearcă oricum la 5xx din 05.11.
- Cauza căutării din registru e dedusă, nu dovedită: URL-ul cu parametrul de căutare nu apare în log.
- Primul cron cu termenul nou rulează pe 10.11 la 07:40 UTC.

## Alte constatări din loguri

- eghiseul: 2 evenimente Stripe „without orderId metadata”. Sunt plăți CJO care ajung la webhook-ul eghiseul (același cont Stripe). Inofensive.
- CJO: „vat sweep” cu `ReferenceError` de 36 de ori, până pe 06.11. A fost reparat de `7c1d1bb5`. Pe 09.11 a apărut un singur 401 de la Oblio.
- CJO: un email de expirare către o adresă invalidă (CFO-20261013-38920), respins de Resend.
- CJO: `convertDocxToPdf` încearcă `soffice` pe Vercel (12 erori, în `cerere` și `delegation`), apoi salvează DOCX. Nici CJO, nici eghiseul nu au `CLOUDCONVERT_API_KEY` în Vercel.
