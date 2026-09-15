# Anulare în 30 de minute: refund 70% + factura de 30%

Clientul poate anula singur comanda în primele 30 de minute după plată (Termeni,
secțiunea 8). Primește înapoi **70%**, noi reținem **30%** (comisioane + lucrul
început). Aceeași regulă pe eghiseul.ro și pe cazierjudiciaronline.com / ecazier.

## Ce vezi în admin

Comanda ajunge pe statusul **„Anulare solicitată"** (banner roșu) și **dispare
de la colaborator** (topograf) din listă și din pagina de detaliu — nu mai e o
lucrare.

## Ce apeși

1. **„Procesează refund … RON"** (banner roșu). Un singur click face tot:
   - refundul de 70% prin Stripe, pe contul pe care s-a încasat comanda;
   - comanda trece pe **„Refundat"**;
   - factura inițială (dacă există) este **stornată** în Oblio (ajunge în SPV);
   - se emite **factura taxei de anulare** pentru cei 30% reținuți, încasată
     cu cardul (aceeași plată).
2. Dacă Stripe **refuză** refundul: comanda RĂMÂNE pe „Anulare solicitată" și
   bannerul arată eroarea exactă. Dai banii înapoi **manual din Stripe** (link
   în banner, exact suma afișată), apoi apeși **„Am refundat manual"** (poți
   lipi id-ul `re_…`). Restul (status, storno, factură de 30%) se face automat.
   Poți și să reîncerci refundul automat.
3. După refund, bannerul devine:
   - **verde** — refund automat/manual cu id-ul Stripe, storno + factura de 30%
     emise. Nimic de făcut.
   - **galben** — lipsește ceva (id-ul refundului, stornoul sau factura de
     30%). Apasă **„Reconciliază (Stripe + facturi)"**: caută refundul în
     Stripe și emite documentele lipsă. Se poate apăsa de câte ori e nevoie,
     nu emite nimic de două ori.

## Ce NU faci

- Nu muta comanda pe „Refundat" din dropdown-ul de status — nu pleacă niciun
  ban și nu se emite nicio factură.
- Nu stornezi din Oblio de mână înainte să apeși butonul; dacă totuși ai
  făcut-o, butonul vede că factura e deja stornată și emite doar factura de 30%.
- Nu emite factura de 30% de mână — o emite butonul, cu încasarea legată de
  plata cu cardul, ca în Decontări să iasă socoteala.

## Ce vede contabilul în Decontări

Rambursarea din payout-ul Stripe apare pe comanda ei (nu pe „necunoscut") și
poartă **numărul stornoului**; încasarea inițială rămâne pe factura inițială,
iar factura de 30% e pe pagina comenzii. Refundurile date din dashboardul
Stripe (fără buton) se leagă tot de comandă la următorul sync, dar nu au storno
până nu apeși „Reconciliază".

## Cazuri istorice de curățat (15.09.2026)

| Platformă | Comandă | Situație | Ce faci |
|---|---|---|---|
| eghiseul | E-260915-M4A4V | refund 138,60 dat automat; factura nu s-a emis la plată (Oblio a picat), deci nici cei 59,40 n-au document | „Reconciliază" → leagă refundul + emite factura de 59,40 |
| eghiseul | E-260819-BWB6G | EGH-0471 stornată manual (EGH-0474) pe 19.08; 59,40 fără factură | „Reconciliază" → factura de 59,40 |
| CJO | CAO-20260915-26899 | refund 138,60 dat manual din Stripe; EGH-0679 (198) NEstornată; 59,40 fără factură | „Reconciliază" → storno + factura de 59,40 |

Vezi și: [Storno + Reemite factură](storno-reemite.md) (corecturi de facturi,
nu anulări) și `../changelog/2026-08-03-oblio-credit-fantoma-storno.md` (de ce
stornoul șterge acum și încasarea).
