# 02.11.2026 — Contractele de asistență au seria SM, ca delegațiile
<!-- categorie: documente -->

## Pentru echipă

- Contractul de asistență juridică dintre avocată și client scrie acum numărul cu serie: **Nr. SM021651**, nu doar 021651. Apare în titlu și în fraza „Contractul a fost înregistrat sub nr. …".
- Se aplică la contractele generate de acum înainte. Contractele vechi rămân cum au fost; dacă aveți nevoie de unul refăcut, regenerați-l din comandă.
- În Registru, contractele apar tot cu SM în față, la fel ca delegațiile (coloane, meniuri, mesajul după alocare).
- La „Adaugă interval" puteți scrie numerele cu 0 în față (de exemplu 021651). Până acum zeroul dispărea când îl tastați.
- Împuternicirea nu se schimbă: acolo scria deja „serie SM nr. …".
- Pe cazierjudiciaronline contractul avea deja seria SM.

---

## Tehnic

- Șabloane `shared/contract-asistenta.docx`, `cazier-judiciar/contract-asistenta.docx`, `shared/contract-complet.docx`: `{{NRCONTRACT}}` → `{{CONTRACT_SERIA}}{{NRCONTRACT}}` (2 locuri fiecare).
- `buildPlaceholderData`: `CONTRACT_SERIA` = `document_numbers.contract_series || 'SM'` când există număr, altfel gol. `imputernicire.docx` folosește în continuare `serie {{SERIE}} nr. {{NRCONTRACT}}`, deci nu se dublează.
- `admin/registru/page.tsx`: `fmtContract` / `fmtDelegation` cu SM implicit; capetele intervalului sunt text cu filtru de cifre (`inputMode="numeric"`) în loc de `type="number"`. API-ul de intervale e neschimbat (contractele rămân fără serie în registrul central, ca să nu se schimbe nimic pe CJO/ecazier).
- Test: `tests/unit/lib/documents/contract-seria-sm.test.ts` (șabloane + valoare + randare reală „Nr. SM021651").
