# 12.11.2026 — „Modifică comandă” nu mai cere înapoi reducerea de cupon
<!-- categorie: plati -->

## Pentru echipă

La o comandă plătită cu cupon (de exemplu Black Friday), când adăugați o
opțiune din „Modifică”, linkul de plată ieșea mai mare decât prețul opțiunilor:
sistemul uita reducerea și i-o cerea înapoi clientului.

Exemplu: cazier judiciar cu urgență, plătit 238,40 lei cu Black Friday
(reducere 39,60). La adăugarea traducerii (178,50) și a legalizării (99)
sistemul arăta 317,10 lei. Corect este **277,50 lei**.

De acum:

- opțiunile adăugate se taxează la prețul lor de listă, fără nimic în plus;
- reducerea primită la cumpărare rămâne a clientului;
- dacă scoateți o opțiune, se returnează exact prețul ei.

Dacă aveți deschisă o fereastră „Modifică” cu suma veche, închideți-o și
deschideți-o din nou. Procedura: [Modifică comandă plătită](../admin/modify-order.md).

---

## Tehnic

`computeModifyDiff` calcula `newTotal = bază + opțiuni + livrare`, fără
`orders.discount_amount`, și îl compara cu `total_price`, care e deja net de
reducere. Diferența conținea deci și reducerea.

- `src/lib/orders/modify-diff.ts`: `OrderForDiff.discount_amount`;
  `newTotal = subtotal − reducere`, cu reducerea plafonată la noul subtotal;
  `DiffResult.discount`.
- `modify/route.ts` trimite `discount_amount` din comandă.
- Teste noi în `tests/unit/lib/orders/modify-diff.test.ts` (cazul
  E-261111-ZHVGM, fără schimbări, opțiune scoasă, fără cupon, plafon).

**Limită:** reducerea e păstrată ca sumă fixă. La un cupon procentual pe tot
subtotalul, scoaterea unei opțiuni returnează prețul ei întreg, deși clientul
plătise pentru ea cu reducere. La cupoanele pe prețul de bază (Black Friday)
calculul e exact.

**Comenzi afectate înainte de reparație** (reducere + modificare după plată):
una singură, E-260719-LS53Y (22–27.07.2026): linkul de plată extra a fost de
824,50 lei, cu 37,65 lei peste prețul opțiunilor adăugate (cât reducerea
cuponului de recuperare). Nerambursat; decizia e a lui Raul.
