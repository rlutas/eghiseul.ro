# Strategie SEO + GEO — 13 iulie 2026 (post-cutover, date GSC live)

> Prima analiză pe date REALE post-migrare (GSC citit direct, 3 luni + 28 zile, 13 iul 2026).
> Analiza precedentă (2026-06-22) folosea exportul WP pre-cutover din 13 iunie.

## TL;DR

1. **NU suntem invizibili pe „certificat de naștere online"** — suntem **#1 organic pe google.ro** și **citați nominal în AI Overview** („...platforme specializate care se ocupă de delegații, precum eGhișeul.ro"). Percepția „nu apărem" vine din AI Overview-ul lung care împinge organicul sub fold.
2. **Problema reală #1: indexarea post-cutover.** Doar **66 pagini indexate din 204** trimise în sitemap (raport 30.06). Cele 42 pagini CF/județe + 48 cazier/orașe — investiția majoră din iunie — sunt în mare parte neindexate încă.
3. **Problema reală #2: Carte Funciară** — poziție medie 11,6, doar 210 clicuri/3 luni pe cluster. Cel mai slab vertical comercial, cel mai mare potențial (98K expuneri/16 luni pe „extras carte funciara" în datele WP).
4. **Autoritate (AS 31 Semrush, peste caziere.ro)** — dar zero muncă de backlinks începută. Singurul front complet nepornit din planul de iunie.

## Verificare incognito (context curat Playwright, IP RO, 13 iul)

| Query | Poziție eghiseul (incognito) | AI Overview | Observații |
|---|---|---|---|
| certificat de nastere online | **#3** (după centruldevize.ro #1!, hub.mai #2) | DA — **ne citează nominal** | Logat eram #1; incognito #3. centruldevize.ro = competitor de bătut |
| certificat de casatorie online | **#1** | DA — **ne citează cu badge sursă** | Câștigat complet |
| cazier judiciar online | **#7 — dar HOMEPAGE, nu pagina de serviciu!** | DA — recomandă gov gratuit | Pagina `/servicii/cazier-judiciar-online/` NU apare; caziere.ro #5, cazierjudiciaronline.com #4+#6 |
| extras carte funciara online | **ABSENT top 10** | DA — ANCPI 20 lei + MyEterra gratuit; nu ne menționează | efunciara.ro #8 („49 Lei, 20 min, 24/7"), cfunciara.ro #9 |
| certificat constatator online | **#3 — dar ARTICOLUL, nu pagina de serviciu** | DA — ne citează nominal | Serviciul la poz 13,3 în GSC |

AI Overview prezent pe TOATE 5 query-urile; eGhișeul citat nominal pe 4/5 (lipsă: CF).

## Datele complete CSV (export GSC 13 iul, 3 luni, 999 interogări + 160 pagini)

**Serviciile = doar 5% din clicuri (9.305 din 187.651).** Starea comercială exactă:

| Pagină serviciu | Clicuri | Expuneri | CTR | Poziție | Verdict |
|---|--:|--:|--:|--:|---|
| eliberare-certificat-de-nastere | 3.047 | 102.108 | 2,98% | 6,83 | Motorul comercial; 6,8→top3 = ~3× clicuri |
| cazier-auto-online | 2.796 | 25.022 | 11,17% | 4,22 | Vedetă — de protejat |
| cazier-fiscal-online | 785 | 25.211 | 3,11% | 9,38 | Striking |
| eliberare-certificat-de-celibat | 725 | 12.060 | 6,01% | 5,73 | Bun |
| extras-multilingv-nastere | 560 | 14.152 | 3,96% | 5,15 | Bun |
| eliberare-certificat-de-casatorie | 444 | 20.650 | 2,15% | 6,00 | Query „online" #1, dar pagina medie 6 |
| **cazier-judiciar-online** | **426** | **47.830** | **0,89%** | **8,53** | **BOLNAV #1** — homepage rankează în locul ei |
| certificat-de-integritate | 279 | 16.927 | 1,65% | 8,05 | Striking |
| **certificat-constatator-online** | **73** | **15.911** | **0,46%** | **13,34** | **BOLNAV #2** — articolul rankează în locul ei |
| **extras-de-carte-funciara** | **63** | **20.436** | **0,31%** | **13,74** | **BOLNAV #3** — competiție gratuit/49 lei |

