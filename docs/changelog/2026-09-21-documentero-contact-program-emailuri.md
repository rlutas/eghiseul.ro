# 21.09.2026 — documentero.ro: formular de contact nou, program 8–16, emailurile verificate
<!-- categorie: clienti -->

## Pentru echipă

- Programul afișat pe documentero.ro (contact, despre, footer) e acum
  **luni–vineri 08:00–16:00**, ca pe eghiseul. Clienții care scriu după 16
  primesc răspuns a doua zi.
- Formularul de contact de pe documentero.ro întreabă direct ce act, pentru
  ce țară și dacă are deja comandă. Mesajele ajung în aceeași căsuță ca
  până acum, dar cu **„[documentero]”** în subiect, ca să știți de pe ce site
  vine omul și să răspundeți cu numele potrivit.
- Emailurile pe care le primește un client documentero (confirmare, transfer
  bancar, documente de completat, act gata, recenzie, anulare, plată
  suplimentară, recuperare coș) au fost verificate unul câte unul: logo
  documentero, linkuri documentero, fără „eGhișeul”. Nu trebuie schimbat
  nimic manual la trimitere.
- Pe pagina „Ghiduri” apar doar ghidurile publicate (4). Cele „în lucru” nu
  se mai văd.

---

## Ce s-a livrat

- `src/components/documentero/contact-form.tsx`: formular pe tema d-*, câmpuri
  nume, email, act (select cu cele 4 acte + „altceva”), țară/instituție
  (opțional), telefon (opțional), cod comandă (opțional), mesaj; actul și țara
  intră în corpul mesajului; `subject` = `comanda` dacă e cod, altfel
  `intrebare`; buton „Sau scrie pe WhatsApp” lângă submit; notă „nu trimite
  poze cu acte aici”.
- `src/app/documentero/contact/page.tsx`: WhatsApp evidențiat, email și
  telefon secundare, card „Ai deja o comandă?” cu link la `/comanda/status/`.
- `src/app/api/contact/route.ts`: `getBrand()` → prefix `[documentero]` în
  subiectul emailului către inbox.
- `SUPPORT_HOURS_SHORT` (`L–V 08:00–16:00`, din `src/config/contact.ts`) în
  contact, despre, footer; înainte era hardcodat „L–V 9–18”.
- `ghiduri/page.tsx`: fără lista „în lucru”; cardurile „Ghiduri pe subiect”
  de pe servicii nu mai au placeholder-e (toate 3 linkuri reale).
- Emailuri: randate 12 șabloane cu `brand: BRANDS.documentero` (script în
  scratchpad, `npx tsx`), grep pe „eghi(ș|s)eul” = 0, toate `href` pe
  documentero.ro, logo `documentero-email-logo.png`; screenshot-uri pe
  confirmare, transfer bancar, act gata: OK.
- `docs/documentero/prompturi-poze.md`: tabel „ce lipsește, unde intră”, 11
  prompturi (2 noi: apostilă + pașaport; dosarul de acte).
