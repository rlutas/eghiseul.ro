# Situația pe 14.10.2026: vânzări, trafic, email și telefon

Date citite din DB (eghiseul + documentero, CJO + ecazier), GSC (până pe 11.10) și tabelele de email/telefon. Fără refunduri în 1–13.10. GA4 și Bing nu au putut fi citite (lipsesc credențialele pentru proprietățile noastre).

## Vânzări (comenzi plătite / lei)

| Perioadă | eghiseul | documentero | CJO | ecazier | Total |
|---|---|---|---|---|---|
| 1–13.08 | 124 / 27.331 | 0 | 50 / 13.843 | 2 / 446 | 41.620 |
| 1–13.09 | 42 / 11.947 | 0 | 54 / 14.053 | 0 | 26.000 |
| **1–13.10** | **42 / 14.082** | 0 | **24 / 5.537** | 1 / 198 | **19.817** |
| Ultimele 7 zile (07–13.10) | 31 / 9.265 | 0 | 14 / 3.383 | 0 | 12.648 |
| 7 zile anterioare | 14 / 6.461 | 0 | 15 / 4.003 | 1 / 198 | 10.662 |

- Total 1–13.10: **−24% față de septembrie**, −52% față de august. Ultima săptămână e mai bună decât cea dinainte (+19%), trasă de eghiseul.
- **CJO e problema mare:** −61% față de 1–13.09, aproape tot pe cazierul judiciar (95 → 59 comenzi pe 30 de zile). Conversia sesiune → plată e 7%; jumătate din sesiuni pleacă la pașii 2–3.
- **eghiseul:** venit plat pe 30 de zile (31,3k vs 31,7k), cu 21% mai puține comenzi; valoarea medie urcă (262 → 329 lei) datorită stării civile. Pierde volum la extras CF (42 → 30) și constatator (18 → 11).
- **documentero:** 0 vânzări de la lansare, 5 drafturi în 14 zile. **ecazier:** o comandă pe lună.
- Weekendurile sunt aproape zero pe toate platformele.
- **CJO ONLINE10** (−10%) e pe 77 din 80 de comenzi în 30 de zile: reducerea se dă practic tuturor.

## Trafic organic (GSC)

| Site | 7 zile vs 7 anterioare | Observație |
|---|---|---|
| eghiseul | 4.247 vs 4.013 clicuri (+6%) | ~590 clicuri/zi, −77% față de iulie–august; stabil din 24.08, fără revenire |
| CJO | 2.802 vs 3.006 (−7%) | poziții la fel (~5), deci scade CTR-ul; vinerea și weekendul cad puternic |
| documentero | 20 vs 2 clicuri | poziția medie 13,3 → 8,7, urcă |
| ecazier | 10 vs 8 | practic nimic |

- Pe eghiseul, **calculatoarele aduc ~80% din clicuri**; clusterul /servicii/ stă la ~850 de afișări pe săptămână de 7 săptămâni (−97%), deci încă nu revine.
- Pierderi mari: calculatorul de vârstă de pensionare (−66%), „ANCPI nu funcționează” (cererea a dispărut), verificare rovinietă (−74%, dar urcă din nou de pe 05.10).
- Quick-wins: „dividende 2026” (poz. 5,8, 377 afișări), „ghișeul.ro cazier” (poz. 7,3, CTR ~0 pe prima pagină), „cazier auto” (poz. 11), „plafon cass”, „calculator concedii medicale 2026”.

## Email și telefon (30 de zile)

| Canal | Trimise / apeluri | Plătite / lei |
|---|---|---|
| Telefon eghiseul | 81 apeluri | **7 / 5.473** (~18% din venit) |
| Telefon CJO (din 12.10) | 53 | 1 / 198 (prea devreme) |
| Recuperare email pas 1 | 144 | **13 / 4.747** |
| Recuperare email pas 2 | 129 | 4 / 3.183 |
| Recuperare email pas 3 | 115 | **0** |
| Lifecycle (recenzie, expirare, cross-sell) | 628 | 26 / 3.728 |
| B10 eghiseul (din 13.10) | 105 | 1 / 1.547 |
| **B9 CJO** | **500 (plafon)** | **0** |
| Warm-up | 4.000 | 14 / 2.601 (doar foști clienți) |

- Cupoanele TEL- și RECOVERY- nu le folosește nimeni: reducerea nu e motivul plății.
- Warm-up: suprimări sub 2% de 3 zile; rămâne la 300/zi până la subdomeniu (B7).
- Atribuirea prin UTM subnumără lifecycle-ul (1 comandă prin UTM vs 26 prin email); ruta KPI numără B10 ca „pasul 3”.
- Newsletterul pierde sursa principală (popup-ul de pe calculatoare a fost scos azi).

## Ce facem (propunere)

1. **CJO, conversia înainte de trafic:** 411 sesiuni pentru 30 de plăți; pașii 2–3 pierd jumătate. Testăm formularul pe telefon și decidem titlurile pe 19.10 (regula de 14 zile).
2. **CJO ONLINE10:** de verificat de unde vine (banner/afișat tuturor?) și dacă îl oprim: costă ~10% din venitul CJO.
3. **Oprim B9 pe CJO** (0 din 500) și **pasul 3 de recuperare** pe eghiseul (0 din 115) sau îl rescriem fără cupon.
4. **Telefon:** sunat în primele 24 de ore, comenzile mari întâi, fără cupon din oficiu; comparăm Maria/Carla pe 21.10.
5. **Trafic eghiseul:** titluri/descrieri „2026” pe dividende, concediu medical, CASS; snippet și link clar spre cazier pe prima pagină; cardurile de servicii de pe calculatoare (puse azi) se măsoară în /admin/marketing din 21.10.
6. **Canal plătit netestat:** Microsoft Ads pe caziere (Bing aduce deja cât Google organic pe caziere; Google e blocat).
7. **documentero:** 1–2 ghiduri pe săptămână pe tiparul „certificat de naștere vechi tipizat” (poz. 4,2) + linkuri din eghiseul și CJO.
8. **Măsurare:** ruta KPI pe potrivire după email și B10 separat; GA4 de conectat la scriptul de raportare.
