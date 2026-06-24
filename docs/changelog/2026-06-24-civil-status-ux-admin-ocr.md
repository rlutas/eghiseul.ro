# 2026-06-24 — Stare civilă UX, formular, semnătură, livrare, admin OCR

## Servicii / prețuri / termene
- **Urgent scos** de unde nu există (migrația 080): naștere/căsătorie/celibat/extras-CF/cazier-fiscal — cardul „Urgent" + badge „Urgent Disponibil" dispar; opțiunea „Procesare Urgentă" dezactivată în wizard. Judiciar/auto/integritate păstrează urgent.

## Formular stare civilă (CivilStatusStep)
- „Vechiul certificat mi-a fost": doar **Pierdut / Distrus / Furat** (scos Deteriorat→Distrus + Altul).
- **Județul care a înregistrat actul**: `<select>` simplu → **SearchableSelect** (scriere + filtrare, toate 42 județe) + **cascadă București → Sector 1-6** (al doilea dropdown). `registrationPlace = "București (Sectorul N)"`.
- **Țara în care urmează folosit actul**: era Input text liber → **SearchableSelect** cu toate țările (`config/countries`).
- Validare: București cere și sector.

## Semnătură (SignatureStep)
- Stare civilă: 2 declarații obligatorii (gated pe `civilStatus`, după semnare):
  1. vechiul certificat devine nul + trebuie distrus;
  2. declarație pe propria răspundere privind corectitudinea datelor.
- `ConsentState` extins (`oldCertVoidAccepted`, `dataAccuracyAccepted`) → salvat în signature_metadata.

## Livrare (delivery-step)
- Stare civilă: o singură opțiune **„Electronic & Livrare la adresă"** (PDF email + original prin curier), fără alegere email-only. Forțează physical+romania, ascunde picker-ul.

## Opțiuni (options-step)
- **Extras multilingv** add-on (399) pe naștere/căsătorie + secțiune generică „Documente suplimentare" + **disclaimer**: multilingvul nu se traduce/apostilează (traducerea/apostila pe duplicatul simplu).

## Wizard
- **Specimen document** în sidebar (toți pașii, desktop): „Așa arată documentul pe care îl primești" — `config/service-specimens` (slug → imagine).

## Cont client (UI)
- **Footer** adăugat în `(customer)/layout.tsx` (lipsea complet).
- **Facturi (Oblio)** vizibile în detaliul comenzii (`invoiceUrl` în API + card).
- **Spațiu alb sub header** /account: hero-ul „Salut" iese acum sub header (bleed `-mt`/`pt`), fără banda albă a spacer-ului. Aplicat pe dashboard + detaliu comandă.
- Card Google reviews: „peste 450 recenzii" pe linie proprie sub rating.

## Admin
- **OCR buletin vs. date completate**: tabel nou în cardul „Documente încărcate de client" — compară ce a extras OCR-ul de pe buletin cu ce a completat/editat clientul (nume/prenume/CNP/dată naștere/serie/număr/expirare), evidențiază diferențele. Complementar cross-validation scan-vs-scan.

## Teste
- `tests/unit/civil-status/delivery-terms.test.ts` — 14 teste (resolver termen + county/sector). Suita: 1075+ pass.

## Backlog deschis
- Admin: vizibilitate „client cu cont + KYC la nivel de cont" la plasarea comenzii + flux review KYC pe cont (vezi `docs/plans/2026-06-24-account-features-roadmap.md`).
- Prefill wizard, mașini salvate, imobile salvate.
