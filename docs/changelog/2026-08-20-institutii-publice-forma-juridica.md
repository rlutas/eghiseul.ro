# 2026-08-20 — Instituțiile publice apăreau ca SRL cu un J inventat

Semnalat de Raul: o **școală** a completat pasul „Date Firmă"
(`SCOALA GIMNAZIALA FULOP ARON FELICENI`, CUI `13378912`) și formularul arăta
**Forma Juridică: SRL** și **Număr Registrul Comerțului: J40/12345/2020** —
niciuna reală.

## Ce se întâmpla

Ambele câmpuri erau **goale**; ce se vedea era textul-exemplu (`placeholder`)
al inputurilor. Câmpurile sunt `readOnly` după căutarea după CUI, deci clientul
nici nu putea corecta — vedea date care păreau ale lui, dar erau decor.

De ce goale: ANAF chiar nu are ce da. Răspunsul real pentru CUI-ul școlii:

```json
{ "denumire": "SCOALA GIMNAZIALA FULOP ARON FELICENI",
  "nrRegCom": "", "forma_juridica": "",
  "stare_inregistrare": "MODIFICARE PUBLICI din data 21.09.2000" }
```

O instituție publică **nu e la Registrul Comerțului**. Iar forma juridică o
deduceam din numele firmei (`extractCompanyType`), care n-avea niciun tipar de
instituție → șir gol.

## Fix

**1. `extractCompanyType(name, nrRegCom)`** (`src/lib/services/infocui.ts`):
- caută formele juridice pe **cuvinte întregi** (`matchesAnyWord`), nu cu
  `includes()`. Bug real, nu teoretic: orice nume care conținea literele „SA"
  („CASA DE …") ieșea **societate pe acțiuni**.
- fără `nrRegCom` + nume de instituție (școală, liceu, primărie, spital,
  inspectorat, minister…) → **`INSTITUȚIE PUBLICĂ`**. Condiția „fără nrRegCom"
  e cea care ține în siguranță firmele comerciale: un „Centrul Medical X SRL"
  are J, deci rămâne SRL.

**2. Placeholder-ele** (`CompanyDataStep.tsx`): pe câmpurile completate automat
și rămase goale se afișează **„Nu se aplică"**, nu „SRL" / „J40/12345/2020".
Un exemplu gri într-un câmp needitabil se citește ca dată reală.

**3. Mesajul de succes**: „preluate din **Registrul Comerțului**" doar când
chiar există un nr. de înregistrare; altfel „preluate din **baza de date
ANAF**" — sursa corectă pentru instituții.

Documentele generate nu erau afectate: `generator.ts` tipărește
„Nr. Reg. Com.: …" doar dacă valoarea există.

## Pasul de documente + documentele generate

**4. „Documente Firmă"** cerea `company_registration_cert` = „Certificat de
Înregistrare, emis de Registrul Comerțului". O școală nu are așa ceva, deci
rămânea blocată pe un document care nu există. Când entitatea e instituție
publică, aceeași casetă își schimbă textul: **„Certificat de Înregistrare
Fiscală (CIF)"** — certificatul ANAF sau actul de înființare. Configurația din
DB rămâne neatinsă (nu e nevoie de migrare): se schimbă doar ce i se cere
omului pe ecran.

**5. Avertisment încă de la pasul „Date Firmă"**, ca la ONG-uri: „Instituție
publică: nu are certificat de la Registrul Comerțului. La pasul următor
încarcă certificatul de înregistrare fiscală (CIF) emis de ANAF sau actul de
înființare." Clientul află ce să pregătească înainte să ajungă la upload.

**6. Cererea de eliberare PJ** are în șablon „număr de ordine în Registrul
Comerţului {{CLIENT_COMPANY_REG}} codul unic de înregistrare …". Gol, ieșea o
pauză care arăta a câmp uitat de operator. Pe PJ fără număr se tipărește acum
**N/A** — formatul folosit deja în șablon pentru „denumirea anterioară".
Contractele nu se schimbă: acolo linia „Nr. Reg. Com.:" se adaugă doar dacă
valoarea există.

## Teste

- `infocui-anaf-v9.test.ts`: școala → `INSTITUȚIE PUBLICĂ`; „CASA … S.R.L." →
  `SRL` (nu `SA`); nume de instituție **cu** J la Registrul Comerțului → nu e
  etichetat instituție publică.
- `entity-type-detection.test.ts`: 6 tipuri de instituții recunoscute; „SCOALA
  DE SOFERI RAPID SRL" **cu** J → firmă, nu instituție.
- `documents/generator.test.ts`: `CLIENT_COMPANY_REG` = `N/A` pe PJ fără număr,
  numărul real când există, gol pe PF.
