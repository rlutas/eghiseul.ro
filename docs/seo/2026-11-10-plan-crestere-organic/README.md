# Plan de creștere organic, noiembrie 2026 – februarie 2027

Data: 10.11.2026. Acoperă: cazierjudiciaronline.com (CJO), eghiseul.ro, documentero.ro, ecazier.ro.

Sursele de date:
- GSC pe 16 luni;
- GA4 pe 90 de zile, comparat cu anul trecut;
- comenzile din cele două baze;
- Bing Webmaster;
- crawl live CJO (75 + 15 URL-uri);
- rezultate Google reale verificate de mână (`&pws=0`);
- tot ce s-a scris în `docs/seo/` din iulie încoace.

Anexele sunt în dosarul acesta. Cifrele de vânzări pe pagină rămân în afara repo-ului public; aici sunt doar ponderi.

---

## Pe scurt

1. **CJO e prioritatea.** Comenzile CJO au scăzut de la ~110 pe lună (iun–sep) la 53 în octombrie. Clicurile organice săptămânale au scăzut cu 79% față de săptămâna 21.09. CJO aduce 71% din venitul organic urmărit în GA4 pe CJO și are cea mai mare plasă de pagini care încă rankează.
2. **Pe CJO, ce s-a pierdut ține de poziție, nu de titluri.**
   - 81% din clicurile pierdute vin din cele 39 de pagini de oraș: poziția a coborât de pe 1–2 pe 3–6, la afișări egale.
   - Pe „cazier judiciar online”, poziția reală e 14 (pagina 2), nu 7 cât arată media GSC.
3. **CJO are 3 defecte tehnice care se repară fără risc**, chiar săptămâna asta:
   - orice adresă `/cazier-judiciar-online/<orice>` dă o pagină indexabilă, adică spațiu de doorway nelimitat;
   - meniurile „Servicii” și „Orașe” nu există în HTML, deci paginile de serviciu au 0 linkuri din meniu;
   - 19 URL-uri concurează pe „cazier judiciar online”.
4. **Eghiseul e filtrat, nu doar retrogradat.** Afișările au scăzut cu 97% la poziție medie egală sau mai bună; `/servicii/` a ajuns de la 129.586 la 2.536 de afișări pe 28 de zile. Nu se repară cu pagini noi (decizie în vigoare). Se repară lent: rescrierea paginilor de bani, câte 1–2 pe săptămână, și linkuri interne.
5. **Paginile informaționale bune nu vând.** `/cerere-cazier-judiciar-model` (locul 2) și `/ghid-reabilitare-cazier` (locul 1) au peste 2.100 de sesiuni și 0 vânzări. Le lipsește drumul spre comandă.
6. **Nu facem site nou și nu cumpărăm linkuri.**
   - Pachetul cumpărat pe 31.07 nu a apărat paginile țintă.
   - Documentero (2 luni) are 76 de clicuri pe lună.
   - Un al cincilea domeniu ar fi un argument în plus pentru un filtru de rețea de site-uri.
7. **Bing e singurul canal care crește:** +25% pe eghiseul în 28 de zile, 22 de comenzi de pe Bing din iulie. Costă aproape nimic să-l tratăm ca pe Google.

---

## 1. Ce spun datele, pe site

### CJO

