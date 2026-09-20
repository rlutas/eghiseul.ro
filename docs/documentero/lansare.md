# Lansarea documentero.ro: ce lipsește, în ordine

Stare la 19.09.2026. Bifează aici, nu în alt loc.

## Conturi și infrastructură (Raul)

- [x] Domeniul `documentero.ro` cumpărat (19.09, DNS pe Vercel, HTTPS live);
  rămân `.eu` și `.net` defensiv;
  `faracoada.ro` ca slogan/campanie, nu ca site.
- [x] Domeniul adăugat la proiectul Vercel `eghiseul-ro` (19.09); `www` →
  apex cu 308 (Raul, 20.09, verificat cu `curl`). Fără `www` pe webhookuri.
- [x] Resend: domeniul `documentero.ro` verificat (Raul, 20.09; DKIM pe
  `resend._domainkey`, SPF + MX pe `send.documentero.ro`); `resolveFrom`
  acceptă implicit `eghiseul.ro,documentero.ro`. Rămâne: Zoho — alias sau cutie
  pentru PRIMIRE pe `contact@documentero.ro`.
- [~] Search Console: proprietatea creată (Raul, 20.09); tokenul e în
  `src/app/documentero/layout.tsx` (`verification.google`, meta tag). Dacă
  proprietatea e de tip Domain, aceeași valoare trebuie și ca TXT în DNS
  (Vercel): `google-site-verification=R5wF7Ny…`; apoi „Verifică” în GSC.
- [ ] GA4: stream nou pentru documentero.ro; `AttributionTracker` trimite
  `platform`.
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
- [ ] Sitemap curatoriat completat pagină cu pagină; placeholder-ul `noindex`
  scos de pe acasă abia când hub-ul e scris.
- [x] Link declarat din eghiseul (20.09): footer (coloana Contact, text) +
  pagina „eliberare certificat de naștere” → `documentero.ro/certificat-de-nastere/`.
  Propus, în alte repo-uri: ecazier.ro și cazierjudiciaronline.com (footer,
  un link din text, dofollow) — de făcut când documentero iese din `noindex`.

## Conținut (împreună)

- [ ] Textele finale pentru cele patru pagini de serviciu, trecute prin
  humanizer și prin testul de similaritate.
- [x] Recenzii Google reale (19.09): 9 recenzii 5★ despre stare civilă din
  profilul eGhișeul.ro, cu pozele de profil, în `src/lib/documentero/reviews.ts`;
  nota de proveniență + data citirii sub carduri.
- [x] Poza avocatei (Tarța Ana Gabriela, avocat-tarta.ro) în `public/images/documentero/`;
  textul de pe „Despre” e factual, din site-ul ei. Rămâne: poză reală a echipei.
- [x] Numărul real de acte obținute (20.09: 40+, din 44 comenzi plătite în DB
  din 07.07.2026; de actualizat manual în `despre/page.tsx`).
- [ ] Primul ghid („certificat de naștere pierdut”) scris complet.

## Verificare înainte de a scoate `noindex`

- [ ] `curl -H "Host: documentero.ro"` pe `/`, `/robots.txt`, `/sitemap.xml`,
  `/calculator/` (404), `/documentero/` (404) pe producție.
- [~] Comandă de test pe documentero.ro. 19.09, **pe live**: `E-260919-HJ9X9`
  (certificat de naștere, transfer bancar) a trecut wizardul, checkout-ul,
  succesul și statusul pe brandul documentero, `platform='documentero'`,
  contract generat; stă în „Așteptare plată”. **Raul**: „Confirmă plata” (sau
  anulare) și apoi verificăm factura, numărul din registru, emailul de
  confirmare. Reparate din test: emailul de transfer pe brandul comenzii,
  `resolveFrom` (Resend), fără card de cont pe documentero, link cookies.
  Din test rămâne doar: previzualizări KYC goale după reîncărcare (bug general).
  Comenzile de test au fost ȘTERSE din DB pe 20.09 (să nu încurce echipa).
- [~] Rich Results Test pe acasă și pe o pagină de serviciu — JSON-LD validat
  structural local pe 7 pagini (20.09); testul Google se rulează după
  scoaterea `noindex`.
- [ ] `curl -A Googlebot`: conținutul e în HTML, nu după Suspense.
- [ ] Screaming Frog cu Crawl Analysis: inlinks ≥ 20 pe pagină, fără
  near-duplicate peste prag.
- [x] Jaccard (20.09, shingles de 5, `<main>`): față de surorile eghiseul
  0,001–0,003 (texte scrise de la zero); între paginile documentero maxim 0,19
  mascat (naștere/căsătorie), restul sub 0,10 — mult sub pragurile 0,65 / 0,45.

## După lansare

- Expunerile pe documentero.ro, săptămânal, nu clicurile.
- 1–2 ghiduri pe săptămână din lista din
  [`continut-si-seo.md`](continut-si-seo.md).
- Decizia de 301 de pe eghiseul se ia doar când documentero depășește eghiseul
  pe aceleași interogări.