**Location pages: moarte deocamdată.** CF județe: max 31 expuneri, 0 clicuri. Cazier orașe: aproape zero date = neindexate (confirmă 66/204).

**Query-uri comerciale în striking distance (de împins):** cazier judiciar online 76K exp poz 5,95 · cazier online 35K poz 5,46 · ghiseul.ro cazier 21K poz 5,24 · certificat constatator online 17,8K poz 6,74 · certificat constatator 17K poz 6,71 · cazier judiciar online gratuit 16,4K poz 6,8.

**Titluri de rescris (poziție top-3, CTR mizer):** „certificat de casatorie" (poz 1,9 / CTR 0,55% / 3.065 exp) · „certificat de nastere" (2,6 / 0,42% / 2.379 exp) · „calculator termene judiciare" (2,9 / 2,36% / 11K exp) · „calcul salariu brut" (3,0 / 2,5% / 22,8K exp).

**Rezerva uriașă necomercială:** calculator salariu net 246K exp poz 4,27 CTR 1,21% + calculator salariu 110K + calcul salariu net 85K — un push featured-snippet aici = mii de clicuri/lună (autoritate + AdSense potențial, nu comenzi).

## Starea pe verticale (GSC domeniu real, 3 luni)

| Vertical | Clicuri | Poziție | Diagnostic |
|---|--:|--:|---|
| Calculatoare + rovinietă | ~150K (80%) | 1,6–4,7 | Cash-cow, sănătos. De protejat. |
| Cazier (toate) | ~7K | 5,5–6,8 pe head | Striking distance: „cazier judiciar online" poz 5,9 / 76K expuneri |
| **Naștere cluster** | 1.680 | 3,6 head / 2,3 duplicat | Sănătos; hub 1.393 clicuri poz 6,3 — de împins în top 3 |
| Căsătorie | 223 | **1,9 head** | Câștigat. CTR 0,6% pe „certificat de casatorie" (3.065 exp) = problemă titlu |
| Celibat | (în naștere) | 2–6 | OK după ghiduri |
| **Carte Funciară** | 210 | **11,6** | SLAB. Paginile noi județe neindexate; head terms pierdute |

## Fapte noi GEO (research iul 2026)

- AI Overviews RO: volatile (retragere aug 2025, revenire); **AI Mode în română din oct 2025**; CTR organic −61% când apare AIO. Overlap top-10 organic ↔ surse citate AIO a scăzut la 17–38% — **rank ≠ citare; GEO e disciplină separată**.
- Surse citate de LLM-uri: **Reddit ~40%**, Wikipedia, media RO mare (Digi24, HotNews, Agerpres). ChatGPT/Copilot citesc **indexul Bing** — fără Bing nu existăm pe 2 din 5 suprafețe AI.
- Ce crește citările (studiu Princeton): **citate +41%, statistici +32%, surse citate +30%**; format answer-first (40–60 cuvinte răspuns complet sub H2-întrebare); 80% din paginile citate au liste/tabele.
- llms.txt: **Google/OpenAI NU îl folosesc** — nu mai investim (îl păstrăm doar actualizat).
- Update Dec 2025: E-E-A-T extins la toate query-urile competitive; specialiștii au câștigat, operatorii anonimi au pierdut → identitate firmă + avocat vizibile = obligatoriu.

## PLAN — 4 fronturi, în ordine

