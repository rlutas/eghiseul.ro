# 02.11.2026 — Împuternicirea pentru apostila Haga la stare civilă, după modelul echipei
<!-- categorie: documente -->

## Pentru echipă

- La certificatele de naștere, căsătorie și celibat, împuternicirea pentru **apostila de la Haga** iese acum ca la caziere: antet UNBR / Baroul Satu Mare, „Seria SM Nr. …”, „să se prezinte la Instituția Prefectului — județul Satu Mare, în vederea aplicării Apostilei de la Haga pe Certificat de …”. Fără filiație, fără stare civilă, fără „Oficiul de Stare Civilă”.
- Datele de pe împuternicire rămân ca până acum: ziua în care apăsați „Generează”.
- Pentru comenzile deja în lucru: apăsați din nou „Generează” pe împuternicirea de apostilă. Numărul de delegație rămâne același.

Raportat din Ghid pe E-260825-W5B63, E-261012-PK767 și E-261016-852AR.

---

## Tehnic

- `resolveTemplateSlug()` în `src/lib/documents/generator.ts`: `imputernicire` + serviciu de stare civilă (`CIVIL_STATUS_DOCUMENT_MAP`) + delegație `apostila_haga` (directă sau `bundled:`) → `src/templates/shared/imputernicire.docx`. Textul vine din `buildInstitutie()` (deja acoperea apostila cu `appliesToDocument`).
- Datele (`{{DATA}}`, `{{DATAGENERAT}}`) rămân data generării — decizie Raul 02.11.2026: pe documente contează ziua generării, nu data contractului sau a comenzii.
- Teste: `tests/unit/lib/documents/generator.test.ts` (alegerea șablonului).
