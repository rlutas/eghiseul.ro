# 06 — Audit campanie vs research + plan creativ (static / carusel / video)

Scris 03.09.2026, după publicarea campaniei `META_Constatator_2026-09`. Răspunde la două întrebări:
(1) am respectat ce am descoperit în 01–04? (2) ce formate de creativ merită și ce putem produce singuri.

## A. Audit onest: ce e conform, ce nu

| Regula din research (04/05) | Stare în campania publicată | Verdict | Ce facem |
|---|---|---|---|
| 1 campanie, 1 ad set, broad RO, fără fragmentare | 1 campanie Sales / 1 ad set broad RO 25+ (Advantage+ audience) | ✅ | — |
| Optimizare pe eveniment de sus (InitiateCheckout) 7 zile, apoi Purchase | InitiateCheckout | ✅ | la ≥ 20 InitiateCheckout trecem pe Purchase |
| Buget mic, ≤ €15/zi în faza A, neatins 5 zile | 75 lei/zi (~€15) | ✅ | nu se atinge până 08.09 |
| Beneficiary/payer DSA | EDIGITALIZARE SRL | ✅ | — |
| Pixel + CAPI + dedup, consent-gated | pixel 2319629835442431 pe anunț, CAPI din webhook, dedup order_number | ✅ | — |
| UTM per creativ (`utm_content=c1…`) | `utm_content=c0-cover` în Tracking → URL parameters | ✅ | fiecare anunț nou primește propriul `utm_content` |
| Fără „oficial / avocat / juridic / garantat / instant"; „serviciu privat" + preț final în text | text C1 conform, „Serviciu privat, nu instituție" + „Preț final afișat" | ✅ | — |
| Meta să NU rescrie textul/imaginea (control de conformitate) | Advantage+ creative enhancements 0/5 OFF; music/animation OFF | ✅ | ⚠️ „Optimise text per person" a rămas Enabled — inofensiv cu 1 variantă de text, dar la anunțurile noi îl lăsăm OFF |
| **4–6 creative pe unghiuri diferite** (bancă, licitație, walkthrough, verificare partener) | **1 singur anunț, cu coperta paginii (2,63:1)** | ❌ **cea mai mare abatere** | urcăm C1–C5 (secțiunea C) și oprim C0 după aprobarea lor |
| Formate pătrat 1080×1080 + 4:5; Stories 9:16 | coperta 1640×624 → nu livrează pe Stories / WhatsApp Status / Threads (Meta avertizează) | ❌ | idem — assets-urile pătrate există în `assets/` |
| Retargeting 14 zile minus cumpărători; lookalike din clienți plătitori; excludere cumpărători 30 zile | nu sunt create | ⏳ planificat faza B (ziua 8) | audiența (a) se poate crea acum ca să acumuleze; excluderea cumpărătorilor o punem odată cu ea |
| `ViewContent` pe pagina de serviciu | NU e implementat (avem PageView, InitiateCheckout, Purchase) | ⚠️ minor | de adăugat în `cookie-consent`/landing când atingem codul; nu blochează testul |
| Social proof cu cifră reală | nu e folosit | ⏳ | „peste 30.000 de comenzi din 2019" (istoric WordPress; pe platforma nouă 392 plătite din 06.07) — de folosit doar cu cifra verificată în Oblio/Stripe |

Concluzie: structura, tracking-ul, bugetul și conformitatea sunt conform planului. **Creativul nu este** — rulăm
cu un singur vizual, nepotrivit ca format. Motivul: toate căile de upload Meta (Ads Manager, Media Library,
composer) folosesc file picker nativ, inaccesibil din extensia Chrome; API-ul (adimages) cere `ads_management`
pe un app cu Marketing API, pe care nu-l avem. Drag & drop simulat prin JS: fără efect (03.09).

## B. Static vs carusel vs video — ce spune research-ul, ce facem

