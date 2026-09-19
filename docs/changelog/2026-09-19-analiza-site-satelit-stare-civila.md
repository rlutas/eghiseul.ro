# 19.09.2026 — Analiză: site nou pentru certificatele de stare civilă
<!-- categorie: seo -->

## Pentru echipă

Nimic nu se schimbă azi în cum lucrați. E o analiză pentru o decizie de business:
după căderea din august, certificatele de naștere, căsătorie, celibat și
extrasele multilingve (jumătate din venit înainte, cele mai scumpe comenzi) au
pierdut peste 90% din afișările pe Google. Se propune un site separat, dedicat
doar acestor acte, cu comanda pe el, dar lucrat din același admin ca acum.
Dacă se aprobă, comenzile de pe el vor apărea în aceeași listă de comenzi, cu
eticheta platformei. Un concurent (infocazier) a lansat sute de pagini pe orașe
pentru naștere și căsătorie; noi nu repetăm modelul, ne-a costat deja.

---

## Rezumat tehnic

Analiza completă: [`docs/seo/2026-09-19-site-satelit-stare-civila.md`](../seo/2026-09-19-site-satelit-stare-civila.md).

- **Date:** GSC ferestre egale (stare civilă: expuneri −90%+, poziția urcă), DB
  (44 comenzi / 51.176 RON pe 90 zile, medie 1.030–1.260 RON), SERP real cu
  `&pws=0` (naștere: centruldevize #1, infocazier #3; celibat: eghiseul #1).
- **Infocazier:** domeniu din 14.03.2025, React SPA, 223 + 225 + 3.284 pagini
  pe localități în 3 sitemap-uri; rankează cu hub-ul, nu cu orașele.
- **Verdict:** site satelit DA, dar de sine stătător (comanda pe el), NU redirect
  spre eghiseul (doorway). Modelul = CJO (un subiect, neatins de update).
- **Domeniu:** `certificatdenastere.ro` liber (ROTLD 19.09); alternativă
  umbrelă `actecivile.ro`; `stareacivila.ro` evitat (numele instituției).
- **Build:** al doilea deploy din repo-ul eghiseul, tenant prin env
  (`BASE_URL` e hardcodat în `src/lib/seo/constants.ts`), același admin/DB,
  `platform` nou în registrul central. Estimare 2–3 săptămâni până la comandă.
