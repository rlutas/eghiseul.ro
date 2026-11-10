# 10.11.2026 — CJO: email Black Friday către clienții vechi; verificare Bing
<!-- categorie: automatizari -->

## Pentru echipă

- Clienții care au cumpărat de pe CazierJudiciarOnline.com primesc **un singur email** de Black Friday, cu numele site-ului CJO, nu cu eghiseul. Reducerea de 20% se aplică singură în formular, până luni, 16.11, ora 23:59.
- Un client nu primește emailul dacă a mai comandat în ultimele 14 zile, dacă a primit alt email de la noi în ultimele 3 zile sau dacă s-a dezabonat.
- Clienții ecazier.ro **nu** primesc acest email: ecazier e cabinetul avocatei și nu trimitem campanii de acolo.
- Trimiterea a pornit pe 10.11: primii 120 de clienți au primit emailul. Restul (aproximativ 360) îl primesc automat, câte 120 pe zi, până pe 13.11.
- Bing (motorul de căutare Microsoft) a fost verificat pe toate cele 4 site-uri: sitemap-urile se citesc fără erori. Pe eghiseul, clicurile din Bing au crescut cu 25% în ultima lună, deși pe Google au scăzut. Raportul SEO lunar include acum și Bing.

---

## Emailul Black Friday pe CJO

Commit CJO `d3b98f3c`. Este un nou tip de email lifecycle, `black_friday`, în `src/lib/lifecycle/`:

- se trimite o singură dată pe adresă și se leagă de ultima comandă;
- nu se trimite dacă adresa a plătit în ultimele 14 zile (`BLACK_FRIDAY_RECENT_ORDER_DAYS`) sau a primit alt email lifecycle în ultimele 3 zile (`BLACK_FRIDAY_QUIET_DAYS`);
- are plafonul lui, 120 pe rulare (`BLACK_FRIDAY_MAX_PER_RUN`), și se oprește singur după `BLACK_FRIDAY_ENDS_AT`;
- nu intră în `LIFECYCLE_EMAILS=all`; se trimite doar dacă e listat explicit în variabila de mediu;
- migrarea CJO `045_lifecycle_black_friday.sql` adaugă `black_friday` în `lifecycle_emails_kind_check`.

De ce a fost nevoie: campania BF de pe eghiseul filtrează pe `contacts.stripe_last_paid_at`, care vine din contul Stripe al eghiseul. Cei 769 de cumpărători CJO din `contacts` nu au trecut acest filtru, deci campania i-a sărit pe toți.

Pornit pe 10.11.2026:
1. migrarea 045 rulată pe baza CJO;
2. 372 de adrese dezabonate sau blocate pe eghiseul (`contacts.marketing_status` `unsubscribed`/`suppressed`) copiate în `email_suppressions` pe CJO, cu `reason` `eghiseul_unsubscribed`/`eghiseul_suppressed` (total 400);
3. `LIFECYCLE_EMAILS=expiry_reminder,review_request,cross_sell,black_friday` pe Vercel, apoi redeploy;
4. rulare locală fără trimitere: 482 de adrese eligibile;
5. cronul pornit manual (`vercel crons run /api/cron/lifecycle-emails`): 120 trimise, 0 eșuate. Restul pleacă cu cronul zilnic de la 07:20 UTC.

După 16.11, scoate `black_friday` din `LIFECYCLE_EMAILS`. Codul nu mai trimite oricum după `BLACK_FRIDAY_ENDS_AT`.

## Bing Webmaster (date până pe 07.11)

| Site | Clicuri | Afișări | Observație |
|---|---|---|---|
| eghiseul.ro (3 luni) | 7.300 | 162.200 | ~100–145 clicuri/zi lucrătoare, **fără** căderea din octombrie de pe Google |
| cazierjudiciaronline.com (3 luni) | 209 | 5.800 | ~2–3 clicuri/zi; „cazier judiciar online” pe poziția 9 |
| ecazier.ro (30 zile) | 0 | 58 | aproape absent |
| documentero.ro (30 zile) | 0 | 22 | aproape absent |

- Sitemap-urile se citesc fără erori. Pe eghiseul au rămas două intrări vechi din WordPress (`sitemap_index.xml`, din care una pe `www`), cu ultima citire în octombrie 2025. Le poți șterge din Bing.
- Cheia API Bing a fost generată pe 10.11 și salvată local în `~/.config/claude-seo/google-api.json` (`bing_api_key`). Cheia vede toate cele 19 site-uri din cont.
- `scripts/seo/monitor-lunar.py` are acum o secțiune Bing: clicuri și afișări pe aceleași 28 de zile ca GSC. Prima măsurătoare (11.10–07.11 față de 13.09–10.10): eghiseul are 2.545 clicuri față de 2.031 (+25%), CJO are 55 față de 63.
