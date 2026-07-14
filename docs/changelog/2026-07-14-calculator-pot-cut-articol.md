# 2026-07-14 — Calculator „Cât pot construi" (POT/CUT) + articol + upsell pe extras CF

Continuarea pachetului „construiești pe teren" (după convertorul de jugări + serviciul certificat de urbanism). Documentare: Legea 350/2001 anexa 2 (definiții POT/CUT), HG 525/1996 anexa 2 (POT maxim pe zone: rezidențial P–P+2 35%, peste 3 niveluri 20%, predominant rezidențial 40%, central 80%), excepțiile de calcul (balcoane <3m + logii închise intră; terase deschise/subsol <1,80m/alei nu). Concurența (proiect-dtac, kapal, andaros) face calculul INVERS (arhitect: verifică suprafețele propuse); noi facem direcția cumpărătorului: teren + POT → cât pot construi. Nimeni nu vinde CF + certificat urbanism lângă calculator.

## 1. Calculator `/calculator/cat-pot-construi/`

- Widget: teren (mp SAU ari, conversie automată) + POT% + CUT opțional → amprentă maximă la sol, teren rămas liber, suprafață desfășurată maximă, ~niveluri la amprenta plină.
- Conținut GEO-ready (skill-uri /seo-content + /seo-geo): răspuns în primele 60 de cuvinte (TL;DR cu formula), H2-uri întrebare, tabel POT pe zone, 10 FAQ (FAQPage schema via layout), exemple pe cifre.
- Înregistrat: nav (Imobiliare & credite, popular, icon Ruler), DESC index, sitemap, RELATED_BY_SLUG → certificat urbanism + extras CF + identificare imobil.

## 2. Articol `/cat-poti-construi-pe-teren/`

- ArticleLayout (categoria Cadastru & imobiliare), ~1.500 cuvinte, scris pe reguli /humanizer (fraze directe, exemple concrete pe cifre, fără AI-isme).
- Secțiuni: răspuns scurt cu formula, POT vs CUT, exemplu pe 600 mp, tabel valori legale, ce intră/nu intră în amprentă, de unde iei cifrele, greșeli frecvente, pașii în ordine. 6 FAQ.
- **Interlinking:** calculator POT/CUT (CTA principal), certificat-urbanism-informare, extras CF, convertor jugăr/stânjen, related services în layout.
- Slug în HARDCODED_ARTICLE_SLUGS (sitemap). **Imagine featured:** de pus manual la `public/images/articole/cat-poti-construi-pe-teren.webp` (prompt ChatGPT livrat lui Raul).

## 3. Upsell pe pagina extras CF

Box „Vrei să construiești pe terenul tău?" (copy Raul) după secțiunea „ce este": suprafața din acte + POT din certificatul de urbanism → calculator; fără certificat → serviciul nostru de la primărie.

## Verificare

tsc + eslint curat, 1.155 teste trec, toate paginile 200 în dev; interlinking confirmat în HTML-ul randat (calculator↔articol↔servicii).
