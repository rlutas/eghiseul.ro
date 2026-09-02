# Evaluare + plan de test (02.09.2026)

Contextul: Google Ads blocat (vezi `../2026-09-01-suport-google-escaladare.md`), organic anihilat din 20.08.
Întrebarea lui Raul: testăm ChatGPT Ads acum că s-a deschis pe România? **Da, dar doar pe serviciile fără
avocat în flux, și primul e certificatul constatator.**

## Verdict: politica OpenAI e INVERSUL politicii Google

| | Google Ads | OpenAI Ads |
|---|---|---|
| Ce ne blochează | „documente guvernamentale și servicii oficiale" — intermediarii privați nu se pot certifica | „legal services" incl. **document preparation** — interzis în afara US |
| Ce ne-ar salva | modelul infocazier: cabinet de avocat + „asistență juridică" | poziționare **serviciu digital privat** (formular → plată → document pe email) |
| Categorie „documente de stat" | există, ne omoară | **nu există** |

Umbrela de avocat care ne salvează la Google ne îngroapă aici. Aceeași firmă, două playbook-uri opuse —
nu le amesteca.

## Servicii eligibile (după politica OpenAI)

| Serviciu | Avocat în flux? | Landing curat? | Verdict |
|---|---|---|---|
| **Certificat constatator** (ONRC) | NU — flux automat prin API | da, după fixurile din 03 | **primul test** |
| Rovinietă | NU — produs | de auditat | candidat #2 (marjă mică, dar volum) |
| Cazier fiscal | DA (`LAWYER_SERVICE_SLUGS`) și pagina o spune | nu | blocat: legal services |
| Cazier judiciar / auto / integritate | DA | nu | blocat |
| Stare civilă (naștere/căsătorie/celibat/multilingv) | DA | nu | blocat |
| ANCPI / topograf | — | — | NU (nu livrăm; regula fixă nr. 5 din `../README.md`) |

Deblocarea celorlalte = decizie de business cu avocata (flux fără contract de asistență juridică pe anumite
servicii), nu un truc de copy. Vezi 05.

## Aritmetica (constatator de bază, din analiza 18.08)

- ⚠️ Corectat 02.09 seara (Raul): **89 lei include TVA 21 %** → net 73,55 − taxă ONRC ~30 − procesare ~3 = **~40 lei brut** înainte de impozit și cheltuieli. Analiza din 18.08 (marjă 55–60) nu scăzuse TVA-ul.
- CPA sănătos = **≤ 15 lei**; tolerabil doar pe B2B recurent = ≤ 25; **> 40 lei = pierdere pe comandă**.
- CPC „recomandat" OpenAI 3–5 $ ≈ 14–23 RON → la 25 % conversie click→plată CPA = 56–92 lei = pierdere.
- De aceea **licităm noi**: max CPC ~1,2 $ (≈5,5 RON), ca în planul Google (plafon 6 lei). La 5,5 RON și
  20–25 % conversie ⇒ CPA 22–28 lei. Dacă la bidul ăsta nu livrează, aflăm rapid (3 zile fără afișări).
- Intenția pe ChatGPT e mai sus în pâlnie decât pe Search („cum obțin…", „ce acte cere banca") → conversia
  realistă poate fi 10–15 %, nu 20–25. Testul măsoară exact asta.
- **Istoricul (487 lei)** are marjă mult mai mare → ad group separat; acolo suportăm CPC de 3 $.

Referință volum: ultimele 60 zile, constatator: 55 comenzi finalizate, 24 drafturi, 11 abandonate (DB, 02.09).

## Planul de test (14 zile)

1. **Cont** — Raul, manual: ads.openai.com, EDIGITALIZARE SRL, site eghiseul.ro, categorie servicii
   digitale/online (nu legal). Card + date firmă le introduce Raul.
2. **Landing** — făcut 02.09 (vezi 03). De pus în producție înainte de primul anunț (reviewul citește pagina live).
3. **Campanie** — `OAI_Click_Constatator_2026-09`, obiectiv Clicks, geo România, 3 ad groups (firmă,
   istoric, scop bancă/licitație), buget 100 RON/zi, max CPC 1,2 $ (istoric 3 $). Tot conținutul în 04.
4. **Măsurare** — `orders.attribution` cu `utm_source=chatgpt` (SQL în 04) + GA4. Fără pixel în runda 1.
5. **Decizie la ziua 14** — CPA pe comenzi plătite:
   - ≤ 15 lei → scalăm (buget ×2, adăugăm rovinieta)
   - 15–25 lei → continuăm doar dacă apar clienți recurenți (notari/contabili) sau istoric
   - > 25 lei sau 0 conversii la ≥ 150 clicuri → oprim de bază, păstrăm istoric 7 zile, apoi concluzie

## Riscuri

- Reviewul LLM poate clasifica „certificat constatator" ca *document preparation* chiar fără cuvântul
  „juridic". Dacă pică: contestație cu argumentul „serviciu digital de intermediere, fără consultanță
  juridică; politica nu listează documentele publice" + trimitere la disclaimer.
- Volum necunoscut de conversații RO pe Free/Go despre constatator. Buget necheltuit = informație.
- Bugetul e pe firmă; **nu** testăm pagini cu avocat din contul ăsta ca „să vedem".
