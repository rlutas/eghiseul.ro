# Lansarea documentero.ro: ce lipsește, în ordine

Stare la 19.09.2026. Bifează aici, nu în alt loc.

## Conturi și infrastructură (Raul)

- [ ] Domeniul `documentero.ro` cumpărat, plus `.eu` și `.net` defensiv;
  `faracoada.ro` ca slogan/campanie, nu ca site.
- [ ] Domeniul adăugat la proiectul Vercel `eghiseul-ro`; `www` redirecționat
  spre apex (308). Fără `www` pe webhookuri.
- [ ] Resend: domeniul `documentero.ro` verificat (SPF, DKIM), ca
  `contact@documentero.ro` să poată trimite. Zoho: alias sau cutie pentru
  primire.
- [ ] Search Console: proprietate de tip Domain; tokenul de verificare intră în
  `src/app/documentero/layout.tsx` (`verification.google`).
- [ ] GA4: stream nou pentru documentero.ro; `AttributionTracker` trimite
  `platform`.
- [ ] Registrul central: rulat `supabase/registry/003_platform_documentero.sql`
  pe proiectul `registru-barou-central` (`ksqkttalapjlgugshuks`). Fără el,
  prima alocare de număr pentru o comandă documentero pică pe CHECK.
- [ ] Oblio: aceeași serie (decizie 19.09); de confirmat cu contabilul textul
  de pe factură (numele brandului în descriere).

## Cod (eu)

- [ ] Variabile CSS pe `[data-brand="documentero"]` și tema pe wizard/cont.
- [ ] Paginile publice din canvas implementate în `src/app/documentero/`:
  acasă, căsătorie, celibat, extras multilingv, ghiduri, primul ghid, despre,
  contact, legal (componente comune cu `brand`).
- [ ] Assets: logo SVG (normal, alb), favicon, apple-icon, OG implicit, logo
  pentru email; cele trei fotografii refăcute fără mărci și exportate WebP.
- [ ] `registryPlatform` din brandul comenzii la alocarea numerelor.
- [ ] Emailurile secundare cu `brand`; textele „eghiseul.ro” rămase în KYC,
  auth, cont.
- [ ] `Organization` documentero în schema; `Service`/`Product` pe paginile de
  serviciu; `Article` pe ghiduri.
- [ ] Sitemap curatoriat completat pagină cu pagină; placeholder-ul `noindex`
  scos de pe acasă abia când hub-ul e scris.
- [ ] Link declarat din eghiseul (footer + pagina de serviciu naștere).

## Conținut (împreună)

- [ ] Textele finale pentru cele patru pagini de serviciu, trecute prin
  humanizer și prin testul de similaritate.
- [ ] Trei recenzii Google alese, cu inițiale.
- [ ] Poză reală a echipei și a avocatei, plus textul ei pentru „Despre”.
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
