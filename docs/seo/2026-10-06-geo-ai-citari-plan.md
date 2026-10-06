# Cum devenim sursa citată de asistenții AI (ChatGPT, Copilot, Gemini, Perplexity) — plan pe 4 site-uri

**Data:** 06.10.2026 · **Autor:** analiză Claude, la cererea lui Raul · **Stare:** propunere, nimic implementat din planul de mai jos.

Pe scurt: asistenții AI ne aduc deja comenzi (25 începute, 5 plătite, 2.290 lei în 90 de zile, doar pe eghiseul), aproape toate pe pagini care răspund la o problemă concretă și actuală. Tehnic suntem în regulă: roboții AI au acces și primesc conținutul fără JavaScript. Ce lipsește: semnale de prospețime pe CJO, mențiuni ale brandului în afara site-urilor noastre și pagini de tip „răspuns la zi" pe teme unde clientul întreabă un AI înainte să cumpere.

---

## 1. Ce spun experții (2026) — dovezi, separat de opinii

### Dovezi (date sau documentație oficială)

| Constatare | Sursa și data |
|---|---|
| **Google: nu există cerințe speciale** pentru AI Overviews / AI Mode. Nu trebuie fișiere AI, `llms.txt` sau markup nou; contează aceleași lucruri ca la SEO normal (pagina să fie indexabilă și eligibilă pentru snippet). | Google Search Central, „AI features and your website" ([link](https://developers.google.com/search/docs/appearance/ai-features)) |
| Search Console are, din **03.06.2026**, raport separat de afișări în AI Overviews / AI Mode (lansare treptată, nu la toate site-urile). | Google Search Central Blog, iunie 2026 ([link](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)) |
| **ChatGPT search** afișează doar site-urile care nu blochează `OAI-SearchBot`. `GPTBot` (antrenare) e separat: poți fi în căutare fără să fii în antrenare. Modificarea în robots.txt se aplică în ~24 h. | OpenAI, Publishers FAQ și documentația boților ([link](https://developers.openai.com/docs/bots)) |
| ChatGPT search și Copilot folosesc încă indexul Bing (ChatGPT trece treptat pe indexul propriu). **Ce nu e în Bing, ChatGPT citează greu.** | SEJ / analize 2025–2026 ([link](https://returnonnow.com/2024/11/bings-importance-for-chatgpt-search-ranking/)); de verificat periodic |
| **Bing Webmaster Tools are din feb. 2026 raportul „AI Performance"**: ce pagini citează Copilot, pe ce interogări („grounding queries"), câte citări pe zi. Export CSV. | Search Influence, 2026 ([link](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/)) |
| **`llms.txt` nu e citit de AI**: 97% din fișierele `llms.txt` n-au primit nicio cerere în mai 2026; boții AI = 1,1% din cereri. Google spune în scris că îl ignoră. | Ahrefs, iunie 2026, loguri de la 137.000 de domenii ([link](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/)) |
| **Schema (JSON-LD) adăugată nu crește citările**: 1.885 de pagini cu schema nouă vs 4.000 de control, AI Mode +2,4%, ChatGPT +2,2% (zgomot), AI Overviews ușor în jos. | Ahrefs, 2026 ([rezumat](https://www.seroundtable.com/study-schema-citations-study-41311.html)) |
| **Mențiunile brandului bat backlinkurile 3 la 1**: corelație 0,664 (mențiuni pe web) vs 0,218 (backlinkuri); mențiunile pe YouTube ~0,737, cel mai puternic semnal. Numărul de pagini publicate nu contează. | Ahrefs, 75.000 de branduri, 2025 + actualizare dec. 2025 ([link](https://ahrefs.com/blog/ai-brand-visibility-correlations/)) |
| **Prospețimea contează**: AI citează conținut cu 25,7% mai nou decât ce e în top organic; ChatGPT cel mai mult. Prospețimea vine din **actualizări**, nu din pagini noi: peste un sfert din paginile „proaspete" au fost publicate cu peste 2 ani în urmă și doar întreținute. | Ahrefs, 17 mil. citări ([link](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content)); Seer Interactive 2026 ([link](https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026)) |
| **AI Overviews citează tot mai mult pagini din afara top 10** (Ahrefs: ~76% din top 10 în iul. 2025 → ~38% în mar. 2026), din cauza „query fan-out": răspunsul se construiește din sub-întrebări. Deci paginile care răspund exact la sub-întrebări (acte necesare, cât costă, cât e valabil, ce faci dacă X nu merge) sunt citate chiar dacă nu iau cuvântul principal. | Comparație de studii, 2026 ([link](https://apiserpent.com/blog/ai-overview-citations-vs-rankings-overlap)) |
| Platformele citează surse diferite: ChatGPT ↔ Perplexity doar ~11% domenii comune. ChatGPT înclină spre enciclopedic (Wikipedia), Perplexity spre Reddit, AI Overviews spre YouTube. | Index agregat din 6 studii, 680 mil. citări ([link](https://everything-pr.com/ai-platform-citation-source-index-2026)); Wellows ([link](https://wellows.com/blog/ai-citation-overlap-study/)) |
| Vizitatorii veniți din AI convertesc mai bine decât organicul (Semrush: ~4,4×; alte studii 1,3×–2×). Volumul rămâne mic (~1–2% din trafic). | Agregări 2026 ([link](https://guptadeepak.com/state-of-ai-search-2026-statistics/)) — multiplicatorul variază mult, nu-l folosiți ca promisiune |

### Opinii frecvente fără dovezi solide

- „Scrie pentru AI" cu paragrafe-rezumat la începutul fiecărei secțiuni: plauzibil (fan-out caută răspunsuri scurte), dar fără studiu controlat.
- Pagini „agent-ready" pentru ChatGPT Atlas / Agent Mode (formulare fără popup-uri, pași deterministici): logic, dar agentul se oprește oricum la plată și identitate; impact mic pe un serviciu cu KYC.
- Fișiere și markup „pentru AI" (llms.txt, schema extinsă): dovezile de mai sus spun că nu ajută. Nu investim timp.

---

## 2. Unde suntem (audit 06.10.2026)

### Acces roboți

| Site | OAI-SearchBot / ChatGPT-User | GPTBot | PerplexityBot | ClaudeBot | Bingbot | CCBot | llms.txt |
|---|---|---|---|---|---|---|---|
| eghiseul.ro | ✅ (fără `/comanda/`) | ✅ | ✅ | ✅ | ✅ | ✅ (regula `*`) | ✅ |
| cazierjudiciaronline.com | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ blocat | ✅ |
| documentero.ro | ✅ (regula `*`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ecazier.ro | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ blocat | ❌ (404) |

### Conținut fără JavaScript

Testat cu user-agentul fiecărui bot (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, bingbot) pe 5 pagini de bani: toate 200, `<main>` prezent, textul paginii în HTML-ul brut, **zero blocuri ascunse de Suspense** (`<div hidden id="S:…">`). Problema din septembrie (memoria `accessibility-tree-ai-agents-2026-09`) nu se mai vede pe aceste pagini.

### Alte constatări

- **HTML foarte greu**: `/servicii/cazier-judiciar-online/` are ~670 KB de HTML brut, prima pagină eghiseul ~530 KB, CJO ~330 KB cu 18 blocuri JSON-LD. Unii fetcheri trunchiază paginile mari; nu avem dovadă că ni se întâmplă, dar e un risc ieftin de redus.
- **Prospețime vizibilă**: documentero are „Actualizat la 5 octombrie 2026" vizibil + `dateModified`; ghidul ANCPI eghiseul are `dateModified` 21.08. **Paginile de oraș CJO n-au nici dată vizibilă, nici `dateModified`, nici autor** — CJO e site-ul cu cel mai mult trafic.
- `llms.txt` eghiseul: scrie „Documentele sunt emise de instituțiile oficiale" (perechea interzisă de regulile noastre) și listează rovinieta ca serviciu (e afiliere). Corecție de text, nu de impact.
- Bing: ecazier și documentero au fost adăugate azi; IndexNow e live pe toate 4. Raportul „AI Performance" din Bing nu l-am putut citi (extensia Chrome s-a deconectat).

---

## 3. Ce ne aduc deja asistenții AI (eghiseul, ultimele 90 de zile)

25 de comenzi începute din ChatGPT, Gemini, Copilot, Perplexity și Claude; **5 plătite, 2.290 lei**. CJO nu salva sursa până azi, deci nu avem date de acolo.

| Pagina de intrare | Comenzi începute | Plătite | Serviciu |
|---|---|---|---|
| `/ancpi-nu-functioneaza/` (status live al avariei ANCPI) | 7 | 1 | extras CF |
| `/servicii/extras-de-carte-funciara/` | 4 | 0 | extras CF, identificare |
| `/servicii/cazier-judiciar-online/` | 2 | **2 (477 + 1.546 lei)** | cazier judiciar, extras multilingv |
| `/certificat-constatator-pentru-banca/` | 1 | 1 | constatator |
| `/comanda/extras-carte-funciara/` (direct din Claude) | 2 | 1 | extras CF |
| prima pagină (Gemini, Perplexity) | 4 | 0 | extras CF, identificare |
| altele (naștere pierdut, verificare proprietar, cum aflăm nr. CF, identificare) | 5 | 0 | — |

Ce înseamnă:
- **Paginile citate sunt răspunsuri la o problemă concretă și actuală** („ANCPI nu funcționează", „certificat constatator pentru bancă"), nu paginile generice. Asta se potrivește cu studiile despre prospețime și fan-out.
- Banii mari vin pe stare civilă și cazier (1.546 lei extras multilingv, 477 cazier), dar volumul e pe extras CF (89 lei), unde conversia e mică.
- Claude a trimis un client direct pe pagina de comandă — de-aia contează ca `/comanda/` să nu fie blocată pentru agenții care acționează la cererea utilizatorului.
- Două comenzi cu sursa „chatgpt" (fără .com) din 21.09 sunt probabil din campania ChatGPT Ads, nu citări organice.

---

## 4. Plan, în ordinea priorității

Regulile din `.claude/rules/content-and-seo.md` rămân: fără date inventate, fără pagini din șablon, maximum 1–2 pagini noi pe săptămână, `dateModified` doar când pagina chiar s-a schimbat.

### A. Tehnic, rapid (o zi de lucru în total)

| # | Ce | De ce | Impact | Efort |
|---|---|---|---|---|
| A1 | **Raportul AI Performance din Bing**, pe toate 4 site-urile, export lunar în `docs/seo/gsc-data/` | singura sursă care arată exact ce pagini citează Copilot (și indirect ChatGPT, care folosește Bing) și pe ce întrebări | mare (decizii pe date) | 30 min/lună, Raul din browser |
| A2 | **Raportul AI din Search Console** (dacă e activ pe proprietăți) | aceeași informație pentru AI Overviews / AI Mode | mare | 15 min/lună |
| A3 | Permite `ChatGPT-User`, `Claude-User`, `Perplexity-User` pe `/comanda/` (paginile rămân noindex) | sunt agenți care deschid pagina la cererea omului; un client a venit deja direct pe `/comanda/` din Claude | mic–mediu | 15 min |
| A4 | Decizie Raul: deblocare `CCBot` pe CJO și ecazier | Common Crawl intră în datele de antrenare ale multor modele; fără el, modelele „știu" mai puțin despre CJO când răspund fără căutare | incert, pe termen lung | 5 min |
| A5 | `dateModified` reală + rând vizibil „Actualizat la …" + autor (pagina avocatei sau `SITE_AUTHOR`) pe paginile de oraș CJO și pe paginile principale CJO | prospețimea e semnalul cu cele mai multe dovezi; CJO n-are niciunul | mediu | 2–3 h |
| A6 | Scade HTML-ul paginilor de serviciu eghiseul (670 KB): scripturi/JSON-LD duplicat, recenzii încărcate în HTML | risc de trunchiere la fetcherii AI + viteză | mic–mediu | 3–4 h |
| A7 | Corectat textul din `llms.txt` eghiseul („oficiale", rovinieta); `llms.txt` pe ecazier **nu** e nevoie | igienă; fișierul nu aduce citări | foarte mic | 10 min |

### B. Conținut: răspunsuri la zi, nu pagini noi în masă

| # | Ce | De ce | Impact | Efort |
|---|---|---|---|---|
| B1 | **Repetă tiparul „status live"** acolo unde există o problemă reală și repetată: de ex. „SPV ANAF nu merge — cum obții cazierul fiscal acum", „ghiseul.ro / e-Terra: ce funcționează azi". Doar când există o avarie sau o schimbare reală, cu date verificate și actualizate pe parcurs | `/ancpi-nu-functioneaza/` a adus 7 comenzi din AI; AI preferă exact pagini actuale care răspund la „X nu merge, ce fac?" | mare, dar ocazional | 2–4 h pe pagină, doar la eveniment |
| B2 | **Bloc „răspuns scurt" (2–4 propoziții) sus pe paginile de bani**: preț, termen, ce primești, cine eliberează. Există deja pe documentero (`QuickAnswer`) — de extins pe paginile CJO de oraș și pe serviciile eghiseul fără el | fan-out caută răspunsuri scurte la sub-întrebări (cât costă / cât durează / cât e valabil) | mediu | 1 h pe pagină, 1–2 pe săpt. |
| B3 | **Actualizări reale programate** (nu pagini noi): o dată pe lună, verificat prețuri, termene, legislație pe top 10 pagini per site și pus data vizibilă doar dacă s-a schimbat ceva | prospețimea vine din întreținere, nu din volum | mediu | 2 h/lună |
| B4 | Pagini de întrebare directă unde avem comenzi și lipsește răspunsul: „certificat constatator pentru bancă" a convertit; candidați: „cazier judiciar pentru Uber/Bolt", „extras multilingv pentru căsătorie în Italia", „cazier pentru viză Canada" — doar dacă au cerere reală (GSC/Bing) și conținut propriu | sub-întrebările din fan-out; respectă regula 1–2 pagini/săpt. | mediu | 3 h pe pagină |

### C. Mențiuni în afara site-urilor (cel mai puternic semnal, cel mai lent)

| # | Ce | De ce | Impact | Efort |
|---|---|---|---|---|
| C1 | **Comunicatul de presă cu date agregate CJO** (draft în `seo/2026-10-06-cjo-linkuri-drafturi.md`) | mențiunile de brand în presă corelează de 3× mai puternic decât backlinkurile cu vizibilitatea în AI | mare, în 1–3 luni | trimis de Raul |
| C2 | **Articolul avocatei în presa diasporei** (același draft) | diaspora întreabă AI-ul în italiană/spaniolă/engleză despre acte românești; o mențiune pe un site din comunitate e exact sursa citată | mediu–mare | aprobare avocată |
| C3 | **2–4 clipuri YouTube scurte, reale** (ex.: „cum arată cazierul judiciar și ce scrie pe el", „extras multilingv vs certificat — care îți trebuie"), cu numele brandului în titlu/descriere | YouTube = cel mai puternic semnal măsurat (0,737); AI Overviews citează mult YouTube | mare, lent | o zi de filmare/editare |
| C4 | Răspunsuri utile, semnate, pe forumuri/Reddit/grupuri de diaspora unde se întreabă despre acte (fără spam, fără linkuri forțate) | Perplexity citează masiv Reddit; mențiunile contează și fără link | mediu | 1 h/săpt., cineva din echipă |
| C5 | Profil Google Business / recenzii reale și răspunse | recenziile publice sunt citite de AI la întrebări „e de încredere X?" | mic–mediu | deja existent, de întreținut |

### Ce NU facem

- `llms.txt`, schema „pentru AI", pagini generate în masă pentru întrebări: dovezile spun că nu ajută, iar paginile în masă au fost cauza penalizării din august.
- Date de actualizare false sau cifre inventate „ca să pară proaspăt" — încalcă regula 3 și e exact ce caută spam update-urile.
- Linkuri cumpărate fără `rel=sponsored` (vezi `seo/2026-10-06-cjo-backlinks-plan.md`).

---

## 5. Cum măsurăm

- Lunar: comenzi pe canalul `ai_assistant` din `/admin/marketing` (eghiseul) și din cardul „Comenzi pe canal" (CJO, date din 06.10).
- Lunar: exportul AI Performance din Bing și raportul AI din Search Console, pagini și interogări citate.
- Prima comparație: 06.11.2026 (o lună de date CJO).

Surse: legăturile din tabelul de la §1 (accesate 06.10.2026).

## Anexă 06.10: Bing „AI Performance” (Copilot + parteneri), ultimele 3 luni

**eghiseul.ro:** 70.700 de citări, în medie 45 de pagini citate pe zi, 399 de întrebări.
- Domină calculatoarele: „calcul salariu net” 6.700 (10,8% din citările pe acea întrebare), „calculator tva” 2.200, „verificare rovinieta” 2.100, „calculator termene judiciare” 1.400 (21,8%).
- Pe documente: „certificat casatorie” 898 (27,7%), „certificat de integritate comportamentala” 695 (36,5%), „certificat de casatorie” 581 (25,5%).

**cazierjudiciaronline.com:** 1.900 de citări, ~5 pagini pe zi, 16 întrebări. Cele mai citate:
- „cazier judiciar persoana juridica” 94 (17,1%), „cazier judiciar online persoane juridice” 70 (27,6%);
- valabilitatea: „valabilitate cazier judiciar” 89 (37,1%), „cat este valabil cazierul judiciar” 32 (26,9%), „cazier judiciar valabilitate” 9 (64,3%);
- „cazier fiscal persoana juridica” 12 (100%) — pagina care acum explică faptul că facem doar persoane fizice;
- „formular cerere cazier judiciar” 6 (100%), „program cazier judiciar bucuresti” 19.

**Ce înseamnă:** Copilot ne citează deja mult, mai ales pe întrebări de tip „cât e valabil”, „ce acte”, „cum calculez”. Paginile de valabilitate și cele pentru persoane juridice sunt cele mai citate pe CJO, deci acolo merită blocurile de răspuns și data de actualizare. Raportul nu arată clicurile din AI; comenzile din AI le vedem în `orders.attribution` (canal `ai_assistant`).
