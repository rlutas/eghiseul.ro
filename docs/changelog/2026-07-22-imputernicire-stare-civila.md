# 2026-07-22 — Împuternicire avocațială dedicată serviciilor de stare civilă

## Ce s-a livrat
Serviciile de stare civilă (certificat-nastere, certificat-casatorie,
certificat-celibat, extras-multilingv-certificat-nastere/casatorie) generează
acum împuternicirea pe modelul oficial UNBR Anexa II, pe template-ul FINAL
stilizat de Raul (logo UNBR, albastru subliniat) — instalat identic în
`src/templates/<slug>/imputernicire.docx` pe cele 5 slug-uri. Restul
serviciilor rămân pe `shared/imputernicire.docx` (mecanismul de fallback
per-serviciu din `loadTemplate`).

## Completare automată (generator.ts)
- avocat/cabinet din `admin_settings.lawyer_data`
- rândul 1: doar numele clientului (`CLIENT_STARE_CIVILA` = nume simplu)
- rândul 2: filiația întreagă „fiul/fiica lui X și Y" (livrată prin `NUMETATA`;
  `NUMEMAMA` gol — tag-urile stau adiacente în template)
- „status civil:" = eticheta stării civile acordată pe gen din CNP (`FILIATIE`)
- nr. contract asistență + data (cross-ref registru central) + seria SM +
  nr. delegație din registru + activitatea per serviciu + „OFICIUL DE STARE
  CIVILĂ SATU MARE"

⚠️ Semantica tag-urilor e REMAPATĂ pe layoutul lui Raul (numele tag-ului ≠
conținut: FILIATIE poartă starea civilă, NUMETATA poartă filiația). Vezi
comentariul din generator.ts înainte de orice modificare.

## Rămase deschise (decizie Raul)
- Câmpul „stare civilă" în wizard există DOAR la celibat — la celelalte 4
  servicii eticheta lipsește din document până se adaugă câmpul (migrare config).
- Template-ul NU are tag-uri de semnătură → semnăturile desenate NU se
  injectează ca imagini (rămân liniile de semnat fizic). Intenționat?
- Text în template: „stare status civil:" (dublat, fără spațiu) — de confirmat.