| Fapt | Sursa |
|---|---|
| 3.823 → 791 clicuri pe săptămână (21.09 → 02.11). CTR 3,99% → 1,57%, poziție 5,0 → 6,5 | Anexa 01 §1.1 |
| Paginile de oraș: 81% din clicurile pierdute (6.328 → 1.811, 21 de zile față de 21). Aduc 45% din venitul organic CJO, dar doar 0,71 lei pe sesiune, față de 7,4 lei pe home | 01 §3.1, conversii |
| „cazier iasi”: poziția 2,1 → 4,7; pe mobil CTR 2,9%, pe desktop 7,1% | 01 §3.1, §6.2 |
| Stelele din rezultatele Google: 3.847 de afișări → 0 după jumătatea lui octombrie. Ratingurile au fost scoase pentru că nu aveau sursă (regula 3). Pe 02.11 au intrat recenzii Google reale în pagină, dar fără marcaj | 01 §7, git `5c665293` |
| „cazier judiciar online”: locul 14 real. Deasupra: Hub MAI „Serviciu GRATUIT” pe 1, caziere.ro pe 3, AI Overview; reclame: infocazier, obtinecazier | Anexa 05 |
| „certificat de integritate comportamentala”: 3.224 de afișări, 4 clicuri. Real, CJO nu e în primele 16 | 01 §2.1, 05 |
| Unde CJO câștigă: reabilitare (locul 1), model cerere (2), Iași (3), angajare (4,8), după cât timp se șterge (4,1) | 05, 03 |
| Canibalizare: 123 de interogări cu 2 sau mai multe URL-uri CJO. Perechile mari: `/` cu `/cazier-judiciar-gratuit`, `/` cu `/taxa-cazier-judiciar`, `/` cu `/eliberare-cazier-judiciar-online` | 01 §5.1, 03 |
| Tehnic: canonical, redirecturi și robots sunt curate. CWV pe home: lab LCP 4,1 s pe mobil, field încă „bun” (2,32 s) dar în creștere | 03 |
| Profil de linkuri: ~63 de domenii, zero căutări pe brand | 02 |
| Înainte și după update, pe proprietatea veche (prefix URL, istoric din iulie 2025): 13.07–09.08 = 14,4k clicuri, 335k afișări, CTR 4,3%, poziție 5,2; 11.10–07.11 = 5,68k clicuri (−61%), 263k afișări (−21%), CTR 2,2%, poziție 6,0. Cele mai mari pierderi: orașele (Constanța 627 → 208, Craiova 608 → 187, Brăila 445 → 58), condiții de călătorie cu minori 490 → 56, home 489 → 167 | GSC UI, 10.11 |

### eghiseul

| Fapt | Sursa |
|---|---|
| Afișări 2,93 mil. → 91.869 (28 de zile), la poziție egală sau mai bună: filtru pe interogări comerciale | 01 §3.2 |
| 79 de pagini fără nicio afișare. Interogările de serviciu stau pe pozițiile 20–70 | 01 §4.3 |
| 76% din sesiunile organice vin pe calculatoare și aduc ~0 vânzări. Paginile `/servicii/*` au 3% din sesiuni și majoritatea venitului | conversii |
| Stare civilă: 40% din venit, 9% din comenzi, coș mediu 700–1.500 lei. Vinde din trafic mic (extras multilingv, schimbare certificat vechi) | conversii |
| Cazier fiscal: a vândut cel mai mult pe pagină în 2025; acum are 46 de sesiuni | conversii |
| Extras CF și certificat constatator: absent din primele 16. Locurile sunt luate de domenii exact-match și reclame | 05 |
| Bing: +25% clicuri în 28 de zile, cât Google a scăzut | Bing API |

### documentero

| Fapt | Sursa |
|---|---|
| 76 de clicuri pe lună. Ghidul „certificat de naștere vechi tipizat” aduce aproape jumătate | GSC |
| 0 comenzi organice; 2 comenzi în total, ambele „direct” | conversii |

### ecazier

| Fapt | Sursa |
|---|---|
| Poziții 12–25 pe paginile de bani; on-page e curat, deci blocajul e autoritatea | 03 |
| Vânzările au murit odată cu Ads (05.08): 305 comenzi mai–iul, 2 de atunci | conversii |

---

## 2. Constrângeri (nu se negociază)

Din `.claude/rules/content-and-seo.md` și din deciziile luate până acum (anexa 02):

- **Ritm:** maximum 1–2 pagini noi sau rescrise pe săptămână, pe site.
- **Similaritate:** nicio pagină din șablon cu Jaccard mascat > 0,65 sau cu salt la mascare > +0,12.
- **Date:** zero date inventate (rating, autor, `dateModified`).
- **Eghiseul:** nicio pagină publică nouă până la semne de recuperare; conținutul nou merge pe documentero.
- **Pagini de locație:** niciuna nouă (comune, sectoare, județe) pe eghiseul, ecazier sau documentero.
- **Calculatoarele** nu se ating.
- **Formularul CJO** rămâne în primul ecran pe mobil (incidentul 05–08.10: pornirile de formular au scăzut de 3 ori).
- **Înghețat până la comparația din 17.11:** nicio schimbare în masă pe paginile de oraș CJO. Cele 4 orașe rescrise sunt testul față de rest. Nici titlurile nu se mai rescriu până atunci.
- **Formulări:** „obținem”, nu „eliberăm”. Niciodată „oficial” lângă „documente/acte”.

