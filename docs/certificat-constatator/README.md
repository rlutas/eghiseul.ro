# certificat-constatator-express.ro: al patrulea brand, doar certificat constatator

**Stare (11.11.2026):** în construcție. Domeniile sunt cumpărate de Raul pe 11.11.2026. Rețeta e cea de la cazierfiscal.com: [`../seo/playbook-site-de-nisa-un-serviciu.md`](../seo/playbook-site-de-nisa-un-serviciu.md) și [`../cazier-fiscal/README.md`](../cazier-fiscal/README.md).

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
3. GA4: cont nou, ID în `NEXT_PUBLIC_GA_MEASUREMENT_ID_CONSTATATOR`.
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

## Ce urmărim

- Comenzile cu badge „constatator” în admin, comparate cu constatatorul de pe eghiseul (2–5 pe săptămână acum).
- Reclame: cost pe comandă sub 40 de lei (echilibru) după două săptămâni, altfel oprim și ajustăm.
- Organic: indexare în săptămâna 1–2, afișări pe „certificat constatator online” în săptămânile 3–6.
