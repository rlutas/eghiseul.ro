# Roadmap servicii pe ChatGPT Ads

Ordinea e dată de **politica OpenAI** (legal services interzis în afara US), nu de marjă.

| # | Serviciu | Blocaj | Ce trebuie ca să intre |
|---|---|---|---|
| 1 | Certificat constatator | — | în test (04) |
| 2 | Rovinietă | landing de auditat pe checklistul din 03 | audit + anunț; marjă mică → doar Clicks cu bid mic; produs „consumer", cel mai sigur pe politică |
| 3 | Cazier fiscal | avocat în flux (`LAWYER_SERVICE_SLUGS`) + pagina spune „avocatul colaborator depune cererea la ANAF" | decizie cu avocata: se poate depune fără avocat (împuternicire simplă / SPV client)? Dacă da: scoatem din listă + rescriem pagina. Dacă nu: rămâne blocat |
| 4 | Stare civilă (naștere / căsătorie / celibat / multilingv) | avocat în flux + contract asistență juridică semnat în wizard | idem 3 — dar aici avocatul e chiar mecanismul (procură), greu de scos |
| 5 | Cazier judiciar / auto / integritate | avocat în flux; „document preparation" la propriu | practic blocat; nu încercăm din contul firmei |
| — | ANCPI / topograf | nu livrăm (ePay picat) | nu se face reclamă |

## Ce NU facem

- Landing „curat" pentru un serviciu care în flux semnează contract de asistență juridică: reviewul citește
  landingul, dar politica „Destination integrity / truthful identity" + un ban pe firmă nu merită.
- Cont separat / domeniu separat ca să ocolim: „Abuse of OpenAI Ads: attempt to circumvent our policies" =
  suspendare.

## Ce urmărim

- Changelog-ul politicii (https://openai.com/policies/ad-policies/, secțiunea Changelog): dacă „legal
  services" se deschide în UE (cum s-a deschis în US în v1.5), serviciile cu avocat devin eligibile **cu
  dovada licenței** — și atunci modelul infocazier (cabinet de avocat) funcționează și aici.
