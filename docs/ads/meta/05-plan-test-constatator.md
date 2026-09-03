# Plan de test Meta — certificat constatator (propus 02.09.2026, NEpornit)

Buget total test: **≤ €300 / 14 zile**. Decizia de pornire: după verdictul ChatGPT Ads (vezi
`../chatgpt/README.md`), sau imediat dacă Raul vrea în paralel — infrastructura e independentă.

## 0. Precondiții tehnice (o zi de lucru, înainte de orice buget)

| # | Ce | Cum |
|---|---|---|
| 1 | Business Manager pe EDIGITALIZARE SRL + verificare firmă (CUI, act, adresă) | Raul, în business.facebook.com |
| 2 | **Pixel Meta consent-gated** | același pattern ca `loadOpenAiPixel()` în `cookie-consent.tsx`: se încarcă doar cu `marketing=true`; `fbq('consent','grant')` |
| 3 | **Evenimente**: `ViewContent` (pagina de serviciu), `InitiateCheckout` (draft creat / pasul 1 al wizardului), `Purchase` (pagina de succes, `event_id` = order_number) | client-side, lângă gtag/oaiq |
| 4 | **Conversions API** din webhook-ul Stripe pentru `Purchase` (dedup pe `event_id` = order_number), hash email/telefon, `fbc`/`fbp` din cookie dacă există | `src/lib/analytics/meta-conversions.ts`, pe modelul `openai-conversions.ts`; env `META_PIXEL_ID` (public) + `META_CAPI_TOKEN` (secret) |
| 5 | **Atribuire**: `fbclid` e deja capturat în `attribution.ts` (`click_platform=meta`) → raport în DB independent de platformă | gata |
| 6 | Beneficiary & payer (DSA) completate la ad set: EDIGITALIZARE SRL | în Ads Manager |
| 7 | Audiențe: (a) vizitatori `/servicii/certificat-constatator-online/` + `/comanda/certificat-constatator` 14 zile, minus Purchase; (b) listă clienți constatator (email hash) → lookalike 1% RO; (c) excludere: cumpărători 30 zile | Ads Manager |

## 1. Structura

```
Campanie: META_Constatator_2026-09  (obiectiv: Sales / conversions)
  Faza A (zilele 1–7):  1 ad set, optimizare InitiateCheckout, €15/zi
     audiență: broad RO 25–60 + sugestie Advantage „antreprenoriat / administrare afaceri"
  Faza B (zilele 8–14): + ad set retargeting (audiența a, 14 zile) €5/zi, optimizare Purchase
                        ad set-ul A trece pe Purchase dacă are ≥ 20 InitiateCheckout
```

Un singur ad set în faza A. Nu se ating bugetul/creativele 5 zile.

## 2. Creative (4 unghiuri, static/carusel, pătrat 1080×1080 + 4:5)

| # | Unghi | Text principal (≤ 125 caractere vizibile) | Titlu | Vizual |
|---|---|---|---|---|
| C1 | Deadline bancă | „Banca cere certificat constatator nu mai vechi de 30 de zile? Îl ai pe email în câteva minute. 89 lei, taxe ONRC incluse." | Certificat constatator online | documentul stilizat (cel din ChatGPT Ads) + „89 lei" |
| C2 | Walkthrough | Carusel 4 carduri: 1 „Introduci CUI-ul" · 2 „Alegi tipul" · 3 „Plătești (taxe incluse)" · 4 „Primești PDF-ul ONRC pe email" | Cum funcționează | 4 carduri, un pas fiecare |
| C3 | Licitație / fonduri | „Dosar de licitație sau fonduri europene? Certificatul constatator, semnat electronic de ONRC, direct pe email. Fără cont ONRC, fără semnătură electronică." | Fără drum la ONRC | checklist „ce cere documentația" cu bifă |
| C4 | Verificare partener | „Semnezi cu o firmă nouă? Vezi administratorii, asociații și starea ei la Registrul Comerțului. Certificat constatator pe email, 89 lei." | Verifică firma înainte | ecran cu „stare: funcțiune ✓" |

Toate cu: „Serviciu privat, nu instituție. Preț final afișat." în text; CTA „Comandă acum";
URL `https://eghiseul.ro/servicii/certificat-constatator-online/?utm_source=meta&utm_medium=cpc&utm_campaign=constatator-2026-09&utm_content=c1` (c1…c4).
Interzis: oficial, avocat, juridic, garantat, instant, „cel mai".

## 3. Măsurare

- Sursa de adevăr: DB — `orders.attribution` cu `utm_source=meta` sau `click_platform=meta`
  (fbclid), status plătit. Platforma doar pentru CPM/CTR/cost.
