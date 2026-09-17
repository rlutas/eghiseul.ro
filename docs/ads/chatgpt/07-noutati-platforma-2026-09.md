# Noutăți OpenAI Ads, septembrie 2026 — ce se aplică la noi

Sursa: newsletterul pentru advertiseri primit pe 17.09.2026. Mai jos, fiecare
noutate cu verdictul pentru contul EDIGITALIZARE SRL.

| Noutate | Ce e | Verdict pentru noi |
|---|---|---|
| **Conversion optimization with impression billing** | tip nou de campanie, general available: optimizează pentru conversii venite și din clicuri și din afișări, iar facturarea e pe afișări. OpenAI îl recomandă ca model implicit | **Nu acum.** Optimizarea pe conversii are nevoie de semnal, iar noi avem 0 conversii înregistrate. Plata pe afișări la 1.041 afișări și 23 de clicuri ar însemna să plătim tot inventarul fără nicio dovadă că se convertește. Se reevaluează după prima comandă atribuită. |
| **Flexible attribution windows** | în Ads Manager se alege fereastra de clic (7 / 14 / 30 zile) și de vizualizare (0 / 1 zi) pentru coloanele de conversii | **Da, de setat: 30 zile clic, 0 zile view.** Evenimentul nostru e deja configurat pe 30 de zile la clic, deci coloanele trebuie să spună același lucru. View 0 pentru că nu credem în conversii din simplă afișare la volumul ăsta. |
| **Granular platform targeting** | targetare separată pe Android app, Android web, desktop web, iOS app, iOS web, plus segmentare a rezultatelor | **Util ca raport, nu ca filtru.** Întâi segmentăm cele 23 de clicuri pe platformă. Dacă tot traficul e din aplicația mobilă, asta explică zero comenzi începute: wizardul cu încărcare de documente e greu pe mobil în browser in-app. |
| **Shopify integration** | app în Shopify App Store, momentan doar pentru comercianți din SUA | Nu ne privește, nu suntem pe Shopify. |
| **HubSpot integration** | conectare cont, creare anunțuri și urmărire lead-uri din HubSpot | Nu ne privește, nu folosim HubSpot. |
| **AI-assisted ad creation** | sugestii de text și imagine generate din pagina de destinație și obiectivul campaniei, editabile înainte de salvare | ⚠️ **De folosit doar cu revizuire cuvânt cu cuvânt.** Sugestiile se scriu citind landingul, iar landingul nostru conține termeni care pe OpenAI sunt periculoși. Regulile din `README.md` (zero „avocat/juridic", zero „oficial" lângă „document") rămân valabile pentru orice text sugerat de platformă. |
| **Text customization** | platforma adaptează titlurile și descrierile la contextul conversației și le poate traduce în limba utilizatorului | **Rămâne Off**, cum e din 02.09. Un text rescris automat nu mai trece prin regulile noastre de conformitate și poate reintroduce exact cuvintele interzise. |
| **Event Quality Score** | scor 1–10 pentru sursele de date Pixel și Conversions API, sub Tools → Conversions, cu recomandări | **Da, de urmărit.** La 17.09 scorul e încă `—` pentru `eghiseul.ro web`. Se aprinde probabil după mai multe evenimente; când apare, e cel mai ieftin indicator dacă trimitem destul context de utilizator. |
| **Sponsored Agents** | după clic pe anunț, utilizatorul poate deschide o conversație etichetată cu un agent al advertiserului; în test, doar SUA | Nu e disponibil în UE. De urmărit, pentru că pe termen lung un agent care răspunde la „ce acte îmi trebuie" e chiar produsul nostru. |

## Ordinea în care le atingem

1. `oppref={oppref}` în Tracking parameters (vezi jurnalul din `04`) — fără el nimic nu se atribuie.
2. Fereastra de atribuire pe 30 de zile clic / 0 view.
3. Segmentarea celor 23 de clicuri pe platformă.
4. Abia apoi AG2 „cu istoric".

Nimic din listă nu justifică trecerea pe facturare la afișare cât timp contorul de conversii e 0.
