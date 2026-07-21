# 2026-07-21 — Secțiunea „Procesare comandă" dispărea pe multe comenzi din admin

**Semnalat de echipă:** pe majoritatea comenzilor nu apărea secțiunea cu documentele generate (contract prestări, contract asistență, împuternicire, cerere eliberare) + colaboratorul topograf. „Câteodată dispare și nu o mai găsești."

## Cauza

`ProcessingSection` (în `src/app/admin/orders/[id]/page.tsx`) folosea o **listă albă** de statusuri „procesabile":

```
pending, paid, processing, documents_generated, submitted_to_institution,
document_received, extras_in_progress, document_ready
```

Pe orice alt status, `return null` — **întreaga secțiune** dispărea, inclusiv lista de documente.

Problema: lista n-a fost actualizată când s-au adăugat statusuri noi. Comenzile pe care echipa le vede zilnic cădeau prin fisură:

| Status | Când a apărut | Comenzi |
|---|---|---|
| `standby` | 16.07 (Solicită documente) | comandă blocată așteptând clientul |
| `la_tradus`, `la_legalizat`, `la_apostila_notari`, `eliberat_apostila_haga` | 15.07 (add-on traducere/apostilă, migrarea 093) | comenzi în lucru |
| `completed` | din start | **53 de comenzi** |
| `shipped`, `delivered`, `in_progress`, `cancellation_requested` | — | comenzi active/finalizate |

„Câteodată dispare" = exact când comanda intra în `standby` (cerere de documente către client) sau trecea prin traducere/apostilă.

## Fix

Inversat în **listă neagră**: secțiunea se ascunde doar pe comenzi unde n-are niciun sens — **neplătite sau moarte** (`draft`, `abandoned`, `cancelled`, `refunded`). Restul o văd.

Butonul de acțiune contextual are deja gate propriu (`buttonConfig &&`), deci pe statusurile fără acțiune definită apar doar documentele + colaboratorul, fără buton irelevant.

**Impact pe DB reală:** secțiunea e vizibilă acum pe 94 de comenzi (era 36).

## Lecția

O listă albă de statusuri e o datorie care se acumulează tăcut: fiecare status nou adăugat (add-on, standby, viitoare) trebuie ținut minte și adăugat manual, altfel funcționalitatea dispare fără eroare. Pentru „arată UI-ul X pe comenzile active", listă neagră de stări-terminale-moarte e mai robustă decât listă albă de stări-vii.

## Fișiere

`src/app/admin/orders/[id]/page.tsx` (funcția `ProcessingSection`)
