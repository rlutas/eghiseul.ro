# 02.11.2026 — Numele din act nu mai primește litere în plus în față
<!-- categorie: clienti -->

## Pentru echipă

- Când clientul scanează buletinul vechi sau pașaportul electronic, numele de familie nu mai iese cu litere lipite în față (de exemplu „IDRO…” sau un „U” în plus).
- Erau două situații: la buletinul vechi, citirea sărea o literă din codul de pe banda de jos a actului; la pașaportul electronic, codul de țară era tăiat pe jumătate. Pe CJO și ecazier pașaportul era deja corect, iar buletinul e reparat acum.
- Verificați în continuare numele cu actul înainte de documente, mai ales la pașapoarte.

Raportat din Ghid pe E-260929-8X5K9 (30.09) și E-261021-SSSLZ (22.10).

---

## Tehnic

- `recoverNamesFromMrz()` în `src/lib/services/document-ocr.ts`: `IDRO` + literă ≠ U → taie 4 caractere (U sărit de OCR din `IDROU`); `P[<A-Z]ROU` → taie 5 (pașaport electronic RO, tip „PE"). Regula generică `P<?[A-Z]{3}` tăia `PERO` și lăsa `U` lipit de nume.
- CJO (`cazierjudiciaronline.com`): `MRZ_LINE_PREFIX` primește `IDRO(?!U)`; `PEROU` era tratat acolo de la 06.08.
- Teste: `document-ocr-passport-name-prefix.test.ts` pe ambele repo-uri (nume inventate).
