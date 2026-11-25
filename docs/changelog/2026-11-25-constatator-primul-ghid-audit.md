# 25.11.2026 — certificat-constatator-express.ro: primul ghid publicat și audit
<!-- categorie: seo -->

## Pentru echipă

Pe site-ul de certificat constatator a apărut primul ghid: cât e valabil certificatul constatator și de ce cer instituțiile „30 de zile”. Meniul are acum „Ghiduri”.

Pe pagina principală am corectat o frază. Spunea că formularul recunoaște singur un PFA după CUI, dar formularul nu face asta. Acum scrie ce face clientul de fapt: la PFA, II sau IF alege varianta pe persoană fizică și scrie CNP-ul titularului.

A doua actualizare, tot azi: s-a publicat și ghidul despre PFA și punct de lucru. Regula, confirmată de Raul: pentru PFA, întreprindere individuală sau familială, certificatul se cere pe persoană fizică, cu CNP-ul titularului, nu pe CUI. Certificatul pe persoană fizică arată și firmele în care omul a fost cândva asociat sau administrator, nu doar pe cele de acum. Dacă un client întreabă „apare și firma unde am fost administrator?”, răspunsul e da.

---

## Audit (25.11)

- **GSC:** doar `/` e indexată (crawl 18.11, canonical corect). `/termeni-si-conditii/` și `/politica-de-anulare/` sunt „Descoperite – nu sunt indexate”; `/despre/`, `/contact/`, `/politica-de-confidentialitate/`, `/politica-cookies/` sunt necunoscute Google. Sitemapul (7 URL-uri, 0 erori) a fost descărcat ultima dată pe 22.11.
- **Afișări 01–23.11:** 64 de afișări, 1 clic, poziția medie ~59. Cea mai bună poziție e 14, pe „certificat constatator detaliat”. „Certificat constatator” iese pe 81,5. Afișările cresc ușor: 2–5 pe zi la mijlocul lunii, 5–9 pe zi din 17.11.
- **Tehnic, fără probleme:** 200, `index, follow`, canonical corect, `www` → 308 spre domeniul fără www, 404 real, robots corect. Schema: Organization, WebSite, BreadcrumbList, Service, WebPage. 1.442 de cuvinte în `<main>`, 0 mențiuni eghiseul, toate imaginile au alt. PageSpeed pe mobil: Performance 97, SEO 100, LCP 1,6 s, CLS 0. CrUX nu are date (trafic prea mic).
- **Similaritate cu `/servicii/certificat-constatator-online/` de pe eghiseul** (regula §1): Jaccard pe shingle-uri de 5 cuvinte 0,012, la fel cu numele mascate. Paginile sunt complet diferite.
- **Comenzi pe platforma `constatator`:** 7 de la lansare, 1 plătită (testul din 16.11). Două au venit din reclamă, două din căutare organică, trei direct.
- **Cauza principală:** site-ul are o singură pagină de conținut și niciun ghid. Ghidurile din coadă (18.11, 25.11) nu fuseseră publicate.

## Ce s-a schimbat

- `src/config/constatator-nav.ts`: `/ghiduri/valabilitate-certificat-constatator/` are `published: true` și `updated` 2026-11-25. „Ghiduri” a intrat în `CONSTATATOR_NAV`.
- `src/config/constatator-sitemap.ts`: s-a adăugat `/ghiduri/`, care devine indexabil când există cel puțin un ghid. `/` are acum `lastModified` 2026-11-25.
- În ghid: `PUBLISHED`/`UPDATED` sunt 2026-11-25. Faptele au fost recitite pe Legea 265/2022 (art. 11 alin. 1, 3, 8) și pe pagina ONRC „Certificate constatatoare” („starea la zi”, 30 lei, InfoCert 24/7, plata doar cu cardul). Introducerea listei de schimbări nu mai spune „potrivit listei ONRC”, pentru că sediul social nu apare în lista de pe pagina ONRC.
- `src/app/constatator/page.tsx`: fraza falsă despre detectarea PFA a fost înlocuită. Secțiunea „Cât este valabil” are acum link spre ghid (regula §5, linkuri interne din conținut).
- Ghidul PFA/punct de lucru e ținut. Contrazice pagina principală și pagina eghiseul (PFA pe CUI sau pe CNP) și susținea că formularul detectează un PFA. Ce trebuie hotărât e notat în `docs/certificat-constatator/README.md`.

## Actualizare 25.11: ghidul PFA publicat

- Raul a confirmat regula: PFA/II/IF primesc certificatul pe persoană fizică, după CNP-ul titularului. Certificatul pe persoană fizică arată și calitățile din trecut. Sursă: nota de tarif de pe pagina ONRC „Certificate constatatoare”: „30 lei, indiferent dacă este/nu este/a fost/nu a fost identificat cu funcții și calități”.
- Ghidul `/ghiduri/certificat-constatator-pfa-punct-de-lucru/` a fost corectat:
  - rezumatul, `orderLead`, secțiunea „Certificatul de informare”, lista „Pe care îl ceri” și paragraful de preț spun acum „pe persoană fizică, după CNP”;
  - a fost scoasă afirmația falsă „formularul recunoaște CUI-ul unui PFA”.
  - Ghidul e publicat (`published: true`).
- Pagina principală constatator: în FAQ-ul despre PFA a fost scoasă aceeași afirmație falsă și s-au adăugat funcțiile din trecut. În tabelul de tipuri scrie acum „este sau a fost asociat ori administrator”.
- eghiseul `/servicii/certificat-constatator-online/`: în FAQ-ul despre PFA s-a adăugat „inclusiv cele din trecut”.
- Rămâne deschis: pagina eghiseul spune că certificatul pe persoană fizică „se emite automat, în câteva minute”, iar pagina constatator spune că „îl depune echipa”. Workerul ONRC are fluxul PF automatizat din 15.06, dar până acum doar în dry-run. Formularea corectă se alege după primul test plătit pe persoană fizică.
