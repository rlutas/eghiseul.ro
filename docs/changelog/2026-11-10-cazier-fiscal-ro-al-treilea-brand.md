# 10.11.2026 — cazierfiscal.com: site nou, doar pentru cazierul fiscal (pregătit, încă nelansat)
<!-- categorie: comenzi -->

## Pentru echipă

- Pregătim un site nou, **cazierfiscal.com**, care vinde un singur serviciu: cazierul fiscal pentru persoane fizice. Prețul și opțiunile sunt cele de pe eghiseul.
- Comenzile de acolo intră în **același admin**, cu un badge portocaliu „cazier-fiscal” lângă număr. Pe pagina de comenzi există și un filtru „cazierfiscal.com”.
- Le lucrați exact ca pe cele de cazier fiscal de pe eghiseul: aceeași avocată, aceleași documente, aceleași statusuri. Diferă doar ce vede clientul: alt site, alte culori, emailuri cu numele cazierfiscal.com.
- Dacă un client sună de pe cazierfiscal.com: suntem aceeași firmă, iar el plătește asistența avocatului, nu documentul (la ANAF și în SPV certificatul e gratuit).
- Site-ul nu e încă live. Anunțăm aici când pornește.

---

Branch `feat/brand-cazier-fiscal`. Detalii și pașii de lansare: [docs/cazier-fiscal/README.md](../cazier-fiscal/README.md).

- `src/lib/brand/brands.ts`: brandul `cazierfiscal` (domeniu `cazierfiscal.com`, `serviceSlugs: ['cazier-fiscal']`, `registryPlatform: 'eghiseul'`).
- `next.config.ts` + `src/proxy.ts`: rescrierea hostului spre `src/app/cazierfiscal/`; calea internă dă 404.
- Migrarea `204_orders_platform_cazierfiscal.sql`: `orders_platform_check` acceptă `cazierfiscal`.
- Admin: filtru de platformă + badge (`admin/orders`), filtrele din `list`/`counts`, eticheta pe pagina de erori.
- Rutele partajate: header, footer, logo pe login, GA/Ads per brand (`cookie-consent`), eticheta de conversie Ads pe pagina de succes, origin-ul de întoarcere de la Stripe pentru orice brand non-eghiseul, origin permis la OCR, IndexNow, canal de atribuire.
- Formularul de contact documentero primește `copy` opțional (subiecte și placeholdere per site).
- Pagini: `/`, `/despre/`, `/contact/`, `/ghiduri/`, 4 pagini legale, robots, sitemap curatoriat, llms.txt, icon. Totul e `noindex` până la `CAZIERFISCAL_INDEXABLE = true`.
