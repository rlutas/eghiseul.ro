# Sinteză audit SEO: 4 site-uri, 02.11.2026

Surse: `01-cjo.md`, `02-eghiseul.md`, `03-ecazier.md`, `04-documentero.md`, `05-competitie-caziere.md`, verificate față de `.claude/rules/content-and-seo.md`. Read-only: nimic editat în repo.

## 1. Scoruri și trend GSC

| Site | Scor | Trend GSC | Ce spune |
|---|---|---|---|
| eghiseul.ro | 72 | 24.183 clicuri/săpt. (03.08) → 2.114 (26.10, 6 z); impresii −96% pe 20.08, apoi încă −40% pe 16–17.10 | `/servicii/` nu se recuperează (1.154 → 534 impresii/săpt.); comercialele pe poziții 25–90, informaționalele pe 1–3 |
| cazierjudiciaronline.com (CJO) | 72 | 3.823 (21.09) → 809 (26.10, 6 z); poziția 5,0 → 6,4 din 16–19.10 | fără deploy CJO 15.10–01.11 → treaptă externă; AIO + hub.mai/IPJ peste noi pe orașe |
| ecazier.ro | 71 | 270 → 620 impresii/săpt., poziția 12,9 → 10,6 (date doar din 20.09) | crește; nișa reală e auto (Uber/Bolt poz. 6) |
| documentero.ro | 82 | ~500–650 afișări/săpt., palier de 4 săpt.; 85 clicuri total | ghidurile trag; paginile de serviciu nu prind query-urile principale |

## 2. Cauze comune (cross-site)

1. **Aceeași firmă, 4 domenii, aceleași servicii.** Footer-uri cu linkuri între ele, același avocat, aceleași prețuri, același profil Google de recenzii (eGhișeul) afișat și pe CJO. Riscul nu e textul duplicat (Jaccard CJO↔ecazier 0,005–0,046), ci „mai multe site-uri spre același funnel” dacă nișele se suprapun.
2. **Treapta din 16–19.10 lovește simultan CJO și eghiseul**, fără deploy pe CJO. Deci cauza e externă (reevaluare post-update din septembrie și/sau extinderea AIO). Cardurile de vânzare de pe eghiseul din 14.10 rămân doar o ipoteză de testat.
3. **SERP-ul s-a mutat spre guvern + AIO.** hub.mai și IPJ stau pe 1–2, iar AIO răspunde la „unde/când”. Plafonul de CTR e parțial structural.
4. **Homepage-ul canibalizează pagina de serviciu** pe 3 din 4 site-uri: eghiseul (cazier: `/` 474 impr. poz. 26 vs serviciu 20), ecazier (auto/fiscal pe `/` la 20–28), CJO (`/` 7,4 → 10).
5. **Fapte care se contrazic între pagini, `llms.txt` și schema** (termene, prețuri, PJ, „instant”, „24-48”), pe toate site-urile mai puțin documentero. AIO și LLM-urile citesc exact aceste surse.
6. **Șabloane comune de schema/date:** `Product` pe servicii (Merchant listings, shipping 0 RON fals), `lastmod` înghețat/unic, „documente oficiale”.
7. **Recenzii inventate:** au fost scoase din CJO, dar au rămas hardcodate pe ecazier.

## 3. Verificat de mine azi (curl, 02.11)

- **ecazier `/cazier-fiscal`:** „Andreea N.”, „Daniel S.” și „Mihaela R.” sunt încă în HTML. `/comanda` are încă „ONLINE10 (10%) pentru orice comandă online”. Homepage-ul are 6× „documente/documentelor oficiale”. ✔ C1/C2/H4 ecazier sunt confirmate.
- **CJO:** `llms.txt` r.24, 27, 36 și 68 au încă „10 RON”, „PJ do NOT have a criminal record” și „250 RON”. `/cazier-judiciar-online` dă **404**. Homepage-ul are 0 `"@type":"Review"`. ✔ H1/L1 sunt confirmate, iar fix-ul de recenzii e live.
- **eghiseul `/`:** meta description „Livrare… în 24-48 ore” (×3: meta, og, twitter). FAQ/schema spun „instant pe email” la extras CF și constatator. ✔ H1 eghiseul e confirmat.

## 4. Plan unic (max 15)

