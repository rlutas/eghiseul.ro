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

## Cazuri istorice — curățate pe 15.09.2026 cu „Reconciliază"

| Platformă | Comandă | Refund (Stripe) | Storno | Factura de 30% |
|---|---|---|---|---|
| eghiseul | E-260915-M4A4V | `re_…1sW0r8Lb`, 138,60 (automat) | — (factura nu se emisese la plată) | EGH-0681 (59,40) |
| eghiseul | E-260819-BWB6G | `re_…0ObFAPAv`, 138,60 (automat) | EGH-0474 (manual, 19.08) | EGH-0475 (manual, 19.08) — ⚠️ EGH-0682 emisă azi la reconciliere e DUPLICAT, de anulat din Oblio |
| eghiseul | E-260802-TDXDU | 138,60 (03.08) | EGH-0245 (manual) | EGH-0246 (manual) — legate acum |
| eghiseul | E-260708-J6EEX | 1.497 integral (08.07) | EGH-0008 (manual) | — (refund integral) |
| CJO | CJO-20260811-23113 | 138,60 (12.08) | EGH-0377 (manual) | EGH-0378 (manual) — legate acum |
| CJO | CJO-20260804-15831 | 25 (Modifică, 06.08) | EGH-0288 pe factura suplimentară EGH-0287 | — |
| CJO | CAO-20260915-26899 | `re_…0RJiohBt`, 138,60 (manual din dashboard) | EGH-0683 (−198, încasarea inițială ștearsă) | EGH-0684 (59,40) |

Facturile de 59,40 emise azi (EGH-0681, EGH-0684) sunt încasate cu cardul pe
PaymentIntent-ul comenzii. De atunci butonul verifică întâi în Oblio dacă există
deja o factură pe același client cu aceeași sumă (emisă manual) și o leagă în
loc să emită alta. Pe EGH-0679 (CJO) nu a rămas nicio încasare
nealocată — nu apare credit fantomă pe client.

Vezi și: [Storno + Reemite factură](storno-reemite.md) (corecturi de facturi,
nu anulări) și `../changelog/2026-08-03-oblio-credit-fantoma-storno.md` (de ce
stornoul șterge acum și încasarea).
