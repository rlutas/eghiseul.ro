# Ghid: Optimizare conținut pentru AI Search (AI Overviews / AI Mode / GEO)

**Creat:** 2026-06-18
**Scop:** referință OBLIGATORIE de citit înainte de a scrie/edita content pe eghiseul.ro.
**Sursă principală:** [Google AI features and your website](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) + research cross-platform (vezi §8 Surse).

---

## 0. TL;DR (dacă citești un singur lucru)

> **„Optimizarea pentru AI search ESTE SEO."** — Google, oficial. Nu există trucuri „GEO/AEO" separate. Funcțiile AI (AI Overviews, AI Mode) folosesc același index și aceleași sisteme de ranking, prin **RAG** (răspuns ancorat în pagini indexate, cu linkuri) + **query fan-out** (Google generează sub-întrebări).

**Ce contează (dovedit / consens):**
1. Conținut **unic, first-hand, cu expertiză reală** (non-commodity) — ce un LLM NU poate genera singur.
2. **Indexabil + crawlabil**, cu snippet, rapid (Core Web Vitals).
3. **Ranking organic decent** (top-10 ajută mult, dar nu mai e garanție).
4. **Citate, statistici, surse citate** în text — singurul set de tactici dovedit *cauzal* că crește citarea în AI.
5. **Freshness** (conținut recent/actualizat real).
6. **Mențiuni de brand off-site** (PR, Reddit, forumuri) — cel mai puternic *corelat* cu vizibilitatea AI.

**Ce NU funcționează (Google confirmă explicit — nu pierde timp/bani):**
- ❌ `llms.txt`, fișiere „AI", markup special, Markdown pentru AI → **Google le ignoră**.
- ❌ **Chunking** (spargerea în bucățele) → inutil.
- ❌ Scris „special pentru AI" → sistemele înțeleg sensul.
- ❌ **Keyword stuffing** → singura tactică dovedită că **SCADE** vizibilitatea AI.
- ❌ Mențiuni de brand false/artificiale.
- ❌ Structured data ca „obligatoriu pentru AI" (rămâne util pt. SEO clasic / rich results, dar NU e cheia AI).
- ❌ Goana după lungime — corelație ~0 cu citarea (53% din citări = pagini sub 1000 cuvinte).

---

## 1. Cum funcționează funcțiile AI (de ce SEO clasic = AI)

- **RAG (Retrieval-Augmented Generation):** AI-ul extrage din indexul Google pagini reale și le citează cu link. Dacă nu ești indexabil/eligibil pentru snippet → nu poți fi citat.
- **Query fan-out:** Google sparge întrebarea în mai multe sub-întrebări și aduce rezultate pentru fiecare. → favorizează **autoritate topică profundă** (pagină principală + subteme interconectate), nu o singură pagină izolată.
- **Fără garanție:** chiar dacă bifezi tot, Google „poate alege să nu crawl-eze, indexeze sau servească" pagina.

---

## 2. Ce mută acul — ierarhizat după încredere

| Lever | Încredere | Dovadă |
|---|---|---|
| Conținut unic, first-hand (non-commodity) | 🟢 Înaltă | Google oficial; auditul nostru confirmă (vezi §6) |
| Indexabil + crawlabil + snippet | 🟢 Înaltă | Google oficial (precondiție RAG) |
| **Citate + statistici + surse citate în text** | 🟢 Înaltă (cauzal) | Studiul Princeton GEO: +24–28% vizibilitate per tactică |
| Ranking organic top-10 | 🟡 Medie (slăbește) | Ahrefs: 76%→38% în câteva luni; poziția #1 = ~53% șanse AIO vs 36,9% la #10 |
| Freshness / actualizare reală | 🟡 Medie | Ahrefs: citările AI ~26% mai proaspete; ~85% din citări = ultimii 3 ani |
| Mențiuni de brand off-site (PR, Reddit, YouTube) | 🟡 Medie (corelat, nu cauzal) | Ahrefs 75K branduri: mențiuni 0.664 vs backlinks 0.218 — dar vendorii vând tool-uri de tracking, deci bias |
| Structură clară (H2/H3, FAQ, tabele, răspuns-întâi) | 🟡 Medie | consens multi-sursă; ajută „passage-level citability" |
| Multimedia cu alt-text/transcript | 🟡 Medie | Google + SEL |
| Schema.org | 🟠 Slabă pt. AI (utilă pt. SEO clasic) | Google: NU e necesar pt. AI; un studiu secundar zice 2.3× (sursă unică, low confidence) |

