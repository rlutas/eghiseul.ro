# certificat-constatator-express.ro: al patrulea brand, doar certificat constatator

**Stare (11.11.2026):** LIVE și indexabil din 11.11.2026; GSC și Bing verificate, sitemap trimis. Fără Black Friday pe acest brand. GA4 creat (`G-X5Q7NDPHPL`, proprietatea 563726213), activ de la următorul build de producție. Deschis: Google Ads cont nou, Microsoft Ads. Rețeta e cea de la cazierfiscal.com: [`../seo/playbook-site-de-nisa-un-serviciu.md`](../seo/playbook-site-de-nisa-un-serviciu.md) și [`../cazier-fiscal/README.md`](../cazier-fiscal/README.md).

## Domeniile (cumpărate 11.11.2026)

| Domeniu | Rol | Cost |
|---|---|---|
| `certificat-constatator-express.ro` | site-ul, canonical | 64,13 lei + TVA / an |
| `certificatconstatatorexpress.ro` | redirect 308 spre primul (cine tastează fără cratime) | 64,13 lei + TVA / an |

Total 155,20 lei cu TVA, pe un an. Le-a cumpărat Raul pe 11.11.2026, la ROTLD, nu în Vercel. Pe 11.11 ambele au primit nameserverele `ns1.vercel-dns.com` / `ns2.vercel-dns.com` și sunt în proiectul `eghiseul-ro`: apexul cu cratime servește site-ul, `www` și varianta fără cratime fac 308 spre el. Reînnoirea vine în noiembrie 2027.

De ce acest nume: [`../seo/2026-11-11-site-constatator-domeniu-si-concurenta.md`](../seo/2026-11-11-site-constatator-domeniu-si-concurenta.md). Domeniile evidente sunt toate luate de concurenți. În organic stau sus domeniile cu potrivire exactă, inclusiv cele lungi, cu cratime. „Express” promite viteza fără „ONRC” sau „oficial” în nume.

## De ce

Pe eghiseul, constatatorul aducea 20–38 de mii de afișări pe lună (poziția 7) și 7–10 comenzi pe săptămână. Pe 24.08.2026 spam update-ul l-a scos din Google: au rămas 13–45 de afișări pe săptămână și 2–5 comenzi. Lista de email (2.756 de contacte) a fost folosită deja. Decizia lui Raul, din 11.11.2026, e un site separat, susținut de reclame.

Diferența față de cazierfiscal: aici **reclamele Google sunt permise**. Concurenții rulează până la 6 reclame pe căutare. Site-ul trăiește din reclame la început, iar organicul vine după.

## Ce vindem

Serviciul `certificat-constatator` existent, cu wizardul existent. Livrarea e automată, prin workerul ONRC: de bază, fonduri IMM și insolvență, în circa 3 minute. Prețurile vin din DB, pentru că sunt aceleași pe toate brandurile.

| Concurent | De bază | Extins |
|---|---|---|
| certificatconstatator.ro | 84,90 | 399,90 |
| certificat-constatator-instant.ro | 84,99 | 399,99 |
| cc-onrc.ro | 79 | 379 |
| constatator.ro | 69–119 | 399 |
| noi (eghiseul) | 89 | (cu istoric) |

Marja: 89 lei includ TVA, deci rămân 73,55 lei fără TVA; minus 30 de lei taxa ONRC și comisionul Stripe rămân circa 41 de lei. Un cost pe comandă de 40 de lei e deci punctul de echilibru, nu profit; profitul vine din comenzile care nu vin din reclame.

## Cuvinte cheie

Date brute în [`cuvinte-cheie-2026-11/`](cuvinte-cheie-2026-11/): GSC eghiseul iulie 2025 – noiembrie 2026 (227 de căutări cu cel puțin 30 de afișări) și 360 de sugestii Autocomplete.

| Grup | Afișări eghiseul, 16 luni | Unde |
|---|---|---|
| certificat constatator (online, onrc, eliberare, registrul comerțului, cerere, obținere, preț, cât costă) | ~270k | pagina principală: title, H1, H2, FAQ |
| extins / detaliat / de bază / cu istoric / ce conține | ~20k | ghid „tipuri de certificat constatator” + tabel pe pagina principală |
| valabilitate (cât e valabil, 30 de zile) | ~6k | ghid; căutarea nu are reclame, e informațională |
| PFA, II, SRL, punct de lucru | ~8k | H2 pe pagina principală; ghid PFA doar dacă iese conținut propriu |
| fonduri IMM, licitație / achiziții publice, bancă | mic, intenție mare | H2 „Pentru ce ți se cere”; ghid licitații mai târziu |
| beneficiar real / RBR | mic | doar dacă vindem extrasul RBR |

