# 23.11.2026 — Mircea vede notele echipei pe comenzile lui
<!-- categorie: comenzi -->

## Pentru echipă

- Până azi, Mircea nu vedea nimic din ce notați voi pe comandă. Adresa, CNP-ul proprietarului sau ce ați vorbit cu clientul rămâneau doar la noi.
- De acum, pe pagina comenzii din portalul lui apare caseta „Note pe comandă”, chiar sub datele lucrării. Conține toate notele voastre și pe ale lui, cele mai noi sus.
- Voi apăreți acolo ca „Echipa”: emailul sau numele vostru nu se vede.
- Mesajele cu clientul nu se repetă în casetă, pentru că el le vede deja în „Mesaje cu clientul”.
- Ce înseamnă pentru voi: scrieți nota pe comandă și ajunge singură la Mircea. Nu mai trebuie copiată pe WhatsApp.
- Atenție: Mircea vede **tot** ce scrieți în note, inclusiv „are credit” sau costuri. Ce nu vreți să vadă, nu scrieți în notă.

Ghidul: [Servicii imobiliare prin topograf](../admin/servicii/imobiliare-topograf.md).

---

## Ce s-a schimbat

`GET /api/collaborator/orders/[id]` citește acum `order_history` (`note_added` și `status_changed` cu notă) și întoarce `teamNotes`, filtrate de `teamNotesForCollaborator()` (`src/lib/collaborator/team-notes.ts`):

- intră: notele echipei („Echipa”), notele și notele de status ale colaboratorului („Tu”), notele automate („Sistem”);
- nu intră: ecourile mesajelor cu clientul („Mesaj trimis clientului…”, „Mesaj de la client…”), schimbările de status automate, alte evenimente;
- `changed_by` (email/nume operator) nu iese din server.

Pagina `/colaborator/orders/[id]` arată caseta după „Date pentru lucrare” și o reîncarcă după „Adaugă notă”. Test: `tests/unit/lib/collaborator/team-notes.test.ts`.

Cauza: E-260813-LEWDD a stat 3 luni în așteptare. Adresa fusese notată la 07:34, iar Mircea a cerut-o la 10:47, fără să vadă nota. Pe E-260720-L4HSR, CNP-ul proprietarului stătea în note din 21.08.
