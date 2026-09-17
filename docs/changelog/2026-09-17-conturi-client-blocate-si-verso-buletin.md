# 17.09.2026 — Conturile de client erau blocate de 39 de zile, iar buletinul vechi cerea poză pe spate
<!-- categorie: clienti -->

## Pentru echipă

Doi clienți au reclamat două lucruri diferite. Amândoi aveau dreptate, iar în spate erau probleme mai mari decât păreau.

**1. Nimeni nu putea să-și facă cont.** Nu doar clienta care a sunat — nimeni, din 9 august. Sistemul de email al platformei atinsese o limită și refuza să mai trimită emailul de confirmare. Omul vedea un mesaj în engleză, fără explicație, și încerca la nesfârșit. În plus, cine reușea totuși să facă un cont ajungea pe o pagină inexistentă și nu afla niciodată că trebuie să confirme emailul — de-aia avem 38 de conturi blocate în starea asta.

**Ce s-a reparat acum:** mesajele sunt în română și îți spun ce să faci („mai încearcă peste X minute", „sună-ne"), pagina de după înregistrare există și are buton de retrimitere a emailului, iar linkul din emailul de „mi-am uitat parola" nu mai duce în gol.

**Ce mai trebuie făcut de Raul, altfel blocajul rămâne:** schimbat furnizorul de email al conturilor din panoul Supabase. Până atunci, conturile noi tot nu se pot face singure.

**Ce faci tu când sună un client blocat:**
- nu are nevoie de cont ca să comande sau să vadă statusul — îi dai linkul de urmărire cu codul comenzii și emailul lui;
- dacă vrea neapărat cont, îl creezi tu din panoul Supabase (Authentication → Users → Add user, cu „Auto Confirm User" bifat) și îi dai parola;
- dacă are deja cont dar zice că n-a primit emailul de confirmare, îl confirmi tu din același loc, cu butonul „Confirm email".

Procedura pas cu pas, cu ce îi spui și ce NU îi spui:
[Clientul nu își poate face cont](../admin/cont-client-blocat.md).

**2. Buletinul vechi nu mai cere poză pe spate.** Clientul avea dreptate: pe buletinul vechi spatele e gol, nu are ce să fotografieze. Cerința apărea doar la clienții care aleg „Completez manual" datele, și la comenzile telefonice. Acum scrie „opțional" și explică limpede că e nevoie doar la cartea de identitate nouă, electronică. Dacă un client te întreabă: la buletinul vechi, fața e suficientă.

**3. Atenție la ce vede clientul în contul lui.** Rămâne nereparat, dar e bine să știi când sună: comenzile făcute fără cont NU apar în contul pe care și-l face după aceea, chiar dacă folosește același email. Și statusul afișat e greșit pentru majoritatea comenzilor — o comandă plătită și trimisă la instituție îi apare clientului ca „În așteptare". Nu-l contrazice: verifică tu în admin și spune-i unde e de fapt.

---

## Ce s-a livrat tehnic

### Cauza reală a blocajului la conturi

Test direct pe producție, cu email curat, de pe alt IP:

```
POST /auth/v1/signup → HTTP 429
{"code":429,"error_code":"over_email_send_rate_limit","msg":"email rate limit exceeded"}
```

Nu e un limitator per IP și nu e cod de-al nostru: niciun rate limiter propriu
(`src/lib/security/rate-limiter.ts`) nu atinge rutele de auth. E limita de
trimitere email **la nivel de proiect Supabase**, cu SMTP-ul implicit (2/oră,
livrabil oficial doar către membrii echipei). Nu există niciun `SMTP_*` în env —
Resend e cablat doar la emailurile noastre tranzacționale, nu la Supabase Auth.

Dovezi din DB și loguri:

| Măsurătoare | Valoare |
|---|---|
| ultimul cont creat | 09.08.2026 |
| conturi noi în ultimele 30 de zile | 0 |
| `/signup` azi, 08:00–10:00 | 51 de cereri, toate 429, zero 200 |
| conturi cu `email_confirmed_at IS NULL` | 38 din 73 |
| conturi care nu s-au logat niciodată | 59 din 73 |
| clienți plătitori / 90 zile vs. cu cont | 398 / 3 |

### Pagini de auth care nu existau (404 în producție)

| Rută | Cine trimitea acolo | Efect |
|---|---|---|
| `/auth/verify-email` | `auth/register/page.tsx:75`, după signup reușit | omul nu afla că trebuie să confirme emailul |
| `/reset-password` | `redirectTo` din `auth/forgot-password/page.tsx` | linkul din emailul de resetare ducea în 404 |
| `/login` | `auth/callback/route.ts`, pe eroare | a treia fundătură |

Livrat:
- `src/app/auth/verify-email/page.tsx` — nouă: arată adresa, explică Spam/Promoții,
  buton de retrimitere cu cooldown de 60s, telefon și link către urmărirea fără cont.
- `src/app/auth/reset-password/page.tsx` — nouă: setează parola nouă, detectează
  sesiunea de recovery și afișează „link expirat" când nu există.
- `next.config.ts` — `/reset-password/` și `/login/` redirectate temporar
  (`permanent: false`) către rutele reale, pentru linkurile deja plecate pe email.
- `auth/callback/route.ts` — eroarea trimite pe `/auth/login?error=auth`, iar
  pagina de login afișează un mesaj pentru acel parametru.

### Erorile GoTrue, traduse

`src/lib/auth/error-messages.ts` (nou) — `authErrorToRomanian(message, code)`
întoarce `{ message, isRateLimit, retryAfterSeconds }`, extrage secundele din
„you can only request this after N seconds" și nu lasă niciodată un mesaj
englezesc să ajungă la client. Cablat în `auth/register`, `auth/login`,
`auth/forgot-password`, `auth/verify-email` și în
`api/auth/register-from-order/route.ts`, care acum întoarce **429** la rate
limit, nu 400 ca înainte. 7 teste: `tests/unit/lib/auth-error-messages.test.ts`.

### Verso act de identitate

`src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx` — pe ruta
manuală (și în modul telefonic) versoul devine opțional: gata cu `!hasBack` din
validare, scos din lista „ce lipsește", iar cardul se numește „(opțional)" și
explică „doar dacă ai cartea de identitate nouă, electronică".

Ruta „scanează" era deja corectă (`PersonalDataStep.tsx:1412-1421`: CI vechi =
doar față). Serverul nu cerea versoul (`api/orders/[id]/submit/route.ts:129-130`
verifică doar fața), pasul KYC manual nu rulează OCR, iar contul
(`IdScanner.tsx:736-740`) și fluxul de reupload (`lib/reupload/doc-types.ts:38-44`)
îl tratau deja ca opțional. Pasul manual era singurul inconsecvent.

