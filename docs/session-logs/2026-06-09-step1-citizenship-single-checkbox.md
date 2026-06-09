# Sesiune 2026-06-09 — Pasul 1 cetățenie: o singură bifă „Sunt cetățean străin"

**Status:** ✅ Aplicat (tsc + lint + build OK, 1036 teste pass)
**Fișier:** `src/components/orders/steps-modular/contact-step.tsx`

---

## Cerință

Feedback user: „la pasul 1 la cetățean să fie doar o bifă cu iconiță «sunt cetățean străin» — dacă bifează e străin, dacă nu, e român. Să facem simplu formularul."

## Înainte

`CitizenshipToggle`: 2 butoane mari („Cetățean român" / „Cetățean străin") + un sub-selector amber UE vs non-UE (`foreignType`).

## După

`ForeignCitizenCheckbox`: **o singură bifă** cu iconiță Globe — „Sunt cetățean străin". Nebifat = român (default). Sub-selectorul UE/non-UE a fost **eliminat** complet.

- Lista de țări de naștere (`ForeignBirthFields`) arată acum lista completă mondială (`getCountriesForForeignType(undefined)`), nu mai e filtrată UE/non-UE.
- La bifare/debifare: `updateContact({ citizenship: foreign ? 'foreign' : 'romanian', foreignType: undefined })`.

## Ce NU s-a schimbat (intenționat)

- **Preț / SLA:** taxa `cetatean_strain` (+7 zile) se aplică pentru orice `citizenship !== 'romanian'` — neafectată de eliminarea UE/non-UE.
- **Mapping personalKyc** (`PersonalDataStep.tsx`): `foreign` + `foreignType` undefined → `'european'` (exact default-ul anterior, când toggle-ul pornea pe `'eu'`). Deci documentele cerute la pasul 2 rămân identice cu comportamentul implicit dinainte: pașaport + permis de rezidență + selfie. Zero schimbare de flux pentru cetățeni străini.
- **Admin** (`orders/[id]/page.tsx`): afișează deja generic „Cetatean strain" când `foreignType` lipsește (fallback exista).

## Verificare

- `npx tsc --noEmit` → exit 0
- `eslint` contact-step → 0 erori (1 warning preexistent la `form.watch`)
- `npm run build` → OK
- `vitest run tests/unit` → **1036 passed**

## Notă

Distincția UE vs non-UE mai exista doar pentru: lista de țări filtrată + o etichetă în admin + `registration_cert` vs `residence_permit` în `FULL_KYC_CONFIG`. Am ales calea cu cel mai mic risc (toți străinii → `european` → `residence_permit`, ca default-ul vechi). Dacă pe viitor trebuie reintrodusă distincția pentru documentul corect (certificat înregistrare UE vs permis ședere non-UE), se poate adăuga ulterior fără a complica pasul 1.
