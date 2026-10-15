# Plată extra încasată fără factură: ce faceți

Se aplică pe **eghiseul.ro** și, din 15.10.2026, la fel pe **cazierjudiciaronline.com** (dashboard-ul și pagina comenzii din adminul CJO).

## Cum funcționează normal

Când cereți clientului o plată suplimentară din pagina comenzii („Modifică” → link de plată extra):

1. se emite automat o **proformă** (seria PEGH) pentru suma extra;
2. clientul plătește cu cardul din link;
3. imediat după plată se emite automat **factura fiscală** (seria EGH), din proformă, cu încasare pe card;
4. factura apare pe pagina comenzii, la „Facturare”, sub factura principală.

Nu apăsați nimic: dacă totul merge, factura există în câteva secunde de la plată.

## Când factura nu s-a emis

Uneori Oblio nu răspunde în momentul plății. Atunci vedeți:

- pe **pagina comenzii**, un banner roșu „Plată extra încasată fără factură”, cu suma, data plății și proforma;
- pe **dashboard-ul admin** (`/admin`), o casetă roșie cu toate plățile extra încă nefacturate și link spre fiecare comandă;
- în **Decontări**, plata apare ca „plată extra, factură neemisă (proforma …)”, nu cu factura comenzii.

Sistemul reîncearcă singur emiterea **din oră în oră**. De obicei avertismentul dispare singur la următoarea oră.

## Ce faceți dacă avertismentul rămâne peste o zi

1. Deschideți comanda din caseta roșie de pe dashboard.
2. În Oblio, găsiți proforma afișată în banner (ex. PEGH-0008) și emiteți factura din ea („Facturează”), cu încasare pe card. Sau scrieți-i lui Raul numărul comenzii și o emitem noi.
3. Anunțați contabilitatea: numărul comenzii, suma, data plății și numărul facturii noi.
4. După ce factura e emisă, avertismentul dispare la următoarea verificare (din oră în oră), iar în Decontări plata se leagă de factura nouă la următoarea sincronizare (zilnic sau butonul „Sincronizează” / „90z” din Decontări).

## De ce contează

Fără factură, banii încasați nu au document fiscal, iar contabilul vede în extras o sumă pe care n-o poate pune pe nicio factură. Cazul de la care a pornit procedura: comanda E-260817-J2BXD, 200 lei plătiți pe 03.09.2026, factură emisă abia pe 14.10.2026 (EGH-0857), după ce contabilul a observat că factura principală EGH-0439 apărea „încasată de două ori”. Pe CJO: comanda CJO-20260901-27360, 250 lei pentru DHL plătiți pe 08.09.2026, factură emisă pe 15.10.2026 (EGH-0873).
