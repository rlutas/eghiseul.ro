# Calculator Formulas — Referință 2026 (verificat)

Sursă: research 2026-06-21 (ANAF, CNPP, legislatie.just.ro, Cod Fiscal). Folosit pentru calculatoarele din `/calculator/*`. **Verifică flag-urile ⚠️ înainte de lansare.**

## ⚠️ Schimbări critice 2026 (nu folosi valori vechi nicăieri)
- **TVA standard = 21%** (de la 1 aug 2025, era 19%). Redus = **11%** (unic, a înlocuit 5%/9%). 9% tranzitoriu doar la locuințe până la 31 iul 2026.
- **Impozit auto reformat** (Legea 239/2025 + OUG 78/2025): depinde de cmc **ȘI** norma Euro. Tabelul vechi pe cmc e GREȘIT.
- **Salariu min brut** crește la mijloc de an: 4.050 lei (ian-iun) → 4.325 lei (iul-dec) 2026.
- **Pensionare:** femeile NU se opresc la 63 → 65 pentru ambele sexe din ian 2035.
- **Regimuri speciale eliminate** (IT/construcții/agricultură) din 2025 — toți la 25/10/10.

## 1. Salariu net/brut
- CAS 25%, CASS 10% din (brut − scutire); impozit 10% din (brut − CAS − CASS − deducere − scutire). CAM 2.25% (doar angajator).
- Constante S1 2026: min 4.050, scutire 300 (dacă brut ≤4.300). S2: min 4.325, scutire 200 (≤4.600).
- Deducere personală: doar dacă brut ≤ min+2.000; % din min (0 pers=20%, 1=25%, 2=30%, 3=35%, 4+=45%), scade 0.5pp/50 lei peste min, floor 0. Sub-26 +15% min; +100 lei/copil în învățământ.
- brut→net: net = brut − CAS − CASS − impozit (rotunjire la leu pe componentă).
- net→brut: fără formulă închisă → bisecție [net, net/0.55], ~40 iterații.
- Test S1 min, 0 pers, cu scutire: CAS 938, CASS 375, deducere 810, impozit 163 → **net 2.574**.

## 2. Impozit auto (Art. 470, reformat 2026)
- `impozit = ceil(cmc/200) × rate[bracket][euro]`. Tabel autoturisme (lei/200cmc): vezi research (≤1600: 19.5/18.8/17.6/16.5; 1601-2000: 29.7/28.5/26.7/25.1; 2001-2600: 92.2/88.6/82.8/77.8; 2601-3000: 182.9/172.8/154.1/151.2; >3001: 319/297.3/294.4/290).
- Electric = 40 lei/an flat. Hibrid ≤50g CO₂ → până la −30% (consiliu local). Cotă adițională municipală 0-50%.
- ⚠️ **Verifică celulele zecimale** vs Art. 470 consolidat + un HCL 2026 înainte de lansare. Pagina e orientativă (variază pe primărie).

## 3. Vârstă pensionare (Legea 360/2023)
- Bărbați: 65 flat (stagiu complet 35, minim 15).
- Femei: 62a3l (sep 2024) → 65 (ian 2035), +1 lună/6 luni calendaristice. Ian 2026 = 62a6l; 63 în ian 2030.
- Stagiu minim 15 (ambii). Complet: bărbați 35; femei cresc la 35 până ian 2030 (ian 2026 = 33a3l).
- Reducere mame (copii crescuți până la 16) — vezi Anexa 5. ⚠️ Oracol de test: calculatorul oficial CNPP (cnpp.ro/varsta-pensionare).

## 4. Indemnizație creștere copil (OUG 111/2010)
- ICC = 85% din media venitului NET (12 luni din 24 înainte de naștere). Min **1.650** (2.5×ISR 660), max **8.500**. CASS 10% reținut din 1 aug 2025 (8.500 brut → 7.650 net).
- Stimulent inserție: 1.500 lei (venit înainte de 6 luni copil) / 650 lei (după).

## 5. TVA
- Standard 21%, redus 11%, 9% locuințe până 31 iul 2026.
- Adaugă: gross = net×(1+r). Extrage: net = gross/(1+r); TVA = gross×r/(1+r). Factor 21%: ×21/121.

## 6. Procente
- X% din Y = Y×X/100; cât % = X/Y×100; variație = (final−inițial)/inițial×100.

## Status build calculatoare
| Slug | Status |
|---|---|
| calculator-procente | ✅ live |
| tva | ✅ live |
| salariu | ✅ live |
| calculator-impozit-auto | ⬜ (verifică tabel) |
| varsta-pensionare | ⬜ |
| calculator-indemnizatie-crestere-copil | ⬜ |
| pensie-invaliditate, termene-judiciare, reabilitare, taxa-judiciara-de-timbru | ⬜ |
