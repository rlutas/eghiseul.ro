# Bundle de review — recuperare telefonică + warm-up email (2026-09-14)

## Status
- **NECOMMIS, NEPUSH-uit.** Branch `main`, ultimul commit real: `8dd52df` (nelegat de sesiunea asta).
- **DB: migrațiile 156 și 157 SUNT deja aplicate live** pe Supabase (project `llbwmitdrppomeptqlue`) — aplicate direct prin unelte MCP, nu prin fișierul de migrare (fișierele există totuși în `supabase/migrations/` pentru istoric).
- Codul (rute API, pagini admin, cron nou, `vercel.json`) există DOAR local, needeployat. Nimic live pe Vercel din codul de mai jos.
- Coloanele noi din DB sunt nullable/aditive — nu rup nimic din codul deja deployat.

## Ce s-a cerut (context pentru reviewer)
1. Analiză date reale DB (clienți/contacte/comenzi/abandon) + research extern (email marketing + phone recovery).
2. Plan email marketing A-Z în docs.
3. Feature: coadă priorizare apel telefonic pentru comenzi abandonate (telefon străin + stare civilă = prioritate), bifă contactat, cupon custom discreționar.
4. Rafinare: prioritizează după profunzime date completate; exclude din coadă pe cei fără nume.
5. Feature: campanie warm-up email către toate cele 72.278 contacte din registrul vechi (consimțământ acordat pe eghiseul.ro vechi, per decizie Raul), trimis treptat (implicit OPRIT, switch admin).
6. PDF ghid echipă.

## Fișiere noi/modificate
 M docs/DEVELOPMENT_MASTER_PLAN.md
 M docs/README.md
 M docs/admin/abandoned-carts.md
 M docs/ads/meta/13-campanie-celibat-diaspora.md
 M docs/ads/meta/README.md
 M src/app/admin/coupons/page.tsx
 M src/app/admin/layout.tsx
 M src/app/admin/marketing/page.tsx
 M src/app/api/admin/coupons/route.ts
 M src/app/api/admin/settings/route.ts
 M src/app/api/cron/recovery-emails/route.ts
 M vercel.json
?? docs/marketing/
?? docs/technical/specs/phone-recovery-abandoned-carts.md
?? docs/technical/specs/warmup-email-campaign.md
?? src/app/admin/recuperare-telefonica/
?? src/app/api/admin/marketing/warmup-stats/
?? src/app/api/admin/orders/[id]/phone-contact/
?? src/app/api/admin/orders/priority-calls/
?? src/app/api/contacts/
?? src/app/api/cron/warmup-campaign/
?? src/lib/email/deliverability.ts
?? src/lib/email/templates/warmup-reengagement.ts
?? src/lib/orders/abandoned-progress.ts
?? supabase/migrations/156_phone_recovery_tracking.sql
?? supabase/migrations/157_contacts_warmup_campaign.sql
?? tests/unit/lib/orders/abandoned-progress.test.ts

## Documentele scrise (conținut complet)

### ==== docs/marketing/README.md ====
```markdown
# Marketing — index

| Document | Conținut |
|---|---|
| [`email-marketing-plan-2026-09.md`](email-marketing-plan-2026-09.md) | Plan A–Z email marketing: date reale din DB, sinteză cercetare (experți/benchmark-uri), strategie de listă (72k contacte), fluxuri, roadmap fazat |

Legat de acest domeniu, dar documentat separat pentru că e feature de admin:
- [`../technical/specs/phone-recovery-abandoned-carts.md`](../technical/specs/phone-recovery-abandoned-carts.md) — recuperare telefonică pentru comenzi abandonate (coadă de priorizare + cupoane custom)
- [`../technical/specs/warmup-email-campaign.md`](../technical/specs/warmup-email-campaign.md) — email de reactivare pe registrul de 72k contacte (implicit oprit, switch în `/admin/marketing`)
- [`../admin/abandoned-carts.md`](../admin/abandoned-carts.md) — sistemul existent de recovery automat (email + cupon 10%)
- [`ghid-echipa-recuperare-telefonica.pdf`](ghid-echipa-recuperare-telefonica.pdf) — ghid tipărit pentru echipă: ce s-a schimbat, cum se sortează coada, ce se spune la telefon
- `/admin/marketing` (pagină admin) — lista de abonați GDPR (opt-in explicit) + controlul campaniei de warm-up, separată de registrul de contacte
```

### ==== docs/marketing/email-marketing-plan-2026-09.md ====
```markdown
# Plan Email Marketing A–Z — eGhișeul.ro

**Data:** 2026-09-14 · **Status:** plan, neimplementat (execuția e în `DEVELOPMENT_MASTER_PLAN.md` → BACKLOG)
**Scop:** monetizarea bazei de 72k contacte + recuperarea reală a comenzilor abandonate (email + telefonic).

---

## 1. Fotografia reală a bazei (interogat direct din DB, 2026-09-14)

| Metric | Valoare | Observație |
|---|---|---|
| Total `contacts` | 72.278 | import istoric WPForms + sync la plată |
| `is_customer = true` | 381 (0,53%) | doar aceștia au cumpărat vreodată |
| `marketing_status = 'subscribed'` (opt-in explicit) | 37 | restul: `soft_opt_in` |
| `marketing_status = 'soft_opt_in'` | 72.241 | **vezi secțiunea 2 — nu toți sunt legali de emailat** |
| Total comenzi | 1.327 | |
| Comenzi `completed` | 386 (29%) | |
| Comenzi `draft` (abandon în wizard) | 790 | |
| Comenzi `abandoned` (submise, neplătite) | 111 | |
| Cupoane `RECOVERY-*` create (auto, cron) | 1.444 | 10%, 48h, unic |
| Cupoane `RECOVERY-*` folosite | **20 (1,4%)** | **confirmă suspiciunea inițială — recovery automat nu funcționează** |
| Draft/abandoned pe servicii de stare civilă (naștere+căsătorie+multilingv) | 118 | segment prioritar telefonic (secțiunea 5) |
| Draft/abandoned pe extras CF | 354 | cel mai mare volum absolut |

**Concluzie #1:** avem o listă mare dar aproape neexploatată — 71.897 contacte nu au cumpărat niciodată, majoritatea nu au fost contactate de marketing vreodată. Riscul nu e "nu avem cui vinde", e "putem strica reputația de sender dacă atacăm greșit lista asta dintr-o dată".

**Concluzie #2:** cuponul flat 10%/48h trimis automat e dovedit ineficient (1,4%). Nu se repară cu "mai mult din același lucru" — vezi secțiunea 4.

---

> **Decizie de business, 2026-09-14 (Raul):** contactele din registru sunt
> foști clienți/lead-uri de pe **eghiseul.ro vechi** (WordPress), unde
> consimțământul de marketing a fost acordat la momentul respectiv — nu
> lead-uri reci fără nicio relație anterioară. Pe baza acestei clarificări,
> campania de warm-up (secțiunea 4.4) se trimite la **toate** cele 72.278
> contacte, nu doar la cele 418 identificate inițial ca "sigur eligibile" —
> dar tot **treptat**, câțiva pe zi, nu într-un singur val (motivul rămâne
> valabil: deliverability pe o listă care n-a mai primit email de mult, nu
> eligibilitatea legală). Secțiunea 2 de mai jos rămâne ca referință pentru
> riscul teoretic — DB-ul curent (`orders`/`total_spent_ron`) nu are
> înregistrări de achiziție pentru aceste contacte pentru că acelea au avut
> loc pe platforma veche, nemigrată ca tranzacții.

## 2. Constrângere legală (GDPR, specific România) — context, nu mai blochează

Cercetare (Considerati.com, precedent CJEU/Inteligo 2019 pe DPA România):

- **Soft opt-in e valid DOAR pentru clienți reali** — contact colectat în contextul unei vânzări, marketing pentru servicii **similare**, opt-out oferit clar. Se aplică la cei **381 `is_customer=true`**.
- Cei **72.241 `soft_opt_in`** care n-au cumpărat NIMIC (lead-uri brute din WPForms/calculatoare) **nu se califică** pentru excepția asta — trimiterea de marketing fără consimțământ real e risc real de sancțiune, nu teoretic (precedent existent).
- Cei **37 `subscribed`** (opt-in explicit) sunt singurii 100% în regulă acum pentru orice tip de email de marketing.

**Acțiune obligatorie înainte de orice campanie de volum:** campanie de **re-permisiune** (permission pass) către segmentul non-customer — un singur email, subiect clar tip "Vrei să afli când lansăm reduceri / servicii noi?", cu buton mare de opt-in, trimis din adresa tranzacțională existentă (Resend, deja configurat, reputație curată). Cine nu răspunde/nu dă click NU intră în baza de marketing. Dureros pe termen scurt (lista utilizabilă legal scade mult), dar e singura bază solidă pe termen lung — și rezolvă și problema de deliverability de la secțiunea 3.

---

## 3. Ce spun experții (cercetare 2026-09-14, surse citate)

### Segmentare
- RFM clasic (recency/frequency/monetary) nu se potrivește 1:1 — la noi frecvența aproape nu există (majoritatea cumpără o singură dată, un document specific). **Colapsăm la 2 axe: recență + valoare comandă.** (Chase Dimond / Boundless Labs)
- Fereastra de "engaged" trebuie calibrată la cadența noastră reală de trimitere (probabil lunară la început) → 90 zile, nu 30 zile ca la retail cu trimiteri zilnice.

### Igienă listă / deliverability (**riscul cel mai mare pentru noi**)
- Contacte fără nicio activitate de 180+ zile riscă să fie spam-trap-uri reactivate de provideri. **Nu trimite la toate cele 72k dintr-o dată** — volum brusc mare pe o listă rece declanșează filtre de spam pe volum. (MailReach, 2026)
- **Plan de warm-up în valuri**, nu blast:
  1. Val 1: cei 37 `subscribed` + cei 381 clienți reali (418 contacte) — risc zero legal, listă caldă.
  2. Val 2: rezultatul campaniei de re-permisiune de la secțiunea 2 — abia aceștia intră gradual, în tranșe de câteva mii pe săptămână, monitorizând bounce/spam rate la fiecare tranșă.
  3. Restul listei (cei care n-au răspuns la re-permisiune) — **nu se emailează niciodată** pentru marketing, doar tranzacțional dacă redevin clienți.

### Win-back / reactivare (cazul nostru real, nu retail clasic)
- Cadență recomandată: declanșat de comportament (ultima comandă/vizită), nu calendaristic, la ~90 zile de inactivitate. (Flowium, Klaviyo)
- Val Geisler (Fix My Churn): secvențele de reactivare trebuie să ceară o **acțiune explicită** ("da, vreau să rămân pe listă") — nu doar "am deschis emailul", pentru că Apple Mail Privacy Protection umflă artificial rata de deschidere și minte statisticile.
- **Specific pentru noi:** un fost client de cazier judiciar nu va cumpăra din nou cazier judiciar curând — dar poate avea nevoie de extras CF, certificat de naștere pentru un copil, sau cazier auto. **Win-back-ul nostru = cross-sell către alt serviciu din același catalog, nu "cumpără din nou aceeași categorie".**

### Benchmark-uri (context, nu ținte)
- Fluxuri automate (Klaviyo, toate industriile): 35-42% open / 5-12% click.
- Campanii unice: 18-25% open / 1,7-3,4% click.
- **Judecă succesul după click/conversie, niciodată după open rate** — Apple MPP + audiența noastră (posibil mai în vârstă, servicii guvernamentale) fac open rate-ul nesigur ca semnal.

---

## 4. Fluxuri prioritare de construit

### 4.1 Recovery email — de rescris (nu doar "trimite din nou")

Cronul actual (`/api/cron/recovery-emails`, `docs/admin/abandoned-carts.md`) trimite **un singur email cu 10% reducere imediat**. Rezultat: 1,4% redemption. Cercetare 2026:

- Secvență de 3 atingeri, nu una: **30-60 min**, **24h**, **24-48h mai târziu**.
- **Reducerea NU e prima armă** — antrenează clienții să abandoneze special pentru cupon. Email #2 = încredere/valoare (recenzii, clarificări despre ce urmează), reducerea abia la #3, doar pentru cei care tot n-au reacționat.
- Emailuri trimise în prima oră: 5-6% conversie/email; o secvență de 3 emailuri bine făcută recuperează 15-25% din coșurile abandonate (vs. 1,4% acum).

**Backlog tehnic** (nu implementat în această sesiune — scope separat de research): extins `recovery-emails` cron la 3 trimiteri per comandă, cu discount doar pe a 3-a. Necesită coloană nouă de tracking (`recovery_email_sequence_step`) și 2 șabloane noi în `src/lib/email/templates/`.

### 4.2 Recuperare telefonică — **LIVRAT 2026-09-14** ✅

Vezi `docs/technical/specs/phone-recovery-abandoned-carts.md` + ghidul de echipă
`docs/marketing/ghid-echipa-recuperare-telefonica.pdf`. Pagina admin
`/admin/recuperare-telefonica` prioritizează:
- **tier maxim**: telefon străin (diaspora) + serviciu de stare civilă (naștere/căsătorie/extras multilingv) — cazuri cu termene reale (ambasadă, oficiu stare civilă), valoare mare, urgență reală.
- În fiecare tier, scor de profunzime a datelor completate (cine a avansat mult în wizard nu a abandonat "din prima") decide ordinea înaintea recenței.
- Comenzile fără niciun nume identificabil nu intră în coadă — email automat le acoperă oricum.
- Echipa bifează "sunat" + notă liberă, dă cupon custom (nu 10% fix) prin `/admin/coupons` extins cu `system_kind='phone_recovery'`.
- Cercetare: apel în primele 2h >> după 24h; discount discreționar la telefon convertește mai bine decât cupon automat generic; multi-canal (telefon + email păstrat activ) = +45% recuperare vs un singur canal — **nu opri emailul automat când suni**, cele două se completează.

### 4.4 Warm-up email pe registrul de 72k — **LIVRAT 2026-09-14 (implicit OPRIT)** ✅

Cron `/api/cron/warmup-campaign` (zilnic, 07:00 UTC), trimite email de
reactivare o singură dată per contact, ordine FIFO după `first_seen_at`.
Volum controlat din `/admin/marketing` (switch + „câți pe zi", implicit
**oprit** — pornește doar după ce conținutul emailului e revizuit). Fiecare
email are link de dezabonare cu un click (`/api/contacts/unsubscribe`, token
propriu per contact). Progres vizibil live în `/admin/marketing` (total,
trimise, rămase, dezabonați).

### 4.3 Newsletter general (după rezolvarea consimțământului, secțiunea 2)

- Frecvență inițială: **lunară**, nu mai des — lista e neexperimentată, riscul de dezabonare/spam e mai mare decât beneficiul unei cadențe agresive.
- Conținut: servicii noi lansate, schimbări de termene/preț relevante, nu doar reduceri (construiește încredere, nu doar reflex de discount).

---

## 5. KPI-uri de urmărit (din acum)

| KPI | Sursă | Unde se vede |
|---|---|---|
| Rata conversie recuperare telefonică | `phone_contacted_at` + status ieșit din draft/abandoned | `/admin/recuperare-telefonica` (calculat live) |
| Rata folosire cupon `phone_recovery` vs `recovery` (automat) | tabel `coupons`, `system_kind` | `/admin/coupons` (badge Telefonic/Auto) |
| Rata opt-in la campania de re-permisiune | `contacts.marketing_status` înainte/după | interogare manuală DB până se face raport dedicat |
| Bounce/spam rate pe fiecare val de warm-up | Resend dashboard | manual, per val |
| % din `draft`/`abandoned` cu telefon străin pe stare civilă | query priority-calls | deja calculat în `/admin/recuperare-telefonica` (contor tier) |

---

## 6. Roadmap fazat

1. **Acum** — Raul/echipa revizuiesc conținutul emailului de warm-up (`src/lib/email/templates/warmup-reengagement.ts`) și pornesc switch-ul din `/admin/marketing` cu un volum mic (implicit 25/zi, ajustabil).
2. **Săpt. 1-2** — Echipa folosește `/admin/recuperare-telefonica` zilnic pe segmentul tier maxim (deja live, ghid PDF distribuit).
3. **Săpt. 2-4** — Rescriere secvență recovery email (3 atingeri, discount la final) — vezi 4.1. Nescris încă.
4. **Continuu** — creștere treptată a volumului zilnic de warm-up pe măsură ce bounce/spam rate rămân sub control (monitorizare manuală Resend).
5. **Lunar, continuu** — win-back cross-sell la 90 zile inactivitate, pe segmentul de clienți reali (381 + ce se adaugă).

---

## Surse citate

- Chase Dimond (Boundless Labs) — [Ecommerce Email Marketing Strategy](https://www.chasedimond.com/ecommerce-email-marketing-strategy-boost-engagement-sales)
- MailReach — [Email List Hygiene 2026](https://www.mailreach.co/blog/email-list-hygiene-best-practices)
- Flowium — [Winback Email Campaign](https://flowium.com/blog/winback-email-campaign-and-examples/)
- Klaviyo — [Win-back examples](https://www.klaviyo.com/blog/winback-email-campaign-examples), [Benchmarks 2026](https://www.klaviyo.com/products/email-marketing/benchmarks)
- Val Geisler (Fix My Churn) — [CoSchedule interview](https://coschedule.com/blog/tapping-into-the-full-potential-of-successful-email-marketing-with-val-geisler-from-fix-my-churn-amp-157)
- Geysera — [Abandoned Cart Email Sequence Timing](https://www.geysera.com/blog/abandoned-cart-email/the-abandoned-cart-email-sequence-how-many-emails-what-timing-and-why-most-stores-get-it-wrong)
- Lawrence Bros — [Cart Abandonment Timing Benchmarks 2026](https://lawrencebros.com/optimal-cart-abandonment-email-timing-benchmarks-for-2026/)
- Considerati — [Soft opt-in mechanism](https://www.considerati.com/publications/is-it-hard-to-rely-on-the-%E2%80%98soft-opt-in%E2%80%99-mechanism/)
- Ringly.io — [Phone Automation Best Practices](https://www.ringly.io/blog/abandoned-cart-recovery-phone-automation-best-practices), [Cart Abandonment Statistics 2026](https://www.ringly.io/blog/ecommerce-cart-abandonment-statistics-2026)
- Markopolo AI — [Voice Agent Abandoned Cart Recovery](https://markopolo.ai/blogs/ai-voice-agent-abandoned-cart-recovery)
- Twilio — [Abandoned Cart Recovery Strategies](https://www.twilio.com/en-us/blog/insights/best-practices/abandoned-cart-recovery-strategies)
- Sender.net — [Cart Abandonment Statistics 2026](https://www.sender.net/blog/cart-abandonment-rate-statistics/)
```

### ==== docs/technical/specs/phone-recovery-abandoned-carts.md ====
```markdown
# Recuperare telefonică — comenzi abandonate

**Status:** ✅ LIVRAT 2026-09-14 · migrația 156
**Context:** completează sistemul de recovery automat (`docs/admin/abandoned-carts.md`) — cronul email+cupon 10% are 1,4% redemption (20 din 1.444 cupoane), confirmă că o parte din recuperare trebuie umană. Detalii de business/cercetare în `docs/marketing/email-marketing-plan-2026-09.md`.

## Update 2026-09-14 (aceeași zi, a doua rundă)

Rafinare pe baza feedback-ului lui Raul:
- **Scor de profunzime** (`dataDepthScore` în `abandoned-progress.ts`) — comenzile
  cu mai multe câmpuri completate (dincolo de contact/billing) apar înaintea
  celor cu progres minim, în interiorul aceluiași tier. "Cine a introdus multe
  date nu a abandonat din prima."
- **Filtru de nume** (`hasIdentifiableName`) — comenzile fără niciun nume
  identificabil (doar email/telefon) sunt excluse din coadă complet, indiferent
  de tier. Nu merită efortul unui apel; email-ul automat le acoperă oricum.
- Ghid tipărit pentru echipă: `docs/marketing/ghid-echipa-recuperare-telefonica.pdf`
  (generat din HTML cu Chromium headless, nu pandoc — fără LaTeX pe mașină).

## Decizii de design (brainstorming 2026-09-14)

3 alegeri făcute explicit cu Raul înainte de implementare:

1. **Fără istoric de apeluri** — un singur set de coloane pe `orders`
   (`phone_contacted_at/_by/_notes`), suprascris la fiecare sunare. Nu un
   tabel `order_call_logs` cu mai multe încercări — simplitate aleasă în
   locul istoricului complet.
2. **Cupon custom = extinde `/admin/coupons` existent**, nu formular nou.
   `system_kind` primește a doua valoare (`phone_recovery`), UI-ul de creare
   e prefilled prin query string din pagina de recuperare telefonică.
3. **Coadă de priorizare = pagină nouă dedicată** (`/admin/recuperare-telefonica`),
   nu doar un filtru în tabul „Abandonuri" existent — vizual mai curat pentru
   o coadă de lucru zilnică a echipei.

## Schema DB (migrația 156)

```sql
ALTER TABLE orders ADD COLUMN phone_contacted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN phone_contacted_by TEXT;      -- email admin
ALTER TABLE orders ADD COLUMN phone_contact_notes TEXT;

