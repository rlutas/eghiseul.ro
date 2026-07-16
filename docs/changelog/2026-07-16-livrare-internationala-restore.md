# 2026-07-16 — Fix livrare internațională + erori vizibile în tot wizardul

## Partea 2 — „Continuă" blocat fără explicație → erori vizibile + scroll (TOT wizardul)

Observația lui Raul: clienții se blochează pe orice pas fără să vadă ce câmp lipsește. Mecanismul `requestValidation()`/`validationAttempt` exista, dar doar 3 pași din 13 îl ascultau și nimeni nu ducea utilizatorul la problemă.

**Nou:** `src/lib/wizard/scroll-to-first-error.ts` — după click pe „Continuă" pe pas invalid, părintele face scroll + focus la primul element marcat: `[data-wizard-error]`, `[aria-invalid="true"]` sau mesaj shadcn `FormMessage`. Apelat din `modular-order-wizard.tsx → handleNext`.

**Convenție pentru orice pas nou:** la `validationAttempt` bump (captură baseline la mount cu `useState(validationAttempt)` — NU citi ref în render, NU setState în effect, ambele pică lint), afișează lista „Ca să poți continua…" într-un container cu `data-wizard-error`. Pașii RHF apelează și `form.trigger()` ca să marcheze câmpurile neatinse.

**Pași acoperiți acum (toți):** contact (email/telefon trigger + tip client/scop/naștere străinătate), options (marker pe erori țară/limbă), delivery (listă lipsuri: metodă/regiune/adresă/curier/locker/adresă intl), billing (marker + baseline fix — înainte arăta erorile din prima dacă alt pas eșuase), review (chenar roșu pe consimțământ), client-type, civil-status (listă din checks[] cu etichete), constatator (idem), company-data (CUI lipsă/neverificat/invalid), company-documents (ce documente lipsesc), personal-kyc + kyc-documents (aveau liste — primesc marker scroll), property/vehicle/signature (aveau Alert — primesc marker scroll).

---

# Partea 1 — Fix livrare internațională: restore draft + destinatar persistat

**Incident:** client real blocat la pasul Livrare (E-260716-RAFUG, certificat celibat + apostilă → Germania, Poșta Română International). Butonul „Continuă" rămânea dezactivat fără nicio eroare vizibilă.

## Cauze (4, toate în wizard)

1. **Selecția internațională se pierdea la remount** — `physicalRegion` se inițializa hardcodat pe `'romania'` pentru orice metodă courier (`delivery-step.tsx`). La reload / navigare înapoi-înainte, clientul revedea fluxul România.
2. **Nume + telefon destinatar nu se persistau** — existau doar în formularul local (react-hook-form); orice remount le golea → schema zod invalida formularul.
3. **Țara putea fi ștearsă din draft** — cu `physicalRegion` greșit pe `'romania'`, watcher-ul formularului RO suprascria `delivery.address` fără cheia `country`.
4. **Zero feedback** — câmpurile obligatorii neatinse nu afișau erori (mode `onChange`), deci butonul stătea mort fără explicație.

## Fix

- **Nou:** `src/lib/delivery/international-delivery.ts` — `internationalAddressSchema` (mutată din componentă), `deriveIntlProvider()` (provider persistat sau fallback pe numele metodei pentru drafturi vechi), `derivePhysicalRegion()`.
- `delivery-step.tsx`: init `physicalRegion`/`intlProvider` prin helperi; `recipientName`/`recipientPhone` restaurate din `delivery.address` și incluse în sync-ul către context; `intlForm.trigger()` la mount pe draft parțial → erorile devin vizibile.
- `modular-wizard-provider.tsx`: `delivery_method` JSON salvează acum `provider` + `service`; server-resume le restaurează în `courierProvider`/`courierService`.
- `types/verification-modules.ts`: `AddressState` + `recipientName?`/`recipientPhone?`.
- Admin `orders/[id]`: cardul Livrare afișează rând „**Destinatar:** nume · telefon" — preferă destinatarul completat în formularul de livrare (internațional), cu fallback pe numele/telefonul clientului din comandă (domestic + comenzi vechi dinainte de persistarea destinatarului). Incluse și în butonul „Copiază adresa" (pentru AWB manual).

## Teste

`tests/unit/lib/delivery/international-delivery.test.ts` — 12 teste (schema: scenariul exact al incidentului, cod poștal DE 5 cifre, telefon; derivare provider/region incl. drafturi vechi fără provider). Suita completă: 1168/1168 ✅, `tsc --noEmit` curat.

## Operațional — client blocat pe draft

`/admin/orders` → filtru status **„Ciornă"** → deschide comanda → vezi toate datele completate + adresa. **NU** deschide link-ul de reluare al clientului în browser logat ca admin (incident hijack 2026-07-10).
