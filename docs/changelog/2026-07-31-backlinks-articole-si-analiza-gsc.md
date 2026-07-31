# 2026-07-31 — Pachet backlinks: analiză GSC + 6 articole scrise și trimise

## Context

Pachetul de 6 publicații negociat pe 29 iul ([analiza](../seo/2026-07-29-analiza-oferte-backlinks.md))
a fost CUMPĂRAT azi de Raul: click.ro, economica.net, money.ro, risco.ro, start-up.ro,
startupcafe.ro. Sesiunea de azi: poziții reale din GSC → plan de direcționare → scrierea
celor 6 articole → DOCX → trimise spre publicare.

## 1. Analiza pozițiilor (GSC live, 28 zile, cont authuser=1)

Detalii complete în [planul articolelor](../seo/2026-07-31-articole-backlinks-plan.md). Esența:

- **Extras CF serviciu: 10,8** (era 13,6) — la un pas de pagina 1, ținta principală.
- **Constatator serviciu: 17,5, CĂZUT de la 13,4** — articolul „cele-4-tipuri" rankează
  pe 6,5 în locul lui (canibalizarea s-a agravat) → toate linkurile constatator merg pe
  pagina de SERVICIU.
- Stare civilă (2,4–2,8) și cazier fiscal (6,6) stau bine singure.
- Urbanism: mort organic (poz. 17–50, 0 clicuri) — primește totuși 1 link (money.ro),
  pagină de 780 lei/comandă.

Export GSC complet (3 luni) salvat: `../seo/gsc-data/https___eghiseul.ro_-Performance-on-Search-2026-07-31/`.