CREATE INDEX idx_orders_phone_contacted_at ON orders (phone_contacted_at)
  WHERE phone_contacted_at IS NOT NULL;

-- order_history: event_type nou 'phone_contact_logged' (audit, chiar dacă
-- UI-ul arată doar ultima bifă)
-- coupons: system_kind extins cu 'phone_recovery' (pe lângă 'recovery')
```

## Coada de priorizare — `GET /api/admin/orders/priority-calls`

Permisiune: `orders.view`. Reia populația țintă a cronului `recovery-emails`
(status `draft`/`abandoned`, ≤30 zile, draft filtrat prin
`hasProgressBeyondContact` — extras în `src/lib/orders/abandoned-progress.ts`,
partajat acum cu cronul) și o sortează pentru un om, nu pentru un cron:

- **tier 2** — telefon străin (`isForeignPhone`, regex mobil românesc) ȘI
  serviciu de stare civilă (`certificat-nastere`, `certificat-casatorie`,
  `extras-multilingv-certificat-nastere`). Diaspora + termen real (ambasadă,
  oficiu stare civilă) = cea mai bună rată de conversie la telefon
  (cercetare: valoare + urgență = prioritate universală în call-center).
- **tier 1** — telefon străin SAU serviciu de stare civilă (unul din două).
- **tier 0** — restul.

În fiecare tier, cele mai recente abandonuri primele (fereastra utilă de apel
se închide rapid — cercetare: conversie scade mult după 24h de la abandon).

`?includeContacted=1` arată și comenzile deja sunate (implicit ascunse).
Răspunsul include `conversion: { contactedTotal, contactedConverted }` —
proxy simplu: din toate comenzile sunate vreodată, câte au ieșit din
`draft`/`abandoned`/`cancelled` (= au dus comanda mai departe).

## Marcare contact — `POST /api/admin/orders/[id]/phone-contact`

Permisiune: `orders.manage`. Body `{ notes?: string }` (opțional, max 2000
caractere). Suprascrie `phone_contacted_at/_by/_notes` cu apelul curent +
insert în `order_history` (`phone_contact_logged`) pentru audit.

## Cupon custom — extensie `/admin/coupons`

`POST /api/admin/coupons` acceptă acum `system_kind: 'recovery' | 'phone_recovery'`.
Din `/admin/recuperare-telefonica`, butonul „Cupon" deschide
`/admin/coupons?order=<friendly_id>&system_kind=phone_recovery`: pagina
detectează query string-ul, deschide dialogul de creare cu descrierea
pre-completată (`Cupon telefonic — comanda <id>`), cod sugerat `TEL-XXXXXX`,
`max_uses` implicit 1 — **dar procentul/suma rămân la latitudinea agentului**,
nu sunt fixate. Cercetare: discount discreționar, potrivit obiecției reale a
clientului, convertește mai bine decât un procent fix generic dat de sistem.
Tabelul de cupoane arată badge „Telefonic" (albastru) vs „Auto" (galben,
`system_kind='recovery'`) pentru distincție rapidă.

## UI — `/admin/recuperare-telefonica`

Tabel cu prioritate/client/telefon/serviciu/valoare/vechime/status apel +
acțiuni (`tel:` link, bifează sunat cu notă, cupon custom, deschide comanda).
Header arată numărul de comenzi în coadă și rata de conversie curentă.
Nav: `/admin/layout.tsx`, lângă „Abandonuri", permisiune `orders.view`,
ascuns pentru rolul `avocat` (la fel ca restul secțiunii operaționale).

## Fișiere

- `supabase/migrations/156_phone_recovery_tracking.sql`
- `src/lib/orders/abandoned-progress.ts` (nou, extras din cronul recovery-emails)
- `src/app/api/admin/orders/[id]/phone-contact/route.ts`
- `src/app/api/admin/orders/priority-calls/route.ts`
- `src/app/admin/recuperare-telefonica/page.tsx`
- `src/app/api/admin/coupons/route.ts` (extins cu `system_kind`)
- `src/app/admin/coupons/page.tsx` (extins cu prefill din query string + badge)
- `tests/unit/lib/orders/abandoned-progress.test.ts`

## Ce NU face (scop redus intenționat)

- Nu ține istoric de apeluri multiple — vezi decizia 1 de mai sus.
- Nu trimite SMS/WhatsApp automat — doar link `tel:` pentru apel manual.
- Nu calculează "conversie" per apel individual, doar per comandă (proxy).
```

### ==== docs/technical/specs/warmup-email-campaign.md ====
```markdown
# Warm-up email — registrul de 72k contacte

**Status:** ✅ LIVRAT 2026-09-14 · migrația 157 · **implicit OPRIT** (switch în `/admin/marketing`)
**Context:** decizie de business (Raul) — contactele din `contacts` (72.278, majoritatea import WPForms de pe eghiseul.ro vechi) sunt foști clienți/lead-uri cu consimțământ acordat pe platforma veche. Se trimite email de reactivare la toți, dar treptat. Detalii complete + cercetare în `docs/marketing/email-marketing-plan-2026-09.md`.

## De ce implicit oprit

Trimiterea reală către mii de persoane e o acțiune cu impact greu de reversat
(reputație de sender, plângeri, imagine). Feature-ul e complet funcțional dar
**nu pornește singur** — cronul rulează zilnic oricum (per `vercel.json`) dar
iese imediat dacă `admin_settings.warmup_campaign.enabled = false` (valoare
implicită). Echipa pornește manual din `/admin/marketing` după ce revizuiește
conținutul emailului.

## Schema DB (migrația 157)

```sql
ALTER TABLE contacts ADD COLUMN unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE contacts ADD COLUMN warmup_email_sent_at TIMESTAMPTZ;
-- index unic pe token + index parțial pentru selecția batch-ului zilnic
```

Populație țintă: `marketing_status NOT IN ('unsubscribed', 'suppressed')` —
tabelul `contacts` deja suportă aceste statusuri (migrația 110).

## Cron — `POST/GET /api/cron/warmup-campaign`

- Auth: `CRON_SECRET` (Bearer), programat zilnic 07:00 UTC în `vercel.json`.
- Citește `admin_settings.warmup_campaign` (`{ enabled, dailyBatchSize }`,
  implicit `{ enabled: false, dailyBatchSize: 25 }` dacă rândul nu există).
- Iese imediat dacă `enabled=false`.
- Selectează batch-ul: nesunați (`warmup_email_sent_at IS NULL`), eligibili,
  ordonați FIFO după `first_seen_at` (nimeni nu așteaptă la infinit).
- Trimite `src/lib/email/templates/warmup-reengagement.ts` prin Resend
  (`idempotencyKey: warmup-<contact.id>` — protecție împotriva dublei trimiteri
  la rulări suprapuse, nu există claim atomic separat).
- Marchează `warmup_email_sent_at` doar la succes real (skip-urile din lipsă
  de config Resend rămân nemarcate pentru retry).

## Dezabonare — `GET /api/contacts/unsubscribe?token=`

Independent de `/api/newsletter/unsubscribe` (acela operează pe
`newsletter_subscribers`, opt-in explicit, populație diferită — cei ~37).
Token propriu per contact (`contacts.unsubscribe_token`), un click →
`marketing_status = 'unsubscribed'`. Rândul rămâne (dovadă), nu se șterge.

## Admin UI — `/admin/marketing`

Card nou deasupra listei de abonați newsletter:
- Statistici live: total contacte, câte au primit deja emailul, câte rămân,
  câți s-au dezabonat (`GET /api/admin/marketing/warmup-stats`).
- Switch enable/disable + input „câți pe zi" — salvează în
  `admin_settings.warmup_campaign` prin endpoint-ul generic
  `PATCH /api/admin/settings` (cheie adăugată în allowlist, cu validare de
  formă `{enabled: boolean, dailyBatchSize: 1-2000}`).

## Fișiere

- `supabase/migrations/157_contacts_warmup_campaign.sql`
- `src/lib/email/deliverability.ts` (nou — extras din `recovery-emails`, TEST_EMAILS + isUndeliverable partajate)
- `src/lib/email/templates/warmup-reengagement.ts`
- `src/app/api/cron/warmup-campaign/route.ts`
- `src/app/api/contacts/unsubscribe/route.ts`
- `src/app/api/admin/marketing/warmup-stats/route.ts`
- `src/app/api/admin/settings/route.ts` (extins cu cheia `warmup_campaign`)
- `src/app/admin/marketing/page.tsx` (extins cu `WarmupCampaignCard`)

## Ce NU face (scop redus intenționat)

- Nu segmentează conținutul per serviciu dincolo de un hint simplu (primul
  serviciu din `contacts.services`) — un singur template pentru toți.
- Nu crește automat volumul zilnic — echipa ajustează manual din UI pe măsură
  ce verifică bounce/spam rate în Resend.
- Nu are claim atomic pe rândul de contact înainte de trimitere — se bazează
  pe idempotency key la Resend (risc scăzut, batch mic, o singură trimitere
  per contact oricum).
```

## Diff complet (cod + migrații, tot ce nu e commis)
```diff
diff --git a/docs/DEVELOPMENT_MASTER_PLAN.md b/docs/DEVELOPMENT_MASTER_PLAN.md
index bbdba4a..4ba0794 100644
--- a/docs/DEVELOPMENT_MASTER_PLAN.md
+++ b/docs/DEVELOPMENT_MASTER_PLAN.md
@@ -789,6 +789,30 @@ Add-on `extras_multilingv` (399 lei) pe certificat-nastere + certificat-casatori
 
 3 tiers (București/sectoare 15-30, oficii rapide 5-7, rest 7-15), lista de oficii rapide editabilă din `/admin/settings` → „Termene stare civilă". `registrationPlace` convertit la dropdown structurat. Migrația 079 + `src/lib/civil-status/delivery-terms.ts`. Vezi changelog + `docs/plans/2026-06-23-civil-status-dynamic-terms-design.md`.
 
+#### ✅ Recuperare telefonică comenzi abandonate — LIVRAT 2026-09-14
+
+Pagină `/admin/recuperare-telefonica`: coadă prioritizată (telefon străin +
+serviciu stare civilă = tier maxim), bifă „sunat" + notă, cupon custom prin
+`/admin/coupons` (`system_kind='phone_recovery'`). Motivat de redemption real
+de 1,4% pe cuponul automat 10%. Migrația 156. Vezi
+`docs/technical/specs/phone-recovery-abandoned-carts.md` +
+`docs/marketing/email-marketing-plan-2026-09.md`.
+
+#### ✅ Warm-up email pe registrul de 72k contacte — LIVRAT 2026-09-14 (implicit oprit)
+
+Decizie de business (Raul): contactele au consimțământ de pe eghiseul.ro
+vechi, se trimite la toate 72.278, dar treptat (switch + volum/zi editabil în
+`/admin/marketing`, implicit OPRIT până la revizuirea conținutului). Migrația
+157. Vezi `docs/technical/specs/warmup-email-campaign.md`.
+
+#### Plan email marketing A–Z — restul roadmap-ului (analiză 2026-09-14)
+
+**Ce lipsește încă** (vezi `docs/marketing/email-marketing-plan-2026-09.md`
+secțiunea 6 pentru roadmap complet):
+1. Rescriere secvență `recovery-emails` cron: 3 atingeri (30-60min/24h/24-48h),
+   discount doar la ultima, nu imediat.
+2. Win-back cross-sell la 90 zile inactivitate pe clienții reali.
+
 #### Specimene PNG vechi pe 4 pagini servicii
 
 **Problem:** Paginile integritate / cazier-auto / cazier-fiscal / constatator folosesc specimene PNG vechi (17.06), fără versiuni WebP 2025 în `public/images/specimens/`. Restul certificatelor au WebP 2025.
diff --git a/docs/README.md b/docs/README.md
index b6b14c7..191e4d6 100644
--- a/docs/README.md
+++ b/docs/README.md
@@ -21,6 +21,7 @@ Index al documentației. Aceasta e o **hartă**, nu un jurnal — pentru jurnalu
 | **SEO** | [`seo/`](seo/) | location pages (CF/cazier), clustere (ONRC/stare civilă/rovinietă), keywords, GSC, planuri, [tooling pe date reale](seo/TOOLING-claude-seo.md) (GSC API/CrUX/PageSpeed) |
 | **Servicii** | [`services/`](services/) | catalog viu, folder-per-serviciu |
 | **Admin** | [`admin/`](admin/) | RBAC, handbook-uri operaționale (storno, modifică comandă, coșuri abandonate) |
+| **Marketing** | [`marketing/`](marketing/) | plan email marketing A–Z, recuperare telefonică comenzi abandonate |
 | **Deployment** | [`deployment/`](deployment/) | Vercel + Stripe webhook, S3, migrări DB, email Zoho+Resend, deploy checklist |
 | **Securitate** | [`security/`](security/) | audit securitate, incidente |
 | **Design** | [`design/`](design/) | sistem de design, ghiduri vizuale |
@@ -58,6 +59,9 @@ Index al documentației. Aceasta e o **hartă**, nu un jurnal — pentru jurnalu
 - **Decont Mircea — regularizarea din 07.09 (stare curentă, model cumulativ, ce rămâne de reglat):** [`operations/decont-mircea-2026-09-07-regularizare.md`](operations/decont-mircea-2026-09-07-regularizare.md)
 - **Decont Mircea (topograf) — primul calcul + cutoff:** [`operations/decont-mircea-2026-08-26.md`](operations/decont-mircea-2026-08-26.md)
 - **Cookie consent (GDPR, banner + consent receipts):** [`technical/specs/cookie-consent.md`](technical/specs/cookie-consent.md)
+- **Plan email marketing A–Z (72k contacte, GDPR, roadmap):** [`marketing/email-marketing-plan-2026-09.md`](marketing/email-marketing-plan-2026-09.md)
+- **Recuperare telefonică comenzi abandonate (coadă priorizare + cupoane custom):** [`technical/specs/phone-recovery-abandoned-carts.md`](technical/specs/phone-recovery-abandoned-carts.md)
+- **Warm-up email pe registrul de 72k contacte (implicit oprit):** [`technical/specs/warmup-email-campaign.md`](technical/specs/warmup-email-campaign.md)
 - **Deploy:** [`deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md)
 - **Email (Resend + Zoho) setup:** [`deployment/EMAIL_RESEND_ZOHO_SETUP.md`](deployment/EMAIL_RESEND_ZOHO_SETUP.md)
 
diff --git a/docs/admin/abandoned-carts.md b/docs/admin/abandoned-carts.md
index c0b5be4..589ea4e 100644
--- a/docs/admin/abandoned-carts.md
+++ b/docs/admin/abandoned-carts.md
@@ -1,6 +1,13 @@
 # Coșuri Abandonate — Sistemul complet
 
-**Status:** ✅ Aplicat 2026-05-27 · ⚠️ MORT în producție până 2026-07-20 (vezi incident mai jos) · ✅ Reparat + extins la drafts 2026-07-20
+**Status:** ✅ Aplicat 2026-05-27 · ⚠️ MORT în producție până 2026-07-20 (vezi incident mai jos) · ✅ Reparat + extins la drafts 2026-07-20 · ✅ Completat cu recuperare telefonică 2026-09-14
+
+> **2026-09-14:** cuponul automat de mai jos are **1,4% redemption** (20 din
+> 1.444 cupoane create) — analiza completă în
+> `docs/marketing/email-marketing-plan-2026-09.md`. Layer nou, uman:
+> `docs/technical/specs/phone-recovery-abandoned-carts.md` (pagina
+> `/admin/recuperare-telefonica`) — echipa sună prioritizat (telefon străin +
+> stare civilă întâi) și dă cupoane discreționare, nu fixe.
 **Inspirat din:** `cazierjudiciaronline.com/api/cron/abandonment` (cazierjudiciaronline foloseste un singur cron; noi am separat în două pentru claritate operațională)
 
 ## ⚠️ Incident: cron-urile nu au rulat NICIODATĂ (până la 2026-07-20)
diff --git a/docs/ads/meta/13-campanie-celibat-diaspora.md b/docs/ads/meta/13-campanie-celibat-diaspora.md
index c2438fe..6eaedfd 100644
--- a/docs/ads/meta/13-campanie-celibat-diaspora.md
+++ b/docs/ads/meta/13-campanie-celibat-diaspora.md
@@ -269,3 +269,79 @@ server-side. Nu e o îmbunătățire de performanță, e măsurare care înainte
 3. La ziua 7 citim: distribuția spend-ului între creative, cost per InitiateCheckout, hook rate,
    CTR outbound, LPV ÷ Outbound Clicks.
 4. **Decizia rămasă:** constatatorul rulează în paralel, deci total 150 lei/zi.
