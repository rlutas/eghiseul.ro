# 09.11.2026 — CNP-ul lipit cu spații nu mai e tăiat la 12 cifre
<!-- categorie: comenzi -->

## Pentru echipă

- Dacă un client copia CNP-ul cu un spațiu sau o cratimă în el (de exemplu „1850101 123456”) și îl lipea în formular, rămâneau doar 12 cifre. Clientul vedea „CNP invalid” fără să înțeleagă de ce.
- Acum formularul scoate întâi spațiile și cratimele și abia apoi păstrează cele 13 cifre. CNP-ul lipit intră întreg.
- Reparat pe eghiseul, documentero și cazierjudiciaronline: date personale, facturare, constatator, extras CF (proprietar) și contul clientului.
- Pe cazierjudiciaronline, salvarea comenzii neterminate se reîncearcă singură de două ori când clientul are semnal slab. Clientul nu observă nimic. Comanda neterminată ajunge mai des în Recuperare, cu pasul corect.
- Ce faci tu: nimic nou. Dacă un client spune că CNP-ul „nu intră”, roagă-l să reîncarce pagina.

---

## Cauza

Toate câmpurile de CNP aveau `maxLength={13}` și un `onChange` care scotea caracterele care nu sunt cifre. La lipire, browserul taie textul la 13 caractere ÎNAINTE de `onChange`. Din „1850101 123456” (14 caractere) rămâne „1850101 12345”, adică 12 cifre după curățare.

Verificat în Chromium (Playwright, `keyboard.insertText`): cu `maxlength=13` rămân 12 cifre, iar fără `maxlength` textul intră întreg.

Semnalul: `client_error_log` pe CJO, `cnp_invalid` / `LENGTH` la blur, de 5 ori în 03–08.11. Nu se poate dovedi că toate cele 5 au fost lipiri: o parte pot fi clienți care au plecat din câmp la jumătatea tastării.

## Ce s-a schimbat

- eghiseul: `maxLength={13}` scos din `billing-step`, `PersonalDataStep`, `PersonalStepForm`, `BillingProfileForm`, `PropertyDataStep`, `ConstatatorStep` și `ProfileTab`. `onChange` face `replace(/\D/g, '').slice(0, 13)`. `PersonalDataStep` și `ProfileTab` făceau deja asta în `handleCNPChange`. Am pus `inputMode="numeric"` unde lipsea.
- Test nou: `tests/unit/components/cnp-input-no-maxlength.test.ts` pică dacă vreo componentă din `src/components` folosește din nou `maxLength={13}`.
- CJO: același fix în `Step2PersonalData`. `saveDraft` din `OrderForm` reia cererea `/api/sessions` după 3 s și apoi după 10 s când fetch-ul cade pe rețea. O reîncercare întârziată nu suprascrie o salvare mai nouă (`saveSeqRef`). Cazul care a dus la asta: `CJO-20261105-86424`, cu 4 salvări pierdute la rând pe pașii 3–6.

## Celelalte erori din formular (03–09.11), verificate

- **413 pe `E-261105-MPVQH`**: reparat pe 05.11 (vezi [documentele de firmă](2026-11-05-documente-firma-prea-mari.md)). Erorile de la 19:59 vin dintr-un tab deschis înainte de deploy, cu codul vechi. Comanda s-a plătit.
- **„Format invalid” la PDF-ul de buletin sau de permis**: reparat pe 04.11, înainte de deploy. Ambele comenzi s-au plătit.
- **TIMEOUT pe `E-261104-GGMK5`**: semnal slab, iar reîncercarea din 04.11 a funcționat. Comanda s-a plătit.
- **500 pe `E-261104-W9VR4`**: răspunsul nu e JSON-ul rutei noastre, deci vine de la platformă. Cauza rămâne necunoscută: logul Vercel e gol și MCP-ul Vercel dă 403 pe proiect. Reîncercarea la 5xx există din 05.11.
- **Fișier gol, poză duplicată, poză nedecodabilă**: clientul a primit mesajul corect și a plătit în toate cele trei cazuri.

## Neverificat

- Fixul nu a fost încercat într-un formular real, în browser. E verificat pe un `<input>` simplu și prin tipuri, lint și teste unitare: eghiseul 2.433 trecute, CJO 633 trecute.
