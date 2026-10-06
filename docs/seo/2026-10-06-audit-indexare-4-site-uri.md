# Audit de indexare pe cele 4 site-uri — 06.10.2026

Făcut după toate modificările din 06.10, doar citire. Surse:
- toate URL-urile din `sitemap.xml` ale fiecărui site, cerute ca Googlebot (status fără urmărirea redirecturilor, canonical, meta robots, `X-Robots-Tag`, titlu, descriere, numărul de H1, JSON-LD, blocare în `robots.txt` pentru Googlebot și Bingbot);
- linkurile interne dintre paginile din sitemap;
- **URL Inspection API din Search Console**, cu contul de serviciu `claude-seo@caziere`, pe **toate** cele 216 URL-uri din sitemap-uri;
- fișierele-cheie IndexNow și cronurile din `vercel.json`.

Contul de serviciu are acces la toate 4 proprietățile: `https://eghiseul.ro/` (URL-prefix), `sc-domain:documentero.ro`, `sc-domain:cazierjudiciaronline.com`, `sc-domain:ecazier.ro`.

## Pe scurt

- **Indexare: 215 din 216 URL-uri sunt „Trimisă și indexată”.** Singura neindexată e ghidul PAD publicat azi („Google nu cunoaște adresa URL”); cererea de indexare din GSC de azi a căzut pe cotă.
- **Nicio problemă blocantă:** 0 erori de status, 0 redirecturi, 0 canonical greșit, 0 `noindex` pe pagini din sitemap, 0 JSON-LD invalid, un singur H1 peste tot, nimic blocat în `robots.txt` pentru Googlebot sau Bingbot. Canonicalul ales de Google coincide cu al nostru pe toate URL-urile inspectate.
- ecazier: și `/ghid-alegere-tip-cazier` e acum indexat (ieri nu era), deci ecazier are 15/15.
- **Problema reală e `<lastmod>`**, care strică semnalul de prospețime și IndexNow zilnic (vezi mai jos).
- IndexNow: cheile răspund 200 pe toate 4 site-urile, cronurile sunt în `vercel.json` (eghiseul `40 4 * * *`, CJO `45 4 * * *`).

## eghiseul.ro (112 URL-uri în sitemap)

| Problemă | Gravitate | Remediere exactă |
|---|---|---|
| 86 din 112 URL-uri n-au `<lastmod>`, inclusiv toate `/servicii/*` (modificate azi: cazier judiciar, extras multilingv, casetele „Pe scurt”) | Mare | În generatorul sitemap-ului eghiseul, `lastModified` pentru fiecare rută statică din aceeași sursă cu `dateModified` din JSON-LD / „Actualizat la” (`src/lib/seo/last-modified.ts`), nu gol. Fără asta, cronul IndexNow zilnic vede doar cele 26 de URL-uri care au dată. |
| Ghidul PAD `/plan-de-amplasament-si-delimitare-copie-sau-intocmire/`: „Google nu cunoaște adresa URL” | Mare | Cerere de indexare în GSC mâine (prima pe listă). E deja în sitemap (lastmod 06.10), are 2 linkuri interne și a fost trimis la Bing. |
| 63 de titluri peste 65 de caractere (cu ` \| eGhiseul.ro`), ex. extras multilingv naștere 88, căsătorie 90, `cum-aflam-numarul-carte-functionara…` 99, `sms-fals-amenda…` 97, calculator valabilitate documente 98 | Medie | Scurtat la ≤60 înainte de sufix, prioritar pe paginile de vânzare (extras multilingv ×2, extras CF 79, celibat 79, cazier auto 79, constatator 76). Nu pe toate deodată: regula de 1–2 pagini rescrise pe săptămână. |
| 63 de descrieri peste 165 de caractere (ex. `ancpi-nu-functioneaza` 355, `tva-9-locuinte` 332, `acte-necesare-casatorie` 329, `actualizare-adresa-cf` 316) | Mică | Tăiate la ≤155 odată cu titlurile, în același lot. |
| 23 de pagini crawl-uite ultima dată înainte de 15.09 (ex. `/servicii/copie-releveu/` 29.07, `/servicii/copie-inventar-coordonate/` 01.08, `/servicii/copie-plan-cadastral/` 05.08, `/tools/` 12.08) | Mică | Se rezolvă cu `<lastmod>` real + IndexNow; nu merită cereri manuale. |
| `/tools/` are un singur link intern | Mică | Link din `/calculator/` sau din meniu spre `/tools/`. |

## documentero.ro (18 URL-uri)

| Problemă | Gravitate | Remediere exactă |
|---|---|---|
| `/ghiduri/apostila-acte-stare-civila/` are `lastmod` 2026-09-20, deși ghidul a fost extins azi (836 → 1.615 cuvinte) | Medie | Data din sitemap pentru ghiduri trebuie luată din aceeași constantă ca „Actualizat la” al ghidului (06.10). |
| Celibat, naștere, căsătorie au fost modificate azi (casete cu preț, extrasul CIEC), dar `lastmod` e 05.10 / 21.09 | Medie | Idem, data reală a ultimei modificări de conținut. |
| Titluri lungi: `valabilitate-certificat-de-celibat` 97, `procura-din-strainatate…` 79, `certificat-de-nastere-vechi-tipizat` 67, `extras-multilingv` 68 | Mică | Scurtat la ≤60 + sufix. |
| Descrieri lungi pe 9 pagini (home 228, celibat 229, procură 257) | Mică | ≤155. |
| `termeni-si-conditii` are titlul de 19 caractere | Foarte mică | Titlu descriptiv („Termeni și condiții documentero.ro”). |

