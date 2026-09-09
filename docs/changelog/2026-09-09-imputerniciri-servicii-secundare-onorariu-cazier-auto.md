# 2026-09-09 — Împuterniciri pe serviciile secundare + onorariu avocat pe cazier auto

Trei rapoarte de la echipă (07–09.09), toate pe același loc: **ce se întâmplă
când o comandă conține DOUĂ documente oficiale**.

## 1. 🔴 Împuternicirea serviciului secundar nu se genera

`computeDelegationItems()` (`src/lib/documents/delegation-items.ts`) decide
pentru ce se alocă numere de delegație. Lista de coduri era incompletă:

| Cod | Unde apare | Ce lipsea |
|-----|-----------|-----------|
| `addon_cazier_judiciar` | cazier judiciar adăugat pe o comandă de certificat de integritate | împuternicirea de cazier (E-260907-AMV62) |
| `certificat_pachet` | certificatul adăugat pe o comandă de extras multilingv | împuternicirea de certificat (E-260907-EJZM7) |
| `extras_multilingv` | extrasul adăugat pe o comandă de certificat | împuternicirea de extras |

Cererea de eliberare a serviciului secundar se genera deja (`computeCerereItems`
le cunoștea pe toate trei) — deci comanda avea cererea, dar nu și
împuternicirea, iar echipa o făcea de mână.

**Fix**

- `addon_cazier_judiciar` intră în `DELEGATION_REQUIRING_OPTION_CODES`.
- `certificat_pachet` / `extras_multilingv` sunt coduri **compuse** (serviciul
  lor depinde de serviciul principal al comenzii) → `resolveComposedDelegationSlug()`
  întoarce SLUG-ul serviciului secundar ca `service_type` al delegației
  (`certificat_pachet` pe `extras-multilingv-certificat-nastere` → `certificat-nastere`).
- Dedup pe `serviceType`: un document nu primește niciodată două delegații.
- `buildActivitatiStareCivila()` scrie documentul DELEGAȚIEI, nu al serviciului
  principal — altfel ieșeau două împuterniciri identice („Să obțină Extrasul
  Multilingv de Naștere") cu numere diferite.
- `DELEGATION_INSTITUTIE_MAP` primește `addon_cazier_judiciar` (IPJ Satu Mare,
  „în vederea ridicării Cazier Judiciar").

Teste: `tests/unit/lib/documents/delegation-items.test.ts` (nou, 7 cazuri) +
3 cazuri noi în `generator.test.ts`.

> ⚠️ Comenzile deja plătite nu se re-alocă singure (`barou_numbers_allocated_at`
> e setat). Ele arată de acum rândul de împuternicire lipsă în „Documente
> generate" — **nu-l apăsați** pe cele făcute deja manual: ar arde un număr de
> Barou în plus.
>
> Comenzi afectate în istoric: E-260708-VYC2B, E-260806-S757U, E-260812-JQ6A4,
> E-260817-J2BXD, E-260907-AMV62, E-260907-EJZM7.

## 2. 🔴 Nu se vedea pentru CE document sunt apostila/traducerea

Pe E-260908-JQW3M (cazier judiciar PF + add-on certificat de integritate +
apostilă + traducere) nu se putea spune din admin pentru care dintre cele două
documente sunt extra-urile.

Datele erau corecte tot timpul — opțiunile de la nivelul de sus aparțin
serviciului **principal**, iar cele ale serviciului secundar se salvează
`bundled_for` (indentate sub el). Doar afișajul nu o spunea. În plus, un add-on
FĂRĂ sub-opțiuni (exact cazul acestei comenzi) apărea ca un rând oarecare, nu ca
serviciu secundar.

**Fix** (`/admin/orders/[id]`, cardul „Optiuni selectate"):

- add-on-urile de serviciu se recunosc după COD (`addon_*`, `certificat_pachet`,
  `extras_multilingv`, `cazier_secundar`), nu după „are sub-opțiuni" → apar
  mereu cu eticheta **Serviciu secundar**;
- când comanda are un serviciu secundar, opțiunile per-document de la nivelul de
  sus (apostilă, traducere, legalizare, apostilă notari) primesc linia
  **„Pentru: \<serviciul principal\>"**.

## 3. 🔴 Cazier auto — lipsea linia „Onorariu Avocat" de pe factură

`services.lawyer_fee_ron` era **0** pe `cazier-auto`, deși serviciul e prin
avocat (e în `LAWYER_SERVICE_SLUGS`, primește contract de asistență + număr de
Barou) și avocata e deja plătită 15 RON/comandă în decont (`CAZIER_SLUGS` din
`avocat-decont.ts`). Fără fee, `computeLawyerFee()` nu decupa linia, deci
facturile de cazier auto ieșeau cu o singură linie, spre deosebire de toate
celelalte servicii prin avocat.

**Migrarea 153** — `lawyer_fee_ron = 15` pe `cazier-auto`. Totalul comenzii NU
se schimbă (onorariul se decupează din cele 198 RON). Cele 14 facturi deja
emise (08.07–28.08) rămân cum sunt.

## Fișiere

- `src/lib/documents/delegation-items.ts`
- `src/lib/documents/generator.ts`
- `src/app/admin/orders/[id]/page.tsx`
- `supabase/migrations/153_onorariu_avocat_cazier_auto.sql`
- `tests/unit/lib/documents/delegation-items.test.ts` (nou)
- `tests/unit/lib/documents/generator.test.ts`
- `docs/technical/specs/admin-document-system.md`
- `docs/technical/specs/stripe-oblio-payment-invoicing.md`
