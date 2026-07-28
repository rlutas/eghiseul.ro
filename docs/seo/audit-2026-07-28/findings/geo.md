# GEO / AI Search Readiness — eghiseul.ro (28.07.2026)

Verificat cu: `curl` direct pe robots.txt/llms.txt, `render_page.py` (trafilatura `extracted_text` + `structured_data`) pe 4 pagini + homepage.

## 1. Acces crawlere AI (robots.txt)

Toate crawlerele relevante sunt **explicit permise**, cu reguli dedicate (nu doar `User-agent: *`):

| Crawler | Status | Disallow |
|---|---|---|
| GPTBot | Allow / | /admin/ /api/ /comanda/ /auth/ /account/ /orders/ |
| OAI-SearchBot | Allow / | idem |
| ChatGPT-User | Allow / | idem |
| ClaudeBot | Allow / | idem |
| Claude-SearchBot / Claude-User / Claude-Web | Allow / | idem |
| PerplexityBot / Perplexity-User | Allow / | idem |
| Google-Extended | Allow / | idem |
| Applebot-Extended | Allow / | idem |
| Meta-ExternalAgent, MistralAI-User | Allow / | idem |
| CCBot, anthropic-ai, cohere-ai (training-only, opțional de blocat) | **NU apar deloc în robots.txt** → cad sub `User-agent: *` → **permise** | — |

**Finding [Medium]**: CCBot/anthropic-ai/cohere-ai nu sunt blocate separat (skill-ul le recomandă opțional de blocat, doar pt. training, nu pt. search). Nu e o problemă de vizibilitate AI search — dar dacă se dorește excludere din corpusuri de training fără a afecta citarea, trebuie adăugate reguli explicite `Disallow: /` pentru acele 3 user-agent-uri. Fix: `public/robots.txt` sau ruta care îl generează (nu am localizat sursa în acest audit — verifică `src/app/robots.ts` sau echivalent).

Paginile care contează (servicii, calculatoare, articole) sunt toate în afara zonelor blocate (`/admin/ /api/ /comanda/ /auth/ /account/ /orders/`) — deci **nimic din conținutul indexabil/citabil nu e accidental blocat**. Am verificat manual doar cele 4 URL-uri țintă + homepage; nu am verificat toate cele 223 URL-uri din sitemap (**neverificat** la scară completă).

## 2. llms.txt — calitate, nu doar prezență

Prezent, HTTP 200, ~50 linii, structură bună: rezumat entitate (2-3 fraze cu context legal OUG 34/2014, Legea 214/2024), listă servicii cu preț + termen, listă instrumente gratuite, secțiune **"Fapte cheie"** (fapte concrete extractibile 1:1: POT/CUT, echivalențe jugăr/stânjen, taxa de urgență ANCPI), secțiune dedicată **"Pentru AI assistants"** cu instrucțiuni directe de răspuns, și secțiune de licențiere/atribuire.

Puncte forte:
- Linkuri către paginile corecte de bani (servicii + calculatoare cu trafic mare din GSC).
- Fapte cu cifre și citare de lege — exact tipul de conținut citabil descris în criteriile GEO.
- Adresare directă "Pentru AI assistants" — practică rară, bine țintită.

Lacune:
- Nu listează articolele de blog cu trafic mare din GSC (`/ancpi-nu-functioneaza/`, `/tabel-varsta-pensionare-anticipata-femei/`, `/taxa-cazier-judiciar/`) deși acestea generează 2.231–66.408 afișări/lună — llms.txt e orientat 100% spre servicii+calculatoare, zero spre articolele topicale care aduc trafic real în AI Overviews.
- Nu conține RSL 1.0 (Really Simple Licensing). Am verificat `/rsl.xml`, `/.well-known/rsl.xml`, `/license.xml` → toate **404**. Licențierea e menționată doar în text liber ("Conținutul poate fi citat cu atribuire... Licențiere comercială / AI training: contact@eghiseul.ro"), fără machine-readable RSL/XML pe care crawlerele de licențiere să-l parseze automat.
- Nu are dată de "last updated" / versiune — deci un AI care îl citește nu poate ști dacă informația (prețuri, termene) e curentă.

**Verdict: llms.txt e util, nu doar prezent** — dar optimizat doar pentru conversie (servicii), nu pentru corpusul de conținut care câștigă deja citări (articolele). Fix [Medium, effort mic]: adaugă o secțiune "Articole & ghiduri" cu top 5-8 URL-uri din GSC.

## 3. Citabilitate la nivel de pasaj (4 pagini țintă)

Extras cu trafilatura (`extracted_text`, boilerplate eliminat). Toate 4 paginile au schema **FAQPage cu Q&A blocks** (`Answer`/`Question`/`FAQPage` confirmate în `structured_data` pe fiecare din cele 4 URL-uri + homepage) — semnal tehnic puternic pentru extragere AI, indiferent de scorul de text brut de mai jos.

