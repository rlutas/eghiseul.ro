# 01 — Baza de date Google Search Console

Generat 2026-11-10, read-only, prin API-ul Search Console (`webmasters.readonly`, cont de serviciu). Ultima zi cu date: **2026-11-08**. Paginare `startRow` / `rowLimit 25000` pe toate interogările.

## 0. Proprietăți accesibile și istoric disponibil

`sites().list()` a întors 9 proprietăți. Prima/ultima zi cu date, interogare pe `date` între 2025-07-01 și 2026-11-09:

| Proprietate | Permisiune | Prima zi | Ultima zi | Zile cu date | Clicuri totale |
|---|---|---|---|---:|---:|
| https://eghiseul.ro/ | siteFullUser | 2025-07-01 | 2026-11-08 | 496 | 1,521,677 |
| sc-domain:cazierjudiciaronline.com | siteOwner | 2026-09-20 | 2026-11-08 | 50 | 15,529 |
| sc-domain:documentero.ro | siteFullUser | 2026-09-19 | 2026-11-08 | 51 | 104 |
| sc-domain:ecazier.ro | siteOwner | 2026-09-20 | 2026-11-08 | 50 | 81 |
| sc-domain:erovinieta.net | siteFullUser | 2025-11-24 | 2026-11-08 | 350 | 480,045 |
| https://www.avocat-tarta.ro/ | siteFullUser | 2025-10-14 | 2026-11-08 | 391 | 4,857 |
| https://micropigmentare-scalp.ro/ · sc-domain:stanbaculescu.ro · sc-domain:momenteqr.ro | — | — | — | — | în afara scopului |

**Concluzie pe CJO:** contul de serviciu NU are nicio proprietate URL-prefix pentru cazierjudiciaronline.com (nici `https://cazierjudiciaronline.com/`, nici `https://www.…`). Singura proprietate e `sc-domain:cazierjudiciaronline.com`, cu date doar din **2026-09-20**. Deci pentru CJO nu se poate face comparația „28 de zile înainte de 20.08” din GSC; pentru CJO folosesc doar comparația din jurul căderii din octombrie. Dacă există o proprietate veche URL-prefix creată din alt cont Google (WordPress-ul vechi), ea trebuie partajată cu contul de serviciu ca să intre în analiză. La fel ecazier.ro și documentero.ro (doar din 19–20.09). eghiseul.ro are istoricul complet de 16 luni (din 2025-07-01).

Cota de interogări anonimizate (diferența dintre totalul pe `page` și suma pe `query`, ultimele 28 de zile): CJO 3.190 din 5.522 clicuri vizibile pe query (58%); eghiseul 8.034 din 11.282 (71%). Toate tabelele pe query acoperă doar partea neanonimizată.

## 1. Trend săptămânal pe site

Repere: spam update ~20.08.2026 (săpt. 17.08), curățenia 301 din 09.09 (săpt. 07.09), a doua cădere 16–19.10 (săpt. 12.10 și 19.10).

### 1.1 cazierjudiciaronline.com

Proprietate: `sc-domain:cazierjudiciaronline.com`. Săptămâni luni–duminică, tip `web`. Poziția = medie ponderată cu impresiile. „Δ clicuri” = față de săptămâna anterioară.

| Săptămâna (luni) | Zile | Clicuri | Impresii | CTR | Poziție | Δ clicuri | Notă |
|---|---:|---:|---:|---:|---:|---:|---|
| 2026-09-14 | 1 | 405 | 10,235 | 3.96% | 5.3 |  | săptămână parțială |
| 2026-09-21 | 7 | 3,823 | 95,754 | 3.99% | 5.0 |  |  |
| 2026-09-28 | 7 | 3,006 | 84,938 | 3.54% | 5.1 | -21% |  |
| 2026-10-05 | 7 | 2,802 | 82,975 | 3.38% | 5.3 | -7% |  |
| 2026-10-12 | 7 | 2,443 | 86,369 | 2.83% | 5.2 | -13% | **a doua cadere 16–19.10** |
| 2026-10-19 | 7 | 1,376 | 65,966 | 2.09% | 6.2 | -44% | **a doua cadere 16–19.10 (continuare)** |
| 2026-10-26 | 7 | 883 | 56,650 | 1.56% | 6.4 | -36% | scădere >25% |
| 2026-11-02 | 7 | 791 | 50,232 | 1.57% | 6.5 | -10% |  |

### 1.2 eghiseul.ro

Proprietate: `https://eghiseul.ro/ (URL-prefix)`. Săptămâni luni–duminică, tip `web`. Poziția = medie ponderată cu impresiile. „Δ clicuri” = față de săptămâna anterioară.

| Săptămâna (luni) | Zile | Clicuri | Impresii | CTR | Poziție | Δ clicuri | Notă |
|---|---:|---:|---:|---:|---:|---:|---|
| 2025-06-30 | 6 | 12,307 | 266,717 | 4.61% | 6.1 |  | săptămână parțială |
| 2025-07-07 | 7 | 13,959 | 301,483 | 4.63% | 6.1 |  |  |
| 2025-07-14 | 7 | 13,487 | 293,731 | 4.59% | 6.6 | -3% |  |
| 2025-07-21 | 7 | 14,607 | 303,702 | 4.81% | 6.5 | +8% |  |
| 2025-07-28 | 7 | 16,225 | 331,247 | 4.90% | 6.2 | +11% |  |
| 2025-08-04 | 7 | 16,097 | 328,884 | 4.89% | 6.7 | -1% |  |
| 2025-08-11 | 7 | 14,764 | 294,981 | 5.01% | 6.5 | -8% |  |
| 2025-08-18 | 7 | 15,201 | 328,567 | 4.63% | 6.6 | +3% |  |
| 2025-08-25 | 7 | 20,517 | 374,256 | 5.48% | 6.1 | +35% |  |
| 2025-09-01 | 7 | 19,192 | 371,692 | 5.16% | 6.6 | -6% |  |
| 2025-09-08 | 7 | 17,992 | 386,180 | 4.66% | 5.8 | -6% |  |
| 2025-09-15 | 7 | 16,232 | 371,416 | 4.37% | 5.0 | -10% |  |
| 2025-09-22 | 7 | 17,934 | 365,339 | 4.91% | 5.0 | +10% |  |
| 2025-09-29 | 7 | 21,095 | 415,431 | 5.08% | 4.9 | +18% |  |
| 2025-10-06 | 7 | 21,339 | 441,099 | 4.84% | 4.9 | +1% |  |
| 2025-10-13 | 7 | 21,132 | 448,687 | 4.71% | 4.9 | -1% |  |
| 2025-10-20 | 7 | 19,934 | 421,980 | 4.72% | 5.0 | -6% |  |
| 2025-10-27 | 7 | 21,752 | 462,549 | 4.70% | 4.9 | +9% |  |
| 2025-11-03 | 7 | 23,223 | 495,471 | 4.69% | 4.7 | +7% |  |
| 2025-11-10 | 7 | 22,328 | 513,232 | 4.35% | 5.1 | -4% |  |
| 2025-11-17 | 7 | 21,608 | 466,213 | 4.63% | 4.9 | -3% |  |
| 2025-11-24 | 7 | 21,535 | 461,999 | 4.66% | 4.8 | -0% |  |
| 2025-12-01 | 7 | 22,424 | 466,692 | 4.80% | 4.7 | +4% |  |
| 2025-12-08 | 7 | 24,163 | 617,799 | 3.91% | 5.1 | +8% |  |
| 2025-12-15 | 7 | 20,509 | 514,031 | 3.99% | 5.9 | -15% |  |
| 2025-12-22 | 7 | 13,763 | 331,457 | 4.15% | 5.5 | -33% | scădere >25% |
| 2025-12-29 | 7 | 138,090 | 1,125,680 | 12.27% | 4.3 | +903% | vârf sezonier impozit auto (calculatorul: 224k clicuri în 2 săpt.) |
| 2026-01-05 | 7 | 147,652 | 1,482,007 | 9.96% | 5.1 | +7% |  |
| 2026-01-12 | 7 | 82,061 | 846,417 | 9.70% | 6.2 | -44% | scădere >25% |
| 2026-01-19 | 7 | 51,008 | 645,480 | 7.90% | 6.1 | -38% | scădere >25% |
| 2026-01-26 | 7 | 39,042 | 594,926 | 6.56% | 6.5 | -23% |  |
| 2026-02-02 | 7 | 35,096 | 551,621 | 6.36% | 6.2 | -10% |  |
| 2026-02-09 | 7 | 30,721 | 500,163 | 6.14% | 6.0 | -12% |  |
| 2026-02-16 | 7 | 25,514 | 457,073 | 5.58% | 6.3 | -17% |  |
| 2026-02-23 | 7 | 25,689 | 509,137 | 5.05% | 6.2 | +1% |  |
| 2026-03-02 | 7 | 23,831 | 446,247 | 5.34% | 6.6 | -7% |  |
| 2026-03-09 | 7 | 26,116 | 473,893 | 5.51% | 5.9 | +10% |  |
| 2026-03-16 | 7 | 24,473 | 496,132 | 4.93% | 5.6 | -6% |  |
| 2026-03-23 | 7 | 21,062 | 465,313 | 4.53% | 5.5 | -14% |  |
| 2026-03-30 | 7 | 17,597 | 421,466 | 4.18% | 5.4 | -16% |  |
| 2026-04-06 | 7 | 12,403 | 318,747 | 3.89% | 5.9 | -30% | scădere >25% |
| 2026-04-13 | 7 | 16,157 | 375,082 | 4.31% | 5.7 | +30% |  |
| 2026-04-20 | 7 | 14,966 | 366,524 | 4.08% | 6.2 | -7% |  |
| 2026-04-27 | 7 | 14,543 | 365,383 | 3.98% | 6.7 | -3% |  |
| 2026-05-04 | 7 | 14,577 | 385,071 | 3.79% | 6.0 | +0% |  |
| 2026-05-11 | 7 | 14,211 | 377,912 | 3.76% | 5.6 | -3% |  |
| 2026-05-18 | 7 | 13,180 | 344,304 | 3.83% | 5.6 | -7% |  |
| 2026-05-25 | 7 | 13,194 | 374,043 | 3.53% | 5.2 | +0% |  |
| 2026-06-01 | 7 | 14,817 | 393,393 | 3.77% | 5.1 | +12% |  |
| 2026-06-08 | 7 | 14,134 | 386,860 | 3.65% | 5.1 | -5% |  |
| 2026-06-15 | 7 | 12,743 | 366,161 | 3.48% | 5.2 | -10% |  |
| 2026-06-22 | 7 | 14,418 | 374,021 | 3.85% | 5.0 | +13% |  |
| 2026-06-29 | 7 | 15,047 | 405,911 | 3.71% | 5.0 | +4% |  |
| 2026-07-06 | 7 | 15,604 | 423,888 | 3.68% | 5.1 | +4% |  |
| 2026-07-13 | 7 | 13,756 | 405,480 | 3.39% | 5.7 | -12% |  |
| 2026-07-20 | 7 | 14,991 | 487,518 | 3.07% | 5.6 | +9% |  |
| 2026-07-27 | 7 | 16,705 | 610,944 | 2.73% | 6.0 | +11% |  |
| 2026-08-03 | 7 | 24,183 | 846,573 | 2.86% | 6.1 | +45% | vârf avarie ANCPI (/ancpi-nu-functioneaza/) |
| 2026-08-10 | 7 | 22,516 | 814,334 | 2.76% | 6.3 | -7% |  |
| 2026-08-17 | 7 | 14,833 | 458,155 | 3.24% | 6.2 | -34% | **SPAM UPDATE ~20.08** |
| 2026-08-24 | 7 | 4,223 | 27,363 | 15.43% | 5.6 | -72% | scădere >25% |
| 2026-08-31 | 7 | 5,399 | 31,982 | 16.88% | 4.7 | +28% |  |
| 2026-09-07 | 7 | 5,228 | 31,651 | 16.52% | 4.3 | -3% | 301 cleanup 09.09 (122 pagini) |
| 2026-09-14 | 7 | 4,741 | 33,901 | 13.98% | 5.2 | -9% |  |
| 2026-09-21 | 7 | 4,310 | 33,658 | 12.81% | 5.5 | -9% |  |
| 2026-09-28 | 7 | 4,013 | 30,691 | 13.08% | 5.8 | -7% |  |
| 2026-10-05 | 7 | 4,247 | 31,403 | 13.52% | 5.4 | +6% |  |
| 2026-10-12 | 7 | 3,907 | 33,376 | 11.71% | 7.5 | -8% | **a doua cadere 16–19.10** |
| 2026-10-19 | 7 | 2,652 | 20,614 | 12.87% | 6.9 | -32% | **a doua cadere 16–19.10 (continuare)** |
| 2026-10-26 | 7 | 2,460 | 18,550 | 13.26% | 5.5 | -7% |  |
| 2026-11-02 | 7 | 2,248 | 17,742 | 12.67% | 5.7 | -9% |  |

### 1.3 documentero.ro

Proprietate: `sc-domain:documentero.ro`. Săptămâni luni–duminică, tip `web`. Poziția = medie ponderată cu impresiile. „Δ clicuri” = față de săptămâna anterioară.

| Săptămâna (luni) | Zile | Clicuri | Impresii | CTR | Poziție | Δ clicuri | Notă |
|---|---:|---:|---:|---:|---:|---:|---|
| 2026-09-14 | 2 | 0 | 0 | 0.00% | 0.0 |  | săptămână parțială |
| 2026-09-21 | 7 | 9 | 468 | 1.92% | 9.5 |  |  |
| 2026-09-28 | 7 | 2 | 462 | 0.43% | 13.3 | -78% | scădere >25% |
| 2026-10-05 | 7 | 20 | 600 | 3.33% | 8.7 | +900% |  |
| 2026-10-12 | 7 | 20 | 663 | 3.02% | 7.4 | +0% | **a doua cadere 16–19.10** |
| 2026-10-19 | 7 | 13 | 509 | 2.55% | 8.4 | -35% | **a doua cadere 16–19.10 (continuare)** |
| 2026-10-26 | 7 | 22 | 575 | 3.83% | 8.8 | +69% |  |
| 2026-11-02 | 7 | 18 | 537 | 3.35% | 7.3 | -18% |  |

### 1.4 ecazier.ro

Proprietate: `sc-domain:ecazier.ro`. Săptămâni luni–duminică, tip `web`. Poziția = medie ponderată cu impresiile. „Δ clicuri” = față de săptămâna anterioară.

| Săptămâna (luni) | Zile | Clicuri | Impresii | CTR | Poziție | Δ clicuri | Notă |
|---|---:|---:|---:|---:|---:|---:|---|
| 2026-09-14 | 1 | 0 | 5 | 0.00% | 35.0 |  | săptămână parțială |
| 2026-09-21 | 7 | 12 | 270 | 4.44% | 12.9 |  |  |
| 2026-09-28 | 7 | 8 | 325 | 2.46% | 14.8 | -33% | scădere >25% |
| 2026-10-05 | 7 | 10 | 392 | 2.55% | 13.5 | +25% |  |
| 2026-10-12 | 7 | 7 | 474 | 1.48% | 12.2 | -30% | **a doua cadere 16–19.10** |
| 2026-10-19 | 7 | 16 | 582 | 2.75% | 14.6 | +129% | **a doua cadere 16–19.10 (continuare)** |
| 2026-10-26 | 7 | 14 | 695 | 2.01% | 11.2 | -12% |  |
| 2026-11-02 | 7 | 14 | 746 | 1.88% | 12.0 | +0% |  |

## 2. Interogări cu cel mai mare deficit de CTR

**Curba de CTR așteptat:** Sistrix, „Google CTR study” (iulie 2020, ~80 mil. cuvinte cheie, toate dispozitivele): poz. 1 = 28,5%, 2 = 15,7%, 3 = 11,0%, 4 = 8,0%, 5 = 7,2%, 6 = 5,1%, 7 = 4,0%, 8 = 3,2%, 9 = 2,8%, 10 = 2,5%; interpolare liniară între poziții întregi; peste 10 am extrapolat liniar de la 2,5% (poz. 10) la 1,0% (poz. 20), 0,5% după. E o curvă conservatoare pentru 2026 (nu include efectul AI Overviews), dar pe interogări cu reclame plătite deasupra și Hub MAI, nici ea nu e atinsă. 

**Formula:** clicuri în plus pe lună = max(0, CTR așteptat(poziție) × impresii − clicuri) × 30/28. Fereastra: ultimele 28 de zile, **2026-10-12 → 2026-11-08**. Filtru: ≥100 impresii în 28 de zile, poziție ≤ 20. Poziția GSC e media pe toate afișările, deci la poziție 6–7 pe o interogare principală estimarea e un plafon, nu o promisiune.


### 2.1 cazierjudiciaronline.com — top 40
Proprietate `sc-domain:cazierjudiciaronline.com`, 2026-10-12 → 2026-11-08.