**Capcane (NU):**
- „certificat constatator al nașterii / decesului / născutului viu” e un act medical, nu de la ONRC;
- „agent constatator” (asigurări, contravenții) nu are legătură;
- „asociații și fundații” au alt registru (judecătoria), nu ONRC;
- „onrc” singur e căutare de navigare (24k afișări, 8 clicuri) și se exclude la reclame, la fel „gratuit”;
- fără pagini de oraș sau de județ: ONRC eliberează la nivel național.

## Plan

### Faza 1: site-ul (11–12.11)

1. Brand `constatator` în `src/lib/brand/brands.ts`, cu hosturile în `next.config.ts` și `src/proxy.ts`. Migrarea care permite `orders.platform = 'constatator'`, plus filtru și badge în admin. Iconițe pe host.
2. Pagini, clonate după cazierfiscal: `/` (pagina de bani), `/despre/`, `/contact/`, `/ghiduri/` (gol), cele 4 pagini legale, `robots.txt`, `sitemap.xml`, `llms.txt`, `not-found`. Totul rămâne `noindex` până la verificare.
3. Paleta proprie, diferită de eghiseul, documentero și cazierfiscal.
4. Fără legături cu eghiseul: niciun link, nicio schema `sameAs`, fără telefon sau email pe paginile publice (playbook §2).
5. Pagina principală pe baza analizei de concurență ([`02-analiza-concurenti.md`](02-analiza-concurenti.md)). Formularul pornește din primul ecran (lecția de la CJO: formularul sub pliu a înjumătățit comenzile). Tabelul de tipuri și prețuri și FAQ-ul sunt vizibile, fără acordeon.

### Faza 2: lansarea (după DNS)

1. Domeniile în Vercel. `www` și `certificatconstatatorexpress.ro` duc prin 308/301 spre `https://certificat-constatator-express.ro`.
2. Search Console (Domain, prin TXT) + contul de serviciu claude-seo; Bing Webmaster.
3. ~~GA4: cont nou, ID în `NEXT_PUBLIC_GA_MEASUREMENT_ID_CONSTATATOR`.~~ Făcut 11.11: `G-X5Q7NDPHPL`, setat în Vercel production.
4. Resend: nu se verifică domeniul (limita de 10). Emailurile pleacă prin fallback de pe adresa eghiseul, cu numele brandului; asta e o legătură vizibilă cu eghiseul până mutăm domeniile mici într-un cont separat.
   Adresa `contact@certificat-constatator-express.ro` nu are MX (DNS-ul e pe Vercel): de adăugat înainte de reclame dacă vrem răspunsuri pe ea.
   Supabase auth: domeniul nou de adăugat în lista de redirect-uri, dacă activăm contul de client pe brand.
5. Indexarea pornește doar după verificarea manuală a paginii live. Apoi IndexNow.

### Faza 3: reclame (Raul + dev)

1. Cont Google Ads nou, separat (ca la cazierfiscal), eticheta de conversie în `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR` / `..._PURCHASE_LABEL_CONSTATATOR`.
2. Keyword Planner pe contul nou pentru costul pe clic real.
3. Campanie Search, expresie exactă și frază pe grupul principal. Excluderi: onrc (singur), gratuit, nașterii, decesului, agent, asociații. Buget de test de 30–50 lei pe zi, două săptămâni.
4. Microsoft Ads, aceleași cuvinte importate, la 20 de lei pe zi.
5. Fără „oficial” și fără „ONRC” în titlurile reclamelor (memoria: google-ads-documente-oficiale).
6. Contul eghiseul nu licitează pe cuvintele constatator cât timp rulează contul nou: două conturi ale aceleiași firme pe aceeași căutare încalcă regula Google despre avantajul nedrept (unfair advantage).

### Faza 4: ghiduri (câte unul pe săptămână)

Candidate, în ordinea cererii: tipurile de certificat constatator (de bază, extins, cu istoric, detaliat), valabilitatea, certificatul constatator pentru PFA și punct de lucru, pentru licitații și fonduri.

**Coada de ghiduri (scrise 11.11, verificate pe paginile ONRC, formularul 11-10-188, Ordinul 380/C/2024 și Legea 265/2022, NEPUBLICATE):**

| Data | Ghid | Cum îl publici |
|---|---|---|
| 18.11 | `/ghiduri/valabilitate-certificat-constatator/` | în `src/config/constatator-nav.ts`: `published: true`, `updated` = data; în pagină `PUBLISHED`/`UPDATED` = data; la primul ghid live adaugă `/ghiduri/` în `src/config/constatator-sitemap.ts` și „Ghiduri” în `CONSTATATOR_NAV`; deploy; IndexNow |
| 25.11 | `/ghiduri/certificat-constatator-pfa-punct-de-lucru/` | idem |
| 02.12 | `/ghiduri/certificat-constatator-extins/` | idem |
| 09.12 | `/ghiduri/raport-istoric-onrc/` | idem |
| 16.12 | `/ghiduri/certificat-constatator-licitatie-fonduri/` | idem |

