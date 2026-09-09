# Accessibility tree & agenți AI — research + audit pe eghiseul.ro

**Data:** 09.09.2026
**Declanșator:** articol Search Engine Journal — [„The Accessibility Tree Is How AI Agents Read Your Site & It's Breaking"](https://www.searchenginejournal.com/the-accessibility-tree-is-how-ai-agents-read-your-site-its-breaking/578171/) (Slobodan Manic, 24.06.2026)
**Verdict scurt:** arborele de accesibilitate al site-ului, DUPĂ randare JS, e curat (0 butoane/linkuri goale, 0 inputuri nelabelate, ierarhie de headinguri corectă). Problema reală nu e arborele — e că robots.txt invită explicit GPTBot/ClaudeBot/PerplexityBot, iar acești crawleri **nu execută JavaScript**, deci văd doar un ecran de loading, nu conținutul. Asta ține de vizibilitate GEO/AI, nu de ranking Google clasic.

---

## 1. Ce spune articolul (rezumat verificat)

Arborele de accesibilitate e modelul semantic pe care browserul îl construiește din DOM — un nod per element cu 4 proprietăți: **Rol** (button/link/navigation), **Nume** (textul accesibil), **Stare** (checked/expanded/disabled), **Descriere**. Reduce mii de noduri DOM la elementele interactive relevante.

**De ce contează pentru agenți AI:** la 30 mai–5 iun. 2026, bots au trecut de 57,2% din traficul HTML (vs 42,8% oameni). Agenții preferă arborele în locul screenshot-urilor: mai puțini tokeni, mai fiabil decât "ghicit" din pixeli.

- **Playwright MCP** (Microsoft) — citește arborele de accesibilitate direct, fără model de viziune.
- **ChatGPT Atlas** (OpenAI) — „uses ARIA tags, the same labels and roles that support screen readers, to interpret page structure" (FAQ oficial OpenAI). Citat cheie: *"Making a website more accessible helps the agent understand it."*
- **OpenAI Computer-Using Agent / Operator** — hibrid: screenshot + DOM + arbore de accesibilitate.
- **Google Project Mariner / Gemini Agent Mode** — citește **pixeli**, nu cod; capturează ecranul ca un utilizator văzător, deci mai puțin sensibil la ce e „ascuns" în DOM, dar tot randează JS complet (e un browser real).

**Ce rupe arborele (date WebAIM Million 2026, regresie față de 2025):**

| Defect | % pagini afectate | Impact pe agent |
|---|---|---|
| Contrast redus | 83,9% | modele de viziune se chinuie |
| Alt text lipsă | 53,1% | imaginea nu contribuie nimic |
| Label lipsă la formular | 51% | agentul nu poate mapa inputul la scop |
| Link gol (rol fără nume) | 46,3% | „o ușă fără firmă" |
| Buton gol | 30,6% | control vizibil, neidentificabil |
| Lang document lipsă | 13,5% | model de limbă greșit aplicat |

**Paradoxul ARIA:** paginile CU ARIA au în medie 59,1 erori vs 42 fără ARIA — un atribut gol sau greșit nu lasă arborele gol, îl umple cu informație greșită dar încrezătoare, mai rea pentru un agent decât lipsa totală. Regula W3C nr. 1 a ARIA: dacă HTML nativ face treaba, nu adăuga rol ARIA peste el.

**Ce recomandă articolul (checklist):**
1. HTML nativ (`<button>`, `<a href>`, `<select>`) în loc de `<div onClick>`.
2. Nume pe fiecare control (label real, text accesibil pe iconițe).
3. **Randare pe server** a conținutului important — dacă apare doar după JS client-side, „poate să nu ajungă niciodată în arborele pe care-l citește un agent".
4. ARIA doar pentru goluri reale, nu ca patch.
5. Verificare cu Chrome DevTools (tab Accessibility → „Show accessibility tree") sau `page.locator('body').ariaSnapshot()` din Playwright.

**Poziția pe ranking:** articolul NU susține că accesibilitatea e factor direct de ranking Google. Google confirmă asta direct — John Mueller: *"No, not really […] it's not something that we would pick up and use as a direct ranking factor"* — pentru că nu poate fi cuantificată obiectiv. Efectul e **indirect** (utilizatori care nu pot folosi site-ul nu-l recomandă) și, nou în 2026, **efect GEO**: agenții AI care decid ce recomandă/cumpără ocolesc controalele neclare. Miza e vizibilitate/tranzacții, nu poziție SERP.

---

## 2. Cum citesc paginile agenții reali, verificat separat

- **Playwright MCP**: confirmat — arbore de accesibilitate, zero model de viziune.
- **ChatGPT Atlas**: confirmat prin FAQ OpenAI — Chromium, dar citește rolurile/etichetele ARIA în loc de pixeli.
- **Google Project Mariner**: citește pixelii ecranului randat (comportament de utilizator văzător), dar tot execută JS complet ca orice browser Chromium.
- **Crawlerii AI „clasici" (fetch, nu agenți interactivi) — GPTBot, ClaudeBot, PerplexityBot**: verificat separat (surse: getpassionfruit.com, anagram.ai, searchoptimo.com, sept. 2026) — **niciunul nu execută JavaScript** în 2026. GPTBot descarcă fișiere JS în ~11,5% din cereri dar nu le rulează; ClaudeBot în ~23,8%, tot nu le rulează. Citesc HTML brut și pleacă, fără al doilea pas de randare. Doar Googlebot/Bingbot au randare JS completă (two-wave indexing).

Asta separă clar două categorii de „AI care ne citește site-ul":
- **Agenți interactivi** (Playwright MCP, ChatGPT Atlas, Gemini Mariner) = browsere reale, execută JS → văd exact ce vede un om.
- **Crawleri de indexare AI** (GPTBot, ClaudeBot, PerplexityBot, folosiți pentru citările din ChatGPT/Perplexity/Claude) = fetch simplu, fără JS → văd DOAR ce vine în răspunsul HTTP brut, înainte de orice script.

---

## 3. Ce am măsurat pe eghiseul.ro

Metodă: `axe-core` + `page.locator('body').ariaSnapshot()` (Playwright) pe 13 pagini reprezentative (homepage, `/servicii/`, 4 pagini de serviciu, `/comanda/status/`, calculator, blog, articol, contact), în două moduri — cu JS activ (ce vede un agent interactiv) și cu JS dezactivat + `curl` pe HTML brut (ce vede un crawler fetch-only).

### 3.1 Găsire critică — conținutul real e ascuns până rulează JS (afectează GEO, nu Google)

Homepage-ul (și, structural, orice rută cu `loading.tsx`) livrează în răspunsul HTTP **două** elemente `<main>`:

```html
<div hidden id="S:0"><main class="min-h-screen">...(conținutul real, complet)...</main></div>
...
<main id="main-content" class="flex min-h-[60vh] items-center justify-center">
  <svg aria-label="Se încarcă" class="animate-spin">...</svg>
</main>
```

Sursa exactă a fallback-ului vizibil: `src/app/loading.tsx` (Suspense boundary global, generat automat de Next.js App Router pentru streaming SSR). Conținutul REAL (titluri, prețuri, descrieri servicii) există în același răspuns HTTP — verificat: textul „Servicii Disponibile" apare textual în HTML — dar stă în `<div hidden>` și devine vizibil doar când un script inline (`$RC`, mecanismul React de reconciliere) îl mută la vedere. Fără execuție JS, elementul rămâne `hidden` pentru totdeauna.

**Confirmat pe toate cele 13 pagini testate, cu JS dezactivat:**
- `document.body.innerText` = exact **1060 caractere**, identic pe orice pagină (doar header + footer + nav) — conținutul propriu paginii (variabil ca lungime pe fiecare URL) nu ajunge deloc în textul vizibil.
- Titlul H1 apare oarecum inconsistent (depinde dacă Suspense a rezolvat până la `domcontentloaded`), dar corpul textual — NU.

**De ce contează:** `robots.txt` (verificat live) permite explicit `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Meta-ExternalAgent`, `MistralAI-User`, `Google-Extended`, `Applebot-Extended` pe tot site-ul (mai puțin `/admin/`, `/api/`, `/comanda/`, `/auth/`, `/account/`, `/orders/`). Site-ul își dorește activ să fie citit de acești crawleri pentru citări AI — dar niciunul din ei nu execută JS (secțiunea 2). Rezultat: azi, aceste bots citesc de pe orice pagină eghiseul.ro doar navigarea și footerul, NU descrierea serviciului, prețul, FAQ-ul sau textul articolului.

- **Nu afectează Google Search clasic** — Googlebot randează JS complet (two-wave indexing), și Mueller confirmă că accesibilitatea oricum nu e factor direct de ranking.
- **Afectează direct GEO** — vizibilitatea în răspunsuri ChatGPT/Perplexity/Claude, exact segmentul pe care `robots.txt` îl invită explicit.
- **Nu afectează agenții interactivi** (Playwright MCP, ChatGPT Atlas, Gemini Mariner) — aceștia randează JS ca un browser real; auditul cu JS activ (mai jos) arată arbore curat.

**Recomandare (necesită validare tehnică separată, nu aplicată în acest research):** problema vine din `src/app/loading.tsx` fiind Suspense boundary la nivel de rută pentru randarea SSR inițială, nu doar pentru tranziții client-side. Opțiuni de investigat: randare fără streaming pentru fetch-uri fără `Sec-Fetch-*`/fără JS (dificil de detectat robust), sau acceptarea compromisului și compensarea prin alte canale GEO (`llms.txt`, feed structurat, pagini API dedicate crawlerilor — vezi `[[webmcp-decision]]`).

### 3.2 Skip-link rupt după hidratare pe 3 rute (bug real, verificat)

`src/app/layout.tsx:73` — linkul „Sari la conținut" țintește static `#main-content`. Verificat direct în DOM după randare completă (`document.getElementById('main-content')`):

| Rută | `#main-content` există după randare? |
|---|---|
| `/` | ❌ NU |
| `/servicii/` | ❌ NU |
| `/comanda/status/` | ❌ NU (și **0 elemente `<main>`** — landmark lipsă total) |
| `/servicii/cazier-judiciar-online/` și restul paginilor de serviciu | ✅ DA |
| `/calculator/salariu/`, `/blog/`, articole, `/contact/`, `/despre-noi/` | ✅ DA |

Cauza: `id="main-content"` e setat explicit doar în `article-layout.tsx`, `calculator-layout.tsx`, `legal-layout.tsx` și componenta de pagină de serviciu — dar `src/app/page.tsx` (homepage) și `src/app/servicii/page.tsx` folosesc `<main>` fără id, iar `id="main-content"` real există doar pe `loading.tsx` (fallback-ul care dispare la hidratare). Deci pe aceste 3 rute, linkul de skip devine un ancoră moartă imediat ce pagina se randează complet — eșec WCAG 2.4.1 (Bypass Blocks), confirmat și de axe (`skip-link`, `region`, impact moderate).

**Fix:** adaugă `id="main-content"` pe `<main>` din `src/app/page.tsx` și `src/app/servicii/page.tsx`; adaugă un element `<main>` propriu-zis (cu id) pe `/comanda/status/`.

### 3.3 Arbore de accesibilitate — curat, o dată randat JS

Pe toate cele 13 pagini, cu JS activ (`ariaSnapshot`, 7.000–48.000 caractere per pagină):

- **0 butoane fără nume**, **0 linkuri fără nume** — pe toate paginile.
- **0 inputuri nelabelate** — excepție benignă: un `<select aria-hidden="true">` pe `/contact/`, un select nativ ascuns intenționat în spatele unei componente UI custom (pattern standard, nu gol real).
- **0 imagini fără atribut `alt`** — o singură imagine cu `alt=""` (decorativă, corect).
- **0 `role="button"` pus pe element non-nativ**, **0 `div`/`span` clickabile fără rol** — nu există „div soup".
- **0 elemente cu `tabindex` pozitiv**, **0 elemente focusabile ascunse în spatele `aria-hidden`**.
- Landmark-uri corecte: 1 `header`, 1 `main`, 1 `footer`, navigare marcată — pe fiecare pagină, mai puțin excepțiile de la 3.2.
- Ierarhie de headinguri corectă (h1 → h2 → h3 → h4, fără salturi) pe toate paginile testate.
- `lang="ro"` setat corect în `<html>`.
- Uz de ARIA moderat (77–289 elemente cu atribute ARIA per pagină, proporțional cu complexitatea) — nu e „ARIA excesiv patch peste HTML greșit"; nu s-a găsit paradoxul ARIA din articol (atribute goale/greșite) pe eșantion.

Concluzie secțiune: dacă un agent EXECUTĂ JavaScript (orice agent interactiv real), arborele pe care-l primește e curat și utilizabil. Nu există fundamentele clasice de „accessibility tree stricat" (butoane goale, inputuri nelabelate, div soup) pe care le denunță articolul.

### 3.4 Nume ambigue pe linkuri repetate (nu prinde axe, dar contează pentru agenți)

Pe `/servicii/`, textele „Comandă acum" și „Vezi detalii" se repetă de **29 de ori fiecare**, fiecare cu alt `href` — normal vizual (fiecare card de serviciu are propriul CTA), dar un agent care citește DOAR numele accesibil al linkului, fără context de poziție/vecinătate, nu poate distinge „Comandă acum" pentru cazier de „Comandă acum" pentru extras CF fără să inspecteze contextul din jur. La fel „Persoană Fizică"/„Extras Multilingv" (2 hrefs diferite) apar pe majoritatea paginilor de serviciu, din meniul de navigare.

Nu e o eroare axe (contextul vizual e valid), dar e exact riscul de „ambiguitate pentru agent" descris în articol. Recomandare: `aria-label` mai specific pe CTA-urile repetate (ex: `aria-label="Comandă acum — Cazier Judiciar"`), fără să schimbe textul vizibil.

### 3.5 Alte violări axe-core (WCAG), pe eșantionul de 13 pagini

| Regulă | Impact | Unde | Notă |
|---|---|---|---|
| `color-contrast` | serios | TOATE (6–95 noduri/pagină; cel mai rău: `/servicii/` 95, `/blog/` 54, homepage 42) | cea mai mare categorie de erori, de departe |
| `scrollable-region-focusable` | serios | 4 pagini de serviciu | zonă scrollabilă orizontal (carusel preț/testimoniale) fără focus tastatură |
| `region` | moderat | toate | conținut în afara landmark-urilor named |
| `skip-link` | moderat | `/`, `/servicii/`, `/comanda/status/` | vezi 3.2 |
| `heading-order` | moderat | pagini 404 testate din greșeală | fals pozitiv — pagini inexistente redirecționate la 404 |
| `landmark-unique` | moderat | `/servicii/cazier-judiciar-online/persoana-fizica/` | 1 nod |

`color-contrast` e disproporționat de mare și separat de tema „accessibility tree pentru agenți" — ține strict de accesibilitate vizuală umană (WCAG AA), merită auditat separat de o trecere dedicată de design (culori text pe `primary-50`/`primary-600` etc.), nu de research-ul de față.

---

## 4. Concluzie & prioritizare

**Răspuns direct la întrebare:** avem arbore de accesibilitate curat — DAR doar pentru cine execută JavaScript. Cine nu (crawlerii AI pe care `robots.txt` îi invită explicit) nu ajunge deloc la arbore, vede un ecran de loading. Nu ajută rankingul Google (confirmat: nu e factor de ranking, iar Google randează JS oricum) — ajută/afectează vizibilitatea în ChatGPT/Perplexity/Claude (GEO), care e alt canal, deja tratat separat în `docs/seo/` prin lentila „AI Overviews" dar nu prin lentila „crawler fetch-only fără JS".

**Priorități, în ordine:**
1. **P0 — GEO:** decizie despre cum tratăm faptul că GPTBot/ClaudeBot/PerplexityBot nu văd conținutul (opțiuni: randare alternativă pentru fetch-uri fără JS, sau acceptare + compensare prin alte semnale GEO). Necesită decizie de produs, nu doar cod.
2. **P1 — bug real, fix mic:** skip-link mort pe `/`, `/servicii/`, `/comanda/status/` + `<main>` lipsă pe `/comanda/status/`.
3. **P2 — WCAG general:** trecere dedicată pe `color-contrast` (cea mai mare categorie de erori) + `scrollable-region-focusable` pe caruselele de preț.
4. **P3 — polish pentru agenți:** `aria-label` specific pe CTA-urile repetate („Comandă acum", „Vezi detalii").

Nimic din research nu a fost aplicat ca fix în acest pas — e strict cercetare + audit, conform cerinței inițiale.

**Legături:** [[webmcp-decision]] (decizie anterioară despre tooling pentru agenți AI, relevantă pentru punctul P0).

---

## 5. Fix aplicat + verificare pe producție (09.09.2026, PR #5, commit `64a9257`)

Aplicat: șters `src/app/loading.tsx` din root (mutat doar pe `/admin/` și `/comanda/`, deja `Disallow` în robots.txt), scos `<Suspense>` inutil peste `FeaturedServices` (componentă sincronă, zero fetch), adăugat `id="main-content"` pe `<main>` din homepage + `/servicii/`, adăugat `<main id="main-content">` pe `/comanda/status/`.

**Verificat direct pe `https://eghiseul.ro` după deploy** (curl, fără JS — exact ce vede GPTBot/ClaudeBot/PerplexityBot):

| Pagină | Înainte (text vizibil fără JS) | După |
|---|---|---|
| `/` | 1.060 caractere (fix, doar header+footer) | **18.839** caractere |
| `/servicii/` | 1.060 | **8.042** |
| `/servicii/cazier-judiciar-online/` | 1.060 | **33.224** |
| `/blog/` | 1.060 | **8.873** |
| `/calculator/salariu/` | 1.060 | **9.468** |
| `/contact/` | 1.060 | **4.139** |

Pe toate: zero `<div hidden id="S:...">`, zero `$RC`, un singur `<main>`. Skip-link (`#main-content`) verificat funcțional pe `/`, `/servicii/`, `/comanda/status/` — cele 3 rute unde era ancoră moartă înainte.

Conținutul real al fiecărei pagini e acum prezent integral în răspunsul HTTP brut, indiferent dacă cine citește execută JavaScript sau nu.
