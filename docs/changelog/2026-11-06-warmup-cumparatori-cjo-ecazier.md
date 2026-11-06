# 06.11.2026 — Emailul de reactivare ajunge și la cumpărătorii CJO și ecazier
<!-- categorie: clienti -->

## Pentru echipă

- Cumpărătorii din 2026 de pe cazierjudiciaronline.com și ecazier.ro, care nu erau în lista noastră, primesc acum emailul de reactivare de la eGhișeul.ro.
- Emailul spune de pe ce site au cumpărat, ca să înțeleagă de unde îi știm.
- Dacă un client întreabă de ce primește email de la eGhișeul, spuneți-i că a comandat pe unul dintre aceste site-uri și că se poate dezabona cu un click din email.
- Dacă cineva spune că emailul i-a ajuns în spam sau nu mai vrea emailuri, spuneți-i lui Raul în aceeași zi.
- Nu trebuie să apăsați nimic.

---

## Ce s-a schimbat

Verificarea din 06.11 a arătat 716 cumpărători din 2026 care lipseau din `contacts`: 464 CJO și 252 ecazier. Decizia lui Raul: îi adăugăm pe toți, cu text propriu.

- Migrarea 201 adaugă `contacts.purchased_on` (`cazierjudiciaronline` sau `ecazier`).
- `warmup-reengagement.ts` numește site-ul și scoate formulările „prin noi”, „am rescris platforma” și „s-a schimbat de când ne-ai scris”, care nu sunt adevărate pentru ei.
- Importul e o rulare unică. Sunt excluși comenzile de test, cei rambursați, cei dezabonați pe CJO și cei cu plată în ultimele 14 zile.
- Comenzile noi de pe CJO și ecazier nu intră singure în `contacts`.
