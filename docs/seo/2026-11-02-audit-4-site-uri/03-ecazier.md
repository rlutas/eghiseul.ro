# Audit SEO ecazier.ro — 02.11.2026

**Metodă.** HTML live luat cu curl pe 16 URL-uri (sitemap + `/comanda`, `/status-comanda`). GSC prin API (`sc-domain:ecazier.ro`): Search Analytics, Sitemaps și URL Inspection pe toate cele 16. PageSpeed mobil pe `/` și `/cazier-auto`, CrUX. Codul sursă e în `cazierjudiciaronline.com/src/app/ecazier`. Read-only: nimic editat, nimic comis.
**[V]** = verificat (live, API sau cod). **[I]** = dedus.

---

## SEO Health Score: **71 / 100**

| Categorie | Pondere | Scor | Motiv |
|---|---|---|---|
| Technical SEO | 22% | 88 | 15/15 URL-uri indexate, canonical self, robots OK, HSTS. Minus: `lastmod` din sitemap nu bate cu `dateModified` |
| Content Quality | 23% | 55 | testimoniale inventate pe 3 pagini, „ONLINE10 automat” fals, termene contradictorii, fiscal subțire. Ghidurile sunt bune |
| On-Page SEO | 20% | 65 | homepage cu H1 pe judiciar canibalizează query-urile auto; fiscal stă pe 23–27 |
| Schema | 10% | 70 | fără Review (bine). Offer 198 pe fiscal fără preț vizibil; date neconsistente |
| Performance (CWV) | 10% | 95 | lab: LCP 1,1–1,2 s, TBT ≤20 ms, CLS 0. CrUX: date insuficiente |
| AI Search Readiness | 10% | 65 | crawlerele AI au acces. Lipsesc `llms.txt` (404), data vizibilă pe ghiduri și „Pe scurt” în afară de `/cazier-auto` |
| Images | 5% | 60 | zero `<img>` pe toate paginile, nicio ilustrare a documentului |

---

## Ce spune GSC [V]

**Nu există date înainte de 20.09.2026.** Proprietatea a fost creată pe 21.09 (commit `fdf420c6`); atunci erau indexate 2 URL-uri din 15. Nu se poate deci face comparația august→octombrie. ecazier **nu a pierdut trafic organic**, pentru că nu avea.

| Săptămâna (luni) | Clicuri | Impresii | Poziție medie |
|---|---|---|---|
| 21.09 | 12 | 270 | 12,9 |
| 28.09 | 8 | 325 | 14,8 |
| 05.10 | 10 | 392 | 13,5 |
| 12.10 | 7 | 474 | 12,2 |
| 19.10 | 16 | 582 | 14,7 |
| 26.10 | 14 | 620 | 10,6 |

- **Total 21.09–01.11:** 67 clicuri, 2.668 impresii, CTR 2,5%, poziție 13,0. Mobil 46 clicuri, desktop 21. România dă 93% din impresii.
- **September spam update (24.09–08.10):** impresiile au **crescut** constant (270 → 620 pe săptămână), cât timp CJO a pierdut ~80% din clicuri. ecazier nu pare lovit [V pe date; cauza I].
- **Indexare:** toate cele 15 URL-uri din sitemap sunt „Submitted and indexed”, crawl-uite între 26 și 31.10; canonicalul Google = canonicalul nostru. `/comanda` e exclusă prin noindex, intenționat.
- **Pagini, 18.10–31.10:**
  - `/`: 269 impresii, poziție 19,6, 11 clicuri
  - `/cazier-auto`: 235 impresii, poziție 12,9, 2 clicuri
  - `/cazier-fiscal`: 185 impresii, poziție **23,2**, 6 clicuri
  - `/ghid-alegere-tip-cazier`: 165 impresii, poziție 12,4
  - `/cazier-auto-uber-bolt`: 152 impresii, poziție **6,2**
  - `/cazier-auto-vs-cazier-judiciar`: 134 impresii, poziție 8,7
- **Cele mai mari creșteri** (21.09–04.10 față de 19.10–01.11, impresii):
  - „cazier auto online” → `/cazier-auto`: 7 → 40, poziție 18 → 11
  - „cazier auto”: 6 → 32
  - „cazier rutier online”: 2 → 14, poziție 24 → 11
- **Pierderi:** zero, în sens real. Doar scăderi de 3–8 impresii, pe „cazier online” (homepage 8 → 5, poziție 8 → 28) și pe query-uri fiscal.
- **Semnal de canibalizare:** homepage-ul primește impresii pe query-uri **auto** pentru care există pagină dedicată, iar acolo stă mai jos decât aceasta:

