# 10.11.2026 — CJO și ecazier: email Black Friday către clienții vechi; Bing și GA4 conectate
<!-- categorie: automatizari -->

## Pentru echipă

- Clienții care au cumpărat de pe CazierJudiciarOnline.com primesc **un singur email** de Black Friday, cu numele site-ului CJO, nu cu eghiseul. Reducerea de 20% se aplică singură în formular, până luni, 16.11, ora 23:59.
- Un client nu primește emailul dacă a mai comandat în ultimele 14 zile, dacă a primit alt email de la noi în ultimele 3 zile sau dacă s-a dezabonat.
- Clienții ecazier.ro primesc și ei emailul, cu numele și logo-ul ecazier, de pe adresa ecazier (decizia lui Raul, 10.11). Doar cei care au plătit; comenzile deschise și neplătite nu primesc nimic. Celelalte emailuri automate (expirare, recenzie, recomandări) rămân doar pe CJO.
- Trimiterea a pornit pe 10.11. Până acum au primit emailul 340 de clienți (152 CJO, 188 ecazier). Restul, aproximativ 410, îl primesc automat, câte 220 pe zi, până pe 12.11.
- Bing (motorul de căutare Microsoft) a fost verificat pe toate cele 4 site-uri: sitemap-urile se citesc fără erori. Pe eghiseul, clicurile din Bing au crescut cu 25% în ultima lună, deși pe Google au scăzut. Raportul SEO lunar include acum și Bing.
- Am șters din Bing sitemap-urile vechi de pe WordPress (pe eghiseul și pe CJO). Fiecare site are acum un singur sitemap, cel bun.
- Google Analytics se poate citi automat pe toate cele 4 site-uri, nu doar pe eghiseul.

---

## Emailul Black Friday pe CJO

Commit CJO `d3b98f3c`. Este un nou tip de email lifecycle, `black_friday`, în `src/lib/lifecycle/`:

- se trimite o singură dată pe adresă și se leagă de ultima comandă;
- nu se trimite dacă adresa a plătit în ultimele 14 zile (`BLACK_FRIDAY_RECENT_ORDER_DAYS`) sau a primit alt email lifecycle în ultimele 3 zile (`BLACK_FRIDAY_QUIET_DAYS`);
- are plafonul lui, 220 pe rulare (`BLACK_FRIDAY_MAX_PER_RUN`; era 120 până la intrarea ecazier), și se oprește singur după `BLACK_FRIDAY_ENDS_AT`;
- nu intră în `LIFECYCLE_EMAILS=all`; se trimite doar dacă e listat explicit în variabila de mediu;
- migrarea CJO `045_lifecycle_black_friday.sql` adaugă `black_friday` în `lifecycle_emails_kind_check`.

### ecazier (commit CJO `f9d351ef`)

- `load.ts` încarcă comenzile plătite din ambele surse (`cazierjudiciaronline`, `ecazier`). Cele ecazier contează și la verificările de tip „a mai cumpărat”.
- `isEligibleBase(o, ctx, allowEcazier)`: comenzile ecazier sunt eligibile doar pentru `black_friday`. Tipurile zilnice rămân doar pe CJO, iar testul o verifică.
- Emailul e scris despre ultima comandă plătită a adresei. O adresă primește un singur email BF, indiferent de site; marca o dă sursa comenzii.
- Pe ecazier: `comenzi@ecazier.ro`, layoutul cabinetului (`cabinetLifecycleHtml` din `email-cabinet.ts`), link spre ecazier.ro, dezabonare pe `ecazier.ro/api/email/unsubscribe`. Pagina de dezabonare arată linkul și adresa de contact ale site-ului pe care a fost deschisă.
- Eligibili la pornire: 271 ecazier + 362 CJO. Prima rulare după deploy: 220 trimise (188 ecazier, 32 CJO), 0 eșuate.
- Primul build de producție a picat la descărcarea fonturilor Google (`next/font/google`, eroare de rețea, nu de cod). A trecut la redeploy.