| # | Interogare | Cluster | Impresii 28z | Clicuri | CTR real | Poziție | CTR așteptat | Clicuri/lună în plus | URL principal |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | cazier judiciar online | cazier generic | 13,897 | 57 | 0.41% | 7.1 | 3.9% | 519 | `/` |
| 2 | ghiseul.ro cazier | ghiseul (navigational) | 5,153 | 24 | 0.47% | 5.9 | 5.4% | 273 | `/cazier-judiciar-gratuit` |
| 3 | certificat de integritate comportamentala | integritate | 3,224 | 4 | 0.12% | 5.6 | 6.0% | 202 | `/certificat-integritate-comportamentala` |
| 4 | cazier online | cazier generic | 4,823 | 17 | 0.35% | 7.8 | 3.4% | 157 | `/` |
| 5 | cazier judiciar online gratuit | gratuit | 4,047 | 45 | 1.11% | 7.5 | 3.6% | 110 | `/` |
| 6 | cazier judiciar | cazier generic | 3,695 | 25 | 0.68% | 8.3 | 3.1% | 95 | `/cazier-judiciar-online/bucuresti` |
| 7 | cazier iasi | oras/judet | 1,886 | 61 | 3.23% | 4.2 | 7.9% | 94 | `/cazier-judiciar-online/iasi` |
| 8 | cazier | cazier generic | 2,109 | 26 | 1.23% | 6.4 | 4.6% | 77 | `/cazier-judiciar-online/bucuresti` |
| 9 | valabilitate cazier judiciar | termen/valabilitate | 712 | 8 | 1.12% | 3.8 | 8.5% | 56 | `/valabilitate-cazier-judiciar` |
| 10 | program cazier brasov | program/IPJ local | 932 | 12 | 1.29% | 5.2 | 6.7% | 54 | `/cazier-judiciar-online/brasov` |
| 11 | cazier judiciar persoane juridice | cazier generic | 581 | 9 | 1.55% | 3.4 | 9.8% | 51 | `/cazier-judiciar-persoane-juridice-ghid` |
| 12 | cazier constanta | oras/judet | 1,250 | 57 | 4.56% | 3.9 | 8.3% | 50 | `/cazier-judiciar-online/constanta` |
| 13 | cazier sibiu | oras/judet | 1,156 | 45 | 3.89% | 4.2 | 7.9% | 49 | `/cazier-judiciar-online/sibiu` |
| 14 | cazier auto online | auto/permis | 1,551 | 53 | 3.42% | 5.4 | 6.3% | 49 | `/cazier-auto-online` |
| 15 | ipj braila | program/IPJ local | 847 | 2 | 0.24% | 5.8 | 5.6% | 48 | `/cazier-judiciar-online/braila` |
| 16 | cazier timisoara | oras/judet | 1,194 | 41 | 3.43% | 5.0 | 7.2% | 48 | `/cazier-judiciar-online/timisoara` |
| 17 | cazier fiscal online | fiscal | 1,691 | 24 | 1.42% | 7.1 | 3.9% | 45 | `/cazier-fiscal-online` |
| 18 | program cazier galati | program/IPJ local | 599 | 42 | 7.01% | 2.4 | 13.8% | 43 | `/cazier-judiciar-online/galati` |
| 19 | cazier judiciar baia mare | oras/judet | 629 | 26 | 4.13% | 3.3 | 10.2% | 41 | `/cazier-judiciar-online/baia-mare` |
| 20 | program cazier sibiu | program/IPJ local | 696 | 3 | 0.43% | 5.6 | 5.9% | 41 | `/cazier-judiciar-online/sibiu` |
| 21 | program cazier braila | program/IPJ local | 421 | 7 | 1.66% | 3.3 | 10.2% | 39 | `/cazier-judiciar-online/braila` |
| 22 | ipj suceava | program/IPJ local | 834 | 0 | 0.00% | 7.0 | 4.0% | 35 | `/cazier-judiciar-online/suceava` |
| 23 | program cazier constanta | program/IPJ local | 566 | 18 | 3.18% | 3.7 | 9.0% | 35 | `/cazier-judiciar-online/constanta` |
| 24 | eliberare cazier judiciar | cazier generic | 1,065 | 2 | 0.19% | 8.4 | 3.1% | 33 | `/cazier-judiciar-persoane-fizice-ghid` |
| 25 | program cazier ploiesti | program/IPJ local | 677 | 34 | 5.02% | 3.5 | 9.4% | 32 | `/cazier-judiciar-online/ploiesti` |
| 26 | program cazier iasi | program/IPJ local | 763 | 9 | 1.18% | 6.1 | 5.0% | 31 | `/cazier-judiciar-online/iasi` |
| 27 | cazier fiscal | fiscal | 962 | 6 | 0.62% | 7.6 | 3.5% | 30 | `/cazier-fiscal-online` |
| 28 | ghiseul ro cazier | ghiseul (navigational) | 507 | 0 | 0.00% | 5.8 | 5.4% | 30 | `/cazier-judiciar-gratuit` |
| 29 | cazier online gratuit | gratuit | 959 | 8 | 0.83% | 7.4 | 3.7% | 29 | `/` |
| 30 | cat este valabil cazierul judiciar | termen/valabilitate | 363 | 2 | 0.55% | 4.2 | 7.8% | 28 | `/valabilitate-cazier-judiciar` |
| 31 | cat e valabil cazierul judiciar | termen/valabilitate | 329 | 1 | 0.30% | 4.0 | 8.0% | 27 | `/valabilitate-cazier-judiciar` |
| 32 | cazier auto | auto/permis | 832 | 8 | 0.96% | 7.1 | 3.9% | 27 | `/cazier-auto-online` |
| 33 | program cazier | program/IPJ local | 609 | 4 | 0.66% | 6.4 | 4.7% | 26 | `/cazier-judiciar-online/bucuresti` |
| 34 | cazier judiciar iasi | oras/judet | 471 | 11 | 2.34% | 4.7 | 7.5% | 26 | `/cazier-judiciar-online/iasi` |
| 35 | ipj galati | program/IPJ local | 689 | 1 | 0.15% | 7.5 | 3.6% | 25 | `/cazier-judiciar-online/galati` |
| 36 | ghiseul ro cazier judiciar gratuit | ghiseul (navigational) | 741 | 10 | 1.35% | 6.6 | 4.4% | 24 | `/cazier-judiciar-gratuit` |
| 37 | program cazier pitesti | program/IPJ local | 340 | 4 | 1.18% | 4.2 | 7.8% | 24 | `/cazier-judiciar-online/pitesti` |
| 38 | cazier cluj | oras/judet | 1,154 | 44 | 3.81% | 5.7 | 5.7% | 23 | `/cazier-judiciar-online/cluj` |
| 39 | program cazier mures | program/IPJ local | 249 | 5 | 2.01% | 3.2 | 10.4% | 22 | `/cazier-judiciar-online/targu-mures` |
| 40 | program cazier targoviste | program/IPJ local | 268 | 9 | 3.36% | 3.0 | 11.0% | 22 | `/cazier-judiciar-online/targoviste` |

Total top 40: **2,671 clicuri/lună** potențiale. Total pe toate interogările filtrate (253): 4,331.

**Pe clustere de intenție** (toate interogările neanonimizate, aceeași fereastră; deficitul doar din interogările cu ≥100 impresii și poziție ≤20):

| Cluster | Interogări | Impresii | Clicuri | CTR | Poziție medie | Clicuri/lună în plus |
|---|---:|---:|---:|---:|---:|---:|
| program/IPJ local | 923 | 36,601 | 831 | 2.27% | 5.4 | 1,112 |
| cazier generic | 378 | 35,687 | 246 | 0.69% | 7.3 | 1,058 |
| oras/judet | 493 | 27,686 | 1,448 | 5.23% | 4.3 | 680 |
| ghiseul (navigational) | 119 | 10,396 | 54 | 0.52% | 6.6 | 412 |
| fiscal | 120 | 8,614 | 71 | 0.82% | 10.6 | 148 |
| gratuit | 35 | 7,248 | 106 | 1.46% | 7.4 | 161 |
| integritate | 79 | 5,107 | 5 | 0.10% | 6.6 | 229 |
| auto/permis | 67 | 4,671 | 106 | 2.27% | 6.0 | 109 |
| acte necesare/cum | 109 | 3,750 | 44 | 1.17% | 5.6 | 100 |
| termen/valabilitate | 74 | 3,576 | 27 | 0.76% | 4.1 | 165 |
| pret/cost | 50 | 3,332 | 41 | 1.23% | 3.7 | 122 |
| model cerere/formular | 82 | 1,814 | 159 | 8.77% | 5.5 | 5 |
| altele | 343 | 1,352 | 13 | 0.96% | 7.7 | 3 |
| reabilitare | 30 | 1,203 | 32 | 2.66% | 5.7 | 23 |
| strainatate/apostila | 64 | 605 | 6 | 0.99% | 8.8 | 3 |
| stare civila | 2 | 40 | 1 | 2.50% | 4.1 | 0 |
| brand/concurent | 4 | 12 | 0 | 0.00% | 9.5 | 0 |

**Curba proprie a site-ului** (interogări cu ≥20 impresii, poziție rotunjită, 28 de zile) față de Sistrix:

| Poziție | Impresii | CTR propriu | Sistrix |
|---:|---:|---:|---:|
| 1 | 158 | 14.56% | 28.5% |
| 2 | 4,061 | 8.84% | 15.7% |
| 3 | 17,092 | 5.70% | 11.0% |
| 4 | 18,256 | 3.11% | 8.0% |
| 5 | 14,881 | 2.80% | 7.2% |
| 6 | 25,034 | 1.03% | 5.1% |
| 7 | 30,552 | 0.76% | 4.0% |
| 8 | 20,963 | 0.49% | 3.2% |
| 9 | 4,027 | 0.97% | 2.8% |
| 10 | 2,842 | 0.18% | 2.5% |
| 11 | 713 | 0.00% | 2.4% |
| 12 | 365 | 0.55% | 2.2% |
| 13 | 160 | 1.25% | 2.1% |
| 14 | 642 | 0.00% | 1.9% |
| 15+ | 1,174 | 0.43% | 1.8% |

### 2.2 eghiseul.ro — top 40
Proprietate `https://eghiseul.ro/ (URL-prefix)`, 2026-10-12 → 2026-11-08.

| # | Interogare | Cluster | Impresii 28z | Clicuri | CTR real | Poziție | CTR așteptat | Clicuri/lună în plus | URL principal |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | impozit dividende 2026 | calculator/tool | 2,621 | 215 | 8.20% | 1.4 | 22.8% | 409 | `/calculator/dividende/` |
| 2 | cat este tva in romania | calculator/tool | 915 | 10 | 1.09% | 2.5 | 13.2% | 119 | `/calculator/tva/` |
| 3 | impozit pe dividende 2026 | calculator/tool | 399 | 17 | 4.26% | 1.0 | 28.0% | 101 | `/calculator/dividende/` |
| 4 | pensie alimentara | calculator/tool | 724 | 73 | 10.08% | 1.5 | 22.5% | 96 | `/calculator/pensie-alimentara/` |
| 5 | cat este indemnizatia de crestere copil | calculator/tool | 606 | 65 | 10.73% | 1.2 | 25.3% | 95 | `/calculator/calculator-indemnizatie-crestere-copil/` |
| 6 | cass dividende 2026 | calculator/tool | 565 | 88 | 15.58% | 1.1 | 27.7% | 73 | `/calculator/dividende/` |
| 7 | cat e tva in romania | calculator/tool | 244 | 1 | 0.41% | 1.0 | 28.5% | 73 | `/calculator/tva/` |
| 8 | pensie de invaliditate gradul 2 suma forum | calculator/tool | 861 | 120 | 13.94% | 1.6 | 21.1% | 66 | `/calculator/pensie-invaliditate/` |
| 9 | pensie alimentara 2 copii | calculator/tool | 459 | 59 | 12.85% | 1.3 | 25.1% | 60 | `/calculator/pensie-alimentara/` |
| 10 | cat este impozitul pe dividende in 2026 | calculator/tool | 203 | 6 | 2.96% | 1.0 | 28.4% | 55 | `/calculator/dividende/` |
| 11 | cat e indemnizatia de crestere copil | calculator/tool | 265 | 17 | 6.42% | 1.3 | 24.7% | 52 | `/calculator/calculator-indemnizatie-crestere-copil/` |
| 12 | eghiseu | ghiseul (navigational) | 612 | 41 | 6.70% | 2.5 | 13.2% | 43 | `/` |
| 13 | cat este tva | calculator/tool | 307 | 5 | 1.63% | 2.4 | 13.9% | 40 | `/calculator/tva/` |
| 14 | cat e tva | calculator/tool | 118 | 0 | 0.00% | 1.0 | 28.0% | 35 | `/calculator/tva/` |
| 15 | cat e pensia alimentara pentru un copil | calculator/tool | 199 | 18 | 9.05% | 1.3 | 24.3% | 32 | `/calculator/pensie-alimentara/` |
| 16 | pensie alimentara 1 copil | calculator/tool | 543 | 87 | 16.02% | 1.5 | 21.5% | 32 | `/calculator/pensie-alimentara/` |
| 17 | cat este pensia alimentara pentru 1 copil | calculator/tool | 192 | 16 | 8.33% | 1.4 | 23.8% | 32 | `/calculator/pensie-alimentara/` |
| 18 | plafon cass dividende 2026 | calculator/tool | 139 | 10 | 7.19% | 1.0 | 28.1% | 31 | `/calculator/dividende/` |
| 19 | calculator concediu medical 2026 | calculator/tool | 264 | 46 | 17.42% | 1.1 | 27.2% | 28 | `/calculator/concediu-medical/` |
| 20 | pensia alimentara | calculator/tool | 192 | 20 | 10.42% | 1.4 | 23.7% | 27 | `/calculator/pensie-alimentara/` |
| 21 | anii lucrati in strainatate se pun la pensie in romania | calculator/tool | 245 | 30 | 12.24% | 1.5 | 22.4% | 27 | `/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/` |
| 22 | geoportal ancpi numar cadastral | carte funciara/ANCPI | 117 | 8 | 6.84% | 1.1 | 27.8% | 26 | `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` |
| 23 | pensie de invaliditate gradul 3 suma forum | calculator/tool | 104 | 4 | 3.85% | 1.3 | 24.3% | 23 | `/calculator/pensie-invaliditate/` |
| 24 | cat e pensia alimentara | calculator/tool | 154 | 6 | 3.90% | 1.9 | 17.4% | 22 | `/calculator/pensie-alimentara/` |
| 25 | cum se calculeaza indemnizatia de crestere copil | calculator/tool | 347 | 64 | 18.44% | 1.3 | 24.1% | 21 | `/calculator/calculator-indemnizatie-crestere-copil/` |
| 26 | cat este pensia alimentara | calculator/tool | 132 | 14 | 10.61% | 1.2 | 25.4% | 21 | `/calculator/pensie-alimentara/` |
| 27 | pensie anticipata femei 1969 | calculator/tool | 106 | 6 | 5.66% | 1.5 | 22.7% | 19 | `/tabel-varsta-pensionare-anticipata-femei/` |
| 28 | calcul pensie 2026 | calculator/tool | 199 | 33 | 16.58% | 1.2 | 25.6% | 19 | `/calculator/estimare-pensie/` |
| 29 | cum se calculeaza indemnizatia crestere copil | calculator/tool | 136 | 14 | 10.29% | 1.5 | 22.5% | 18 | `/calculator/calculator-indemnizatie-crestere-copil/` |
| 30 | cum se calculeaza pensia alimentara | calculator/tool | 156 | 24 | 15.38% | 1.2 | 26.0% | 18 | `/calculator/pensie-alimentara/` |
| 31 | calcul varsta pensionare legea noua | calculator/tool | 259 | 49 | 18.92% | 1.3 | 24.7% | 16 | `/calculator/varsta-pensionare` |
| 32 | valabilitate extras de carte funciara | termen/valabilitate | 140 | 6 | 4.29% | 2.1 | 15.0% | 16 | `/valabilitate-extras-de-carte-funciara/` |
| 33 | pensie alimentara 1 copil 2026 | calculator/tool | 211 | 36 | 17.06% | 1.4 | 24.0% | 16 | `/calculator/pensie-alimentara/` |
| 34 | cat e indemnizatie crestere copil | calculator/tool | 100 | 8 | 8.00% | 1.5 | 22.6% | 16 | `/calculator/calculator-indemnizatie-crestere-copil/` |
| 35 | pensie alimentara 3 copii | calculator/tool | 104 | 11 | 10.58% | 1.3 | 24.1% | 15 | `/calculator/pensie-alimentara/` |
| 36 | cat este pensia alimentara pentru 2 copii | calculator/tool | 102 | 10 | 9.80% | 1.5 | 22.7% | 14 | `/calculator/pensie-alimentara/` |
| 37 | indemnizatie minima crestere copil | calculator/tool | 105 | 2 | 1.90% | 2.8 | 12.1% | 11 | `/calculator/calculator-indemnizatie-crestere-copil/` |
| 38 | cât este tva ul | calculator/tool | 111 | 1 | 0.90% | 3.2 | 10.4% | 11 | `/calculator/tva/` |
| 39 | pensie de boala gradul 2 suma calculator | calculator/tool | 173 | 33 | 19.08% | 1.3 | 25.0% | 11 | `/calculator/pensie-invaliditate/` |
| 40 | pensia alimentara 2026 | calculator/tool | 110 | 20 | 18.18% | 1.2 | 25.9% | 9 | `/calculator/pensie-alimentara/` |