### Front A — Indexare & tehnic (săptămâna asta; S effort)
1. **Request Indexing manual în GSC** pentru top 30 pagini noi (42 CF județe prioritar + 48 cazier orașe + servicii imobiliare noi).
2. **Șterge sitemap-ul vechi WP** (`/sitemap_index.xml` — „Nu s-a putut prelua") din GSC.
3. **Bing Webmaster Tools**: verificare + sitemap + **IndexNow** ping la publish + raportul „AI Performance" (feb 2026) → deblochează ChatGPT search + Copilot.
4. 404-urile WP rămase (10) → audit redirecturi; feed-urile `/feed/` → 410 sau redirect.
5. robots.ts: adaugă UA noi (`Claude-SearchBot`, `Claude-User`, `Perplexity-User`, `Meta-ExternalAgent`).
6. GA4: channel group „AI Traffic" (regex chatgpt|perplexity|claude|gemini|copilot...) — baseline înainte de retrofit.

### Front B — Striking distance on-page (săpt. 1–2; S–M)
1. **Hub naștere** (poz 6,3, 32K exp): linkuri interne către `/duplicat-certificat-de-nastere/` + `/transcriere-certificat-de-nastere/` (lipsesc azi!), refresh `dateModified` (înghețat la 14.06), secțiune diaspora întărită.
2. **CTR pe head terms câștigate**: „certificat de casatorie" poz 1,9 / CTR 0,6% și „certificat de nastere" poz 2,6 / CTR 0,4% — titluri/description rescrise pe intent (model nou 2026, A4, duplicat online).
3. **Cazier**: „cazier judiciar online" poz 5,9/76K exp — refresh + FAQ extins + verifică migrarea `/taxa-cazier-judiciar/` (cannibalization încă deschisă în coadă).
4. **CF recovery**: după indexare județe, refresh hub `/servicii/extras-de-carte-funciara/`, internal links din articolele cadastru care rankează (numar cadastral poz 2).

### Front C — GEO retrofit (săpt. 2–4; M)
1. **Answer-first pass** pe 11 pagini servicii + top 15 articole: sub fiecare H2-întrebare, primele 40–60 cuvinte = răspuns complet care numește entitatea și prețul/termenul/legea.
2. **Densitate statistici + legi citate**: Legea 119/1996, OUG 17/2025 (stare civilă), Legea 290/2004 (cazier), taxe exacte, termene, „peste X comenzi procesate".
3. **FAQPage pe toate serviciile** cu întrebări = query-uri GSC reale.
4. **E-E-A-T entity hardening**: pagină „Despre noi" cu date firmă complete, avocat cu poză/bio, `sameAs` → Google Business Profile, LinkedIn, listafirme/termene.
5. **Freshness pipeline**: „Actualizat: [dată]" vizibil + `dateModified` real; prețuri/termene randate din DB.

### Front D — Autoritate + conținut (continuu; M–L)
1. **Articole noi** (toate trecute prin **/humanizer** — anti-AI-detection, helpful-first):
   - Ce lipsește pe naștere: „certificat de naștere pierdut" e-n striking (poz 5,5) — refresh ghid existent; „certificat naștere copil născut în străinătate" (transcriere — volum diaspora).
   - CF: ✅ „extras CF gratuit vs plătit" (13.07, `/extras-carte-funciara-gratuit/`) · ✅ „verificare proprietar după adresă" (17.07, `/verificare-proprietar-imobil/`).
   - ✅ Constatator per-tip (17.07): landing-uri `/certificat-constatator-de-baza|insolventa|pfa/` + preselect `?tip=` în wizard (vezi `2026-07-17-analiza-verificare-proprietar-constatator-per-tip.md`).
   - Comparative pentru AI Mode: „Ghișeu vs online — costuri, timp, acte (tabel)" per serviciu.
2. **Reddit/foruri RO** (r/Romania, forum.softpedia): răspunsuri autentice cu disclosure, 2–3h/lună — Perplexity/ChatGPT recommendations.
3. **Digital PR**: pitch date proprii („câți români și-au scos cazierul online în 2026") către HotNews/Digi24/StartupCafe — sursele pe care se ancorează AIO.
4. **Directoare + GBP**: Google Business Profile, ANPC vizibil, listări firme.

## Măsurare
- Săptămânal: GSC indexare (66 → țintă 180+ în 4 săpt), poziții head terms per vertical.
- Lunar: trafic AI (GA4 channel), citări Bing AI Performance, test manual AI Overview pe 10 query-uri cheie.

## Decizii de luat (user)
- Prioritate front B vs C dacă timp limitat (recomand B întâi — banii-s în striking distance).
- Buget PR/backlinks (frontul complet nepornit din iunie).
