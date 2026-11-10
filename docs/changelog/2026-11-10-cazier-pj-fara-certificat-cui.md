# 10.11.2026 — Cazier judiciar pentru firmă: certificatul CUI devine obligatoriu pe toate formularele
<!-- categorie: comenzi -->

## Pentru echipă

- **Ce s-a întâmplat:** 5 comenzi de cazier pentru firmă au venit fără certificatul de înregistrare (CUI), toate plătite, între 19.10 și 06.11. Exemplu: E-261105-7ZTJ7. Clientul n-a sărit nimic: formularul pur și simplu nu i-a cerut documentul.
- **De ce:** clienții veneau din emailurile de reactivare, pe formularul de cazier unde alegi „persoană fizică / firmă” pe loc. Acolo pasul „Documente firmă” nu era pornit. Pe formularul dedicat „cazier pentru firmă” documentul se cerea, de aceea acolo n-a lipsit niciodată.
- **Ce s-a schimbat:** pe ambele formulare, clientul firmă nu mai poate trece mai departe fără certificatul CUI. Dacă totuși ajunge la plată fără el, comanda e oprită și i se cere să revină la pasul „Documente firmă”.
- **cazierjudiciaronline.com și ecazier.ro:** câmpul pentru certificat exista, dar nu era obligatoriu. Toate comenzile de firmă din septembrie–octombrie îl au, pentru că clienții l-au încărcat singuri. Acum e obligatoriu și acolo.
- **Comenzile deja venite fără CUI:** E-261019-CX84E, E-261105-JGZ3U, E-261105-27GS2, E-261105-7ZTJ7, E-261106-7UKTJ. Toate sunt finalizate. Dacă vreuna mai are nevoie de document, folosiți „Solicită documente” pe pagina comenzii: certificatul CUI e acum bifat implicit în listă.

---

## Tehnic

- Cauza: `services.verification_config.companyKyc` pe `cazier-judiciar` (fluxul combinat, `clientTypeSelection` PF/PJ, `condition: "client_type == 'PJ'"`) nu avea `documentsRequired` / `requiredDocuments`, deci `step-builder.ts` nu insera pasul `company-documents`. `cazier-judiciar-persoana-juridica` le avea din config. Specificația (`service-verification-requirements.md`) marca greșit „Company Docs ❌” pe Cazier Judiciar.
- Sursa traficului: atribuirea pe toate cele 5 comenzi arată `utm_source=email, utm_medium=warmup`. Linkul din warm-up e `/comanda/<slug>/` după serviciul din istoricul contactului, iar cumpărătorii CJO/ecazier au slug-ul `cazier-judiciar`. Pe 14.10 fluxul combinat avea 0 comenzi plătite, după care warm-up-ul l-a reactivat.
- Migrarea 203: `jsonb_set` pentru `documentsRequired: true` și `requiredDocuments: ["company_registration_cert"]` pe `cazier-judiciar`. Se schimbă doar valori, fără schemă.
- `/api/orders/[id]/submit`: guard nou după `settleCompanyDocuments` cu codul de eroare `COMPANY_DOCUMENTS_INCOMPLETE` (400). Se activează când serviciul cere documentele, comanda are `company.cui` și `clientType` ≠ `pf`. Fiecare tip din `requiredDocuments` trebuie să aibă un `s3Key` care nu e `foreign` (vezi `classifyCompanyDocumentKey`).
- CJO `Step3Documents.tsx`: validarea pune eroarea `errs.cert` pentru PJ fără certificat, iar `FileUploadField` primește `required` și `error`.
- Am comparat fluxul combinat cu cele dedicate: prețul și opțiunile sunt identice. Diferențe rămase, fără impact pe acte: `urgent_days` 2 pe combinat față de 3 pe PJ dedicat, iar combinatul cere datele părinților și de la reprezentantul PJ.
