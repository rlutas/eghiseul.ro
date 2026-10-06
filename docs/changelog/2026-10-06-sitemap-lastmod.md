# 06.10.2026 — Sitemap: fiecare pagină are data reală a ultimei modificări
<!-- categorie: seo -->

## Pentru echipă

- Google și Bing află acum din sitemap când s-a schimbat fiecare pagină de pe eghiseul și documentero. Până azi, 86 din 112 pagini eghiseul nu aveau nicio dată, deci motoarele nu știau că paginile de serviciu s-au actualizat.
- Datele sunt cele reale (ultima schimbare de conținut), nu data la care se publică site-ul.
- Nu e nimic de făcut din partea echipei.

---

- `src/lib/seo/last-modified.ts`: new `PATH_LAST_MODIFIED` registry (static pages, `/servicii/*`, sub-routes, calculators, tools), generated from `git log --follow` per `page.tsx`, skipping rename-only commits (the 19.09 move into `(eghiseul)`); pages with today's „Pe scurt” block = 2026-10-06, same as their visible „Actualizat la”.
- `src/app/sitemap.ts`: every entry gets `lastModified` (articles keep `PAGE_LAST_MODIFIED`).
- `src/config/documentero-sitemap.ts`: dates re-derived from git (apostila guide 20.09 → 06.10, celibat/naștere/căsătorie, guides edited for the CIEC alignment, home, despre, termeni).
- Test `tests/unit/lib/seo/sitemap-lastmod.test.ts`: every URL has a lastmod, none equals a frozen "now", money pages covered, more than 5 distinct dates; documentero entries all ISO dates.
- Local check: eghiseul 112/112 URLs with lastmod (17 distinct dates; live had 26/112), documentero 18/18 (4 distinct). IndexNow's daily cron reads these dates, so changed pages now get pinged.
