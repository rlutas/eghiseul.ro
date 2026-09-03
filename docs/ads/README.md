# Google Ads — index

Contul vechi: **eGhiseul, 677-995-5005** (eghiseul@gmail.com) — BLOCAT pe politica documentelor guvernamentale; decizie 31.08: **cont NOU pe EDIGITALIZARE SRL** (vezi planul de lansare). Toate analizele se scriu aici.

| Doc | Ce conține |
|---|---|
| [2026-08-18-analiza-cont-si-repornire.md](2026-08-18-analiza-cont-si-repornire.md) | starea contului (toate anunțurile respinse pe politica documentelor guvernamentale), istoricul de 2,09M lei la ROAS 1,41, economia pe serviciu (CPA maxim), unde s-au pierdut banii pe termeni de căutare, lista de excluderi |
| [2026-08-18-constatator-analiza-concurenta.md](2026-08-18-constatator-analiza-concurenta.md) | certificat constatator: cei 4 advertiseri, prețurile lor, statistici de licitație, aritmetica CPC vs marjă, anunț + structură de campanie conforme cu politica |
| [2026-08-18-constatator-campanie-construita.md](2026-08-18-constatator-campanie-construita.md) | campania Search-Constatator-2026-08: ce e configurat (licitare, rețele, AI Max, cuvinte cheie, anunț), fixul de tracking `AW-11464910041` și lista de pași rămași |
| [2026-08-18-campanii-live-status.md](2026-08-18-campanii-live-status.md) | **starea finală**: cele 3 campanii pornite (constatator, constatator cu istoric, cazier fiscal), bugete/plafoane CPC, cuvinte cheie, anunțuri, excluderi, plus cele două capcane ale wizardului Google (pasul cu anunțul nu se salvează la refresh) |
| [2026-08-18-topograf-cadastru-research.md](2026-08-18-topograf-cadastru-research.md) | servicii topograf/OCPI (PAD, coordonate Stereo 70, releveu, copii CF): volume și concurență din Planificator, cine licitează în SERP, aritmetica marjei, structura de campanie propusă — plus anunțurile vechi găsite live care duc pe un 404 |
| [2026-08-18-strategie-licitare-decizie.md](2026-08-18-strategie-licitare-decizie.md) | de ce plafonăm CPC-ul la pornire, ce spun Google și practicienii US/UK, planul de trecere la Smart Bidding pe etape |
| [2026-08-31-cont-nou-lansare.md](2026-08-31-cont-nou-lansare.md) | plan 31.08: cont NOU pe EDIGITALIZARE (677-995-5005 rămâne blocat), fixurile de conformitate pe landing (commit `5e81b91`, pattern-ul competitorilor aprobați), campanii StareCivila + CazierFiscal + Constatator cu RSA-uri gata scrise, cuvinte, negative, ținte CPA din analiza 18.08 |
| [2026-09-01-suport-google-escaladare.md](2026-09-01-suport-google-escaladare.md) | **starea curentă**: verdictul suportului (intermediarii privați NU se pot certifica; disclaimerele nu ajută), spend total confirmat 2,09M RON / ROAS 1,41, reply-ul de escaladare (om + telefon + DSA art. 21/P2B), scenariile de răspuns A–D, contestația 58971307 pending |
| [chatgpt/](chatgpt/README.md) | **ChatGPT Ads (OpenAI)** — canal nou, self-serve în RO din 31.08: politica (legal services interzis în afara US; „documente de stat" NU e categorie), audit landing, campania constatator gata de introdus, roadmap servicii |
| [2026-09-02-meta-ads-evaluare.md](2026-09-02-meta-ads-evaluare.md) | Meta Ads: politica NU e blocaj (nu există categorie de documente guvernamentale), Ad Library RO = zero concurență pe cazier/constatator, CFunciara.ro activ de 19 luni pe CF; verdict: nu acum, doar retargeting după ChatGPT |
| [meta/](meta/README.md) | **Meta Ads — dosar complet** (02.09): cercetare US/UK (LegalZoom, ZenBusiness, RushMyPassport, UK), mecanica Meta 2026 + UE, Ad Library live (citate, durate), playbook, plan de test constatator ≤ €300 cu precondiții tehnice |

## Reguli fixe (nu se negociază)

1. **Niciodată „oficial/oficiale" lângă „documente/acte"** — a limitat contul o dată. Vezi memoria
   proiectului și `../seo/2026-07-26-conformitate-si-sesizari-concurenta.md`.
2. Anunțurile spun clar că suntem **serviciu privat de intermediere**, nu instituția.
3. Prețul afișat e cel final, cu taxa instituției inclusă.
4. Nu se pornește nicio campanie fără conversie `Purchase` cu valoare, măsurată corect.
5. Nu se face reclamă la servicii pe care nu le putem livra (azi: tot ce ține de ANCPI).

## Ce urmărim (din 03.09.2026) — ChatGPT Ads + Meta

Stare la 03.09 15:00: **OpenAI** — campania Active, „Not serving" doar pentru brand review + „account getting ready" (5–7 zile, fără acțiune); motivul de politică a dispărut. **Meta** — campania publicată 03.09 15:15, anunțul C0 în review (Processing).

| Când | Unde | Ce verificăm | Prag / acțiune |
|---|---|---|---|
| zilnic | OpenAI Ads Manager → Campaigns → Ads | statusul anunțului `Ad1 T1-D1 pe email` (click pe „+N" lângă Not serving) | dacă reapare „cannot serve in targeted countries" → contestație (docs `chatgpt/01`); dacă „Serving" → începe urmărirea de mai jos |
| zilnic | Meta Ads Manager → Ads | Delivery: In review / Active / Rejected; Amount spent | Rejected → citim motivul, NU republicăm pe orb; Active → urmărim CPM/CTR |
| zilnic (când livrează) | OpenAI: Overview (Spend, Clicks, CPC); Meta: coloanele Results / Cost per result / CTR / CPM | cost, clicuri, CTR | OpenAI: 0 afișări după 3 zile de Serving → bid €2 (docs `chatgpt/04` G). Meta: CTR < 0,8 % și CPM > 45 lei → schimbăm creativul, nu bugetul (`meta/05` §4) |
| zilnic | DB (`orders.attribution`) — SQL din `chatgpt/04` §H; pentru Meta același SQL cu `utm_source = 'meta'` sau `click_platform = 'meta'` | comenzi (draft → paid) pe canal, `utm_content` = anunțul | KPI unic = **cost / comenzi plătite**; ≤ 15 lei scalăm, 15–25 tolerăm, > 25 sau 0 conversii la 150 clicuri → oprim |
| zilnic | OpenAI: Tools → Conversions (Data source Healthy, Event Stream); Meta: Events Manager → dataset 2319629835442431 (PageView, InitiateCheckout, Purchase; Purchase trebuie să apară dedup — browser + server) | evenimentele ajung? | OpenAI „No recent server-to-server events" dispare la prima comandă chatgpt; comenzi plătite cu `utm_source=chatgpt/meta` în DB dar 0 evenimente server → verificăm logurile Vercel pentru `[openai-conversions]` / `[meta-conversions]` |
| săptămânal | Vercel logs filtrate pe `openai-conversions` / `meta-conversions` | erori 4xx/5xx la trimitere | 5xx repetat → notăm și verificăm cheia/token-ul |
| ziua 7 | ambele | citim decizia din `chatgpt/04` §I și `meta/05` §4 | scriem concluzia în jurnal |
| ziua 14 | ambele | verdict final per canal | scalăm / oprim / rămânem doar retargeting (Meta) |

Ce NU e încă la punct: (1) Meta — creativele pătrate c1–c4 de urcat (imaginea curentă e coperta 2,63:1 → nu livrează pe Stories/WhatsApp Status/Threads); (2) OpenAI — nimic, așteptăm review-ul; (3) comun — `public/og/default.png` zice „Documente oficiale online" (încalcă regula 1, de refăcut).
