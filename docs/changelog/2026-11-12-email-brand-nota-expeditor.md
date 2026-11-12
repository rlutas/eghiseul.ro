# 12.11.2026 — Emailurile celorlalte site-uri explică de ce vin de pe adresa eghiseul
<!-- categorie: clienti -->

## Pentru echipă

Emailurile pentru comenzile de pe documentero.ro, cazierfiscal.com și
certificat-constatator-express.ro au deja sigla, culorile și numele site-ului
lor. Adresa de la care pleacă e însă una de eghiseul.ro, pentru că serviciul de
email nu mai are loc pentru domenii noi. Clientul vedea „documentero.ro” cu o
adresă @eghiseul.ro, ceea ce poate părea suspect.

De acum, aceste emailuri au jos o linie: „Email trimis prin eGhișeul.ro,
platforma eDigitalizare SRL care operează și documentero.ro. De aceea adresa
expeditorului este @eghiseul.ro.”

- Dacă un client întreabă de ce emailul vine de la eghiseul: e aceeași firmă,
  iar linia de jos o spune.
- Emailurile eghiseul nu se schimbă.
- Când un site va trimite de pe domeniul lui, linia dispare singură.

---

## Tehnic

- `src/lib/email/resend.ts`: `SENDER_NOTE_MARKER` și `applySenderNote()`.
  `sendEmail` înlocuiește marcajul cu nota când domeniul cerut e al unui brand
  și emailul pleacă de pe alt domeniu, atât la `resolveFrom` (domeniu în afara
  `RESEND_VERIFIED_DOMAINS`), cât și la reîncercarea după 403. Altfel scoate
  marcajul.
- `branded-layout.ts` și `order-confirmation.ts` pun marcajul sub
  `legalTagline`, doar pentru brandurile care nu sunt eghiseul. Marcajul e un
  comentariu HTML, deci e invizibil oriunde HTML-ul nu trece prin `sendEmail`.
- Teste: `tests/unit/lib/email/sender-note.test.ts`.

Șabloanele de autentificare Supabase (`supabase-auth.ts`) și varianta text a
emailurilor nu primesc nota.