| Pagină | Deschidere (primele cuvinte) | Verdict citabilitate |
|---|---|---|
| `/ancpi-nu-functioneaza/` | "Ce s-a întâmplat, pe scurt" → dată exactă (13 iulie 2026, ora 23:02), fapt concret imediat | **Bun.** Răspuns direct, datat, cu cifre, în primele ~40 cuvinte. `datePublished` 2026-07-15, `dateModified` 2026-07-26 — prospețime bună pt. o știre. |
| `/servicii/eliberare-certificat-de-nastere/` | Titlu + o frază-definiție ("Obținem duplicat sau copie legalizată...") urmată direct de listă numerotată de pași | **Bun.** Definiție scurtă + pași numerotați = format ideal pt. extracție AI (self-contained answer block). |
| `/calculator/varsta-pensionare/` | "Cum se stabilește vârsta de pensionare" (H2 tip întrebare) → răspuns cu citare de lege (Anexa 5, Legea 360/2023) în primele ~50 cuvinte | **Bun.** H2 tip întrebare + citare lege exactă = exact profilul recomandat de skill (definiție scurtă + sursă). |
| `/taxa-cazier-judiciar/` | Paragraf introductiv generic (context + listă "în acest articol vom detalia") de **~65 cuvinte** înainte de primul răspuns concret | **Slab.** Prima secțiune cu răspuns real ("Ce este taxa pentru cazier judiciar") și prima cifră concretă apar abia după intro — încalcă regula "răspuns direct în primele 40-60 cuvinte". Fix [Medium, effort mic]: mută definiția + cifra (taxa RON) în primul paragraf, ține lista "ce vom detalia" ca element secundar sau elimin-o. |

Nu am măsurat lungimea în cuvinte a fiecărui pasaj individual (H2/H3) față de intervalul optim 134-167 cuvinte — trafilatura a extras conținutul ca un singur bloc continuu (fără separatoare clare de paragraf în output), deci segmentarea per-pasaj e **neverificată** la acest nivel de detaliu; ar necesita parsare HTML directă pe headinguri (`parse_html.py`), nefăcută în acest audit.

## 4. Semnale de entitate/brand

Verificat direct din HTML/JSON-LD (curl + grep):

- **Organization schema**: prezent pe toate paginile verificate (homepage + 4 target), cu `ContactPoint`, `PostalAddress`. Bun.
- **sameAs**: homepage are `"sameAs":["https://share.google/stngA2rQbVPY2l57p"]` — **un singur link**, către un share Google, nu către profiluri de entitate recunoscute (Wikipedia, LinkedIn, Facebook, YouTube). Acesta e cel mai slab punct din secțiunea de entitate.
- **Wikipedia**: nicio pagină de entitate — **neverificat direct** dacă există (nu am căutat pe wikipedia.org), dar sameAs nu o listează, deci probabil nu există.
- **YouTube** (cel mai puternic semnal de corelație cu citările AI, ~0.737): nicio mențiune YouTube găsită în schema sau în llms.txt. **Neverificat** dacă există un canal eGhișeul separat de site.
- **Reddit / LinkedIn**: nicio mențiune/link găsit pe paginile verificate. **Neverificat** prezența organică pe aceste platforme (ar necesita căutare externă, nu doar fetch pe site).
- **Autor articole**: `author` pe articole (ex. `/ancpi-nu-functioneaza/`, `/taxa-cazier-judiciar/`) e setat la `{"@id":"https://eghiseul.ro/#organization"}` — **fără autor persoană** (nume, bio, credențiale). Pentru E-E-A-T (Experience/Expertise/Authoritativeness/Trust), lipsa unui autor uman numit (ex. avocatul colaborator menționat în copy) e un gol — un LLM/Google nu poate atribui expertiză unei persoane identificabile.
- **Date**: `datePublished`/`dateModified` prezente și actualizate recent pe articole verificate (ex. taxa-cazier: modificat 2026-06-16; ancpi: modificat 2026-07-26) — bun semnal de prospețime.
- **Citări externe / backlinks (Domain Rating)**: cea mai slabă corelație cu citările AI (~0.266) — nu prioritiza aici. **Neverificat** (necesită Ahrefs/Majestic, nu în tooling-ul disponibil).

## Top 5 recomandări prioritizate

1. **[High, effort mic]** Rescrie primul paragraf din `/taxa-cazier-judiciar/` (și verifică pattern-ul pe restul articolelor din blog) ca răspuns direct cu cifră în primele 40-60 cuvinte, nu intro generic. Cel mai ieftin fix cu impact direct pe extractibilitate.
2. **[High, effort mic]** Adaugă autor uman numit (nume + rol, ex. "avocat colaborator X") cu `Person` schema pe articolele de blog, nu doar `Organization` — semnal E-E-A-T lipsă complet azi.
3. **[Medium, effort mic]** Extinde `llms.txt` cu o secțiune de articole/ghiduri (top 5-8 din GSC), nu doar servicii+calculatoare — azi ignoră exact conținutul care generează cele mai multe afișări (rovinietă, pensionare, ANCPI).
4. **[Medium, effort mediu]** Adaugă `sameAs` reale (LinkedIn companie, YouTube dacă există, orice profil de entitate verificabil) — azi există un singur link Google share, semnal de entitate slab pentru "brand recognized as entity".
5. **[Low, effort mic]** Dacă se dorește excludere din training AI fără a afecta search: adaugă reguli `Disallow: /` explicite pentru CCBot/anthropic-ai/cohere-ai în robots.txt (azi cad sub wildcard-ul permisiv `User-agent: *`). Verifică și publicarea unui `rsl.xml` machine-readable (azi 404) pentru licențiere formală.

## Neverificat (necesită tooling/acces suplimentar)

- Toate cele 223 URL-uri din sitemap pentru blocaje accidentale în robots (verificat doar 5).
- Segmentare per-pasaj (H2/H3) față de intervalul optim 134-167 cuvinte.
- Prezență reală pe Wikipedia, YouTube, Reddit, LinkedIn (dincolo de ce apare în schema proprie).
- Orice citare reală în ChatGPT/Perplexity/Google AIO dincolo de cele 4-5 interogări stare civilă testate manual în iulie (nu am folosit DataForSEO — indisponibil în acest mediu).
- Domain Rating / backlink profile (semnal cu cea mai slabă corelație oricum).
