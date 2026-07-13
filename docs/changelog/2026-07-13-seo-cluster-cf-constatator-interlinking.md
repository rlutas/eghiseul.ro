# 2026-07-13 (noaptea) — Execuție plan SEO: articole noi, interlinking calculatoare, cluster constatator

Continuarea planului din [analiza competiție CF/constatator](../seo/2026-07-13-analiza-competitie-cf-constatator.md). Poziționare decisă: prețul rămâne 89 RON, diferențiatorul comunicat = **eliberare automată instant, 24/7** (competitorii procesează manual, în program).

## 1. Articol nou: „Extras de carte funciară gratuit prin MyTerra"

`/extras-carte-funciara-gratuit/` — țintește intentul dominant al SERP-ului CF („gratuit", 3 sloturi editoriale: juridice, avocatnet, cfunciara).

- Fapte verificate din anunțul ANCPI (juridice.ro, 2 iunie 2025): gratuit = extras informare + extras plan cadastral ortofotoplan; condiție = cont MyTerra cu identitate verificată (ROeID / semnătură calificată / ghișeu, până la 72h)
- Ghid onest pas-cu-pas + limitele variantei gratuite + comparație transparentă cu serviciul plătit (fără cont, instant, 24/7, identificare după adresă)
- Scris pe regulile /humanizer (fără AI-isms), verificat pe /seo-content
- Link extern sursă (juridice.ro) pentru E-E-A-T; 6 FAQ (inclusiv „noaptea/weekend" pentru AI Overviews)
- Cross-link: pagina serviciu CF (secțiunea „gratuit") → articol; articol → serviciu + ghid numere CF

## 2. Articol nou: „Certificat constatator cu istoric"

`/certificat-constatator-cu-istoric/` — long-tail tranzacțional (487 lei produs), fără canibalizare cu articolul „4 tipuri" (#3 pe head terms).

- Ce conține istoricul, când e necesar (litigii, due diligence, creanțe) vs când ajunge de bază (89 lei)
- Cross-link triunghi: articol „4 tipuri" ↔ articol istoric ↔ pagina serviciu
- Link extern ONRC (atribuire)

Ambele articole înregistrate în `HARDCODED_ARTICLE_SLUGS` (sitemap) + `src/config/articles.ts` (arhiva blog). Imagini featured refolosite din articolele-surori (de înlocuit când avem creative dedicate).

## 3. Internal linking: calculatoare → pagini de servicii (toate 36)

Calculatoarele + rovinieta aduc ~80% din clicurile organice, dar nu pasau nimic spre money pages. Fix sistematic în `CalculatorLayout` (un singur loc, toate 36 calculatoarele):

- Secțiune nouă „Documente utile, 100% online" cu 2-3 carduri per calculator, ancore exact-match („Extras de carte funciară online", „Certificat constatator online", „Cazier judiciar online"...)
- Mapare contextuală per slug (`RELATED_BY_SLUG`): imobiliare/credit → extras CF; firmă/fiscal → constatator + cazier fiscal; juridic/angajare → cazier; auto → cazier auto; familie → certificat naștere; fallback pe setul default (cazier + CF + constatator)

## 4. De făcut în continuare (din plan)

- OTS Agerpres (unghi „primul serviciu 100% automat 24/7") — decizie user
- GSC: Validate fix pe review snippets + Request indexing pe articolele noi
- Creative dedicate pentru imaginile featured ale celor 2 articole noi
- Re-check poziții în 2-3 săptămâni

**Commit-uri aferente zilei (SEO):** favicon `8d49a5d` · Product schema `6d84852` · titluri 24/7 `40f1f7c` · articolele + interlinking (commit-ul acestui doc).
