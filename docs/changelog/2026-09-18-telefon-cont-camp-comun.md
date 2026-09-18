# 18.09.2026 — Telefonul din cont: același câmp ca în comandă, cu țară și verificare
<!-- categorie: clienti -->

## Pentru echipă

Numărul de telefon din contul clientului se completează acum exact ca în
formularul de comandă: alegi țara din listă (România e prima, apoi Italia,
Spania, Germania și celelalte țări cu diasporă), prefixul apare singur, iar
zeroul din față se taie automat.

**Ce se schimbă pentru client:** dacă scrie un număr cu o cifră în plus sau în
minus pentru țara aleasă, contul nu-l salvează și îi spune de ce, sub câmp.
Până acum contul accepta aproape orice înșiruire de cifre.

**De ce contează pentru voi:** numărul din cont ajunge în comenzile viitoare,
pe AWB și pe factură. Un număr verificat la salvare e un client la care ajungeți
din prima când e ceva de lămurit.

Se aplică în trei locuri: popup-ul „Telefon de contact" din checklist, tabul
„Profil" la editare și pagina de înregistrare.

---

## Rezumat tehnic

- **`src/lib/format/validate-phone.ts`** (nou): `validatePhone(raw)` întoarce
  mesajul în română sau `null`; folosește `normalizePhone` (trunk zero,
  separatori, RO implicit) + `isValidPhoneNumber` din libphonenumber-js —
  aceeași regulă ca `contactSchema` din wizard. `hasTypedPhone()` tratează
  „+40" singur (prefixul forțat de `react-international-phone`) ca gol, ca
  dialogul să nu ceară confirmare la închidere pentru un câmp neatins.
- **`PhoneInput`** primește `id`, `onBlur`, `autoFocus` (marcat ca
  `data-autofocus`, pe care îl caută `ProfileStepDialog`), `aria-invalid`,
  `aria-describedby`; toate ajung pe `<input>`-ul bibliotecii prin `inputProps`.
- **`ContactStepForm`**, **`ProfileTab`** (mod editare) și
  **`auth/register`** folosesc `PhoneInput` în locul `<input type="tel">`;
  validarea rulează pe blur și la submit, cu focus pe câmp când pică.
- **`PATCH /api/user/profile`** refuză cu 400 un telefon care nu trece
  `validatePhone` (gol rămâne permis — ștergerea nu e greșeală); tot ce trece
  se scrie prin `normalizePhone`, deci E.164.
- `validatePhone` din `step-form-kit.tsx` este acum un re-export; verificarea
  lejeră (cifre, 0 sau +, 9–15 caractere) a dispărut — lăsa să treacă
  `+40 12` și `0000000000`.
- 7 teste noi în `tests/unit/lib/format/validate-phone.test.ts`.