Total top 40: **1,851 clicuri/lună** potențiale. Total pe toate interogările filtrate (71): 1,868.

**Pe clustere de intenție** (toate interogările neanonimizate, aceeași fereastră; deficitul doar din interogările cu ≥100 impresii și poziție ≤20):

| Cluster | Interogări | Impresii | Clicuri | CTR | Poziție medie | Clicuri/lună în plus |
|---|---:|---:|---:|---:|---:|---:|
| calculator/tool | 1,535 | 41,310 | 7,504 | 18.17% | 4.9 | 1,778 |
| altele | 1,243 | 2,634 | 57 | 2.16% | 44.8 | 0 |
| stare civila | 57 | 901 | 162 | 17.98% | 3.8 | 5 |
| ghiseul (navigational) | 45 | 767 | 50 | 6.52% | 7.3 | 43 |
| carte funciara/ANCPI | 126 | 758 | 51 | 6.73% | 14.2 | 26 |
| pret/cost | 116 | 673 | 3 | 0.45% | 30.9 | 0 |
| termen/valabilitate | 63 | 620 | 20 | 3.23% | 11.4 | 16 |
| cazier generic | 64 | 576 | 3 | 0.52% | 28.2 | 0 |
| fiscal | 72 | 334 | 1 | 0.30% | 65.1 | 0 |
| auto/permis | 72 | 331 | 4 | 1.21% | 41.2 | 0 |
| integritate | 14 | 312 | 0 | 0.00% | 25.4 | 0 |
| brand/concurent | 3 | 296 | 126 | 42.57% | 1.3 | 0 |
| oras/judet | 170 | 287 | 0 | 0.00% | 59.8 | 0 |
| acte necesare/cum | 52 | 273 | 2 | 0.73% | 34.5 | 0 |
| program/IPJ local | 40 | 257 | 22 | 8.56% | 27.3 | 0 |
| model cerere/formular | 58 | 199 | 3 | 1.51% | 22.7 | 0 |
| gratuit | 21 | 149 | 24 | 16.11% | 21.3 | 0 |
| constatator/ONRC | 32 | 127 | 0 | 0.00% | 40.8 | 0 |
| strainatate/apostila | 41 | 93 | 2 | 2.15% | 43.8 | 0 |
| reabilitare | 9 | 68 | 0 | 0.00% | 58.3 | 0 |

**Curba proprie a site-ului** (interogări cu ≥20 impresii, poziție rotunjită, 28 de zile) față de Sistrix:

| Poziție | Impresii | CTR propriu | Sistrix |
|---:|---:|---:|---:|
| 1 | 16,266 | 15.70% | 28.5% |
| 2 | 14,780 | 23.85% | 15.7% |
| 3 | 6,097 | 15.63% | 11.0% |
| 4 | 615 | 5.37% | 8.0% |
| 5 | 170 | 8.24% | 7.2% |
| 6 | 93 | 3.23% | 5.1% |
| 7 | 32 | 0.00% | 4.0% |
| 8 | 254 | 1.57% | 3.2% |
| 9 | 30 | 0.00% | 2.8% |
| 11 | 48 | 0.00% | 2.4% |
| 12 | 25 | 0.00% | 2.2% |
| 13 | 83 | 44.58% | 2.1% |
| 14 | 663 | 49.32% | 1.9% |
| 15+ | 1,334 | 2.02% | 1.8% |

## 3. Înainte vs după căderi

**Metodă de atribuire.** Pentru fiecare pagină/interogare, diferența de clicuri e descompusă în trei efecte care se adună exact: (1) **impresii** = (I₁−I₀)×CTR₀ — mai puține afișări (cerere sau eligibilitate); (2) **poziție** = I₁×CTR₀×(E(p₁)/E(p₀)−1), unde E = curba Sistrix — cât din schimbarea de CTR e explicată de mutarea pe altă poziție; (3) **CTR la aceeași poziție** = restul — CTR mai mic decât explică poziția, adică ceva în SERP (Hub MAI, reclame, AI Overview, snippet) ia clicurile. Atenție: poziția medie a unei pagini/interogări scade și când apar afișări noi pe poziții slabe; de aceea efectul de poziție apare uneori împreună cu cel de impresii.

Ferestre: **pre-spam** 2026-07-23 → 2026-08-19 (28 z) vs **acum** 2026-10-12 → 2026-11-08 (28 z); **pre-octombrie** 2026-09-25 → 2026-10-15 (21 z) vs **post-octombrie** 2026-10-19 → 2026-11-08 (21 z). Zilele 16–18.10 sunt excluse din ambele ferestre de octombrie (tranziția).

| Site | Fereastră | Clicuri (pe page) | Impresii | CTR | Poziție medie |
|---|---|---:|---:|---:|---:|
| CJO | preoct21 | 8,632 | 294,266 | 2.93% | 5.9 |
| CJO | postoct21 | 3,066 | 187,452 | 1.64% | 7.0 |
| CJO | last28 | 5,522 | 284,850 | 1.94% | 6.6 |
| EGH | prespam28 | 81,474 | 2,932,674 | 2.78% | 6.2 |
| EGH | preoct21 | 12,534 | 99,508 | 12.60% | 5.7 |
| EGH | postoct21 | 7,369 | 57,626 | 12.79% | 6.1 |
| EGH | last28 | 11,282 | 91,869 | 12.28% | 6.6 |

### 3.1 CJO — căderea din octombrie (`sc-domain:cazierjudiciaronline.com`, 21 z vs 21 z)

**Unde stă pierderea:** cele 39 de pagini de oraș `/cazier-judiciar-online/*` au pierdut 4.517 din cele 5.566 clicuri pierdute (81%): 6.328 → 1.811 clicuri, 119.371 → 87.854 impresii (−26%), poziție medie 4,8 → 6,0, CTR 5,30% → 2,06%. Restul site-ului: 2.304 → 1.255 clicuri. Pe interogările de oraș (tabelul de interogări de mai jos) căderea e clar de **ranking**: pozițiile 1–2 au devenit 3–6 la impresii aproape neschimbate (ex. „cazier iasi” 1.427 → 1.435 impresii, poziție 2,1 → 4,7).


**Pagini cu cele mai mari pierderi**

| # | Pagină | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | `/cazier-judiciar-online/iasi` | 457 | 69 | -388 | 9,989 → 6,887 | 4.8 → 6.2 | 4.58% → 1.00% | -142 | -108 | -138 | impresii (afișări pierdute) |
| 2 | `/cazier-judiciar-online/craiova` | 409 | 88 | -321 | 4,953 → 3,303 | 3.7 → 4.8 | 8.26% → 2.66% | -136 | -50 | -135 | impresii (afișări pierdute) |
| 3 | `/cazier-judiciar-online/brasov` | 350 | 65 | -285 | 5,915 → 4,425 | 4.6 → 6.5 | 5.92% → 1.47% | -88 | -103 | -93 | poziție (ranking) |
| 4 | `/cazier-judiciar-online/ploiesti` | 359 | 80 | -279 | 4,890 → 3,795 | 3.5 → 5.2 | 7.34% → 2.11% | -80 | -76 | -122 | CTR la aceeași poziție (SERP/ads) |
| 5 | `/cazier-judiciar-online/timisoara` | 384 | 119 | -265 | 6,947 → 4,959 | 4.3 → 5.9 | 5.53% → 2.40% | -110 | -88 | -67 | impresii (afișări pierdute) |
| 6 | `/cazier-judiciar-online/buzau` | 240 | 24 | -216 | 1,975 → 1,413 | 3.0 → 4.7 | 12.15% → 1.70% | -68 | -54 | -93 | CTR la aceeași poziție (SERP/ads) |
| 7 | `/cazier-judiciar-online/constanta` | 344 | 130 | -214 | 7,577 → 4,938 | 5.0 → 5.3 | 4.54% → 2.63% | -120 | -21 | -74 | impresii (afișări pierdute) |
| 8 | `/cazier-judiciar-online/galati` | 312 | 113 | -199 | 3,981 → 2,846 | 3.7 → 4.6 | 7.84% → 3.97% | -89 | -32 | -78 | impresii (afișări pierdute) |
| 9 | `/cazier-judiciar-online/targu-mures` | 266 | 73 | -193 | 3,133 → 2,138 | 4.1 → 5.1 | 8.49% → 3.41% | -84 | -20 | -89 | CTR la aceeași poziție (SERP/ads) |
| 10 | `/` | 264 | 76 | -188 | 47,285 → 18,142 | 7.3 → 9.1 | 0.56% → 0.42% | -163 | -27 | +1 | impresii (afișări pierdute) |
| 11 | `/cazier-judiciar-online/cluj` | 255 | 83 | -172 | 8,926 → 6,571 | 5.6 → 7.2 | 2.86% → 1.26% | -67 | -66 | -39 | impresii (afișări pierdute) |
| 12 | `/cazier-judiciar-online/satu-mare` | 184 | 16 | -168 | 1,705 → 1,117 | 2.8 → 4.6 | 10.79% → 1.43% | -63 | -46 | -59 | impresii (afișări pierdute) |
| 13 | `/cazier-judiciar-online/piatra-neamt` | 196 | 31 | -165 | 2,117 → 1,178 | 4.1 → 4.9 | 9.26% → 2.63% | -87 | -9 | -69 | impresii (afișări pierdute) |
| 14 | `/cazier-judiciar-online/arad` | 213 | 57 | -156 | 3,378 → 2,088 | 5.1 → 5.4 | 6.31% → 2.73% | -81 | -12 | -62 | impresii (afișări pierdute) |
| 15 | `/cazier-judiciar-online/sibiu` | 211 | 60 | -151 | 4,473 → 3,858 | 3.7 → 5.6 | 4.72% → 1.56% | -29 | -58 | -64 | CTR la aceeași poziție (SERP/ads) |
| 16 | `/cazier-auto-online` | 250 | 108 | -142 | 8,435 → 6,114 | 6.2 → 9.0 | 2.96% → 1.77% | -69 | -78 | +5 | poziție (ranking) |
| 17 | `/cazier-judiciar-online/baia-mare` | 164 | 37 | -127 | 2,642 → 1,780 | 3.6 → 5.0 | 6.21% → 2.08% | -54 | -24 | -49 | impresii (afișări pierdute) |
| 18 | `/cazier-judiciar-online/focsani` | 213 | 90 | -123 | 1,429 → 1,345 | 2.9 → 3.6 | 14.91% → 6.69% | -13 | -42 | -68 | CTR la aceeași poziție (SERP/ads) |
| 19 | `/cazier-judiciar-online/suceava` | 160 | 41 | -119 | 3,466 → 1,770 | 4.9 → 5.0 | 4.62% → 2.32% | -78 | -1 | -40 | impresii (afișări pierdute) |
| 20 | `/cerere-cazier-judiciar-model` | 410 | 297 | -113 | 4,584 → 2,813 | 5.9 → 5.7 | 8.94% → 10.56% | -158 | +28 | +17 | impresii (afișări pierdute) |
| 21 | `/ghid-reabilitare-cazier` | 247 | 136 | -111 | 7,667 → 5,043 | 3.7 → 4.9 | 3.22% → 2.70% | -85 | -28 | +2 | impresii (afișări pierdute) |
| 22 | `/cazier-judiciar-online/vaslui` | 138 | 46 | -92 | 2,275 → 1,995 | 4.2 → 5.5 | 6.07% → 2.31% | -17 | -25 | -50 | CTR la aceeași poziție (SERP/ads) |
| 23 | `/cazier-judiciar-online/oradea` | 198 | 107 | -91 | 2,759 → 1,958 | 3.9 → 4.2 | 7.18% → 5.46% | -57 | -10 | -24 | impresii (afișări pierdute) |
| 24 | `/cazier-judiciar-online/sfantu-gheorghe` | 109 | 18 | -91 | 768 → 912 | 3.2 → 5.2 | 14.19% → 1.97% | +20 | -44 | -67 | CTR la aceeași poziție (SERP/ads) |
| 25 | `/cazier-judiciar-online/bucuresti` | 137 | 63 | -74 | 16,089 → 12,056 | 7.8 → 9.3 | 0.85% → 0.52% | -34 | -20 | -20 | impresii (afișări pierdute) |

**Interogări cu cele mai mari pierderi**

| # | Interogare | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | cazier iasi | 165 | 20 | -145 | 1,427 → 1,435 | 2.1 → 4.7 | 11.56% → 1.39% | +1 | -86 | -60 | poziție (ranking) |
| 2 | cazier timisoara | 110 | 26 | -84 | 1,021 → 879 | 2.6 → 5.6 | 10.77% → 2.96% | -15 | -51 | -18 | poziție (ranking) |
| 3 | cazier judiciar online | 115 | 33 | -82 | 19,291 → 8,664 | 6.3 → 7.8 | 0.60% → 0.38% | -63 | -15 | -4 | impresii (afișări pierdute) |
| 4 | cazier brasov | 103 | 22 | -81 | 553 → 532 | 3.2 → 5.0 | 18.63% → 4.14% | -4 | -31 | -46 | CTR la aceeași poziție (SERP/ads) |
| 5 | cazier arad | 97 | 28 | -69 | 331 → 279 | 2.0 → 3.3 | 29.31% → 10.04% | -15 | -28 | -25 | poziție (ranking) |
| 6 | program cazier galati | 83 | 17 | -66 | 510 → 411 | 1.6 → 2.9 | 16.27% → 4.14% | -16 | -31 | -19 | poziție (ranking) |
| 7 | cazier constanta | 97 | 35 | -62 | 895 → 981 | 2.0 → 4.3 | 10.84% → 3.57% | +9 | -54 | -17 | poziție (ranking) |
| 8 | cazier ploiesti | 70 | 13 | -57 | 413 → 300 | 1.9 → 4.3 | 16.95% → 4.33% | -19 | -27 | -11 | poziție (ranking) |
| 9 | program cazier brasov | 59 | 4 | -55 | 669 → 705 | 2.2 → 6.0 | 8.82% → 0.57% | +3 | -41 | -17 | poziție (ranking) |
| 10 | cazier piatra neamt | 57 | 4 | -53 | 182 → 122 | 1.7 → 3.4 | 31.32% → 3.28% | -19 | -18 | -16 | impresii (afișări pierdute) |
| 11 | cazier satu mare | 61 | 8 | -53 | 239 → 225 | 1.1 → 3.3 | 25.52% → 3.56% | -4 | -36 | -14 | poziție (ranking) |
| 12 | cazier judiciar baia mare | 60 | 18 | -42 | 547 → 471 | 2.2 → 3.6 | 10.97% → 3.82% | -8 | -19 | -15 | poziție (ranking) |
| 13 | cazier sibiu | 76 | 34 | -42 | 842 → 904 | 2.3 → 4.4 | 9.03% → 3.76% | +6 | -38 | -10 | poziție (ranking) |
| 14 | program cazier ploiesti | 57 | 15 | -42 | 553 → 483 | 2.1 → 4.0 | 10.31% → 3.11% | -7 | -24 | -11 | poziție (ranking) |
| 15 | cazier cluj | 61 | 20 | -41 | 1,002 → 848 | 3.4 → 6.5 | 6.09% → 2.36% | -9 | -28 | -4 | poziție (ranking) |
| 16 | cazier judiciar craiova | 72 | 32 | -40 | 529 → 449 | 2.4 → 3.6 | 13.61% → 7.13% | -11 | -21 | -8 | poziție (ranking) |
| 17 | cazier | 52 | 13 | -39 | 2,082 → 1,443 | 5.1 → 7.0 | 2.50% → 0.90% | -16 | -15 | -8 | impresii (afișări pierdute) |
| 18 | cazier auto online | 75 | 37 | -38 | 1,034 → 1,182 | 3.0 → 5.7 | 7.25% → 3.13% | +11 | -42 | -7 | poziție (ranking) |
| 19 | program cazier buzau | 36 | 1 | -35 | 166 → 164 | 1.4 → 4.1 | 21.69% → 0.61% | -0 | -23 | -11 | poziție (ranking) |
| 20 | cazier online | 45 | 11 | -34 | 6,919 → 2,582 | 6.6 → 8.8 | 0.65% → 0.43% | -28 | -6 | +0 | impresii (afișări pierdute) |
| 21 | cazier judiciar iasi | 35 | 5 | -30 | 402 → 348 | 2.2 → 5.5 | 8.71% → 1.44% | -5 | -17 | -8 | poziție (ranking) |
| 22 | cazier vaslui | 44 | 16 | -28 | 199 → 164 | 2.0 → 2.4 | 22.11% → 9.76% | -8 | -5 | -16 | CTR la aceeași poziție (SERP/ads) |
| 23 | ghiseul.ro cazier | 37 | 9 | -28 | 7,951 → 3,002 | 4.7 → 6.9 | 0.47% → 0.30% | -23 | -6 | +1 | impresii (afișări pierdute) |
| 24 | program cazier mures | 29 | 2 | -27 | 211 → 156 | 2.4 → 3.2 | 13.74% → 1.28% | -8 | -5 | -14 | CTR la aceeași poziție (SERP/ads) |
| 25 | cazier botosani | 32 | 6 | -26 | 86 → 91 | 1.8 → 3.1 | 37.21% → 6.59% | +2 | -15 | -13 | poziție (ranking) |
| 26 | cazier craiova | 28 | 2 | -26 | 135 → 76 | 2.0 → 2.5 | 20.74% → 2.63% | -12 | -2 | -11 | impresii (afișări pierdute) |
| 27 | cazier sfantu gheorghe | 31 | 5 | -26 | 88 → 123 | 1.0 → 4.3 | 35.23% → 4.07% | +12 | -31 | -7 | poziție (ranking) |
| 28 | caziere iasi | 31 | 5 | -26 | 343 → 263 | 2.3 → 4.9 | 9.04% → 1.90% | -7 | -12 | -7 | poziție (ranking) |
| 29 | program cazier craiova | 29 | 3 | -26 | 257 → 45 | 1.7 → 3.3 | 11.28% → 6.67% | -24 | -2 | +0 | impresii (afișări pierdute) |
| 30 | program cazier iasi | 29 | 3 | -26 | 533 → 581 | 2.8 → 6.8 | 5.44% → 0.52% | +3 | -20 | -8 | poziție (ranking) |

