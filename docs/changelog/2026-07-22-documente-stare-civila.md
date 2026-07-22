# 2026-07-22 — Documente stare civilă: împuternicire UNBR + cereri multilingv

## Împuternicire avocațială (LIVE — a242e26 + fc4d620 lanț)
Cele 5 servicii stare civilă (naștere/căsătorie/celibat/multilingv ×2) generează
împuternicirea pe template-ul FINAL al lui Raul (model UNBR Anexa II, logo,
albastru) — byte-identic instalat pe fiecare slug. Restul serviciilor = shared.
⚠️ Semantica tag-urilor e remapată pe layoutul lui (FILIATIE=stare civilă,
NUMETATA=filiația întreagă) — vezi comentariul din generator.ts.

## Cerere extras multilingv NAȘTERE (LIVE — 679c281)
Template Anexa 4 al lui Raul („Domnule Primar", datele avocatului fixe) instalat
la extras-multilingv-certificat-nastere/cerere-eliberare-pf.docx. Tag-uri:
{{TIP ACT}} (+alias TIP_ACT), {{CLIENT}}, {{DATA_NASTERI}} (+alias, fallback
CNP), {{LOC_NASTERE}} (curățat prefixe), {{JUDET_NASTERE}} (fallback cod CNP),
{{DATAGENERAT}}.

## Cerere extras multilingv CĂSĂTORIE (LIVE — 6ab32c0)
Template separat al lui Raul (linia 2 diferită): {{SOTI}} (client + soț/soție,
un singur tag pt ambele cazuri), {{DATA_CASATORIEI}}, {{LOC/JUDET_CASATORIE}}
din registrationPlace. Se instalează la extras-multilingv-certificat-casatorie.

## Cereri CELIBAT — Anexa 9, DOUĂ variante (LIVE)
Template-urile lui Raul instalate la certificat-celibat: varianta „căsătorie în
străinătate" (cerere-eliberare-pf.docx: SOT_VIITOR/CETATENIE_SOT/TARA_CASATORIE
din futureSpouseName/nationality/countryOfUse) și varianta „alte situații"
(cerere-eliberare-pf-alt-motiv.docx: MOTIV_CELIBAT din purpose). Selecția
automată în generator (resolveTemplateName pe marriageAbroadIntent; default =
alt-motiv). Reparat la instalare: DATAGENERAT lipsea din T2 (puncte în loc de
tag). Notă: countryOfUse există în formular abia din 16.07 — comenzile mai vechi
vor avea țara goală. A treia grafie de dată (DATA_NASTERE) = alias nou.

## URMEAZĂ
- Raul livrează încă 2 formulare: cereri NAȘTERE și CĂSĂTORIE clasice.
- Decizii deschise: câmp „stare civilă" în wizard la naștere/căsătorie/multilingv
  (azi doar celibat); semnăturile ca imagini pe împuternicirea nouă (template-ul
  n-are tag-urile).
