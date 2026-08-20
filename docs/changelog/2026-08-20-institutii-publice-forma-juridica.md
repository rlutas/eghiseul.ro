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

## Rămâne de decis (ops, nu cod)

Serviciul **Cazier Judiciar PJ** cere la pasul 3 documentul
`company_registration_cert` = „Certificat de Înregistrare (firmă), emis de
Registrul Comerțului". O școală **nu are** așa ceva — are certificat de
înregistrare fiscală (ANAF) + act de înființare. Clientul se blochează acolo
sau încarcă alt act. Dacă acceptăm instituții publice, `requiredDocuments` din
`verification_config` are nevoie de o variantă pentru ele (printr-o **migrare**,
nu editat direct în DB) și, eventual, de un `specialRule` cu mesajul de
documente, cum e cel pentru ONG-uri.

## Teste

`tests/unit/lib/services/infocui-anaf-v9.test.ts`: școala → `INSTITUȚIE
PUBLICĂ`; „CASA … S.R.L." → `SRL` (nu `SA`); nume de instituție **cu** J la
Registrul Comerțului → nu e etichetat instituție publică.