Indexare: 18/18. Ultimul crawl Google: între 21.09 și 05.10; ghidul de apostilă și `/extras-multilingv/` au fost văzute ultima dată pe 21.09, deci nu conțin încă textul corectat de azi.

## cazierjudiciaronline.com (71 URL-uri)

| Problemă | Gravitate | Remediere exactă |
|---|---|---|
| **Toate cele 71 de URL-uri au `lastmod` = 2026-10-06** (ora build-ului), inclusiv termeni, politici, `status-comanda` | Mare | Sitemap-ul CJO trebuie să folosească `src/config/page-dates.ts` (adăugat azi pentru „Actualizat:”) și, unde lipsește, data ultimei modificări de conținut. O dată identică pe toate paginile e ignorată de Google și Bing; în plus, cronul IndexNow CJO o tratează ca ștampilă de build și trimite 0 URL-uri pe zi. |
| 22 de titluri peste 75 de caractere, mai ales ghidurile: `ghid-reabilitare-cazier` 105, `cazier-judiciar-persoane-fizice-ghid` 94, `cazier-auto-online` 92, `blog` 89, `cazier-judiciar-diaspora` 87 | Medie | Scurtat la ≤60 + sufix; prioritar paginile citate de AI și cu afișări: valabilitate (83), persoane juridice (87), reabilitare (105). |
| Descrieri peste 165 pe toate 40 de pagini de oraș (169–240) | Mică | Șablonul de descriere al paginilor de oraș tăiat la ≤155. |
| `/conditii-de-calatorie-cu-minori` și `/comparatie-servicii` au câte un singur link intern | Mică | Câte un link din ghidurile înrudite (diaspora, viză). |
| 4 pagini crawl-uite ultima dată înainte de 15.09: `/cazier-judiciar-urgent` (07.09), `/acte-necesare-cazier-judiciar` (10.09), `/cazier-judiciar-online/alexandria` (30.08), `/status-comanda` (31.08) | Mică | Primele două pe lista de cereri de mâine. |

Indexare: 71/71. Paginile de oraș au fost crawl-uite ultima dată în jurul lui 20–24.09 (București 20.09, Cluj 24.09): textul rescris pe 05.10 și blocul „Pe scurt” de azi nu sunt încă văzute de Google.

## ecazier.ro (15 URL-uri)

| Problemă | Gravitate | Remediere exactă |
|---|---|---|
| Titlurile noi de pe paginile de cazier auto (schimbate azi) nu sunt încă văzute: `/cazier-auto` crawl-uită pe 21.09, celelalte pe 21.09 sau 02.10 | Mică | Cereri de indexare pe `/cazier-auto` și `/acte-necesare-cazier-auto`. `lastmod` 05.10 e acceptabil. |
| `politica-de-confidentialitate`: descriere de 178 | Foarte mică | ≤155. |

Indexare: 15/15. Fără alte probleme.

## IndexNow și Bing

- Fișierele-cheie răspund 200 pe toate 4 host-urile.
- Cronuri: eghiseul `/api/cron/indexnow/` la 04:40 UTC, CJO `/api/cron/indexnow` la 04:45 UTC.
- Efectul real depinde de `<lastmod>`: pe eghiseul doar 26 de URL-uri au dată, iar pe CJO toate au aceeași dată de build (ignorată). Până se repară sitemap-urile, cronurile zilnice trimit foarte puțin; trimiterile manuale de azi la Bing (199 de URL-uri) acoperă golul.

## Cereri de indexare în GSC pentru 07.10 (prioritizate)

**eghiseul.ro** (proprietatea `https://eghiseul.ro/`):
1. `/plan-de-amplasament-si-delimitare-copie-sau-intocmire/` (neindexat)
2. `/servicii/extras-multilingv-certificat-nastere/` (crawl 22.09, text CIEC nou)
3. `/servicii/extras-multilingv-certificat-casatorie/` (crawl 26.09)
4. `/servicii/cazier-fiscal-online/` (casetă nouă, „oficial” scos)
5. `/servicii/extras-de-carte-funciara/` (afirmația „singurii… garantat” scoasă)
6. `/servicii/eliberare-certificat-de-celibat/`
7. `/servicii/eliberare-certificat-de-nastere/`
8. `/` (header și prima pagină fără cifrele inventate)
9. `/servicii/certificat-constatator-online/`
10. `/calculator/reabilitare/` (link nou spre CJO)

**documentero.ro:**
1. `/ghiduri/apostila-acte-stare-civila/`
2. `/extras-multilingv/`
3. `/certificat-de-celibat/`
4. `/certificat-de-nastere/`
5. `/certificat-de-casatorie/`
6. `/` (meniul și textele CIEC)

**cazierjudiciaronline.com:**
1. `/cazier-judiciar-online/ploiesti` (rămasă de azi, cota)
2. `/cazier-fiscal-online` (rămasă de azi)
3. `/` (prima pagină: bloc „Pe scurt”, recenzii, prețuri în schema)
4. `/valabilitate-cazier-judiciar` (cea mai citată în Copilot)
5. `/cazier-judiciar-persoane-juridice-ghid`
6. `/cazier-judiciar-online/bucuresti` (crawl 20.09)
7. `/cazier-judiciar-urgent` (crawl 07.09)
8. `/acte-necesare-cazier-judiciar` (crawl 10.09)
9. `/ghid-reabilitare-cazier` (linkuri noi din eghiseul și avocat-tarta)
10. `/dupa-cat-timp-se-sterge-cazierul`

**ecazier.ro:**
1. `/cazier-auto`
2. `/acte-necesare-cazier-auto`
3. `/valabilitate-cazier-auto`
4. `/puncte-penalizare-cazier-auto`
