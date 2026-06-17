# On-page SEO — pagini servicii (pass 2026-06-17)

Sursă date: GSC export `docs/seo/gsc-data/.../2026-06-13/` (Pagini.csv + Interogări.csv).
Metodă: pentru fiecare pagină-serviciu, cluster striking-distance (poziții ~5-20 cu
impresii), apoi titlu/meta pentru CTR + conținut nou țintit + internal linking
anti-canibalizare. Aplicat ca **sub-blocuri** în secțiuni existente ca să nu rup
alternanța fundalurilor (vezi `docs/design/SERVICE-PAGE-DESIGN-GUIDE.md`).

## Pagini optimizate (wave 1 — cele cu impresii mari / CTR mic)

| Pagină | GSC (impr / CTR / poz) | Schimbări cheie |
|---|---|---|
| extras-de-carte-funciara | 929k / 0.82% / 8.2 | titlu+meta (meta era 280c, trunchiat); secțiune „gratuit (MyeTerra/ROeID/72h)" + „intabulare"; 4 FAQ; link la articolele nr-cadastral + valabilitate (anti-canibalizare) |
| eliberare-certificat-de-nastere | 944k / 3.64% / 6.3 | meta (titlu păstrat — deja rankuiește top); „Situații frecvente" 4 carduri (pierdut/altă localitate/împuternicire/copil); H2 „acte necesare pentru duplicat"; 4 FAQ; link căsătorie/celibat |
| cazier-judiciar-online | 535k / 0.75% / 9.7 | titlu (scos „198 RON" — caută „gratuit") + meta; secțiune „Cazierul judiciar online este gratuit?" (taxă eliminată 2024 vs serviciu); surfacing „eliberare"; 3 FAQ; link la /taxa-cazier-judiciar/ |
| cazier-fiscal-online | 507k / 2.79% / 7.0 | titlu+meta („persoană fizică, fără SPV"); „verificare cazier fiscal"; „cazier fiscal vs certificat de atestare fiscală" (E-E-A-T); 3 FAQ; linkuri interne |
| certificat-constatator-online | 331k / 0.27% / 8.2 | titlu (scos prețul) + meta (era 233c); „de bază vs extins"; secțiune „valabilitate" (query pos 4.11); FAQ PF; link la ghid ONRC + rol ONRC |
| certificat-de-integritate-comportamentala | 148k / 1.34% / 6.5 | titlu+meta; „cost/gratuit"; „din orice oraș + adeverință=certificat"; 3 FAQ; link la ghid + comparație cazier |

## Principii aplicate
- **Meta ≤155c** (toate aveau 190-280c, se trunchiau în SERP) — cel mai sigur câștig CTR.
- **Anti-canibalizare:** paginile-serviciu (tranzacțional) linkează către articolele
  informaționale care rankuiesc deja pe head terms — nu duplică conținutul lor.
- **Acuratețe:** fără „instant" pe documente livrate în zile; „gratuit" explicat onest.

## Rămase (wave 2 — impresii/poziții mai mici, de făcut pe rand)
- cazier-auto-online (4.6k clicks, CTR 8.48%, poz 5.0 — deja bun)
- eliberare-certificat-de-casatorie (poz 5.9)
- eliberare-certificat-de-celibat (poz 6.6)
- extras-plan-cadastral
- identificare-imobil

## De urmărit / follow-up tehnic
- `/servicii/extras-multilingv-certificat-nastere/` → **404** (URL în GSC cu trafic istoric) — candidat redirect.
- Cluster `harta cadastru / cadastru online` (~45k impr, fără owner) — pagină dedicată separată.
- Re-verifică GSC la 2-3 săptămâni după deploy (schimbările de titlu pot remixa ce query rankuiește).