+
+---
+
+## VERIFICARE 14.09 (ziua 6) — prin Meta Ads MCP
+
+Cifre lifetime la 14.09: spend **482,45 lei**, 18.711 impresii, 10.184 reach, CTR outbound
+**1,17%**, 4 InitiateCheckout la **120,61 lei/buc** (sub pragul de 250, dar volum mic). **0 erori**
+de livrare, **0 anomalii** (fără auction overlap, fatigue sau audiență prea îngustă).
+
+Două probleme găsite, ambele deja semnalate mai sus dar încă nerezolvate 6 zile mai târziu:
+
+1. **LPV ÷ Outbound Clicks = 53/219 = 24%.** Sub pragul Loomer de 70% din `11-research-...` —
+   semnal de problemă pe landing page, nu pe creativ. De verificat viteză/erori pe
+   `/servicii/eliberare-certificat-de-celibat/`.
+2. **Tot un singur anunț rulează** (`C1 Conversatie - video 9x16`). C2–C5 (staticele 4:5) tot
+   nu sunt urcate.
+
+### Lookalike din pagina unui concurent — nu se poate
+
+Raul a întrebat dacă se poate face Lookalike din followerii paginii **Centrul de Vize și
+Legalizări T&B** (`facebook.com/CentrulDeVize`, page_id `976626705861066`, găsită prin Ad Library
+căutând „Centrul de Vize"; un singur anunț istoric, 2024, „Procură auto Turcia"). **Nu.** Meta
+Lookalike acceptă ca sursă DOAR o audiență deținută de contul tău (pixel, listă clienți, engagement
+pe propria pagină) — nu poți selecta pagina altcuiva, indiferent cât de suprapus e publicul.
+
+### Audiențe create în loc (14.09)
+
+Contul nu avea NICIO audiență custom (`ads_get_ad_account_custom_audiences` → gol). Create patru,
+pe pixelul `eghiseul.ro web` (dataset `2319629835442431`):
+
+| Nume | Tip | ID | Sursă |
+|---|---|---|---|
+| WCA - Vizitatori eghiseul.ro (180 zile) | WEBSITE | `120252513878570556` | toți vizitatorii, `ALL_VISITORS`, retenție 180 zile |
+| WCA - Cumparatori eghiseul.ro (Purchase, 180 zile) | WEBSITE | `120252513878830556` | eveniment `Purchase` (pixel + CAPI), retenție 180 zile |
+| LAL 1% - Vizitatori eghiseul.ro | LOOKALIKE | `120252513880060556` | origine: audiența de vizitatori de mai sus |
+| LAL 1% - Cumparatori eghiseul.ro | LOOKALIKE | `120252513880260556` | origine: audiența de cumpărători de mai sus |
+
+Blocaj la prima încercare: `Terms of service has not been accepted` (eroare 2663) — Raul a acceptat
+TOS-ul de Custom Audiences pe `facebook.com/customaudiences/app/tos/?act=1562160259035101`, apoi
+creare reușită.
+
+Verificat pe pixel (`ads_get_dataset_stats`, 7 zile): `Purchase` chiar are volum (~20 evenimente),
+deci audiența de cumpărători nu e goală, dar e mică — populația-sursă a unui Lookalike de
+cumpărători pe un singur serviciu (698 lei, 6 comenzi/90 zile) va fi subțire. Cea de vizitatori are
+bază mult mai mare (sute de PageView/oră, deși doar cele cu consimțământ de cookie intră pe pixel).
+
+**Ce lipsește ca lookalike-urile să fie gata de folosit:** niciun ad set nu le targetează încă.
+Următorul pas e fie un ad set nou în campania de celibat cu aceste audiențe (posibil RO în loc de
+diaspora, pentru că sursa e majoritar trafic domestic), fie test separat. Decizie rămasă pentru
+Raul: pe ce campanie/serviciu le folosim întâi.
+
+### AG2 pornit în campania de celibat (14.09)
+
+Raul a ales: le punem pe campania de celibat, să vedem cum merge. Ad set nou, **ACTIVE**:
+
+| | |
+|---|---|
+| Ad set | `AG2 Lookalike - Vizitatori+Cumparatori RO` — `120252513897690556` |
+| Targetare | România, 18-65, **custom_audiences** = LAL Vizitatori (`120252513880060556`) + LAL Cumpărători (`120252513880260556`), unite (OR) |
+| Advantage+ Audience | **OFF** (`targeting_automation.advantage_audience: 0`) — targetare strict pe cele 2 audiențe, fără expandare automată Meta |
+| Plasamente | manuale, aceleași ca AG1: Facebook feed/Reels/Stories/Marketplace, IG feed/Reels/Stories/Explore, fără Audience Network/Messenger |
+| Optimizare | `OFFSITE_CONVERSIONS` → `INITIATED_CHECKOUT`, pixel `2319629835442431` (același eveniment ca AG1) |
+| Anunț | `C1 Conversatie - video 9x16 (LAL RO)` — `120252513901390556`, aceeași creativă (`creative_id 1065201412919067`) ca AG1, nu una nouă |
+| Advertiser (DSA) | EDIGITALIZARE SRL |
+
+⚠️ **Riscul asumat:** campania e CBO (buget 75 lei/zi la nivel de campanie, „Highest volume").
+Cu AG2 activ, bugetul se împarte automat între AG1 (broad diaspora, în plină fază de învățare,
+ziua 6) și AG2 (nou, 0 date). Regula din `11-research-learning-phase.md` — orice schimbare
+resetează învățarea — vizează schimbări PE ACELAȘI ad set; adăugarea unui ad set frate într-o
+campanie CBO nu resetează AG1, dar îi poate tăia din livrare cât timp Meta explorează AG2. De
+urmărit: dacă AG1 pierde brusc spend/impresii față de trendul de până acum.
+
+**Ce urmărim la AG2:** dacă vreuna din cele 2 audiențe (vizitatori vs. cumpărători, sunt unite
+acum într-un singur ad set, deci nu se văd separat decât dacă se împart ulterior în 2 ad seturi)
+produce InitiateCheckout mai ieftin decât cei 120,61 lei de pe AG1 broad. Fără atingeri 7 zile,
+la fel ca AG1.
diff --git a/docs/ads/meta/README.md b/docs/ads/meta/README.md
index 72b94d2..ad44e0b 100644
--- a/docs/ads/meta/README.md
+++ b/docs/ads/meta/README.md
@@ -73,3 +73,5 @@ Deschis 02.09.2026 ca posibil al doilea canal după ChatGPT Ads. Evaluarea scurt
   View**.
 - Rata corectă e LPV ÷ **Outbound Clicks** (nu Link Clicks). Prag: sub 70% = problemă.
 | 07.09 noapte | **Campania de celibat, specificatie completa** -> `13-campanie-celibat-diaspora.md`. META_Celibat_Diaspora_2026-09: obiectiv Vanzari/InitiateCheckout (singurul semnal adevarat de cand avem CAPI), un singur ad set broad, limba romana + IT/ES/DE/UK/FR/BE/AT, 25-45, plasamente MANUALE fara Audience Network, 5 creative pe unghiuri diferite randate din cod (~/Projects/eghiseul-ads-video). Texte de anunt, URL final corect (`/servicii/eliberare-certificat-de-celibat/`, nu varianta care da 308), si ce urmarim in ziua 7 (distributia spend-ului, nu ROAS). |
+| 14.09 | **Verificare live prin Meta Ads MCP** -> update in `13-campanie-celibat-diaspora.md`. Ziua 6: 482,45 lei, CTR outbound 1,17%, 4 InitiateCheckout la 120,61 lei, 0 erori/anomalii; tot un singur anunt live (C2-C5 neurcate) si LPV/Outbound = 24% (sub pragul 70%, semnal problema pe landing page). Intrebare Raul despre Lookalike din pagina concurentului **Centrul de Vize** -> imposibil (Meta cere sursa proprie). In loc: create 2 audiente custom (vizitatori + cumparatori Purchase, pixel `2319629835442431`, 180 zile) si 2 Lookalike 1% din ele (blocat initial de TOS Custom Audiences neacceptat, rezolvat de Raul). |
+| 14.09 | **AG2 Lookalike pornit pe campania de celibat** -> update in `13-campanie-celibat-diaspora.md`. Ad set nou `AG2 Lookalike - Vizitatori+Cumparatori RO` (120252513897690556), Romania 18-65, cele 2 LAL unite, Advantage+ Audience OFF, aceeasi creativa C1 ca AG1, optimizare InitiateCheckout pe acelasi pixel. **ACTIVE**. Risc asumat: campania e CBO (buget 75 lei/zi la nivel de campanie) -> bugetul se imparte acum intre AG1 (ziua 6 de invatare) si AG2 (0 date); de urmarit daca AG1 pierde livrare. |
diff --git a/docs/marketing/README.md b/docs/marketing/README.md
new file mode 100644
index 0000000..1c768b0
--- /dev/null
+++ b/docs/marketing/README.md
@@ -0,0 +1,12 @@
+# Marketing — index
+
+| Document | Conținut |
+|---|---|
+| [`email-marketing-plan-2026-09.md`](email-marketing-plan-2026-09.md) | Plan A–Z email marketing: date reale din DB, sinteză cercetare (experți/benchmark-uri), strategie de listă (72k contacte), fluxuri, roadmap fazat |
+
+Legat de acest domeniu, dar documentat separat pentru că e feature de admin:
+- [`../technical/specs/phone-recovery-abandoned-carts.md`](../technical/specs/phone-recovery-abandoned-carts.md) — recuperare telefonică pentru comenzi abandonate (coadă de priorizare + cupoane custom)
+- [`../technical/specs/warmup-email-campaign.md`](../technical/specs/warmup-email-campaign.md) — email de reactivare pe registrul de 72k contacte (implicit oprit, switch în `/admin/marketing`)
+- [`../admin/abandoned-carts.md`](../admin/abandoned-carts.md) — sistemul existent de recovery automat (email + cupon 10%)
+- [`ghid-echipa-recuperare-telefonica.pdf`](ghid-echipa-recuperare-telefonica.pdf) — ghid tipărit pentru echipă: ce s-a schimbat, cum se sortează coada, ce se spune la telefon
+- `/admin/marketing` (pagină admin) — lista de abonați GDPR (opt-in explicit) + controlul campaniei de warm-up, separată de registrul de contacte
diff --git a/docs/marketing/email-marketing-plan-2026-09.md b/docs/marketing/email-marketing-plan-2026-09.md
new file mode 100644
index 0000000..52ce380
--- /dev/null
+++ b/docs/marketing/email-marketing-plan-2026-09.md
@@ -0,0 +1,156 @@
+# Plan Email Marketing A–Z — eGhișeul.ro
+
+**Data:** 2026-09-14 · **Status:** plan, neimplementat (execuția e în `DEVELOPMENT_MASTER_PLAN.md` → BACKLOG)
+**Scop:** monetizarea bazei de 72k contacte + recuperarea reală a comenzilor abandonate (email + telefonic).
+
+---
+
+## 1. Fotografia reală a bazei (interogat direct din DB, 2026-09-14)
+
+| Metric | Valoare | Observație |
+|---|---|---|
+| Total `contacts` | 72.278 | import istoric WPForms + sync la plată |
+| `is_customer = true` | 381 (0,53%) | doar aceștia au cumpărat vreodată |
+| `marketing_status = 'subscribed'` (opt-in explicit) | 37 | restul: `soft_opt_in` |
+| `marketing_status = 'soft_opt_in'` | 72.241 | **vezi secțiunea 2 — nu toți sunt legali de emailat** |
+| Total comenzi | 1.327 | |
+| Comenzi `completed` | 386 (29%) | |
+| Comenzi `draft` (abandon în wizard) | 790 | |
+| Comenzi `abandoned` (submise, neplătite) | 111 | |
+| Cupoane `RECOVERY-*` create (auto, cron) | 1.444 | 10%, 48h, unic |
+| Cupoane `RECOVERY-*` folosite | **20 (1,4%)** | **confirmă suspiciunea inițială — recovery automat nu funcționează** |
+| Draft/abandoned pe servicii de stare civilă (naștere+căsătorie+multilingv) | 118 | segment prioritar telefonic (secțiunea 5) |
+| Draft/abandoned pe extras CF | 354 | cel mai mare volum absolut |
+
+**Concluzie #1:** avem o listă mare dar aproape neexploatată — 71.897 contacte nu au cumpărat niciodată, majoritatea nu au fost contactate de marketing vreodată. Riscul nu e "nu avem cui vinde", e "putem strica reputația de sender dacă atacăm greșit lista asta dintr-o dată".
+
+**Concluzie #2:** cuponul flat 10%/48h trimis automat e dovedit ineficient (1,4%). Nu se repară cu "mai mult din același lucru" — vezi secțiunea 4.
+
+---
+
+> **Decizie de business, 2026-09-14 (Raul):** contactele din registru sunt
+> foști clienți/lead-uri de pe **eghiseul.ro vechi** (WordPress), unde
+> consimțământul de marketing a fost acordat la momentul respectiv — nu
+> lead-uri reci fără nicio relație anterioară. Pe baza acestei clarificări,
+> campania de warm-up (secțiunea 4.4) se trimite la **toate** cele 72.278
+> contacte, nu doar la cele 418 identificate inițial ca "sigur eligibile" —
+> dar tot **treptat**, câțiva pe zi, nu într-un singur val (motivul rămâne
+> valabil: deliverability pe o listă care n-a mai primit email de mult, nu
+> eligibilitatea legală). Secțiunea 2 de mai jos rămâne ca referință pentru
+> riscul teoretic — DB-ul curent (`orders`/`total_spent_ron`) nu are
+> înregistrări de achiziție pentru aceste contacte pentru că acelea au avut
+> loc pe platforma veche, nemigrată ca tranzacții.
+
+## 2. Constrângere legală (GDPR, specific România) — context, nu mai blochează
+
+Cercetare (Considerati.com, precedent CJEU/Inteligo 2019 pe DPA România):
+
+- **Soft opt-in e valid DOAR pentru clienți reali** — contact colectat în contextul unei vânzări, marketing pentru servicii **similare**, opt-out oferit clar. Se aplică la cei **381 `is_customer=true`**.
+- Cei **72.241 `soft_opt_in`** care n-au cumpărat NIMIC (lead-uri brute din WPForms/calculatoare) **nu se califică** pentru excepția asta — trimiterea de marketing fără consimțământ real e risc real de sancțiune, nu teoretic (precedent existent).
+- Cei **37 `subscribed`** (opt-in explicit) sunt singurii 100% în regulă acum pentru orice tip de email de marketing.
+
+**Acțiune obligatorie înainte de orice campanie de volum:** campanie de **re-permisiune** (permission pass) către segmentul non-customer — un singur email, subiect clar tip "Vrei să afli când lansăm reduceri / servicii noi?", cu buton mare de opt-in, trimis din adresa tranzacțională existentă (Resend, deja configurat, reputație curată). Cine nu răspunde/nu dă click NU intră în baza de marketing. Dureros pe termen scurt (lista utilizabilă legal scade mult), dar e singura bază solidă pe termen lung — și rezolvă și problema de deliverability de la secțiunea 3.
+
+---
+
+## 3. Ce spun experții (cercetare 2026-09-14, surse citate)
+
+### Segmentare
+- RFM clasic (recency/frequency/monetary) nu se potrivește 1:1 — la noi frecvența aproape nu există (majoritatea cumpără o singură dată, un document specific). **Colapsăm la 2 axe: recență + valoare comandă.** (Chase Dimond / Boundless Labs)
+- Fereastra de "engaged" trebuie calibrată la cadența noastră reală de trimitere (probabil lunară la început) → 90 zile, nu 30 zile ca la retail cu trimiteri zilnice.
+
+### Igienă listă / deliverability (**riscul cel mai mare pentru noi**)
+- Contacte fără nicio activitate de 180+ zile riscă să fie spam-trap-uri reactivate de provideri. **Nu trimite la toate cele 72k dintr-o dată** — volum brusc mare pe o listă rece declanșează filtre de spam pe volum. (MailReach, 2026)
+- **Plan de warm-up în valuri**, nu blast:
+  1. Val 1: cei 37 `subscribed` + cei 381 clienți reali (418 contacte) — risc zero legal, listă caldă.
+  2. Val 2: rezultatul campaniei de re-permisiune de la secțiunea 2 — abia aceștia intră gradual, în tranșe de câteva mii pe săptămână, monitorizând bounce/spam rate la fiecare tranșă.
+  3. Restul listei (cei care n-au răspuns la re-permisiune) — **nu se emailează niciodată** pentru marketing, doar tranzacțional dacă redevin clienți.
+
+### Win-back / reactivare (cazul nostru real, nu retail clasic)
+- Cadență recomandată: declanșat de comportament (ultima comandă/vizită), nu calendaristic, la ~90 zile de inactivitate. (Flowium, Klaviyo)
+- Val Geisler (Fix My Churn): secvențele de reactivare trebuie să ceară o **acțiune explicită** ("da, vreau să rămân pe listă") — nu doar "am deschis emailul", pentru că Apple Mail Privacy Protection umflă artificial rata de deschidere și minte statisticile.
+- **Specific pentru noi:** un fost client de cazier judiciar nu va cumpăra din nou cazier judiciar curând — dar poate avea nevoie de extras CF, certificat de naștere pentru un copil, sau cazier auto. **Win-back-ul nostru = cross-sell către alt serviciu din același catalog, nu "cumpără din nou aceeași categorie".**
+
+### Benchmark-uri (context, nu ținte)
+- Fluxuri automate (Klaviyo, toate industriile): 35-42% open / 5-12% click.
+- Campanii unice: 18-25% open / 1,7-3,4% click.
+- **Judecă succesul după click/conversie, niciodată după open rate** — Apple MPP + audiența noastră (posibil mai în vârstă, servicii guvernamentale) fac open rate-ul nesigur ca semnal.
+
+---
+
+## 4. Fluxuri prioritare de construit
+
+### 4.1 Recovery email — de rescris (nu doar "trimite din nou")
+
+Cronul actual (`/api/cron/recovery-emails`, `docs/admin/abandoned-carts.md`) trimite **un singur email cu 10% reducere imediat**. Rezultat: 1,4% redemption. Cercetare 2026:
+
+- Secvență de 3 atingeri, nu una: **30-60 min**, **24h**, **24-48h mai târziu**.
+- **Reducerea NU e prima armă** — antrenează clienții să abandoneze special pentru cupon. Email #2 = încredere/valoare (recenzii, clarificări despre ce urmează), reducerea abia la #3, doar pentru cei care tot n-au reacționat.
+- Emailuri trimise în prima oră: 5-6% conversie/email; o secvență de 3 emailuri bine făcută recuperează 15-25% din coșurile abandonate (vs. 1,4% acum).
+
+**Backlog tehnic** (nu implementat în această sesiune — scope separat de research): extins `recovery-emails` cron la 3 trimiteri per comandă, cu discount doar pe a 3-a. Necesită coloană nouă de tracking (`recovery_email_sequence_step`) și 2 șabloane noi în `src/lib/email/templates/`.
+
+### 4.2 Recuperare telefonică — **LIVRAT 2026-09-14** ✅
+
+Vezi `docs/technical/specs/phone-recovery-abandoned-carts.md` + ghidul de echipă
+`docs/marketing/ghid-echipa-recuperare-telefonica.pdf`. Pagina admin
+`/admin/recuperare-telefonica` prioritizează:
+- **tier maxim**: telefon străin (diaspora) + serviciu de stare civilă (naștere/căsătorie/extras multilingv) — cazuri cu termene reale (ambasadă, oficiu stare civilă), valoare mare, urgență reală.
+- În fiecare tier, scor de profunzime a datelor completate (cine a avansat mult în wizard nu a abandonat "din prima") decide ordinea înaintea recenței.
+- Comenzile fără niciun nume identificabil nu intră în coadă — email automat le acoperă oricum.
+- Echipa bifează "sunat" + notă liberă, dă cupon custom (nu 10% fix) prin `/admin/coupons` extins cu `system_kind='phone_recovery'`.
+- Cercetare: apel în primele 2h >> după 24h; discount discreționar la telefon convertește mai bine decât cupon automat generic; multi-canal (telefon + email păstrat activ) = +45% recuperare vs un singur canal — **nu opri emailul automat când suni**, cele două se completează.
+
+### 4.4 Warm-up email pe registrul de 72k — **LIVRAT 2026-09-14 (implicit OPRIT)** ✅
+
+Cron `/api/cron/warmup-campaign` (zilnic, 07:00 UTC), trimite email de
+reactivare o singură dată per contact, ordine FIFO după `first_seen_at`.
+Volum controlat din `/admin/marketing` (switch + „câți pe zi", implicit
+**oprit** — pornește doar după ce conținutul emailului e revizuit). Fiecare
+email are link de dezabonare cu un click (`/api/contacts/unsubscribe`, token
+propriu per contact). Progres vizibil live în `/admin/marketing` (total,
+trimise, rămase, dezabonați).
+
+### 4.3 Newsletter general (după rezolvarea consimțământului, secțiunea 2)
+
+- Frecvență inițială: **lunară**, nu mai des — lista e neexperimentată, riscul de dezabonare/spam e mai mare decât beneficiul unei cadențe agresive.
+- Conținut: servicii noi lansate, schimbări de termene/preț relevante, nu doar reduceri (construiește încredere, nu doar reflex de discount).
+
+---
+
+## 5. KPI-uri de urmărit (din acum)
+
+| KPI | Sursă | Unde se vede |
+|---|---|---|
+| Rata conversie recuperare telefonică | `phone_contacted_at` + status ieșit din draft/abandoned | `/admin/recuperare-telefonica` (calculat live) |
+| Rata folosire cupon `phone_recovery` vs `recovery` (automat) | tabel `coupons`, `system_kind` | `/admin/coupons` (badge Telefonic/Auto) |
+| Rata opt-in la campania de re-permisiune | `contacts.marketing_status` înainte/după | interogare manuală DB până se face raport dedicat |
+| Bounce/spam rate pe fiecare val de warm-up | Resend dashboard | manual, per val |
+| % din `draft`/`abandoned` cu telefon străin pe stare civilă | query priority-calls | deja calculat în `/admin/recuperare-telefonica` (contor tier) |
+
+---
+
+## 6. Roadmap fazat
+
+1. **Acum** — Raul/echipa revizuiesc conținutul emailului de warm-up (`src/lib/email/templates/warmup-reengagement.ts`) și pornesc switch-ul din `/admin/marketing` cu un volum mic (implicit 25/zi, ajustabil).
+2. **Săpt. 1-2** — Echipa folosește `/admin/recuperare-telefonica` zilnic pe segmentul tier maxim (deja live, ghid PDF distribuit).
+3. **Săpt. 2-4** — Rescriere secvență recovery email (3 atingeri, discount la final) — vezi 4.1. Nescris încă.
+4. **Continuu** — creștere treptată a volumului zilnic de warm-up pe măsură ce bounce/spam rate rămân sub control (monitorizare manuală Resend).
+5. **Lunar, continuu** — win-back cross-sell la 90 zile inactivitate, pe segmentul de clienți reali (381 + ce se adaugă).
+
+---
+
+## Surse citate
+
+- Chase Dimond (Boundless Labs) — [Ecommerce Email Marketing Strategy](https://www.chasedimond.com/ecommerce-email-marketing-strategy-boost-engagement-sales)
+- MailReach — [Email List Hygiene 2026](https://www.mailreach.co/blog/email-list-hygiene-best-practices)
+- Flowium — [Winback Email Campaign](https://flowium.com/blog/winback-email-campaign-and-examples/)
+- Klaviyo — [Win-back examples](https://www.klaviyo.com/blog/winback-email-campaign-examples), [Benchmarks 2026](https://www.klaviyo.com/products/email-marketing/benchmarks)
+- Val Geisler (Fix My Churn) — [CoSchedule interview](https://coschedule.com/blog/tapping-into-the-full-potential-of-successful-email-marketing-with-val-geisler-from-fix-my-churn-amp-157)
+- Geysera — [Abandoned Cart Email Sequence Timing](https://www.geysera.com/blog/abandoned-cart-email/the-abandoned-cart-email-sequence-how-many-emails-what-timing-and-why-most-stores-get-it-wrong)
+- Lawrence Bros — [Cart Abandonment Timing Benchmarks 2026](https://lawrencebros.com/optimal-cart-abandonment-email-timing-benchmarks-for-2026/)
+- Considerati — [Soft opt-in mechanism](https://www.considerati.com/publications/is-it-hard-to-rely-on-the-%E2%80%98soft-opt-in%E2%80%99-mechanism/)
+- Ringly.io — [Phone Automation Best Practices](https://www.ringly.io/blog/abandoned-cart-recovery-phone-automation-best-practices), [Cart Abandonment Statistics 2026](https://www.ringly.io/blog/ecommerce-cart-abandonment-statistics-2026)
+- Markopolo AI — [Voice Agent Abandoned Cart Recovery](https://markopolo.ai/blogs/ai-voice-agent-abandoned-cart-recovery)
+- Twilio — [Abandoned Cart Recovery Strategies](https://www.twilio.com/en-us/blog/insights/best-practices/abandoned-cart-recovery-strategies)
+- Sender.net — [Cart Abandonment Statistics 2026](https://www.sender.net/blog/cart-abandonment-rate-statistics/)
diff --git a/docs/marketing/ghid-echipa-recuperare-telefonica.pdf b/docs/marketing/ghid-echipa-recuperare-telefonica.pdf
new file mode 100644
index 0000000..6cd0d24
Binary files /dev/null and b/docs/marketing/ghid-echipa-recuperare-telefonica.pdf differ
diff --git a/docs/technical/specs/phone-recovery-abandoned-carts.md b/docs/technical/specs/phone-recovery-abandoned-carts.md
new file mode 100644
index 0000000..fdc56dc
--- /dev/null
+++ b/docs/technical/specs/phone-recovery-abandoned-carts.md
@@ -0,0 +1,114 @@
+# Recuperare telefonică — comenzi abandonate
+
+**Status:** ✅ LIVRAT 2026-09-14 · migrația 156
+**Context:** completează sistemul de recovery automat (`docs/admin/abandoned-carts.md`) — cronul email+cupon 10% are 1,4% redemption (20 din 1.444 cupoane), confirmă că o parte din recuperare trebuie umană. Detalii de business/cercetare în `docs/marketing/email-marketing-plan-2026-09.md`.
+
+## Update 2026-09-14 (aceeași zi, a doua rundă)
+
+Rafinare pe baza feedback-ului lui Raul:
+- **Scor de profunzime** (`dataDepthScore` în `abandoned-progress.ts`) — comenzile
+  cu mai multe câmpuri completate (dincolo de contact/billing) apar înaintea
+  celor cu progres minim, în interiorul aceluiași tier. "Cine a introdus multe
+  date nu a abandonat din prima."
+- **Filtru de nume** (`hasIdentifiableName`) — comenzile fără niciun nume
+  identificabil (doar email/telefon) sunt excluse din coadă complet, indiferent
+  de tier. Nu merită efortul unui apel; email-ul automat le acoperă oricum.
+- Ghid tipărit pentru echipă: `docs/marketing/ghid-echipa-recuperare-telefonica.pdf`
+  (generat din HTML cu Chromium headless, nu pandoc — fără LaTeX pe mașină).
+
+## Decizii de design (brainstorming 2026-09-14)
+
+3 alegeri făcute explicit cu Raul înainte de implementare:
+
+1. **Fără istoric de apeluri** — un singur set de coloane pe `orders`
+   (`phone_contacted_at/_by/_notes`), suprascris la fiecare sunare. Nu un
+   tabel `order_call_logs` cu mai multe încercări — simplitate aleasă în
+   locul istoricului complet.
+2. **Cupon custom = extinde `/admin/coupons` existent**, nu formular nou.
+   `system_kind` primește a doua valoare (`phone_recovery`), UI-ul de creare
+   e prefilled prin query string din pagina de recuperare telefonică.
+3. **Coadă de priorizare = pagină nouă dedicată** (`/admin/recuperare-telefonica`),
+   nu doar un filtru în tabul „Abandonuri" existent — vizual mai curat pentru
+   o coadă de lucru zilnică a echipei.
+
+## Schema DB (migrația 156)
+
+```sql
+ALTER TABLE orders ADD COLUMN phone_contacted_at TIMESTAMPTZ;
+ALTER TABLE orders ADD COLUMN phone_contacted_by TEXT;      -- email admin
+ALTER TABLE orders ADD COLUMN phone_contact_notes TEXT;
+
+CREATE INDEX idx_orders_phone_contacted_at ON orders (phone_contacted_at)
+  WHERE phone_contacted_at IS NOT NULL;
+
+-- order_history: event_type nou 'phone_contact_logged' (audit, chiar dacă
+-- UI-ul arată doar ultima bifă)
+-- coupons: system_kind extins cu 'phone_recovery' (pe lângă 'recovery')
+```
+
+## Coada de priorizare — `GET /api/admin/orders/priority-calls`
+
+Permisiune: `orders.view`. Reia populația țintă a cronului `recovery-emails`
+(status `draft`/`abandoned`, ≤30 zile, draft filtrat prin
+`hasProgressBeyondContact` — extras în `src/lib/orders/abandoned-progress.ts`,
+partajat acum cu cronul) și o sortează pentru un om, nu pentru un cron:
+
+- **tier 2** — telefon străin (`isForeignPhone`, regex mobil românesc) ȘI
+  serviciu de stare civilă (`certificat-nastere`, `certificat-casatorie`,
+  `extras-multilingv-certificat-nastere`). Diaspora + termen real (ambasadă,
+  oficiu stare civilă) = cea mai bună rată de conversie la telefon
+  (cercetare: valoare + urgență = prioritate universală în call-center).
+- **tier 1** — telefon străin SAU serviciu de stare civilă (unul din două).
+- **tier 0** — restul.
+
+În fiecare tier, cele mai recente abandonuri primele (fereastra utilă de apel
+se închide rapid — cercetare: conversie scade mult după 24h de la abandon).
+
+`?includeContacted=1` arată și comenzile deja sunate (implicit ascunse).
+Răspunsul include `conversion: { contactedTotal, contactedConverted }` —
+proxy simplu: din toate comenzile sunate vreodată, câte au ieșit din
+`draft`/`abandoned`/`cancelled` (= au dus comanda mai departe).
+
+## Marcare contact — `POST /api/admin/orders/[id]/phone-contact`
+
+Permisiune: `orders.manage`. Body `{ notes?: string }` (opțional, max 2000
+caractere). Suprascrie `phone_contacted_at/_by/_notes` cu apelul curent +
+insert în `order_history` (`phone_contact_logged`) pentru audit.
+
+## Cupon custom — extensie `/admin/coupons`
+
+`POST /api/admin/coupons` acceptă acum `system_kind: 'recovery' | 'phone_recovery'`.
+Din `/admin/recuperare-telefonica`, butonul „Cupon" deschide
+`/admin/coupons?order=<friendly_id>&system_kind=phone_recovery`: pagina
+detectează query string-ul, deschide dialogul de creare cu descrierea
+pre-completată (`Cupon telefonic — comanda <id>`), cod sugerat `TEL-XXXXXX`,
+`max_uses` implicit 1 — **dar procentul/suma rămân la latitudinea agentului**,
+nu sunt fixate. Cercetare: discount discreționar, potrivit obiecției reale a
+clientului, convertește mai bine decât un procent fix generic dat de sistem.
+Tabelul de cupoane arată badge „Telefonic" (albastru) vs „Auto" (galben,
+`system_kind='recovery'`) pentru distincție rapidă.
+
+## UI — `/admin/recuperare-telefonica`
+
+Tabel cu prioritate/client/telefon/serviciu/valoare/vechime/status apel +
+acțiuni (`tel:` link, bifează sunat cu notă, cupon custom, deschide comanda).
+Header arată numărul de comenzi în coadă și rata de conversie curentă.
+Nav: `/admin/layout.tsx`, lângă „Abandonuri", permisiune `orders.view`,
+ascuns pentru rolul `avocat` (la fel ca restul secțiunii operaționale).
+
+## Fișiere
+
+- `supabase/migrations/156_phone_recovery_tracking.sql`
+- `src/lib/orders/abandoned-progress.ts` (nou, extras din cronul recovery-emails)
+- `src/app/api/admin/orders/[id]/phone-contact/route.ts`
+- `src/app/api/admin/orders/priority-calls/route.ts`
+- `src/app/admin/recuperare-telefonica/page.tsx`
+- `src/app/api/admin/coupons/route.ts` (extins cu `system_kind`)
+- `src/app/admin/coupons/page.tsx` (extins cu prefill din query string + badge)
+- `tests/unit/lib/orders/abandoned-progress.test.ts`
+
+## Ce NU face (scop redus intenționat)
+
+- Nu ține istoric de apeluri multiple — vezi decizia 1 de mai sus.
+- Nu trimite SMS/WhatsApp automat — doar link `tel:` pentru apel manual.
+- Nu calculează "conversie" per apel individual, doar per comandă (proxy).
diff --git a/docs/technical/specs/warmup-email-campaign.md b/docs/technical/specs/warmup-email-campaign.md
new file mode 100644
index 0000000..141f79c
--- /dev/null
+++ b/docs/technical/specs/warmup-email-campaign.md
@@ -0,0 +1,76 @@
+# Warm-up email — registrul de 72k contacte
+
+**Status:** ✅ LIVRAT 2026-09-14 · migrația 157 · **implicit OPRIT** (switch în `/admin/marketing`)
+**Context:** decizie de business (Raul) — contactele din `contacts` (72.278, majoritatea import WPForms de pe eghiseul.ro vechi) sunt foști clienți/lead-uri cu consimțământ acordat pe platforma veche. Se trimite email de reactivare la toți, dar treptat. Detalii complete + cercetare în `docs/marketing/email-marketing-plan-2026-09.md`.
+
+## De ce implicit oprit
+
+Trimiterea reală către mii de persoane e o acțiune cu impact greu de reversat
+(reputație de sender, plângeri, imagine). Feature-ul e complet funcțional dar
+**nu pornește singur** — cronul rulează zilnic oricum (per `vercel.json`) dar
+iese imediat dacă `admin_settings.warmup_campaign.enabled = false` (valoare
+implicită). Echipa pornește manual din `/admin/marketing` după ce revizuiește
+conținutul emailului.
+
+## Schema DB (migrația 157)
+
+```sql
+ALTER TABLE contacts ADD COLUMN unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();
+ALTER TABLE contacts ADD COLUMN warmup_email_sent_at TIMESTAMPTZ;
+-- index unic pe token + index parțial pentru selecția batch-ului zilnic
+```
+
+Populație țintă: `marketing_status NOT IN ('unsubscribed', 'suppressed')` —
+tabelul `contacts` deja suportă aceste statusuri (migrația 110).
+
+## Cron — `POST/GET /api/cron/warmup-campaign`
+
+- Auth: `CRON_SECRET` (Bearer), programat zilnic 07:00 UTC în `vercel.json`.
+- Citește `admin_settings.warmup_campaign` (`{ enabled, dailyBatchSize }`,
+  implicit `{ enabled: false, dailyBatchSize: 25 }` dacă rândul nu există).
+- Iese imediat dacă `enabled=false`.
+- Selectează batch-ul: nesunați (`warmup_email_sent_at IS NULL`), eligibili,
+  ordonați FIFO după `first_seen_at` (nimeni nu așteaptă la infinit).
+- Trimite `src/lib/email/templates/warmup-reengagement.ts` prin Resend
+  (`idempotencyKey: warmup-<contact.id>` — protecție împotriva dublei trimiteri
+  la rulări suprapuse, nu există claim atomic separat).
+- Marchează `warmup_email_sent_at` doar la succes real (skip-urile din lipsă
+  de config Resend rămân nemarcate pentru retry).
+
+## Dezabonare — `GET /api/contacts/unsubscribe?token=`
+
+Independent de `/api/newsletter/unsubscribe` (acela operează pe
+`newsletter_subscribers`, opt-in explicit, populație diferită — cei ~37).
+Token propriu per contact (`contacts.unsubscribe_token`), un click →
+`marketing_status = 'unsubscribed'`. Rândul rămâne (dovadă), nu se șterge.
+
+## Admin UI — `/admin/marketing`
+
+Card nou deasupra listei de abonați newsletter:
+- Statistici live: total contacte, câte au primit deja emailul, câte rămân,
+  câți s-au dezabonat (`GET /api/admin/marketing/warmup-stats`).
+- Switch enable/disable + input „câți pe zi" — salvează în
+  `admin_settings.warmup_campaign` prin endpoint-ul generic
+  `PATCH /api/admin/settings` (cheie adăugată în allowlist, cu validare de
+  formă `{enabled: boolean, dailyBatchSize: 1-2000}`).
+
+## Fișiere
+
+- `supabase/migrations/157_contacts_warmup_campaign.sql`
+- `src/lib/email/deliverability.ts` (nou — extras din `recovery-emails`, TEST_EMAILS + isUndeliverable partajate)
+- `src/lib/email/templates/warmup-reengagement.ts`
+- `src/app/api/cron/warmup-campaign/route.ts`
+- `src/app/api/contacts/unsubscribe/route.ts`
+- `src/app/api/admin/marketing/warmup-stats/route.ts`
+- `src/app/api/admin/settings/route.ts` (extins cu cheia `warmup_campaign`)
+- `src/app/admin/marketing/page.tsx` (extins cu `WarmupCampaignCard`)
+
+## Ce NU face (scop redus intenționat)
+
+- Nu segmentează conținutul per serviciu dincolo de un hint simplu (primul
+  serviciu din `contacts.services`) — un singur template pentru toți.
+- Nu crește automat volumul zilnic — echipa ajustează manual din UI pe măsură
+  ce verifică bounce/spam rate în Resend.
+- Nu are claim atomic pe rândul de contact înainte de trimitere — se bazează
+  pe idempotency key la Resend (risc scăzut, batch mic, o singură trimitere
+  per contact oricum).
diff --git a/src/app/admin/coupons/page.tsx b/src/app/admin/coupons/page.tsx
index a9c1a79..ddfdc19 100644
--- a/src/app/admin/coupons/page.tsx
+++ b/src/app/admin/coupons/page.tsx
@@ -1,6 +1,7 @@
 'use client';
 
 import { useCallback, useEffect, useState } from 'react';
+import { useRouter, useSearchParams } from 'next/navigation';
 import {
   Table,
   TableBody,
@@ -72,6 +73,7 @@ interface Coupon {
   created_by: string | null;
   created_at: string;
   updated_at: string;
+  system_kind: 'recovery' | 'phone_recovery' | null;
 }
 
 interface Pagination {
@@ -121,6 +123,8 @@ function isoToLocal(iso: string | null): string {
 
 export default function AdminCouponsPage() {
   const { hasPermission } = useAdminPermissions();
+  const router = useRouter();
+  const searchParams = useSearchParams();
   const [coupons, setCoupons] = useState<Coupon[]>([]);
   const [pagination, setPagination] = useState<Pagination | null>(null);
   const [loading, setLoading] = useState(true);
@@ -130,8 +134,27 @@ export default function AdminCouponsPage() {
   const [editing, setEditing] = useState<Coupon | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
   const [copiedId, setCopiedId] = useState<string | null>(null);
+  const [prefill, setPrefill] = useState<{ description: string; systemKind: 'phone_recovery' } | null>(null);
   const PAGE_LIMIT = 50;
 
+  // Deschidere prefilled din pagina "Recuperare telefonică": link cu
+  // ?order=<friendly_id>&system_kind=phone_recovery deschide direct formularul
+  // de cupon custom, descriere completată, gata de trimis echipei la telefon.
+  useEffect(() => {
+    const orderRef = searchParams.get('order');
+    const systemKind = searchParams.get('system_kind');
+    if (orderRef && systemKind === 'phone_recovery') {
+      setPrefill({
+        description: `Cupon telefonic — comanda ${orderRef}`,
+        systemKind: 'phone_recovery',
+      });
+      setEditing(null);
+      setFormOpen(true);
+      router.replace('/admin/coupons');
+    }
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, []);
+
   const fetchCoupons = useCallback(async () => {
     setLoading(true);
     try {
@@ -299,9 +322,21 @@ export default function AdminCouponsPage() {
                   return (
                     <TableRow key={c.id}>
                       <TableCell>
-                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-bold">
-                          {c.code}
-                        </code>
+                        <div className="flex items-center gap-1.5">
+                          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-bold">
+                            {c.code}
+                          </code>
+                          {c.system_kind === 'phone_recovery' && (
+                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
+                              Telefonic
+                            </span>
+                          )}
+                          {c.system_kind === 'recovery' && (
+                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
+                              Auto
+                            </span>
+                          )}
+                        </div>
                       </TableCell>
                       <TableCell className="text-sm">
                         {c.discount_type === 'percentage' ? 'Procentual' : 'Fix'}
@@ -407,13 +442,16 @@ export default function AdminCouponsPage() {
       <CouponFormDialog
         open={formOpen}
         editing={editing}
+        prefill={prefill}
         onClose={() => {
           setFormOpen(false);
           setEditing(null);
+          setPrefill(null);
         }}
         onSaved={() => {
           setFormOpen(false);
           setEditing(null);
+          setPrefill(null);
           fetchCoupons();
         }}
       />
@@ -454,11 +492,12 @@ export default function AdminCouponsPage() {
 interface FormProps {
   open: boolean;
   editing: Coupon | null;
+  prefill?: { description: string; systemKind: 'phone_recovery' } | null;
   onClose: () => void;
   onSaved: () => void;
 }
 
-function CouponFormDialog({ open, editing, onClose, onSaved }: FormProps) {
+function CouponFormDialog({ open, editing, prefill, onClose, onSaved }: FormProps) {
   const [code, setCode] = useState('');
   const [description, setDescription] = useState('');
   const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
@@ -485,18 +524,18 @@ function CouponFormDialog({ open, editing, onClose, onSaved }: FormProps) {
       setValidUntil(isoToLocal(editing.valid_until));
       setIsActive(editing.is_active);
     } else {
-      setCode('');
-      setDescription('');
+      setCode(prefill ? `TEL-${Math.random().toString(36).slice(2, 8).toUpperCase()}` : '');
+      setDescription(prefill?.description ?? '');
       setDiscountType('percentage');
       setDiscountValue('');
       setMinAmount('0');
-      setMaxUses('');
+      setMaxUses(prefill ? '1' : '');
       setValidFrom('');
       setValidUntil('');
       setIsActive(true);
     }
     setError(null);
-  }, [open, editing]);
+  }, [open, editing, prefill]);
 
   const handleSubmit = async () => {
     setError(null);
@@ -543,6 +582,7 @@ function CouponFormDialog({ open, editing, onClose, onSaved }: FormProps) {
       valid_from: localToIso(validFrom),
       valid_until: localToIso(validUntil),
       is_active: isActive,
+      system_kind: !editing && prefill ? prefill.systemKind : undefined,
     };
 
     setSaving(true);
@@ -576,7 +616,9 @@ function CouponFormDialog({ open, editing, onClose, onSaved }: FormProps) {
           <DialogDescription>
             {editing
               ? 'Modifica detaliile cuponului. Codul poate fi schimbat (atentie la comenzile existente).'
-              : 'Creeaza un cod de reducere pentru clienti.'}
+              : prefill
+                ? 'Cupon discreționar pentru un caz discutat la telefon. Alege tu procentul/suma potrivit(ă) obiecției clientului.'
+                : 'Creeaza un cod de reducere pentru clienti.'}
           </DialogDescription>
         </DialogHeader>
 
diff --git a/src/app/admin/layout.tsx b/src/app/admin/layout.tsx
index ae74072..2de5bfe 100644
--- a/src/app/admin/layout.tsx
+++ b/src/app/admin/layout.tsx
@@ -23,6 +23,7 @@ import {
   Mail,
   Banknote,
   Coins,
+  Phone,
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
@@ -56,6 +57,7 @@ const NAV_ITEMS: NavItem[] = [
   { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, hideForRoles: ['avocat'] },
   { href: '/admin/orders', label: 'Comenzi', icon: ClipboardList, permission: 'orders.view' },
   { href: '/admin/orders?status=abandoned', label: 'Abandonuri', icon: UserX, permission: 'orders.view', hideForRoles: ['avocat'] },
+  { href: '/admin/recuperare-telefonica', label: 'Recuperare telefonică', icon: Phone, permission: 'orders.view', hideForRoles: ['avocat'] },
   { href: '/admin/registru', label: 'Registru', icon: BookOpen, permission: 'registry.manage' },
   { href: '/admin/onrc', label: 'ONRC', icon: Landmark, permission: 'orders.view', hideForRoles: ['avocat'] },
   { href: '/admin/ancpi', label: 'ANCPI', icon: Landmark, permission: 'orders.view', hideForRoles: ['avocat'] },
diff --git a/src/app/admin/marketing/page.tsx b/src/app/admin/marketing/page.tsx
index 0ce0847..59c5d25 100644
--- a/src/app/admin/marketing/page.tsx
+++ b/src/app/admin/marketing/page.tsx
@@ -14,8 +14,11 @@ import {
 } from '@/components/ui/table';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
+import { Switch } from '@/components/ui/switch';
 import { Skeleton } from '@/components/ui/skeleton';
-import { Mail, Download, RefreshCw, Search } from 'lucide-react';
+import { Card, CardContent } from '@/components/ui/card';
+import { Mail, Download, RefreshCw, Search, Send } from 'lucide-react';
+import { toast } from 'sonner';
 
 interface Subscriber {
   id: string;
@@ -27,6 +30,149 @@ interface Subscriber {
   unsubscribed_at: string | null;
 }
 
+interface WarmupStats {
+  total: number;
+  sent: number;
+  remaining: number;
+  unsubscribed: number;
+}
+
+interface WarmupSettings {
+  enabled: boolean;
+  dailyBatchSize: number;
+}
+
+function WarmupCampaignCard() {
+  const [stats, setStats] = useState<WarmupStats | null>(null);
+  const [settings, setSettings] = useState<WarmupSettings>({ enabled: false, dailyBatchSize: 25 });
+  const [batchInput, setBatchInput] = useState('25');
+  const [loading, setLoading] = useState(true);
+  const [saving, setSaving] = useState(false);
+
+  const load = useCallback(async () => {
+    setLoading(true);
+    try {
+      const [statsRes, settingsRes] = await Promise.all([
+        fetch('/api/admin/marketing/warmup-stats'),
+        fetch('/api/admin/settings'),
+      ]);
+      const statsJson = await statsRes.json();
+      const settingsJson = await settingsRes.json();
+      if (statsJson.success) setStats(statsJson.data);
+      const s: WarmupSettings = settingsJson.data?.warmup_campaign ?? { enabled: false, dailyBatchSize: 25 };
+      setSettings(s);
+      setBatchInput(String(s.dailyBatchSize));
+    } finally {
+      setLoading(false);
+    }
+  }, []);
+
+  useEffect(() => {
+    load();
+  }, [load]);
+
+  const save = async (next: WarmupSettings) => {
+    setSaving(true);
+    try {
+      const res = await fetch('/api/admin/settings', {
+        method: 'PATCH',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ key: 'warmup_campaign', value: next }),
+      });
+      const json = await res.json();
+      if (json.success) {
+        setSettings(next);
+        toast.success('Salvat');
+      } else {
+        toast.error(json.error || 'Eroare la salvare');
+      }
+    } catch {
+      toast.error('Eroare de rețea');
+    } finally {
+      setSaving(false);
+    }
+  };
+
+  const pct = stats && stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;
+
+  return (
+    <Card>
+      <CardContent className="space-y-4 p-5">
+        <div className="flex items-center justify-between">
+          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
+            <Send className="h-5 w-5" />
+            Campanie warm-up (registru 72k contacte)
+          </h2>
+          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
+            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
+            Reîncarcă
+          </Button>
+        </div>
+        <p className="text-sm text-muted-foreground">
+          Trimite câte un email de reactivare, o singură dată per contact, din registrul intern
+          (<a href="/admin/clienti" className="text-primary-700 underline">/admin/clienti</a>) — treptat,
+          nu într-un singur val. Detalii: <code>docs/marketing/email-marketing-plan-2026-09.md</code>.
+        </p>
+
+        {stats && (
+          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
+            <div className="rounded-lg border bg-slate-50 p-3">
+              <div className="text-xs text-muted-foreground">Total contacte</div>
+              <div className="text-xl font-bold text-slate-900">{stats.total.toLocaleString('ro-RO')}</div>
+            </div>
+            <div className="rounded-lg border bg-slate-50 p-3">
+              <div className="text-xs text-muted-foreground">Deja trimise</div>
+              <div className="text-xl font-bold text-green-700">{stats.sent.toLocaleString('ro-RO')} ({pct}%)</div>
+            </div>
+            <div className="rounded-lg border bg-slate-50 p-3">
+              <div className="text-xs text-muted-foreground">Rămase</div>
+              <div className="text-xl font-bold text-slate-900">{stats.remaining.toLocaleString('ro-RO')}</div>
+            </div>
+            <div className="rounded-lg border bg-slate-50 p-3">
+              <div className="text-xs text-muted-foreground">Dezabonați</div>
+              <div className="text-xl font-bold text-red-700">{stats.unsubscribed.toLocaleString('ro-RO')}</div>
+            </div>
+          </div>
+        )}
+
+        <div className="flex flex-wrap items-center gap-4 border-t pt-4">
+          <div className="flex items-center gap-2">
+            <Switch
+              checked={settings.enabled}
+              onCheckedChange={(checked) => save({ ...settings, enabled: checked })}
+              disabled={saving}
+            />
+            <span className="text-sm font-medium">
+              {settings.enabled ? 'Activă — cronul trimite zilnic' : 'Oprită — implicit, nimic nu se trimite'}
+            </span>
+          </div>
+          <div className="flex items-center gap-2">
+            <label htmlFor="warmup-batch" className="text-sm text-muted-foreground">Pe zi:</label>
+            <Input
+              id="warmup-batch"
+              type="number"
+              min={1}
+              max={2000}
+              value={batchInput}
+              onChange={(e) => setBatchInput(e.target.value)}
+              onBlur={() => {
+                const n = parseInt(batchInput, 10);
+                if (Number.isInteger(n) && n >= 1 && n <= 2000 && n !== settings.dailyBatchSize) {
+                  save({ ...settings, dailyBatchSize: n });
+                } else {
+                  setBatchInput(String(settings.dailyBatchSize));
+                }
+              }}
+              className="w-24"
+              disabled={saving}
+            />
+          </div>
+        </div>
+      </CardContent>
+    </Card>
+  );
+}
+
 export default function AdminMarketingPage() {
   const [rows, setRows] = useState<Subscriber[]>([]);
   const [loading, setLoading] = useState(true);
@@ -73,6 +219,8 @@ export default function AdminMarketingPage() {
 
   return (
     <div className="space-y-5">
+      <WarmupCampaignCard />
+
       <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
         <div>
           <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
diff --git a/src/app/admin/recuperare-telefonica/page.tsx b/src/app/admin/recuperare-telefonica/page.tsx
new file mode 100644
index 0000000..93b1eb5
--- /dev/null
+++ b/src/app/admin/recuperare-telefonica/page.tsx
@@ -0,0 +1,319 @@
+'use client';
+
+/**
+ * /admin/recuperare-telefonica — coadă de priorizare pentru echipa care sună
+ * clienții cu comenzi abandonate/draft, complementară cronului automat de
+ * email+cupon din `/admin/orders?status=abandoned` (acela trimite un email
+ * cu 10% reducere fix; redemption real doar 1.4% — vezi memorie/analiză
+ * 2026-09-14). Aici omul sună, ascultă motivul real și dă un cupon custom.
+ *
+ * Prioritizare (cercetare telefon vs email, 2026-09-14): telefon străin +
+ * serviciu de stare civilă (naștere/căsătorie) = tier maxim — diaspora, cu
+ * termene reale (ambasadă, oficiu stare civilă).
+ */
+
+import { useCallback, useEffect, useState } from 'react';
+import { Button } from '@/components/ui/button';
+import { Textarea } from '@/components/ui/textarea';
+import { Skeleton } from '@/components/ui/skeleton';
+import {
+  Dialog,
+  DialogContent,
+  DialogHeader,
+  DialogTitle,
+  DialogDescription,
+  DialogFooter,
+} from '@/components/ui/dialog';
+import { Phone, RefreshCw, Ticket, ExternalLink, CheckCircle2, Globe } from 'lucide-react';
+import { toast } from 'sonner';
+
+interface PriorityRow {
+  id: string;
+  friendlyOrderId: string | null;
+  orderNumber: string | null;
+  status: string;
+  totalRon: number;
+  createdAt: string;
+  serviceName: string;
+  serviceSlug: string | null;
+  email: string | null;
+  phone: string | null;
+  firstName: string | null;
+  lastName: string | null;
+  isForeignPhone: boolean;
+  isCivilStatus: boolean;
+  depthScore: number;
+  tier: 0 | 1 | 2;
+  phoneContactedAt: string | null;
+  phoneContactedBy: string | null;
+  phoneContactNotes: string | null;
+}
+
+function timeAgo(iso: string): string {
+  const ms = Date.now() - new Date(iso).getTime();
+  const hours = Math.floor(ms / 3_600_000);
+  if (hours < 1) return '<1h';
+  if (hours < 24) return `${hours}h`;
+  return `${Math.floor(hours / 24)}z`;
+}
+
+function tierBadge(tier: 0 | 1 | 2) {
+  if (tier === 2) {
+    return (
+      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
+        <Globe className="h-3 w-3" /> Prioritate maximă
+      </span>
+    );
+  }
+  if (tier === 1) {
+    return (
+      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
+        Prioritate
+      </span>
+    );
+  }
+  return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">Normal</span>;
+}
+
+export default function RecuperareTelefonicaPage() {
+  const [rows, setRows] = useState<PriorityRow[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [includeContacted, setIncludeContacted] = useState(false);
+  const [conversion, setConversion] = useState<{ contactedTotal: number; contactedConverted: number } | null>(null);
+  const [contactTarget, setContactTarget] = useState<PriorityRow | null>(null);
+  const [notes, setNotes] = useState('');
+  const [saving, setSaving] = useState(false);
+
+  const fetchRows = useCallback(async () => {
+    setLoading(true);
+    try {
+      const p = new URLSearchParams();
+      if (includeContacted) p.set('includeContacted', '1');
+      const res = await fetch(`/api/admin/orders/priority-calls?${p}`);
+      const json = await res.json();
+      if (json.success) {
+        setRows(json.data.rows);
+        setConversion(json.data.conversion);
+      } else {
+        toast.error(json.error?.message || 'Eroare la încărcare');
+      }
+    } catch {
+      toast.error('Eroare de rețea');
+    } finally {
+      setLoading(false);
+    }
+  }, [includeContacted]);
+
+  useEffect(() => {
+    fetchRows();
+  }, [fetchRows]);
+
+  const submitContact = async () => {
+    if (!contactTarget) return;
+    setSaving(true);
+    try {
+      const res = await fetch(`/api/admin/orders/${contactTarget.id}/phone-contact`, {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ notes }),
+      });
+      const json = await res.json();
+      if (json.success) {
+        toast.success('Marcat ca sunat');
+        setContactTarget(null);
+        setNotes('');
+        fetchRows();
+      } else {
+        toast.error(json.error?.message || 'Eroare la salvare');
+      }
+    } catch {
+      toast.error('Eroare de rețea');
+    } finally {
+      setSaving(false);
+    }
+  };
+
+  const conversionPct =
+    conversion && conversion.contactedTotal > 0
+      ? Math.round((conversion.contactedConverted / conversion.contactedTotal) * 100)
+      : null;
+
+  return (
+    <div className="space-y-5">
+      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
+        <div>
+          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
+            <Phone className="h-6 w-6" />
+            Recuperare telefonică
+          </h1>
+          <p className="mt-0.5 text-sm text-slate-500">
+            {rows.length} {rows.length === 1 ? 'comandă' : 'comenzi'} de sunat · sortate după prioritate
+            (telefon străin + certificat naștere/căsătorie primele) și apoi cele mai recente.
+            {conversionPct !== null && (
+              <> · conversie după apel: <strong>{conversionPct}%</strong> ({conversion?.contactedConverted}/{conversion?.contactedTotal})</>
+            )}
+          </p>
+        </div>
+        <div className="flex items-center gap-2">
+          <Button
+            variant={includeContacted ? 'default' : 'outline'}
+            size="sm"
+            onClick={() => setIncludeContacted((v) => !v)}
+          >
+            {includeContacted ? 'Ascunde sunate' : 'Arată și sunate'}
+          </Button>
+          <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
+            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
+            Reîncarcă
+          </Button>
+        </div>
+      </div>
+
+      <div className="rounded-lg border bg-white">
+        <table className="w-full text-sm">
+          <thead>
+            <tr className="border-b text-left text-xs text-slate-500">
+              <th className="px-3 py-2">Prioritate</th>
+              <th className="px-3 py-2">Client</th>
+              <th className="px-3 py-2">Serviciu</th>
+              <th className="px-3 py-2">Valoare</th>
+              <th className="px-3 py-2">Vechime</th>
+              <th className="px-3 py-2">Status apel</th>
+              <th className="px-3 py-2 text-right">Acțiuni</th>
+            </tr>
+          </thead>
+          <tbody>
+            {loading ? (
+              Array.from({ length: 5 }).map((_, i) => (
+                <tr key={i} className="border-b">
+                  {Array.from({ length: 7 }).map((_, j) => (
+                    <td key={j} className="px-3 py-2"><Skeleton className="h-5 w-full" /></td>
+                  ))}
+                </tr>
+              ))
+            ) : rows.length === 0 ? (
+              <tr>
+                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
+                  Nimic de sunat acum — coada e goală.
+                </td>
+              </tr>
+            ) : (
+              rows.map((r) => (
+                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
+                  <td className="px-3 py-2">{tierBadge(r.tier)}</td>
+                  <td className="px-3 py-2">
+                    <div className="font-medium text-slate-900">
+                      {[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}
+                    </div>
+                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
+                      {r.phone && (
+                        <a href={`tel:${r.phone}`} className="text-primary-700 underline">
+                          {r.phone}
+                        </a>
+                      )}
+                      {r.isForeignPhone && <span className="text-blue-600">(străin)</span>}
+                      {r.email && <span>{r.email}</span>}
+                    </div>
+                  </td>
+                  <td className="px-3 py-2">
+                    <span className="text-sm">{r.serviceName}</span>
+                    {r.isCivilStatus && (
+                      <span className="ml-1 rounded bg-blue-50 px-1 py-0.5 text-[10px] font-medium text-blue-700">
+                        stare civilă
+                      </span>
+                    )}
+                    <div className="text-[11px] text-muted-foreground">
+                      {r.depthScore > 3 ? 'date multe completate' : r.depthScore > 0 ? 'câteva date completate' : ''}
+                    </div>
+                  </td>
+                  <td className="px-3 py-2 font-medium">{r.totalRon.toFixed(0)} RON</td>
+                  <td className="px-3 py-2 text-muted-foreground">{timeAgo(r.createdAt)}</td>
+                  <td className="px-3 py-2">
+                    {r.phoneContactedAt ? (
+                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
+                        <CheckCircle2 className="h-3.5 w-3.5" />
+                        {new Date(r.phoneContactedAt).toLocaleDateString('ro-RO', {
+                          day: '2-digit', month: '2-digit', timeZone: 'Europe/Bucharest',
+                        })}
+                        {r.phoneContactedBy ? ` · ${r.phoneContactedBy}` : ''}
+                      </span>
+                    ) : (
+                      <span className="text-xs text-muted-foreground">nesunat</span>
+                    )}
+                    {r.phoneContactNotes && (
+                      <div className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground" title={r.phoneContactNotes}>
+                        {r.phoneContactNotes}
+                      </div>
+                    )}
+                  </td>
+                  <td className="px-3 py-2">
+                    <div className="flex items-center justify-end gap-1">
+                      <Button
+                        variant="outline"
+                        size="sm"
+                        onClick={() => {
+                          setContactTarget(r);
+                          setNotes(r.phoneContactNotes ?? '');
+                        }}
+                      >
+                        <CheckCircle2 className="h-3.5 w-3.5" />
+                        {r.phoneContactedAt ? 'Actualizează' : 'Bifează sunat'}
+                      </Button>
+                      {r.friendlyOrderId && (
+                        <a
+                          href={`/admin/coupons?order=${encodeURIComponent(r.friendlyOrderId)}&system_kind=phone_recovery`}
+                          className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-slate-50"
+                          title="Creează cupon custom pentru acest caz"
+                        >
+                          <Ticket className="h-3.5 w-3.5" />
+                          Cupon
+                        </a>
+                      )}
+                      <a
+                        href={`/admin/orders/${r.id}`}
+                        className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-slate-50"
+                        title="Deschide comanda"
+                      >
+                        <ExternalLink className="h-3.5 w-3.5" />
+                      </a>
+                    </div>
+                  </td>
+                </tr>
+              ))
+            )}
+          </tbody>
+        </table>
+      </div>
+
+      <Dialog open={!!contactTarget} onOpenChange={(o) => !o && setContactTarget(null)}>
+        <DialogContent className="sm:max-w-md">
+          <DialogHeader>
+            <DialogTitle>Bifează contactat telefonic</DialogTitle>
+            <DialogDescription>
+              {contactTarget && (
+                <>
+                  {[contactTarget.firstName, contactTarget.lastName].filter(Boolean).join(' ') || 'Client'} ·{' '}
+                  {contactTarget.serviceName}
+                </>
+              )}
+            </DialogDescription>
+          </DialogHeader>
+          <Textarea
+            value={notes}
+            onChange={(e) => setNotes(e.target.value)}
+            placeholder="Ce a spus clientul, ce ai stabilit (ex: a promis plată mâine, a cerut cupon 15%, nu a răspuns)..."
+            rows={4}
+          />
+          <DialogFooter>
+            <Button variant="outline" onClick={() => setContactTarget(null)} disabled={saving}>
+              Anulează
+            </Button>
+            <Button onClick={submitContact} disabled={saving}>
+              {saving ? 'Se salvează...' : 'Salvează'}
+            </Button>
+          </DialogFooter>
+        </DialogContent>
+      </Dialog>
+    </div>
+  );
+}
diff --git a/src/app/api/admin/coupons/route.ts b/src/app/api/admin/coupons/route.ts
index 75ffe84..d1dcb17 100644
--- a/src/app/api/admin/coupons/route.ts
+++ b/src/app/api/admin/coupons/route.ts
@@ -23,6 +23,7 @@ const createCouponSchema = z.object({
   valid_from: z.string().datetime().optional().nullable(),
   valid_until: z.string().datetime().optional().nullable(),
   is_active: z.boolean().default(true),
+  system_kind: z.enum(['recovery', 'phone_recovery']).optional().nullable(),
 });
 
 // ──────────────────────────────────────────────────────────────
@@ -164,6 +165,7 @@ export async function POST(request: NextRequest) {
         valid_until: payload.valid_until ?? null,
         is_active: payload.is_active,
         created_by: user.id,
+        system_kind: payload.system_kind ?? null,
       })
       .select()
       .single();
diff --git a/src/app/api/admin/marketing/warmup-stats/route.ts b/src/app/api/admin/marketing/warmup-stats/route.ts
new file mode 100644
index 0000000..5c8924e
--- /dev/null
+++ b/src/app/api/admin/marketing/warmup-stats/route.ts
@@ -0,0 +1,49 @@
+/**
+ * GET /api/admin/marketing/warmup-stats
+ * Progres campania de warm-up pe registrul de contacte (72k) — câți au primit
+ * deja emailul de reactivare, câți rămân, câți s-au dezabonat.
+ * Permission: settings.manage
+ */
+
+import { NextResponse } from 'next/server';
+import { createClient } from '@/lib/supabase/server';
+import { createAdminClient } from '@/lib/supabase/admin';
+import { requirePermission } from '@/lib/admin/permissions';
+
+export const dynamic = 'force-dynamic';
+
+export async function GET() {
+  const supabase = await createClient();
+  const {
+    data: { user },
+    error: authError,
+  } = await supabase.auth.getUser();
+  if (authError || !user) {
+    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
+  }
+  try {
+    await requirePermission(user.id, 'settings.manage');
+  } catch (error) {
+    if (error instanceof Response) return error;
+    throw error;
+  }
+
+  // eslint-disable-next-line @typescript-eslint/no-explicit-any
+  const contactsTable = (createAdminClient() as any).from('contacts');
+
+  const [{ count: total }, { count: sent }, { count: unsubscribed }] = await Promise.all([
+    contactsTable.select('id', { count: 'exact', head: true }),
+    contactsTable.select('id', { count: 'exact', head: true }).not('warmup_email_sent_at', 'is', null),
+    contactsTable.select('id', { count: 'exact', head: true }).eq('marketing_status', 'unsubscribed'),
+  ]);
+
+  return NextResponse.json({
+    success: true,
+    data: {
+      total: total ?? 0,
+      sent: sent ?? 0,
+      remaining: (total ?? 0) - (sent ?? 0),
+      unsubscribed: unsubscribed ?? 0,
+    },
+  });
+}
diff --git a/src/app/api/admin/orders/[id]/phone-contact/route.ts b/src/app/api/admin/orders/[id]/phone-contact/route.ts
new file mode 100644
index 0000000..67a2456
--- /dev/null
+++ b/src/app/api/admin/orders/[id]/phone-contact/route.ts
@@ -0,0 +1,97 @@
+/**
+ * POST /api/admin/orders/[id]/phone-contact
+ *
+ * Marchează o comandă abandonată/draft ca "sunată de echipă". Bifa e
+ * suprascrisă la fiecare apel (fără istoric de încercări — decizie
+ * 2026-09-14): `phone_contacted_at`/`_by`/`_notes` țin doar ultimul apel.
+ * Log complet rămâne în `order_history` (`event_type='phone_contact_logged'`)
+ * pentru audit, chiar dacă UI-ul arată doar ultima stare.
+ *
+ * Authentication: requires `orders.manage` permission.
+ * Body: `{ notes?: string }` (opțional, max 2000 caractere).
+ */
+
+import { NextRequest, NextResponse } from 'next/server';
+import { createClient } from '@/lib/supabase/server';
+import { createAdminClient } from '@/lib/supabase/admin';
+import { requirePermission } from '@/lib/admin/permissions';
+
+const MAX_NOTES_LENGTH = 2000;
+
+interface RouteParams {
+  params: Promise<{ id: string }>;
+}
+
+export async function POST(request: NextRequest, { params }: RouteParams) {
+  const { id } = await params;
+
+  const supabase = await createClient();
+  const {
+    data: { user },
+    error: authError,
+  } = await supabase.auth.getUser();
+
+  if (authError || !user) {
+    return NextResponse.json(
+      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
+      { status: 401 }
+    );
+  }
+
+  try {
+    await requirePermission(user.id, 'orders.manage');
+  } catch (error) {
+    if (error instanceof Response) return error;
+    throw error;
+  }
+
+  let body: { notes?: string } = {};
+  try {
+    body = await request.json();
+  } catch {
+    // body optional — bifă fără notă e validă
+  }
+
+  const rawNotes = typeof body.notes === 'string' ? body.notes : '';
+  const notes = rawNotes.trim().slice(0, MAX_NOTES_LENGTH) || null;
+
+  const admin = createAdminClient();
+
+  const { data: profile } = await admin
+    .from('profiles')
+    .select('email')
+    .eq('id', user.id)
+    .single();
+  const changedBy = profile?.email ?? user.email ?? 'admin';
+  const now = new Date().toISOString();
+
+  // eslint-disable-next-line @typescript-eslint/no-explicit-any
+  const { data: order, error: updateError } = await (admin.from('orders') as any)
+    .update({
+      phone_contacted_at: now,
+      phone_contacted_by: changedBy,
+      phone_contact_notes: notes,
+    })
+    .eq('id', id)
+    .select('id, friendly_order_id')
+    .single();
+
+  if (updateError) {
+    return NextResponse.json(
+      { success: false, error: { code: 'UPDATE_FAILED', message: updateError.message } },
+      { status: 500 }
+    );
+  }
+
+  const { error: historyError } = await admin.from('order_history').insert({
+    order_id: id,
+    event_type: 'phone_contact_logged',
+    changed_by: changedBy,
+    notes: notes ? `Contactat telefonic: ${notes}` : 'Contactat telefonic',
+  });
+  if (historyError) {
+    console.error('[phone-contact] order_history insert failed:', historyError);
+  }
+
+  return NextResponse.json({ success: true, data: order });
+}
diff --git a/src/app/api/admin/orders/priority-calls/route.ts b/src/app/api/admin/orders/priority-calls/route.ts
new file mode 100644
index 0000000..8a5feae
--- /dev/null
+++ b/src/app/api/admin/orders/priority-calls/route.ts
@@ -0,0 +1,200 @@
+/**
+ * GET /api/admin/orders/priority-calls
+ *
+ * Coadă de priorizare pentru recuperarea telefonică a comenzilor abandonate.
+ * Reia populația țintă a cron-ului `recovery-emails` (status draft/abandoned,
+ * ≤30 zile, draft cu progres real dincolo de contact) și o ordonează pentru
+ * un om care sună, nu pentru un cron care trimite email:
+ *
+ *   tier 2 — telefon străin ȘI serviciu de stare civilă (naștere/căsătorie/
+ *            extras multilingv) — cazuri diaspora cu termen (ambasadă, etc.)
+ *   tier 1 — telefon străin SAU serviciu de stare civilă
+ *   tier 0 — restul
+ *
+ * Comenzile fără nume identificabil (doar email/telefon, nimic altceva) NU
+ * intră în coadă — nu merită efortul unui apel, primesc oricum emailul
+ * automat din `recovery-emails`.
+ *
+ * În fiecare tier, scor de profunzime mai mare primul (cine a completat mult
+ * din wizard nu a abandonat "din prima" — e mai aproape de a cumpăra), apoi
+ * cele mai recente abandonuri (fereastra utilă de apel se închide rapid —
+ * cercetare: conversie scade mult după 24h).
+ *
+ * Authentication: requires `orders.view` permission.
+ * Query: `?includeContacted=1` arată și comenzile deja sunate (implicit ascunse).
+ */
+
+import { NextRequest, NextResponse } from 'next/server';
+import { createClient } from '@/lib/supabase/server';
+import { createAdminClient } from '@/lib/supabase/admin';
+import { requirePermission } from '@/lib/admin/permissions';
+import {
+  hasProgressBeyondContact,
+  isForeignPhone,
+  dataDepthScore,
+  hasIdentifiableName,
+} from '@/lib/orders/abandoned-progress';
+
+const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
+
+// Servicii de stare civilă — prioritate mare: diaspora, termene de ambasadă/
+// oficiu stare civilă, valoare/urgență ridicată (cercetare telefon vs email).
+const CIVIL_STATUS_SLUGS = new Set([
+  'certificat-nastere',
+  'certificat-casatorie',
+  'extras-multilingv-certificat-nastere',
+]);
+
+interface PriorityRow {
+  id: string;
+  friendlyOrderId: string | null;
+  orderNumber: string | null;
+  status: string;
+  totalRon: number;
+  createdAt: string;
+  updatedAt: string;
+  serviceName: string;
+  serviceSlug: string | null;
+  email: string | null;
+  phone: string | null;
+  firstName: string | null;
+  lastName: string | null;
+  isForeignPhone: boolean;
+  isCivilStatus: boolean;
+  depthScore: number;
+  tier: 0 | 1 | 2;
+  phoneContactedAt: string | null;
+  phoneContactedBy: string | null;
+  phoneContactNotes: string | null;
+}
+
+export async function GET(request: NextRequest) {
+  const supabase = await createClient();
+  const {
+    data: { user },
+    error: authError,
+  } = await supabase.auth.getUser();
+
+  if (authError || !user) {
+    return NextResponse.json(
+      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
+      { status: 401 }
+    );
+  }
+
+  try {
+    await requirePermission(user.id, 'orders.view');
+  } catch (error) {
+    if (error instanceof Response) return error;
+    throw error;
+  }
+
+  const includeContacted = request.nextUrl.searchParams.get('includeContacted') === '1';
+
+  const admin = createAdminClient();
+  const minIso = new Date(Date.now() - MAX_AGE_MS).toISOString();
+
+  // eslint-disable-next-line @typescript-eslint/no-explicit-any
+  const ordersTable = admin.from('orders') as any;
+  let query = ordersTable
+    .select(
+      'id, order_number, friendly_order_id, status, total_price, customer_data, created_at, updated_at, phone_contacted_at, phone_contacted_by, phone_contact_notes, services(name, slug)'
+    )
+    .in('status', ['abandoned', 'draft'])
+    .gte('created_at', minIso)
+    .order('created_at', { ascending: false })
+    .limit(300);
+
+  if (!includeContacted) {
+    query = query.is('phone_contacted_at', null);
+  }
+
+  const { data, error } = await query;
+  if (error) {
+    return NextResponse.json(
+      { success: false, error: { code: 'FETCH_FAILED', message: error.message } },
+      { status: 500 }
+    );
+  }
+
+  const rows: PriorityRow[] = [];
+  for (const order of data ?? []) {
+    // eslint-disable-next-line @typescript-eslint/no-explicit-any
+    const cd = (order.customer_data ?? {}) as any;
+
+    if (order.status === 'draft' && !hasProgressBeyondContact(order.customer_data)) {
+      continue; // window-shopper — nimic real de discutat la telefon
+    }
+    if (!hasIdentifiableName(order.customer_data)) {
+      continue; // nici nume nu avem — nu merită apel, oricum primește email
+    }
+
+    const email = (cd.contact?.email ?? null) as string | null;
+    const phone = (cd.contact?.phone ?? null) as string | null;
+    const foreign = isForeignPhone(phone);
+    // eslint-disable-next-line @typescript-eslint/no-explicit-any
+    const slug = ((order as any).services?.slug ?? null) as string | null;
+    const civilStatus = slug ? CIVIL_STATUS_SLUGS.has(slug) : false;
+
+    const tier: 0 | 1 | 2 = foreign && civilStatus ? 2 : foreign || civilStatus ? 1 : 0;
+    const depthScore = dataDepthScore(order.customer_data);
+
+    rows.push({
+      id: order.id,
+      friendlyOrderId: order.friendly_order_id ?? null,
+      orderNumber: order.order_number ?? null,
+      status: order.status,
+      totalRon: Number(order.total_price ?? 0),
+      createdAt: order.created_at,
+      updatedAt: order.updated_at,
+      // eslint-disable-next-line @typescript-eslint/no-explicit-any
+      serviceName: ((order as any).services?.name ?? 'necunoscut') as string,
+      serviceSlug: slug,
+      email,
+      phone,
+      firstName: (cd.personal?.firstName ?? cd.contact?.firstName ?? null) as string | null,
+      lastName: (cd.personal?.lastName ?? cd.contact?.lastName ?? null) as string | null,
+      isForeignPhone: foreign,
+      isCivilStatus: civilStatus,
+      depthScore,
+      tier,
+      phoneContactedAt: order.phone_contacted_at ?? null,
+      phoneContactedBy: order.phone_contacted_by ?? null,
+      phoneContactNotes: order.phone_contact_notes ?? null,
+    });
+  }
+
+  rows.sort((a, b) => {
+    if (a.tier !== b.tier) return b.tier - a.tier;
+    if (a.depthScore !== b.depthScore) return b.depthScore - a.depthScore;
+    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
+  });
+
+  // Conversie: din toate comenzile sunate vreodată (orice vechime, orice
+  // status), câte au ieșit din draft/abandoned = au dus comanda mai departe.
+  // Proxy simplu — nu urmărim apeluri individuale, doar bifa curentă.
+  const { count: contactedTotal } = await ordersTable
+    .select('id', { count: 'exact', head: true })
+    .not('phone_contacted_at', 'is', null);
+  const { count: contactedConverted } = await ordersTable
+    .select('id', { count: 'exact', head: true })
+    .not('phone_contacted_at', 'is', null)
+    .not('status', 'in', '(draft,abandoned,cancelled)');
+
+  return NextResponse.json({
+    success: true,
+    data: {
+      rows,
+      counts: {
+        total: rows.length,
+        tier2: rows.filter((r) => r.tier === 2).length,
+        tier1: rows.filter((r) => r.tier === 1).length,
+        tier0: rows.filter((r) => r.tier === 0).length,
+      },
+      conversion: {
+        contactedTotal: contactedTotal ?? 0,
+        contactedConverted: contactedConverted ?? 0,
+      },
+    },
+  });
+}
diff --git a/src/app/api/admin/settings/route.ts b/src/app/api/admin/settings/route.ts
index 2b1b373..ad08ba1 100644
--- a/src/app/api/admin/settings/route.ts
+++ b/src/app/api/admin/settings/route.ts
@@ -122,6 +122,8 @@ export async function PATCH(request: NextRequest) {
       'suppliers',
       // Predarea coletelor Sameday în easybox (primul kilometru OOH).
       'sameday_dropoff',
+      // Campania de warm-up pe registrul de contacte (docs/marketing/).
+      'warmup_campaign',
     ];
 
     if (!ALLOWED_KEYS.includes(key)) {
@@ -139,6 +141,23 @@ export async function PATCH(request: NextRequest) {
         return NextResponse.json({ success: false, error: err }, { status: 400 });
       }
     }
+    if (key === 'warmup_campaign') {
+      const v = value as { enabled?: unknown; dailyBatchSize?: unknown } | null;
+      if (
+        !v ||
+        typeof v !== 'object' ||
+        typeof v.enabled !== 'boolean' ||
+        typeof v.dailyBatchSize !== 'number' ||
+        !Number.isInteger(v.dailyBatchSize) ||
+        v.dailyBatchSize < 1 ||
+        v.dailyBatchSize > 2000
+      ) {
+        return NextResponse.json(
+          { success: false, error: 'Setare invalidă: { enabled: boolean, dailyBatchSize: 1-2000 }' },
+          { status: 400 }
+        );
+      }
+    }
     if (key === 'suppliers') {
       if (!Array.isArray(value) || value.length > 100) {
         return NextResponse.json({ success: false, error: 'Lista de furnizori e invalidă' }, { status: 400 });
diff --git a/src/app/api/contacts/unsubscribe/route.ts b/src/app/api/contacts/unsubscribe/route.ts
new file mode 100644
index 0000000..081576d
--- /dev/null
+++ b/src/app/api/contacts/unsubscribe/route.ts
@@ -0,0 +1,63 @@
+import { NextRequest, NextResponse } from 'next/server';
+import { createAdminClient } from '@/lib/supabase/admin';
+
+export const dynamic = 'force-dynamic';
+
+/**
+ * GET /api/contacts/unsubscribe?token=<unsubscribe_token>
+ *
+ * Dezabonare cu un click pentru emailul de warm-up (`/api/cron/warmup-campaign`).
+ * Diferit de `/api/newsletter/unsubscribe` — acela operează pe
+ * `newsletter_subscribers` (opt-in explicit), acesta pe `contacts` (registrul
+ * intern de 72k, populație separată). Rândul rămâne (dovadă), doar
+ * `marketing_status` trece pe `unsubscribed`.
+ */
+export async function GET(req: NextRequest) {
+  const token = req.nextUrl.searchParams.get('token')?.trim() || '';
+
+  const page = (title: string, body: string, ok: boolean) =>
+    new NextResponse(
+      `<!doctype html><html lang="ro"><head><meta charset="utf-8">
+<meta name="viewport" content="width=device-width,initial-scale=1">
+<meta name="robots" content="noindex"><title>${title} — eGhișeul.ro</title>
+<style>body{font-family:system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
+.card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:40px;max-width:440px;text-align:center;box-shadow:0 4px 16px rgba(6,16,31,.06)}
+h1{font-size:20px;color:#0f172a;margin:0 0 8px}p{color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px}
+a{display:inline-block;background:${ok ? '#ECB95F' : '#e2e8f0'};color:#0f172a;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:10px;font-size:14px}</style>
+</head><body><div class="card"><h1>${title}</h1><p>${body}</p><a href="https://eghiseul.ro/">Înapoi la eGhișeul.ro</a></div></body></html>`,
+      { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
+    );
+
+  if (!token || token.length > 100) {
+    return page('Link invalid', 'Linkul de dezabonare nu este valid. Dacă problema persistă, scrie-ne la contact@eghiseul.ro.', false);
+  }
+
+  // eslint-disable-next-line @typescript-eslint/no-explicit-any
+  const supabase = createAdminClient() as any;
+  const { data: contact } = await supabase
+    .from('contacts')
+    .select('id, marketing_status')
+    .eq('unsubscribe_token', token)
+    .maybeSingle();
+
+  if (!contact) {
+    return page('Link invalid', 'Linkul de dezabonare nu este valid sau a expirat. Scrie-ne la contact@eghiseul.ro și te dezabonăm manual.', false);
+  }
+
+  if (contact.marketing_status !== 'unsubscribed') {
+    const { error } = await supabase
+      .from('contacts')
+      .update({ marketing_status: 'unsubscribed' })
+      .eq('id', contact.id);
+    if (error) {
+      console.error('[contacts] unsubscribe failed:', error.message);
+      return page('Eroare', 'Nu am putut procesa dezabonarea. Încearcă din nou sau scrie-ne la contact@eghiseul.ro.', false);
+    }
+  }
+
+  return page(
+    'Te-ai dezabonat',
+    'Nu vei mai primi emailuri de marketing de la eGhișeul.ro. Emailurile despre comenzile tale active nu sunt afectate.',
+    true
+  );
+}
diff --git a/src/app/api/cron/recovery-emails/route.ts b/src/app/api/cron/recovery-emails/route.ts
index abb2915..35e95ba 100644
--- a/src/app/api/cron/recovery-emails/route.ts
+++ b/src/app/api/cron/recovery-emails/route.ts
@@ -38,6 +38,8 @@ import {
   type RecoveryEmailInput,
 } from '@/lib/email/templates/abandoned-recovery';
 import { generateRecoveryCouponCode } from '@/lib/coupons/recovery-code';
+import { hasProgressBeyondContact } from '@/lib/orders/abandoned-progress';
+import { TEST_EMAILS, isUndeliverable } from '@/lib/email/deliverability';
 
 // Window: orders abandoned between 30 min (allow auto-abandon cron to flip them
 // first) and 7 days (older = customer is gone, recovery effort wasted).
@@ -50,34 +52,6 @@ const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
 // uploads without mailing someone who's still mid-session.
 const DRAFT_MIN_IDLE_MS = 2 * 60 * 60 * 1000;
 
-// Internal test traffic — never send recovery to these.
-const TEST_EMAILS = new Set(['serviciiseonethut@gmail.com']);
-
-// Reserved/undeliverable domains (RFC 2606 + local dev). Mailing them always
-// fails, and because a failed send deliberately leaves `recovery_email_sent_at`
-// NULL for a retry, the order would be re-picked every 15 min and burn a fresh
-// coupon each run. Skip them outright.
-const UNDELIVERABLE_DOMAINS = new Set([
-  'example.com',
-  'example.org',
-  'example.net',
-  'test.com',
-  'localhost',
-]);
-
-function isUndeliverable(email: string): boolean {
-  const at = email.lastIndexOf('@');
-  if (at < 1 || at === email.length - 1) return true; // no local part or no domain
-  const domain = email.slice(at + 1).toLowerCase();
-  return (
-    UNDELIVERABLE_DOMAINS.has(domain) ||
-    domain.endsWith('.test') ||
-    domain.endsWith('.invalid') ||
-    domain.endsWith('.local') ||
-    !domain.includes('.')
-  );
-}
-
 const DISCOUNT_PERCENT = 10;
 const COUPON_VALIDITY_HOURS = 48;
 
@@ -109,34 +83,6 @@ function buildResumeUrl(order: {
   return `${appBase()}/comanda/checkout/${order.id}?coupon=${encodeURIComponent(order.couponCode)}`;
 }
 
-// True when the customer typed something real beyond the contact step.
-// `contact` is step 1 (always present) and `billing` is auto-initialized with
-// defaults, so neither counts. Any other section counts if it holds at least
-// one non-empty string, number, `true`, or non-empty array — empty-string
-// scaffolding like {"plateNumber":""} does not qualify.
-function hasProgressBeyondContact(customerData: unknown): boolean {
-  if (!customerData || typeof customerData !== 'object') return false;
-  const sections = customerData as Record<string, unknown>;
-  const hasMeaningfulValue = (value: unknown): boolean => {
-    if (typeof value === 'string') return value.trim().length > 0;
-    if (typeof value === 'number') return true;
-    if (value === true) return true;
-    if (Array.isArray(value)) return value.length > 0;
-    if (value && typeof value === 'object') {
-      return Object.values(value).some(hasMeaningfulValue);
-    }
-    return false;
-  };
-  return Object.entries(sections).some(
-    ([key, value]) =>
-      key !== 'contact' &&
-      key !== 'billing' &&
-      value !== null &&
-      typeof value === 'object' &&
-      hasMeaningfulValue(value)
-  );
-}
-
 export async function POST(request: NextRequest) {
   const authHeader = request.headers.get('authorization');
   if (!process.env.CRON_SECRET) {
diff --git a/src/app/api/cron/warmup-campaign/route.ts b/src/app/api/cron/warmup-campaign/route.ts
new file mode 100644
index 0000000..3e0e9de
--- /dev/null
+++ b/src/app/api/cron/warmup-campaign/route.ts
@@ -0,0 +1,167 @@
+/**
+ * POST /api/cron/warmup-campaign
+ *
+ * Trimite un email de reactivare, o singură dată per contact, către
+ * registrul intern de 72k contacte (`contacts` — majoritatea lead-uri
+ * WPForms de pe eghiseul.ro vechi, niciodată contactate de marketing).
+ * Decizie de business 2026-09-14: consimțământul a fost dat pe site-ul
+ * vechi, se trimite la toți — dar treptat, câțiva pe zi, nu într-un singur
+ * val (deliverability pe o listă rece — vezi
+ * `docs/marketing/email-marketing-plan-2026-09.md`).
+ *
+ * Volumul zilnic e controlat din `admin_settings.warmup_campaign`
+ * (`{ enabled: boolean, dailyBatchSize: number }`, editabil din
+ * `/admin/marketing`). **Implicit `enabled: false`** — pornește doar după
+ * ce echipa a revizuit conținutul emailului. Cronul rulează oricum zilnic
+ * (vezi `vercel.json`) dar iese imediat dacă e dezactivat.
+ *
+ * Authentication: `CRON_SECRET` în header `Authorization: Bearer ...`.
+ */
+
+import { NextRequest, NextResponse } from 'next/server';
+import { createAdminClient } from '@/lib/supabase/admin';
+import { sendEmail } from '@/lib/email/resend';
+import { buildWarmupSubject, buildWarmupHtml, buildWarmupText } from '@/lib/email/templates/warmup-reengagement';
+import { TEST_EMAILS, isUndeliverable } from '@/lib/email/deliverability';
+
+const DEFAULT_SETTINGS = { enabled: false, dailyBatchSize: 25 };
+
+const SERVICE_LABELS: Record<string, string> = {
+  'cazier-judiciar-persoana-fizica': 'cazier judiciar',
+  'cazier-judiciar-persoana-juridica': 'cazier judiciar (firmă)',
+  'extras-carte-funciara': 'extras carte funciară',
+  'certificat-nastere': 'certificat de naștere',
+  'certificat-casatorie': 'certificat de căsătorie',
+  'certificat-constatator': 'certificat constatator',
+  'cazier-fiscal': 'cazier fiscal',
+  'cazier-auto': 'cazier auto',
+};
+
+function serviceHint(slug: string | null): string | null {
+  if (!slug) return null;
+  return SERVICE_LABELS[slug] ?? slug.replace(/-/g, ' ');
+}
+
+function appBase(): string {
+  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
+}
+
+export async function POST(request: NextRequest) {
+  const authHeader = request.headers.get('authorization');
+  if (!process.env.CRON_SECRET) {
+    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
+  }
+  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
+    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
+  }
+
+  // eslint-disable-next-line @typescript-eslint/no-explicit-any
+  const admin = createAdminClient() as any;
+
+  const settingsTable = admin.from('admin_settings');
+  const { data: settingsRow } = await settingsTable
+    .select('value')
+    .eq('key', 'warmup_campaign')
+    .maybeSingle();
+  const settings = { ...DEFAULT_SETTINGS, ...(settingsRow?.value ?? {}) };
+
+  if (!settings.enabled) {
+    return NextResponse.json({
+      success: true,
+      data: { sentCount: 0, skippedCount: 0, reason: 'disabled', processedAt: new Date().toISOString() },
+    });
+  }
+
+  const batchSize = Math.min(2000, Math.max(1, Number(settings.dailyBatchSize) || DEFAULT_SETTINGS.dailyBatchSize));
+
+  const contactsTable = admin.from('contacts');
+  const { data: candidates, error: fetchError } = await contactsTable
+    .select('id, email, first_name, services, unsubscribe_token')
+    .is('warmup_email_sent_at', null)
+    .not('marketing_status', 'in', '(unsubscribed,suppressed)')
+    .order('first_seen_at', { ascending: true, nullsFirst: false })
+    .limit(batchSize);
+
+  if (fetchError) {
+    console.error('[warmup-campaign] fetch failed:', fetchError);
+    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
+  }
+
+  if (!candidates || candidates.length === 0) {
+    return NextResponse.json({
+      success: true,
+      data: { sentCount: 0, skippedCount: 0, reason: 'no candidates left', processedAt: new Date().toISOString() },
+    });
+  }
+
+  // Nu există claim atomic înainte de trimitere — două rulări suprapuse
+  // (retry Vercel, trigger manual peste cron) ar putea alege același contact
+  // nesunat. Protecție reală: `idempotencyKey: warmup-<id>` trimis la Resend
+  // (vezi `sendEmail`), care deduplichează trimiterea efectivă.
+  const results: Array<{ contactId: string; status: 'sent' | 'skipped' | 'error'; reason?: string }> = [];
+
+  for (const contact of candidates) {
+    const email = (contact.email ?? '').trim();
+    if (!email) {
+      results.push({ contactId: contact.id, status: 'skipped', reason: 'no email' });
+      continue;
+    }
+    if (TEST_EMAILS.has(email.toLowerCase())) {
+      results.push({ contactId: contact.id, status: 'skipped', reason: 'test email' });
+      continue;
+    }
+    if (isUndeliverable(email)) {
+      results.push({ contactId: contact.id, status: 'skipped', reason: 'undeliverable domain' });
+      continue;
+    }
+
+    const unsubscribeUrl = `${appBase()}/api/contacts/unsubscribe?token=${contact.unsubscribe_token}`;
+    const payload = {
+      firstName: contact.first_name ?? null,
+      serviceHint: serviceHint((contact.services ?? [])[0] ?? null),
+      unsubscribeUrl,
+    };
+
+    try {
+      const sendRes = await sendEmail({
+        to: email,
+        subject: buildWarmupSubject(payload),
+        html: buildWarmupHtml(payload),
+        text: buildWarmupText(payload),
+        idempotencyKey: `warmup-${contact.id}`,
+      });
+      if (sendRes.skipped) {
+        results.push({ contactId: contact.id, status: 'skipped', reason: sendRes.reason });
+        continue; // nu marca trimis — retry la urmatoarea rulare, ex. Resend neconfigurat
+      }
+    } catch (err) {
+      results.push({
+        contactId: contact.id,
+        status: 'error',
+        reason: err instanceof Error ? err.message : 'send failed',
+      });
+      continue;
+    }
+
+    await contactsTable.update({ warmup_email_sent_at: new Date().toISOString() }).eq('id', contact.id);
+    results.push({ contactId: contact.id, status: 'sent' });
+  }
+
+  return NextResponse.json({
+    success: true,
+    data: {
+      sentCount: results.filter((r) => r.status === 'sent').length,
+      skippedCount: results.filter((r) => r.status === 'skipped').length,
+      errorCount: results.filter((r) => r.status === 'error').length,
+      dailyBatchSize: batchSize,
+      processedAt: new Date().toISOString(),
+      results,
+    },
+  });
+}
+
+// Vercel Cron invocă rutele cu GET — fără acest passthrough programarea nu
+// ar porni niciodată (aceeași capcană descoperită la recovery-emails).
+export async function GET(request: NextRequest) {
+  return POST(request);
+}
diff --git a/src/lib/email/deliverability.ts b/src/lib/email/deliverability.ts
new file mode 100644
index 0000000..efb3379
--- /dev/null
+++ b/src/lib/email/deliverability.ts
@@ -0,0 +1,32 @@
+/**
+ * Shared guards for any bulk/automated sender (recovery-emails cron,
+ * warmup-campaign cron): never mail internal test traffic or addresses that
+ * are structurally undeliverable. A failed send on a bad domain would leave
+ * the "sent" stamp unset (by design, for retry), so skipping outright avoids
+ * burning a fresh coupon/slot every run on the same dead address.
+ */
+
+// Internal test traffic — never send automated campaign email to these.
+export const TEST_EMAILS = new Set(['serviciiseonethut@gmail.com']);
+
+// Reserved/undeliverable domains (RFC 2606 + local dev).
+const UNDELIVERABLE_DOMAINS = new Set([
+  'example.com',
+  'example.org',
+  'example.net',
+  'test.com',
+  'localhost',
+]);
+
+export function isUndeliverable(email: string): boolean {
+  const at = email.lastIndexOf('@');
+  if (at < 1 || at === email.length - 1) return true; // no local part or no domain
+  const domain = email.slice(at + 1).toLowerCase();
+  return (
+    UNDELIVERABLE_DOMAINS.has(domain) ||
+    domain.endsWith('.test') ||
+    domain.endsWith('.invalid') ||
+    domain.endsWith('.local') ||
+    !domain.includes('.')
+  );
+}
diff --git a/src/lib/email/templates/warmup-reengagement.ts b/src/lib/email/templates/warmup-reengagement.ts
new file mode 100644
index 0000000..a4e571f
--- /dev/null
+++ b/src/lib/email/templates/warmup-reengagement.ts
@@ -0,0 +1,67 @@
+/**
+ * Warm-up re-engagement email — sent by /api/cron/warmup-campaign, o singură
+ * dată per contact, la un contact din registrul intern (majoritatea lead-uri
+ * WPForms de pe eghiseul.ro vechi, niciodată contactate de marketing).
+ *
+ * Scop: reactivare, nu vânzare directă — un email scurt, onest, cu link de
+ * dezabonare vizibil (obligatoriu — asta E emailul de marketing, nu unul
+ * tranzacțional). Fără presiune, fără discount forțat în primul contact
+ * (cercetare: reducerea nu e prima armă la o listă rece).
+ */
+
+import { brandedEmailHtml, ctaButton } from './branded-layout';
+
+export interface WarmupEmailInput {
+  firstName?: string | null;
+  /** Serviciul din care a venit lead-ul (ex: "cazier judiciar"), pentru context. */
+  serviceHint?: string | null;
+  unsubscribeUrl: string;
+}
+
+export function buildWarmupSubject(input: WarmupEmailInput): string {
+  const name = input.firstName?.trim();
+  return name ? `${name}, eGhișeul.ro s-a schimbat de când ne-ai scris` : 'eGhișeul.ro s-a schimbat de când ne-ai scris';
+}
+
+export function buildWarmupHtml(input: WarmupEmailInput): string {
+  const greeting = input.firstName ? `Salut ${escapeHtml(input.firstName)},` : 'Salut,';
+  const context = input.serviceHint
+    ? `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Ne-ai contactat cândva pentru <strong>${escapeHtml(input.serviceHint)}</strong>. De atunci am rescris toată platforma.</p>`
+    : `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">Ne-ai contactat cândva. De atunci am rescris toată platforma.</p>`;
+  return brandedEmailHtml({
+    preheader: 'Am rescris platforma — comenzi online, plată directă, curier până la ușă.',
+    content: `
+        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${greeting}</h1>
+        ${context}
+        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Acum poți comanda online, plăti direct în platformă și primești actul prin curier, fără drumuri la ghișeu. Obținem documentul pentru tine — cazier judiciar, extras carte funciară, certificate de stare civilă și altele.</p>
+        ${ctaButton('Vezi serviciile disponibile', 'https://eghiseul.ro/servicii')}
+        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">Primești acest email pentru că ai fost în contact cu eGhișeul.ro. Dacă nu te mai interesează, te poți dezabona oricând — <a href="${escapeAttr(input.unsubscribeUrl)}" style="color:#0B1B33;">un singur click</a>.</p>`,
+  });
+}
+
+export function buildWarmupText(input: WarmupEmailInput): string {
+  const greeting = input.firstName ? `Salut ${input.firstName},` : 'Salut,';
+  return [
+    greeting,
+    '',
+    input.serviceHint
+      ? `Ne-ai contactat cândva pentru ${input.serviceHint}. De atunci am rescris toată platforma.`
+      : 'Ne-ai contactat cândva. De atunci am rescris toată platforma.',
+    '',
+    'Acum poți comanda online, plăti direct și primești actul prin curier, fără drumuri la ghișeu.',
+    '',
+    'Vezi serviciile: https://eghiseul.ro/servicii',
+    '',
+    `Dezabonare: ${input.unsubscribeUrl}`,
+    '',
+    '— Echipa eGhișeul.ro',
+  ].join('\n');
+}
+
+function escapeHtml(s: string): string {
+  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
+}
+
+function escapeAttr(s: string): string {
+  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
+}
diff --git a/src/lib/orders/abandoned-progress.ts b/src/lib/orders/abandoned-progress.ts
new file mode 100644
index 0000000..b15e53e
--- /dev/null
+++ b/src/lib/orders/abandoned-progress.ts
@@ -0,0 +1,80 @@
+/**
+ * True when the customer typed something real beyond the contact step.
+ * `contact` is step 1 (always present) and `billing` is auto-initialized with
+ * defaults, so neither counts. Any other section counts if it holds at least
+ * one non-empty string, number, `true`, or non-empty array — empty-string
+ * scaffolding like {"plateNumber":""} does not qualify.
+ *
+ * Shared by the recovery-emails cron and the phone priority-calls queue —
+ * both need the same "is this draft worth chasing" filter.
+ */
+export function hasProgressBeyondContact(customerData: unknown): boolean {
+  if (!customerData || typeof customerData !== 'object') return false;
+  const sections = customerData as Record<string, unknown>;
+  const hasMeaningfulValue = (value: unknown): boolean => {
+    if (typeof value === 'string') return value.trim().length > 0;
+    if (typeof value === 'number') return true;
+    if (value === true) return true;
+    if (Array.isArray(value)) return value.length > 0;
+    if (value && typeof value === 'object') {
+      return Object.values(value).some(hasMeaningfulValue);
+    }
+    return false;
+  };
+  return Object.entries(sections).some(
+    ([key, value]) =>
+      key !== 'contact' &&
+      key !== 'billing' &&
+      value !== null &&
+      typeof value === 'object' &&
+      hasMeaningfulValue(value)
+  );
+}
+
+/**
+ * Câte valori reale (non-goale) sunt completate în afara `contact`/`billing`.
+ * Folosit pentru a prioriza la telefon clienții care au avansat mult în
+ * wizard (au introdus multe date) față de cei care au abia atins pasul 1 —
+ * cine a completat mult nu a abandonat "din prima", deci merită apel înaintea
+ * cuiva care a lăsat doar contactul.
+ */
+export function dataDepthScore(customerData: unknown): number {
+  if (!customerData || typeof customerData !== 'object') return 0;
+  const sections = customerData as Record<string, unknown>;
+  const countMeaningful = (value: unknown): number => {
+    if (typeof value === 'string') return value.trim().length > 0 ? 1 : 0;
+    if (typeof value === 'number') return 1;
+    if (value === true) return 1;
+    if (Array.isArray(value)) return value.filter((v) => countMeaningful(v) > 0).length;
+    if (value && typeof value === 'object') {
+      return Object.values(value).reduce((sum: number, v) => sum + countMeaningful(v), 0);
+    }
+    return 0;
+  };
+  return Object.entries(sections).reduce(
+    (sum, [key, value]) => (key === 'contact' || key === 'billing' ? sum : sum + countMeaningful(value)),
+    0
+  );
+}
+
+/** True dacă avem un nume real (nu doar email/telefon) — merită sunat. */
+export function hasIdentifiableName(customerData: unknown): boolean {
+  if (!customerData || typeof customerData !== 'object') return false;
+  const sections = customerData as Record<string, { firstName?: unknown; lastName?: unknown } | undefined>;
+  const contact = sections.contact;
+  const personal = sections.personal;
+  const first = (personal?.firstName ?? contact?.firstName ?? '').toString().trim();
+  const last = (personal?.lastName ?? contact?.lastName ?? '').toString().trim();
+  return first.length > 0 || last.length > 0;
+}
+
+// Romanian mobile numbers: optional +40/0040/0 prefix, then 7 + 8 digits.
+// Anything with a phone that doesn't match this pattern is treated as a
+// foreign number for call-prioritization purposes (diaspora customers).
+const RO_MOBILE_PATTERN = /^(\+?40|0)?7[0-9]{8}$/;
+
+export function isForeignPhone(phone: string | null | undefined): boolean {
+  if (!phone) return false;
+  const digits = phone.replace(/[\s\-().]/g, '');
+  return !RO_MOBILE_PATTERN.test(digits);
+}
diff --git a/supabase/migrations/156_phone_recovery_tracking.sql b/supabase/migrations/156_phone_recovery_tracking.sql
new file mode 100644
index 0000000..64116be
--- /dev/null
+++ b/supabase/migrations/156_phone_recovery_tracking.sql
@@ -0,0 +1,42 @@
+-- Phone-based abandoned cart recovery: bifă "contactat telefonic" pe comandă
+-- + cupon custom (system_kind='phone_recovery') dat discreționar de echipă la
+-- telefon, în loc de cuponul automat flat 10% din cron-ul recovery-emails.
+--
+-- Simplu, fără istoric de apeluri (decizie 2026-09-14): un singur set de
+-- coloane pe orders, suprascris dacă echipa sună de mai multe ori.
+
+ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_contacted_at TIMESTAMPTZ;
+ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_contacted_by TEXT;
+ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_contact_notes TEXT;
+
+COMMENT ON COLUMN orders.phone_contacted_at IS 'Ultimul apel telefonic de recuperare (suprascris la fiecare apel).';
+COMMENT ON COLUMN orders.phone_contacted_by IS 'Email admin care a marcat comanda ca sunată.';
+COMMENT ON COLUMN orders.phone_contact_notes IS 'Notă liberă despre ultimul apel (obiecție client, rezultat).';
+
+CREATE INDEX IF NOT EXISTS idx_orders_phone_contacted_at
+  ON orders (phone_contacted_at)
+  WHERE phone_contacted_at IS NOT NULL;
+
+-- order_history: nou event_type pentru audit trail
+ALTER TABLE order_history DROP CONSTRAINT order_history_event_type_check;
+ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
+  CHECK (event_type IN (
+    'status_changed', 'order_submitted', 'payment_confirmed',
+    'payment_proof_submitted', 'bank_transfer_submitted', 'document_generated',
+    'payment_received', 'document_uploaded', 'note_added', 'admin_action',
+    'kyc_verified', 'kyc_rejected', 'awb_created', 'shipped', 'delivered',
+    'abandoned', 'recovery_email_sent', 'cancelled', 'cancellation_requested',
+    'refunded', 'modified', 'extra_payment_sent', 'extra_payment_received',
+    'standby_started', 'standby_ended', 'reupload_requested',
+    'kyc_photo_resubmitted', 'document_viewed_by_client',
+    'barou_allocation_failed', 'document_generation_failed',
+    'extra_invoice_issued', 'extra_invoice_failed', 'resume_link_generated',
+    'draft_edited_by_admin', 'phone_contact_logged'
+  ));
+
+-- coupons: al doilea system_kind, pentru tab-ul de filtrare din /admin/coupons
+ALTER TABLE coupons DROP CONSTRAINT coupons_system_kind_check;
+ALTER TABLE coupons ADD CONSTRAINT coupons_system_kind_check
+  CHECK (system_kind IS NULL OR system_kind IN ('recovery', 'phone_recovery'));
+
+NOTIFY pgrst, 'reload schema';
diff --git a/supabase/migrations/157_contacts_warmup_campaign.sql b/supabase/migrations/157_contacts_warmup_campaign.sql
new file mode 100644
index 0000000..137520f
--- /dev/null
+++ b/supabase/migrations/157_contacts_warmup_campaign.sql
@@ -0,0 +1,26 @@
+-- Campanie de warm-up pentru cei 72k contacte din registrul intern (majoritatea
+-- lead-uri WPForms de pe site-ul vechi, niciodată contactate de marketing).
+-- Decizie de business 2026-09-14 (Raul): sunt foști clienți/lead-uri de pe
+-- eghiseul.ro vechi, consimțământul a fost acordat acolo — se trimite la toți,
+-- dar treptat (câțiva pe zi), nu într-un singur val, pentru deliverability.
+--
+-- Fiecare contact primește UN singur email de reactivare, marcat aici ca să
+-- nu se retrimită. Token de dezabonare propriu (independent de
+-- newsletter_subscribers, care e lista de opt-in explicit, populație diferită).
+
+ALTER TABLE contacts ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();
+ALTER TABLE contacts ADD COLUMN IF NOT EXISTS warmup_email_sent_at TIMESTAMPTZ;
+
+CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_unsubscribe_token ON contacts (unsubscribe_token);
+
+-- Selecția batch-ului zilnic: contacte eligibile (nu dezabonate/suprimate),
+-- încă nesunate cu email de warmup, ordonate după vechime.
+CREATE INDEX IF NOT EXISTS idx_contacts_warmup_pending
+  ON contacts (first_seen_at)
+  WHERE warmup_email_sent_at IS NULL
+    AND marketing_status NOT IN ('unsubscribed', 'suppressed');
+
+COMMENT ON COLUMN contacts.unsubscribe_token IS 'Token unic pentru linkul de dezabonare din emailul de warm-up.';
+COMMENT ON COLUMN contacts.warmup_email_sent_at IS 'Când a primit contactul emailul de reactivare (o singură dată).';
+
+NOTIFY pgrst, 'reload schema';
diff --git a/tests/unit/lib/orders/abandoned-progress.test.ts b/tests/unit/lib/orders/abandoned-progress.test.ts
new file mode 100644
index 0000000..7348d00
--- /dev/null
+++ b/tests/unit/lib/orders/abandoned-progress.test.ts
@@ -0,0 +1,111 @@
+import { describe, it, expect } from 'vitest';
+import {
+  hasProgressBeyondContact,
+  isForeignPhone,
+  dataDepthScore,
+  hasIdentifiableName,
+} from '@/lib/orders/abandoned-progress';
+
+describe('hasProgressBeyondContact', () => {
+  it('returns false for contact-only draft', () => {
+    expect(hasProgressBeyondContact({ contact: { email: 'a@b.com' } })).toBe(false);
+  });
+
+  it('returns false for contact + billing scaffolding only', () => {
+    expect(
+      hasProgressBeyondContact({
+        contact: { email: 'a@b.com' },
+        billing: { type: 'individual' },
+      })
+    ).toBe(false);
+  });
+
+  it('ignores empty-string scaffolding in other sections', () => {
+    expect(
+      hasProgressBeyondContact({
+        contact: { email: 'a@b.com' },
+        vehicle: { plateNumber: '' },
+      })
+    ).toBe(false);
+  });
+
+  it('returns true when another section has a real value', () => {
+    expect(
+      hasProgressBeyondContact({
+        contact: { email: 'a@b.com' },
+        property: { county: 'Prahova' },
+      })
+    ).toBe(true);
+  });
+
+  it('returns false for null/non-object input', () => {
+    expect(hasProgressBeyondContact(null)).toBe(false);
+    expect(hasProgressBeyondContact(undefined)).toBe(false);
+    expect(hasProgressBeyondContact('x')).toBe(false);
+  });
+});
+
+describe('isForeignPhone', () => {
+  it('treats standard Romanian mobile numbers as local', () => {
+    expect(isForeignPhone('0722334455')).toBe(false);
+    expect(isForeignPhone('+40722334455')).toBe(false);
+    expect(isForeignPhone('40722334455')).toBe(false);
+    expect(isForeignPhone('0722 334 455')).toBe(false);
+  });
+
+  it('treats other formats as foreign', () => {
+    expect(isForeignPhone('+34612345678')).toBe(true); // Spain
+    expect(isForeignPhone('+447911123456')).toBe(true); // UK
+    expect(isForeignPhone('0212345678')).toBe(true); // RO landline, not mobile
+  });
+
+  it('returns false for missing phone', () => {
+    expect(isForeignPhone(null)).toBe(false);
+    expect(isForeignPhone(undefined)).toBe(false);
+    expect(isForeignPhone('')).toBe(false);
+  });
+});
+
+describe('dataDepthScore', () => {
+  it('ignores contact and billing sections', () => {
+    expect(
+      dataDepthScore({ contact: { email: 'a@b.com', phone: '0722' }, billing: { type: 'individual' } })
+    ).toBe(0);
+  });
+
+  it('counts meaningful leaf values across other sections', () => {
+    expect(
+      dataDepthScore({
+        contact: { email: 'a@b.com' },
+        personal: { firstName: 'Ion', cnp: '1234567890123' },
+        property: { county: 'Prahova' },
+      })
+    ).toBe(3);
+  });
+
+  it('does not count empty-string scaffolding', () => {
+    expect(dataDepthScore({ vehicle: { plateNumber: '', vin: '' } })).toBe(0);
+  });
+
+  it('returns 0 for null/non-object input', () => {
+    expect(dataDepthScore(null)).toBe(0);
+  });
+});
+
+describe('hasIdentifiableName', () => {
+  it('finds name in personal section first', () => {
+    expect(hasIdentifiableName({ personal: { firstName: 'Ion' }, contact: {} })).toBe(true);
+  });
+
+  it('falls back to contact section', () => {
+    expect(hasIdentifiableName({ contact: { firstName: 'Ion' } })).toBe(true);
+  });
+
+  it('returns false when no name anywhere', () => {
+    expect(hasIdentifiableName({ contact: { email: 'a@b.com', phone: '0722' } })).toBe(false);
+  });
+
+  it('returns false for null input', () => {
+    expect(hasIdentifiableName(null)).toBe(false);
+  });
+});
diff --git a/vercel.json b/vercel.json
index 16f9e15..2f0dfe3 100644
--- a/vercel.json
+++ b/vercel.json
@@ -32,6 +32,10 @@
     {
       "path": "/api/cron/extra-payment-reminders/",
       "schedule": "15 * * * *"
+    },
+    {
+      "path": "/api/cron/warmup-campaign/",
+      "schedule": "0 7 * * *"
     }
   ]
 }
```

## Anexă — research brut (agenți, înainte de sinteza din docs/marketing/)

Lipsea din bundle-ul inițial: cercetarea externă verbatim (doar sinteza mea era în docs). Adăugat acum.

### A. Research — experți email marketing (agent 1, WebSearch)

Research directive: email marketing best practices for eghiseul.ro's 72k-contact, mostly-non-buyer list, in a one-time document-purchase (not repeat-retail) context.

**Segmentare (fundația pentru tot restul)**
- RFM (recency/frequency/monetary) e standardul, per Chase Dimond (Boundless Labs) și materialele Klaviyo — dar frequency aproape nu se aplică aici (majoritatea au cumpărat o dată sau deloc). → Colapsăm la 2 axe: recență + valoare comandă.
- Dimond: trimite mai mult celor care interacționează, mai puțin celor care nu — fereastra de "engaged" scalează cu cadența de trimitere (30-60 zile dacă trimiți zilnic/săptămânal, 75-120+ zile dacă trimiți lunar). → Cadența noastră reală va fi joasă (lunar-ish), deci definim "engaged" generos (~90 zile).
[Ecommerce Email Marketing Strategy — Chase Dimond](https://www.chasedimond.com/ecommerce-email-marketing-strategy-boost-engagement-sales)

**Igienă listă / risc deliverability (riscul cel mai mare pentru noi)**
- Contactele fără activitate de 180+ zile ar trebui suprimate sau re-validate înainte de trimitere; adresele dormante riscă să fi devenit spam traps; a bombarda o listă rece dintr-o dată declanșează detecția de spike de volum a filtrelor de spam. Recomandat: warm-up în segmente, nu blast dintr-o dată.
[Email List Hygiene 2026 — MailReach](https://www.mailreach.co/blog/email-list-hygiene-best-practices)
→ Cei 72k includ ani de lead-uri WPForms niciodată emailate. Trimiterea la toate deodată e aproape cel mai rău caz posibil pentru deliverability — validează/segmentează întâi, crește volumul treptat pe săptămâni.

**Win-back / re-engagement (cazul nostru real, nu retail clasic)**
- Cadență win-back către adrese neangajate: cam la ~90 zile, declanșat de comportament, nu de calendar; automatizările au nevoie de intrare/ieșire clară (o achiziție în mijlocul flow-ului = oprire imediată).
[Winback Email Campaign — Flowium](https://flowium.com/blog/winback-email-campaign-and-examples/) · [Klaviyo win-back examples](https://www.klaviyo.com/blog/winback-email-campaign-examples)
- Val Geisler (Fix My Churn): secvențele de reactivare ar trebui să folosească secvențe scurte care cer o acțiune explicită de la abonat ("da, ține-mă pe listă", nu doar open-tracking pasiv) ca să separe interesul real de open rate-ul umflat de Apple MPP.
[CoSchedule interview — Val Geisler](https://coschedule.com/blog/tapping-into-the-full-potential-of-successful-email-marketing-with-val-geisler-from-fix-my-churn-amp-157)
→ Pentru o listă de cumpărare unică, "win-back" nu înseamnă "cumpără din nou același lucru" pentru majoritate — înseamnă reactivare pentru un serviciu diferit. Segmentează oferta de win-back după "alte servicii pe care nu le-au încercat", nu discount generic.

**Abandoned cart (comenzi draft/pending) — direct acționabil, avem deja date**
- Benchmark 2026: email 1 la 30-60 min, email 2 la 24h, email 3 la 24-48h mai târziu.
- Schimbare de discount-ladder pentru 2026: nu conduce cu discount — antrenează abandonul special pentru cupon. Email 2 ar trebui să adauge încredere/valoare (recenzii, clarificări despre ce urmează), nu un discount mai mare; discountul abia la email 3+, doar pentru cei care nu au răspuns.
- Emailurile trimise în prima oră convertesc 5-6% per email; o secvență de 3 emailuri bine făcută recuperează 15-25% din coșurile abandonate.
[Abandoned Cart Timing Guide — Geysera](https://www.geysera.com/blog/abandoned-cart-email/the-abandoned-cart-email-sequence-how-many-emails-what-timing-and-why-most-stores-get-it-wrong) · [Optimal Timing Benchmarks — Lawrence Bros](https://lawrencebros.com/optimal-cart-abandonment-email-timing-benchmarks-for-2026/)
→ Cronul nostru actual trimite UN singur email cu 10% imediat, iar DB arată că doar 1,4% din cupoanele de recovery sunt folosite vreodată (20 din 1.444). Consistent cu "un singur email de discount generic" fiind cea mai slabă variantă a acestei tactici.

**Benchmark-uri (context, nu ținte)**
- Fluxuri: 35-42% open / 5-12% click. Campanii: 18-25% open / 1,7-3,4% click. Klaviyo, toate industriile.
[Klaviyo Benchmarks 2026](https://www.klaviyo.com/products/email-marketing/benchmarks)
→ Judecă succesul pe click/conversie, niciodată pe open rate — audiența noastră probabil mai în vârstă/utilizatori de servicii guvernamentale, posibil Gmail/Yahoo unde dinamica MPP e oricum diferită.

**GDPR / soft opt-in (specific România)**
- Soft opt-in e valid pentru B2C când emailul a fost colectat în contextul unei vânzări, marketingul e pentru produse/servicii similare proprii, și a fost oferit un opt-out ușor la colectare ȘI în fiecare mesaj. Regula mai strictă de acțiune pozitivă a României e o nuanță doar B2B — nu blochează soft opt-in-ul B2C deja existent.
- Precedent real: DPA România a amendat Inteligo (2019) pentru validitatea consimțământului, escaladat ulterior la CJUE — dovadă că aplicarea aici e reală, nu teoretică.
[Soft opt-in mechanism — Considerati](https://www.considerati.com/publications/is-it-hard-to-rely-on-the-%E2%80%98soft-opt-in%E2%80%99-mechanism/)
→ Soft opt-in-ul nostru `is_customer` (per memoria contacts-registry) e ok legal pentru cei 381 clienți reali; celelalte ~71,9k contacte non-clienți (lead-uri WPForms brute) NU se califică pentru excepția asta pe baza DB-ului curent — clarificat ulterior de Raul că relația/consimțământul provine din site-ul vechi, nereflectat ca tranzacție în acest DB.

### B. Research — recuperare telefonică coșuri abandonate (agent 2, WebSearch)

Task: research phone-based cart-recovery best practices (prioritization, script structure, discretionary discounts, timing, phone-vs-email conversion data) adapted to eGhișeul's diaspora civil-status-document context.

**1. Prioritizare / cine se sună primul**
- Consens: sună repede — cele mai bune rate de închidere vin din contactarea în fereastra de 2 ore, scăzând brusc după 24h. (Ringly.io, Markopolo AI)
- Segmentare după valoarea comenzii/coșului întâi — mai multe surse stabilesc un prag (~150-200$ echivalent) sub care un apel live nu merită timpul agentului; sub el, doar email/SMS automat.
- Segmentare după adâncimea în funnel: cine a ajuns la plată/checkout > cine a completat doar pasul de contact (se potrivește cu filtrul nostru `hasProgressBeyondContact`).
- Pentru cazul nostru: datele proprii (abandonatori cu telefon străin pe certificat naștere/căsătorie = cea mai mare valoare + urgență reală, ex. termene de ambasadă) se potrivesc cu logica de prioritizare "urgență + valoare" recomandată peste tot, deși nicio sursă nu a adresat explicit nișa diaspora/servicii-document — acea axă de prioritizare e sfat standard, aplicat de noi pe o verticală nouă.

**2. Structura scriptului** (blog.shopphoneapp.com, outboundcalls.ai templates)
- Două deschideri viabile: (a) personală — "Sunt [nume] de la eGhișeul, am văzut cererea ta pentru [document]" — construiește încredere; (b) directă — "ai început o cerere pentru [X] dar n-ai terminat-o, voiam să văd dacă ai nevoie de ajutor." Directă e mai eficientă pentru un business de servicii.
- Discovery înainte de pitch: întreabă ce s-a întâmplat (problemă tehnică? preț? răzgândire? are nevoie de mai multe informații?) și lasă clientul să spună obiecția în loc să ghicești.
- Gestionarea obiecțiilor găsită generic (nicio sursă n-a avut "a uitat/prea scump/a găsit mai ieftin" pre-scriptate pentru apeluri) — sfatul real e "ascultă întâi, adresează motivul SPECIFIC declarat", nu un răspuns generic per categorie. Scripturile generice performează mai slab.
- Închide cu o ofertă scalată la obiecția declarată: obiecție de preț → discount; confuzie/tehnic → ajutor ghidat să termine fluxul (fără discount necesar); urgență → procesare expeditată/prioritară.

**3. Discount custom vs flat**
- Mai multe surse converg: discounturile fixe/blanket (10%/48h automat, ce aveam noi) sunt pentru canale low-touch/automate; odată ce un om e la telefon, ofertele discreționare/potrivite obiecției convertesc mai bine pentru că agentul ajustează mărimea/tipul ofertei la blocajul real, nu la o presupunere.
- Regulă practică din retention-call best practice: leagă oferta explicit de motivul declarat ("știu că ai plecat din cauza X — iată ce se schimbă"), nu un freebie generic pentru toată lumea. Aceeași ofertă generică pentru toți performează mai slab.
- Nu s-au găsit cifre solide pe lift custom-vs-flat specific pentru telefon; logica e totuși consistentă în toate sursele de "discreție a agentului" și "apel de retenție".

**4. Timing / cadență**
- Prima încercare: în aceeași zi, ideal în ~2 ore de la abandon.
- Niciun număr universal citat de încercări, dar un pattern comun din literatura de retenție call-center e 2-3 încercări în momente diferite ale zilei înainte de a reveni la SMS/email-only.

**5. Conversie telefon vs email — cifre reale găsite**
- Baseline recuperare email: ~10,2% recuperare la nivel de industrie; SMS ~8,7% recuperare / 42% click-to-conversion (Sender.net, Ringly.io 2026 roundups).
- Specific telefon: cifrele variază enorm pe surse și par umflate de vendor — un vendor de voce AI pretinde "55% recuperare" într-un case study, altul citează "25-35%" din outreach telefonic general, agenții vocali AI pretind 10-15%. Tratează-le ca limite superioare de marketing, nu baseline dovedite — nu există o cifră peer-reviewed sau neutră care compară direct telefon vs email. Direcțional: outreach-ul telefonic raportat consistent ca multiplu al recuperării prin email — se aliniază calitativ cu datele proprii (1,4% redemption pe 1.444 cupoane automate e foarte jos — un apel live care adresează motivul real ar trebui să bată asta ușor chiar și la cifre reale conservatoare).
- Multi-canal (apel + email + SMS împreună) raportat la +45% lift față de single-channel (Ringly.io) — susține păstrarea layer-ului automat de email activ alături de telefon, nu înlocuirea lui.

Surse: [Ringly.io – Phone Automation Best Practices](https://www.ringly.io/blog/abandoned-cart-recovery-phone-automation-best-practices), [Markopolo AI – Voice Agent Abandoned Cart](https://markopolo.ai/blogs/ai-voice-agent-abandoned-cart-recovery), [HMS Commerce – Call Script](https://blog.shopphoneapp.com/blog-posts/ecommerce-abandoned-checkout-recovery-phone-call-script), [Twilio – Abandoned Cart Strategies](https://www.twilio.com/en-us/blog/insights/best-practices/abandoned-cart-recovery-strategies), [Sender.net – Cart Abandonment Statistics 2026](https://www.sender.net/blog/cart-abandonment-rate-statistics/), [Ringly.io – Ecommerce Cart Abandonment Statistics 2026](https://www.ringly.io/blog/ecommerce-cart-abandonment-statistics-2026), [OpenAccessBPO – Retention Best Practices](https://www.openaccessbpo.com/blog/5-customer-retention-best-practices-call-centers-must-consider/).

### C. Ghidul de echipă (PDF) — text extras, pentru agenți care nu pot deschide PDF binar

Fișierul `docs/marketing/ghid-echipa-recuperare-telefonica.pdf` e binar — un `git diff` normal arată doar "Binary files differ", fără conținut. Textul complet extras din cele 3 pagini e mai jos, ca reviewerul să poată verifica exactitatea fără să deschidă PDF-ul.


```
Ghid echipă — Recuperare comenzi abandonate
eGhișeul.ro · valabil din 14 septembrie 2026 · întrebări → Raul

1. Ce s-a schimbat
Până acum, comenzile abandonate primeau doar un email automat cu 10% reducere. Rezultat real: din 1.444 cupoane
trimise, doar 20 au fost folosite (1,4%). Prea puțini oameni recuperați.
De acum, pe lângă emailul automat (care rămâne activ), echipa sună clienții cu șanse mari de recuperare, ordonați într-o
coadă de priorizare. Apelul + o reducere gândită pentru cazul concret al clientului convertesc mult mai bine decât un
cupon generic trimis pe email.

2. Unde lucrăm: /admin/recuperare-telefonica
Pagină nouă în admin, lângă „Abandonuri" în meniul din stânga. Arată un tabel cu toate comenzile de sunat, deja sortate
— nu trebuie să alegeți voi pe cine sunați, sistemul a făcut asta.

Cum e sortată coada (de sus în jos = cei mai importanți)
- Prioritate maximă: Telefon din străinătate ȘI comandă de certificat naștere/căsătorie — Diaspora, de multe ori cu
  termen real (programare la ambasadă, oficiu stare civilă) — cea mai mare șansă de conversie și cea mai mare urgență
- Prioritate: Telefon din străinătate SAU certificat naștere/căsătorie (una din două) — Merită apel, dar mai puțin
  urgent decât combinația de mai sus
- Normal: Restul comenzilor (ex: extras carte funciară, cazier — telefon românesc) — Sunați-i după ce terminați
  primele două categorii

În fiecare categorie, cei care au completat mult din formular (multe date, nu doar numele) apar înaintea celor care au
completat puțin — cine a mers mai departe în comandă e mai aproape de a cumpăra, nu a abandonat „din prima".

Cine NU apare deloc în coadă — și e corect așa: cei de la care nu avem nici măcar un nume (doar un email/telefon
prins din greșeală). Nu are rost să pierdem timp sunând pe cineva neidentificat — ei primesc oricum emailul automat.

Ce faceți pe fiecare rând
1. Apăsați pe numărul de telefon (se deschide direct apelul) sau formați manual.
2. După apel, apăsați „Bifează sunat" și scrieți pe scurt ce s-a discutat (ex: „a promis plată mâine", „a cerut 15%
   reducere", „nu a răspuns, revin mâine").
3. Dacă discutați o reducere, apăsați „Cupon" — se deschide formularul de cupon deja completat cu comanda, voi
   alegeți procentul/suma potrivită situației (vezi secțiunea 4 mai jos).

3. Ce spunem la telefon
Nu citim un script fix — ascultăm ce spune clientul și răspundem la motivul lui real. Structura de mai jos e ghid, nu
literă de lege.

1. Deschidere — Spunem cine suntem și numim exact documentul, nu „comanda dumneavoastră":
„Bună ziua, sunt [nume] de la eGhișeul.ro. Am observat că ați început o comandă pentru [certificat de naștere / cazier
judiciar / extras carte funciară] și nu ați finalizat-o. Vă pot ajuta cu ceva?"

2. Aflăm motivul real — întrebăm direct, nu presupunem:
„Ce v-a oprit — a fost o problemă cu plata, prețul, v-ați răzgândit, sau vă mai trebuie timp să adunați actele?"

3. Verificăm urgența (mai ales la certificate naștere/căsătorie pentru străinătate):
„Aveți vreun termen — programare la ambasadă, consulat, oficiu stare civilă? Dacă e urgent, putem grăbi procesarea."
O urgență reală justifică prioritizare, uneori mai bine decât o reducere.

Răspuns pe obiecție (nu ofertă generică pentru toată lumea)
- „E prea scump" → Reducere discreționară, potrivită cu valoarea comenzii — nu automat 10% pentru toți. Voi
  decideți procentul potrivit conversației.
- „Nu am încredere / nu sunteți instituția statului" → Explicăm clar: suntem serviciu privat, obținem documentul, nu
  îl eliberăm noi. Putem trimite contractul/datele firmei înainte de plată.
- „M-am blocat la upload/completare" → Îi ajutăm live, la telefon, să termine — nu are nevoie de reducere, are nevoie
  de ajutor tehnic.
- „Am găsit mai ieftin în altă parte" → Nu intrăm în război de preț — subliniem curier + apostilă/traducere incluse
  și termenul garantat.
- Nu răspunde → Lăsăm mesaj/SMS care menționează documentul concret, nu un mesaj generic „ați uitat ceva".

4. Închidere — spunem exact ce urmează: „Vă trimit acum linkul să continuați, cu codul de reducere [X]. Pe ce canal
vă e mai simplu — SMS, WhatsApp sau email?" (clienții din diaspora pot fi în alt fus orar, notăm canalul preferat).

4. Cupoane custom — cum alegem procentul
Nu mai dăm automat 10%. Voi alegeți suma/procentul potrivit motivului real spus de client. O reducere gândită pe loc,
la telefon, convertește mai bine decât un cod generic.
- Obiecție de preț mică → 5-10% e suficient de multe ori.
- Client valoros (comandă mare, urgentă, diaspora) care ezită serios → poate merita 15-20%.
- Nu confuzie tehnică sau lipsă de încredere → nu dați reducere, rezolvați problema reală (ajutor la completare,
  explicații).
- Cuponul se creează din butonul „Cupon" de pe rândul comenzii — vine cu codul pre-completat, voi puneți doar
  procentul/suma.

5. Emailul automat de warm-up — ce trebuie să știți (nu e treaba voastră să-l trimiteți)
Separat de recuperarea telefonică, pornim treptat un email de reactivare către toți cei ~72.000 de contacte din
registrul vechi (persoane care ne-au scris pe site-ul vechi eghiseul.ro). Se trimite automat, câțiva pe zi, nu dintr-o
dată — ca să nu ajungem la spam. Fiecare primește emailul o singură dată și se poate dezabona cu un click.

Dacă un client vă spune „am primit un email ciudat de la voi" — e emailul de reactivare, e legitim, explicați-i pe
scurt și, dacă cere, dezabonați-l manual sau trimiteți-i linkul de dezabonare din email.

6. Ce urmărim (rezultate)
În capul paginii /admin/recuperare-telefonica vedeți rata de conversie curentă — câți dintre cei sunați au dus
comanda mai departe. Notele voastre din „Bifează sunat" contează pentru asta — scrieți pe scurt și clar ce s-a
întâmplat la fiecare apel.

Document generat 2026-09-14 · eGhișeul.ro este serviciu privat de asistență la obținerea de documente, nu instituție
de stat · întrebări despre acest ghid → Raul
```
