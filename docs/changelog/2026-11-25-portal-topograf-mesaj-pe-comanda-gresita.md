# 25.11.2026 — Portal topograf: mesaj trimis pe comanda greșită
<!-- categorie: comenzi -->

## Pentru echipă

- **Ce s-a întâmplat:** pe 24.11, răspunsul topografului pentru clientul comenzii E-260813-LEWDD (copia unui act notarial) a fost trimis din pagina altei comenzi, E-261124-L79M5. Acea comandă era deja finalizată. Clientul de pe LEWDD nu a primit răspunsul, iar celălalt client a primit pe email un mesaj care nu era pentru el.
- **De făcut de echipă (25.11):** retrimiteți răspunsul pe comanda corectă (LEWDD), apoi trimiteți pe L79M5 un mesaj scurt de scuze că mesajul anterior a ajuns acolo din greșeală.
- **Ce se schimbă în portalul topografului:**
  - deasupra căsuței de mesaj scrie acum cui îi scrii: numele clientului și numărul comenzii;
  - la „Trimite clientului” apare o confirmare: „Trimiți lui … (comanda …)?”, cu butoanele „Nu” și „Da, trimite”;
  - pe o comandă finalizată sau anulată apare un avertisment galben, iar confirmarea întreabă „Comanda e închisă. Sigur trimiți…?”.
- **Pentru topograf:** înainte de „Da, trimite”, verifică numele din confirmare. Când răspunzi la un mesaj de client, deschide comanda din lista de mesaje necitite, nu dintr-o fereastră deja deschisă.
- Admin-ul nu se schimbă: acolo mesajele se scriu tot din fereastra pop-up „Mesaje cu clientul”.

---

**Cauza:** în cod nu e nicio eroare. Fiecare pagină de comandă trimite pe propriul endpoint (`/api/collaborator/orders/[id]/messages`). Cel mai probabil erau două comenzi deschise, iar mesajul a fost scris în fereastra greșită. Nimic din pagină nu arăta cui pleacă mesajul. Emailul către client conține tot textul mesajului (`order-message.ts`), deci o greșeală de comandă înseamnă că alt client primește textul.

**Ce s-a schimbat în cod:**
- `OrderMessagesPanel` primește proprietatea opțională `recipient` (`orderNumber`, `clientName`, `closedLabel`). Când e setată:
  - deasupra căsuței apare o bandă albastră cu destinatarul;
  - pentru `closedLabel` apare o bandă galbenă cu avertismentul;
  - „Trimite clientului” deschide pasul de confirmare, iar trimiterea pornește doar din „Da, trimite”.
- Fără `recipient`, adică în admin, comportamentul rămâne cel de până acum.
- În portal (`colaborator/orders/[id]`):
  - numele clientului vine din `identifiableName()` + `formatPersonName()`; dacă lipsește, se folosește `requester_name`;
  - `closedLabel` e setat pentru `completed`, `cancelled`, `refunded`, `shipped`, `delivered`;
  - `key={orderId}` pe panou golește ciorna când se schimbă comanda.