**Bonus descoperire — serviciile topograf (migrarea 084):** 13/14 pagini au deja trafic
organic fără niciun link (identificare-imobile-proprietar poz. 5,8), dar în DB: 24 ciorne
+ 1 singură plată. Blocker = conversia (prețuri placeholder „pending Mircea"), NU SEO-ul.

## 2. Cele 6 articole — scrise, verificate, DOCX

`../seo/articole-backlinks/01..06-*.md` + `docx/` pentru upload. Fiecare cu instrucțiuni
de publicare în antet. Verificat automat pe toate: număr exact de linkuri dofollow
(3/3/2/2/3/2), FĂRĂ brand pe click+startupcafe (articole SEO), fără link în primul
paragraf, zero perechi „acte/documente + oficiale" (politica Ads), diacritice, pass
humanizer (inclusiv scos un citat fictiv), 810–930 cuvinte.

Direcționare finală (v2, la cererea Raul — serviciile-vedetă toate acoperite):
naștere (click), cazier judiciar (click), cazier fiscal (risco), CF (economica+money),
constatator serviciu ×3 (startupcafe+start-up+risco), urbanism (money — cu secțiune nouă
„teren: construibil sau pășune scumpă?" documentată de pe pagina noastră de serviciu).
O singură ancoră comercială din 14 linkuri („certificat constatator online", start-up.ro).

Prompturi imagini ChatGPT/DALL-E + alt text per articol: `../seo/articole-backlinks/00-imagini-prompturi.md`.

## 3. Incident la trimitere + plan B pregătit

Raul a urcat din greșeală articolul CF/ANCPI (destinat economica.net) pe **click.ro**,
care nu acceptă brand și permite doar 2 linkuri → probabil respins/suprataxat. Pregătite
ambele ieșiri: `01B-varianta-click-ro` (CF/ANCPI fără brand, 2 linkuri) și
`06B-varianta-economica-net` („acte de acasă" cu brand + 3 linkuri), ambele și în DOCX.
Un fix de upload pe parcurs: platforma refuza `04-start-up-ro.docx` → copii `startup.docx`
+ `startup.doc` (fișierul era valid; suspect numele/formatul).

## 3b. Widgetul ANCPI embed — adăugat în livrare (sesizat de Raul)

Widgetul `/embed/ancpi/` (construit 29 iul pentru redacții) intră în articolul CF/ANCPI:
cod de embed + regulă anti-suprataxare în instrucțiunile din `01-economica-net.md` și
`01B-varianta-click-ro.md` (atribuirea de sub widget ÎNLOCUIEȘTE linkul din text, ca să
nu depășim limita de linkuri; varianta 01B are atribuire FĂRĂ brand). DOCX-urile
regenerate cu notă de plasare pentru redacție. La articolele deja trimise widgetul nu
avea loc tematic (doar CF/ANCPI îl justifică).

## 3c. Sesiunea de seară: GSC health + goluri de conținut + refresh amendă rovinietă

- **Sitemap-ul vechi WP șters din GSC** (sitemap_index.xml, eșuat din iun 2025); rămâne
  sitemap.xml (183 pagini, Succes).
- **Indexare sănătoasă**: 188 indexate vs 183 sitemap; cele 869 „crawled-not-indexed"
  = chunk-uri `/_next/static/` (zgomot Vercel, nu pagini) — NU se blochează în robots.
- **Trafic**: 2.096 cl/zi (+3,4%), afișări +16% — platou stabil.
- **Goluri de conținut** (doc nou `../seo/2026-07-31-goluri-continut-si-calculatoare.md`,
  CORECTAT după verificare contra site-ului): ICC și amendă rovinietă EXISTAU și
  performau (ICC top 5 site!); goluri reale doar apostilă/deces/succesiune/harta
  cadastrală/înființare firmă.
- **Refresh articol amendă rovinietă** (80k imp): 2025→2026 cu fact-check pe surse —
  amenzi neschimbate (OG 23/2025), prețuri plate confirmate pe vânzător live (tarifele
  pe norma EURO din presă = PROIECT neintrat în vigoare!), adăugate 30/60 zile,
  secțiune nouă despre proiectul EURO. Tool + pagina serviciu aveau prețuri corecte.
- **Verdicte „3 chestii"**: constatator on-page complet (lipseau doar linkuri externe —
  trimise azi); urbanism = pagină de 10 zile, răbdare; topograf = blocaj la PLATĂ
  (funnel 8% vs 26% la geamănul vechi, `billing.isValid=false` pe toate ciornele) —
  urmează test live de wizard.

## 3d. Sesiunea de noapte: execuția planului de conținut (punctele 1–4)

1. **Calculator ICC** (top 5 pe site, 127k imp) — secțiuni noi pentru intenția
   informațională pe care n-o prindea („concediu crestere copil" poz. 11): eligibilitate
   + cele 2 luni netransferabile ale celuilalt părinte + actele pentru dosarul AJPIS,
   cu puntea-cheie spre serviciul de certificat de naștere + ghidul de înregistrare
   nou-născut + calculatorul de concediu paternal. +2 FAQ-uri.
2. **Articol NOU: apostila de la Haga** (`/apostila-de-la-haga-ghid-acte-obtinere/`) —
   gol total de acoperire deși vindem apostila ca add-on; fact-check: 3 instituții
   (prefectură/tribunal/Camera Notarilor), e-apostila hub.mai (2023), scutirile
   Regulament UE 2016/1191 + extrase multilingve, ordinea apostilă→traducere.
   Linkuri: cazier, naștere, celibat-căsătorie-străinătate, nastere-din-strainatate.
3. **Cluster ONRC — 3 ghiduri noi** (lecția dianex: lățime topică ONRC):
   `/schimbare-sediu-social-srl-ghid/`, `/suspendare-activitate-firma-ghid/`,
   `/radiere-firma-srl-ghid/` — interconectate între ele + CTA constatator/cazier fiscal.
4. **Interlinking bidirecțional**: cele 4 pagini noi primesc linkuri din
   cele-4-tipuri (articolul care rankează pe constatator), celibat-căsătorie,
   naștere-din-străinătate, cazier-gratuit. Sitemap: slugs adăugate în
   HARDCODED_ARTICLE_SLUGS + registrul last-modified (și amendă-rovinietă
   re-datată 31.07).

Prompturi imagini pentru cele 4 articole (cu persoane, per fișier .webp țintă):
`../seo/2026-07-31-prompturi-imagini-articole-noi.md`. Typecheck: 0 erori. NECOMIS încă.

Amânate explicit (Raul): ghid harta cadastrală + testul de plată pe wizard topograf.

## 3e. Finalizare: imagini generate + homepage + LIVE

- Raul a generat cele 4 imagini cu ChatGPT (din prompturile pregătite); convertite la
  webp 1600×900 (58–90 KB) și puse în `public/images/articole/` pe numele exacte
  referențiate de pagini.
- Articolele noi adăugate în `src/config/articles.ts` (manifestul /blog + homepage) —
  homepage-ul afișează acum primele 3: apostilă, schimbare sediu, suspendare.
- **Commit + push: `5489675`** (pachetul întreg: 49 fișiere — articole, imagini,
  refresh amendă, ICC, interlinking, sitemap, toate docs + articolele backlinks cu
  DOCX-uri) **+ `b0f6738`** (homepage manifest). Typecheck 0 erori pe ambele.
  Deploy Vercel automat din push.

## 4. Status la finalul zilei

- **Trimise spre publicare: 5** (click — cu articolul greșit, în clarificare cu Cristina —
  money, risco, start-up, startupcafe). **economica.net: în așteptare** până se rezolvă
  mutarea articolului CF/ANCPI de pe click.
- **Pe site, LIVE (după deploy): 4 articole noi + refresh amendă + secțiuni ICC**,
  toate cu imagini, sitemap și interlinking la zi.
- Urmează: (1) linkurile de publicare de la Raul → verificare per articol (dofollow real
  în sursă, secțiune indexabilă, articol nemarcat „publicitate" unde s-a plătit așa);
  (2) imaginile pentru cele 6 advertoriale (prompturi în `articole-backlinks/00-imagini-prompturi.md`);
  (3) snapshot poziții T+2/T+4/T+8 după calendarul din plan §7 („extras carte funciara"
  13,7 head / 10,8 pagină; constatator serviciu 17,5);
  (4) valul 2 conținut: restul clusterului ONRC (denumire/CAEN/cesiune), pilot OCPI
  5 județe, harta cadastrală, succesiune/deces;
  (5) test plată wizard topograf (blocajul de conversie 8% vs 26%).
