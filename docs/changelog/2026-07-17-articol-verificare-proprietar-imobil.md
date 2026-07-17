# 2026-07-17 — Articol nou: „Cum afli cine e proprietarul unui imobil"

Prima piesă din Front D rămasă (STRATEGY-2026-07-13); decizia de format în `docs/seo/2026-07-17-analiza-verificare-proprietar-constatator-per-tip.md` (articol, nu pagină serviciu — money pages există deja).

## Pagina

- `/verificare-proprietar-imobil/` — articol, categoria Cadastru & imobiliare, scris pe reguli /humanizer (answer-first, fără AI-isme, voce proprie).
- **Target queries:** cine este proprietarul unui imobil · verificare proprietar apartament/teren · cum afli al cui e un teren · verificare carte funciara online (694 exp poz 9,2 GSC — striking) · proprietar după adresă.
- **Funnel triplu:** extras CF (proprietarul apare în extras) + identificare imobil după adresă (când ai doar adresa) + identificare după numele proprietarului (căutarea inversă, 163,64 lei + TVA — serviciu pe care îl aveam dar nu-l promova niciun articol).
- Conținut: metodele reale cu limitele lor (geoportal = fără nume; primărie/taxe = nu dau date; registru agricol = doar terenuri fără CF), partea legală (art. 883 Cod civil — oricine poate cerceta CF fără interes justificat; Legea 7/1996), caz apartamente (CF colectivă vs individuală), notă temporară despre căderea ANCPI cu link.
- 7 FAQ-uri (schema din layout) mapate pe query-uri reale.

## Anti-canibalizare

- Distinct de `cum-aflam-numarul-carte-functionara-si-nr-cadastral` (acela = NUMĂRUL de CF; acesta = PROPRIETARUL). Cross-link în ambele direcții (related services acolo, ghid linkat aici).
- Titlul nu conține „număr carte funciară/cadastral".

## Înregistrări

- `config/articles.ts` — intrare nouă (poziția 2, după ANCPI outage) + titlu/excerpt ANCPI actualizate cu „atac cibernetic"/e-Terra.
- `lib/seo/constants.ts` — slug în HARDCODED_ARTICLE_SLUGS (sitemap).
- IndexNow ping la publish.

## Rămas

- Imagine featured `/images/articole/verificare-proprietar-imobil.webp` (1200×675) — Raul o generează (prompt dat în sesiune); până atunci OG folosește fallback-ul default.
- Piesa 2 din analiză: 3 landing-uri constatator per-tip (de bază/extins/insolvență) — nefăcută încă.