| Query | Homepage: impresii / poziție | Pagina dedicată: poziție |
|---|---|---|
| „eliberare cazier auto online” | 32 / 20,8 | `/cazier-auto` 16,9 |
| „acte cazier auto” | 22 / 24,0 | — |
| „acte necesare cazier auto” | 19 / 25,8 | `/acte-necesare-cazier-auto` 12,3 |
| „taxa cazier auto” | 11 / 28,2 | `/cazier-auto` 20,9 |

---

## Verificare: ce s-a livrat azi pe CJO (live?) [V]

| Livrare CJO | Live pe CJO? | Ajuns și pe ecazier? |
|---|---|---|
| Testimoniale inventate + schema Review scoase | **DA** (home, `/cazier-auto-online`: fără `Review`/`aggregateRating`, fără „Maria Popescu”, recenzii cu sursă Google) | **NU** (vezi C1) |
| Prețuri 198/278, fără ONLINE10 | **DA** (home, Iași: 198/278, zero „ONLINE10”) | **Parțial**: prețurile ecazier erau deja 198/278 fără auto-discount (`cabinet-*.config.ts`), dar FAQ-ul de pe `/comanda` promite încă ONLINE10 automat (C2) |
| Iași / Brașov / Timișoara „Pe scurt” + GovernmentOffice | **DA** (Iași: „Pe scurt” + `GovernmentOffice`) | n/a: ecazier nu are pagini de oraș, și bine că nu are |

Diferență între branduri: permisul străin la cazier auto costă **350 lei pe CJO** și **315 lei pe ecazier** [V]. Dacă e intenționat, e în regulă; dacă nu, trebuie aliniat.

---

## CRITICAL

### C1. Testimoniale inventate, încă live pe 3 pagini ecazier
- **Observație [V]:** blocul „Ce spun clienții noștri” are nume și citate hardcodate în cod, nu în componenta comună reparată azi pe CJO:
  - `/cazier-auto`: 3 testimoniale („Marius D.”, „Alin P.”, „Elena C.”)
  - `/cazier-fiscal`: 6 testimoniale („Andreea N.”, „Daniel S.”, „Mihaela R.”…)
  - `/comanda`: 6 testimoniale, aceleași nume ca pe fiscal, cu text schimbat

  Același set de nume apare cu povești diferite pe două pagini, deci e evident fabricat. Unele citate contrazic și termenul afișat: „a doua zi îl aveam pe email” pe fiscal, unde termenul e 1–3 zile. Nu sunt în schema (fără `Review`), dar regula 3 interzice și textul vizibil.
- **Fix:** `src/app/ecazier/cazier-auto/page.tsx:365-…`, `src/app/ecazier/cazier-fiscal/page.tsx:333-…`, `src/app/ecazier/comanda/page.tsx:208-…`. Se înlocuiesc cu aceeași `TestimonialsSection` de pe CJO (recenzii Google reale ale EDIGITALIZARE, cu sursă și link) sau se scot. **Fără** `Review`/`aggregateRating`.
- **Cum știm că a eșuat:** `curl -s https://ecazier.ro/cazier-fiscal | grep -c "Andreea N."` > 0, sau Rich Results Test arată `Review`.
- **Indicator:** niciunul rapid în GSC. Ce urmărim: impresiile pe `/cazier-fiscal` și `/cazier-auto` nu scad la următorul core/spam update.

### C2. FAQ-ul `/comanda` promite un discount care nu există
- **Observație [V]:** textul spune „Beneficiezi automat de un discount ONLINE10 (10%) pentru orice comandă online” (`src/app/ecazier/comanda/page.tsx:310`). Configul ecazier (`cabinet-judiciar.config.ts`) e 198 flat, fără auto-discount. Promisiunea e falsă, deci problemă ANPC, plus ce a cerut Raul azi: cuponul se aplică **doar celor care îl introduc**.
- **Fix:** ștergi fraza. Opțional: „Dacă ai un cod de reducere, îl introduci la pasul de plată.”
- **Cum știm că a eșuat:** `grep ONLINE10` în HTML-ul live de pe `/comanda` > 0.
- **Indicator:** n/a (conformitate, nu ranking).

---

## HIGH