---

## 3. Planul

Fiecare acțiune are: de ce (observația), de ce depinde, cum știm că a eșuat și ce indicator urmărim.

### Faza 0: săptămâna 10–16.11. Tehnic CJO, fără risc de conținut

Nu atinge textul paginilor de oraș, deci nu strică testul din 17.11.

| # | Acțiune | De ce | Fișier | Eșec dacă | Indicator |
|---|---|---|---|---|---|
| 0.1 | 404 pentru orice slug de oraș care nu e în listă (`dynamicParams = false` / `notFound()`) | `/cazier-judiciar-online/xyzabc` dă 200, indexabil, cu canonical către sine: exact tiparul pedepsit de spam update | `src/app/cazier-judiciar-online/[city]/page.tsx` | un slug inventat mai dă 200 | `curl` pe 3 sluguri inventate → 404 |
| 0.2 | Meniurile „Servicii” și „Orașe” randate pe server (ascunse cu CSS, nu montate la click) | paginile de serviciu au 0 linkuri din meniu; e aceeași greșeală ca `ServiceSwitcher` pe eghiseul (regula 5) | `src/components/shared/Header.tsx` | HTML-ul fără JS nu conține linkurile | numărul de linkuri spre paginile de serviciu în crawl; poziția `/cazier-fiscal-online`, `/cazier-auto-online`, `/certificat-integritate-comportamentala` în 3–4 săptămâni |
| 0.3 | 301 de pe URL-ul vechi Oradea spre `/cazier-judiciar-online/oradea` | URL-ul are afișări pe poziția 1 și dă 404 (regula 6) | `next.config.ts` | — | 301 live |
| 0.4 | `noindex` pe `/multumim` și `/status-comanda`; scoase din sitemap | pagini fără valoare în index | `src/app/multumim`, `status-comanda`, `sitemap.ts` | — | — |
| 0.5 | Spațiu între segmentele H1 (`{" "}`) | 24 de H1-uri lipite în text („onlineprin”); crawlerele AI fără JS citesc greșit | `HeroSection.tsx` + hero-ul de articol | — | — |
| 0.6 | `dateModified` real pe pagină, nu bump global | 63 din 75 de pagini au 02.11 pentru o schimbare de preț făcută pe 4 (regula 3) | `src/config/page-dates.ts` | — | — |
| 0.7 | Linkuri contextuale spre paginile informaționale bune care au doar 1–3 linkuri primite | `/conditii-de-calatorie-cu-minori` are 8,1k afișări și 1 link; fiscal pentru străini, verificare fiscal și angajare au 1–3 | corpul paginilor + un bloc „Ghiduri legate” | — | poziția acestor pagini în 3–4 săptămâni |

**Stare 10.11: livrată** (commit CJO `cd76eb27`), fără 0.6: datele de 02.11 corespund unor corecturi reale de text, verificate în git. Detalii: [changelog](../../changelog/2026-11-10-cjo-faza-0-seo-tehnic.md).

Riscul fazei: zero pe conținut. 0.2 schimbă HTML-ul header-ului: de verificat vizual pe mobil că meniul arată la fel.

### Faza 1: 17.11 – 07.12. Paginile de bani CJO și canibalizarea

Depinde de verdictul din 17.11. Dacă cele 4 orașe rescrise (Iași, Brașov, Timișoara, Constanța) au ținut mai bine decât restul, metoda lor se extinde, câte 2 orașe pe săptămână, începând cu cele care vând (Galați, Cluj, București). Dacă nu, orașele rămân cum sunt și efortul merge pe punctele de mai jos.

