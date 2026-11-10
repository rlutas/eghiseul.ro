# 10.11.2026 — CJO: email Black Friday către clienții vechi; verificare Bing
<!-- categorie: automatizari -->

## Pentru echipă

- Clienții care au cumpărat de pe CazierJudiciarOnline.com primesc **un singur email** de Black Friday, cu numele site-ului CJO, nu cu eghiseul. Reducerea de 20% se aplică singură în formular, până luni, 16.11, ora 23:59.
- Un client nu primește emailul dacă a mai comandat în ultimele 14 zile, dacă a primit alt email de la noi în ultimele 3 zile sau dacă s-a dezabonat.
- Clienții ecazier.ro **nu** primesc acest email: ecazier e cabinetul avocatei și nu trimitem campanii de acolo.
- Pornirea trimiterii o decide Raul. Până atunci nu pleacă nimic.
- Bing (motorul de căutare Microsoft) a fost verificat pe toate cele 4 site-uri: sitemap-urile se citesc fără erori. Detaliile sunt mai jos.

---

## Emailul Black Friday pe CJO

Commit CJO `d3b98f3c`. Este un nou tip de email lifecycle, `black_friday`, în `src/lib/lifecycle/`:

- se trimite o singură dată pe adresă și se leagă de ultima comandă;
- nu se trimite dacă adresa a plătit în ultimele 14 zile (`BLACK_FRIDAY_RECENT_ORDER_DAYS`) sau a primit alt email lifecycle în ultimele 3 zile (`BLACK_FRIDAY_QUIET_DAYS`);
- are plafonul lui, 120 pe rulare (`BLACK_FRIDAY_MAX_PER_RUN`), și se oprește singur după `BLACK_FRIDAY_ENDS_AT`;
- nu intră în `LIFECYCLE_EMAILS=all`; se trimite doar dacă e listat explicit în variabila de mediu;
- migrarea CJO `045_lifecycle_black_friday.sql` adaugă `black_friday` în `lifecycle_emails_kind_check`.

De ce a fost nevoie: campania BF de pe eghiseul filtrează pe `contacts.stripe_last_paid_at`, care vine din contul Stripe al eghiseul. Cei 769 de cumpărători CJO din `contacts` nu au trecut acest filtru, deci campania i-a sărit pe toți.

Pași pentru pornire:
1. rulezi migrarea 045 pe baza CJO;
2. copiezi în `email_suppressions` (CJO) adresele dezabonate pe eghiseul;
3. adaugi `black_friday` în `LIFECYCLE_EMAILS` (Vercel, proiectul `cazierjudiciaronline-com`) și redeploy;
4. rulezi cronul cu `?dry=1` și verifici numărul.

## Bing Webmaster (date până pe 07.11)

| Site | Clicuri | Afișări | Observație |
|---|---|---|---|
| eghiseul.ro (3 luni) | 7.300 | 162.200 | ~100–145 clicuri/zi lucrătoare, **fără** căderea din octombrie de pe Google |
| cazierjudiciaronline.com (3 luni) | 209 | 5.800 | ~2–3 clicuri/zi; „cazier judiciar online” pe poziția 9 |
| ecazier.ro (30 zile) | 0 | 58 | aproape absent |
| documentero.ro (30 zile) | 0 | 22 | aproape absent |

- Sitemap-urile se citesc fără erori. Pe eghiseul au rămas două intrări vechi din WordPress (`sitemap_index.xml`, din care una pe `www`), cu ultima citire în octombrie 2025. Le poți șterge din Bing.
- Cheia API Bing nu este generată. Pasul îl face Raul, din Settings → API access → API Key. Cheia se pune în `~/.config/claude-seo/google-api.json`, la `bing_api_key`.