### H1. Homepage-ul are H1 pe judiciar, dar Google îl trimite pe query-uri auto
- **Observație [V]:**
  - H1-ul e „Cazier Judiciar Online, fără drumuri la ghișeu.”, iar Service-ul din schema e „Obținere cazier judiciar online”.
  - Query-urile reale pe homepage sunt auto și fiscal (vezi tabelul de canibalizare), toate pe pozițiile 20–28, sub paginile dedicate.
  - Pe judiciar, homepage-ul nu prinde nimic: „cazier judiciar firma online” are 2 impresii, poziția 33.
  - Pe judiciar concurează CJO, aceeași firmă, același avocat, același preț.
- **[I]:** semnalele sunt împărțite între `/` și `/cazier-auto`. Nișa în care ecazier chiar câștigă e auto (Uber/Bolt pe poziția 6, „cazier auto vs judiciar” pe 8,7).
- **Fix (decizie de business):**
  - H1 și title pe „Cazier auto, fiscal și judiciar online”, cu auto primul.
  - Pe homepage, blocurile auto trimit spre `/cazier-auto` cu ancoră exactă: „cazier auto online”, „acte necesare cazier auto”.
  - Nu se adaugă text auto lung pe homepage, ca să nu concureze cu pagina dedicată.
  - Cod: `src/app/ecazier/page.tsx` (H1 ~linia 3xx, schema linia 99).
- **Cum știm că a eșuat:** după 3–4 săptămâni, homepage-ul încă primește >30% din impresiile pe „eliberare cazier auto online” / „acte cazier auto”.
- **Indicator:** în GSC, pe query, numărul de pagini per query scade la 1, iar poziția `/cazier-auto` pe „cazier auto online” coboară sub 10.

### H2. `/cazier-fiscal` stă pe poziția 23–27 și nu arată prețul
- **Observație [V]:**
  - Pagina are 1.105 cuvinte și doar 2 linkuri interne în `<main>`. Niciun ghid nu e despre fiscal; toate 8 sunt auto sau comparative.
  - Prețul 198 apare doar în JSON-LD (`Offer`), nu în textul vizibil. Asta încalcă ghidul de structured data, unde conținutul marcat trebuie să fie vizibil, și strică CTR-ul.
  - Pe fiscal, homepage-ul și `/cazier-fiscal` se calcă pe picioare: „cazier fiscal online” are homepage pe 24,5 și pagina pe 19,9.
- **Fix:**
  - `src/app/ecazier/cazier-fiscal/page.tsx`: un „Pe scurt” sub H1 (ANAF eliberează, 198 lei, 1–3 zile, scan + original, doar persoane fizice), ca pe `/cazier-auto`.
  - Linkuri spre `/ghid-alegere-tip-cazier`.
  - **Un singur** ghid fiscal nou, scris de mână („cazier fiscal vs certificat de atestare fiscală”, query-urile „ce este cazierul fiscal”/„de unde scot” au deja impresii), într-o săptămână fără altă pagină nouă (regula 2).
- **Cum știm că a eșuat:** poziția medie pe `/cazier-fiscal` rămâne peste 20 după 4 săptămâni.
- **Indicator:** impresii pe „cazier fiscal persoana fizica”, „de unde scot cazierul fiscal”.

### H3. Termene contradictorii pe site
- **Observație [V]:**

| Unde | Termen afișat |
|---|---|
| Homepage (meta + schema) | 1–5 zile |
| FAQ `/comanda` | „Standard: 1-4 zile” |
| Banner `/comanda` | „Livrare 1-4 zile” |
| Config + `/cazier-auto` | 3–5 zile standard, 1–2 urgent |
| `/comanda` meta | 1–5 zile |

- **Fix:** o singură sursă, din config (`pricing.*.days`), în `src/app/ecazier/page.tsx` și `src/app/ecazier/comanda/page.tsx`. Formula: „3–5 zile lucrătoare, urgent 1–2”.
- **Cum știm că a eșuat:** `grep -c "1-4 zile"` pe HTML-ul live > 0.
- **Indicator:** n/a. Câștigul e încrederea, plus AI Overview, care citează cifre coerente.

### H4. „Documente oficiale” pe tot site-ul (relevant pentru deblocarea Ads)
- **Observație [V]:**
  - H2 pe homepage: „Serviciu privat, **documente oficiale**”.
  - Footer pe toate paginile: „obținerea documentelor oficiale”.
  - `serviceType: "Asistență obținere documente oficiale"` în schema pe `/`, `/cazier-auto`, `/cazier-fiscal`.
  - Regula internă e să nu asociem „oficial” cu „documente” (politica Google Ads „Documente guvernamentale”). Ads ecazier sunt blocate din ~5 aug.
  - Nu e factor de ranking, ci blocant pentru apelul la Ads.
