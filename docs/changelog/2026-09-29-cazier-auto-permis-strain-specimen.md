# 29.09.2026 — Cazier auto cu permis străin: exemplu de document pe pagină
<!-- categorie: documente -->

## Pentru echipă

- Clientul cu permis de conducere emis în străinătate **nu** primește fișa „Istoric sancțiuni”. Primește o adresă de la Serviciul Rutier, semnată și ștampilată. Adresa spune doar dacă are abateri care atrag suspendarea dreptului de a conduce în România. Nu conține amenzile și nici punctele.
- **Problema raportată** (Ghid → Rapoarte, 29.09): „de adăugat pe site-uri la cazier auto un exemplu de poză pentru cei cu permis de conducere străin”. Clientul cu permis străin nu știa ce primește și se aștepta la fișa obișnuită. **Rezolvat** pe toate trei site-urile: eghiseul.ro, cazierjudiciaronline.com și ecazier.ro spun acum același lucru și arată același exemplu.
- Pe pagina cazierului auto există acum un al doilea specimen, „Permis emis în străinătate”, cu un răspuns real anonimizat. Linkul direct: `/servicii/cazier-auto-online/#permis-strain`. Trimiteți-l clientului care întreabă „cum arată ce primesc”.
- În formular, la „Permis emis în străinătate: Da” (eghiseul) sau bifa „Permis de conducere din străinătate” (cazierjudiciaronline.com și ecazier.ro), clientul vede același lucru scris și un link „Vezi cum arată”.
- Pe cazierjudiciaronline.com exemplul stă sub specimenul obișnuit. Pe ecazier.ro stă în ghidul „Cazier auto pentru preschimbarea permisului în străinătate”, iar paginile „Fișa de evidență” și „Acte necesare” trimit acolo.
- Am scos afirmația greșită „fișa se cere autorității care a emis permisul”. Verificarea se face în România, în evidența permiselor străine.
- Dacă clientul spune că instituția lui cere alt format, lămuriți înainte de plată.

---

## Tehnic

Pornit de la o reclamație: un client cu permis străin a primit adresa IPJ Satu Mare în loc de „Istoric sancțiuni” și nu știa la ce să se aștepte.

- `public/images/specimens/cazier-auto-permis-strain.webp`: randat din PDF-ul real. Numele, domiciliul, numărul și data înregistrării și numele agentului care a redactat sunt acoperite, plus ștampila SPECIMEN.
- `src/app/(eghiseul)/servicii/cazier-auto-online/page.tsx`: bloc nou `#permis-strain` în secțiunea Specimen. Textul de cost și FAQ-ul pentru permis străin sunt corectate. `DATE_MODIFIED` e acum 2026-09-29.
- `src/components/orders/modules/vehicle/VehicleDataStep.tsx`: alerta pentru `licenseIssuedAbroad === true` descrie documentul și are link spre specimen.
- `src/components/orders/steps-modular/options-step.tsx`: explicația „De ce?” de la urgență nu mai pomenește autoritatea emitentă.
- Repo `cazierjudiciaronline.com` (CJO + ecazier), aceeași imagine în `public/images/specimens/`:
  - CJO `src/app/cazier-auto-online/page.tsx`: al doilea specimen `#permis-strain` sub cel standard, FAQ din JSON-LD corectat; `faq.tsx`: întrebare nouă „Ce primesc dacă am permis emis în străinătate?”.
  - ecazier `cazier-auto-strainatate-preschimbare-permis`: secțiunea „Cazul special” rescrisă + `<figure id="permis-strain">`; FAQ corectat.
  - ecazier `cazier-auto`, `fisa-evidenta-conducator-auto`, `acte-necesare-cazier-auto`: textele cu „autoritatea emitentă” corectate, cu link spre exemplu.
  - `Step2PersonalData.tsx`: la bifa permis străin, text + link spre imagine (merge pe ambele hosturi); comentariul din `cabinet-auto.config.ts` corectat.
- Raportul `knowledge_reports` 6f9bf9c6 a fost marcat „rezolvat”, cu notă.
