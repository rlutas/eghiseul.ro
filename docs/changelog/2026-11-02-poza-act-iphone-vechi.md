# 02.11.2026 — Poza actului se încarcă și de pe iPhone-uri mai vechi
<!-- categorie: comenzi -->

## Pentru echipă

- Clienții cu iPhone mai vechi primeau la încărcarea pozei cu buletinul „Imaginea nu a putut fi decodificată. Încearcă altă poză.”, deși poza apărea pe ecran. Acum poza se procesează normal.
- Dacă un client mai sună cu mesajul ăsta, întrebați-l ce telefon are și trimiteți-ne numărul comenzii: din acest moment ar trebui să apară doar pentru fișiere stricate.

Raportat din Ghid pe E-261005-MCFAQ (05.10).

---

## Tehnic

- `src/lib/images/compress.ts`: `decodeImage()` cu trei strategii — `createImageBitmap(file, { imageOrientation: 'from-image' })`, apoi `createImageBitmap(file)` fără opțiuni, apoi `<img>` din `URL.createObjectURL` (`img.decode()`). Safari iOS ≤16 aruncă la dicționarul de opțiuni chiar pe JPEG valid; `<img>` aplică EXIF singur.
- Folosit de wizard (eghiseul + documentero) și de contul clientului. CJO/ecazier nu folosesc `createImageBitmap`.
- Test: `tests/unit/lib/images/compress.test.ts`.