- **Fix:**
  - `src/app/ecazier/page.tsx:99,362`, `src/app/ecazier/cazier-auto/page.tsx:74`, `src/app/ecazier/cazier-fiscal/page.tsx:80`, `src/components/shared/Footer.tsx` (varianta ecazier).
  - Formule: „asistență pentru obținerea cazierului”, „documentul îl eliberează instituția”.
- **Cum știm că a eșuat:** `grep -i "documente oficiale\|documentelor oficiale"` pe HTML-ul live > 0.
- **Indicator:** apelul de politică în Google Ads trece.

---

## MEDIUM

### M1. Datele de actualizare nu se potrivesc între ele
- **Observație [V]:**

| Pagina | Sitemap `lastmod` | Schema `dateModified` | Dată vizibilă |
|---|---|---|---|
| Ghiduri (ex. `/valabilitate-cazier-auto`) | 2026-10-06 | 2026-09-21 | niciuna |
| `/cazier-auto` | — | 2026-10-06 | „Actualizat: 6 octombrie 2026” (singura cu dată) |

- **Fix:**
  - `src/config/sitemap-dates.ts` și `page-dates.ts`: aceeași dată reală, în trei locuri: sitemap, schema și o linie vizibilă „Actualizat: …” pe ghiduri.
  - Data se schimbă doar când se schimbă faptele (regula 3).
- **Cum știm că a eșuat:** la un nou curl, sitemap ≠ `dateModified`.
- **Indicator:** în URL Inspection, `last_crawl` pe ghiduri se apropie de data modificării.

### M2. Gol de conținut: „taxa cazier auto” și „taxa cazier pentru școala de șoferi”
- **Observație [V]:** 17 + 11 + 12 impresii în 2 săptămâni, poziții 21–28. Răspunsul ajunge pe homepage sau pe `/cazier-auto`, unde nu există.
- **Fix:** nu o pagină nouă. Pe `/cazier-auto` și `/acte-necesare-cazier-auto` se adaugă:
  - o secțiune H2 „Cât costă: taxă la ghișeu vs prin noi”, cu taxa reală de la ghișeu (sursă: IGPR/DRPCIV, verificată);
  - un rând despre dosarul pentru școala de șoferi.
- **Cum știm că a eșuat:** query-urile „taxa cazier…” rămân pe homepage, peste poziția 20.
- **Indicator:** impresiile pe „taxa cazier auto” se mută pe `/cazier-auto`.

### M3. Pagina principală pe cazier auto e mai subțire decât ghidurile ei
- **Observație [V]:** `/cazier-auto` are 1.163 cuvinte, cu tot cu formular; ghidurile au 1.500–1.740. Concurentul principal din analiza CJO are 2.387. Sinonimul „cazier rutier” apare, iar „cazier rutier online” crește (poziția 11).
- **Fix:** în `src/app/ecazier/cazier-auto/page.tsx`, un H2 „Cazier rutier = cazier auto = fișa conducătorului auto” cu 2–3 paragrafe, plus secțiunea de taxă din M2. Fără copiat text din ghiduri.
- **Cum știm că a eșuat:** poziția pe „cazier auto online” stagnează peste 10.
- **Indicator:** CTR și poziție pe „cazier rutier online”.

### M4. Rețea de site-uri surori pe aceleași servicii [I]
- **Observație:**
  - Domenii: CJO, ecazier, eghiseul și documentero. Aceeași firmă, același avocat, aceleași prețuri, linkuri în footer între ele.
  - Similaritatea de text cu CJO e mică [V]: homepage 0,005; cazier auto 0,042; fiscal 0,046. Nu e duplicat.
  - Riscul e de tip „site-uri multiple care duc spre același funnel” (spam policy, doorways), dacă ecazier ajunge să repete topicurile CJO.
- **Fix:** ecazier păstrează nișa auto + fiscal + ghiduri pentru șoferi. **Nicio pagină de oraș, niciun clon de pagină CJO.** Linkurile între branduri rămân contextuale, nu blocuri sitewide.
- **Cum știm că a eșuat:** ecazier începe să rankeze pe aceleași query-uri judiciar ca CJO, și unul dintre ele cade.
- **Indicator:** suprapunerea query-urilor CJO ∩ ecazier din GSC, verificată lunar.

