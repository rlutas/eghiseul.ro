# 18.11.2026 — Documentele rămân vizibile pe comenzile anulate și rambursate
<!-- categorie: comenzi -->

## Pentru echipă

Până azi, când o comandă ajungea pe „Rambursată” sau „Anulată”, din pagina ei dispărea tot cardul cu documente: contractul, contractul de asistență, împuternicirea. Așa s-a întâmplat la E-260711-TFVDH, unde am returnat 70% și am păstrat 30% pentru munca deja făcută, iar după schimbarea statusului nu mai aveați cum să arătați ce s-a lucrat.

De acum, pe o comandă anulată sau rambursată:

- cardul se numește „Documente și demersuri — comandă anulată” și arată toate documentele generate, cu „Previzualizare”, „Descarcă PDF” și „Word”;
- butoanele „Generează” și „Regenerează” nu mai apar acolo: documentele sunt dovada muncii făcute și rămân exact cum erau la data lor;
- pașii făcuți (plată, generare documente, depunere, note, așteptare client, rambursare) sunt în „Istoric comanda”, în josul paginii, ca și până acum.

Dacă un client contestă reținerea de 30%, de aici luați documentele și datele din istoric. Procedura de anulare: [anulare cu refund 70%](../admin/anulare-refund-70.md).

---

## Cauza

`ProcessingSection` din pagina comenzii întorcea `null` pentru `draft`, `abandoned`, `cancelled` și `refunded`. Lista de documente generate stă în același card cu butoanele de procesare, deci dispărea odată cu ele. Datele nu s-au pierdut: comanda are 4 rânduri în `order_documents` și 21 în `order_history`, iar „Istoric comanda” nu depinde de status.

## Ce am schimbat

- `src/lib/admin/processing-section-mode.ts` (nou): `processingSectionMode(status)` întoarce `hidden` (draft, abandoned), `readonly` (cancelled, refunded) sau `full` (orice alt status, inclusiv unul necunoscut).
- `src/app/(eghiseul)/admin/orders/[id]/page.tsx`: în modul `readonly` cardul rămâne, cu alt titlu și o notă; se ascund butonul de acțiune, trimiterea la colaborator și „Generează / Regenerează”; rândurile fără document nu se afișează; bifele de la „Opțiuni extra” sunt dezactivate.
- Teste: `tests/unit/lib/admin/processing-section-mode.test.ts` (4).

Regenerarea e oprită intenționat: fișierul se salvează sub aceeași cheie, deci o regenerare ar înlocui documentul de la data depunerii.

## Rămas deschis la E-260711-TFVDH

Partea fiscală e neschimbată față de 16.11: pe comandă nu e înregistrată suma rambursată, factura EGH-0026 apare nestornată, iar factura de 30% (392,64 lei) neemisă. Se rezolvă cu „Reconciliază (Stripe + facturi)” de pe pagina comenzii; butonul emite documente fiscale, deci îl apasă Raul. Detalii: [16.11, decontări](2026-11-16-decontari-prefix-eac-ecazier.md).

Neverificat în browser: schimbarea e verificată prin teste, type check și lint, nu prin deschiderea paginii comenzii.