Până la publicare, paginile dau 404 în producție și lipsesc din hub, sitemap, llms.txt, footer și „Citește și”; în `next dev` se văd, pentru verificare. Linkurile dintre ghiduri folosesc `GuideLink` (`src/components/constatator/guide.tsx`): cât timp ținta e nepublicată se randează ca text simplu. Fără FAQPage, fără orașe sau județe, fără linkuri spre eghiseul.

Ce nu au ghidurile, intenționat: nicio instituție numită drept cea care cere „30 de zile” (nu există sursă primară); nicio afirmație despre ce înțeleg alți vânzători prin „extins”; nicio promisiune de viteză la raportul istoric (ONRC: cel mult 30 de zile, „în funcție de complexitatea lucrării”). Durata la fonduri IMM și insolvență (operator ONRC, în program, uneori ziua lucrătoare următoare) e observația noastră din workerul ONRC, spusă ca atare în ghid.

## Ce urmărim

- Comenzile cu badge „constatator” în admin, comparate cu constatatorul de pe eghiseul (2–5 pe săptămână acum).
- Reclame: cost pe comandă sub 40 de lei (echilibru) după două săptămâni, altfel oprim și ajustăm.
- Organic: indexare în săptămâna 1–2, afișări pe „certificat constatator online” în săptămânile 3–6.

## Fapte verificate pe surse ONRC (11.11.2026)

- Taxa certificatului constatator: 30 lei (Ordinul MJ 380/C/2024, anexa pct. 1), aceeași pentru SRL, PFA, II, IF. Pagina ONRC „Certificate constatatoare” o confirmă.
- „Cu istoric” = oficial **raport istoric despre o firmă**, 250 lei/firmă (anexa pct. 2), emis în cel mult 30 de zile; de la înființare sau pe o perioadă aleasă (formularul 11-10-188, pct. 4.2).
- „Extins” / „detaliat” nu există ca tip oficial: un singur certificat, scopul se bifează (licitație, bancă, viză, leasing, notariat, fonduri IMM, CAS, insolvență, altele).
- Certificat pentru persoană fizică după CNP: există, 30 lei. Nu am confirmat că se poate cere online (InfoCert); de aceea pagina promite viteza doar la certificatul de bază pe firmă.
- „Furnizare informații” e alt serviciu (liste de firme după criteriu, 9 lei/criteriu/firmă).
- Emitere electronică cu semnătură/sigiliu calificat: Legea 265/2022 art. 11 alin. 3; InfoCert 24/7, plată cu cardul.
- Valabilitate: nicio lege nu o fixează; „30 de zile” e cerința instituțiilor care primesc certificatul.

## Conversii Google Ads (verificat 11.11.2026)

Ce e deja în cod:

- Eticheta Google (GA4 `G-X5Q7NDPHPL` și, când există, contul Ads) se încarcă doar după acordul pentru cookie-uri. Implicit totul e `denied` (Consent Mode v2).
- Pe pagina de succes, după plata confirmată (`payment_status = 'paid'` sau Stripe `redirect_status = succeeded`), pleacă:
  - evenimentul GA4 `purchase` (valoare reală, RON, `transaction_id` = codul comenzii, produsele);
  - conversia Ads (`send_to` = `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR/…LABEL_CONSTATATOR`), cu aceeași valoare și același `transaction_id`, deci un refresh nu o numără de două ori. Enhanced conversions trimit emailul și telefonul hash-uite, doar cu acord de marketing.
- Fără fallback pe alte conturi: dacă variabilele constatator lipsesc, conversia Ads nu pleacă nicăieri.
- Meta și pixelul OpenAI nu se încarcă pe acest brand.
- `gclid` se salvează pe comandă (atribuirea de canal), deci conversiile pot fi importate și offline, inclusiv pentru clienții care au refuzat cookie-urile.

De făcut la crearea contului Ads:

1. În contul Ads nou: o acțiune de conversie „Purchase” (Website, setată manual cu cod), valoare din tag, numărare „Una”, enhanced conversions pornite.
2. Din fragmentul de eveniment copiezi `AW-XXXXXXXXX/eticheta`. În Vercel (production) pui `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR = AW-XXXXXXXXX` și `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_CONSTATATOR = eticheta`. Apoi un build nou (variabilele `NEXT_PUBLIC_` intră doar la build).
3. Leagă GA4 (proprietatea 563726213) de contul Ads. `purchase` e eveniment-cheie implicit în GA4. În Ads, conversia GA4 rămâne secundară, ca să nu se numere de două ori cu eticheta Ads.
4. Test: o comandă reală de 89 lei, cu acordul la cookie-uri, apoi verifici în Tag Assistant că pleacă `conversion` cu `send_to` corect. Comanda se rambursează după aceea.