| # | Acțiune | De ce | Eșec dacă | Indicator |
|---|---|---|---|---|
| 1.1 | Rescrie home pentru „cazier judiciar online”. Primul rând răspunde „de ce plătesc dacă la MAI e gratuit”: fără cont ROeID, fără programare, document pe hârtie cu apostilă și livrare. Titlul spune beneficiul principal, nu „hârtie, apostilă, diaspora” | locul 14 real; caziere.ro e pe 3 cu un titlu de beneficiu | poziția reală rămâne peste 10 după 4 săptămâni | poziția reală săptămânal (`&pws=0`), CTR home |
| 1.2 | Separă intenția pe `/eliberare-cazier-judiciar-online`: procedură, termene, ghișeu față de online. Fără H1 „Eliberare Cazier Judiciar Online” | 499 de afișări, 0 clicuri pe interogarea home-ului | — | numărul de URL-uri cu afișări pe „cazier judiciar online” (acum 19) |
| 1.3 | Certificat de integritate: pagina răspunde întâi la „ce este și de unde îl scoți” (gratuit la MAI / prin noi), prețul mai jos; diacritice în H1; titlu fără „· 198 lei” | CJO lipsește din primele 16 pe o interogare cu 3,2k afișări pe lună; doar reclama infocazier e prezentă | rămâne în afara top 10 după 6 săptămâni | poziția reală |
| 1.4 | `/cazier-judiciar-gratuit` răspunde și la „ghiseul.ro cazier”: ce face ghiseul.ro (plata taxelor, nu cazierul). De verificat afirmația „programare prin ghiseul.ro” | 4,8k afișări, CTR 0,5% | — | CTR pe clusterul ghiseul |
| 1.5 | Drum spre comandă pe paginile informaționale care rankează: o casetă „Nu vrei să mergi la ghișeu? Îl obținem noi”, cu preț și termen, pe model cerere, reabilitare, după cât timp se șterge, valabilitate, angajare | ~2.100 de sesiuni, 0 vânzări pe primele două | 0 comenzi din aceste pagini după 4 săptămâni | `begin_checkout` cu `landing` pe aceste pagini (atribuirea CJO există din 06.10) |
| 1.6 | Recenzii Google reale ca marcaj, doar unde se poate cinstit: Review sau aggregateRating pe `Service`/`Product`, cu recenziile vizibile în pagină și sursa curentă | stelele au dispărut (3,8k afișări → 0); scoaterea a fost corectă, dar acum avem recenzii reale | Google nu reafișează stelele în 4 săptămâni → nu insistăm | `REVIEW_SNIPPET` în GSC |

**Stare 10.11:** 1.5 livrat (CJO `d6426af0`). 1.6 **anulat**: ghidul Google interzice recenziile agregate de pe alt site și pe cele „self-serving” despre firmă, iar `Service` nu e eligibil. Detalii în [changelog](../../changelog/2026-11-10-cjo-faza-1-caseta-comanda.md). 1.1–1.4 schimbă titluri, deci pornesc după 17.11, câte 2 pe săptămână.

Regula de ritm: 1.1–1.4 sunt 4 pagini rescrise, deci se fac pe 2 săptămâni. 1.5 e o componentă, nu un text nou.

### Faza 2: decembrie – ianuarie. Eghiseul, paginile de bani, câte una pe săptămână

Ordinea vine din venit, nu din trafic:

1. `/servicii/cazier-fiscal-online/`: cel mai vândut pe pagină în 2025, acum aproape fără trafic;
2. stare civilă: duplicat certificat de naștere și căsătorie, extras multilingv, schimbare certificat vechi (coș mediu 700–1.500 lei; eghiseul e încă pe 1 pe „duplicat certificat de naștere online”, deci nu facem 301 spre documentero);
3. cazier judiciar și integritate pe eghiseul;
4. extras CF și certificat constatator, la sfârșit: piață plină de exact-match și reclame, iar eghiseul nu e în primele 16.

Pentru fiecare pagină:
- „Pe scurt” cu răspunsul și prețul în primul ecran;
- date proprii: termene reale din comenzi, întrebări reale de la clienți;
- linkuri din ghidurile care încă rankează (eghiseul are interogări informaționale pe pozițiile 1–3);
- similaritate măsurată față de paginile surori înainte de publicare.

Eșec: dacă după 8 săptămâni `/servicii/` nu urcă în afișări, filtrul e pe domeniu, nu pe pagină. Atunci efortul se mută pe documentero și CJO, iar eghiseul rămâne pe trafic direct, email și Bing.

Indicator: afișările săptămânale pe `/servicii/` (anexa 01 §1.2). Primul semn de recuperare sunt afișările, nu clicurile (regula 8).

### Faza 2b, în paralel: documentero, un ghid pe săptămână

- Tiparul care merge: întrebări concrete despre acte (certificat vechi tipizat, valabilitate celibat).
- Ordinea, după datele GSC: schimbare certificat de naștere vechi în tip nou; anexa 18 stare civilă; certificat de naștere pierdut (acum pe locul 13,5); celibat online.
- Fiecare ghid primește link din pagina eghiseul de stare civilă potrivită.
- Fiecare ghid are drum spre comandă: documentero are 0 comenzi organice.
- Lipsește evenimentul `purchase` în GA4 pe documentero; se adaugă.