| # | Prio | Site | Fix | Fișier/pagină | Eșec dacă | Indicator |
|---|---|---|---|---|---|---|
| 1 | Critical | ecazier | Scoate testimonialele inventate (3+6+6) sau înlocuiește-le cu blocul de recenzii Google cu sursă; fără `Review` | `cazierjudiciaronline.com/src/app/ecazier/{cazier-auto,cazier-fiscal,comanda}/page.tsx` | `curl ecazier.ro/cazier-fiscal \| grep -c "Andreea N."` > 0 | impresiile `/cazier-fiscal`, `/cazier-auto` nu scad la următorul update |
| 2 | Critical | ecazier | Șterge „ONLINE10 automat”. Cuponul rămâne valabil **doar pentru cine îl introduce** (decizia lui Raul) | `src/app/ecazier/comanda/page.tsx:310` | `grep ONLINE10` pe `/comanda` live > 0 | n/a (ANPC/conformitate) |
| 3 | Critical | CJO | „Request indexing” pe `/`, auto, fiscal, diaspora, integritate + Iași/Brașov/Timișoara; Google are încă Review cu ERROR din indexul vechi | GSC › URL Inspection | `last_crawl_time` < 02.11 08:45 UTC peste 7 zile | Enhancements › Review snippets → 0 itemi |
| 4 | High | CJO | Rescrie `llms.txt` după paginile live (PJ, taxă gratuită la ghișeu, 198 lei, link spre `/`) | `public/llms.txt` r.13, 24, 27, 36, 68 | `grep -E "250 RON\|10 RON\|do NOT have" public/llms.txt` găsește ceva | răspuns ChatGPT/Perplexity la „cazier judiciar firma online” (lunar) |
| 5 | High | eghiseul | O singură sursă pentru termen/preț pe homepage și în `llms.txt` (DB `services`/`formatEstimatedDays`); scoate „24-48” de la cazier și „instant” de la CF | `src/components/home/faq-data.tsx`, `featured-services.tsx`, `how-it-works-section.tsx`, metadata `src/app/(eghiseul)/page.tsx`, `public/llms.txt` | grep „24-48”/„instant” în HTML-ul de pe `/` | citări AI corecte pe „eghiseul extras carte funciara” |
| 6 | High | ecazier | Termen unic din config: „3–5 zile lucrătoare, urgent 1–2” | `src/app/ecazier/page.tsx`, `src/app/ecazier/comanda/page.tsx` | `grep -c "1-4 zile"` live > 0 | n/a (încredere/AIO) |
| 7 | High | eghiseul | Homepage-ul devine hub de brand: H1/title fără „cazier judiciar”, plus link cu ancoră exactă spre fiecare serviciu | `src/app/(eghiseul)/page.tsx`, `src/components/home/*` | după 4 săpt. `query,page` arată tot `/` pe „cazier judiciar online” | raport impresii serviciu/homepage pe „cazier*” (azi 20/474) |
| 8 | High | ecazier | Homepage pe „cazier auto, fiscal și judiciar” (auto primul) + ancore exacte spre `/cazier-auto` | `src/app/ecazier/page.tsx` (H1, schema r.99) | `/` are încă >30% din impresii pe „acte cazier auto” după 4 săpt. | 1 URL/query; `/cazier-auto` sub poz. 10 pe „cazier auto online” |
| 9 | High | CJO | Homepage: title fără „HUB MAI”, H1 coerent cu 3–5 zile, dată „Actualizat” reală | `src/app/page.tsx` | CTR pe `/` < 0,4% la poziție egală, 3 săpt. | impresiile pe `/` > 2.500/zi lucrătoare |
| 10 | High | CJO | Lotul de orașe pe modelul Iași (Pe scurt, toate ghișeele, GovernmentOffice, 4–6 vecini în loc de blocul de 38), **max. 1–2/săpt.**: Constanța, Tg. Mureș, Sibiu, Ploiești, Satu Mare | `src/app/cazier-judiciar-online/[city]/page.tsx` + datele per oraș | poziția pe „cazier <oraș>” nu revine sub 4 în 3–4 săpt. față de orașele nerefăcute | poziția pe „program cazier <oraș>”, test vs control |
| 11 | High | ecazier | Scoate „documente oficiale” (H2, footer, `serviceType`) înainte de apelul Ads | `src/app/ecazier/page.tsx:99,362`, `cazier-auto/page.tsx:74`, `cazier-fiscal/page.tsx:80`, `src/components/shared/Footer.tsx` | grep „documente(lor) oficiale” live > 0 | apelul de politică Google Ads trece |
| 12 | Medium | CJO + eghiseul | Scoate `Product`/`HowTo`/`LocalBusiness` de pe servicii; păstrează `Service`+`Offer`+`Organization` (eghiseul: shipping 0 RON fals) | CJO `src/app/page.tsx` + 7 pagini; eghiseul `src/lib/seo/schema.ts:160` | GSC încă raportează „Merchant listings” | Rich Results fără `shippingRate 0` |
| 13 | Medium | CJO + ecazier + documentero | `lastmod` real per pagină, egal cu `dateModified` și cu data vizibilă; schimbat doar când se schimbă faptele (regula 3); retrimite sitemap-urile | CJO `src/config/sitemap-dates.ts` + `src/app/sitemap.ts:216`; ecazier `page-dates.ts`; `src/config/documentero-sitemap.ts` | `curl /sitemap.xml` arată tot 10.06 / 06.10 pe toate | `last_crawl_time` < 7 zile pe paginile schimbate |
| 14 | Medium | documentero | Reia 1 ghid/săpt. pe query-uri cu afișări fără pagină (celibat/Anexa 18 întâi), fiecare cu ≥5 inlinkuri înainte de publicare; descrierea de la celibat ≤155 caractere | `src/app/documentero/ghiduri/*`, `certificat-de-celibat/` metadata | ghidul nou are < 50 afișări în 21 zile | query-uri distincte/săpt.; CTR celibat ≥3% |
| 15 | Medium | eghiseul + documentero | Reia măsurarea săptămânală (GSC prin API — contul `claude-seo@caziere` are deja acces la `https://eghiseul.ro/` — + SERP `&pws=0`) | GSC › Utilizatori; tabelul din `docs/documentero/continut-si-seo.md` | tabelul se oprește tot la 21.09 pe 30.11 | rând nou până pe 09.11 |

