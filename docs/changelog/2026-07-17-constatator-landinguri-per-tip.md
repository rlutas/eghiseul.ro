# 2026-07-17 — Constatator: 3 landing-uri tranzacționale per tip + preselect în wizard

Piesa 2 din analiza `docs/seo/2026-07-17-analiza-verificare-proprietar-constatator-per-tip.md`. Competitorii (EMD-uri thin sub 1.000 cuvinte: certificat-online.ro, unclickdistanta, certificat-constatator-online.ro) câștigă long-tail-urile per-tip cu pagini de comandă dedicate; noi n-aveam niciuna.

## Schimbare față de analiză

Al 3-lea landing NU e „fonduri IMM" (s-ar fi canibalizat cu use-case-ul `certificat-constatator-pentru-fonduri-europene` existent), ci **PFA/persoană fizică** — cerere reală separată („certificat constatator PFA"), competitorii au ghiduri dedicate, iar noi avem fluxul PF automatizat pe CNP.

## Paginile (ArticleLayout, categoria Servicii ONRC, OG partajat constatator)

| Pagină | Target | Livrare afirmată |
|---|---|---|
| `/certificat-constatator-de-baza/` | „certificat constatator de baza pret/ce contine" | minute, 24/7 |
| `/certificat-constatator-insolventa/` | „certificat constatator insolventa" | max 24h lucrătoare (backoffice ONRC — onest) |
| `/certificat-constatator-pfa/` | „certificat constatator PFA / persoana fizica" | minute, 24/7 |

- Answer-first + humanizer; preț onest: tarif oficial ONRC 30 lei (Ordin MJ 380/C/2024) vs 89 lei la noi cu tot inclus — secțiune „comparația onestă" ca la articolul MyTerra.
- Claims livrare aliniate cu articolul „cele 4 tipuri" (de bază/PF/istoric = minute; IMM/insolvență = backoffice max 24h).
- Conținut PF verificat pe config-ul real din DB (documentTypes: firma cu 3 reportTypes, pf pe CNP, istoric 487 lei) + scopurile ONRC reale per tip.
- Corectitudine PF: raportul e pe PERSOANĂ (calități în firme + titular PFA/II/IF), nu doar „datele PFA-ului" — aliniat cu articolul „4 tipuri" și cu blockMessage-ul din wizard.

## Wizard: preselect prin URL (`ConstatatorStep.tsx`)

`/comanda/certificat-constatator/?tip=de-baza|imm|insolventa|pf|istoric` → tipul (și reportType-ul pentru firmă) vin preselectate. Guard-uri: se aplică o singură dată, doar pe pas gol (nu suprascrie draft restaurat sau alegerea userului), doar dacă tipul există în config. Citit din `window.location.search` la mount (fără useSearchParams/Suspense).

## Interlinking (ierarhic, anti-canibalizare)

- Articolul „cele 4 tipuri" (informațional, #1 organic pe „de baza pret" — NEATINS ca poziționare): CTA-urile celor 5 tipuri primesc `?tip=`, secțiunile 1/3/4 linkuiesc landing-urile; dateModified bump.
- Landing-uri → serviciu hub + articol tipuri + use-case-uri relevante (insolvență→licitație/notar; de bază→bancă; pfa→cazier fiscal).
- Înregistrate în `config/articles.ts` (grupul Comercial/ONRC) + `HARDCODED_ARTICLE_SLUGS` (sitemap) + IndexNow.

## De verificat manual

- Preselect-ul pe preview/prod: deschide `/comanda/certificat-constatator/?tip=insolventa` → tipul „firmă" + raportul insolvență selectate.
- GSC ~2 săptămâni: impresii pe „certificat constatator de baza", „constatator insolventa", „constatator pfa".
