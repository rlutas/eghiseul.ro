# 12.10.2026 — CJO și ecazier: banner de cookie-uri, Google pornește doar după acord
<!-- categorie: infrastructura -->

## Pentru echipă

- Pe cazierjudiciaronline.com și pe ecazier.ro apare acum, jos, un banner de cookie-uri cu trei butoane: „Accept toate”, „Doar necesare” și „Personalizează”. E același banner ca pe eGhiseul.
- Până azi, aceste două site-uri porneau Google Analytics și Google Ads fără să-l întrebe pe vizitator, ceea ce legea interzice. De azi nu mai pornesc.
- Dacă un client întreabă cum își schimbă alegerea: în subsolul paginii, la „Setări cookie-uri”.
- În Google Analytics vor apărea ceva mai puțini vizitatori, pentru că nu-i mai numărăm pe cei care refuză. Comenzile se numără la fel ca înainte, în admin.

---

## Ce s-a schimbat (CJO `02ee98f5`)

**Problema.** Test în browser curat, fără click pe banner: CJO încărca GTM (`GTM-TBL2B972`) și GA4, iar ecazier încărca gtag.js cu GA4 și Google Ads. Ambele setau `_ga`, `_ga_*` și `_gcl_au` și nu aveau banner deloc. Încălcare a Legii 506/2004, art. 4 alin. (5). Aceeași problemă o au și concurenții pe care pregătim să-i reclamăm (`ads/2026-10-12-cookie-tracking-concurenti.md`), deci trebuia reparat întâi la noi.

**Reparația** (portată de pe eGhiseul, `technical/specs/cookie-consent.md`):
- `src/app/layout.tsx`: scoase GTM, gtag.js și iframe-ul `noscript`. În `<head>` rămân doar stub-ul `gtag` și Consent Mode v2 cu toate categoriile `denied`.
- `src/components/consent/cookie-consent.tsx`: bannerul. gtag.js se injectează doar după acord: GA4 la „analiză”, eticheta Google Ads (doar ecazier, `AW-18154474423`) la „marketing”. La retragere șterge `_ga*` și `_gcl_*`.
- **GTM renunțat pe CJO**: CJO folosește acum gtag.js direct, ca ecazier. Dispatcher-ul din `src/lib/analytics.ts` trimite deja evenimentele prin `gtag` când GTM lipsește.
- `AdAttributionCapture`: cookie-urile `gclid`/`gbraid`/`wbraid` se scriu doar cu acord de marketing. `cjo_attr` (sursa comenzii, first-party) rămâne fără acord și e declarat în politică.
- Jurnal de consimțământ: `POST /api/consent-log` + tabela `cookie_consent_log` (migrarea CJO **041**, rulată pe DB-ul CJO; RLS fără politici). Cookie: `cjo_cookie_consent`, 6 luni; versiunea bannerului: `cjo-v1-2026-10-12` / `ecazier-v1-2026-10-12`.
- „Setări cookie-uri” în ambele footere. Secțiunea 9 din politica de confidențialitate (CJO + ecazier) e rescrisă cu lista exactă a cookie-urilor și are ancora `#cookies`.

**Verificat local** (browser curat): 0 cereri spre Google și doar `cjo_attr` înainte de alegere; nimic nou după „Doar necesare”; după „Accept toate” se încarcă gtag.js și apar `_ga`, `_ga_K9SR271VMF` și `gclid`. Testele CJO: 519/519.

**De urmărit:** conversiile Google Ads de pe ecazier se trimit acum doar de la cei care acceptă marketingul (cu modelare Consent Mode). Reclamele ecazier sunt oricum blocate de politica Google.
