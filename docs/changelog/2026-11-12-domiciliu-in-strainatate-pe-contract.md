# 12.11.2026 — Domiciliu în străinătate: clientul îl poate alege, contractul îl tipărește
<!-- categorie: documente -->

## Pentru echipă

Până azi, la pasul „Date Personale" clientul putea alege doar o adresă din România (județ + localitate). Un cetățean român cu domiciliul în străinătate (în pașaport scrie țara, de exemplu Spania) nu avea ce alege. Unii lăsau adresa goală, alții scriau ceva de formă („-", București), iar contractul tipărea acea adresă.

Ce s-a schimbat:

- Clientul cu pașaport (sau care completează manual) vede întrebarea **„Domiciliul tău este în România?"**. La „Nu, în străinătate" alege țara și scrie adresa de acolo.
- Contractul tipărește acea adresă: „cu domiciliul în Calle Mayor 5, Mijas, Spania". La fel previzualizarea de la semnătură și documentele generate din admin.
- În pagina comenzii, la datele personale, apare rândul **„Domiciliu în străinătate"**.
- Cine are buletin (CI veche sau nouă) nu vede întrebarea: buletinul are mereu adresă din România.

Ce NU s-a schimbat:

- Comenzile deja plasate rămân cum sunt. Contractul lor nu se regenerează singur.
- Cetățenii străini au în continuare întrebarea lor separată („Am domiciliu în România?").

---

## Cauza

Comanda E-261112-7A93Y (certificat de celibat, pașaport cu domiciliul în Spania): `personal.address` = `{ county: 'București', city: 'Municipiul Bucuresti', street: '-' }`, iar `buildClientDetailsBlock()` a tipărit-o. Formularul are doar liste de județe și localități din România. În ultimele 90 de zile: 17 comenzi plătite cu pașaport, toate de cetățeni români, 14 cu facturare sau livrare în străinătate.

## Ce s-a schimbat în cod

- `src/lib/orders/domicile.ts` (nou): `resolveDomicile(personal)` întoarce textul de tipărit și părțile structurate. `personal.domicileAbroad = { country, address }` are prioritate față de adresa din România și nu are părți structurate.
- `src/lib/documents/auto-generate.ts`, `src/app/api/contracts/preview/route.ts`, `src/app/api/admin/orders/[id]/generate-document/route.ts`: toate trei folosesc `resolveDomicile()` (înainte fiecare își construia `address_parts`).
- `PersonalDataStep.tsx`: întrebarea + câmpurile țară/adresă; la „Nu" adresa din România se golește, ca să nu ajungă pe contract sau pe factură. Țara și adresa sunt obligatorii doar după ce clientul a ales „Nu".
- `ContractPreview.tsx`: trimite `domicileAbroad`, ca previzualizarea să arate ce se semnează.
- Pagina comenzii din admin: afișează domiciliul din străinătate.
- `PersonalKYCState.domicileAbroad` în `src/types/verification-modules.ts`. Fără migrare: stă în `customer_data.personal`.

## Verificat

- `tests/unit/lib/orders/domicile.test.ts`: străinătate, străinătate peste o adresă veche din România, adresă goală (comportament neschimbat), România; blocul de părți din contract.
- În browser, local, cu salvările simulate: întrebarea apare, „Continuă" cere țara și adresa, datele pleacă în salvare, se păstrează la reîncărcare, „Da" readuce câmpurile din România. Previzualizarea reală a contractului tipărește adresa din străinătate.

## Limite cunoscute

- Cererea ANAF pentru cazier fiscal (PDF cu câmpuri) rămâne fără adresă la domiciliu în străinătate: formularul are doar câmpuri românești.
- Cele trei probleme vechi notate aici la început au fost reparate în aceeași zi: vezi [adresa de domiciliu obligatorie și țara de domiciliu](2026-11-12-adresa-domiciliu-obligatorie-tara-domiciliu.md).
