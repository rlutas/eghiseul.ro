# Sesiune 2026-06-10 (2) — Polish mobil: livrare, checkout, status, contract

**Status:** ✅ Aplicat (tsc + lint + build OK)
**Fișiere:**
- `src/components/orders/steps-modular/delivery-step.tsx`
- `src/components/orders/help-contact-card.tsx` + `src/app/comanda/status/page.tsx`
- `src/app/comanda/checkout/[orderId]/page.tsx`
- `src/app/comanda/success/[orderId]/page.tsx`
- `src/components/orders/modules/signature/ContractPreview.tsx`

---

## Feedback user (mobil) + ce s-a făcut

### Livrare
1. **Localitate ca input cu căutare** — înlocuit `<Select>`-ul nativ (lista lungă, lentă) cu `SearchableSelect` (type-to-search, max 8 vizibile). Stări dedicate „Selectează județul mai întâi" / „Se încarcă localitățile...".
2. **Carduri opțiuni livrare** — scos indicatorul radio (selecția se vede prin border/umbra cardului); „X zile lucrătoare" pe **un singur rând** (`whitespace-nowrap`); logo 44px, text trunchiat, preț `whitespace-nowrap` — încap pe un rând pe mobil.
3. **Fără preselecție** — eliminat auto-select al celei mai ieftine opțiuni. Userul trebuie să aleagă activ (validarea pasului cerea deja o selecție → „Continuă" rămâne dezactivat până alege).
4. **Selector locker** — header „Selectați FANbox-ul" pe un rând, „sortate după distanță" pe rândul de sub; scos radio-ul din fiecare rând de locker (selecția = fundal colorat + icon plin).

### Checkout
5. **Buton dublu pe mobil** — butonul sticky „Completează plata" plătea indirect (doar scrolla la al doilea buton). Acum, la plată cu cardul, **declanșează direct plata** (`handleCardCheckout`), cu spinner „Se procesează...". La transfer bancar rămâne scroll la detalii.

### Confirmare plată (success)
6. **Cod comandă dublu** — scos badge-ul verde de sus (ocupa mult loc pe mobil). Codul rămâne în `OrderSummaryCard` dedesubt.

### Status comandă
7. **Număr WhatsApp greșit** — default corectat la **+40 757 708 181**. ⚠️ Dacă pe Vercel e setat `NEXT_PUBLIC_SUPPORT_PHONE` cu numărul vechi, **trebuie actualizat și acolo** (env-ul are prioritate peste default).
8. **WhatsApp precompletat** — mesajul include acum **codul comenzii + „eghiseul.ro"** ca suportul să știe din ce comandă/site vine (`HelpContactCard` primește `orderCode`).

### Contract
9. **Padding stânga / „treaptă"** — contractul (DOCX→HTML via mammoth) emitea indentări Word (`margin-left`/`text-indent`/liste). Adăugat reset în `contractPreviewStyles` ca textul să fie edge-to-edge pe mobil (tabelele de semnătură rămân neatinse).

---

## TVA / prețuri livrare — INVESTIGAT, FĂRĂ modificare în cod

User suspecta că la opțiunile de livrare se adaugă TVA pe deasupra și se plătește mai mult. **Verificat calculul** (`modular-wizard-provider.tsx` priceBreakdown):

```
totalPrice = bază + opțiuni + livrare − discount   // FĂRĂ TVA adăugat separat
```

- Prețurile (serviciu, opțiuni, livrare) sunt **cu TVA inclus**; pe cardul de livrare se afișează `priceWithVAT` = exact suma adăugată la total. **Nu se dublează TVA-ul** la ce plătește clientul.
- Singurul lucru „în plus" la livrare = **markup 15%** (`DELIVERY_MARKUP_PERCENTAGE`), deja inclus în prețul afișat — costul nostru, intenționat.
- Constatare de decis (NU am schimbat): **Sameday** calculează intern TVA **19%** (`sameday.ts` 0.19) iar `courier/utils.ts` are default 0.19, în timp ce sistemul folosește **21%**. Afectează doar linia de TVA de pe factură, nu totalul plătit. De aliniat la 21% dacă vrem consistență — necesită confirmare (schimbă ușor prețurile Sameday afișate).

→ **Recomandare:** dacă vrei să aliniem Sameday la 21% sau să schimbăm markup-ul, confirmă și fac separat (logică de bani, nu o ating fără OK).

## Verificare
- `npx tsc --noEmit` → 0; `eslint` → 0 erori; `npm run build` → OK.

## Follow-up rămas
- Lockerele (FANbox/EasyBox) tot se încarcă din `/api/courier/pickup-points` (cache 10 min) — dacă rămâne lent, optimizare API separată.
- Aliniere TVA Sameday 19%→21% (de confirmat).
- Verificat env Vercel `NEXT_PUBLIC_SUPPORT_PHONE`.
