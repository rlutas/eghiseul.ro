# 11.11.2026 — certificat-constatator-express.ro: al patrulea brand, doar certificat constatator
<!-- categorie: comenzi -->

## Pentru echipă

- Avem un site nou, **certificat-constatator-express.ro**, care vinde doar certificatul constatator. Comenzile de acolo ajung în același admin, cu badge lime „constatator”, și se lucrează exact ca cele de pe eghiseul.
- Prețurile sunt aceleași ca pe eghiseul și vin din același loc: dacă schimbi prețul în admin, se schimbă pe ambele site-uri.
- Certificatul de bază pentru firmă pleacă automat la ONRC. Celelalte variante (pe persoană fizică, cu istoric) le urmărim ca până acum și le depunem noi dacă botul nu le preia.
- Comanda nu se poate anula după plată (la fel ca pe eghiseul). Dacă firma nu e la Registrul Comerțului sau CUI-ul e greșit, clientul primește credit, nu banii.
- Site-ul e încă ascuns de Google, până îl verificăm și pornim reclamele. Dacă vezi o comandă de acolo înainte de lansare, e un test.
- Lista de comenzi are un filtru nou: „certificat-constatator-express.ro”.

---

## Ce s-a livrat

- Brand `constatator` în `src/lib/brand/brands.ts` (`CONSTATATOR_SERVICE_SLUGS = ['certificat-constatator']`), hosturi în `next.config.ts` (`CONSTATATOR_HOSTS`, `CONSTATATOR_EXTRA_HOSTS`) și `src/proxy.ts`. Rutele interne în `src/app/constatator/`, componentele în `src/components/constatator/`.
- Migrarea `205_orders_platform_constatator.sql`: `orders_platform_check` acceptă `constatator`.
- Paleta proprie (`[data-brand="constatator"]` în `globals.css`: cerneală `#161A33`, lime `#C6F432`), logo SVG inline, favicon/icon/apple-icon pe host în `public/images/constatator/`, OG `public/og/constatator-default.png`.
- Pagini: `/` (pagina de bani, prețurile citite din `verification_config.constatator.documentTypes` prin `src/lib/constatator/pricing.ts`, viteza reală din `getDeliveryStats`), `/despre/`, `/contact/`, `/ghiduri/` (gol), termeni, confidențialitate, anulare, cookies, `robots.txt`, `sitemap.xml`, `llms.txt`. Toate `noindex` cât timp `CONSTATATOR_INDEXABLE = false`.
- Textele legale scrise pentru acest serviciu: fără avocat (doar `contract-prestari`), fără anulare (`allow_self_cancel = false`), livrare doar pe email (wizardul nu are pas de livrare pentru constatator), credit pentru entități neînregistrate la ONRC, ca în T&C eghiseul §6.
- Admin: filtru și badge în lista de comenzi și la erori clienți. GA4/Ads pe variabile proprii (`NEXT_PUBLIC_GA_MEASUREMENT_ID_CONSTATATOR`, `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR`, `..._PURCHASE_LABEL_CONSTATATOR`), fără fallback pe eghiseul; Meta/TikTok nu se încarcă pe brand.
- Atribuire canal, IndexNow (cheie proprie), originea OCR, footerul și headerul comenzii știu de brand.
- Domenii: nameserverele ROTLD pe Vercel; apex în proiect, `www` și `certificatconstatatorexpress.ro` 308 spre apex.

## Deschis înainte de indexare și reclame

- Verificat pe onrc.ro: taxele de 30 / 250 lei, „extins” vs de bază, programul de emitere.
- Search Console (TXT) + contul de serviciu, Bing, GA4.
- Test Jaccard față de paginile constatator de pe eghiseul (`.claude/rules/content-and-seo.md` §1).
- Emailurile pleacă prin fallback de pe adresa eghiseul (Resend la 10/10 domenii).

Plan complet: [`../certificat-constatator/README.md`](../certificat-constatator/README.md).
