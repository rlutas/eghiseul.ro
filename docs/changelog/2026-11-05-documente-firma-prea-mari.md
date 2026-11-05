# 05.11.2026 — Documentele de firmă mari nu mai blochează comanda
<!-- categorie: comenzi -->

## Pentru echipă

- La comenzile pe firmă, un document scanat mare bloca salvarea comenzii. Clientul vedea „Salvarea a eșuat (413)”, iar din acel moment nu se mai salva nimic din ce completa.
- Acum PDF-urile de până la 10 MB merg direct în arhivă, iar pozele se micșorează automat, ca la buletin.
- Dacă salvarea eșuează din cauza serverului, formularul reîncearcă singur și îi spune clientului asta în română.
- Dacă un client alege un fișier care nu e PDF real, vede mesajul de eroare și poate alege imediat alt fișier.
- Pe fișa comenzii, documentele de firmă arată la fel ca până acum.
- **De sunat:** E-261105-MPVQH (s-a blocat din cauza asta, 198 lei) și E-261104-W9VR4 (476,5 lei). Ambele sunt neplătite. Când reia comanda, clientul trebuie să încarce din nou documentele care nu s-au salvat.
- Același lucru merge și pe documentero, unde încărcările directe din browser erau blocate până azi, inclusiv atașamentele clienților.

Ce faci când te contactează un client: [Client blocat în formular sau cu probleme la act](../admin/client-blocat-in-formular.md).

---

## Cauza

`CompanyDocumentsStep` accepta fișiere de 10 MB, le citea în base64 și le ținea în `customer_data.company.uploadedDocuments`. Fiecare autosave retrimitea tot, iar Vercel respinge corpurile peste 4,5 MB, deci aproximativ 3,3 MB de acte pe comandă. Respingerea vine înainte de funcție, așa că logurile Vercel nu au niciun 413 în 7 zile.

Bug-ul nu vine din fixurile de pe 04.11: fișierul nu a fost atins atunci. S-a văzut abia acum pentru că `save_failed` există din 04.11. Pe `E-261105-MPVQH` rândul din DB are firma fără acte și facturarea goală.

## Ce s-a schimbat

- **PDF:** `uploadClientFile` (presign `/api/orders/[id]/client-files`, PUT direct în S3). Documentul păstrează doar `s3Key`.
- **PDF fără draft pe server sau cu presign eșuat:** merge inline doar până la 1,5 MB (`MAX_PDF_BYTES`).
- **Poze:** `prepareImageForUpload` cu `maxEdge: 2200`, `quality: 0.85`, ca textul mic din certificat să rămână lizibil.
- **`/submit`:** `settleCompanyDocuments` (`src/lib/orders/company-documents.ts`) mută PDF-ul la `kyc/<orderId>/company_<tip>.<ext>`. Cheile din afara comenzii se elimină, pentru că `customer_data` poate fi scris din browser.
- **Salvare:** `isRetriableSaveStatus` reia și erorile 5xx, cu aceleași intervale. Mesaje noi pentru 413 și 5xx în `save-failure.ts`.
- **Upload eșuat:** cardul revine la zona de încărcare. Înainte, inputul dispărea și clientul trebuia să apese pe coș.

Audit înainte de filtrarea cheilor: 27 de documente pe comenzi trimise, toate sub `kyc/<id>/`; 7 pe drafturi, toate inline. Nimic existent nu se pierde.

## Verificare

- Unit: 2.413 teste trecute, 13 noi pentru `company-documents`, 3 pentru `save-failure`.
- Browser pe `next dev` local, viewport 390 px, PDF inventat de 5 MB pe `cazier-judiciar-persoana-juridica`: PUT S3 200, 5.242.928 B în S3 cu `application/pdf`, `PATCH /api/orders/draft/` 200, avans la pasul 4, documentul rămâne după „Înapoi” și după reîncărcare. PDF fals: mesaj în română și alt fișier acceptat imediat.
- Cele 5 drafturi de test și fișierele lor au fost șterse.

## Neverificat

- `settleCompanyDocuments` e testat cu S3 simulat, nu printr-un `/submit` complet pe live.
- Cauza 500 de pe `E-261104-W9VR4`: logul Vercel are `logs: []`, deci rămâne necunoscută. Fixul adaugă reîncercarea, nu elimină cauza.

## CORS documentero

CORS pe `eghiseul-documents` nu conținea `documentero.ro`, deci browserul bloca orice PUT direct de pe acel domeniu. Am adăugat `https://documentero.ro` și `https://www.documentero.ro`, cu acordul lui Raul. Preflight verificat: 200 pentru ambele, 200 pentru `eghiseul.ro`, 403 pentru un domeniu străin. Un upload real de pe documentero.ro nu a fost făcut.
