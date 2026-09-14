# 14.09.2026 (partea a patra) — Botul ONRC a picat pe două comenzi plătite, iar lista de comenzi nu arăta nimic

Raul a semnalat în `/admin/onrc` două joburi **Eșuat** din aceeași zi
(`E-260914-MQ99F` ACV CARGO TRANS, `E-260914-U2R9Y` SIRIUS ANIMAL VET), ambele
cu aceeași eroare, de 4 ori fiecare:

```
browserType.launch: Executable doesn't exist at /ms-playwright/chromium_headless_shell-1223/…
Looks like Playwright was just updated to 1.60.0. Please update docker image as well.
  current:  mcr.microsoft.com/playwright:v1.48.0-jammy
  required: mcr.microsoft.com/playwright:v1.60.0-jammy
```

Ultimul job reușit: `E-260910-JG5A9` (10.09). Ultimul deploy al worker-ului:
28.07. Deci nu s-a schimbat nimic în cod — s-a schimbat ceva la ONRC.

## Ce s-a întâmplat, în ordine

1. **Contul ONRC a respins parola.** Logurile Railway arată, înaintea fiecărei
   erori de browser, `Keycloak password grant failed (400)`. Apelat direct,
   Keycloak răspunde `invalid_grant — Invalid user credentials`. Raul a
   confirmat: portalul îi cerea resetarea parolei. Password grant-ul (calea
   normală, fără browser) nu mai avea cum să meargă.
2. **Fallback-ul pe browser n-a mers niciodată în producție.** Când grant-ul
   pică, worker-ul încearcă să ia un token din sesiunea de browser. Dar
   `package-lock.json` fixează `playwright@1.60.0` (de la scaffold, 14.06),
   iar imaginea Docker era `v1.48.0-jammy` — browserul nu există în imagine.
   În plus, pe Railway nu există `storageState.json` (e în `.gitignore`), deci
   fallback-ul ar fi picat oricum, doar cu alt mesaj.
3. Eroarea de browser a fost clasificată generic **FAILED**, reîncercată de 4
   ori cu backoff, apoi lăsată FAILED. Mesajul spunea „Playwright", nu
   „parola ONRC" — nimeni nu avea cum să înțeleagă cauza reală din admin.
4. **Lista de comenzi nu arăta nimic.** Comenzile stăteau pe „Plătită" ca
   oricare alta; doar cine deschidea `/admin/onrc` vedea că botul n-a livrat.

## Ce s-a livrat

### worker-onrc (`5b8867d`, deploy prin `git push`)

- `Dockerfile`: imaginea `v1.60.0-jammy`, aliniată cu lockfile-ul. Comentariul
  spune explicit că tag-ul trebuie să urmeze `package-lock.json`, nu `^` din
  `package.json`.
- `api.ts`: când password grant-ul pică și nu există `storageState.json`,
  jobul aruncă `NeedsOperatorError` cu cauza reală („contul ONRC refuză
  parola … actualizează `ONRC_PASSWORD` în Railway, apoi Reîncearcă automat")
  în loc să lanseze un browser care nu poate ajuta. Jobul ajunge
  **Necesită operator** (Slack + email de întârziere către client), nu FAILED
  cu 4 reîncercări inutile.

### eghiseul.ro

- **Badge în lista de comenzi** (`/admin/orders`, sub codul comenzii):
  roșu „ONRC AUTOMAT EȘUAT — MANUAL" la FAILED / NEEDS_OPERATOR (hover =
  eroarea botului, click = `/admin/onrc`), albastru „ONRC AUTOMAT ÎN LUCRU"
  cât timp botul lucrează (ca nimeni să nu depună și manual). Lista ia
  jobul cel mai nou per comandă dintr-un singur query pe pagină.
  Logica e pură, în `src/lib/onrc/automation-badge.ts` (5 teste).
- **„↻ Reîncearcă automat"** în `/admin/onrc` lângă „Încarcă PDF manual":
  `POST /api/admin/orders/[id]/onrc-retry` repune jobul pe PENDING cu
  `retry_count 0`. Refuză (409) joburile care au deja `onrc_draft_id` —
  acelea pot fi plătite la ONRC și nu se re-depun (anti-dublă plată), rămâne
  upload-ul manual. Fără el, un job FAILED cu 4 încercări consumate stătea
  blocat pe veci chiar după repararea cauzei.

## Procedura la „parola ONRC nu mai merge"

1. Resetează parola pe `portal.onrc.ro` (contul `serviciiseonethut@gmail.com`).
2. `cd ~/Projects/worker-onrc && railway variables --set 'ONRC_PASSWORD=…'`
   (Railway redeployează singur).
3. Verifică: `curl -X POST https://sso.onrc.ro/realms/onrc/protocol/openid-connect/token -d grant_type=password -d client_id=frontoffice-app -d username=… -d password=…` → trebuie `access_token`.
4. `/admin/onrc` → „↻ Reîncearcă automat" pe joburile eșuate.

## Rezolvare (13:45)

Raul a resetat parola pe portal și a pus-o în Railway. Grant-ul tot dădea
`Invalid user credentials` — dar login-ul în browser cu aceeași parolă mergea.
Cauza: **`ONRC_USERNAME` din Railway avea un spațiu la final** (28 de
caractere în loc de 27). Worker-ul îl taie (`required()` face `trim()`), deci
pe el nu-l afecta; testele mele citeau variabila brută. Capcană de notat:
orice script care testează credențialele din `railway variables --json`
trebuie să facă `trim()`. Variabila a fost corectată oricum.

Diferența de cod de eroare spune și ea povestea: worker-ul primea **400**
(cont cu acțiune obligatorie — resetare parolă), testele de după resetare
**401** (credențiale greșite, din cauza spațiului).

Cele 2 comenzi au fost repuse în coadă (`PENDING`, `retry_count 0`) după
redeploy; niciuna nu avea `onrc_draft_id`, deci nu exista risc de dublă plată.
**Rezultat (13:58–13:59):** ambele depuse + plătite (30 lei fiecare din
wallet), `RC 3709474` / `RC 3709504`, PDF atașat, `document_ready`, email
trimis, cost ONRC înregistrat automat.

## Două lucruri observate la reluare, reparate

**1. „undefined" la Id cerere.** Worker-ul citește summary-ul la 2 secunde
după plată. Azi ONRC a înregistrat cererile abia după 9 minute
(`creationDate 13:54`, plata 13:45; între timp `status: READY` fără `number`),
iar worker-ul trimitea `String(undefined)`, pe care admin-ul îl afișa ca link
„undefined". Se completa singur la următoarea verificare, dar arăta a depunere
ratată. Acum: worker-ul așteaptă până la 40 s (4 × 10 s) după numărul cererii
înainte să parcheze jobul (`059ee87` + următorul commit din worker), iar `/api/onrc/result` refuză
să stocheze „undefined"/„null".

**2. Documentul era gata, worker-ul l-a luat după ~3 minute.** Verificarea
(retrieve) era limitată la o dată la 3 minute per job, plus tick-ul de 30 s al
worker-ului. Pentru „de bază" (emis în minute) e mult: clientul așteaptă.
Acum `/api/onrc/pending` verifică **la 1 minut în primele 15 minute** de la
depunere, apoi revine la 3 minute (IMM/insolvență trec prin backoffice, ore).
