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

## Cerere certificat NAȘTERE (LIVE — 4ef2dae)
Anexa 59 a lui Raul, byte-identic la certificat-nastere. Tag nou NUME_NASTERE
(birthName din formular); JUDET_NASTERE preferat din registrationPlace la acest
slug; TIP ACT extins pe serviciile clasice.

## Cerere certificat CĂSĂTORIE (LIVE)
Template-ul lui Raul byte-identic la certificat-casatorie. Tag nou SOT (doar
numele soțului — spouseNameBeforeMarriage, confirmat pe comenzi reale);
DATA/LOC/JUDET_CASATORIE refolosite; TIP ACT=căsătorie. Rândul nașterii lăsat
cu puncte (intenționat, fără tag-uri).

## BILANȚ: stare civilă COMPLETĂ pe modelele lui Raul
Împuternicire UNBR ×5 + cereri: multilingv naștere, multilingv căsătorie,
celibat ×2 (selecție automată pe scop), naștere (Anexa 59), căsătorie.

## URMEAZĂ
- Cereri MULTI-SERVICIU: comenzile combinate (ex. naștere + extras multilingv
  sau + celibat ca serviciu suplimentar) trebuie să genereze cererea fiecărui
  serviciu din comandă, ca la împuterniciri (computeDelegationItems) — cerință
  Raul 22.07, în lucru.
- Decizii deschise: câmp „stare civilă" în wizard la naștere/căsătorie/multilingv
  (azi doar celibat); semnăturile ca imagini pe împuternicirea nouă (template-ul
  n-are tag-urile).

## CUM FUNCȚIONEAZĂ (pentru echipă)
**Generarea e MANUALĂ, din admin** — nu la plasarea comenzii:
1. Admin → comanda → „Documente generate" → butonul **Generează** la Împuternicire
   / Cerere eliberare PF. (La submit se generează automat DOAR contractele —
   prestări + asistență; împuternicirea cere numărul Barou, alocat DOAR pe
   comenzi plătite.)
2. **Automată e SELECȚIA**: sistemul alege singur template-ul corect după
   serviciu (naștere→Anexa 59, căsătorie→a lui, multilingv→ale lui) și după
   date (celibat: scop căsătorie în străinătate → varianta 1, altfel varianta 2
   cu motivul clientului). Câmpurile se completează singure din comandă
   (client, filiație, date naștere/căsătorie, soț, țară, motiv).
3. **Comenzi cu servicii EXTRA** (naștere + multilingv/celibat): în lucru —
   câte un rând de cerere per serviciu în admin (ca la împuterniciri), fiecare
   generat cu template-ul + datele serviciului lui. Tot manual, per buton.
4. Regenerarea suprascrie documentul aceluiași serviciu (numerele din registru
   se refolosesc — nu se consumă numere noi).