---

## LOW / Info

- **L1. `llms.txt` lipsește** (404) pe ecazier; CJO are unul [V]. Fix: un `public/llms.txt` servit pe host-ul ecazier, cu cele 3 servicii, prețuri și termene. Indicator: nimic măsurabil în GSC; e o mică investiție GEO.
- **L2. Zero imagini** pe toate paginile [V]. Pe ghidurile despre fișă, un specimen **redactat complet** ar ajuta utilizatorul și Google Images. ⚠️ Lecția din 14.10: specimenul nu are voie să conțină date reale.
- **L3. FAQPage** există pe 10+ pagini (Info): Google nu mai afișează rich result FAQ din mai 2026. Poate rămâne, pentru că nu strică. Nu e de adăugat ca tactică.
- **L4. Homepage-ul are `cache-control: no-store`** (randare dinamică, `x-vercel-cache: MISS`) [V]. TTFB-ul e bun azi (PSI: LCP 1,2 s), deci doar de urmărit.
- **L5. Autor:** ghidurile au `author: Organization eCazier.ro`. E corect (nu inventăm persoane, regula 3). Dacă avocata acceptă semnătură reală pe ghiduri, `Person` cu pagină proprie ar fi un plus E-E-A-T; altfel rămâne cum e.
- **OK [V]:**
  - neafilierea, datele firmei și ANPC sunt pe toate paginile, inclusiv `/comanda`;
  - robots deschis pentru crawlerele AI, cu `/api` și `/completare` închise;
  - sitemapul are 15 URL-uri, toate indexabile, fără `/comanda` și `/status-comanda` (noindex);
  - redirectul http→https e 308;
  - `www` → apex face 308;
  - lab mobile: Performance 98–100.

---

## Rezumat (15 rânduri)

1. Scor SEO ecazier.ro: **71/100**. Tehnic e bun (88), conținutul are probleme de încredere (55).
2. GSC are date doar din 20.09 (proprietatea a fost creată pe 21.09), deci nu există un trend august→octombrie. ecazier n-a pierdut organic, n-avea.
3. Trend [V]: impresiile au urcat de la 270 la 620 pe săptămână (21.09→26.10), poziția de la 12,9 la 10,6. Total: 67 clicuri în 6 săptămâni. Spam update-ul din septembrie nu l-a lovit.
4. Toate cele 15 URL-uri din sitemap sunt indexate (pe 21.09 erau 2), canonicalul e respectat, iar `/comanda` e noindex intenționat.
5. CJO, verificat live: testimoniale reale fără Review, 198/278 fără ONLINE10 și Iași cu „Pe scurt” + GovernmentOffice. Toate sunt OK.
6. CRITIC: testimonialele inventate au rămas pe ecazier (`/cazier-auto` 3, `/cazier-fiscal` 6, `/comanda` 6), hardcodate în `src/app/ecazier/*/page.tsx`.
7. CRITIC: FAQ-ul `/comanda` promite „ONLINE10 automat”, care nu există în config. Fraza se șterge: cuponul rămâne doar pentru cine îl introduce.
8. HIGH: homepage-ul are H1 pe judiciar, dar Google îi dă query-uri auto pe pozițiile 20–28, unde concurează cu `/cazier-auto` (canibalizare).
9. HIGH: `/cazier-fiscal` stă pe pozițiile 23–27, are prețul 198 doar în schema (invizibil pe pagină), 2 linkuri interne și niciun ghid fiscal.
10. HIGH: termene contradictorii (1–4 / 1–5 / 3–5 zile). O singură sursă: config-ul.
11. HIGH (pentru Ads): „documente oficiale” în H2, footer și schema. Trebuie scos înainte de apelul la politica Google Ads.
12. MEDIUM: datele de actualizare diferă între sitemap, schema și pagină; „taxa cazier auto” n-are răspuns; `/cazier-auto` e mai subțire decât ghidurile.
13. MEDIUM [I]: ecazier rămâne pe nișa auto + fiscal, fără pagini de oraș și fără clone CJO (riscul de rețea de site-uri surori).
14. LOW: `llms.txt` 404, zero imagini, FAQPage doar Info, homepage no-store. Performanța e excelentă (LCP 1,1–1,2 s lab, fără CrUX).
15. Prioritate: C1 + C2 + H3 azi (texte simple), H1/H2 în săptămâna asta (o pagină pe săptămână), H4 înainte de apelul Ads.
