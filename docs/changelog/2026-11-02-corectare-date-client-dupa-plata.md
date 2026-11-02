# 02.11.2026 — Corectarea datelor clientului pe comenzi plătite
<!-- categorie: comenzi -->

## Pentru echipă

- Pe pagina comenzii plătite apare butonul **„Corectează datele clientului”**, sub „Corectează contact”.
- Se pot corecta: numele, prenumele, CNP-ul, data și locul nașterii, prenumele părinților și adresa din act. Se salvează doar câmpurile pe care le schimbați.
- După salvare, **regenerați cererea și împuternicirea**: cele generate înainte au datele vechi. Mesajul de confirmare vă amintește.
- Factura deja emisă nu se schimbă de aici. Datele de facturare se corectează în Oblio.
- Pe comenzile anulate sau rambursate corectarea nu e disponibilă.
- Procedura: [Pagina comenzii](../admin/pagina-comenzii.md).

---

## Tehnic

- Cerere din Ghid (07.10, E-261007-K59HB): datele clientului nu se puteau corecta după plată; exista doar „Corectează contact” (email + telefon).
- `PATCH /api/admin/orders/[id]/edit-draft` acceptă acum orice status în afară de `cancelled`/`refunded`. Pe status de după plată: nu setează `admin_edited_at` (nu mai e formular de hidratat), refuză `billing` dacă `invoice_number` există (409), scrie în `order_history` cu `event_type='admin_action'` și `new_value.after_payment=true`, iar răspunsul conține `afterPayment` și `documentsToRegenerate` (tipurile din `order_documents`).
- UI: `PaidClientDataEditInline` în `src/app/(eghiseul)/admin/orders/[id]/page.tsx`, afișat în afara statusurilor `draft/pending/abandoned/awaiting_payment/cancelled/refunded`; trimite doar diferențele față de valorile curente.
- Istoricul păstrează doar căile câmpurilor, nu valorile (fără date personale).