**Pagini care au crescut**

| # | Pagină | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | `/cazier-judiciar-online/tulcea` | 15 | 25 | +10 | 808 → 830 | 4.3 → 4.6 | 1.86% → 3.01% | +0 | -1 | +10 | CTR la aceeași poziție (SERP/ads) |
| 2 | `/corectarea-informatiilor-din-cazierul-judiciar` | 12 | 15 | +3 | 884 → 324 | 5.9 → 5.9 | 1.36% → 4.63% | -8 | -0 | +11 | CTR la aceeași poziție (SERP/ads) |
| 3 | `/politica-de-anulare` | 0 | 2 | +2 | 27 → 11 | 11.7 → 4.5 | 0.00% → 18.18% | -0 | +0 | +2 | CTR la aceeași poziție (SERP/ads) |
| 4 | `/acte-necesare-cazier-judiciar` | 8 | 10 | +2 | 3,177 → 2,385 | 8.3 → 9.3 | 0.25% → 0.42% | -2 | -1 | +5 | CTR la aceeași poziție (SERP/ads) |
| 5 | `/comparatie-servicii` | 0 | 1 | +1 | 185 → 440 | 5.6 → 8.7 | 0.00% → 0.23% | +0 | -0 | +1 | CTR la aceeași poziție (SERP/ads) |
| 6 | `/cazier-fiscal-pentru-credit-bancar` | 0 | 1 | +1 | 433 → 62 | 21.1 → 9.4 | 0.00% → 1.61% | -0 | +0 | +1 | CTR la aceeași poziție (SERP/ads) |

**Interogări care au crescut**

| # | Interogare | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | cerere cazier judiciar persoana juridica | 5 | 18 | +13 | 78 → 82 | 2.9 → 2.6 | 6.41% → 21.95% | +0 | +1 | +12 | CTR la aceeași poziție (SERP/ads) |
| 2 | cerere cazier judiciar persoana juridica pdf | 2 | 9 | +7 | 16 → 22 | 2.2 → 2.1 | 12.50% → 40.91% | +1 | +0 | +6 | CTR la aceeași poziție (SERP/ads) |
| 3 | program caziere constanța | 1 | 7 | +6 | 12 → 64 | 2.8 → 3.4 | 8.33% → 10.94% | +4 | -1 | +3 | impresii (afișări pierdute) |
| 4 | cerere reabilitare cazier | 0 | 6 | +6 | 28 → 38 | 3.9 → 4.3 | 0.00% → 15.79% | +0 | -0 | +6 | CTR la aceeași poziție (SERP/ads) |
| 5 | serviciul relații publice şi cazier judiciar constanța | 0 | 5 | +5 | 89 → 77 | 2.0 → 2.5 | 0.00% → 6.49% | -0 | -0 | +5 | CTR la aceeași poziție (SERP/ads) |
| 6 | cazier online cluj | 0 | 5 | +5 | 105 → 80 | 5.5 → 4.5 | 0.00% → 6.25% | -0 | +0 | +5 | CTR la aceeași poziție (SERP/ads) |
| 7 | pret cazier judiciar | 0 | 4 | +4 | 104 → 112 | 2.3 → 3.6 | 0.00% → 3.57% | +0 | -0 | +4 | CTR la aceeași poziție (SERP/ads) |
| 8 | cazier tulcea | 2 | 6 | +4 | 83 → 112 | 3.9 → 4.5 | 2.41% → 5.36% | +1 | -0 | +4 | CTR la aceeași poziție (SERP/ads) |
| 9 | reabilitare cazier | 1 | 4 | +3 | 24 → 39 | 1.1 → 3.5 | 4.17% → 10.26% | +1 | -1 | +3 | CTR la aceeași poziție (SERP/ads) |
| 10 | program cazier tecuci | 0 | 3 | +3 | 95 → 78 | 5.8 → 5.4 | 0.00% → 3.85% | -0 | +0 | +3 | CTR la aceeași poziție (SERP/ads) |
| 11 | dupa cat timp se sterge cazierul judiciar | 0 | 3 | +3 | — → 13 | — → 1.3 | — → 23.08% | +3 | +0 | +0 | nouă |
| 12 | de unde se scoate cazierul judiciar | 0 | 3 | +3 | 130 → 123 | 5.3 → 4.8 | 0.00% → 2.44% | -0 | +0 | +3 | CTR la aceeași poziție (SERP/ads) |
| 13 | de unde se scoate cazierul | 0 | 3 | +3 | 51 → 78 | 5.1 → 3.8 | 0.00% → 3.85% | +0 | +0 | +3 | CTR la aceeași poziție (SERP/ads) |
| 14 | certificat de integritate comportamentala | 1 | 4 | +3 | 2,923 → 2,431 | 5.3 → 5.3 | 0.03% → 0.16% | -0 | +0 | +3 | CTR la aceeași poziție (SERP/ads) |
| 15 | cerere cazier judiciar persoane juridice | 1 | 4 | +3 | 106 → 83 | 6.2 → 6.7 | 0.94% → 4.82% | -0 | -0 | +3 | CTR la aceeași poziție (SERP/ads) |

### 3.2 eghiseul — spam update (`https://eghiseul.ro/`, 28 z pre-spam vs ultimele 28 z)
ANCPI e separat: memoria proiectului spune că acolo a dispărut cererea (avaria s-a încheiat), nu poziția. Totalul fără `/ancpi-nu-functioneaza/`:
pre-spam 62,605 clicuri fără ANCPI (ANCPI 18,869), acum 11,274 (ANCPI 8).

79 pagini cu impresii pre-spam nu mai au impresii deloc acum (majoritatea redirecționate 301 la 09.09); împreună aveau 256 clicuri pre-spam.


**Pagini cu cele mai mari pierderi**

| # | Pagină | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | `/ancpi-nu-functioneaza/` | 18,869 | 8 | -18,861 | 727,186 → 200 | 6.2 → 10.5 | 2.59% → 4.00% | -18,864 | -3 | +5 | impresii (afișări pierdute) |
| 2 | `/calculator/varsta-pensionare/` | 11,793 | 597 | -11,196 | 181,345 → 4,797 | 5.7 → 3.3 | 6.50% → 12.45% | -11,481 | +235 | +50 | impresii (afișări pierdute) |
| 3 | `/tools/verificare-rovinieta-online/` | 9,498 | 593 | -8,905 | 266,372 → 1,233 | 5.8 → 13.2 | 3.57% → 48.09% | -9,454 | -28 | +577 | impresii (afișări pierdute) |
| 4 | `/calculator/calculator-impozit-auto/` | 6,691 | 2,582 | -4,109 | 107,420 → 12,004 | 3.8 → 3.4 | 6.23% → 21.51% | -5,943 | +103 | +1,731 | impresii (afișări pierdute) |
| 5 | `/calculator/salariu/` | 2,995 | 53 | -2,942 | 364,867 → 929 | 6.5 → 16.4 | 0.82% → 5.71% | -2,987 | -5 | +50 | impresii (afișări pierdute) |
| 6 | `/verificare-proprietar-imobil/` | 2,310 | 156 | -2,154 | 51,646 → 912 | 5.9 → 3.2 | 4.47% → 17.11% | -2,269 | +40 | +75 | impresii (afișări pierdute) |
| 7 | `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` | 2,168 | 344 | -1,824 | 35,230 → 3,615 | 5.6 → 3.2 | 6.15% → 9.52% | -1,946 | +165 | -43 | impresii (afișări pierdute) |
| 8 | `/tabel-varsta-pensionare-anticipata-femei/` | 1,754 | 169 | -1,585 | 49,938 → 2,431 | 6.0 → 4.0 | 3.51% → 6.95% | -1,669 | +49 | +35 | impresii (afișări pierdute) |
| 9 | `/calculator/pensie-invaliditate/` | 2,478 | 943 | -1,535 | 47,860 → 4,909 | 5.5 → 1.8 | 5.18% → 19.21% | -2,224 | +509 | +180 | impresii (afișări pierdute) |
| 10 | `/calculator/concediu-medical/` | 1,813 | 284 | -1,529 | 21,077 → 1,308 | 4.6 → 5.3 | 8.60% → 21.71% | -1,700 | -14 | +185 | impresii (afișări pierdute) |
| 11 | `/servicii/extras-de-carte-funciara/` | 1,191 | 5 | -1,186 | 48,086 → 140 | 7.8 → 31.0 | 2.48% → 3.57% | -1,188 | -3 | +4 | impresii (afișări pierdute) |
| 12 | `/calculator/estimare-pensie/` | 1,213 | 80 | -1,133 | 37,212 → 685 | 3.8 → 5.2 | 3.26% → 11.68% | -1,191 | -5 | +62 | impresii (afișări pierdute) |
| 13 | `/calculator/calculator-indemnizatie-crestere-copil/` | 3,108 | 2,066 | -1,042 | 50,796 → 14,178 | 5.0 → 3.6 | 6.12% → 14.57% | -2,241 | +250 | +948 | impresii (afișări pierdute) |
| 14 | `/calculator/termene-judiciare/` | 862 | 7 | -855 | 18,521 → 121 | 3.7 → 16.2 | 4.65% → 5.79% | -856 | -5 | +6 | impresii (afișări pierdute) |
| 15 | `/` | 929 | 189 | -740 | 48,078 → 3,556 | 9.2 → 24.5 | 1.93% → 5.31% | -860 | -56 | +177 | impresii (afișări pierdute) |
| 16 | `/calculator/tva/` | 770 | 89 | -681 | 61,986 → 5,467 | 5.0 → 3.8 | 1.24% → 1.63% | -702 | +13 | +8 | impresii (afișări pierdute) |
| 17 | `/amenda-rovinieta-2025-tarife-plata-online-ghid-complet/` | 673 | 7 | -666 | 36,936 → 116 | 5.9 → 9.1 | 1.82% → 6.03% | -671 | -1 | +6 | impresii (afișări pierdute) |
| 18 | `/calculator/vechime-in-munca/` | 603 | 6 | -597 | 3,860 → 73 | 4.8 → 65.2 | 15.62% → 8.22% | -592 | -11 | +5 | impresii (afișări pierdute) |
| 19 | `/extras-carte-funciara-gratuit/` | 585 | 9 | -576 | 15,353 → 68 | 7.7 → 7.0 | 3.81% → 13.24% | -582 | +0 | +6 | impresii (afișări pierdute) |
| 20 | `/calculator/dobanda-legala/` | 571 | 73 | -498 | 6,232 → 890 | 3.2 → 23.1 | 9.16% → 8.20% | -489 | -78 | +69 | impresii (afișări pierdute) |
| 21 | `/servicii/cazier-auto-online/` | 454 | 25 | -429 | 9,437 → 193 | 5.8 → 5.9 | 4.81% → 12.95% | -445 | -1 | +16 | impresii (afișări pierdute) |
| 22 | `/calculator/impozit-chirie/` | 401 | 8 | -393 | 13,949 → 163 | 5.2 → 50.2 | 2.87% → 4.91% | -396 | -4 | +8 | impresii (afișări pierdute) |
| 23 | `/calculator/calculator-procente/` | 414 | 26 | -388 | 92,367 → 1,870 | 5.7 → 3.7 | 0.45% → 1.39% | -406 | +5 | +13 | impresii (afișări pierdute) |
| 24 | `/calculator/indemnizatie-somaj/` | 383 | 0 | -383 | 13,135 → 88 | 5.8 → 13.7 | 2.92% → 0.00% | -380 | -2 | -1 | impresii (afișări pierdute) |
| 25 | `/calculator/contributii-pfa/` | 366 | 1 | -365 | 26,745 → 1,301 | 5.8 → 67.3 | 1.37% → 0.08% | -348 | -16 | -1 | impresii (afișări pierdute) |
| 26 | `/informatii-cazier-auto-online/` | 348 | 15 | -333 | 15,268 → 258 | 5.6 → 4.8 | 2.28% → 5.81% | -342 | +1 | +8 | impresii (afișări pierdute) |
| 27 | `/curs-valutar/` | 317 | 4 | -313 | 174,806 → 53 | 8.1 → 14.0 | 0.18% → 7.55% | -317 | -0 | +4 | impresii (afișări pierdute) |
| 28 | `/tva-9-locuinte-31-iulie-2026/` | 307 | 0 | -307 | 17,445 → 52 | 6.1 → 73.0 | 1.76% → 0.00% | -306 | -1 | -0 | impresii (afișări pierdute) |
| 29 | `/ghid-complet-certificat-de-integritate-comportamentala/` | 276 | 0 | -276 | 11,147 → 29 | 3.6 → 21.3 | 2.48% → 0.00% | -275 | -1 | -0 | impresii (afișări pierdute) |
| 30 | `/taxa-cazier-judiciar/` | 253 | 4 | -249 | 27,349 → 264 | 7.3 → 5.3 | 0.93% → 1.52% | -251 | +2 | -0 | impresii (afișări pierdute) |

**Interogări cu cele mai mari pierderi**

