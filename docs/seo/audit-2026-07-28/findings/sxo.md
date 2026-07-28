# SXO — Search Experience, 5 interogări principale (28.07.2026)

**Surse:** GSC API (`gsc_query.py`, ultimele 28 zile, dimensiuni query+page, 5000 rânduri) ·
`render_page.py --mode auto` + `parse_html.py` pe 6 pagini țintă (homepage, `/servicii/cazier-judiciar-online/`,
`/servicii/extras-de-carte-funciara/`, `/calculator/varsta-pensionare/`, `/tools/verificare-rovinieta-online/`,
`/servicii/eliberare-certificat-de-nastere/`) · SERP manual verificat 26.07.2026 pentru „cazier judiciar online"
și „certificat de nastere online" (reluat din `docs/seo/2026-07-26-analiza-organic-servicii.md`, NU re-verificat live acum).
**SERP live pentru „verificare rovinieta", „extras carte funciara", „calculator varsta pensionare" — NEVERIFICAT
în această trecere** (interpretare bazată pe poziția GSC + tipul de pagină existent; marcat explicit mai jos).

---

## Rezumat findings (severitate)

| # | Interogare | Tip premiat de Google | Ce avem | Mismatch |
|---|---|---|---|---|
| 1 | cazier judiciar online | Gov/oficial gratuit + Service Page comercial (proba: sora CJO #3 cu schema Product+Review) | **Pagina greșită câștigă impresiile**: homepage (Hub, fără schema Product/Service) la poz. 7,2/14.831 impr, în timp ce `/servicii/cazier-judiciar-online/` (Service Page corect, schema Product+Service+Review 4,9/450, 4.818 cuvinte) ia doar 495 impr la poz. 7,5 | **CRITICAL — canibalizare internă homepage vs pagină de serviciu** |
| 2 | certificat de nastere online | Mix oficial + Service Page comercial | Service Page corect, deja #3 (poz. 3,7, CTR 12,76%) | ALIGNED pe tip; problema e conversie (rich snippet preț sec), nu tip |
| 3 | extras carte funciara | Neverificat live; proxy GSC: variantele lungi (cu „de", „online") rankează poz. 4,5–7,7, varianta scurtă exactă poz. 14,6 | Service Page cu schema completă (Product+Service+Review), dar vizibilitate slabă pe termenul scurt | HIGH (evidență GSC, nu SERP vizual) |
| 4 | calculator varsta pensionare | Tool/calculator (evident din intenție + poziție) | Tool propriu, poz. 2,0 pe termenul exact | **ALIGNED** — singurul caz din 5 unde tipul e corect și poziția e bună |
| 5 | verificare rovinieta | Tool/calculator (proxy: poz. 4,8, striking distance) | Tool propriu, dar **elementul interactiv (input nr. înmatriculare) lipsește din HTML-ul inițial** — bailout la client-side rendering, nedetectat de `render_page.py --mode auto` (`is_spa:false`, `mode_used:raw`) | MEDIUM-HIGH (tehnic, verificat în cod sursă livrat) |

---

## 1. „cazier judiciar online" — CRITICAL: canibalizare internă, nu SERP

**Dovadă GSC (28 zile):**

| Pagină | Clicuri | Afișări | Poziție | CTR |
|---|---|---|---|---|
| `https://eghiseul.ro/` (homepage) | 345 | 14.831 | 7,2 | 2,33% |
| `https://eghiseul.ro/servicii/cazier-judiciar-online/` | 18 | 495 | 7,5 | 3,64% |

Google alege să afișeze **homepage-ul**, nu pagina dedicată, pentru exact această interogare — deși
pagina dedicată e tipul corect (Product+Service+Review schema, 4.818 cuvinte, preț 198 RON afișat clar,
FAQ „Cazierul Judiciar Online Este Gratuit?"), iar homepage e un Hub generic (schema doar
Organization/WebSite/WebPage/ItemList/FAQPage, fără Product/Service, H1 „Cazier Judiciar și Documente
Online – Prin Avocat, Fără Cozi, Livrare 24-48h" care vinde tot portofoliul, nu cazierul specific).

**SERP real (verificat 26.07, din analiza precedentă):** hub.mai.gov.ro (gratuit, oficial) → research.gov.ro
→ **cazierjudiciaronline.com** (site-soră, #3, rich snippet 4,9★/441 recenzii, „de la 250 RON") →
caziere.ro → hub.mai.gov.ro (din nou) → Facebook → CJO oraș → infocons.ro. Ads sus: **ecazier.ro**
(tot site-ul nostru). AI Overview spune explicit „serviciul e complet gratuit" prin HUB MAI.
eghiseul.ro nu apare vizual pe pagina 1 în acel snapshot — GSC arată totuși impresii la poz. medie 7,2
(fluctuație/personalizare), dar mesajul e același: **tipul care câștigă e Service Page comercial cu
schema Product+Review, dovedit de propriul nostru site CJO pe locul #3.**

**Fix concret:**
- Homepage nu ar trebui să concureze cu pagina de serviciu pe acest termen — fie se adaugă
  `rel="canonical"`/internal-linking mai puternic către `/servicii/cazier-judiciar-online/` din
  homepage (link contextual în H2 „Servicii Disponibile", nu doar card generic), fie se acceptă
  explicit (ca în P1.1 din analiza din 26.07) că eghiseul NU se bate pe acest head term cu resurse
  proprii triplicate (CJO + ecazier + eghiseul), și homepage-ul își reduce optimizarea pentru
  „cazier judiciar online" ca termen exact.
- Dacă se alege să se lupte cu pagina dedicată: title tag-ul homepage („eGhișeul.ro — Documente
  Online: Cazier, Carte Funciară") ar trebui să nu mai concureze cu titlul paginii de serviciu
  („Cazier Judiciar Online 2026 — Fără Drumuri, în 3-5 Zile"), ca Google să nu le trateze ca
  duplicate de intenție.

---

## 2. „certificat de nastere online" — tip aliniat, problemă de conversie confirmată

Pagină corectă (Service Page, schema Product+Service+Review 4,9/450), poziție bună (#3, poz. 3,7,
CTR 12,76% pe termenul exact în GSC). Pe pagină, prețul E explicat („+TVA 21% · 998 RON cu TVA" +
paragraf „prin noi plătești 998 RON pentru un serviciu 100% online, fără deplasare"), deci
conținutul on-page e corect — problema e **rich snippet-ul SERP**, care afișează sec „998,00 RON ·
În stoc" fără context (confirmat în analiza din 26.07, P1.3). Fix: verifică `Offer.description` /
`priceValidUntil` în schema Product, nu textul paginii.

---

## 3. „extras carte funciara" — vizibilitate slabă pe termenul scurt (evidență GSC, SERP neverificat live)

| Variantă interogare | Poziție | Afișări |
|---|---|---|
| extras carte funciara online | 6,6 | 479 |
| extras de carte funciara online | 5,5 | 423 |
| carte funciara online | 7,7 | 357 |
| **extras carte funciara** (fără „de", termenul din brief) | **14,6** | 291 |
| extras de carte funciara | 13,6 | 269 |
| ancpi extras carte funciara | 6,4 | 209 |

Pagina (schema Product+Service+Review, 3.881 cuvinte) rankează rezonabil pe variantele lungi, dar
cade pe pagina 2 pe varianta scurtă exact cerută în brief. Nu am verificat vizual cine ocupă #1-3
pe „extras carte funciara" azi — **neverificat**, dar tiparul (variante lungi bune, variantă scurtă
slabă) sugerează că termenul scurt e disputat de agregatoare/intermediari mai mari, nu de o
nepotrivire de tip (schema și profunzimea sunt deja corecte). Confirmă P1.4 din analiza 26.07:
cererea reală vine din articolul ANCPI, nu din acest termen.

**Fix:** nu e nevoie de schimbare de tip de pagină; verifică dacă titlul/H1 („Extras de Carte
Funciară Online") ar trebui să includă și varianta fără „de" undeva în primul paragraf (text-matching),
și rulează un SERP live pe „extras carte funciara" înainte de orice altă acțiune.

---

## 4. „calculator varsta pensionare" — singurul caz ALIGNED

Poz. 2,0 pe termenul exact (515 clicuri/28 zile, CTR 24,7%), poz. 2,4 pe „calcul varsta pensionare
legea noua" (1.022 clicuri). Tip de pagină = Tool, intenție = Tool, poziție = aproape de #1.
**Nu necesită intervenție de tip/intenție.** Singura observație: pe „calculator varsta pensionare
anticipata" (4.546 impr), articolul `/tabel-varsta-pensionare-anticipata-femei/` (poz. 7,4) și
tool-ul propriu (poz. 5,0) concurează parțial pe aceeași interogare — tool-ul câștigă poziția, deci
nu e o canibalizare care strică ceva azi, dar de monitorizat.

---

## 5. „verificare rovinieta" — găsit tehnic: input-ul lipsește din HTML-ul inițial

Poz. 4,8, 109.820 afișări, striking distance clasic. Tip corect (Tool). **Nu am verificat live SERP**
cine ocupă #1-3 (probabil roviniete.ro/CNAIR + alte checker-e — neverificat).

**Dovadă tehnică concretă**, din `render_page.py --mode auto` + inspecție HTML brut pe
`/tools/verificare-rovinieta-online/`:
- `grep -c '<input'` pe HTML-ul livrat de server = **0** — niciun câmp de input pentru numărul de
  înmatriculare nu există în HTML-ul brut.
- HTML-ul conține literal markerul React `<!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">`
  — Next.js renunță explicit la server-rendering pentru acea secțiune și o lasă pe client.
- `render_page.py` a raportat `is_spa: false, mode_used: raw` — detectorul de SPA nu a prins acest
  bailout, deci fetch-ul a rămas pe raw HTML, fără Playwright, exact ca un crawler/preview rapid.

Pentru un tip de pagină „Tool" taxonomia cere explicit „functional tool above fold" ca element
obligatoriu. Dacă interfața reală de introdus numărul de înmatriculare există doar după hidratare
JS, orice sistem care nu execută JS complet (preview-uri sociale, unele bot-uri, LLM-uri care citesc
HTML brut pentru AI Overview/citări) vede o pagină fără tool — coroborează cu nota deja documentată
din CONTEXT.md (`preload_check` 50/100, LCP lab 3,5s pe pagini similare din portofoliu).

**Fix concret:** verifică dacă componenta de input rovinietă poate fi randată server-side (SSR) sau
cel puțin cu un `<noscript>`/skeleton static cu `<input>` real în HTML, nu doar shell client-only.
Fișier de verificat: componenta tool-ului rovinietă (căutare `plateScripts`/`plateStyles` în bundle
— identificatori găsiți în HTML, sugerează un component custom de „plate input" per literă/cifră).

---

## Persona scoring — „cazier judiciar online", primele 5 secunde

Persona derivată din semnal SERP direct: AI Overview spune „gratuit", rich snippet CJO arată preț+recenzii.

**Persona: „Cetățean care caută rapid, deja știe că poate fi gratuit"**
- Journey stage: Decision (a decis să caute varianta rapidă, dar e sceptic la preț fiindcă știe de ruta gratuită)
- Ce vrea în 5 secunde: confirmare că NU e o taxă ascunsă, preț clar, timp de livrare, diferența față de ruta gratuită

Dacă ajunge pe **homepage** (ce se întâmplă azi în GSC, vezi §1): vede „Cazier Judiciar și Documente
Online – Prin Avocat, Fără Cozi, Livrare 24-48h" + listă cu 9 servicii — trebuie să caute printre
carduri ca să găsească prețul specific pentru cazier. **Relevance 12/25** (trebuie să extrapoleze),
**Clarity 10/25** (răspunsul lui — preț + diferență față de gratuit — nu e în primul ecran, e diluat
în portofoliu), Trust/Action neafectate (recenzii + CTA generale există).

Dacă ajunge pe **`/servicii/cazier-judiciar-online/`** (ce ar trebui să se întâmple): H1 „Cazier
Judiciar Online", FAQ „Cazierul Judiciar Online Este Gratuit?" explicit tratează exact obiecția
personei, preț 198 RON vizibil sus. **Relevance 22/25, Clarity 20/25.**

**Concluzie:** diferența de scor persoană între cele două pagini (≈32/50 vs ≈42/50 pe Relevance+Clarity)
e cauzată 100% de care pagină servește Google, nu de conținutul paginii de serviciu (care e deja bun).
Confirmă că fix-ul #1 (canibalizarea) e prioritatea reală, nu o rescriere de conținut.

---

## SXO Gap Score (100 pct, pe pagina de serviciu cazier, cea care AR TREBUI să câștige)

`/servicii/cazier-judiciar-online/`

| Dimensiune | Scor | Dovadă |
|---|---|---|
| Page Type (15) | 14/15 | Service Page corect pentru intenție comercială dovedită de sora CJO |
| Content Depth (15) | 14/15 | 4.818 cuvinte, FAQ, „30+ situații", specimen oficial |
| UX Signals (15) | 11/15 | CTA clar „Comandă" ×6, dar concurează cu homepage-ul propriu pe SERP |
| Schema (15) | 14/15 | Organization, WebSite, BreadcrumbList, Service, Product, Person, FAQPage — complet |
| Media (15) | neverificat | nu am inspectat imagini/video individual în această trecere |
| Authority (15) | 8/15 | 450 recenzii afișate, dar homepage-ul „fură" autoritatea de linkuri interne |
| Freshness (10) | neverificat | nu am verificat `dateModified`/publication_date pe pagina de serviciu |

**Total parțial verificat: 61/85 (Media + Freshness neverificate).** Blocajul nu e scorul paginii —
e faptul că altă pagină a site-ului câștigă impresiile.

---

## Limitări (neverificat)

- SERP live (WebSearch) NU a fost rulat efectiv pentru „verificare rovinieta", „extras carte funciara",
  „calculator varsta pensionare" — concluziile de tip de pagină pentru aceste 3 se bazează pe poziția
  GSC + tipul de pagină existent, nu pe inspecție vizuală #1-10.
- Media (imagini/video) și Freshness (dateModified) nu au fost verificate pe niciuna din cele 6 pagini.
- Nu am verificat dacă bailout-ul client-side de pe pagina rovinietă afectează efectiv indexarea/AI
  Overview (necesită test separat cu Googlebot rendering sau URL Inspection API).
- Nu am rulat wireframe IST/SOLL (nu a fost cerut explicit).

## Recomandări cross-skill

- Schema Product (preț „998,00 RON" sec în snippet) → `/seo schema` pentru regenerare Offer completă.
- Bailout client-side pe tool-ul rovinietă → verificare tehnică suplimentară (posibil `/seo page`).
