# 11.11.2026 — certificat-constatator-express.ro: al patrulea brand, doar certificat constatator
<!-- categorie: comenzi -->

## Pentru echipă

- Avem un site nou, **certificat-constatator-express.ro**, care vinde doar certificatul constatator. Comenzile de acolo ajung în același admin, cu badge lime „constatator”, și se lucrează exact ca cele de pe eghiseul.
- Prețurile sunt aceleași ca pe eghiseul și vin din același loc: dacă schimbi prețul în admin, se schimbă pe ambele site-uri.
- Certificatul de bază pentru firmă pleacă automat la ONRC. Celelalte variante (pe persoană fizică, cu istoric) le urmărim ca până acum și le depunem noi dacă botul nu le preia.
- Comanda nu se poate anula după plată (la fel ca pe eghiseul). Dacă firma nu e la Registrul Comerțului sau CUI-ul e greșit, clientul primește credit, nu banii.
- Site-ul e live din 11.11 și deschis pentru Google. Reclamele pornesc separat, pe un cont Google Ads nou.
- Black Friday NU se aplică pe acest site: clientul plătește prețul afișat, 89 lei.
- Lista de comenzi are un filtru nou: „certificat-constatator-express.ro”.
- Pe acest site nu scrie nicăieri că depune avocata: certificatul constatator îl cere botul sau echipa, nu avocatul. Nu spuneți la telefon că depune avocata.
- Din 11.11 rulează o campanie Google Ads de test pentru acest site, pe un cont nou, cu 50 lei/zi. Dacă Google o respinge, o oprim. Nu încercăm s-o păcălim.
- Google Analytics merge pe site din 11.11. Vânzările se măsoară automat la plată, inclusiv pentru reclamele Google, din momentul în care contul de reclame are codul pus în site.

---

## Ce s-a livrat

- Brand `constatator` în `src/lib/brand/brands.ts` (`CONSTATATOR_SERVICE_SLUGS = ['certificat-constatator']`), hosturi în `next.config.ts` (`CONSTATATOR_HOSTS`, `CONSTATATOR_EXTRA_HOSTS`) și `src/proxy.ts`. Rutele interne în `src/app/constatator/`, componentele în `src/components/constatator/`.
- Migrarea `205_orders_platform_constatator.sql`: `orders_platform_check` acceptă `constatator`.
- Paleta proprie (`[data-brand="constatator"]` în `globals.css`: cerneală `#161A33`, lime `#C6F432`), logo SVG inline, favicon/icon/apple-icon pe host în `public/images/constatator/`, OG `public/og/constatator-default.png`.
- Pagini: `/` (pagina de bani, prețurile citite din `verification_config.constatator.documentTypes` prin `src/lib/constatator/pricing.ts`, viteza reală din `getDeliveryStats`), `/despre/`, `/contact/`, `/ghiduri/` (gol), termeni, confidențialitate, anulare, cookies, `robots.txt`, `sitemap.xml`, `llms.txt`. Indexabile din 11.11 (`CONSTATATOR_INDEXABLE = true`), după verificarea live, testul Jaccard (0,012 față de pagina eghiseul) și verificarea taxelor pe sursele ONRC.
- Textele legale scrise pentru acest serviciu: fără avocat (doar `contract-prestari`), fără anulare (`allow_self_cancel = false`), livrare doar pe email (wizardul nu are pas de livrare pentru constatator), credit pentru entități neînregistrate la ONRC, ca în T&C eghiseul §6.
- Admin: filtru și badge în lista de comenzi și la erori clienți. GA4/Ads pe variabile proprii (`NEXT_PUBLIC_GA_MEASUREMENT_ID_CONSTATATOR`, `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR`, `..._PURCHASE_LABEL_CONSTATATOR`), fără fallback pe eghiseul; Meta/TikTok nu se încarcă pe brand.
- Atribuire canal, IndexNow (cheie proprie), originea OCR, footerul și headerul comenzii știu de brand.
- Domenii: nameserverele ROTLD pe Vercel; apex în proiect, `www` și `certificatconstatatorexpress.ro` 308 spre apex.

- Black Friday: bara și aplicarea automată a codului sunt oprite pe brandul `constatator` (`(order)/layout.tsx`, checkout).
- Search Console `sc-domain:certificat-constatator-express.ro` verificat prin TXT (contul de serviciu e owner), sitemap trimis. Bing Webmaster verificat (meta `msvalidate.01`), sitemap trimis.
- Test live: draft creat pe domeniu cu `platform='constatator'`, apoi șters.
- GA4: cont „constatator”, proprietatea 563726213, stream web 16319189060, ID `G-X5Q7NDPHPL` în `NEXT_PUBLIC_GA_MEASUREMENT_ID_CONSTATATOR` (Vercel, production). Fiind `NEXT_PUBLIC_`, intră în pagină abia la următorul build de producție. gtag se încarcă doar după acordul pentru cookie-uri. Contul de serviciu claude-seo are rol de „Participant” pe proprietate, deci raportul lunar citește și acest site (verificat prin Data API).
- Verificare 11.11: toate cele 7 URL-uri din sitemap dau 200, au canonical propriu și `index, follow`, fără nicio mențiune „eghiseul”. Fiecare pagină are linkuri spre toate celelalte (header + footer). `/comanda/` e blocat în robots.txt și are `noindex`. `/ghiduri/` rămâne `noindex`, în afara sitemap-ului și a meniului până la primul ghid publicat.

- 11.11: semnătura „cererile le depune av. …” (componenta comună `UpdatedLine`) scoasă de pe pagina principală constatator, înlocuită cu „echipa Constatator Express”. Pe celelalte pagini și în ghiduri nu apărea.
- Ghiduri: 5 scrise și puse în coadă (`published: false`, 404 în producție), câte unul pe săptămână din 18.11. Coada e în `docs/certificat-constatator/README.md`.
- Conversii Ads: codul e gata (GA4 `purchase` + conversie Ads cu `transaction_id` și enhanced conversions, fără fallback pe alt cont). Lipsesc doar `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR` și `..._PURCHASE_LABEL_CONSTATATOR`. Pașii sunt în README, la „Conversii Google Ads”.

## Deschis

- Search Console și în contul lui Raul (TXT propriu).
- Google Ads: campania e live din 11.11 (ID 24460904128); eticheta Ads e live pe site (verificat în bundle). Microsoft Ads.
- Emailurile pleacă prin fallback de pe adresa eghiseul (Resend la 10/10 domenii).

Plan complet: [`../certificat-constatator/README.md`](../certificat-constatator/README.md).
