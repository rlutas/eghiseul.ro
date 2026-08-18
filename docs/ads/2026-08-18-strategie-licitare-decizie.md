# De ce plafonăm CPC-ul la pornire (și când îl scoatem)

Întrebare pusă înainte de publicare: nu e mai bine să lăsăm licitarea liberă, fără plafon de CPC și
fără CPA țintă, cum recomandă Google?

## Ce spun sursele

**Google, despre Target CPA:** setarea unor limite de sumă licitată **nu e recomandată** — restricționează
optimizarea automată și împiedică algoritmul să ajusteze licitarea ca să atingă CPA-ul țintă.
([Google Ads Help](https://support.google.com/google-ads/answer/6268632?hl=en))

**Google, despre Maximize clicks:** aici limita de CPC maxim este un control **prevăzut explicit** —
„vă permite să stabiliți plafonul sumei pe care sunteți dispus să o plătiți pentru fiecare clic".
([Google Ads Help](https://support.google.com/google-ads/answer/6268626?hl=en))

Deci cele două afirmații nu se contrazic: plafonul e nerecomandat **pe Smart Bidding**, dar e unealta
normală **pe Maximize Clicks**.

**Practica din piață (US/UK):**
- campanie nouă, fără istoric de conversii → Max Clicks cu plafon 2–4 săptămâni, aduni date, apoi
  treci pe strategie bazată pe conversii ([mbadv](https://www.mbadv.agency/google-ads/bidding-strategies),
  [Allable](https://www.allable.ai/blog/google-ads-bidding-strategies/));
- Smart Bidding bate licitarea manuală **de la ~30 de conversii/lună în sus**; sub pragul ăsta,
  pornești manual/Max Clicks ([groas.ai](https://groas.ai/post/google-ads-bidding-strategies-2026-target-cpa-vs-target-roas-vs-max-conversions),
  [Store Growers](https://www.storegrowers.com/google-ads-bid-strategy/));
- tCPA/tROAS au sens de la 30–50 conversii/30 zile la nivel de campanie; calibrarea completă ia
  60–90 de zile ([Modern Marketing Institute](https://www.modernmarketinginstitute.com/blog/how-to-build-a-profitable-google-ads-campaign-from-zero-a-2026-blueprint));
- unii practicieni folosesc plafonul ca „centură de siguranță" în primele săptămâni, apoi îl relaxează
  ([KlientBoost](https://www.klientboost.com/google/hybrid-bidding/)).

## De ce, la noi, plafonul rămâne la pornire

1. **N-avem date de conversie recente.** Contul are 31.000 de conversii istorice, dar acțiunea
   `Purchase` e moartă din iulie 2026 (reparată azi, încă neverificată). Smart Bidding ar optimiza
   pe zero semnal.
2. **Marja nu iartă.** Constatator: 89 lei − 35 taxă ONRC ≈ **55 lei marjă** ⇒ CPA maxim sănătos 24 lei.
   Max Clicks fără plafon cheltuie bugetul cumpărând clicuri cât de scumpe e nevoie; pe termenii ăștia
   CPC-ul de piață e 8,5–9,1 lei, deci am garanta pierdere pe fiecare comandă.
3. **Volumul e mic oricum.** Estimarea Google pentru grupul nostru: 23 clicuri/săptămână. Ca să
   strângem 30 de conversii ne trebuie ~6–8 săptămâni. Până atunci n-avem ce da algoritmului.

## Planul de licitare, pe etape

| Etapă | Când | Strategie | Plafon |
|---|---|---|---|
| 1. Colectare | acum → 30 conversii `Purchase` | Maximize Clicks | **CPC max 6 lei** |
| 2. Tranziție | la 15–30 conversii | Maximize Conversions (fără țintă) | fără plafon, buget neschimbat |
| 3. Eficiență | ≥30 conversii/30 zile | Target CPA | **fără plafon** (recomandarea Google) |

Prag de oprire pe toată durata: dacă după 15 conversii CPA depășește **35 lei**, oprim grupul de
anunțuri, nu „mai dăm o șansă".

## Nuanța pe produs

Pe **constatatorul de bază** marja pur și simplu nu suportă CPC-ul de piață — de aceea grupul ăsta
rămâne cu plafon și volum mic. Pârghia reală e grupul **„cu istoric"** (produs de ~400 lei la
concurență): acolo un CPC de 9–12 lei e perfect suportabil și acolo putem lăsa licitarea liberă mai
devreme. Îl construim ca al doilea grup, imediat după ce primul trece de review.
