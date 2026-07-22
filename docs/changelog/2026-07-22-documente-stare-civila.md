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

## Cerere extras multilingv CĂSĂTORIE (ÎN LUCRU — agent rulează)
Template separat al lui Raul (linia 2 diferită): {{SOTI}} (client + soț/soție,
un singur tag pt ambele cazuri), {{DATA_CASATORIEI}}, {{LOC/JUDET_CASATORIE}}
din registrationPlace. Se instalează la extras-multilingv-certificat-casatorie.

## URMEAZĂ
- Celibat — cererea pe ANEXA 9 (model de la Raul).
- Cereri naștere/căsătorie clasice (non-multilingv) — de clarificat cu Raul
  dacă au și ele modele dedicate.
- Decizii deschise: câmp „stare civilă" în wizard la naștere/căsătorie/multilingv
  (azi doar celibat); semnăturile ca imagini pe împuternicirea nouă (template-ul
  n-are tag-urile).
