# 20.11.2026 — Semnătura prin acceptare: bifă la plată și nume scris de mână în contract
<!-- categorie: documente -->

## Pentru echipă

- La serviciile unde clientul **nu semnează cu degetul** (extras carte funciară, identificare imobil, certificat constatator, cazier auto) apare acum, la ultimul pas, o **bifă obligatorie**. Prin ea clientul acceptă termenii și contractul. Fără bifă nu poate plăti.
- Sub bifă, clientul poate deschide contractul pe care îl acceptă.
- În contract, la Beneficiar, numele apare **scris de mână**. Sub el scrie „Semnat electronic prin acceptare online” și data, ora și adresa IP.
- Comenzile plasate **înainte de azi** rămân cum erau: au doar numele tipărit, fără semnătură. Nu le regenerați ca să „apară semnătura”. Pe ele acordul nu a fost înregistrat.
- Dacă un client întreabă de ce nu are semnătura desenată, răspunsul e: la acest serviciu contractul se încheie la distanță, prin plasarea comenzii, cu data, ora și IP-ul înregistrate în contract.

---

## Rezumat tehnic

**Cauza.** Pasul Review a fost scos pe 27.05.2026. De atunci, serviciile fără pasul `signature` nu mai aveau nicio bifă de consimțământ. Checkout-ul spunea doar „Apăsând Plătește accepți…”. `/submit` scria `signature_metadata.consent.*` = `false` pe toate comenzile acestor servicii: 67 de comenzi în ultimele 30 de zile. Contractul arăta doar `{{NUMECLIENT}}` în celula clientului. Raportat pe E-261109-754AK.

**Ce s-a schimbat**

- `src/components/orders/steps-modular/acceptance-consent.tsx`: bifă combinată (T&C, confidențialitate, renunțare la retragere, acceptarea contractului ca semnătură electronică simplă). Se randează în `modular-order-wizard.tsx` pe ultimul pas, când nu există pasul `signature` și comanda nu e telefonică. `handleNext` blochează plata fără bifă. `signatureConsent` = bifa, când nu există semnătură desenată.
- `src/lib/documents/typed-signature.tsx`:
  - `renderTypedSignaturePng()` randează un PNG de 640×224 cu `next/og`. Numele e scris cu fontul Allura (OFL, `src/templates/fonts/`), iar legenda cu Liberation Sans.
  - `resolveClientSignature()` alege semnătura: cea desenată, dacă există; altfel cea tipărită, **doar** dacă `terms_accepted === true`; altfel niciuna.
- `generateDocument`: opțiunea nouă `clientSignatureTyped` folosește dimensiunea `TYPED_SIGNATURE_SIZE` (200×70 pt).
- Unde s-a legat semnătura:
  - `auto-generate.ts` și ruta admin `generate-document` folosesc `resolveClientSignature`.
  - `/api/contracts/preview` acceptă `typedSignature: true`.
  - `ContractPreview` primește prop-ul `typedSignature`.

**Deschise**

- Textul contractului citează Legea 455/2001 (abrogată), iar UI-ul citează 214/2024. Șablonul `contract-prestari.docx` trebuie actualizat.
- La `cazier-auto` pasul de semnătură e dezactivat, deși serviciul are împuternicire. De verificat.