**Important — surse secundare conflictuale:** cifrele vendorilor (Ahrefs/Semrush/BrightEdge/Moz) sunt **corelaționale** și se schimbă rapid; toți vând tool-uri de „AI visibility", deci tratează-le ca **direcționale**, nu adevăr absolut. Singura dovadă *cauzală* (citate/statistici/surse) vine din studiul Princeton — dar pe GPT-3.5 simulat, nu pe motoarele de azi.

---

## 3. Diferențe per platformă (orientativ)

- **Google AI Overviews:** cel mai legat de **SEO clasic + E-E-A-T**. ~54% din citări se suprapun cu top-20 organic; multimedia + structură ajută. Trigger ~13% din căutări.
- **ChatGPT Search:** retrieval prin **indexul Bing**; preferă surse de **consens/autoritate** (Wikipedia, Reddit) și roundup-uri recente („Best X 2025"); load rapid corelează cu mai multe citări.
- **Perplexity:** crawler propriu, **freshness foarte puternic** (conținut <12 luni citat ~3× mai des); domină semnalele de comunitate (Reddit); răsplătește **paragraful-răspuns-întâi** + structură clară.
- **Cross-platform:** doar ~11% din domenii se suprapun între motoare → nicio tactică unică nu acoperă tot.

---

## 4. ✅ Checklist pentru scris content (folosește la FIECARE pagină/articol)

**Conținut & expertiză**
- [ ] Oferă valoare **pe care un LLM nu o poate genera**: pași reali, termene reale, **costuri reale**, capcane din cazuri concrete, referințe legale numite (ex. Legea 7/1996, OUG-uri).
- [ ] Include **cifre/statistici** concrete (termen în zile, taxe în RON, % cazuri).
- [ ] **Citează surse oficiale** (ANCPI, ANAF, ONRC, Monitorul Oficial) cu link.
- [ ] Adaugă **specimen/screenshot adnotat** unde e relevant (ex. unde apare nr. CF/cadastral pe extras).
- [ ] Răspunde **direct, în primul paragraf** la întrebarea din titlu (passage-level citability).

**E-E-A-T**
- [ ] **Autor + „verificat juridic"** (Departamentul Juridic, eDigitalizare SRL) vizibil + în schema.
- [ ] Entitate legală + recenzii reale (nu inventate).
- [ ] `dateModified` setat **doar când chiar modifici** (datele uniforme false = semnal de manipulare).

**Structură**
- [ ] H2/H3 logice, secțiuni clare, **tabele** comparative, **FAQ** (long-tail), `HowTo` pentru proceduri.
- [ ] Linkuri interne către servicii/articole conexe (autoritate topică pt. fan-out).

**Tehnic**
- [ ] Indexabil, crawlabil, rapid (Core Web Vitals), mobil OK, HTML semantic (nu „perfect").
- [ ] Imagini cu alt-text; video cu transcript.

**❌ Nu face:**
- [ ] Fără keyword stuffing / `<strong>` pe zeci de fraze.
- [ ] Fără `llms.txt` / markup „pentru AI" / chunking.
- [ ] Fără hedging vag care subminează autoritatea („verifică reglementările locale" când regula e națională).
- [ ] Nu chinui lungimea — relevanța > numărul de cuvinte.

---

## 5. Greșeli istorice de evitat (din practica noastră)
- **`<strong>` spam** (ex. articolul CF colectivă bolduiește ~80 de fraze) — semnal de supra-optimizare pre-AI; păstrează 2-3 emfaze/secțiune.
- **`dateModified` fix `2026-06-16`** pe toate articolele indiferent de schimbare — risc de integritate E-E-A-T.
- **Articole fără autor** — zero semnal uman.

---

## 6. Audit conținut eghiseul.ro (2026-06-18) — unde chiar suntem valoroși

Codebase-ul e **bimodal**: paginile de servicii sunt puternice; articolele de blog sunt subțiri.

**🟢 Puncte tari (de păstrat/replicat):**
- **Paginile de servicii au valoare first-hand reală.** Ex. `src/app/servicii/extras-de-carte-funciara/page.tsx`: tabel comparativ (eGhișeul vs alți operatori vs ghișeu OCPI vs portal ANCPI), secțiunea onestă „e gratis?" cu calea reală MyeTerra/ROeID + delay 72h, bloc pentru imobile nedigitalizate, specimen cu link de verificare ANCPI. **Cunoaștere de operator pe care un LLM nu o poate fabrica.**
- **E-E-A-T pe servicii:** `reviewedBy` (Departamentul Juridic), `aggregateRating`, date publicat/modificat, FAQPage JSON-LD.
- **Recenzii reale, atribuite** (`src/config/reviews.ts`, verbatim din GBP, 4.9★/451).
- **FAQ adânc** pe paginile cheie (CF ~21 întrebări long-tail) — citabil de AI.

**🔴 Puncte slabe (de reparat):**
- **Articolele = commodity content.** `totul-despre-cartea-funciara-colectiva`, `valabilitate-extras-de-carte-funciara` = definiții parafrazate; fără screenshot-uri, fără cifre concrete, fără legi numite, fără termene/costuri reale.
- **`<strong>` spam** în articolul CF colectivă.
- **Zero autor / E-E-A-T pe articole** — `ArticleLayout` nu acceptă props de autor/reviewer; fallback la organizație.
- **`dateModified` fals-precis** uniform.
- **Hedging factual greșit** („reglementări locale" — valabilitatea CF e națională).
- **Stub-uri** (`rolul-si-atributiile-onrc-romania` ~98 linii).
- **Planul SEO din `docs/seo/README.md` e aspirațional** — template-ul bun de la CF nu e încă aplicat la toate serviciile.

**Top 8 îmbunătățiri (ordine de impact):**
1. **Autor + reviewer E-E-A-T pe articole** — extinde `ArticleLayout` + `articleNode` (`src/lib/seo/schema.ts`) cu `author` real + `reviewedBy` + byline vizibil „verificat juridic".
2. **Rescrie cele 3 articole CF** cu valoare first-hand: specimen adnotat, tabel costuri, referințe legale (Legea 7/1996), capcane reale.
3. **De-bolduiește** articolele (strip `<strong>` spam).
4. **Aplică template-ul paginii CF la toate serviciile** (tabel comparativ, „e gratis?", specimen, 20+ FAQ) — `cazier-fiscal-online`, `certificat-constatator-online` etc.
5. **Repară hedging-ul factual** (regula națională, nu locală; extras informare vs autentificare).
6. **`dateModified` onest** — setează data doar la modificări reale.
7. **HowTo + tabele** pe articolele procedurale (ex. „cum afli numărul CF").
8. **Extinde stub-urile ONRC** cu documentele reale emise, termene, „de bază vs IMM vs insolvență".

**Concluzie:** paginile de servicii bifează deja helpful-content/E-E-A-T și sunt citabile de AI; **blogul e veriga slabă** — thin, fără autor, supra-bolduit. Fixul = portarea rigorii din servicii (specimene, cifre reale, legi numite, reviewer uman) în stratul de articole.

---

## 7. Reguli de echipă (de aplicat de acum)
1. Înainte de a publica un articol: trece checklist-ul din §4.
2. Orice articol nou are **autor + reviewer** și `dateModified` onest.
3. Întrebarea-test la fiecare pagină: *„Ce conține asta ce un LLM NU poate scrie singur?"* — dacă răspunsul e „nimic", nu publica până nu adaugi valoare reală.
4. Nu implementa tactici „GEO/AEO" la modă (llms.txt etc.) — Google le-a confirmat inutile.

---

## 8. Surse (verificate 2026-06-18)
**Oficial / autoritar**
- Google — AI features and your website: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Search Engine Journal — Google: AEO/GEO „still SEO": https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/
- Search Engine Land — optimize for AI Overviews: https://searchengineland.com/guide/how-to-optimize-for-ai-overviews
- Search Engine Land — llms.txt nu ajută/dăunează: https://searchengineland.com/google-says-llms-txt-files-wont-harm-or-help-your-search-rankings-480264

**Academic (cauzal, dar GPT-3.5 simulat)**
- Princeton/GT „GEO: Generative Engine Optimization" (KDD 2024): https://arxiv.org/abs/2311.09735 — citate +27,8%, statistici +25,9%, surse +24,9%; keyword stuffing scade.

**Vendori (corelațional, bias comercial — direcțional)**
- Ahrefs — brand mentions corelație: https://ahrefs.com/blog/ai-overview-brand-correlation/
- Ahrefs — ranking & AI citations: https://ahrefs.com/blog/search-rankings-ai-citations/
- Ahrefs — freshness: https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/
- Semrush — ghost citations: https://www.semrush.com/blog/the-ghost-citations-study/
- BrightEdge — rank overlap after 16 months: https://www.brightedge.com/resources/weekly-ai-search-insights/rank-overlap-after-16-months-of-aio
- Per-platform citation behavior: https://discoveredlabs.com/blog/chatgpt-claude-perplexity-and-google-ai-overviews-how-each-platform-cites-sources-differently

> **Avertisment de încredere:** Google = autoritar. Princeton = cauzal dar pe model vechi/simulat. Vendorii = corelaționali, se schimbă rapid (Ahrefs: top-10 76%→38% în luni) și vând tool-uri — tratează-i ca direcționali, nu adevăr.