| Sursă | Ce zice |
|---|---|
| 02-mecanica §4 | „static/carusel simplu bate video-ul lucios la tranzacțional B2B low-involvement; checklist-uri și «drum fizic vs online» performează" |
| 01-research (opinie industrie) | video scurt cu hook în 2–3 s + CTA; IG mesaje scurte, FB copy mai lung |
| 03-ad-library | cine ține luni/ani: Texas Tower (static + „call now", 22 luni), CFunciara.ro (carusel, 19 luni); LegalZoom rulează video 15/30 s dar vinde emoția înființării, nu un extras |
| Meta (Andromeda 2025) | diversitate de creativ > număr de ad seturi; video + imagine în același ad set ajută livrarea (și Ads Manager ne-o recomandă explicit pe anunțul nostru) |

Decizie: **static + carusel ca bază, un singur video de tip screencast** (nu cinematic). Un video generat
(Higgsfield/Veo) cu „oameni la bancă" ar fi lucios exact în sensul în care research-ul spune că nu merge la
produsul nostru, plus risc de a arăta clădiri/sigle instituționale. Screencast-ul arată produsul real:
pagina, prețul, formularul. Dacă C5 (video) bate static-urile la CTR/CPA după 7 zile, abia atunci investim
într-un video mai elaborat.

**Higgsfield**: MCP-ul NU este configurat în această sesiune (`claude mcp list` nu-l listează). Când îl
adaugi, îl folosim pentru **imagini** de fundal (birou, laptop cu PDF, notar/bancă abstract), nu pentru
video. Prompturi gata de folosit, secțiunea E.

## C. Anunțurile de introdus în ad set-ul AG1 (după ce urci fișierele)

Toate: pagina EGhiseul, CTA **Order now**, URL de bază `https://eghiseul.ro/servicii/certificat-constatator-online/`,
UTM în Tracking → URL parameters, enhancements OFF, „Optimise text per person" OFF, pixel bifat.

| Anunț | Media (assets/) | Text principal | Titlu | Descriere | utm_content |
|---|---|---|---|---|---|
| C1 Deadline banca | `c1-deadline-banca.png` 1:1 | Banca cere certificat constatator nu mai vechi de 30 de zile? Îl ai pe email în câteva minute. 89 lei, taxe ONRC incluse. Serviciu privat, nu instituție. | Certificat constatator online | Preț final afișat. PDF semnat electronic de ONRC. | c1 |
| C2 Walkthrough (carusel) | `c2-pas-1..4.png` — carduri: „Introduci CUI-ul" · „Alegi tipul" · „Plătești, taxe incluse" · „Primești PDF-ul ONRC pe email" | Certificat constatator în 4 pași, fără drum la ONRC și fără semnătură electronică. 89 lei, taxe incluse. Serviciu privat, nu instituție. | Cum funcționează | Preț final afișat. | c2 |
| C3 Licitație / fonduri | `c3-licitatie-checklist.png` | Dosar de licitație sau fonduri europene? Certificatul constatator, semnat electronic de ONRC, direct pe email. Fără cont ONRC, fără semnătură electronică. Serviciu privat, nu instituție. | Fără drum la ONRC | 89 lei, taxe ONRC incluse. | c3 |
| C4 Verificare partener | `c4-verificare-partener.png` | Semnezi cu o firmă nouă? Vezi administratorii, asociații și starea ei la Registrul Comerțului. Certificat constatator pe email, 89 lei. Serviciu privat, nu instituție. | Verifică firma înainte | Preț final afișat. PDF ONRC pe email. | c4 |
| C5 Screencast (video) | `c5-screencast-4x5.mp4` (feed) + `c5-screencast-9x16.mp4` (Stories/Reels, prin „customise per placement") + `c5-screencast-1x1.mp4` | același text ca C1 | Certificat constatator online | Preț final afișat. PDF semnat electronic de ONRC. | c5 |

Când C1–C5 sunt „Active": **oprim C0** (coperta). Nu ștergem, ca să păstrăm istoricul.

C5 e produs local, reproductibil: `assets/c5-record.js` (Playwright, mobil 540×675 @2x → 1080×1350,
landing → scroll → wizard pasul 1) + overlay-uri PNG (PIL) + ffmpeg (concat cu end card). 18 s, H.264.
Regenerare când se schimbă landing-ul: `NODE_PATH=./node_modules node docs/ads/meta/assets/c5-record.js <dir>`.

## D. Stare 03.09 16:10

- Upload: rezolvat prin postări pe pagina de Facebook (www.facebook.com are input real de fișiere) → imaginile apar în Ads Manager la „Page images". Ads Manager/Media Library rămân inaccesibile pentru upload direct.
- Live/în review: C1, C3, C4 (statice din `assets/`). C0 respins (forged goods), contestat.
- Higgsfield: `product-photoshoot` indisponibil (endpoint enhance cade), `generate create gpt_image_2` merge → C6–C8 compuse local. De adăugat ca anunțuri după ce C1/C3/C4 trec review-ul (nu aglomerăm review-ul cu 6 anunțuri simultan).
- De urcat de Raul: `c5-screencast-4x5.mp4` / `9x16` (video; pagina acceptă video prin același input, dar 800 KB × 3 formate — le urcăm când C1–C4 sunt aprobate).

## D0. Pași (istoric)

1. **Raul (2 min)**: Ads Manager → anunțul C0 → Media → Edit → Edit media → **Upload** → selectezi toate:
   `c1-deadline-banca.png`, `c2-pas-1..4.png`, `c3-licitatie-checklist.png`, `c4-verificare-partener.png`,
   `c5-screencast-4x5.mp4`, `c5-screencast-9x16.mp4`, `c5-screencast-1x1.mp4`. Apoi Cancel (nu schimba C0).
   Fișierele rămân în „Account images/videos".
2. **Claude**: creează C1–C5 în AG1 din tabelul C (Duplicate C0 → schimbă media/text/utm), verifică crop
   1:1 / 4:5 / 9:16, Publish, apoi oprește C0 după aprobare.
3. **Claude, ziua 8**: ad set retargeting (vizitatori 14 zile − Purchase 30 zile), buget 25 lei/zi, Purchase.

## E. Prompturi Higgsfield / generator de imagini (când e configurat)

Reguli: fără sigle ONRC / stema României / clădiri instituționale; fără cuvântul „oficial"; document
generic, stilizat; brand navy `#0b1a33` + auriu `#F5C451`; spațiu liber sus pentru text; 1080×1350.

1. *Deadline bancă*: „Close-up of a laptop on a clean desk showing a generic stylized PDF certificate with a
   blue electronic-signature badge, a phone next to it displaying an email notification, warm morning light,
   navy and gold accents, no logos, no text, photorealistic, negative space at the top."
2. *Licitație*: „Flat-lay of a tender dossier folder with a checklist and one highlighted document, a laptop
   screen with a progress bar at 100%, navy/gold palette, minimal, no logos, no readable text."
3. *Verificare partener*: „Two business people shaking hands in a modern office, slightly out of focus, in the
   foreground a tablet showing a stylized company data card with green check marks, navy/gold accents, no
   logos, no readable text."
