# Changelog — 2026-06-23 — Wizard audit (WPForms parity) + price/delivery fixes

Audit complet al wizardului modular vs export legacy WPForms (`docs/archive/exporturi-wpforms/`), 6 formulare rămase (judiciar, fiscal, auto, integritate, constatator, extras CF). Plus fixuri de preț/termen livrare semnalate de owner.

## Fixuri preț + termen livrare (migrație 075)

- **Cazier auto — termen livrare** aliniat la cazier judiciar: `estimated_days=3`, `urgent_days=2`, display „2-4 zile lucrătoare" (era `estimated_days=1`, fără range → afișa „1 zi").
- **Cazier auto — poză act identitate**: activat `personalKyc` (CI/pașaport + selfie, `acceptedDocuments` identice cu judiciarul). Înainte `personalKyc.enabled=false` → nu cerea actul.
- **Certificat integritate — termen**: `estimated_days` aliniat la 3 (display era deja „2-4 zile").
- **Confirmat deja corect (neatins):** prețuri cazier auto (base 198 + urgență 80 = ca judiciar) și fiscal (base 198, urgență dezactivată → doar simplu).

## Fixuri audit wizard (migrație 076 + cod)

- **Cazier judiciar (PF) — nume părinți**: re-activat `personalKyc.parentDataRequired=true`. Se pierduseră complet (UI gateză pe flag, iar judiciarul nu are modul civil-status). WPForms le cerea (câmpuri 135/136).
- **Cazier judiciar (PF) — „Nume Anterior"**: câmp nou opțional. Flag nou `PersonalKYCConfig.collectBirthName`, randat în `PersonalDataStep.tsx`, salvat în `personalKyc.birthName`. WPForms câmp 171 (opțional).
- **Cazier auto — număr permis în loc de înmatriculare**: cazierul auto e legat de șofer (permis), nu de mașină. Cheie nouă opțională `VehicleVerificationConfig.fields.drivingLicense`; render-ul plăcuței gatuit pe `plateNumber.required` (acum `false`); `VehicleDataStep.tsx` randează input „Numărul Permisului de Conducere"; state `vehicle.drivingLicense`.

## Verificat = fals/intenționat (fără acțiune)

- „PJ blocat" la fiscal/integritate → FALS: `billing-step.tsx` tratează `persoana_juridica` (CUI/nume firmă) pentru orice serviciu. Doar integritate are `enable_pj=false` intenționat (și flag-ul nu e folosit altundeva).
- `processing_config.enable_nume_anterior` (integritate) = **flag mort** (zero utilizări în `src/`) — integritate NU afișa nume anterior. `birthName` se randa doar în `CivilStatusStep`.
- Name single-vs-split, delivery radio, coupon la checkout, signature off la auto = îmbunătățiri/decizii intenționate.

## Backlog (deschis — vezi DEVELOPMENT_MASTER_PLAN.md)

- **Constatator**: lista „scop" nefiltrată pe `documentType`+`reportType` → combinații invalide → `NEEDS_OPERATOR`. Atinge worker ONRC → de făcut deliberat (migrație 062 incompletă).
- **Extras Multilingv** add-on (naștere/căsătorie) — încă lipsă.
- **Livrare WhatsApp** — owner: lăsat scos.

## Fișiere

- `supabase/migrations/075_cazier_auto_kyc_and_delivery_alignment.sql`
- `supabase/migrations/076_wizard_audit_fixes.sql`
- `src/types/verification-modules.ts` (drivingLicense, collectBirthName, state)
- `src/components/orders/modules/vehicle/VehicleDataStep.tsx`
- `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`
