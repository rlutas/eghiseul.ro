# 12.11.2026 — „Modifică”: ce e nou și ce e deja plătit; cost 0 la CF colectivă
<!-- categorie: plati -->

## Pentru echipă

**Fereastra „Modifică comandă”.** Sub lista de opțiuni scria „Opțiuni selectate:
357,50 RON”, adică toate opțiunile bifate la un loc, inclusiv cele deja plătite
(de exemplu urgența de 80 lei). Părea că urgența se taxează a doua oară. Nu se
taxa: suma de plată e cea din banda de după „Calculează diferența”.

Acum scrie separat: **„Opțiuni noi: +277,50 RON · deja plătite (nu se mai
taxează): 80,00 RON”**.

**Cost intern la carte funciară colectivă.** Apărea automat 20 lei și îl
schimbați de mână pe 0. De acum se înregistrează singur **0 lei**, atât la
livrarea directă, cât și în formularul de depunere al topografului.

**Comanda E-261031-68SFJ (actualizare adresă CF).** Costul de 75 lei spus de
topograf la depunere nu e trecut pe comandă: rândul de cost lipsește. Adăugați-l
din cardul „Cost intern & marjă”: furnizor ANCPI, taxă instituție, 75 lei.

---

## Tehnic

- `modify-order-dialog.tsx`: `liveNewTotal` / `livePaidTotal`, după opțiunile
  din `seed` (cele de pe comandă la deschidere).
- `src/lib/ancpi/taxe-eliberare.ts`: `TAXA_LIVRARE_DIRECTA_RON['extras-cf-colectiv'] = 0`;
  `taxaEliberare` întoarce 0 pentru un slug cu taxă directă 0, înaintea
  tarifului din `processing_config.ancpi_cost_ron` (care a rămas 20 în bază).
  `upload-pdf` inserează rândul cu 0, deci decontul îl vede ca taxă cunoscută
  (`ocpiRecorded`).
- Test nou în `tests/unit/lib/ancpi/taxe-eliberare.test.ts`.

**E-261031-68SFJ:** nota din 03.11 spune „Cost eliberare: 75.00 lei”, dar în
`order_supplier_costs` nu există niciun rând pe comandă. Inserarea directă în
bază a fost blocată de permisiuni; se adaugă din admin. Tariful informativ al
serviciului `actualizare-adresa-cf` e 60 lei în `processing_config`; nu a fost
schimbat, pentru că nu știm dacă 75 e taxa obișnuită sau un caz anume.
