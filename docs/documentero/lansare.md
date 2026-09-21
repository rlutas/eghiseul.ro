# Lansarea documentero.ro: ce lipsește, în ordine

**LANSAT 21.09.2026**: `DOCUMENTERO_INDEXABLE = true`, paginile `index,follow`,
sitemap-ul servit și trimis în GSC. Lista de mai jos e istoricul; ce rămâne
e la „După lansare”.

## Conturi și infrastructură (Raul)

- [x] Domeniul `documentero.ro` cumpărat (19.09, DNS pe Vercel, HTTPS live);
  rămân `.eu` și `.net` defensiv;
  `faracoada.ro` ca slogan/campanie, nu ca site.
- [x] Domeniul adăugat la proiectul Vercel `eghiseul-ro` (19.09); `www` →
  apex cu 308 (Raul, 20.09, verificat cu `curl`). Fără `www` pe webhookuri.
- [x] Resend: domeniul `documentero.ro` verificat (Raul, 20.09; DKIM pe
  `resend._domainkey`, SPF + MX pe `send.documentero.ro`); `resolveFrom`
  acceptă implicit `eghiseul.ro,documentero.ro`. **Decizie Raul, 21.09: NU se face cutie/alias Zoho pentru documentero
  până nu crește platforma.** Trimiterea rămâne de pe `contact@documentero.ro`
  (Resend), dar adresa la care scrie omul (site, emailuri, schema, Reply-To)
  e `contact@eghiseul.ro` (`BRANDS.documentero.contactEmail`). Nimic nu sare în
  gol. DMARC `p=none` cu raport la contact@eghiseul.ro adăugat 21.09.
- [x] Search Console (21.09): proprietatea URL-prefix `https://documentero.ro/`
  VERIFICATĂ pe sishuletz@gmail.com (al doilea token în
  `src/app/documentero/layout.tsx`, `verification.google` e listă). Tokenul
  din 20.09 (`R5wF7Ny…`) e al altui cont; nu l-am găsit în conturile din
  Chrome. Sitemap-ul se trimite DUPĂ flip (până atunci e gol).
- [x] GA4 (21.09): proprietate nouă „documentero.ro” în contul GA „eGhiseul”
  (297950069, eghiseul@gmail.com), stream web 15815194303, ID de măsurare
  `G-ND6HB81QXF`, fus orar România, RON, categoria „Legi și guvernare”.
  Variabila `NEXT_PUBLIC_GA_MEASUREMENT_ID_DOCUMENTERO` pusă în Vercel
  (Production); `CookieConsent` o încarcă pe host-ul documentero după
  consimțământ. Contul sishuletz vede doar proprietatea demo; pentru
  rapoarte intri pe eghiseul@gmail.com. Verificat pe prod (21.09): hit-uri pe `G-ND6HB81QXF`. Eticheta Ads
  `AW-11464910041` trimite un hit și în eghiseul (`G-8LFRWD479Z`, destinație a
  etichetei): în rapoartele eghiseul exclude hostname `documentero.ro`.
  Rămâne: legarea GSC ↔ GA4 (conturi diferite) și conversia `purchase` pe
  prima comandă reală.
- [x] Registrul central: `003_platform_documentero.sql` aplicat pe
  `registru-barou-central` (19.09, 13:40).
- [x] Oblio: aceeași serie, facturile rămân cum sunt (Raul, 20.09).

## Cod (eu)

- [x] Variabile CSS pe `[data-brand="documentero"]` și tema pe wizard/cont (19.09, `697aa49`).
- [x] Paginile publice implementate în `src/app/documentero/` (19.09): acasă
  (prezentare, toate actele), naștere, căsătorie, celibat, extras multilingv,
  ghiduri, primul ghid, despre, contact.
  Toate `noindex` până la `DOCUMENTERO_INDEXABLE = true`
  (`src/config/documentero-nav.ts`).
