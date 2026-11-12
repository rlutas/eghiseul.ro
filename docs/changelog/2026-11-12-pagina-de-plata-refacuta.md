# 12.11.2026 — Pagina de plată („Finalizare comandă”) refăcută
<!-- categorie: clienti -->

## Pentru echipă

Pagina pe care clientul plătește arată altfel, pe toate site-urile (eghiseul,
documentero, cazierfiscal, constatator). Nu s-a schimbat nimic din ce face,
doar cum arată:

- e mai lată, iar **rezumatul comenzii** încape pe rânduri întregi, ca în
  formular (înainte „Timp estimat” și livrarea se rupeau pe mai multe rânduri);
- **cuponul** aplicat e un rând scurt: „Reducere aplicată: COD — Economisești X
  RON”, cu „Elimină” în dreapta;
- la **Card bancar** apar logourile Visa, Mastercard, Apple Pay și Google Pay;
- butonul spune suma: „Plătește 194,93 RON”;
- jos apare **footerul complet** al site-ului, nu doar banda cu datele firmei.

Dacă un client vă trimite o captură, așa arată acum pagina. Linkurile de plată
rămân aceleași.

---

## Tehnic

- `src/app/(order)/comanda/checkout/[orderId]/page.tsx`: container
  `max-w-[1200px]` (era `max-w-5xl`), grilă `minmax(0,1fr) / 400px` (420px de
  la `xl`), titlu H1 propriu, `Card` fără `py-6`/`gap-6` implicite (lăsau gol
  deasupra metodelor de plată), `BrandFooter` în locul `OrderFlowDisclosure`.
- `PaymentMethodSelector`: `fieldset` + `legend`, radio desenat, logouri la
  card. `PaymentMarks` folosește `/images/footer/payment-methods.webp` (aceeași
  imagine ca în footer).
- `CouponInput`: fără `Card`; starea aplicată nu mai taie codul pe telefon;
  câmpul are `label`, `aria-invalid`, `aria-describedby`.
- `OrderSummaryCard`: „Timp estimat: N zile lucrătoare” e un singur text (în
  `inline-flex` eticheta și valoarea se rupeau separat).
- `.claude/rules/content-and-seo.md` §7: checkout-ul are footer, nu
  `OrderFlowDisclosure`.

Verificat local în browser pe o comandă de test: desktop 1408px și 1280px,
telefon 390px, ambele metode de plată. Paleta celorlalte branduri vine din
tokenii `[data-brand]`; nu a fost verificată vizual pe ele.
