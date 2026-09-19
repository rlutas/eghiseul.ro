# Lansarea documentero.ro: ce lipsește, în ordine

Stare la 19.09.2026. Bifează aici, nu în alt loc.

## Conturi și infrastructură (Raul)

- [x] Domeniul `documentero.ro` cumpărat (19.09, DNS pe Vercel, HTTPS live);
  rămân `.eu` și `.net` defensiv;
  `faracoada.ro` ca slogan/campanie, nu ca site.
- [x] Domeniul adăugat la proiectul Vercel `eghiseul-ro` (19.09). ⚠️ `www`
  răspunde 200 în loc de 308 spre apex — de setat redirectul în Vercel.
  Fără `www` pe webhookuri.
- [ ] Resend: domeniul `documentero.ro` verificat (SPF, DKIM), ca
  `contact@documentero.ro` să poată trimite. La 19.09 `dig` nu vede niciun
  MX/TXT pe domeniu, deci Resend va refuza `from`-ul documentero. Zoho: alias
  sau cutie pentru primire.
- [ ] Search Console: proprietate de tip Domain; tokenul de verificare intră în
  `src/app/documentero/layout.tsx` (`verification.google`).
- [ ] GA4: stream nou pentru documentero.ro; `AttributionTracker` trimite
  `platform`.
- [x] Registrul central: `003_platform_documentero.sql` aplicat pe
  `registru-barou-central` (19.09, 13:40).
- [ ] Oblio: aceeași serie (decizie 19.09); de confirmat cu contabilul textul
  de pe factură (numele brandului în descriere).

## Cod (eu)

- [x] Variabile CSS pe `[data-brand="documentero"]` și tema pe wizard/cont (19.09, `697aa49`).
- [x] Paginile publice implementate în `src/app/documentero/` (19.09): acasă
  (prezentare, toate actele), naștere, căsătorie, celibat, extras multilingv,
  ghiduri, primul ghid, despre, contact.
  Toate `noindex` până la `DOCUMENTERO_INDEXABLE = true`
  (`src/config/documentero-nav.ts`).
- [ ] Pagini legale proprii (T&C, confidențialitate, anulare, cookies) cu
  brandul documentero; până atunci footerul și disclosure-ul trimit la cele de
  pe eghiseul.ro (`Brand.legalBaseUrl`).
- [x] Favicon + apple-icon proprii (19.09: `src/app/documentero/icon.png`,
  `apple-icon.png`, `public/images/documentero/favicon.ico`; excepție în
  `proxy.ts`).
- [ ] Assets rămase: logo SVG (normal, alb), OG implicit
  `/og/documentero-default.png`, logo pentru email; cele trei fotografii
  refăcute fără mărci și exportate WebP.
- [x] `registryPlatform` din brandul comenzii la alocarea numerelor (19.09).
- [ ] Emailurile secundare cu `brand`; textele „eghiseul.ro” rămase în KYC,
  auth, cont.
- [x] `Organization` documentero în schema; `Service`/`Product` pe paginile de
  serviciu; `Article` pe ghid (`src/lib/seo/documentero-schema.ts`).
- [ ] Sitemap curatoriat completat pagină cu pagină; placeholder-ul `noindex`
  scos de pe acasă abia când hub-ul e scris.
- [ ] Link declarat din eghiseul (footer + pagina de serviciu naștere).

## Conținut (împreună)

- [ ] Textele finale pentru cele patru pagini de serviciu, trecute prin
  humanizer și prin testul de similaritate.
- [x] Recenzii Google reale (19.09): 9 recenzii 5★ despre stare civilă din
  profilul eGhișeul.ro, cu pozele de profil, în `src/lib/documentero/reviews.ts`;
  nota de proveniență + data citirii sub carduri.
- [x] Poza avocatei (Tarța Ana Gabriela, avocat-tarta.ro) în `public/images/documentero/`;
  textul de pe „Despre” e factual, din site-ul ei. Rămâne: poză reală a echipei.
- [ ] Numărul real de acte obținute (înlocuiește `[N]` în „Despre”).
- [ ] Primul ghid („certificat de naștere pierdut”) scris complet.

## Verificare înainte de a scoate `noindex`

- [ ] `curl -H "Host: documentero.ro"` pe `/`, `/robots.txt`, `/sitemap.xml`,
  `/calculator/` (404), `/documentero/` (404) pe producție.
- [ ] O comandă de test plătită pe documentero.ro: email de confirmare cu
  brandul documentero, `success_url` pe documentero.ro, număr alocat cu
  `platform='documentero'`, factură emisă, comanda vizibilă în admin cu chip.
- [ ] Rich Results Test pe acasă și pe o pagină de serviciu.
- [ ] `curl -A Googlebot`: conținutul e în HTML, nu după Suspense.
- [ ] Screaming Frog cu Crawl Analysis: inlinks ≥ 20 pe pagină, fără
  near-duplicate peste prag.
- [ ] Jaccard mascat < 0,65 față de paginile surori de pe eghiseul.

## După lansare

- Expunerile pe documentero.ro, săptămânal, nu clicurile.
- 1–2 ghiduri pe săptămână din lista din
  [`continut-si-seo.md`](continut-si-seo.md).
- Decizia de 301 de pe eghiseul se ia doar când documentero depășește eghiseul
  pe aceleași interogări.
