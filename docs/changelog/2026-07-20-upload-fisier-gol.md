# 2026-07-20 — Fișierele de 0 bytes ajungeau în storage ca documente nedeschizibile

**Origine:** incident pe cazierjudiciaronline.com (comanda CJO-20260720-12500 — poza cu buletinul nu se deschidea în admin). Fix aplicat acolo + **preventiv aici**, unde existau aceleași găuri.

**Jurnal complet al incidentului:** `cazierjudiciaronline.com/docs/session-logs/2026-07-20-upload-fisier-gol-0-bytes.md`

## Ce s-a întâmplat (pe CJO)

Poza actului de identitate a ajuns în Storage cu **0 bytes** (eTag = MD5-ul șirului gol). Calea era salvată corect în comandă, obiectul exista în bucket, signed URL-ul răspundea 200 — dar livra zero octeți, deci browserul nu afișa nimic.

Cauza: telefonul a predat un `File` cu nume și tip MIME valide, dar fără conținut — cazul clasic al pozei aflate doar în cloud (Google Photos nedescărcat local). Selfie-ul aceleiași comenzi, făcut pe loc cu camera, era intact.

## Situația pe eghiseul

**S3 curat: 0 fișiere goale din 850 obiecte scanate.** Dar aceleași două găuri existau în cod:

1. **`src/lib/images/compress.ts`** — decodarea prin `createImageBitmap` eșua oricum pe un fișier gol, însă cu `DECODE_FAILED` („Imaginea nu a putut fi decodificată. Încearcă altă poză."), mesaj care trimite clientul pe o pistă greșită.
2. **`src/app/api/upload/route.ts`** — `if (fileSize && fileSize > MAX_FILE_SIZE)` trata `0` ca valoare **absentă** (falsy) și **sărea complet peste validare**. Un upload de 0 bytes trecea nestingherit spre S3.

## Ce s-a livrat

- **`compress.ts`**: cod nou de eroare `EMPTY_FILE`, verificat **primul**, cu mesaj care numește cauza reală — *„Fișierul este gol. Dacă ai ales poza din galerie, poate fi salvată doar în cloud — fă poza direct cu camera sau descarc-o întâi pe telefon."*
- **`/api/upload`**: respinge `fileSize === 0` cu 400 și mesaj în română, **înaintea** verificării de mărime maximă. E singura plasă care acoperă **PDF-urile**, care nu trec niciodată prin compresia client-side.

Fluxurile `/reincarca-poza/[token]` și `/completare/[token]` folosesc `compressImage`, deci sunt acoperite automat.

## Convenție de reținut

Un `File` cu nume și tip valide **nu garantează conținut**. Orice punct care primește fișiere de la utilizator verifică explicit `size === 0`, iar verificarea trebuie să fie **prima** — `if (size && size > MAX)` tratează zero ca „nespecificat". Verificare pe ambele capete: client (mesaj util, fără drum dus-întors la server) și server (acoperă tipurile care ocolesc procesarea client-side).

## Fișiere

`src/lib/images/compress.ts` · `src/app/api/upload/route.ts`