De făcut azi (texte simple): 1, 2, 3, 4, 6. În săptămâna asta: 5, 7, 9, 11. Restul se face în ritmul regulii 2.

## 5. Ce NU facem

- **Fără pagini noi pe comune, sectoare sau județe** (modelul infocazier: 3.284 de pagini; digigov: 145 CF). Încalcă regulile 1–2. Tabelul „comună → ghișeu” intră în pagina existentă.
- **Fără orașe sau clone CJO pe ecazier.** ecazier rămâne pe auto + fiscal + ghiduri pentru șoferi. Linkurile între branduri rămân contextuale, nu blocuri sitewide.
- **Fără loturi:** max. 1–2 pagini noi/rescrise pe săptămână **per site** și 3 ghiduri noi pe săptămână în total pe cele 4.
- **Fără revert** la cazierul eghiseul rescris pe 06.10 și fără schimbări de structură 4 săptămâni (se citește semnalul).
- **Formularul nu iese din primul ecran pe orașele CJO** (incidentul 05–08.10: formulare ÷3). Propunerea din competiție (formularul la al doilea scroll) se testează doar pe 5–6 orașe, cu CTA în primul ecran, și se oprește dacă formularele scad >25%.
- **Fără `aggregateRating`/`Review`** nicăieri până nu există recenzii vizibile pentru acel serviciu. Badge-ul „4,9/5” pe CJO poartă sursa în badge („eGhișeul.ro, aceeași firmă”) sau iese din hero.
- **Nu alinia prețul de cetățean străin/permis străin** între CJO (350) și ecazier (315): Raul a decis „rămâne așa”.
- **Nu copia prețul 149 lei / 24–48h** al concurenței și nu promite termene sub cele din config.
- **Nu muta 301 eghiseul → documentero** până când documentero nu îl depășește pe aceeași interogare, măsurat.
- **Nu explica totul prin AIO:** saltul de poziție din 16–19.10 e real, inclusiv pe homepage și auto.
- **Nu scoate FAQPage ca „fix”** (doar Info) și nu-l adăuga ca tactică.

## 6. Limite

- CJO și ecazier au GSC doar din 20.09. Cifra de ~4.400 de clicuri/săpt. pe CJO în septembrie nu se poate verifica.
- Backlinkurile nu sunt măsurate, iar SERP-ul e un singur snapshot.
- Canibalizarea documentero ↔ eghiseul e doar dedusă (fără acces GSC).