| # | Interogare | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | ancpi | 4,172 | 0 | -4,172 | 200,310 → — | 6.8 → — | 2.08% → — | -4,172 | +0 | +0 | dispărută din rezultate |
| 2 | verificare rovinieta | 3,525 | 213 | -3,312 | 118,794 → 409 | 5.8 → 14.2 | 2.97% → 52.08% | -3,513 | -8 | +209 | impresii (afișări pierdute) |
| 3 | ancpi functioneaza | 2,194 | 0 | -2,194 | 32,644 → 3 | 4.5 → 6.7 | 6.72% → 0.00% | -2,194 | -0 | -0 | impresii (afișări pierdute) |
| 4 | verificare rovinieta fara serie sasiu | 960 | 13 | -947 | 8,127 → 27 | 4.4 → 13.4 | 11.81% → 48.15% | -957 | -2 | +12 | impresii (afișări pierdute) |
| 5 | calcul varsta pensionare legea noua | 898 | 49 | -849 | 6,237 → 259 | 2.3 → 1.3 | 14.40% → 18.92% | -861 | +28 | -16 | impresii (afișări pierdute) |
| 6 | geoportal ancpi | 840 | 0 | -840 | 20,503 → 5 | 5.8 → 26.6 | 4.10% → 0.00% | -840 | -0 | -0 | impresii (afișări pierdute) |
| 7 | eterra | 686 | 0 | -686 | 38,444 → — | 7.6 → — | 1.78% → — | -686 | +0 | +0 | dispărută din rezultate |
| 8 | calculator varsta pensionare anticipata | 650 | 2 | -648 | 8,491 → 15 | 3.3 → 7.7 | 7.66% → 13.33% | -649 | -1 | +2 | impresii (afișări pierdute) |
| 9 | verificare rovinieta online | 654 | 61 | -593 | 17,967 → 121 | 5.4 → 14.5 | 3.64% → 50.41% | -650 | -3 | +60 | impresii (afișări pierdute) |
| 10 | calculator varsta pensionare | 552 | 0 | -552 | 1,756 → — | 2.2 → — | 31.44% → — | -552 | +0 | +0 | dispărută din rezultate |
| 11 | impozit auto 2026 | 1,916 | 1,482 | -434 | 6,613 → 5,658 | 2.0 → 2.1 | 28.97% → 26.19% | -277 | -23 | -134 | impresii (afișări pierdute) |
| 12 | calculator pensie online | 422 | 1 | -421 | 3,538 → 1 | 5.0 → 12.0 | 11.93% → 100.00% | -422 | -0 | +1 | impresii (afișări pierdute) |
| 13 | impozit auto | 393 | 0 | -393 | 2,438 → 2 | 2.5 → 1.5 | 16.12% → 0.00% | -393 | +0 | -1 | impresii (afișări pierdute) |
| 14 | verificare rovinieta dupa numar | 412 | 41 | -371 | 7,841 → 67 | 5.8 → 13.9 | 5.25% → 61.19% | -408 | -2 | +40 | impresii (afișări pierdute) |
| 15 | ancpi online | 364 | 0 | -364 | 13,404 → 2 | 6.1 → 36.5 | 2.72% → 0.00% | -364 | -0 | -0 | impresii (afișări pierdute) |
| 16 | ancpi geoportal | 351 | 0 | -351 | 9,528 → 3 | 6.3 → 30.7 | 3.68% → 0.00% | -351 | -0 | -0 | impresii (afișări pierdute) |
| 17 | calculator salariu net | 323 | 3 | -320 | 60,654 → 12 | 5.7 → 22.2 | 0.53% → 25.00% | -323 | -0 | +3 | impresii (afișări pierdute) |
| 18 | eterra ancpi | 320 | 0 | -320 | 15,561 → — | 7.4 → — | 2.06% → — | -320 | +0 | +0 | dispărută din rezultate |
| 19 | e-terra | 319 | 0 | -319 | 7,913 → — | 8.1 → — | 4.03% → — | -319 | +0 | +0 | dispărută din rezultate |
| 20 | calcul varsta pensionare | 317 | 1 | -316 | 1,303 → 1 | 2.2 → 11.0 | 24.33% → 100.00% | -317 | -0 | +1 | impresii (afișări pierdute) |
| 21 | calculator pensie | 309 | 0 | -309 | 5,223 → — | 6.9 → — | 5.92% → — | -309 | +0 | +0 | dispărută din rezultate |
| 22 | rovinieta verificare | 317 | 20 | -297 | 12,519 → 40 | 6.1 → 14.8 | 2.53% → 50.00% | -316 | -1 | +20 | impresii (afișări pierdute) |
| 23 | e terra | 282 | 0 | -282 | 9,859 → — | 8.0 → — | 2.86% → — | -282 | +0 | +0 | dispărută din rezultate |
| 24 | calculator impozit auto | 277 | 0 | -277 | 2,645 → 2 | 3.0 → 7.0 | 10.47% → 0.00% | -277 | -0 | -0 | impresii (afișări pierdute) |
| 25 | calculator pensie 2026 | 266 | 2 | -264 | 982 → 99 | 2.5 → 2.9 | 27.09% → 2.02% | -239 | -4 | -21 | impresii (afișări pierdute) |
| 26 | calculator salariu brut net | 250 | 0 | -250 | 7,225 → — | 4.0 → — | 3.46% → — | -250 | +0 | +0 | dispărută din rezultate |
| 27 | cand ies la pensie | 318 | 79 | -239 | 1,044 → 329 | 2.1 → 2.2 | 30.46% → 24.01% | -218 | -4 | -18 | impresii (afișări pierdute) |
| 28 | tabel varsta pensionare anticipata femei | 238 | 0 | -238 | 4,201 → — | 3.6 → — | 5.67% → — | -238 | +0 | +0 | dispărută din rezultate |
| 29 | geoportal ancpi harta | 233 | 0 | -233 | 5,834 → 3 | 6.6 → 2.7 | 3.99% → 0.00% | -233 | +0 | -0 | impresii (afișări pierdute) |
| 30 | calculator varsta pensionare anticipata 2026 | 227 | 3 | -224 | 1,445 → 5 | 2.6 → 4.2 | 15.71% → 60.00% | -226 | -0 | +3 | impresii (afișări pierdute) |

**Pagini care au crescut**

| # | Pagină | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | `/calculator/varsta-pensionare` | 1 | 33 | +32 | 18 → 189 | 1.4 → 1.0 | 5.56% → 17.46% | +10 | +2 | +20 | CTR la aceeași poziție (SERP/ads) |
| 2 | `/calculator/impozit-pensie/` | 23 | 34 | +11 | 707 → 1,325 | 4.8 → 2.5 | 3.25% → 2.57% | +20 | +34 | -43 | poziție (ranking) |
| 3 | `/plan-de-amplasament-si-delimitare-copie-sau-intocmire/` | 0 | 2 | +2 | — → 34 | — → 2.5 | — → 5.88% | +2 | +0 | +0 | nouă |

### 3.3 eghiseul — căderea din octombrie (21 z vs 21 z)

**Pagini cu cele mai mari pierderi**

| # | Pagină | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | `/calculator/calculator-impozit-auto/` | 2,904 | 1,734 | -1,170 | 10,673 → 8,546 | 3.3 → 3.0 | 27.21% → 20.29% | -579 | +171 | -762 | CTR la aceeași poziție (SERP/ads) |
| 2 | `/calculator/calculator-indemnizatie-crestere-copil/` | 2,208 | 1,379 | -829 | 13,580 → 9,880 | 2.6 → 3.7 | 16.26% → 13.96% | -602 | -499 | +272 | impresii (afișări pierdute) |
| 3 | `/calculator/varsta-pensionare/` | 1,122 | 327 | -795 | 7,910 → 2,608 | 3.0 → 3.4 | 14.18% → 12.54% | -752 | -37 | -6 | impresii (afișări pierdute) |
| 4 | `/calculator/pensie-alimentara/` | 1,644 | 1,227 | -417 | 11,945 → 8,754 | 2.2 → 1.5 | 13.76% → 14.02% | -439 | +553 | -531 | CTR la aceeași poziție (SERP/ads) |
| 5 | `/tabel-varsta-pensionare-anticipata-femei/` | 345 | 79 | -266 | 4,380 → 1,266 | 3.2 → 3.8 | 7.88% → 6.24% | -245 | -17 | -4 | impresii (afișări pierdute) |
| 6 | `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` | 477 | 216 | -261 | 4,222 → 2,169 | 2.9 → 3.3 | 11.30% → 9.96% | -232 | -36 | +6 | impresii (afișări pierdute) |
| 7 | `/calculator/dividende/` | 570 | 327 | -243 | 7,354 → 4,661 | 2.3 → 1.7 | 7.75% → 7.02% | -209 | +128 | -162 | impresii (afișări pierdute) |
| 8 | `/calculator/concediu-medical/` | 401 | 209 | -192 | 1,490 → 885 | 2.1 → 5.6 | 26.91% → 23.62% | -163 | -143 | +114 | impresii (afișări pierdute) |
| 9 | `/calculator/estimare-pensie/` | 194 | 15 | -179 | 1,630 → 139 | 3.3 → 5.9 | 11.90% → 10.79% | -177 | -8 | +6 | impresii (afișări pierdute) |
| 10 | `/calculator/pensie-invaliditate/` | 827 | 661 | -166 | 4,710 → 3,042 | 1.7 → 1.8 | 17.56% → 21.73% | -293 | -44 | +171 | impresii (afișări pierdute) |
| 11 | `/` | 251 | 116 | -135 | 2,972 → 2,558 | 17.0 → 27.1 | 8.45% → 4.53% | -35 | -142 | +42 | poziție (ranking) |
| 12 | `/tools/verificare-rovinieta-online/` | 445 | 368 | -77 | 1,013 → 788 | 12.0 → 13.7 | 43.93% → 46.70% | -99 | -38 | +60 | impresii (afișări pierdute) |
| 13 | `/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/` | 148 | 79 | -69 | 1,428 → 720 | 7.3 → 3.4 | 10.36% → 10.97% | -73 | +118 | -114 | CTR la aceeași poziție (SERP/ads) |
| 14 | `/calculator/tva/` | 110 | 55 | -55 | 5,042 → 3,133 | 2.8 → 3.6 | 2.18% → 1.76% | -42 | -16 | +2 | impresii (afișări pierdute) |
| 15 | `/calculator/dobanda-legala/` | 95 | 42 | -53 | 1,079 → 463 | 18.6 → 23.1 | 8.80% → 9.07% | -54 | -24 | +25 | impresii (afișări pierdute) |
| 16 | `/calculator/salariu/` | 58 | 27 | -31 | 1,583 → 401 | 9.5 → 20.9 | 3.66% → 6.73% | -43 | -12 | +24 | impresii (afișări pierdute) |
| 17 | `/valabilitate-extras-de-carte-funciara/` | 44 | 15 | -29 | 1,152 → 637 | 10.6 → 2.8 | 3.82% → 2.35% | -20 | +96 | -105 | CTR la aceeași poziție (SERP/ads) |
| 18 | `/verificare-proprietar-imobil/` | 136 | 107 | -29 | 1,205 → 537 | 4.2 → 2.8 | 11.29% → 19.93% | -75 | +30 | +16 | impresii (afișări pierdute) |
| 19 | `/schimbare-certificat-de-nastere-vechi/` | 89 | 61 | -28 | 782 → 343 | 23.9 → 2.9 | 11.38% → 17.78% | -50 | +845 | -823 | CTR la aceeași poziție (SERP/ads) |
| 20 | `/calculator/calculator-procente/` | 35 | 10 | -25 | 3,272 → 701 | 3.3 → 4.4 | 1.07% → 1.43% | -28 | -2 | +4 | impresii (afișări pierdute) |

**Interogări cu cele mai mari pierderi**

| # | Interogare | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | calculator impozit auto 2026 | 833 | 415 | -418 | 1,622 → 1,671 | 1.9 → 2.6 | 51.36% → 24.84% | +25 | -183 | -260 | CTR la aceeași poziție (SERP/ads) |
| 2 | impozit auto 2026 | 1,422 | 1,024 | -398 | 4,661 → 4,098 | 1.9 → 2.1 | 30.51% → 24.99% | -172 | -90 | -136 | impresii (afișări pierdute) |
| 3 | cand ies la pensie | 210 | 16 | -194 | 717 → 77 | 1.9 → 2.6 | 29.29% → 20.78% | -187 | -5 | -1 | impresii (afișări pierdute) |
| 4 | calcul varsta pensionare legea noua | 233 | 46 | -187 | 1,235 → 239 | 1.9 → 1.2 | 18.87% → 19.25% | -188 | +27 | -26 | impresii (afișări pierdute) |
| 5 | calcul indemnizatie crestere copil | 324 | 151 | -173 | 636 → 734 | 1.3 → 2.0 | 50.94% → 20.57% | +50 | -139 | -84 | poziție (ranking) |
| 6 | calcul impozit auto 2026 | 222 | 53 | -169 | 592 → 445 | 2.3 → 2.7 | 37.50% → 11.91% | -55 | -23 | -90 | CTR la aceeași poziție (SERP/ads) |
| 7 | calculator indemnizatie crestere copil 2026 | 220 | 91 | -129 | 349 → 248 | 1.2 → 2.1 | 63.04% → 36.69% | -64 | -67 | +1 | poziție (ranking) |
| 8 | eghiseul.ro | 191 | 68 | -123 | 360 → 133 | 1.0 → 1.0 | 53.06% → 51.13% | -120 | +1 | -4 | impresii (afișări pierdute) |
| 9 | calculator concediu medical 2026 | 159 | 40 | -119 | 435 → 183 | 1.1 → 1.1 | 36.55% → 21.86% | -92 | -2 | -25 | impresii (afișări pierdute) |
| 10 | calcul pensie 2026 | 100 | 1 | -99 | 462 → 21 | 1.2 → 1.0 | 21.65% → 4.76% | -95 | +1 | -4 | impresii (afișări pierdute) |
| 11 | tabel varsta pensionare anticipata femei | 69 | 0 | -69 | 1,149 → — | 2.2 → — | 6.01% → — | -69 | +0 | +0 | dispărută din rezultate |
| 12 | impozit dividende 2026 | 191 | 135 | -56 | 1,801 → 1,905 | 1.2 → 1.6 | 10.61% → 7.09% | +11 | -38 | -29 | poziție (ranking) |
| 13 | calcul indemnizatie crestere copil 2026 | 77 | 29 | -48 | 188 → 101 | 1.3 → 1.1 | 40.96% → 28.71% | -36 | +4 | -17 | impresii (afișări pierdute) |
| 14 | cand pot iesi la pensie | 40 | 5 | -35 | 316 → 35 | 2.8 → 4.9 | 12.66% → 14.29% | -36 | -2 | +2 | impresii (afișări pierdute) |
| 15 | pensie de invaliditate gradul 2 suma forum | 110 | 76 | -34 | 888 → 534 | 1.6 → 1.5 | 12.39% → 14.23% | -44 | +4 | +6 | impresii (afișări pierdute) |
| 16 | dobanda legala penalizatoare 2026 | 53 | 23 | -30 | 175 → 105 | 1.1 → 1.2 | 30.29% → 21.90% | -21 | -1 | -8 | impresii (afișări pierdute) |
| 17 | pensia alimentara 2026 | 35 | 8 | -27 | 238 → 45 | 1.1 → 1.2 | 14.71% → 17.78% | -28 | -0 | +2 | impresii (afișări pierdute) |
| 18 | calculator indemnizatie crestere copil | 331 | 305 | -26 | 685 → 794 | 1.7 → 2.0 | 48.32% → 38.41% | +53 | -66 | -13 | poziție (ranking) |
| 19 | pensie anticipata femei 1969 | 29 | 3 | -26 | 192 → 84 | 1.1 → 1.4 | 15.10% → 3.57% | -16 | -2 | -8 | impresii (afișări pierdute) |
| 20 | calculare impozit auto 2026 | 40 | 17 | -23 | 61 → 50 | 1.5 → 2.3 | 65.57% → 34.00% | -7 | -11 | -5 | poziție (ranking) |

**Pagini care au crescut**

| # | Pagină | Clicuri înainte | Clicuri după | Δ | Impresii înainte → după | Poziție înainte → după | CTR înainte → după | Efect impresii | Efect poziție | Efect CTR | Cauza principală |
|---:|---|---:|---:|---:|---|---|---|---:|---:|---:|---|
| 1 | `/calculator/varsta-pensionare` | 1 | 33 | +32 | 5 → 188 | 1.0 → 1.0 | 20.00% → 17.55% | +37 | -0 | -4 | impresii (afișări pierdute) |
| 2 | `/servicii/cazier-judiciar-online/` | 3 | 7 | +4 | 151 → 136 | 4.0 → 10.5 | 1.99% → 5.15% | -0 | -2 | +6 | CTR la aceeași poziție (SERP/ads) |
| 3 | `/informatii-cazier-auto-online/` | 7 | 11 | +4 | 283 → 167 | 3.8 → 6.0 | 2.47% → 6.59% | -3 | -2 | +9 | CTR la aceeași poziție (SERP/ads) |
| 4 | `/curs-valutar/` | 1 | 3 | +2 | 16 → 48 | 16.7 → 14.4 | 6.25% → 6.25% | +2 | +1 | -1 | impresii (afișări pierdute) |
| 5 | `/contact/` | 1 | 3 | +2 | 199 → 63 | 3.1 → 5.9 | 0.50% → 4.76% | -1 | -0 | +3 | CTR la aceeași poziție (SERP/ads) |
| 6 | `/calculator/vechime-in-munca/` | 3 | 5 | +2 | 56 → 30 | 60.1 → 59.6 | 5.36% → 16.67% | -1 | +0 | +3 | CTR la aceeași poziție (SERP/ads) |
| 7 | `/servicii/extras-de-carte-funciara/constanta/` | 0 | 1 | +1 | — → 2 | — → 1.5 | — → 50.00% | +1 | +0 | +0 | nouă |
| 8 | `/servicii/extras-de-carte-funciara/cluj/` | 0 | 1 | +1 | 18 → 5 | 20.2 → 3.6 | 0.00% → 20.00% | -0 | +0 | +1 | CTR la aceeași poziție (SERP/ads) |
| 9 | `/servicii/copie-carte-funciara/` | 0 | 1 | +1 | 4 → 11 | 5.5 → 4.3 | 0.00% → 9.09% | +0 | +0 | +1 | CTR la aceeași poziție (SERP/ads) |
| 10 | `/servicii/certificat-sarcini/` | 0 | 1 | +1 | 4 → 12 | 5.5 → 7.4 | 0.00% → 8.33% | +0 | -0 | +1 | CTR la aceeași poziție (SERP/ads) |

**eghiseul, doar paginile `/servicii/` (primul semn de recuperare, cf. regula 8):**

| Fereastră | Clicuri | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|
| prespam28 (28 z) | 3,284 | 129,586 | 2.53% | 7.9 |
| preoct21 (21 z) | 216 | 2,492 | 8.67% | 7.3 |
| postoct21 (21 z) | 179 | 1,811 | 9.88% | 9.7 |
| last28 (28 z) | 262 | 2,536 | 10.33% | 9.6 |

