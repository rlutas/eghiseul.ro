# 2026-08-28 — Scan complet pagini (tipare AI, calibrat pe CJO)

Rescanare LIVE a întregului site (186 pagini din sitemap, fără cele legale) cu
scorerul reconstruit (`score.py` — lexicon RO: promo, hedging, false ranges,
filler, liste `**Termen:**`, em-dash; scor = potriviri per 1.000 cuvinte în
`<main>`). **Calibrare: același scorer rulat și pe CJO (68 pagini) — site-ul
control, neafectat de spam update.** Numerele absolute diferă de auditul din
24.08 (lexicon mai larg); comparațiile eghiseul↔CJO sunt corecte pentru că
folosesc același instrument.

## Rezultat

| | eghiseul | CJO (control) |
|---|---|---|
| Pagini | 186 | 68 |
| Mediană scor | **12,9** | **6,4** |
| Pagini ≥12 | **108** | 12 |
| Pagini ≥15 | 36 | 7 |

Pe clustere (eghiseul, mediană):

| Cluster | n | Mediană |
|---|---|---|
| **Locație extras CF** (`/servicii/extras-de-carte-funciara/<județ>/`) | **42** | **13,4** — majoritatea 745–780 cuvinte, cvasi-identice |
| Locație cazier | 10 | 13,1 |
| Calculatoare | 41 | 12,6 — dar NEAFECTATE (au utilitate funcțională) |
| Articole | 60 | 11,4 |
| Pagini serviciu principale | 29 | 8,2 ✅ |
| CJO pagini locație (control) | 39 | 6,4 |

**Constatarea nouă față de raportul din 24.08:** cel mai mare cluster toxic nu
sunt cele 16 pagini de locație cazier, ci cele **42 de pagini de locație extras
CF** — thin (sub 800 de cuvinte), șablonate, scor dublu față de echivalentul
CJO. Împreună cu locațiile de cazier = 52 de pagini cvasi-duplicate, exact
profilul „scaled content" pe care îl lovește update-ul.

**Dovada că rescrierea funcționează** (lotul 1 din 24.08, scoruri AZI):

| Pagină | Scor |
|---|---|
| /totul-despre-cartea-funciara-colectiva/ (rescrisă) | **1,1** (era top-toxic) |
| /rolul-si-atributiile-onrc-romania/ (rescrisă) | 3,3 |
| /taxa-cazier-judiciar/ (rescrisă) | 5,0 |
| /cele-4-tipuri-de-certificat-constatator-online/ (NErescrisă) | 23,8 |

44 de pagini non-calculator au sub 800 de cuvinte (thin).

## Ordinea de lucru (lotul 2+)

1. Articolele ≥15 rămase (cele-4-tipuri 23,8; constatator de bază 25,3; cu
   istoric 22,3; insolvență 21,3; PFA 19,3; anii-lucrati 21,5; sms-fals 19,4;
   verificare-proprietar 18,9; profesori 17,8; cat-poti-construi 17,8 …
   lista completă în `eghiseul-scores.txt`).
2. **Cele 42 pagini locație extras CF**: diferențiere reală (BCPI local, taxe,
   termene, specific județean) SAU consolidare cu 301 în pagina-mamă — ținta
   e sub nivelul CJO (6/1k) și peste 1.000 cuvinte utile, altfel se taie.
3. Cele 10+6 pagini locație cazier — la fel.
4. Thin-urile rămase: extinde sau 301.
5. Calculatoarele: ULTIMELE — scor mare dar au supraviețuit (utilitate); doar
   curățare ușoară de text, fără prioritate.

Monitorizare: expuneri GSC pe `/servicii/` zilnic (checkpoint 28.08: 99–172
expuneri/zi, plat). Vezi și `../2026-08-24-spam-update-prabusire-organica.md`.
