# 2026-07-28 — Audit SEO pe date reale + primul val de fixuri

Instalat `claude-seo` v2.2.4 și configurat pe **date reale de la Google** (Search Console API, CrUX, PageSpeed) — până acum analiza se făcea pe exporturi manuale. Setarea completă: [`docs/seo/TOOLING-claude-seo.md`](../seo/TOOLING-claude-seo.md).

Audit complet cu 7 audituri specializate + verificări proprii: [`docs/seo/audit-2026-07-28/`](../seo/audit-2026-07-28/). **Scor: 69/100.**

---

## Fixuri livrate

### 1. 40 de pagini-oraș scoase din index (măsurat, nu presupus)

`gsc_inspect.py` pe **toate cele 48** de pagini `/servicii/cazier-judiciar-online/{oraș}/`:

| Stare | Nr. |
|---|---|
| Indexate | **8** |
| Discovered — currently not indexed | 22 |
| URL is unknown to Google (necrawlate) | 18 |

Corelație perfectă: exact cele 8 indexate sunt singurele cu afișări în GSC. **Bucureștiul n-a fost crawlat niciodată**, deși e în sitemap și întoarce 200.

Cauza: 1650-1770 de cuvinte per pagină, diferență de 1-2 paragrafe între orașe → Google le tratează ca doorway pages. Contra-exemplu în același site: paginile de județ pentru extras CF au **mai puțin** text (~1130-1340) și sunt indexate 94%, pentru că un județ are date proprii reale (birou OCPI, tarife, termene).

Cele 40 fără indexare primesc `noindex, follow` (`INDEXABLE_CITY_SLUGS` în `src/lib/seo/locations/index.ts`) și ies din sitemap: 222 → **182 URL-uri**. Rămân accesibile omului și pasează link equity, dar nu mai diluează calitatea domeniului cu conținut pe care Google l-a refuzat deja. Criteriul de promovare e documentat în cod.

### 2. H1 rupt pe 30 de pagini de servicii — sintagma-țintă lipsea din text

Pe pagina construită pentru „cazier judiciar online", H1-ul se randa **„Cazier JudiciarOnline"** — fără spațiu. JSX înghite spațiul dintre un text și un `<span className="block">` pe linia următoare, iar layoutul arată corect (span-ul e `block`), deci defectul era invizibil ochiului dar real pentru orice parser.

