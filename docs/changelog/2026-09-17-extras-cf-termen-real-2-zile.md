# 17.09.2026 — Pagina de extras de carte funciară spune acum termenul adevărat
<!-- categorie: clienti -->

## Pentru echipă

Pagina de vânzare a extrasului de carte funciară promitea clientului documentul „în câteva
minute, automat, 24/7". Nu mai e adevărat de când robotul ANCPI s-a oprit, adică din 20 august.

De azi pagina spune ce faceți voi de fapt: documentul ajunge pe email **de regulă în aceeași zi
lucrătoare, în maximum 2 zile lucrătoare**. Același lucru scrie și în formularul de comandă,
deci acum toate ecranele spun la fel.

Ce înseamnă pentru voi la telefon: **nu promiteți minute**. Promiteți aceeași zi lucrătoare, cu
maximum două zile ca limită. Dacă un client a comandat noaptea sau în weekend, cererea pleacă
la OCPI în prima zi lucrătoare.

Am scos și trimiterea către pagina unde clientul își verifica singur documentul. Adresa aceea
nu mai există, deci îi trimiteam degeaba.

---

## Ce s-a schimbat

Nouăsprezece locuri pe `/servicii/extras-de-carte-funciara/`:

| Unde | Înainte | Acum |
|---|---|---|
| Titlul paginii | „Online în 5 Minute — Automat, 24/7" | „pe Email în Max. 2 Zile Lucrătoare" |
| Erou | „în câteva minute, automat, 24/7" | „de obicei în aceeași zi lucrătoare, garantat în maximum 2" |
| Statistica din antet | „Câteva minute / Eliberare automată 24/7" | „Max. 2 zile / Zile lucrătoare, de regulă mai repede" |
| FAQ noapte și weekend | „eliberează automat, 24/7" | comanda se plasează oricând, cererea se depune în prima zi lucrătoare |
| FAQ alt județ | „**Eliberăm** extrase" | „**Obținem** extrase" |
| Card de verificare | „verifică autenticitatea pe portalul ANCPI (epay.ancpi.ro)" | fără domeniul mort |

Plus meta description, descrierea din date structurate, lista de pași din erou, cardul de
livrare, secțiunea despre urgență, comparativul cu alți operatori și încă două întrebări.

## De ce acum

Baza de date spunea deja adevărul: `services.estimated_days = 2` și
`estimated_days_display = "2 zile lucrătoare"`. Doar pagina de marketing rămăsese în urmă, ceea
ce însemna că formularul de comandă și pagina de vânzare se contraziceau.

A ieșit la iveală pregătind o campanie plătită: promisiunea de minute intra sub regula OpenAI
„Misleading or deceptive ads: unfounded claims about outcomes", iar reviewul lor citește pagina
de destinație, nu doar anunțul. Contextul complet, inclusiv de ce robotul nu se poate repara,
e în intrarea despre automatizarea ANCPI din aceeași zi.

## Rămas de făcut

Pagina de serviciu și `/extras-carte-funciara-gratuit/` mai descriu varianta gratuită „prin
platforma MyeTerra (myeterra.ancpi.ro)". Domeniul nu mai există în DNS, deci recomandăm o
alternativă care nu mai e accesibilă. De curățat separat.
