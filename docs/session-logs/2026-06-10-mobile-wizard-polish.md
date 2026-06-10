# Sesiune 2026-06-10 — Polish mobil wizard (contract+termeni, livrare)

**Status:** ✅ Aplicat (tsc + lint + build OK)
**Fișiere:**
- `src/components/orders/modules/signature/SignatureStep.tsx`
- `src/components/orders/modules/signature/ContractPreview.tsx`
- `src/components/orders/steps-modular/delivery-step.tsx`

---

## Feedback user (mobil)

1. Contractul se încarcă greu / nu e user-friendly; după semnare să apară o **căsuță „termeni și condiții" sub semnătură**, bifată automat — ca în proiectul soră `cazierjudiciaronline.com` (`Step5Contract.tsx`).
2. La livrare, **iconițele curier** (Fan/Sameday) par butoane — lumea crede că trebuie apăsate.
3. La **Județ / Localitate pe mobil** câmpurile sunt stricate (Localitate iese din ecran) — fiecare pe rândul lui.

## Ce s-a făcut

### 1. Căsuță termeni sub semnătură (`SignatureStep.tsx`)
- Adăugat checkbox „Am citit și sunt de acord cu Termenii… / Politica…" + textul legal (OUG 34/2014, Legea 214/2024, eIDAS) — exact sub cardul de semnătură.
- Se **bifează automat la semnare** (semnarea = consimțământ; `handleEnd` setează deja `consent`), dar poate fi debifată independent.
- `isFormValid` cere acum **semnătură ȘI termeni acceptați** (când `config.required`). Mesaj de avertizare dacă a semnat dar nu a bifat.
- Mapare: un singur checkbox setează toate cele 3 flag-uri de consimțământ (`termsAccepted`/`privacyAccepted`/`withdrawalWaiver`).

### 2. Contract mai compact pe mobil (`ContractPreview.tsx`)
- Înălțime `max-h-[300px]` pe mobil (era `500px` fix), `max-h-[500px]` de la `sm` în sus; padding `p-3 sm:p-6`. Expand/collapse rămâne.

### 3. Iconițe curier decorative (`delivery-step.tsx`)
- Eliminat „pătratele albe" cu shadow/border care arătau ca app-icons tappabile; acum sunt logo-uri inline simple, cu `pointer-events-none select-none` + `aria-hidden`.

### 4. Județ / Localitate full-width pe mobil (`delivery-step.tsx`)
- Pe FormItem-urile County și City: `col-span-2 sm:col-span-1`. Pe mobil ocupă tot rândul (stivuite); de la `sm` rămân unul lângă altul. Restul câmpurilor scurte (Bloc/Scară/Etaj/Apartament) rămân 2-col.

## Note / follow-up

- Checkbox-ul de termeni există și în Review step (auto-bifat) — acum apare și sub semnătură, unde cere userul. Nu am eliminat cel din Review (confirmare finală).
- „Se încarcă greu" = render server DOCX→HTML la `/api/contracts/preview`. Am făcut preview-ul mai compact pe mobil; optimizarea vitezei de generare e un follow-up separat dacă rămâne lent.

## Verificare
- `npx tsc --noEmit` → 0; `eslint` → 0 erori; `npm run build` → OK.
