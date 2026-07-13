# 2026-07-13 (seara) — Favicon Google, Review Snippets fix, analiză competiție CF/Constatator

## 1. Favicon lipsă pe Google — REPARAT

**Problema:** favicon-ul nu apărea în rezultatele Google.

**Cauza:** `/favicon.ico` răspundea **404** — în `src/app/` existau doar `icon.png` (512×512, servit cu URL hash-uit) + `apple-icon.png`. Google folosește frecvent fallback-ul `/favicon.ico`, iar 512px nu e multiplu de 48 (recomandarea Google).

**Fix:** `src/app/favicon.ico` generat din logo (ICO multi-size 16/32/48). Next îl servește la `/favicon.ico`. Verificat live: 200, `image/x-icon`. Commit `8d49a5d`.

**Rămas:** Google actualizează favicon-ul la recrawl (zile → 2 săpt). Grăbire: GSC → inspecție homepage → Request indexing.

## 2. Review snippets GSC: 15 pagini nevalide — REPARAT

**Problema (GSC, export 2026-07-13):** eroarea critică „Tip de obiect nevalid pentru câmpul `<parent_node>`" pe 15 pagini, constant din aprilie (12→15). Zero expuneri cu stele.

**Cauza:** `aggregateRating` era pe `@type: Service` (paginile de servicii) și `@type: Organization` (homepage). Google acceptă review snippets doar pe Product/LocalBusiness etc. — NU pe Service; pe Organization ratingul propriu = „self-serving" → invalid.

**Fix (commit `6d84852`):**
- `src/lib/seo/schema.ts`: `serviceNode()` nu mai emite rating; nod nou **`productNode()`** (Product + AggregateOffer interval prețuri + aggregateRating) adăugat în `@graph` la toate paginile cu rating
- `homepage-schema.ts`: rating scos de pe Organization
- `rovinieta-online` + fallback dinamic `servicii/[slug]`: nod Product adăugat (n-aveau rating deloc) → **toate** paginile de servicii au acum markup valid
- Teste actualizate (18/18 pass)

**Verificat live:** Service fără rating, Product cu rating, homepage curat.

**Rămas (manual):** GSC → raport Review snippets → **Validate fix** (revalidare: zile → 2 săpt).

## 3. Analiză competiție SERP: extras CF + certificat constatator

Analiză detaliată în [`docs/seo/2026-07-13-analiza-competitie-cf-constatator.md`](../seo/2026-07-13-analiza-competitie-cf-constatator.md).

**TL;DR:**
- **Constatator: stăm bine** — articol #3 + serviciu #7-9 pe head terms, #2 pe „pret". Peste noi doar ONRC oficial + 2-3 EMD-uri thin (~800 cuvinte).
- **Carte funciară: problema reală** — #14 pe „extras de carte funciara online", absent top 20 pe „extras carte funciara" / „carte funciara online". SERP dominat de ANCPI oficial (5-6 sloturi) + unghiul „gratuit" (MyTerra) în 3 sloturi editoriale.
- **Competitorii privați NU câștigă prin conținut** (majoritatea fără blog, thin): câștigă prin EMD + vechime + preț mic în title (19-49 lei vs 89 al nostru) + promisiuni viteză (3-20 min).
- Plan de acțiune în doc: title CF fără preț, secțiune + articol „gratuit prin MyTerra", stele Product (fixat azi), OTS/PR, cluster per tip constatator, decizie business preț CF.