### Faza 3: off-page, fără linkuri cumpărate

| # | Acțiune | De ce |
|---|---|---|
| 3.1 | Trimite cererile `rel="sponsored"` pentru linkurile plătite ale CJO (Antena 3 ×2, ProTV, infocons): redactate, netrimise | linkuri plătite fără marcaj sunt risc de spam pe linkuri |
| 3.2 | Comunicat cu date proprii agregate din comenzi (ex. „cât durează un cazier în fiecare județ”) | singura sursă de linkuri editoriale câștigate; CJO are 0 căutări pe brand |
| 3.3 | ~~Profil de companie Google nou~~ — nu facem altul. Folosim profilul eGhișeul existent ca sursă a recenziilor (decizia din 10.11) | stelele de la 1.6 au nevoie de o sursă curentă și verificabilă; o avem deja |

### Faza 4, continuu: Bing

Bing IndexNow e deja pe ambele repo-uri. Bing urmărit lunar în raportul `monitor-lunar.py` (din 10.11). Microsoft Ads interzice categoria la fel ca Google, deci nu cumpărăm trafic de acolo.

---

## 4. Ce NU facem și de ce

| Nu | De ce |
|---|---|
| Site nou legat de eghiseul | documentero are 2 luni și 76 de clicuri; un domeniu nou are nevoie de 6–12 luni; mai multe site-uri cu același proprietar și aceeași ofertă sunt semnalul pe care spam update-ul îl caută |
| Linkuri cumpărate | pachetul din 31.07 nu a mișcat paginile țintă (extras CF 7,8 → 22,3, constatator 14,3 → 21,2) |
| Pagini noi de oraș sau comună | regula 1 + corolarul: cazierul se emite la nivel de IPJ județean |
| Optimizare de trafic pe calculatoare | 76% din sesiuni, ~0 vânzări |
| Ștergerea paginilor de oraș CJO | vând 45% din organicul CJO; trec pragul dur (mascat ≤ 0,59, salt ≤ +0,086); de reparat textul comun (formular + blocuri de preț), nu de șters |
| Rescriere masivă înainte de 17.11 | strică testul în curs |

---

## 5. Calendar de măsurare

| Când | Ce |
|---|---|
| luni, săptămânal | tabelul din `2026-11-03-cadere-mijloc-octombrie-urmarire.md` + poziția reală pe 10 interogări (anexa 05) |
| 17.11 | verdict pe orașele CJO rescrise; decide Faza 1 pentru orașe |
| 30.11 | efectul hub-ului de pe home-ul eghiseul |
| 01.12 | `monitor-lunar.py`: GSC + Bing, 4 site-uri |
| 15.12 | verdict Faza 0 (meniu server-side, 404) și 1.1–1.4 |
| 01.02.2027 | verdict Faza 2: urcă `/servicii/` pe eghiseul sau mutăm efortul |

### Jurnal de execuție și ce urmărim

**10.11.2026: livrat pe CJO**

| Ce | Commit CJO | Verificat |
|---|---|---|
| Faza 0: 404 pe orașe inventate, meniuri în HTML, 301 Oradea, `noindex` pe `/status-comanda`, spațiu în H1, 3 ghiduri în hub-ul home | `cd76eb27` | live: `xyzabc` și `cluj-napoca` dau 404; Oradea 308; `noindex, follow` pe status |
| 1.5: caseta „Îl obținem noi” pe 5 ghiduri | `d6426af0`, `7970cea3` (text) | live |
| Crawl pe tot sitemap-ul (74 URL-uri) | — | 74/74: 200, canonical către sine, un singur H1, fără H1 lipit, JSON-LD valid, nimic `noindex` în sitemap |
| URL-uri cu afișări în GSC din 01.05 care nu mai dau 200 | — | nicio pagină de oraș cu trafic n-a ajuns pe 404. Rămân 404 doar URL-uri greșite cu 0 clicuri (de ex. `/tari-pentru-need-de-apostila`), corect după regula 6 |
| Sitemap retrimis în GSC (`sc-domain` și proprietatea veche) | — | 0 erori, 0 avertismente |
| IndexNow (Bing, Yandex) pentru cele 11 URL-uri schimbate | — | 200 |
| „Solicită indexarea” în GSC: home, model cerere, reabilitare, după cât timp se șterge, valabilitate, angajare | — | confirmat în GSC, câte un mesaj pe fiecare |