Confirmare în date, ultimele 60 de zile: `ci_front` 121 fără verso (ruta scan)
vs. `act_identitate` 63 / `act_identitate_back` 64 (ruta manuală — versoul apărea
practic întotdeauna, pentru că nu te lăsa altfel).

### Cauza rădăcină, vizibilă doar în dashboard: proiectul era RESTRICȚIONAT

Notificarea din Supabase Dashboard, pe care API-ul nu o expune deloc:

> **Email sending privileges restricted due to spam complaints** — Aug 09, 2026
> „Your project has been restricted due to high spam rates. Please use a custom
> SMTP provider instead."

**9 august = exact data ultimului cont creat.** Nu era doar plafonul de 2/oră:
Supabase a oprit trimiterea pe proiect din cauza ratei de reclamații de spam și
a bounce-urilor (există și o a doua notificare, „Email sending privileges at
risk due to bounce backs", și o perioadă de grație începută pe 03.07). De-aia
signup-ul întorcea 429 din PRIMA încercare, la orice oră, de pe orice IP.

Contribuie și forma emailului: șablonul implicit Supabase e în engleză și fără
niciun element de brand — „Confirm your signup / Follow this link to confirm your
user" — trimis unor clienți români de la o adresă pe care n-o recunosc. Exact
tiparul care adună reclamații de spam. Rescris (vezi mai jos).

### A doua cauză: `site_url` era pe localhost

Citind configurația de Auth prin Management API (după ce Raul a pus un token nou):

```
smtp_host             = null                      → SMTP implicit Supabase
rate_limit_email_sent = 2                         → 2 emailuri/oră pe tot proiectul
site_url              = "http://localhost:3000"   🔴
uri_allow_list        = ""                        🔴
```

`site_url` este baza linkului din emailul de confirmare. Cu `localhost:3000`
acolo, **și emailurile care chiar au plecat duceau într-o pagină inexistentă pe
calculatorul clientului.** Asta explică cele 38 de conturi neconfirmate mai bine
decât 404-ul de pe `/auth/verify-email`: erau două fundături una după alta.

`uri_allow_list` gol înseamnă că niciun `emailRedirectTo` nu era acceptat, deci
nici redirectul de după confirmare (`register-from-order/route.ts:157`) nu avea
cum să funcționeze.

Corectat prin Management API:

| Setare | Înainte | Acum |
|---|---|---|
| `site_url` | `http://localhost:3000` | `https://eghiseul.ro` |
| `uri_allow_list` | `""` | `https://eghiseul.ro/**,https://www.eghiseul.ro/**` |
| `password_min_length` | 6 | 8 (cât cere și formularul) |
| `password_hibp_enabled` | false | true (verificare HaveIBeenPwned) |

### SMTP custom pe Resend — aplicat

| Setare | Valoare |
|---|---|
| Host / port | `smtp.resend.com` / `587` |
| Username | `resend` |
| Sender | `comenzi@eghiseul.ro`, nume `eGhiseul.ro` |
| `rate_limit_email_sent` | 2 → 30 (automat la activare) → **100** |

Domeniul `eghiseul.ro` era deja `verified` în Resend. Ordinea contează: Supabase
refuză `rate_limit_email_sent` cât timp nu există SMTP custom
(`Custom SMTP required to configure RATE_LIMIT_EMAIL_SENT`).

**Testat pe producție, cap-coadă:**

```
POST /auth/v1/signup → HTTP 200   (primul cont creat după 09.08)
profiles: rând creat de handle_new_user, rol `customer`
Resend: "Confirm Your Signup", de la eGhiseul.ro <comenzi@eghiseul.ro>
link: .../auth/v1/verify?...&redirect_to=https://eghiseul.ro   ← nu mai e localhost
```

Bounce-ul de la adresa de test e normal: `test.cont.…@eghiseul.ro` nu e cutie
poștală reală.

### Șabloanele de email, rescrise în română

Confirmare cont, resetare parolă și schimbare adresă folosesc acum aceeași
identitate vizuală ca restul emailurilor (`src/lib/email/templates/branded-layout.ts`:
antet bleumarin cu sigla, buton auriu, subsol cu datele firmei și mențiunea de
neafiliere), cu text în română și explicația că nu e nevoie de cont ca să comanzi.

## Rămâne de făcut

1. **Cere ridicarea restricției de la Supabase.** SMTP-ul custom scoate trimiterea
   de sub infrastructura lor, deci conturile merg — dar notificarea de restricție
   rămâne pe proiect. Merită un ticket, cu mențiunea că sursa reclamațiilor
   (șablon englezesc generic) a fost eliminată.
2. **Ține bounce-urile sub control în Resend.** Restricția a venit din rata de
   spam și bounce; lista de contacte e mare, iar campaniile pleacă tot prin
   Resend. Dacă rata urcă, de data asta se restricționează domeniul, nu doar
   proiectul Supabase.
2. **Legarea comenzilor de guest la cont.** `orders.user_id` e singura legătură;
   nu există potrivire pe email nicăieri (`api/orders/route.ts:252`). 439 de
   comenzi plătite în 90 de zile, zero cu `user_id`.
3. **Statusurile din contul clientului.** `OrdersTab.tsx:41-48` cunoaște 6
   statusuri, pagina de detaliu 9, iar `lib/admin/status-options.ts` are 17 —
   restul cad pe fallback-ul „În așteptare".
4. **Sumarul de preț** din `account/orders/[id]/page.tsx`: citește
   `breakdown.optionsTotal`, API-ul trimite `optionsPrice` (linia „Opțiuni" nu
   apare niciodată), iar prețul serviciului vine din catalogul de azi
   (`api/orders/[id]/route.ts:146`), nu din `orders.base_price`.
5. `/account/settings` e linkat din meniul user (`shared/header.tsx:266`) și nu există.
