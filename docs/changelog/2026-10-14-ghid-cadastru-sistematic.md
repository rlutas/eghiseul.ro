# 14.10.2026 — Ghid nou: cadastrul sistematic (afișare, rectificare, CF nou)
<!-- categorie: seo -->

## Pentru echipă

- Pe site a apărut ghidul **„Cadastru sistematic”** (eghiseul.ro/cadastru-sistematic/): ce e programul, cum afli dacă o comună e în lucru, ce verifici în cele 60 de zile de afișare, cum se cere rectificarea și ce se schimbă după (carte funciară nouă, număr nou, impozit).
- Când un client întreabă de cadastrul sistematic sau de o greșeală de acolo, trimiteți-i linkul. **Noi nu facem rectificări**: le soluționează comisia (primărie, firma care a măsurat, OCPI); Mircea nu poate interveni din afară.
- Ce vindem din asta: extrasul de carte funciară pe numărul nou și identificarea imobilului când clientul nu știe numărul nou.
- Clienții care au comune în lucru găsesc documentele pe pnccf.site (portalul de afișare); îi putem îndruma acolo.

---

## Tehnic

- Pagină nouă `src/app/(eghiseul)/cadastru-sistematic/page.tsx` (ArticleLayout, FAQPage, ~2.380 de cuvinte în `<main>`), poza `public/images/articole/cadastru-sistematic.webp` (generată, fără text/însemne).
- Înregistrată în `src/config/articles.ts`, `HARDCODED_ARTICLE_SLUGS` (sitemap) și `last-modified.ts`.
- Linkuri spre ea din: `/ancpi-nu-functioneaza/` (primește căutările „geoportal ancpi”, ~1.500 afișări/180 zile în GSC), `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/`, `/cat-costa-cadastrul-si-intabularea/`, `/verificare-proprietar-imobil/`, pagina de serviciu extras CF.
- Surse în pagină: Legea 7/1996 (consolidată 13.07.2026), Regulamentul aprobat prin Ordinul ANCPI 1/2020 (consolidat 30.12.2024), Codul fiscal art. 461/466. Nu afirmăm: statutul oficial al pnccf.site (doar „prezentat ca” + confirmă cu primăria), extras gratuit după finalizare, trecerea automată la comună.
- Text verificat cu `clean-user-facing-text`: zero caractere invizibile, stylometry 0,03 (tier low).
- Regula de ritm: singura pagină nouă din săptămâna 12–18.10.
