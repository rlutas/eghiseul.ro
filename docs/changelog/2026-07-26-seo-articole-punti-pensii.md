# SEO servicii: două articole noi, fix canibalizare constatator, punți pensii

**Data:** 2026-07-26
**Context:** [analiza organică servicii](../seo/2026-07-26-analiza-organic-servicii.md)

## De ce

Comenzile sunt slabe deși traficul e mare, pentru că traficul stă pe calculatoare gratuite
(62% din clicuri) iar intențiile comerciale cele mai căutate nu aveau pagina potrivită.
Din GSC (export 20 iulie, ultimele 3 luni), intenții mari cu CTR sub 1%:

| Intenție | Expuneri | CTR | Poziție |
|---|---|---|---|
| ghiseul.ro cazier | 22.016 | 0,91% | 5,17 |
| certificat constatator online | 17.884 | 0,56% | 6,67 |
| certificat constatator | 17.000 | 0,42% | 6,58 |
| cazier judiciar online gratuit | 15.793 | 4,47% | 6,88 |
| certificat constatator onrc | 4.953 | 0,28% | 8,97 |
| localizare teren dupa numar cadastral | 6.222 | 0,21% | 6,43 |

## Ce s-a livrat

### 1. Punți pensii → stare civilă (`calculator-layout.tsx`)
Calculatoarele de pensie (~32.000 clicuri/3 luni: `varsta-pensionare`, `pensie-invaliditate`,
`estimare-pensie`, `impozit-pensie`) cădeau pe setul DEFAULT (cazier / extras CF / constatator),
irelevant pentru publicul lor. Acum trimit către certificat de naștere, certificat de căsătorie și
extras multilingv — actele cerute la dosarul de pensie, și serviciile cu cea mai mare valoare pe
comandă (938–1.279 RON). Același set adăugat în `/tabel-varsta-pensionare-anticipata-femei/`
(7.656 clicuri), care avea un singur link, către alt articol.

### 2. Articol nou: `/cazier-judiciar-online-gratuit/`
Acoperă intenția „ruta oficială gratuită" (≈50.000 expuneri cumulate). Explică onest cum se scoate
gratuit prin ghiseul.ro (validare cu card 3D Secure emis în România) și HUB MAI (o prezență fizică
la poliție), apoi cele șase situații în care ruta gratuită nu se aplică: firmă, cetățean străin,
plecat fără card românesc, nevoie de exemplar pe hârtie (printul nu are valoare legală), cerere
pentru altcineva, înscrieri în cazier.
Surse: DGPMB (condiții identificare + valoarea juridică a certificatului electronic), HUB servicii
MAI (fișa PJ: depunere fizică, Anexa 35 la HG 345/2010, 3 zile lucrătoare, valabilitate 6 luni),
Legea 290/2004.

### 3. Articol nou: `/certificat-de-nastere-din-strainatate/`
Segmentul diaspora, unde ruta gratuită chiar nu există. Decizia duplicat vs. extras multilingv,
lista statelor părți la Convenția nr. 16 de la Viena (1976; România — Legea 65/2012, în vigoare
24.08.2012; art. 8 alin. 2 scutește de apostilă), capcana procurii generale vs. speciale, ordinea
corectă duplicat → apostilă → traducere.

### 4. Fix canibalizare constatator (`cele-4-tipuri-de-certificat-constatator-online`)
Articolul rankează în locul paginii de serviciu (aceea e la poz. 13,38 cu 15.779 expuneri).
NU s-a creat un al treilea articol pe constatator — s-a întărit cel care rankează:
intro răspuns-întâi, secțiune nouă „Direct de la ONRC (InfoCert) sau printr-un intermediar" cu
tabel comparativ onest (InfoCert 30 lei, Ordin MJ 380/C/2024, cont pe portal, plată doar card) și
CTA către pagina de serviciu.

### 5. Optimizare `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/`
Titlu, descriere și intro rescrise răspuns-întâi; secțiune nouă „Cum localizezi terenul după
numărul cadastral" (geoportal ANCPI, ce vezi și ce nu vezi acolo, ce faci când numărul e vechi) +
2 FAQ noi. Pagina avea 2.998 clicuri dar rata clicul pe query-ul de localizare.

### 6. Imagini featured proprii
Generate și adăugate: `cazier-judiciar-online-gratuit.webp` (57 KB) și
`certificat-de-nastere-din-strainatate.webp` (66 KB), ambele 1200×675, WebP q82, cu alt text
descriptiv. Override-urile temporare au fost scoase — articolele își iau imaginea prin convenția
de slug, ca restul blogului.

## Indexare

Ambele slug-uri sunt în `HARDCODED_ARTICLE_SLUGS` (`lib/seo/constants.ts`), sursa pentru
`app/sitemap.ts`, deci intră automat în `/sitemap.xml`. Sunt și în `config/articles.ts`, deci apar
în arhiva `/blog/` (linkuri interne, nu rămân pagini orfane).

## De făcut

- [ ] Export GSC nou după 2 săptămâni, pentru măsurarea efectului.
- [ ] Partea a doua a fixului de canibalizare: pagina de serviciu constatator (poz. 13,38 la
      15.779 expuneri) trebuie să preia intenția comercială.