- Cascadă zilnică: CPM → CTR → clic→landing → InitiateCheckout → Purchase → CPA brut.

## 4. Praguri (după 14 zile)

| Semnal | Verdict |
|---|---|
| CTR < 0,8 % și CPM > 45 RON | creativul nu rupe scroll-ul → schimbăm unghiurile, nu bugetul |
| CTR ok, InitiateCheckout < 3 % din clicuri | landing/preț → verificăm primul ecran, prețul în anunț |
| CPA ≤ 15 lei (comenzi plătite) | scalăm +25 % la 3–5 zile; pornim retargeting pe toate serviciile |
| CPA 15–25 lei | continuăm doar retargeting + lookalike, oprim rece |
| CPA > 25 lei sau 0 conversii la 150 clicuri | oprim rece; păstrăm retargeting 7 zile; concluzie scrisă aici |

Aritmetica: 89 lei cu TVA 21 % → 73,55 net − 30 taxa ONRC − ~3 procesare ≈ **40 lei brut** înainte de impozit/cheltuieli. 30 lei CPA ar mânca aproape toată marja.

## 5. Jurnal

| Data | Ce |
|---|---|
| 02.09 | Plan scris. Precondițiile 2–4 (pixel, evenimente, CAPI) NU sunt implementate. Nu s-a pornit nimic. |
| 03.09 | Precondițiile 2–5 implementate în cod (commit `ccd920d`); 1 (portofoliu + pagină + cont reclame) făcute; pixel `2319629835442431`; creative C1–C4 în `assets/`. Token CAPI generat + validat. Deploy prin `vercel --prod`. **Test live 03.09 10:06** pe `/servicii/certificat-constatator-online/?utm_source=meta&fbclid=TEST…&oppref=test…`: `eg_attribution.last` = {utm_source: meta, click_id, click_platform: meta, oppref} ✓; cu marketing acceptat se încarcă `fbevents.js` + config pixel 2319629835442431 (`fbq.loaded=true`), `oaiq.min.js` + config, gtag ✓. Lipsă: card, campania. |
| 03.09 după-amiază | **Campania introdusă în Ads Manager** (extensia a primit acces la adsmanager.facebook.com): campanie `META_Constatator_2026-09` (id 120252337332570556, Sales, Advantage+ sales campaign, **75 lei/zi**), ad set „AG1 Firma - de baza (broad RO)" (120252337332580556; optimizare InitiateCheckout, dataset eghiseul.ro web, România, 25+, beneficiar/plătitor UE EDIGITALIZARE SRL), anunț „C0 Cover - constatator" (120252337332590556): identitate pagina EGhiseul, imagine **coperta 1640×624** (interimar — ⚠️ toate UI-urile de upload Meta folosesc file picker nativ, inaccesibil din extensie; c1–c4 din `assets/` trimise lui Raul să le urce), text principal „Banca cere certificat constatator nu mai vechi de 30 de zile? Îl ai pe email în câteva minute. 89 lei, taxe ONRC incluse. Serviciu privat, nu instituție.", titlu „Certificat constatator online", descriere „Preț final afișat. PDF semnat electronic de ONRC.", CTA **Order now**; Advantage+ creative enhancements toate OFF (overlays, touch-ups, text improvements, enhance CTA, music, animation); URL de bază curat + UTM în Tracking → URL parameters (`utm_source=meta&utm_medium=cpc&utm_campaign=constatator-2026-09&utm_content=c0-cover`); pixel 2319629835442431 bifat la Website events. Avertisment Meta: imaginea 2,63:1 nu livrează pe WhatsApp Status / FB Stories / Audience Network video / Threads — se rezolvă când urcăm creativele pătrate. **Publish apăsat → cere „Add payment information"** (România / RON / Bucharest precompletate, apoi cardul) → **Raul introduce cardul**; până atunci campania rămâne In draft. Încercare API (system user 61593912696608 + app „Eghiseul WA Assistent" asignate contului): tokenul n-are `ads_management`, app-ul n-are use case Marketing API → abandonat. |
| 03.09 15:00 | Raul a apăsat Publish: **campania + ad setul s-au publicat, anunțul NU** — Ads Manager: „1 ad wasn't published because of errors: No payment method — Visit the billing and payment centre to add a valid payment method". Contul de reclame 1562160259035101 **încă n-are card** (dialogul „Add payment information" se redeschide la Review and publish; business.facebook.com/billing_hub nu e permis în extensia Chrome, deci nu pot verifica Billing direct). Anunțul rămâne **In draft**. Pas următor: Raul adaugă cardul în dialogul deschis (Ads Manager → Review and publish (1) → Add payment information → Next → card), apoi Publish. DB: 0 comenzi atribuite meta (normal). |
