# 12.11.2026 — Scanarea actului: limita de PDF afișată corect
<!-- categorie: comenzi -->

## Pentru echipă

La pasul „Date Personale", sub butonul „Încarcă imagine" scria „JPG, PNG sau PDF, max 10MB". Pentru PDF limita reală este 1,5 MB, deci un client cu un PDF de 2 MB primea eroarea „PDF-ul este prea mare" deși respectase ce scria pe ecran.

Acum textul spune „JPG sau PNG, max 10MB; PDF, max 1,5MB", la fel ca la pasul de documente.

Dacă un client sună că nu poate încărca actul ca PDF: cere-i o **poză** a actului (JPG sau PNG, făcută cu telefonul). Pozele se micșorează singure și trec indiferent de mărime, până la 10 MB.

---

## Ce s-a întâmplat

Comanda E-261112-7A93Y (certificat de celibat, pașaport): trei încercări cu un PDF între 1 și 3 MB, toate respinse cu „PDF-ul este prea mare (limita este 1,5 MB). Încarcă o poză a actului." Clientul a încărcat apoi o poză și comanda a fost plătită.

## Cauza

`readPdfForUpload()` refuză PDF-urile peste `MAX_PDF_BYTES` (1,5 MB). Limita este voită: documentele de identitate călătoresc ca base64 în fiecare autosave, iar cererea are plafonul de 4,5 MB al platformei (două PDF-uri plus selfie trebuie să încapă). Textul din `PersonalDataStep.tsx` promitea însă 10 MB și pentru PDF. `KYCDocumentsStep.tsx` avea deja textul corect.

## Ce s-a schimbat

- `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`: textul de sub zona de încărcare.

## Ce a rămas deschis

PDF-urile de act peste 1,5 MB rămân refuzate. Acceptarea lor cere încărcare directă în S3 și pentru actele de identitate (ca la documentele de firmă), cu `/submit` învățat să primească o cheie venită din browser. O singură comandă cu această eroare în ultimele 14 zile, deci amânat.