GSC → Pagini (10.11): 76 indexate, 692 neindexate. Din cele 692, 636 sunt „Accesată cu crawlere – nu este indexată”, iar exemplele sunt fișiere `/_next/static/…js|css`, adică resurse, nu pagini. Nu e o problemă. Mai sunt 45 de redirecturi (corect) și 9 404.

**De urmărit, cu data și pragul de eșec:**

| Când | Ce verifici | Unde | Semnal bun | Eșec |
|---|---|---|---|---|
| 13–14.11 | cele 6 URL-uri cerute la indexare au data de crawl după 10.11 | GSC → Verificarea adresei URL | „Ultima accesare” ≥ 10.11 | — |
| 17.11 | verdictul pe orașe (Iași, Brașov, Timișoara, Constanța față de restul) | anexa 01, scriptul GSC | cele 4 au pierdut mai puțin | decide Faza 1 pentru orașe |
| 17.11 | pornesc 1.3 (integritate) și 1.4 (gratuit / ghiseul.ro), apoi 24.11 1.1 (home) și 1.2 (eliberare) | — | — | — |
| 24.11 | 404-urile noi din GSC → Pagini sunt doar orașe inventate | GSC → Pagini → 404 | doar sluguri greșite | apare un URL bun pe 404 |
| 01.12 | `begin_checkout` cu `landing` pe cele 5 ghiduri cu casetă | GA4 CJO + `orders` (atribuire din 06.10) | ≥ 1 comandă | 0 comenzi după 4 săptămâni → casetă mai sus, în primul ecran |
| 01.12 | poziția `/cazier-fiscal-online`, `/cazier-auto-online`, `/certificat-integritate-comportamentala` (efectul meniului în HTML) | `monitor-lunar.py` | urcă | stă pe loc → linkuri din conținut |
| 01.12 | cele 3 ghiduri puse în hub (minori, verificare fiscal, fiscal străini) | GSC pe pagină | poziție mai bună | — |
| săptămânal, luni | clicuri CJO pe săptămână față de 791 (02.11) | tabelul din `2026-11-03-cadere-mijloc-octombrie-urmarire.md` | ≥ 1.000 până la 15.12 | sub 791 după 15.12 |

Ce **nu** s-a făcut, intenționat: titlurile (înghețate până pe 17.11), textul paginilor de oraș (testul în curs) și marcajul de recenzii (anulat, vezi §6).

---

## 6. Decizii (luate pe 10.11)

1. **Recenziile ca marcaj (1.6): aprobat, apoi anulat pe 10.11.** Ghidul Google pentru fragmentele cu recenzii nu permite recenzii agregate de pe alt site sau despre firma care le afișează. Recenziile rămân vizibile în pagină, fără schema.
2. **Profil de companie Google (3.3): NU facem unul nou.** Sursa recenziilor rămâne profilul eGhișeul existent.
3. **Comunicatul cu date agregate (3.2): DA.** Doar termene medii pe județ, calculate din comenzi; fără nume, fără date despre clienți, fără cifre de vânzări. Faza 3.
4. **Proprietate GSC veche pentru CJO: EXISTĂ.** `https://cazierjudiciaronline.com/` (prefix URL), pe contul Google care deține CJO, are istoric din iulie 2025. Cifrele înainte/după sunt în §1, CJO. Contul claude-seo o citește prin API din 10.11: e proprietar verificat pe domeniu, deci a adăugat-o singur în lista lui (`sites.add`). Datele zilnice încep pe 01.07.2025.

---

## Anexe

- [01-gsc.md](01-gsc.md): GSC, trend, deficit de CTR, înainte/după, canibalizare, dispozitive
- [02-istoric.md](02-istoric.md): tot ce s-a făcut și decis în SEO din iulie, cu stadiul fiecărei recomandări
- [03-cjo-onpage.md](03-cjo-onpage.md): crawl CJO + ecazier, linkuri interne, similaritate pe orașe, tehnic, CWV
- [05-serp.md](05-serp.md): rezultate Google reale, 10.11.2026
- Analiza de conversii (venit pe pagină) rămâne în afara repo-ului public.
