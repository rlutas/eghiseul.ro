# 2026-07-14 (seara) — Calculator cost cadastru + „Mai e valabil documentul?" + checklist lead magnet + llms.txt

Pachetul 2 din research-ul de idei (după POT/CUT): ideile #4, #2 și #6.

## 1. Calculator `/calculator/cost-cadastru-intabulare/` + articol (construite de agent AI)

- Widget: tip imobil × context (primă înregistrare / intabulare după cumpărare) × PF/PJ × normal/urgență → **defalcare taxă ANCPI exactă (Ordin 16/2019) + interval onorariu topograf + total estimat**. Plafonul de urgență de 5.000 lei aplicat corect (verificat: PF 5 mil → 7.500 normal, 12.500 urgent).
- Articol `/cat-costa-cadastrul-si-intabularea/`: răspuns-întâi (apartament 820–1.220 lei, casă 1.520–2.620, intabulare 0,15%), taxe, acte pe 3 scenarii, pași A-Z, greșeli. 7 FAQ.
- Interlinking: extras CF, copie CF, PAD, certificat sarcini, identificare imobil, taxe notariale, POT/CUT (calculator + articol). Înregistrat: nav, index, sitemap, related services, blog + homepage (articles.ts).
- **Imagine featured articol: LIPSEȘTE** — de generat + pus la `public/images/articole/cat-costa-cadastrul-si-intabularea.webp`.

## 2. Calculator `/calculator/valabilitate-documente/` — „Mai e valabil documentul meu?"

- Unic pe piață: alegi documentul + data eliberării → valabil/expirat + data exactă + zile rămase; la expirat/aproape expirat → **buton direct de recomandă** serviciul respectiv.
- Reguli cu bază legală: cazier judiciar 6 luni (L290/2004), cazier fiscal 30 zile (OG 39/2015), integritate 6 luni (L118/2019), extras CF autentificare 10 zile lucrătoare (L7/1996); extras CF informare / constatator / cazier auto = ~30 zile marcate explicit „termen uzual, nu legal".
- Și deflection de support („mai e bun cazierul?" = întrebare frecventă).

## 3. Checklist PDF descărcabil cu abonare la newsletter (lead magnet)

- `public/downloads/checklist-cadastru-intabulare.pdf` (2 pagini, brand, checkbox-uri, taxe + pași) — generat din HTML cu Playwright/Chromium (pdf-lib nu duce diacritice fără fontkit).
- Componentă reutilizabilă `ChecklistDownload` (`src/components/articole/checklist-download.tsx`): email + consimțământ GDPR → POST `/api/newsletter` (source `checklist-cadastru`, infrastructura existentă) → download auto + link. Montată în articolul de cadastru la ancora `#checklist`.
- Pattern replicabil pentru alte lead magnets (checklist vânzare imobil, acte cazier etc.).

## 4. llms.txt actualizat (GEO)

Era din mai, doar despre cazier, cu operator greșit (RapidCert → **EDIGITALIZARE S.R.L.**, CIF RO49278701). Acum: tot catalogul (30 servicii active cu prețuri reale din DB), calculatoarele-cheie, fapte citabile pentru AI (formula POT, valorile jugăr/falce/pogon, regula urgenței ANCPI, valabilități documente), secțiune „Pentru AI assistants".

## 5. Completări (aceeași seară)

- **Imagine featured articol cadastru** pusă (stație totală + casă, webp 1600px/100KB) + alt corectat la conținutul real al pozei.
- **Checklist PDF v2**: logo grafic (logo-wide.webp) în loc de text + tabelul de taxe ANCPI înlocuit cu **prețurile serviciilor NOASTRE** (decizie Raul: clientul oricum nu poate face ce facem noi — extras instant etc.) + link eghiseul.ro/servicii. Sursa HTML regenerabilă: `scripts/lead-magnets/checklist-cadastru.html` (PDF: `npx playwright pdf`).
- **Footer restructurat**: coloana Contact mutată sub brand (col-span-4) → loc pentru a 4-a grupă de servicii **„Carte Funciară & Cadastru"** (extras CF, certificat urbanism, identificare imobil + după proprietar, copie CF, PAD, certificat sarcini, actualizare adresă CF, extras plan cadastral — serviciile topografului, căutate organic). Grupa veche „Imobiliare & firme" → „Firme & auto". Text legal reformulat: „Lucrăm cu avocați colaboratori înscriși în Barou și topografi autorizați ANCPI/OCPI".
- **Plan cookie consent / GDPR**: `docs/plans/2026-07-14-cookie-consent-gdpr.md` — audit (GA4 se încarcă azi FĂRĂ consimțământ = neconform), recomandare self-built + Google Consent Mode v2, checklist implementare, 2 decizii rămase la Raul.

## Verificare

tsc + eslint curat (inclusiv fix react-compiler: Date.now() scos din render în valabilitate-calculator), 1.155 teste, toate paginile 200, checklist-ul randează în articol, PDF servit 200.
