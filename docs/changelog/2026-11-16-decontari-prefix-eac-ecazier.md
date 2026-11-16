# 16.11.2026 — Decontări: comenzile de cazier auto de pe ecazier nu mai apar „nefacturat” fără număr
<!-- categorie: plati -->

## Pentru echipă

În decontarea Stripe din 13.11 apărea un rând fără număr de comandă și cu „nefacturat”: o plată de 252 lei pentru un cazier auto comandat pe ecazier.ro. Comanda exista, doar că pagina de decontări nu o recunoștea.

După ce apăsați „Sincronizează” în Decontări, rândul primește numărul comenzii și factura ei, dacă factura a fost emisă. Dacă rămâne „nefacturat” și după sincronizare, atunci factura chiar lipsește și trebuie emisă.

Al doilea rând roșu din aceeași decontare, rambursarea de 916,16 lei la E-260711-TFVDH, are altă cauză și nu se rezolvă prin sincronizare; vezi mai jos.

---

## Cauza la rândul fără comandă

Numărul comenzii se citește din descrierea plății din Stripe („Cazier Auto Online - PF Standard - EAC-20261110-21848”). Lista de prefixe cunoscute avea `EJC-` și `EFC-` (ecazier judiciar și fiscal), dar nu `EAC-` (ecazier auto). Fără prefix recunoscut, rândul rămânea fără comandă, fără client din baza de date și fără factură.

Aceeași greșeală ca pe 02.10, la `EFC-`: atunci s-a adăugat doar prefixul care a apărut, nu toate.

## Ce am schimbat

`src/lib/accounting/payout-sync.ts`: `EAC` adăugat în `ORDER_RE` și în `CJO_PREFIXES`. Acum sunt acoperite toate prefixele pe care le generează site-urile soră: CJO, CAO, CFO, CIC, EJC, EFC, EAC (verificat în configurările din repo-ul cazierjudiciaronline.com).

Teste: `tests/unit/lib/accounting/payout-order-prefix.test.ts` (3), cu toate cele șapte prefixe.

Rândurile vechi se actualizează doar la sincronizare.

## Rambursarea E-260711-TFVDH (−916,16 lei), nerezolvată aici

Comanda e de 1.308,80 lei, din 11.07, cu starea „Rambursată”. Suma rambursată e exact 70% din total, adică regula de anulare cu reținere de 30%.

Rândul e „nefacturat” pentru că pe comandă nu e înregistrată nicio factură de stornare. Asta se întâmplă când banii au fost returnați fără să treacă prin fluxul de anulare din admin, care emite stornarea și factura de 30%.

Nu am putut citi comanda din baza de date în sesiunea asta, deci nu știu dacă stornarea lipsește cu adevărat din Oblio sau doar nu e legată de comandă. De verificat în Oblio: există o stornare pentru factura acestei comenzi și o factură nouă de 392,64 lei (30%)? Dacă nu, se emit din pagina comenzii, din fluxul de anulare, pe modul de reconciliere. Procedura: [`../admin/`](../admin/README.md), anulare cu reținere.