## 4. Interogări la distanță de atac (poziție 8–20, ≥200 impresii/lună)

Fereastra 2026-10-12 → 2026-11-08, impresii normalizate la 30 de zile (×30/28). Sortare după impresii. „Clicuri la poz. 3” = estimare Sistrix (11%) dacă interogarea ar urca pe 3.


### 4.1 cazierjudiciaronline.com — prag 200/lună
Proprietate `sc-domain:cazierjudiciaronline.com`. 14 interogări îndeplinesc filtrul; afișez top 14.

| # | Interogare | Cluster | Impresii/lună | Clicuri/lună | CTR | Poziție | Clicuri/lună la poz. 3 | URL principal |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | cazier judiciar | cazier generic | 3,959 | 27 | 0.68% | 8.3 | 435 | `/cazier-judiciar-online/bucuresti` |
| 2 | eliberare cazier judiciar | cazier generic | 1,141 | 2 | 0.19% | 8.4 | 126 | `/cazier-judiciar-persoane-fizice-ghid` |
| 3 | cazier judiciar online gratuit persoane fizice | gratuit | 917 | 14 | 1.52% | 8.6 | 101 | `/` |
| 4 | certificat fiscal | fiscal | 865 | 0 | 0.00% | 10.1 | 95 | `/cazier-fiscal-online` |
| 5 | ghiseul ro cazier judiciar online | ghiseul (navigational) | 823 | 3 | 0.39% | 8.5 | 91 | `/cazier-judiciar-gratuit` |
| 6 | cazier fiscal persoana fizica | fiscal | 708 | 13 | 1.82% | 9.0 | 78 | `/cazier-fiscal-online` |
| 7 | ipj iasi | program/IPJ local | 652 | 0 | 0.00% | 8.2 | 72 | `/cazier-judiciar-online/iasi` |
| 8 | ipj arad | program/IPJ local | 415 | 0 | 0.00% | 9.7 | 46 | `/cazier-judiciar-online/arad` |
| 9 | cazier judiciar persoane fizice | cazier generic | 331 | 2 | 0.65% | 8.4 | 36 | `/cazier-judiciar-persoane-fizice-ghid` |
| 10 | certificat de cazier fiscal | fiscal | 302 | 0 | 0.00% | 11.4 | 33 | `/cazier-fiscal-online` |
| 11 | obtinere cazier judiciar online | cazier generic | 296 | 2 | 0.72% | 8.5 | 33 | `/` |
| 12 | obtinere cazier judiciar | cazier generic | 235 | 0 | 0.00% | 8.5 | 26 | `/cazier-judiciar-persoane-fizice-ghid` |
| 13 | cazier online ghiseul.ro | ghiseul (navigational) | 234 | 2 | 0.92% | 8.7 | 26 | `/cazier-judiciar-gratuit` |
| 14 | eliberare cazier | cazier generic | 223 | 2 | 0.96% | 8.3 | 25 | `/cazier-judiciar-persoane-fizice-ghid` |

### 4.1b cazierjudiciaronline.com — prag relaxat 100/lună (completare până la 30)
Proprietate `sc-domain:cazierjudiciaronline.com`. 37 interogări îndeplinesc filtrul; afișez top 30.

| # | Interogare | Cluster | Impresii/lună | Clicuri/lună | CTR | Poziție | Clicuri/lună la poz. 3 | URL principal |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | cazier judiciar | cazier generic | 3,959 | 27 | 0.68% | 8.3 | 435 | `/cazier-judiciar-online/bucuresti` |
| 2 | eliberare cazier judiciar | cazier generic | 1,141 | 2 | 0.19% | 8.4 | 126 | `/cazier-judiciar-persoane-fizice-ghid` |
| 3 | cazier judiciar online gratuit persoane fizice | gratuit | 917 | 14 | 1.52% | 8.6 | 101 | `/` |
| 4 | certificat fiscal | fiscal | 865 | 0 | 0.00% | 10.1 | 95 | `/cazier-fiscal-online` |
| 5 | ghiseul ro cazier judiciar online | ghiseul (navigational) | 823 | 3 | 0.39% | 8.5 | 91 | `/cazier-judiciar-gratuit` |
| 6 | cazier fiscal persoana fizica | fiscal | 708 | 13 | 1.82% | 9.0 | 78 | `/cazier-fiscal-online` |
| 7 | ipj iasi | program/IPJ local | 652 | 0 | 0.00% | 8.2 | 72 | `/cazier-judiciar-online/iasi` |
| 8 | ipj arad | program/IPJ local | 415 | 0 | 0.00% | 9.7 | 46 | `/cazier-judiciar-online/arad` |
| 9 | cazier judiciar persoane fizice | cazier generic | 331 | 2 | 0.65% | 8.4 | 36 | `/cazier-judiciar-persoane-fizice-ghid` |
| 10 | certificat de cazier fiscal | fiscal | 302 | 0 | 0.00% | 11.4 | 33 | `/cazier-fiscal-online` |
| 11 | obtinere cazier judiciar online | cazier generic | 296 | 2 | 0.72% | 8.5 | 33 | `/` |
| 12 | obtinere cazier judiciar | cazier generic | 235 | 0 | 0.00% | 8.5 | 26 | `/cazier-judiciar-persoane-fizice-ghid` |
| 13 | cazier online ghiseul.ro | ghiseul (navigational) | 234 | 2 | 0.92% | 8.7 | 26 | `/cazier-judiciar-gratuit` |
| 14 | eliberare cazier | cazier generic | 223 | 2 | 0.96% | 8.3 | 25 | `/cazier-judiciar-persoane-fizice-ghid` |
| 15 | spv cazier fiscal | fiscal | 191 | 2 | 1.12% | 8.1 | 21 | `/cazier-fiscal-online` |
| 16 | cazier fiscal anaf | fiscal | 185 | 2 | 1.16% | 8.5 | 20 | `/cazier-fiscal-online` |
| 17 | certificat de integritate comportamentala online | integritate | 177 | 0 | 0.00% | 13.5 | 19 | `/certificat-integritate-comportamentala` |
| 18 | valabilitate certificat fiscal | fiscal | 172 | 0 | 0.00% | 9.7 | 19 | `/valabilitate-cazier-fiscal` |
| 19 | cazier fiscal persoana fizica online | fiscal | 167 | 3 | 1.92% | 9.7 | 18 | `/cazier-fiscal-online` |
| 20 | cazier fiscal persoana juridica | fiscal | 158 | 0 | 0.00% | 17.0 | 17 | `/cazier-fiscal-online` |
| 21 | eliberare cazier fiscal online persoane fizice | fiscal | 151 | 0 | 0.00% | 12.2 | 17 | `/cazier-fiscal-online` |
| 22 | certificat cazier fiscal | fiscal | 150 | 1 | 0.71% | 9.6 | 16 | `/cazier-fiscal-online` |
| 23 | ghiseul ro cazier judiciar persoane fizice | ghiseul (navigational) | 149 | 1 | 0.72% | 9.1 | 16 | `/cazier-judiciar-gratuit` |
| 24 | eliberare certificat de integritate comportamentala online | integritate | 146 | 0 | 0.00% | 14.0 | 16 | `/certificat-integritate-comportamentala` |
| 25 | program cazier sectia 7 | program/IPJ local | 133 | 0 | 0.00% | 10.5 | 15 | `/cazier-judiciar-online/bucuresti` |
| 26 | taxa certificat de integritate comportamentala | integritate | 131 | 0 | 0.00% | 12.0 | 14 | `/certificat-integritate-comportamentala` |
| 27 | cazier judiciar persoana fizica | cazier generic | 122 | 0 | 0.00% | 9.7 | 13 | `/cazier-judiciar-persoane-fizice-ghid` |
| 28 | cazier ghiseul.ro | ghiseul (navigational) | 120 | 1 | 0.89% | 8.1 | 13 | `/cazier-judiciar-gratuit` |
| 29 | cazier fiscal firma | fiscal | 119 | 0 | 0.00% | 18.2 | 13 | `/cazier-fiscal-online` |
| 30 | eliberare cazier fiscal | fiscal | 119 | 0 | 0.00% | 13.6 | 13 | `/cazier-fiscal-online` |

### 4.2 eghiseul.ro — prag 200/lună
Proprietate `https://eghiseul.ro/ (URL-prefix)`. 1 interogări îndeplinesc filtrul; afișez top 1.

| # | Interogare | Cluster | Impresii/lună | Clicuri/lună | CTR | Poziție | Clicuri/lună la poz. 3 | URL principal |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | verificare rovinieta | calculator/tool | 438 | 228 | 52.08% | 14.2 | 48 | `/tools/verificare-rovinieta-online/` |

### 4.2b eghiseul.ro — prag relaxat 50/lună
Proprietate `https://eghiseul.ro/ (URL-prefix)`. 5 interogări îndeplinesc filtrul; afișez top 5.

| # | Interogare | Cluster | Impresii/lună | Clicuri/lună | CTR | Poziție | Clicuri/lună la poz. 3 | URL principal |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | verificare rovinieta | calculator/tool | 438 | 228 | 52.08% | 14.2 | 48 | `/tools/verificare-rovinieta-online/` |
| 2 | verificare rovinieta online | calculator/tool | 130 | 65 | 50.41% | 14.5 | 14 | `/tools/verificare-rovinieta-online/` |
| 3 | verificare rovinieta dupa numar | calculator/tool | 72 | 44 | 61.19% | 13.9 | 8 | `/tools/verificare-rovinieta-online/` |
| 4 | cazier | cazier generic | 70 | 0 | 0.00% | 18.3 | 8 | `/` |
| 5 | verifica rovinieta | calculator/tool | 60 | 26 | 42.86% | 12.8 | 7 | `/tools/verificare-rovinieta-online/` |

### 4.3 eghiseul — interogări de serviciu îngropate (poziție > 20, fără calculatoare)
De ce lista de mai sus e aproape goală: după spam update, interogările de serviciu ale eghiseul nu mai stau pe 8–20, ci pe 20–70. Top 20 după impresii, 2026-10-12 → 2026-11-08:

| Interogare | Cluster | Impresii 28z | Clicuri | Poziție |
|---|---|---:|---:|---:|
| eliberare certificat de integritate comportamentala online | integritate | 76 | 0 | 22.2 |
| taxa certificat de integritate comportamentala | integritate | 75 | 0 | 25.1 |
| cazier online | cazier generic | 68 | 1 | 28.5 |
| plata taxa cazier judiciar online | pret/cost | 62 | 0 | 20.1 |
| cazier judiciar persoane fizice | cazier generic | 56 | 0 | 28.8 |
| certificat de integritate comportamentala online | integritate | 55 | 0 | 25.3 |
| acte cazier | acte necesare/cum | 54 | 0 | 21.3 |
| eliberare cazier auto online | auto/permis | 47 | 0 | 26.1 |
| cazier judiciar online | cazier generic | 45 | 1 | 38.3 |
| de unde scot cazierul | acte necesare/cum | 42 | 0 | 24.7 |
| certificat de integritate comportamentala | integritate | 40 | 0 | 28.3 |
| cazier judiciar online persoane juridice | cazier generic | 39 | 0 | 26.2 |
| clinica reabilitare | reabilitare | 34 | 0 | 57.8 |
| cazier judiciar persoane juridice | cazier generic | 33 | 0 | 30.7 |
| cerere cazier judiciar online | model cerere/formular | 33 | 0 | 34.9 |
| certificat de cazier fiscal | fiscal | 33 | 0 | 54.6 |
| certificat constatator | constatator/ONRC | 32 | 0 | 40.2 |
| acte cazier judiciar firma | acte necesare/cum | 30 | 0 | 27.6 |
| certificat integritate comportamentala online | integritate | 28 | 0 | 24.7 |
| folie alimentara | altele | 28 | 0 | 68.3 |

## 5. Canibalizare

### 5.1 În interiorul CJO
Proprietate `sc-domain:cazierjudiciaronline.com`, 2026-10-12 → 2026-11-08, dimensiuni `query`+`page`. Criteriu: interogare cu ≥100 impresii în total și cel puțin 2 URL-uri cu ≥10% din impresiile interogării fiecare.

Notă: în `query`+`page`, Google numără o afișare pentru fiecare URL afișat, deci „impresii total” aici e mai mare decât pe `query` simplu.

123 interogări canibalizate. Top 30:

| # | Interogare | Impresii total | Clicuri | URL 1 (impr / poz / clicuri) | URL 2 (impr / poz / clicuri) | Alte URL-uri ≥10% |
|---:|---|---:|---:|---|---|---|
| 1 | cazier judiciar online gratuit | 4,387 | 45 | `/` (3,549 / 7.3 / 30) | `/cazier-judiciar-gratuit` (522 / 9.4 / 8) |  |
| 2 | cazier judiciar | 4,244 | 25 | `/cazier-judiciar-online/bucuresti` (963 / 10.8 / 1) | `/` (819 / 9.9 / 0) | `/cazier-judiciar-persoane-fizice-ghid` |
| 3 | cazier | 2,323 | 26 | `/cazier-judiciar-online/bucuresti` (423 / 7.6 / 0) | `/cazier-judiciar-persoane-fizice-ghid` (249 / 10.7 / 0) |  |
| 4 | eliberare cazier judiciar | 1,246 | 2 | `/cazier-judiciar-persoane-fizice-ghid` (625 / 8.7 / 1) | `/cazier-judiciar-online/bucuresti` (410 / 8.9 / 1) |  |
| 5 | cazier online gratuit | 1,151 | 8 | `/` (774 / 7.4 / 6) | `/cazier-judiciar-gratuit` (159 / 9.4 / 0) | `/taxa-cazier-judiciar` |
| 6 | cazier judiciar persoane juridice | 907 | 9 | `/cazier-judiciar-persoane-juridice-ghid` (553 / 3.2 / 9) | `/` (159 / 10.9 / 0) | `/cerere-cazier-judiciar-model` |
| 7 | cazier judiciar online gratuit persoane fizice | 869 | 13 | `/` (640 / 8.5 / 7) | `/cazier-judiciar-gratuit` (215 / 9.3 / 5) |  |
| 8 | ghiseul ro cazier judiciar online | 769 | 3 | `/cazier-judiciar-gratuit` (627 / 8.3 / 3) | `/taxa-cazier-judiciar` (79 / 9.7 / 0) |  |
| 9 | program cazier | 687 | 4 | `/cazier-judiciar-online/bucuresti` (276 / 7.0 / 2) | `/cazier-judiciar-online/ploiesti` (91 / 9.0 / 0) |  |
| 10 | eliberare cazier judiciar online | 626 | 2 | `/` (333 / 7.7 / 2) | `/cazier-judiciar-online/bucuresti` (138 / 8.7 / 0) | `/eliberare-cazier-judiciar-online` |
| 11 | cazier judiciar persoane fizice | 569 | 2 | `/cazier-judiciar-persoane-fizice-ghid` (257 / 8.6 / 1) | `/` (162 / 9.5 / 1) | `/cazier-judiciar-online/bucuresti` |
| 12 | taxa cazier judiciar | 553 | 9 | `/taxa-cazier-judiciar` (269 / 2.1 / 9) | `/cazier-judiciar-gratuit` (112 / 12.8 / 0) | `/` |
| 13 | cat e valabil cazierul judiciar | 417 | 1 | `/valabilitate-cazier-judiciar` (317 / 3.6 / 1) | `/blog` (63 / 10.0 / 0) |  |
| 14 | cat costa cazierul judiciar | 406 | 5 | `/taxa-cazier-judiciar` (188 / 2.0 / 5) | `/` (73 / 13.3 / 0) | `/cazier-judiciar-gratuit` |
| 15 | cazier satu mare | 402 | 27 | `/cazier-judiciar-online/satu-mare` (300 / 3.0 / 27) | `/` (84 / 1.8 / 0) |  |
| 16 | acte necesare cazier judiciar | 382 | 2 | `/cazier-judiciar-persoane-fizice-ghid` (170 / 4.6 / 2) | `/acte-necesare-cazier-judiciar` (144 / 7.6 / 0) |  |
| 17 | plata taxa cazier judiciar online | 381 | 0 | `/` (88 / 9.8 / 0) | `/taxa-cazier-judiciar` (85 / 7.4 / 0) | `/cazier-judiciar-gratuit`, `/cazier-auto-online` |
| 18 | anaf cazier fiscal online | 371 | 2 | `/cazier-fiscal-online` (274 / 7.5 / 1) | `/verificare-cazier-fiscal-online` (95 / 7.7 / 1) |  |
| 19 | ghiseul.ro cazier judiciar | 368 | 1 | `/cazier-judiciar-gratuit` (294 / 7.1 / 1) | `/taxa-cazier-judiciar` (73 / 7.9 / 0) |  |
| 20 | cerere cazier judiciar online | 322 | 0 | `/cerere-cazier-judiciar-model` (96 / 7.3 / 0) | `/` (75 / 12.4 / 0) | `/cazier-judiciar-online/bucuresti`, `/cazier-judiciar-persoane-fizice-ghid` |
| 21 | cazier judiciar online persoane juridice | 314 | 1 | `/cazier-judiciar-persoane-juridice-ghid` (134 / 4.3 / 1) | `/` (97 / 10.4 / 0) | `/cazier-judiciar-online/bucuresti` |
| 22 | cazier online timisoara | 312 | 6 | `/cazier-judiciar-online/timisoara` (197 / 6.3 / 5) | `/` (109 / 7.4 / 1) |  |
| 23 | unde se plateste taxa cazier judiciar | 310 | 2 | `/taxa-cazier-judiciar` (118 / 3.3 / 2) | `/cazier-judiciar-gratuit` (82 / 11.9 / 0) | `/cazier-judiciar-online/bucuresti`, `/cazier-judiciar-persoane-fizice-ghid` |
| 24 | cazier judiciar firma | 304 | 8 | `/cazier-judiciar-persoane-juridice-ghid` (168 / 3.3 / 7) | `/cerere-cazier-judiciar-model` (43 / 8.8 / 0) | `/` |
| 25 | certificat de cazier fiscal | 299 | 0 | `/cazier-fiscal-online` (251 / 8.5 / 0) | `/verificare-cazier-fiscal-online` (32 / 22.3 / 0) |  |
| 26 | cazier judiciar online pret | 297 | 0 | `/taxa-cazier-judiciar` (107 / 4.1 / 0) | `/` (75 / 9.6 / 0) | `/cazier-judiciar-gratuit` |
| 27 | cat costa un cazier judiciar | 294 | 3 | `/taxa-cazier-judiciar` (101 / 2.3 / 3) | `/` (76 / 9.2 / 0) | `/cazier-judiciar-gratuit` |
| 28 | obtinere cazier judiciar online | 294 | 2 | `/` (219 / 8.0 / 2) | `/eliberare-cazier-judiciar-online` (52 / 9.2 / 0) |  |
| 29 | taxa cazier | 288 | 2 | `/taxa-cazier-judiciar` (99 / 1.9 / 2) | `/` (55 / 15.3 / 0) | `/cazier-judiciar-gratuit`, `/cazier-judiciar-persoane-fizice-ghid` |
| 30 | cazier judiciar pret | 284 | 0 | `/taxa-cazier-judiciar` (92 / 2.5 / 0) | `/` (53 / 12.9 / 0) | `/cazier-judiciar-gratuit`, `/cazier-judiciar-persoane-fizice-ghid` |

