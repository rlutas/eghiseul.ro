# Site satelit pentru stare civilă — analiză și recomandare (19.09.2026)

**Întrebarea:** după prăbușirea organică din august, merită un site nou, dedicat
certificatelor de stare civilă (naștere, căsătorie, celibat, extrase multilingve),
legat de eghiseul? Ce domeniu? Cum îl construim? Ce face infocazier?

**Verdict scurt:** da, dar NU ca „site care redirecționează la eghiseul" — asta e,
prin definiția Google, un doorway site. Da ca **brand de nișă, de sine stătător,
cu comanda pe el**, pe modelul care ne-a supraviețuit deja (cazierjudiciaronline
= un singur subiect, #1, neatins de update). Domeniul recomandat:
**certificatdenastere.ro** (liber la ROTLD, 19.09).

---

## 1. Ce e în joc (date reale)

### Cererea (Semrush, iunie 2026)

| Cluster | Keywords | Volum/lună | KD |
|---|---|---|---|
| certificat de naștere | 3.320 | 27.670 | 11% |
| certificat de căsătorie | 773 | 5.850 | 11% |
| celibat / extras multilingv | mic | sub 1.000 | mic |

KD 11% = cel mai ușor cluster comercial pe care îl avem. Head term „certificat de
nastere" 1.900/lună, „duplicat certificat de nastere online" 1.000/lună.

### Ce pierdem acum (GSC, ferestre egale 17 zile: 01–17.08 vs 23.08–08.09)

| Pagină | Clicuri | Expuneri | Poziție |
|---|---|---|---|
| `/servicii/eliberare-certificat-de-nastere/` | 210 → 90 | 7.235 → 589 | 8,5 → 6,7 |
| `/servicii/eliberare-certificat-de-celibat/` | 82 → 30 | 1.691 → 156 | 5,7 → 4,4 |
| `/servicii/eliberare-certificat-de-casatorie/` | 68 → 31 | 2.831 → 219 | 7,3 → 6,3 |
| `/servicii/extras-multilingv-certificat-nastere/` | 85 → 10 | 2.224 → 95 | 5,7 → 3,4 |
| `/servicii/extras-multilingv-certificat-casatorie/` | 15 → 0 | 402 → 12 | 6,7 → 12,7 |

Poziția medie URCĂ, expunerile cad cu 90%+: Google ne mai arată doar pe
interogările de brand și pe cele foarte lungi. Clasic pentru un site lovit de
update.

### Banii (DB producție, comenzi plătite, de la cutover 08.07)

| Lună | Comenzi stare civilă | Venit | Total site |
|---|---|---|---|
| iulie (de la 08) | 25 | 28.427 | 55.088 |
| august | 14 | 15.371 | 47.816 |
| septembrie (până la 19) | 5 | 7.377 | 20.091 |

Valoare medie comandă: **1.030–1.260 RON** — cele mai scumpe comenzi din site.
Înainte de update, stare civilă = ~50% din venit. Pe 90 de zile: 44 comenzi,
51.176 RON. Asta e mărimea găurii.

### SERP-ul real (19.09, `&pws=0`, `gl=ro`)

| Interogare | Cine e sus |
|---|---|
| certificat de nastere online | centruldevize.ro #1, hub.mai.gov.ro #2, **infocazier #3**, primării; eghiseul absent din top 10 vizibil (GSC: poz. 4,2 pe 90 zile, −58% clicuri) |
| duplicat certificat de nastere online | primării + MAI + centruldevize + infocazier #6; eghiseul poz. 1,7 pe 28 zile dar expuneri −46% |
| certificat de celibat online | **eghiseul #1** (cu preț în rich result), centruldevize, gabrieldragomir, primării |
| extras multilingv certificat de nastere | MAI, primării, evpcv; eghiseul poz. 4,9, 13 clicuri/90 zile |

Concluzie: pe naștere (clusterul mare) ne-au luat locul un birou de vize
(centruldevize, pagină generalistă, preț la cerere) și infocazier. Pe celibat
încă suntem #1. Pe multilingv SERP-ul e al instituțiilor.

---

## 2. Infocazier — ce a făcut, de fapt

- Domeniu înregistrat **14.03.2025** (Claus Web). Site React SPA (`react-vendor`
  în bundle), nu WordPress.
- Sitemap-uri separate: `sitemap-nastere.xml` **223 pagini**, `sitemap-casatorie.xml`
  **225 pagini**, `sitemap-cazier.xml` **3.284 pagini** — pagini pe județ + oraș
  (`/certificat-de-nastere/bals/`, `/cazier-judiciar/aiud/`).
- Pagina care rankează e **hub-ul** `/certificat-de-nastere` (ghid ~2.800 de
  cuvinte, 9 secțiuni H2, 6 FAQ, „500 lei + TVA + curier 25/90 lei"), nu paginile
  de oraș. Paginile de oraș sunt șablon cu „localități din apropiere" (Caracal,
  Corabia, Slatina) — exact tiparul doorway pe care l-am plătit noi în august.
- Fără autor, fără nume de avocat, fără CUI vizibil pe pagină; are disclaimer de
  serviciu privat.
- Prețul lor: 605 lei cu TVA + curier. Al nostru: ~1.250 RON medie (cu opțiuni).

**Ce înseamnă:** infocazier nu a „câștigat" cu paginile de oraș, ci cu un hub
lung, comercial, pe un domeniu curat, cu 3.700 de pagini care încă nu au fost
măsurate de Google la scară. Au 18 luni. Riscul lor la următorul refresh e
identic cu ce am trăit noi. **Nu copiem matricea de orașe** — regula din
`.claude/rules/content-and-seo.md` §1 rămâne.

Rețele de site-uri deja există în nișă și trăiesc: ghiseurapid.ro +
certificatrapid.ro + cazierrapid.ro (același operator, un brand per subiect,
linkate în footer). laghiseu.ro (Satu Mare) e generalist, 500 lei celibat.

---

## 3. Site satelit: cum DA și cum NU

### NU: „site care trimite la eghiseul"

Google, Spam Policies → *Doorway abuse*: „having multiple websites ... that
funnel users to one page". Un site nou, cu conținut despre certificate, al cărui
buton „Comandă" sare pe eghiseul.ro, e definiția literală. Îl pierdem pe el ȘI
atragem atenția pe eghiseul, care e deja în refacere.

### DA: brand de nișă, de sine stătător

Modelul e deja demonstrat în casă:

| | eghiseul.ro | cazierjudiciaronline.com |
|---|---|---|
| Subiecte | 9 servicii live, 31 `Product`, calculatoare, articole | un singur subiect |
| Spam update aug 2026 | −78% clicuri | neatins, #1 |
| Scriitură „AI" (tipare/1k) | 10,4 | 13,8 (mai „AI", tot #1) |
| Coeziune internă (inlinkuri mediană) | 5 | 38 |

Ce a supraviețuit nu e „cel mai bine scris", ci **cel mai concentrat tematic și
cel mai bine legat intern**. Un site pe stare civilă, cu 15–25 de pagini toate
despre același lucru, linkate dens, e din construcție ce recompensează Google
acum.

Condițiile ca să nu fie doorway:
1. **Comanda pe el.** Wizard, plată, status, email — toate pe domeniul nou.
   Registrul central de numere are deja `platform` ca parametru, e făcut pentru
   a 3-a platformă (`allocate_number(platform, ...)`).
2. **Conținut propriu, nu copiat de pe eghiseul.** Paginile de pe eghiseul rămân
   (rankăm încă pe celibat), deci textul nou trebuie să treacă testul Jaccard din
   §1 al regulilor față de paginile surori de pe eghiseul, nu doar între ele.
3. **Entitate reală și vizibilă:** aceeași firmă (EDIGITALIZARE), aceeași
   avocată, aceleași recenzii — dar afișate, cu pagină „Despre", autor cu
   pagină proprie, ANPC, neafiliere. Legătura cu eghiseul e **declarată** („parte
   din grupul eghiseul", link în footer, o dată), nu ascunsă. Rețea declarată ≠
   rețea de doorway.
4. **Fără pagini pe orașe.** Sub-intenții, nu localități: duplicat / pierdut /
   diaspora / apostilă / transcriere / model / termen / acte necesare / sectoare
   București într-o singură pagină cu tabel.
5. **Cadență:** 1–2 pagini pe săptămână, nu lansare cu 40.

### Ce NU rezolvă

- Nu e o scurtătură. Domeniu nou = zero autoritate. Pe un head term de 1.900/lună
  cu KD 11% realist: 3–6 luni la primele poziții pe long tail, 6–12 luni pe head.
  Recuperarea eghiseul (refresh oct–nov) poate veni mai repede decât rankarea
  site-ului nou. **Sunt două pariuri paralele, nu unul în locul celuilalt.**
- Nu e scut împotriva politicii Google Ads „documente guvernamentale" — aceeași
  politică, orice domeniu.
- Contextul de piață: SIIEASC + certificate digitale (2.500 de localități, duplicat
  de la orice primărie, gratuit). Fricțiunea pe care o vindem scade în țară;
  rămâne intactă pentru **diaspora** (nu poate merge la ghișeu) și pentru cine
  vrea „fără drum, cu curier". Site-ul nou se poziționează explicit pe astea.

---

## 4. Domeniul

Verificat la ROTLD (`whois.rotld.ro`), 19.09.2026:

| Domeniu | Stare | Comentariu |
|---|---|---|
| **certificatdenastere.ro** | **LIBER** | recomandat: exact-match pe clusterul de 27.670/lună; modelul CJO („cazier judiciar online" = documentul, nu instituția) |
| certificatnastere.ro | liber | ia-l defensiv, 301 spre principal |
| certificatnastere.com | liber | opțional, pentru diaspora |
| stareacivila.ro | liber | umbrelă, dar **numele instituției** (starecivila.mai.gov.ro există) — risc de impersonare la ANPC/Google/Concurență, exact ce ne dăunează la Ads. Evită. |
| starecivila.ro | ocupat 2009 | — |
| actestarecivila.ro | ocupat 2019 | — |
| actecivile.ro | liber | umbrelă neutră, brandabilă, fără volum de căutare; alternativa dacă vrei un brand pe toate 4 serviciile |
| certificatecivile.ro | liber | idem |
| certificatestarecivila.ro | liber | prea lung |
| extrasmultilingv.ro | liber | doar dacă vrei micro-site separat; NU acum |
| certificatcelibat.ro / certificatdecelibat.ro | liber | ia-le defensiv, nu construi |
| certificatonline.ro | ocupat 2024 | — |
| certificateonline.ro | ocupat **nov. 2025** | cineva construiește ceva în nișă |
| ecertificat.ro | ocupat 2024 | — |

**Recomandare:** `certificatdenastere.ro` ca site principal, cu secțiuni
`/certificat-de-casatorie/`, `/certificat-de-celibat/`, `/extras-multilingv/`.
Naștere e 80% din cerere; căsătoria și celibatul sunt același birou, aceeași
procedură, aceeași avocată — topical adiacent, nu off-topic. Exact-match nu mai
dă bonus din 2012, dar dă CTR: titlul din SERP repetă interogarea. Rezervă în
plus: certificatnastere.ro, certificatdecelibat.ro (redirect, ~40 lei/an fiecare).

Dacă preferi un brand-umbrelă pentru toate 4 (și pentru deces/transcriere mai
târziu): `actecivile.ro`.

---

## 5. Cum îl construim

Codebase-ul eghiseul **nu are tenant**: `BASE_URL` e hardcodat
(`src/lib/seo/constants.ts:14`), navul, sitemap-ul, JSON-LD-ul și emailurile
presupun un singur domeniu. Două căi:

| | A. Al doilea deploy din repo-ul eghiseul (tenant prin env) | B. Repo nou, clonat din CJO |
|---|---|---|
| Ce se face | `NEXT_PUBLIC_BASE_URL` + `TENANT=starecivila`; route group `src/app/(starecivila)/` cu paginile publice noi; middleware care pe tenantul B servește doar rutele lui + wizard/API/status/checkout; nav/sitemap/robots/JSON-LD/emailuri citesc din config de tenant | CJO e single-tenant, cu wizard, KYC, Stripe, Oblio, registru, admin — se schimbă serviciile și copy-ul |
| Admin / DB | **aceleași** (o coloană `platform` pe `orders`) — echipa lucrează într-un singur loc | admin separat (ca la CJO) |
| Risc | refactor pe un cod care se schimbă zilnic; BASE_URL apare în zeci de locuri | a 3-a bază de cod de întreținut; ONRC/ANCPI nu contează aici, dar Stripe webhook, Oblio, KYC, remindere = de dus în paralel |
| Efort | ~2–3 săptămâni | ~1–2 săptămâni până la comandă, apoi datorie permanentă |

**Recomand A.** Echipa are deja 3 platforme + 2 workeri; a 4-a bază de cod pe
serviciile cu cea mai grea operare (avocat, împuternicire, curier internațional)
e unde se pierd comenzi. Un singur admin, o singură coadă, un singur contract cu
avocata.

### Pași

1. **Săptămâna 0** — cumpără domeniile, GSC + GA4 property, DNS pe Vercel
   (⚠️ `www` = 308, Stripe nu urmărește — endpoint webhook direct pe apex).
2. **Săptămâna 1–2** — tenant în cod: `BASE_URL` din env, config de tenant (nume,
   logo, culori, servicii permise = cele 5 slug-uri, footer cu firma + link
   declarat spre eghiseul), route group nou, middleware. Stripe: același cont,
   endpoint nou. Oblio: aceeași firmă, serie separată (`EGN-`?) — de decis cu
   contabilul. Registru central: `platform='certificatdenastere'`.
3. **Săptămâna 2–3** — conținut, scris de la zero, nu adaptat:
   - home = hub naștere (ghidul de 2.500+ cuvinte, cu preț, termen, ce primești,
     cine depune, diaspora);
   - 4 pagini de serviciu (căsătorie, celibat, multilingv naștere, multilingv
     căsătorie) — fiecare cu conținutul EI, nu template cu numele schimbat
     (perechea multilingv de pe eghiseul are Jaccard 0,75 — greșeala nr. 1 de
     evitat);
   - „Despre” cu avocata + firma; autor cu pagină; ANPC; neafiliere.
4. **Lună 2–3** — 1–2 pagini/săpt. pe sub-intenții cu volum: pierdut (590),
   cerere duplicat + model (320), acte necesare (260), sectoare București (tabel
   unic, 2.350 vol pe cluster), transcriere (110), apostilă/diaspora,
   certificat vechi → nou (singurul articol care ne mai merge pe eghiseul:
   poz. 1,8, 94 clicuri).
5. **Continuu** — linking intern dens (țintă ≥20 inlinkuri/pagină, ca CJO),
   un link declarat din eghiseul (footer + pagina de serviciu naștere, „vezi
   ghidul complet"), backlinkurile viitoare pe domeniul nou, nu pe eghiseul.
6. **Măsurare** — expuneri pe `/`, nu clicuri, săptămânal; decizia de a muta
   (301) paginile de stare civilă de pe eghiseul pe site-ul nou se ia DOAR când
   site-ul nou depășește eghiseul pe aceleași interogări, nu înainte.

### Ce nu facem

- pagini pe orașe/județe;
- copy-paste din eghiseul;
- lansare în lot;
- redirect din site-ul nou spre eghiseul pentru comandă;
- `aggregateRating` pe `Product`, autori fictivi, date inventate (§3 din reguli).

---

## Surse

- SERP real 19.09.2026, `&pws=0&gl=ro&hl=ro`, 4 interogări (vezi §1).
- GSC eghiseul, export `2026-09-recuperare-spam-update/gsc/compare-post-vs-pre/`.
- DB producție `orders` × `services`, `payment_status='paid'`, 19.09.2026.
- ROTLD whois, 19.09.2026.
- infocazier.ro: `robots.txt`, `sitemap-{nastere,casatorie,cazier}.xml`, hub
  `/certificat-de-nastere`, pagină oraș `/certificat-de-nastere/bals/`;
  Wayback CDX (prima captură 14.03.2025).
- Semrush export 2026-06-19: `docs/seo/keywords/certificat-{nastere,casatorie}/`.
- Google Search Central, Spam Policies, „Doorway abuse".