Efect: pagina comercială nu conținea sintagma exactă în H1, în timp ce homepage-ul o avea curat („Cazier Judiciar și Documente Online") — probabil o parte din explicația pentru care **Google servea homepage-ul** pe interogarea comercială (19.243 afișări homepage vs 495 pagina de serviciu, raport 39:1).

Verificat pe live înainte de fix: „Cazier JudiciarOnline", „Extras de Carte FunciarăOnline", „Certificat de NaștereDuplicat", „Cazier Fiscal OnlinePersoană Fizică" ș.a. Reparat cu `{' '}` explicit în **30 de pagini**; zero pagini de articole/calculatoare afectate.

### 3. `lastmod` în sitemap, din date reale

Sitemap-ul n-avea `lastmod` pe niciun URL, deci Google n-avea semnal de prospețime — relevant exact pentru paginile care stau neindexate. Datele existau, dar erau închise în constanta `DATE_MODIFIED` din fiecare `page.tsx`.

Nou: `src/lib/seo/last-modified.ts` cu **48 de date reale** extrase din pagini + `tests/unit/lib/seo/last-modified.test.ts` (5 teste) care face CI-ul să cadă dacă registrul se desincronizează de pagini. Nu punem data build-ului: un `lastmod` care se schimbă la fiecare deploy îl învață pe Google să ignore semnalul.

### 4. Duplicat live: `/servicii/rovinieta/`

Pagina generată din slug-ul DB rula în paralel cu `/servicii/rovinieta-online/` — ambele 200, ambele auto-canonice, ambele în sitemap, prima cu titlul **„Rovinieta Online Online"**. `rovinieta` lipsea din `DB_SLUGS_WITH_HARDCODED_PAGE`. Acum: redirect 308 + scoasă din sitemap + `serviceUrl()` trimite la pagina reală. Zero trafic pierdut (URL-ul dinamic avea 0 afișări în GSC).

### 5. Recenzii și program — o singură sursă de adevăr

Numărul de recenzii era scris de mână în **6 componente + 30 de pagini** de schema și ajunsese să difere („450" vs „400+"). Programul diferea între footer (L-V 08:00-16:00) și pagina de contact (L-J + vineri până la 15:00) — clientul care suna vineri la 15:30 nu găsea pe nimeni.

Nou: `SOCIAL_PROOF` în `src/lib/seo/constants.ts` (**457** recenzii reale, confirmate de Raul din profilul Google) — folosit de tot UI-ul și de `SERVICE_AGGREGATE_RATING` în schema. Program unificat L-V 08:00-16:00.

### 6. `llms.txt` extins pe conținutul care aduce trafic

Acoperea doar servicii + calculatoare. Lipseau **tool-ul de verificare rovinietă** (11.309 clicuri/lună, cea mai vizitată pagină) și toate ghidurile. Adăugat: secțiune nouă „Ghiduri și răspunsuri factuale" cu 11 articole (ANCPI status, cazier gratuit, taxe, pensionare, diaspora) + 3 instrumente. Reformulat și intro-ul ca să nu asocieze „oficial" cu „documente" (politica Google Ads care ne-a limitat contul).

### 7. Diverse

- `address` + `email` în `organizationNode()` — existau doar pe homepage, deși nodul se folosește pe `/contact/` și pe toate paginile de servicii.
- Scos `Host:` din robots.txt (sintaxă depreciată, emisă greșit cu schemă).
- `prefetch={false}` pe linkurile de footer (desktop transfera 2-3× mai multe request-uri decât mobil — prefetch agresiv pe viewport lat).
- Link intern nou de la articolul de cazier auto către pagina de cazier judiciar + corectat descrierea care spunea greșit „istoricul vehiculului" (cazierul auto e fișa conducătorului).

### 8. TTFB: middleware-ul de sesiune rula pe fiecare pagină publică

`src/proxy.ts` avea matcher „tot ce nu e asset static", deci `updateSession()` — care apelează
`supabase.auth.getUser()` — rula la **fiecare cerere**: homepage, 40+ calculatoare, articole,
`/servicii/*`, `sitemap.xml`, `llms.txt`. Muncă de autentificare pe ~toate cele 54.000 de vizite
organice lunare, cu rezultatul aruncat — paginile publice nu citesc niciodată sesiunea.

⚠️ De ce n-a găsit-o auditul: **Next 16 a redenumit `middleware.ts` în `proxy.ts`**, iar căutarea
inițială după `middleware.ts` n-a întors nimic, așa că raportul a marcat cauza „neverificată".

Matcher restrâns la zonele cu sesiune: `/admin`, `/account`, `/kyc`, `/orders`, `/auth`,
`/colaborator`, `/comanda`, `/completare`, `/reincarca-poza`, `/api`. (`/api` rămâne: wizardul salvează
draft-uri des și are nevoie de token proaspăt.)

Măsurat pe producție, mediana din 5 cereri după încălzire:

| Pagină | Înainte | După | |
|---|---|---|---|
| Homepage | 237 ms | 180 ms | −24% |
| `/contact/` | 233 ms | 179 ms | −23% |
| `/servicii/cazier-judiciar-online/` | 207 ms | 177 ms | −15% |
| `/calculator/varsta-pensionare/` | 198 ms | 175 ms | −12% |

Măsurătorile sunt dintr-un singur punct, cu zgomot vizibil (min-max 0,09–0,58 s); cifra care
contează rămâne CrUX-ul, de re-verificat peste ~3 săptămâni (baseline 266 ms).

Verificat că nu s-a rupt autentificarea: `/account/` → 307 către login, `/admin` protejat,
`/comanda/` și homepage 200.

**CSS render-blocking — testat și respins.** `experimental.optimizeCss` construiește fără eroare dar
**nu inline-uiește nimic** (0 taguri `<style>` în HTML-ul generat) — flag fără efect, ar cere
dependența `beasties`. CSS-ul real: 211 KB brut / **33 KB gzip**, un singur bundle. De testat pe
preview, nu pe main.

### 9. FAQ-urile randate server-side, fără JS de acordeon

`ServiceFAQ` (33 de pagini + toate articolele) și `FAQSection` (homepage) erau componente client cu
`useState`. Problema reală, descoperită la măsurare: FAQ-ul de pe homepage randa răspunsul **doar când
era deschis** (`{open && ...}`), deci **11 din 12 răspunsuri nu existau deloc în HTML-ul livrat** —
Google le vede (execută JS), crawlerele AI nu.

Acum `<details>` + `<summary>` randate pe server, cu `name` pentru acordeon exclusiv **nativ** (zero JS).
Aspect identic: chevron rotit, bordură aurie pe elementul deschis, aceleași tranziții.

Verificat în browser pe build de producție: 15 `<details>` pe homepage / 20 pe pagina de cazier, unul
singur deschis, click-ul îl închide pe precedent, `rotate: 180deg` după tranziție, bordură
`rgb(243, 210, 102)`, iar codul de acordeon a dispărut din bundle-urile client (0 chunk-uri).

⚠️ Capcană evitată: prima versiune construia clasa dinamic (`open:${theme.openBorder}`), pe care
Tailwind NU o compilează — exact ce avertiza un comentariu existent în fișier. Înlocuit cu literali
`openBorderVariant` per temă.

**Onest despre efect:** NU reduce greutatea paginii, cum estimasem („~11 KB per pagină") — payload-ul
RSC serializează și arborele randat pe server. Câștigul real: toate răspunsurile ajung în HTML (pentru
AI) și dispare JS-ul de acordeon.

---

## Corecții la propriile constatări intermediare

Trei afirmații din audit s-au dovedit greșite la verificare și sunt corectate în rapoarte:

1. **„Imaginea LCP n-are `fetchpriority`"** — falsă. LCP-ul e **text** (h1), nu imagine; `fetchpriority` n-ar avea niciun efect. Blocajele reale: CSS render-blocking 751 ms + JS neutilizat 450 ms.
2. **„`aggregateRating` e hardcodat fără sursă → risc de spam"** — cifrele sunt **recenzii Google reale**, doar copiate manual. Rămân, prin decizia proprietarului; acum se actualizează dintr-un singur loc.
3. **„Tool-ul de rovinietă nu e randat server-side"** — parțial fals. E un **iframe terț** (erovinieta.net), deci nu poate fi randat de noi; conținutul editorial și JSON-LD-ul SUNT în HTML. Bailout-ul din HTML vine de la un widget client-only, nu de la conținut.

Iar banner-ul de cookie-uri, acuzat pentru CLS, e deja `position: fixed` — nu împinge layout. Cauza CLS-ului rămâne neidentificată.

---

## Rămas deschis

- **Canibalizare** (#2 din plan): fixul de H1 e o parte; dacă în 3-4 săptămâni homepage-ul rămâne pagina servită pe „cazier judiciar online", următorul pas e de-optimizarea deliberată a homepage-ului — decizie cu risc pe 345 clicuri/lună.
- **E-E-A-T**: pagina `/despre-noi/` cu echipa și avocatul nominalizat — o face Raul.
- **CSS render-blocking**: `experimental.optimizeCss` cere `critters`, dependență nouă cu risc de stiluri rupte. De testat pe preview, nu direct pe main.
- **TTFB +19,9%** în 6 luni — cauza neidentificată (`middleware.ts` / ISR neverificate).
- Imagini, backlink-uri, profil GBP (Google blochează citirea automată) — neauditate.

## Verificare

`tsc` curat · **1.332 teste** trec · build verde · sitemap diff-uit înainte/după (singurele schimbări: −1 duplicat, −40 orașe noindex, +48 `lastmod`) · `noindex, follow` confirmat în HTML-ul generat pentru București, `index, follow` pentru Cluj-Napoca.