**Perechi de URL-uri implicate** (agregat pe toate interogările canibalizate, după impresii):

| Pereche | Interogări | Impresii | Exemple |
|---|---:|---:|---|
| `/` ↔ `/cazier-judiciar-gratuit` | 4 | 6,649 | cazier judiciar online gratuit; cazier online gratuit; cazier judiciar online gratuit persoane fizice |
| `/` ↔ `/taxa-cazier-judiciar` | 26 | 6,539 | cat costa cazierul judiciar; plata taxa cazier judiciar online; cazier judiciar online pret |
| `/` ↔ `/cazier-judiciar-online/bucuresti` | 3 | 4,973 | cazier judiciar; eliberare cazier judiciar online; cazier judiciar bucuresti |
| `/cazier-judiciar-online/bucuresti` ↔ `/cazier-judiciar-persoane-fizice-ghid` | 5 | 4,180 | cazier; eliberare cazier judiciar; eliberare cazier |
| `/cazier-judiciar-gratuit` ↔ `/taxa-cazier-judiciar` | 11 | 3,486 | ghiseul ro cazier judiciar online; taxa cazier judiciar; ghiseul.ro cazier judiciar |
| `/acte-necesare-cazier-judiciar` ↔ `/cazier-judiciar-persoane-fizice-ghid` | 10 | 2,241 | acte necesare cazier judiciar; acte cazier judiciar; acte eliberare cazier |
| `/` ↔ `/cazier-judiciar-persoane-juridice-ghid` | 5 | 1,798 | cazier judiciar persoane juridice; cazier judiciar online persoane juridice; acte cazier judiciar firma |
| `/` ↔ `/cazier-judiciar-persoane-fizice-ghid` | 5 | 1,150 | cazier judiciar persoane fizice; cazier judiciar persoana fizica; certificat cazier judiciar |
| `/cazier-judiciar-persoane-juridice-ghid` ↔ `/cerere-cazier-judiciar-model` | 4 | 975 | cazier judiciar firma; cerere cazier judiciar persoane juridice; cazier judiciar persoana juridica |
| `/cazier-fiscal-online` ↔ `/verificare-cazier-fiscal-online` | 4 | 958 | anaf cazier fiscal online; certificat de cazier fiscal; eliberare cazier fiscal online persoane fizice |
| `/blog` ↔ `/valabilitate-cazier-judiciar` | 4 | 876 | cat e valabil cazierul judiciar; cat timp este valabil cazierul judiciar; cat este valabil un cazier judiciar |
| `/cazier-judiciar-online/bucuresti` ↔ `/cazier-judiciar-online/ploiesti` | 1 | 687 | program cazier |
| `/` ↔ `/eliberare-cazier-judiciar-online` | 3 | 641 | obtinere cazier judiciar online; eliberare cazier online; scoatere cazier online |
| `/` ↔ `/certificat-integritate-comportamentala` | 3 | 488 | certificat de integritate comportamentala online; eliberare certificat de integritate comportamentala online; certificat integritate comportamentala online |
| `/` ↔ `/cerere-cazier-judiciar-model` | 2 | 452 | cerere cazier judiciar online; cum arata un cazier judiciar |
| `/cazier-judiciar-online/bucuresti` ↔ `/cazier-judiciar-online/iasi` | 3 | 431 | serviciul cazier judiciar; program caziere; caziere |
| `/cazier-judiciar-persoane-fizice-ghid` ↔ `/valabilitate-cazier-judiciar` | 2 | 421 | valabilitate cazier judiciar persoana fizica; cazier judiciar valabilitate |
| `/` ↔ `/cazier-judiciar-online/satu-mare` | 1 | 402 | cazier satu mare |
| `/cazier-auto-online` ↔ `/taxa-cazier-judiciar` | 2 | 347 | taxa cazier auto; taxa cazier pentru scoala de soferi |
| `/cazier-auto-online` ↔ `/cazier-judiciar-persoane-fizice-ghid` | 2 | 329 | de unde scot cazierul; acte cazier auto |

### 5.2 În interiorul eghiseul
Proprietate `https://eghiseul.ro/`, aceeași fereastră și criteriu.

3 interogări canibalizate. Top 3:

| # | Interogare | Impresii total | Clicuri | URL 1 (impr / poz / clicuri) | URL 2 (impr / poz / clicuri) | Alte URL-uri ≥10% |
|---:|---|---:|---:|---|---|---|
| 1 | eghiseul.ro | 447 | 126 | `/` (258 / 1.1 / 121) | `/servicii/` (84 / 7.6 / 3) |  |
| 2 | calcul varsta pensionare legea noua | 332 | 50 | `/calculator/varsta-pensionare` (180 / 1.0 / 33) | `/calculator/varsta-pensionare/` (151 / 1.5 / 17) |  |
| 3 | eghiseul | 122 | 2 | `/` (28 / 1.4 / 2) | `/contact/` (21 / 1.0 / 0) | `/servicii/` |

**Perechi de URL-uri implicate** (agregat pe toate interogările canibalizate, după impresii):

| Pereche | Interogări | Impresii | Exemple |
|---|---:|---:|---|
| `/` ↔ `/servicii/` | 1 | 447 | eghiseul.ro |
| `/calculator/varsta-pensionare` ↔ `/calculator/varsta-pensionare/` | 1 | 332 | calcul varsta pensionare legea noua |
| `/` ↔ `/contact/` | 1 | 122 | eghiseul |

### 5.3 CJO vs eghiseul (proprietăți diferite)
Fereastra 2026-10-12 → 2026-11-08. Interogări prezente în ambele proprietăți (doar partea neanonimizată). Sortare după impresii combinate.

311 interogări comune din 2972 (CJO) și 3833 (eghiseul). Pe ele: CJO 74,229 impresii (48.9% din impresiile pe query ale CJO), eghiseul 2,807 (5.5% din ale eghiseul). Clicuri pe ele: CJO 846, eghiseul 155.

| # | Interogare | Cluster | CJO impr / poz / clicuri | eghiseul impr / poz / clicuri | URL CJO | URL eghiseul |
|---:|---|---|---|---|---|---|
| 1 | cazier judiciar online | cazier generic | 13,897 / 7.1 / 57 | 45 / 38.3 / 1 | `/` | `/` |
| 2 | ghiseul.ro cazier | ghiseul (navigational) | 5,153 / 5.9 / 24 | 4 / 67.2 / 0 | `/cazier-judiciar-gratuit` | `/` |
| 3 | cazier online | cazier generic | 4,823 / 7.8 / 17 | 68 / 28.5 / 1 | `/` | `/` |
| 4 | cazier judiciar online gratuit | gratuit | 4,047 / 7.5 / 45 | 16 / 51.4 / 0 | `/` | `/` |
| 5 | cazier judiciar | cazier generic | 3,695 / 8.3 / 25 | 42 / 13.7 / 0 | `/cazier-judiciar-online/bucuresti` | `/` |
| 6 | certificat de integritate comportamentala | integritate | 3,224 / 5.6 / 4 | 40 / 28.3 / 0 | `/certificat-integritate-comportamentala` | `/` |
| 7 | cazier | cazier generic | 2,109 / 6.4 / 26 | 65 / 18.3 / 0 | `/cazier-judiciar-online/bucuresti` | `/` |
| 8 | cazier fiscal online | fiscal | 1,691 / 7.1 / 24 | 10 / 62.4 / 0 | `/cazier-fiscal-online` | `/` |
| 9 | cazier auto online | auto/permis | 1,551 / 5.4 / 53 | 17 / 36.6 / 0 | `/cazier-auto-online` | `/` |
| 10 | cazier constanta | oras/judet | 1,250 / 3.9 / 57 | 4 / 34.8 / 0 | `/cazier-judiciar-online/constanta` | `/` |
| 11 | cazier sibiu | oras/judet | 1,156 / 4.2 / 45 | 4 / 43.2 / 0 | `/cazier-judiciar-online/sibiu` | `/` |
| 12 | cazier cluj | oras/judet | 1,154 / 5.7 / 44 | 2 / 48.5 / 0 | `/cazier-judiciar-online/cluj` | `/` |
| 13 | eliberare cazier judiciar | cazier generic | 1,065 / 8.4 / 2 | 7 / 33.7 / 0 | `/cazier-judiciar-persoane-fizice-ghid` | `/` |
| 14 | cazier fiscal | fiscal | 962 / 7.6 / 6 | 2 / 11.5 / 1 | `/cazier-fiscal-online` | `/servicii/cazier-fiscal-online/` |
| 15 | cazier online gratuit | gratuit | 959 / 7.4 / 8 | 2 / 25.0 / 0 | `/` | `/` |
| 16 | cazier auto | auto/permis | 832 / 7.1 / 8 | 18 / 33.2 / 0 | `/cazier-auto-online` | `/` |
| 17 | certificat fiscal | fiscal | 807 / 10.1 / 0 | 2 / 74.5 / 0 | `/cazier-fiscal-online` | `/servicii/cazier-fiscal-online/` |
| 18 | ghiseul ro cazier judiciar gratuit | ghiseul (navigational) | 741 / 6.6 / 10 | 1 / 82.0 / 0 | `/cazier-judiciar-gratuit` | `/` |
| 19 | valabilitate cazier judiciar | termen/valabilitate | 712 / 3.8 / 8 | 2 / 49.0 / 0 | `/valabilitate-cazier-judiciar` | `/` |
| 20 | cazier fiscal persoana fizica | fiscal | 661 / 9.0 / 12 | 17 / 69.1 / 0 | `/cazier-fiscal-online` | `/` |
| 21 | cazier judiciar persoane juridice | cazier generic | 581 / 3.4 / 9 | 33 / 30.7 / 0 | `/cazier-judiciar-persoane-juridice-ghid` | `/` |
| 22 | cazier judiciar craiova | oras/judet | 609 / 3.4 / 45 | 1 / 42.0 / 0 | `/cazier-judiciar-online/craiova` | `/servicii/cazier-judiciar-online/` |
| 23 | program cazier | program/IPJ local | 609 / 6.4 / 4 | 1 / 3.0 / 0 | `/cazier-judiciar-online/bucuresti` | `/` |
| 24 | eliberare cazier judiciar online | cazier generic | 548 / 7.9 / 2 | 25 / 11.6 / 0 | `/` | `/` |
| 25 | ghiseul ro cazier | ghiseul (navigational) | 507 / 5.8 / 0 | 2 / 30.5 / 0 | `/cazier-judiciar-gratuit` | `/` |
| 26 | cazier rutier online | auto/permis | 369 / 5.9 / 9 | 11 / 34.0 / 0 | `/cazier-auto-online` | `/` |
| 27 | caziere iasi | oras/judet | 373 / 4.3 / 14 | 1 / 57.0 / 0 | `/cazier-judiciar-online/iasi` | `/` |
| 28 | cat este valabil cazierul judiciar | termen/valabilitate | 363 / 4.2 / 2 | 3 / 46.0 / 0 | `/valabilitate-cazier-judiciar` | `/` |
| 29 | cazier judiciar persoane fizice | cazier generic | 309 / 8.4 / 2 | 56 / 28.8 / 0 | `/cazier-judiciar-persoane-fizice-ghid` | `/` |
| 30 | certificat integritate comportamentala | integritate | 338 / 6.0 / 0 | 15 / 40.9 / 0 | `/certificat-integritate-comportamentala` | `/` |
| 31 | cat e valabil cazierul judiciar | termen/valabilitate | 329 / 4.0 / 1 | 2 / 48.5 / 0 | `/valabilitate-cazier-judiciar` | `/` |
| 32 | certificat de cazier fiscal | fiscal | 282 / 11.4 / 0 | 33 / 54.6 / 0 | `/cazier-fiscal-online` | `/` |
| 33 | taxa cazier judiciar | pret/cost | 291 / 3.7 / 9 | 12 / 63.2 / 0 | `/taxa-cazier-judiciar` | `/` |
| 34 | obtinere cazier judiciar online | cazier generic | 276 / 8.5 / 2 | 1 / 34.0 / 0 | `/` | `/` |
| 35 | cazier judiciar constanta | oras/judet | 264 / 4.1 / 11 | 2 / 60.5 / 0 | `/cazier-judiciar-online/constanta` | `/` |
| 36 | cerere cazier judiciar | model cerere/formular | 260 / 4.7 / 23 | 2 / 47.0 / 0 | `/cerere-cazier-judiciar-model` | `/` |
| 37 | eghiseul.ro | brand/concurent | 1 / 31.0 / 0 | 258 / 1.1 / 122 | `/cazier-auto-online` | `/` |
| 38 | reabilitarea judecatoreasca | reabilitare | 230 / 7.2 / 3 | 6 / 63.3 / 0 | `/ghid-reabilitare-cazier` | `/calculator/reabilitare/` |
| 39 | ghișeul.ro cazier | ghiseul (navigational) | 212 / 5.9 / 0 | 14 / 8.8 / 0 | `/cazier-judiciar-gratuit` | `/` |
| 40 | obtinere cazier judiciar | cazier generic | 219 / 8.5 / 0 | 5 / 32.0 / 0 | `/cazier-judiciar-persoane-fizice-ghid` | `/servicii/cazier-judiciar-online/` |

Interogări unde AMBELE site-uri sunt în top 10 cu ≥50 impresii fiecare: **3** — unde se plateste taxa cazier judiciar, taxa eliberare cazier judiciar, cazier rutier online gratuit.


## 6. Dispozitive și țări

### 6.1 Dispozitive, ultimele 28 de zile (2026-10-12 → 2026-11-08)

| Site | Dispozitiv | Clicuri | Impresii | CTR | Poziție | Cota impresii |
|---|---|---:|---:|---:|---:|---:|
| CJO | MOBILE | 4,352 | 201,849 | 2.16% | 6.0 | 77.9% |
| CJO | DESKTOP | 1,129 | 56,793 | 1.99% | 6.1 | 21.9% |
| CJO | TABLET | 12 | 575 | 2.09% | 6.1 | 0.2% |
| EGH | MOBILE | 9,131 | 64,466 | 14.16% | 4.9 | 71.4% |
| EGH | DESKTOP | 2,084 | 25,502 | 8.17% | 10.9 | 28.2% |
| EGH | TABLET | 52 | 314 | 16.56% | 2.4 | 0.3% |
| DOC | MOBILE | 60 | 1,716 | 3.50% | 5.4 | 75.1% |
| DOC | DESKTOP | 13 | 555 | 2.34% | 15.9 | 24.3% |
| DOC | TABLET | 0 | 13 | 0.00% | 5.0 | 0.6% |
| ECZ | MOBILE | 34 | 1,707 | 1.99% | 11.9 | 68.4% |
| ECZ | DESKTOP | 17 | 783 | 2.17% | 13.7 | 31.4% |
| ECZ | TABLET | 0 | 7 | 0.00% | 6.4 | 0.3% |
| EGH pre-spam 07-23→08-19 | MOBILE | 59,311 | 1,884,379 | 3.15% | 6.0 | |
| EGH pre-spam 07-23→08-19 | DESKTOP | 21,572 | 979,003 | 2.20% | 6.2 | |
| EGH pre-spam 07-23→08-19 | TABLET | 422 | 10,132 | 4.17% | 5.9 | |

