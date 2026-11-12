# 12.11.2026 — Actul de identitate ca PDF: acceptat până la 10 MB
<!-- categorie: comenzi -->

## Pentru echipă

Clientul poate încărca acum actul (buletin, pașaport, permis) ca PDF de până la 10 MB. Până azi, un PDF peste 1,5 MB era refuzat și clientul trebuia să facă o poză.

Ce se întâmplă: PDF-ul mare este transformat în poză direct în telefonul sau calculatorul clientului, apoi merge mai departe ca orice poză. De aceea, la aceste comenzi vezi în admin o **poză** (JPG) în loc de PDF. E același act.

- PDF cu 2 pagini (față + spate): ambele apar în aceeași poză, una sub alta.
- PDF cu 3 sau mai multe pagini: se folosesc doar primele 2, iar clientul vede un mesaj. Dacă actul era pe altă pagină, poza din comandă nu îl conține: cere-i o poză a actului.
- PDF cu parolă, gol sau stricat: clientul primește în continuare mesajul „Încarcă o poză a actului".
- PDF-ul RO CEI Reader (dovada de domiciliu de la CI nou) rămâne PDF, cu limita de 1,5 MB.

Dacă un client tot nu reușește cu PDF: o poză (JPG sau PNG) merge întotdeauna.

Înlocuiește îndrumarea din [limita de PDF afișată corect](2026-11-12-scanare-act-limita-pdf-afisata-corect.md).

---

## Cauza

Actele de identitate călătoresc ca base64 în fiecare autosave, iar cererea are plafonul de 4,5 MB al platformei. De aceea `readPdfForUpload()` refuza PDF-urile peste `MAX_PDF_BYTES` (1,5 MB). Comanda E-261112-7A93Y: trei încercări cu un PDF de pașaport între 1 și 3 MB, toate respinse.

## Ce s-a schimbat

- `src/lib/images/pdf-to-image.ts` (nou): `renderPdfToImage()` desenează primele `MAX_PDF_PAGES` (2) pagini cu pdf.js, le lipește vertical și scoate un JPEG sub 900 KB (scade calitatea, apoi dimensiunea). Pagină goală → `PdfRenderError('BLANK')` prin `looksBlank()`. Timeout 45 s.
- `src/lib/images/read-pdf-for-upload.ts`: `prepareIdPdfForUpload()`. Până la 1,5 MB PDF-ul pleacă neschimbat, ca înainte. Între 1,5 și 10 MB (`MAX_ID_PDF_BYTES`) este transformat. Eșecul se raportează o singură dată în `client_error_log` (`kind: image_decode`, `code: PDF_PASSWORD | PDF_BLANK | PDF_UNREADABLE | PDF_TIMEOUT | PDF_UNSUPPORTED`).
- `PersonalDataStep.tsx` și `KYCDocumentsStep.tsx`: folosesc `prepareIdPdfForUpload()` pentru actele de identitate, arată poza rezultată ca previzualizare și mesajul despre pagini. `ro_cei_reader_pdf` rămâne pe `readPdfForUpload()`.
- `pdfjs-dist` 5.7.284 (versiune fixă), build-ul `legacy` pentru Safari mai vechi. Se încarcă doar când clientul alege un PDF mare; workerul iese în `/_next/static/media/`, deci merge pe toate brandurile.
- Documentele de firmă (`CompanyDocumentsStep`) nu se schimbă: PDF-ul lor merge direct în S3.

## Verificat

- Teste unitare: `tests/unit/lib/images/read-pdf-for-upload.test.ts` (decizia mic/mare, 10 MB, fișier fals, eșec raportat o dată, pagină goală).
- În browser, pe build local, cu un pașaport specimen și OCR real: aceleași câmpuri citite din PDF A4 de 2,7 MB, din PDF tip „scan cu telefonul" și din poza simplă. PDF cu 5 pagini → mesaj. PDF gol și PDF stricat → mesaj de eroare, fără cerere de OCR.
- Chromium și WebKit; build de producție; host documentero.

## Limite cunoscute

- Imaginile JPEG 2000 și JBIG2 din PDF nu sunt decodate (decodoarele wasm ale pdf.js nu sunt livrate). Pagina iese goală și clientul primește mesajul de eroare.
- Netestat pe un iPhone real cu iOS vechi. Dacă pdf.js nu pornește acolo, clientul vede mesajul „Încarcă o poză a actului".
