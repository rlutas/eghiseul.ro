# SEO & Digital PR: articol profesori, update ANCPI/TVA, widget embed pentru presă

**Data:** 2026-07-29 · Commits: `1caa6d6`, `f409cb2`, `82fb8ed`, `3b98c6d`, `c6137ae`, `f0ac225` + fix lint

## Context

Continuarea strategiei de linkuri din [analiza ofertelor](../seo/2026-07-29-analiza-oferte-backlinks.md)
și [lista de ținte](../seo/2026-07-29-lista-tinte-backlinks.md): digital PR pe active proprii
(date + monitorizare), nu doar advertoriale plătite. Google Trends RO (29 iul, verificat integral,
85 de trenduri): **„cadastru"** (2K+, criza ANCPI) și **„didactică"** (2K+, titularizare) — singurele
relevante pentru noi; ambele acoperite.

## 1. Articol nou: cazier + certificat de integritate pentru profesori

`/cazier-si-certificat-de-integritate-pentru-profesori/`

- **De ce:** GSC arată 21.715 afișări / 1.598 clicuri pe 23 de interogări cu „integritate" în
  3 luni (mai–iul), dar **zero interogări cu „profesor/învățământ"** — nișă sezonieră neacoperită
  (angajările din învățământ = august–septembrie, documentele au valabilitate 6 luni, deci nu se
  pot scoate din timp). SERP: doar știri Edupedu + pagini generice, niciun ghid dedicat.
- **Conținut verificat pe surse:** Legea 118/2019 (cine trebuie să prezinte certificatul),
  clarificarea Ministerului Educației (NU se redepun la 6 luni), excepția de la titularizare
  (depunere până la semnarea contractului), rutele gratuite prezentate onest — cazier pe
  ghiseul.ro/HUB MAI, certificat de integritate gratuit pe hub.mai.gov.ro (verificat pe pagina MAI).
- **Statistici citabile în articol** (secțiunea „Ce arată datele") — pentru presă și AI Overviews.
- Link intern din ghidul mare de integritate (2.308 clicuri, poz. 4,16) + link intern spre
  formularul serviciului + **primul link extern spre sursă** de pe site (HUB MAI) — decizie Raul.
- Imagine featured proprie (generată, 1200×675 WebP, fără text).
- Înregistrat în: sitemap (`HARDCODED_ARTICLE_SLUGS`), `PAGE_LAST_MODIFIED`, `/blog` (`ARTICLES`).

**Plan de distribuție:** [digital PR profesori](../seo/2026-07-29-digital-pr-profesori-septembrie.md)
— pitch + ținte (Edupedu, portalinvatamant, laclasă, hotnews, presă locală). ⚠️ Cifrele GSC sunt
totaluri pe 3 luni, NU lunare — corectat în pitch.

## 2. ANCPI + TVA 9%: actualizate cu noutățile din 27 iulie (verificate pe surse)

**NU e OUG** — e proiect de lege: Senatul a adoptat pe 27 iul (126–1) prelungirea termenului de
livrare cu TVA 9% de la 31 iul la **30 sept 2026** (cauza: blocajul ANCPI), cu susținerea
ministrului Nazare + restituirea diferenței pentru cei care plătesc 21% între timp. **Nu e în
vigoare** până la votul Camerei Deputaților + promulgare + Monitorul Oficial — ambele articole o
spun explicit. Tot pe 27 iul, Guvernul a confirmat **ransomware** (infrastructură de virtualizare
criptată și ștearsă) și a refuzat un termen de repornire e-Terra.

- `/ancpi-nu-functioneaza/`: cronologie (+2 intrări), FAQ, intro, rândul TVA din tabelul de
  situații, secțiunea Actualizări; „Cadastru" adăugat în titlul SERP (cuvântul din Trends).
- `/tva-9-locuinte-31-iulie-2026/`: titlu nou (H1 + SERP + card blog), „Pe scurt", FAQ,
  secțiune „Statusul la zi" cu cronologia votului și recomandarea practică.

## 3. Widget live embed-abil — starea ANCPI (digital PR)

`/embed/ancpi/` — HTML pur ~2KB din `platform_outages` (monitorizarea noastră la 15 min, din
prima noapte a căderii): status roșu/verde, „Ziua N de blocaj", ultima verificare, auto-refresh
5 min, trece singur pe verde la revenire. Framing permis DOAR pe `/embed/*` (CSP
`frame-ancestors *` + override `X-Frame-Options` în `next.config.ts`); restul site-ului rămâne
`SAMEORIGIN`.

Secțiune „Pentru redacții" în articolul ANCPI (`#embed`): preview live + cod de preluare.
**Linkul de atribuire e în afara iframe-ului** — ăla e backlink-ul (iframe-urile nu transmit
autoritate). Ofertă date brute de monitorizare la contact@.

## Fix CI

5 ghilimele drepte neescapate în JSX (`react/no-unescaped-entities`) + un `as any` fără
eslint-disable în ruta embed — toate din sesiunea de azi; CI roșu pe ultimele 5 push-uri.

## De urmărit

- Votul Camerei Deputaților pe prelungirea TVA (raport favorabil 29 iul) → actualizare articole
  la publicarea în Monitorul Oficial.
- Pitch-urile de presă (widget ANCPI acum, profesori în august) — de trimis de Raul.
- Efect: interogări „profesor/învățământ" în GSC + domenii referitoare noi (azi: 50).

## Addendum (după-amiază): traduceri — preț per limbă + 11 limbi noi

Prețurile confirmate de traducătoare au declanșat refactorul: flat 178,50 ar fi
vândut daneza (cost 150) în pierdere. Livrat: preț per limbă în wizard (din
`translation_price_list.clientPriceDoc`, până azi nefolosit) + trepte
178,50/249/349 + gardă server-side la submit + bulgară fără legalizare +
coloană „Cost apostilă" și marjă netă (÷1,21) în Setări. 20 limbi active
(erau 9). Analiza: `docs/serviciu-traduceri-apostile/raspuns-traducatoare-2026-07-29.md`.
⚠️ RĂMAS: portarea pe cazierjudiciaronline.com + ecazier.ro (au liste de limbi
proprii, probabil hardcodate).