De ce a fost nevoie: campania BF de pe eghiseul filtrează pe `contacts.stripe_last_paid_at`, care vine din contul Stripe al eghiseul. Cei 769 de cumpărători CJO din `contacts` nu au trecut acest filtru, deci campania i-a sărit pe toți.

Pornit pe 10.11.2026:
1. migrarea 045 rulată pe baza CJO;
2. 372 de adrese dezabonate sau blocate pe eghiseul (`contacts.marketing_status` `unsubscribed`/`suppressed`) copiate în `email_suppressions` pe CJO, cu `reason` `eghiseul_unsubscribed`/`eghiseul_suppressed` (total 400);
3. `LIFECYCLE_EMAILS=expiry_reminder,review_request,cross_sell,black_friday` pe Vercel, apoi redeploy;
4. rulare locală fără trimitere: 482 de adrese eligibile;
5. cronul pornit manual (`vercel crons run /api/cron/lifecycle-emails`): 120 trimise, 0 eșuate. Restul pleacă cu cronul zilnic de la 07:20 UTC.

După 16.11, scoate `black_friday` din `LIFECYCLE_EMAILS`. Codul nu mai trimite oricum după `BLACK_FRIDAY_ENDS_AT`.

## Google Analytics 4: acces pe toate site-urile

Contul de serviciu `claude-seo@caziere.iam.gserviceaccount.com` a fost adăugat ca Participant (doar citire, fără notificare pe email) pe proprietățile CJO (`402467033`) și ecazier (`536020358`). Pe documentero (`555162763`) avea deja rolul Analist, moștenit din contul eGhiseul. ID-urile sunt în `~/.config/claude-seo/google-api.json`, la `ga4_properties`.

Verificat prin Data API, sesiuni și evenimente-cheie pe ultimele 28 de zile:

| Site | Sesiuni | Evenimente-cheie |
|---|---:|---:|
| eghiseul.ro | 12.347 | 86 |
| cazierjudiciaronline.com | 3.549 | 36 |
| documentero.ro | 84 | 0 |
| ecazier.ro | 51 | 0 |

Cifrele pe ecazier sunt reale: în aceleași 28 de zile, ecazier nu a avut nicio comandă (CJO a avut 53, din care 40 plătite). GA se încarcă doar după acordul pentru cookie-uri, deci sesiunile reale sunt ceva mai multe.

## Bing Webmaster (date până pe 07.11)

| Site | Clicuri | Afișări | Observație |
|---|---|---|---|
| eghiseul.ro (3 luni) | 7.300 | 162.200 | ~100–145 clicuri/zi lucrătoare, **fără** căderea din octombrie de pe Google |
| cazierjudiciaronline.com (3 luni) | 209 | 5.800 | ~2–3 clicuri/zi; „cazier judiciar online” pe poziția 9 |
| ecazier.ro (30 zile) | 0 | 58 | aproape absent |
| documentero.ro (30 zile) | 0 | 22 | aproape absent |

- Sitemap-urile se citesc fără erori. Intrările vechi din WordPress (`sitemap_index.xml` pe eghiseul, pe `www.eghiseul.ro` și pe CJO, ultima citire în octombrie 2025) au fost șterse pe 10.11.
- Statistici de crawl prin API (`GetCrawlStats`, `GetCrawlIssues`): nicio problemă raportată, 0 erori 5xx, 0 timeout. Paginile în index Bing: eghiseul 180, CJO 78, documentero 20, ecazier 13.
- IndexNow e deja implementat pe ambele repo-uri (`src/lib/seo/indexnow.ts` + cron).
- Cheia API Bing a fost generată pe 10.11 și salvată local în `~/.config/claude-seo/google-api.json` (`bing_api_key`). Cheia vede toate cele 19 site-uri din cont.
- `scripts/seo/monitor-lunar.py` are acum o secțiune Bing: clicuri și afișări pe aceleași 28 de zile ca GSC. Prima măsurătoare (11.10–07.11 față de 13.09–10.10): eghiseul are 2.545 clicuri față de 2.031 (+25%), CJO are 55 față de 63.