- [x] Pagini legale proprii (20.09): `/termeni-si-conditii/`,
  `/politica-de-confidentialitate/`, `/politica-de-anulare/`,
  `/politica-cookies/` — textul eghiseul restrâns la stare civilă + avocat,
  paragraf nou pentru transfer bancar, `legalBaseUrl` = documentero.ro, în
  sitemap. ⚠️ De citit de Raul: §4 transfer bancar, §6 două cazuri fără
  rambursare (solicitant neîndreptățit; act netranscris în România).
- [x] Favicon + apple-icon proprii (19.09: `src/app/documentero/icon.png`,
  `apple-icon.png`, `public/images/documentero/favicon.ico`; excepție în
  `proxy.ts`).
- [x] OG implicit `public/og/documentero-default.png` (1200×630) și logo
  email `public/images/brand/documentero-email-logo.png` (660×160), randate
  din marca SVG + Bricolage (20.09).
- [ ] Assets rămase: logo SVG static (normal, alb) pentru terți; cele trei
  fotografii refăcute fără mărci de curier și exportate WebP.
- [x] `registryPlatform` din brandul comenzii la alocarea numerelor (19.09).
- [x] Textele „eghiseul.ro” din fluxul de comandă (20.09): nota de selfie,
  declarația de la semnătură, transferul bancar, titlurile paginilor de
  upload/completare, logo-ul auth, register, specimenele (ascunse pe
  documentero), contractul de prestări (`{{SITE_NAME}}`, `{{TC_URL}}` din
  brandul comenzii; ținta hyperlinkului din docx rămâne eghiseul).
- [x] Emailurile secundare cu `brand` (20.09): 13 șabloane + 17 apelanți,
  butoane și titluri repictate pe brand în `brandedEmailHtml`.
- [x] `Organization` documentero în schema; `Service`/`Product` pe paginile de
  serviciu; `Article` pe ghid (`src/lib/seo/documentero-schema.ts`).
- [x] Planul A din [`analiza-competitori-seo.md`](analiza-competitori-seo.md)
  §6 (21.09): `FAQPage` pe cele patru pagini de serviciu, bloc „Pe scurt”
  citabil sub hero, „Actualizat la” + avocata vizibile, zero linkuri din
  carduri spre `/ghiduri/` (ghidurile nescrise apar ca text „în lucru”),
  „Ai nevoie și de” pe toate patru, recenzii filtrate pe act, baza legală
  completă (L. 119/1996 + L. 51/1995 + H.G. 255/2024), linkuri în text pe
  acasă/ghiduri/despre, `llms.txt`. Planul B (conținut) făcut pe toate patru
  paginile + ghidul „pierdut” extins (474 → 1.272 cuvinte).
- [x] Numele documentului de celibat (21.09): H.G. 255/2024, Anexa 18 =
  „adeverință privind statutul civil” (fosta Anexa 9 din H.G. 64/2011). Pe
  site: „certificat de celibat (Anexa 18, fosta Anexa 9)”; titlu, hero, FAQ,
  meniu, acasă, T&C actualizate.
- [x] Sitemap curatoriat (14 pagini) servit din 21.09; `noindex` scos peste tot
  (`DOCUMENTERO_INDEXABLE = true`, commit `805b5fda`).
- [x] Link declarat din eghiseul (20.09): footer (coloana Contact, text) +
  pagina „eliberare certificat de naștere” → `documentero.ro/certificat-de-nastere/`.
  21.09: încă 4 linkuri în text din eghiseul (căsătorie, celibat, extras,
  articolul „model vechi”), footer pe cazierjudiciaronline.com + ecazier.ro,
  footer + 2 articole pe avocat-tarta.ro (commit-uri în repo-urile lor).

## Conținut (împreună)

- [x] Textele finale pentru cele patru pagini de serviciu (21.09), trecute
  prin humanizer și prin testul de similaritate (Jaccard mascat vs eghiseul
  0,003–0,005; între ele max 0,182). De citit de Raul înainte de flip.
- [x] Recenzii Google reale (19.09): 9 recenzii 5★ despre stare civilă din
  profilul eGhișeul.ro, cu pozele de profil, în `src/lib/documentero/reviews.ts`;
  nota de proveniență + data citirii sub carduri.
