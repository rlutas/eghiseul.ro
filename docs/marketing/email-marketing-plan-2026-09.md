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
