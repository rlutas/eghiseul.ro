# 21.10.2026 — Formularul nu mai rămâne „blocat" la Plătește; selfie-ul identic cu buletinul e refuzat la încărcare
<!-- categorie: comenzi -->

## Pentru echipă

- **Ce se întâmpla:** dacă la „Plătește" lipsea ceva (selfie, date de facturare, email greșit), clientul vedea doar un mesaj mic care dispărea în câteva secunde și rămânea pe pasul Facturare. Părea că butonul nu face nimic, iar mulți abandonau.
- **Acum:** formularul îl duce singur la pasul cu problema (acte, facturare sau contact) și îi arată un mesaj roșu care rămâne pe ecran, cu ce trebuie corectat.
- **Selfie = aceeași poză ca buletinul:** este refuzat imediat la încărcare, cu mesajul „Ai încărcat aceeași poză ca la…". Înainte trecea de pasul de acte și bloca plata la final.
- **Comenzi începute de echipă pe formularul public:** NU mai puneți poza buletinului și la selfie, pentru că nu trece. În admin, pe comanda neterminată, apăsați **„Finalizează ca comandă telefonică"**. Comanda trece în fluxul telefonic: trimiteți linkul de plată, iar după plată linkul de completare, unde clientul pune actele, selfie-ul și semnătura. Procedura completă: [Comenzi telefonice](../admin/comenzi-telefonice/README.md).

---

Caz real: E-261021-2446F — selfie-ul încărcat era fișierul verso-ului CI (același SHA-256), `/submit` răspundea `400 KYC_INCOMPLETE`, wizardul arăta doar un toast.

- `modular-order-wizard.tsx`: `SUBMIT_ERROR_STEP` mapează codul de refuz de la `/submit` pe pas (`KYC_INCOMPLETE`/`ACCOUNT_KYC_*` → `kyc-documents`, `BILLING_INCOMPLETE` → `billing`, `EMAIL_DOMAIN_INVALID` → `contact`); `goToStep` + banner `role="alert"` persistent pe pasul țintă (sau pe pasul curent dacă ținta nu e vizibilă).
- `src/lib/kyc/duplicate-upload.ts` (`findDuplicateUpload`): la upload în `KYCDocumentsStep`, compară poza comprimată cu celelalte documente — base64 cât sunt în memorie, mărimea în bytes după reîncărcarea draftului (ambele trec prin același `compressImage`). Test: `tests/unit/lib/kyc-duplicate-upload.test.ts`.
- Admin, bannerul „Comandă neterminată": buton „Finalizează ca comandă telefonică" → `POST /api/admin/orders/create-from-draft` (aceleași gărzi: facturare + MX). Ruta nu mai detașează `user_id` decât dacă draftul e legat de contul adminului — un draft început de client rămâne în contul clientului.