### 6.2 CJO — mobil vs desktop pe interogările principale (aceeași fereastră)
Acolo unde CTR-ul pe mobil e mult sub desktop la poziție similară, SERP-ul de pe mobil (reclame + Hub MAI deasupra) împinge rezultatul organic sub pliu.

| Interogare | MOBIL impr / poz / CTR | DESKTOP impr / poz / CTR |
|---|---|---|
| cazier judiciar online | 8,650 / 6.8 / 0.43% | 5,206 / 7.7 / 0.38% |
| ghiseul.ro cazier | 3,917 / 5.7 / 0.49% | 1,227 / 6.5 / 0.41% |
| cazier online | 3,167 / 7.5 / 0.47% | 1,648 / 8.3 / 0.12% |
| cazier judiciar online gratuit | 3,434 / 7.5 / 1.22% | 604 / 7.2 / 0.50% |
| cazier judiciar | 2,255 / 8.6 / 0.53% | 1,425 / 7.9 / 0.84% |
| certificat de integritate comportamentala | 2,687 / 5.2 / 0.07% | 526 / 7.7 / 0.38% |
| cazier | 1,550 / 6.3 / 1.42% | 553 / 6.8 / 0.72% |
| cazier iasi | 1,769 / 4.2 / 2.94% | 112 / 3.7 / 7.14% |
| cazier fiscal online | 1,068 / 7.3 / 1.59% | 613 / 6.6 / 1.14% |
| cazier auto online | 1,329 / 5.7 / 3.16% | 220 / 3.4 / 5.00% |
| cazier constanta | 1,193 / 4.0 / 4.44% | 54 / 2.8 / 7.41% |
| cazier timisoara | 1,138 / 5.1 / 3.34% | 54 / 3.9 / 5.56% |
| cazier sibiu | 1,089 / 4.2 / 3.67% | 65 / 3.5 / 7.69% |
| cazier cluj | 1,066 / 5.8 / 4.13% | 86 / 5.3 / 0.00% |
| eliberare cazier judiciar | 805 / 8.5 / 0.12% | 260 / 7.9 / 0.38% |
| cazier fiscal | 440 / 8.2 / 0.45% | 520 / 7.1 / 0.77% |
| cazier online gratuit | 825 / 7.3 / 0.85% | 131 / 8.4 / 0.76% |
| program cazier brasov | 885 / 5.2 / 1.36% | 45 / 5.4 / 0.00% |
| cazier judiciar online gratuit persoane fizice | 627 / 8.7 / 1.44% | 221 / 8.3 / 1.36% |
| ipj braila | 791 / 5.8 / 0.13% | 54 / 5.1 / 1.85% |

### 6.3 Dispozitive pe săptămână — CJO

| Săptămâna | Mobil clicuri | Mobil CTR | Mobil poz | Desktop clicuri | Desktop CTR | Desktop poz |
|---|---:|---:|---:|---:|---:|---:|
| 2026-09-14 | 347 | 4.15% | 5.2 | 57 | 3.09% | 5.4 |
| 2026-09-21 | 3,071 | 4.10% | 5.0 | 741 | 3.59% | 5.0 |
| 2026-09-28 | 2,440 | 3.63% | 5.1 | 557 | 3.19% | 5.2 |
| 2026-10-05 | 2,331 | 3.57% | 5.4 | 466 | 2.68% | 5.3 |
| 2026-10-12 | 1,998 | 2.95% | 5.2 | 439 | 2.39% | 5.2 |
| 2026-10-19 | 1,064 | 2.07% | 6.1 | 311 | 2.14% | 6.5 |
| 2026-10-26 | 706 | 1.62% | 6.4 | 174 | 1.34% | 6.6 |
| 2026-11-02 | 584 | 1.49% | 6.6 | 205 | 1.88% | 6.5 |

### 6.4 Țări (top 8, ultimele 28 de zile)


**CJO** (`sc-domain:cazierjudiciaronline.com`)

| Țară | Clicuri | Cota | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|---:|
| ROU | 5,307 | 96.6% | 247,022 | 2.15% | 5.9 |
| DEU | 26 | 0.5% | 1,852 | 1.40% | 6.5 |
| ITA | 23 | 0.4% | 2,038 | 1.13% | 6.8 |
| AUT | 17 | 0.3% | 590 | 2.88% | 6.4 |
| GBR | 17 | 0.3% | 1,308 | 1.30% | 6.7 |
| NLD | 15 | 0.3% | 767 | 1.96% | 6.4 |
| FRA | 14 | 0.3% | 753 | 1.86% | 7.5 |
| ESP | 11 | 0.2% | 1,008 | 1.09% | 7.1 |

**EGH** (`https://eghiseul.ro/ (URL-prefix)`)

| Țară | Clicuri | Cota | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|---:|
| ROU | 10,731 | 95.2% | 85,853 | 12.50% | 6.5 |
| DEU | 139 | 1.2% | 879 | 15.81% | 2.8 |
| GBR | 86 | 0.8% | 522 | 16.48% | 3.6 |
| ITA | 73 | 0.6% | 617 | 11.83% | 3.8 |
| ESP | 40 | 0.4% | 293 | 13.65% | 2.2 |
| FRA | 35 | 0.3% | 179 | 19.55% | 3.8 |
| NLD | 31 | 0.3% | 202 | 15.35% | 3.5 |
| AUT | 20 | 0.2% | 171 | 11.70% | 2.0 |

## 7. Search appearance și alte tipuri de căutare
Ultimele 28 de zile, dimensiunea `searchAppearance` (tip `web`), plus tipurile `image`, `video`, `news`, `discover`, `googleNews`.

| Site | Apariție | Clicuri | Impresii | CTR | Poziție |
|---|---|---:|---:|---:|---:|
| CJO | REVIEW_SNIPPET | 5 | 115 | 4.35% | 6.8 |
| CJO | PRODUCT_SNIPPETS | 236 | 17,288 | 1.37% | 7.3 |
| EGH | REVIEW_SNIPPET | 0 | 3 | 0.00% | 12.0 |
| EGH | PRODUCT_SNIPPETS | 170 | 1,043 | 16.30% | 7.4 |
| DOC | PRODUCT_SNIPPETS | 0 | 2 | 0.00% | 5.5 |
| ECZ | (nimic returnat) | | | | |

| Site | image clicuri / impresii | video | news | discover | googleNews |
|---|---|---|---|---|---|
| CJO | 7 / 2,325 | 0 / 0 | 0 / 1 | 0 / 0 | 0 / 0 |
| EGH | 16 / 180 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| DOC | 0 / 299 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| ECZ | 0 / 8 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

**Evoluția rich results pe CJO** (`sc-domain:cazierjudiciaronline.com`, 21 z vs 21 z) și eghiseul pre-spam:

| Site / fereastră | Apariție | Clicuri | Impresii | CTR | Poziție |
|---|---|---:|---:|---:|---:|
| CJO 09-25→10-15 | REVIEW_SNIPPET | 46 | 3,847 | 1.20% | 6.9 |
| CJO 09-25→10-15 | PRODUCT_SNIPPETS | 299 | 14,190 | 2.11% | 6.1 |
| CJO 10-19→11-08 | PRODUCT_SNIPPETS | 122 | 10,876 | 1.12% | 8.1 |
| EGH 07-23→08-19 | REVIEW_SNIPPET | 51 | 2,131 | 2.39% | 10.8 |
| EGH 07-23→08-19 | PRODUCT_SNIPPETS | 2,323 | 93,763 | 2.48% | 8.4 |

`REVIEW_SNIPPET` (stelele) pe CJO: 3.847 impresii / 46 clicuri înainte de mijlocul lui octombrie, **zero** după. Produsele cu `PRODUCT_SNIPPETS` pe CJO, ultimele 28 z:

| Pagină | Clicuri | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|
| `/cazier-fiscal-online` | 70 | 7,588 | 0.92% | 6.9 |
| `/cazier-auto-online` | 122 | 6,198 | 1.97% | 8.0 |
| `/certificat-integritate-comportamentala` | 1 | 840 | 0.12% | 10.7 |
| `/cazier-judiciar-diaspora` | 6 | 459 | 1.31% | 7.7 |
| `/cazier-judiciar-online/suceava` | 6 | 353 | 1.70% | 5.0 |
| `/taxa-cazier-judiciar` | 10 | 347 | 2.88% | 3.6 |
| `/cazier-judiciar-online/buzau` | 2 | 289 | 0.69% | 5.4 |
| `/cazier-judiciar-online/ramnicu-valcea` | 3 | 189 | 1.59% | 5.1 |
| `/cazier-judiciar-online/cluj` | 3 | 180 | 1.67% | 8.9 |
| `/cazier-judiciar-online/miercurea-ciuc` | 2 | 134 | 1.49% | 4.8 |

## 8. documentero.ro și ecazier.ro (versiune scurtă)
Fereastra 2026-10-12 → 2026-11-08. Trendul săptămânal e în §1.3 și §1.4.


### documentero.ro — top pagini (`sc-domain:documentero.ro`)

| Pagină | Clicuri | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|
| `/ghiduri/certificat-de-nastere-vechi-tipizat/` | 31 | 727 | 4.26% | 4.8 |
| `/certificat-de-celibat/` | 16 | 504 | 3.17% | 5.6 |
| `/extras-multilingv/` | 7 | 256 | 2.73% | 7.7 |
| `/ghiduri/apostila-acte-stare-civila/` | 1 | 197 | 0.51% | 21.6 |
| `/ghiduri/certificat-de-nastere-pierdut/` | 3 | 173 | 1.73% | 13.6 |
| `/ghiduri/valabilitate-certificat-de-celibat/` | 8 | 147 | 5.44% | 6.7 |
| `/ghiduri/acte-necesare-duplicat-certificat-de-nastere/` | 1 | 84 | 1.19% | 7.0 |
| `/certificat-de-casatorie/` | 4 | 76 | 5.26% | 9.2 |
| `/certificat-de-nastere/` | 0 | 55 | 0.00% | 12.2 |
| `/ghiduri/procura-din-strainatate-notar-consulat-avocat/` | 0 | 50 | 0.00% | 8.9 |
| `/` | 1 | 28 | 3.57% | 6.3 |
| `/ghiduri/cat-dureaza-duplicat-certificat-de-nastere/` | 1 | 24 | 4.17% | 5.0 |

**documentero.ro — distanță de atac** (poziție 8–20, ≥15 impresii în 28 z; pragul de 200/lună nu îl atinge nicio interogare):

| Interogare | Impresii | Clicuri | Poziție |
|---|---:|---:|---:|
| certificat de nastere vechi | 31 | 0 | 8.0 |

Interogări cu ≥200 impresii/28z oriunde: 0; maximul pe o interogare: 31.


### ecazier.ro — top pagini (`sc-domain:ecazier.ro`)

| Pagină | Clicuri | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|
| `/` | 16 | 456 | 3.51% | 19.6 |
| `/cazier-auto` | 4 | 414 | 0.97% | 13.7 |
| `/cazier-fiscal` | 7 | 348 | 2.01% | 25.1 |
| `/ghid-alegere-tip-cazier` | 7 | 320 | 2.19% | 11.1 |
| `/cazier-auto-uber-bolt` | 8 | 296 | 2.70% | 6.2 |
| `/cazier-auto-vs-cazier-judiciar` | 2 | 283 | 0.71% | 9.2 |
| `/valabilitate-cazier-auto` | 0 | 210 | 0.00% | 8.1 |
| `/acte-necesare-cazier-auto` | 1 | 191 | 0.52% | 12.4 |
| `/cazier-auto-strainatate-preschimbare-permis` | 3 | 86 | 3.49% | 6.2 |
| `/fisa-evidenta-conducator-auto` | 2 | 72 | 2.78% | 5.8 |
| `/puncte-penalizare-cazier-auto` | 1 | 49 | 2.04% | 6.3 |
| `/ghiduri` | 0 | 33 | 0.00% | 13.5 |

**ecazier.ro — distanță de atac** (poziție 8–20, ≥15 impresii în 28 z; pragul de 200/lună nu îl atinge nicio interogare):

| Interogare | Impresii | Clicuri | Poziție |
|---|---:|---:|---:|
| cazier auto | 80 | 1 | 10.6 |
| cazier auto online | 79 | 1 | 12.7 |
| eliberare cazier auto online | 70 | 0 | 17.3 |
| acte necesare cazier auto | 68 | 0 | 13.6 |
| acte cazier auto | 52 | 0 | 17.6 |
| taxa cazier auto | 52 | 0 | 18.8 |
| cazier | 28 | 0 | 18.5 |
| eghiseul.ro | 27 | 0 | 11.3 |
| cazier rutier online | 24 | 0 | 11.9 |
| cazier rutier | 15 | 0 | 10.7 |

Interogări cu ≥200 impresii/28z oriunde: 0; maximul pe o interogare: 80.


## Ce spun datele (10 rânduri)

1. **CJO nu are istoric GSC înainte de 20.09.2026**: contul de serviciu vede doar `sc-domain:cazierjudiciaronline.com`, fără proprietate URL-prefix veche. Impactul spam update-ului pe CJO nu se poate măsura din GSC până nu e partajată o proprietate veche, dacă există.
2. CJO a scăzut de la 3.823 clicuri/săptămână (săpt. 21.09) la 791 (săpt. 02.11), adică −79%. Impresiile au scăzut cu 48%, CTR-ul de la 3,99% la 1,57%, iar poziția s-a mutat de la 5,0 la 6,5. Căderea a început înainte de 16.10: −21%, −7%, −13% pe săptămână, apoi −44% și −36%.
3. Căderea din octombrie pe CJO e o problemă de **ranking pe paginile de oraș**: ele explică 81% din clicurile pierdute (6.328 → 1.811), iar pe „cazier <oraș>” poziția a trecut de la 1–2 la 3–6 la impresii constante.
4. CTR-ul CJO e sub curba Sistrix la fiecare poziție: 5,7% vs 11% pe poziția 3 și 0,76% vs 4,0% pe poziția 7. Pe termenii generici, pagina e împinsă sub reclame și Hub MAI. „cazier judiciar online” are 13.897 impresii la CTR 0,41%, adică aproximativ 519 clicuri/lună pierdute față de curbă.
5. „certificat de integritate comportamentala” are 3.224 impresii și 4 clicuri la poziția 5,6, cu CTR 0,07% pe mobil. Clusterul integritate are în total 5.107 impresii și 5 clicuri: e cea mai slabă potrivire SERP–snippet de pe site.
6. Interogările „ghiseul” (10.396 impresii, CTR 0,52%) și „gratuit” (7.248 impresii, 1,46%) au intenție de navigare spre statul gratuit. CTR-ul mic e în bună parte structural, deci nu e potențial real pentru conversii.
7. Rich results pe CJO: `REVIEW_SNIPPET` a dispărut complet după mijlocul lui octombrie (3.847 impresii → 0). `PRODUCT_SNIPPETS` a coborât de la poziția 6,1 la 8,1, cu clicuri de la 299 la 122.
8. Canibalizare internă CJO: 123 de interogări. Perechile principale sunt `/` ↔ `/cazier-judiciar-gratuit`, `/` ↔ `/taxa-cazier-judiciar` (26 de interogări de preț) și `/` ↔ `/cazier-judiciar-online/bucuresti` (pe „cazier judiciar”). Între CJO și eghiseul nu există canibalizare reală: eghiseul stă pe pozițiile 30–60 pe termenii CJO și doar 3 interogări au ambele site-uri în top 10.
9. eghiseul a pierdut 97% din impresii (2,93 mil. → 91.869 pe 28 de zile) la o poziție medie egală sau mai bună, adică a fost filtrat din majoritatea interogărilor. 79 de pagini nu mai au deloc impresii. `/servicii/` a scăzut de la 129.586 la 2.536 impresii, iar ce a rămas e trafic pe calculatoare (CTR 12–18%). Fără ANCPI: 62.605 → 11.274 clicuri.
10. Distanța de atac e îngustă: CJO are doar 14 interogări pe pozițiile 8–20 cu ≥200 impresii/lună, cele mai multe generice („cazier judiciar”, 3.959/lună la poziția 8,3) și din clusterul fiscal. documentero (≈20 clicuri/săpt.) și ecazier (≈14/săpt., poziția ~12) nu au nicio interogare cu ≥200 impresii.