- [x] Poza avocatei (Tarța Ana Gabriela, avocat-tarta.ro) în `public/images/documentero/`;
  textul de pe „Despre” e factual, din site-ul ei. Poza echipei nu există
  (21.09): placeholder-ul scos, în loc e un card cu cele 4 servicii.
- [x] Numărul real de acte obținute (20.09: 40+, din 44 comenzi plătite în DB
  din 07.07.2026; de actualizat manual în `despre/page.tsx`).
- [x] Primul ghid („certificat de naștere pierdut”) scris complet (21.09,
  1.272 cuvinte, 9 secțiuni, tabel de cazuri particulare).

## Verificare înainte de a scoate `noindex`

- [x] (21.09) pe producție: `/`, `/robots.txt`, `/sitemap.xml` (gol, corect
  cât e `noindex`), `/llms.txt` 200; `/calculator/`, `/documentero/`,
  `/servicii/cazier-judiciar/` 404; `/admin/` 307.
- [x] Comandă de test pe documentero.ro (IBAN, fără plată; Raul 21.09: suficient). 19.09, **pe live**: `E-260919-HJ9X9`
  (certificat de naștere, transfer bancar) a trecut wizardul, checkout-ul,
  succesul și statusul pe brandul documentero, `platform='documentero'`,
  contract generat; stă în „Așteptare plată”. **Raul**: „Confirmă plata” (sau
  anulare) și apoi verificăm factura, numărul din registru, emailul de
  confirmare. Reparate din test: emailul de transfer pe brandul comenzii,
  `resolveFrom` (Resend), fără card de cont pe documentero, link cookies.
  Din test rămâne doar: previzualizări KYC goale după reîncărcare (bug general).
  Comenzile de test au fost ȘTERSE din DB pe 20.09 (să nu încurce echipa).
- [~] Rich Results Test pe acasă și pe o pagină de serviciu — JSON-LD validat
  structural local pe 7 pagini (20.09); testul Google de rulat acum, că
  site-ul e indexabil.
- [x] (21.09) `curl -A Googlebot` pe cele 14 pagini publice: conținutul e în
  HTML (naștere 2.446 cuvinte, căsătorie 2.220, celibat 2.339, extras 1.796).
- [x] (21.09) crawl propriu în loc de Screaming Frog: fiecare pagină publică
  primește linkuri din 13 din celelalte 13 (header + footer + text); ghidul
  „apostilă” din 7 → adăugat în footer. Near-duplicate: max 0,182 mascat.
- [x] Jaccard (20.09, shingles de 5, `<main>`): față de surorile eghiseul
  0,001–0,003 (texte scrise de la zero); între paginile documentero maxim 0,19
  mascat (naștere/căsătorie), restul sub 0,10 — mult sub pragurile 0,65 / 0,45.

## După lansare

- 21.09 (seara): Vercel verificat: `documentero.ro` Production + `www` 308
  spre apex, HTTP→HTTPS 308, HSTS 2 ani, toate deploy-urile Ready (ultimul
  `fa7ea5d6`), 10 cron-uri din `vercel.json` active pe proiect, wizardul și
  statusul răspund 200 pe host. DNS: DKIM + SPF + MX Resend pe
  `send.documentero.ro`, DMARC adăugat; fără MX pe apex, intenționat (vezi
  decizia de mai sus).
  Emailuri: 6 teste primite în INBOX pe serviciiseonethut@gmail.com (nu spam),
  expeditor `contact@documentero.ro`.

- 21.09: sitemap trimis în GSC (sishuletz@gmail.com), indexare cerută pentru
  acasă, cele 4 servicii și cele 2 ghiduri (vezi changelog-ul de lansare);
  `/certificat-de-casatorie/` indexată la ~20 min. Seara: ghidurile „acte
  necesare” și „procură din străinătate” publicate (sitemap 16), Rich Results
  OK, indexare cerută și pentru ele.

- Expunerile pe documentero.ro, săptămânal, nu clicurile.
- 1–2 ghiduri pe săptămână din lista din
  [`continut-si-seo.md`](continut-si-seo.md).
- Decizia de 301 de pe eghiseul se ia doar când documentero depășește eghiseul
  pe aceleași interogări.
