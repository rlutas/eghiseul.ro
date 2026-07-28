# 2026-07-28 — Cazier auto: permis din străinătate + curățare pas

**Cerințe Raul:** paritate cu cazierjudiciaronline.com la cazier auto — varianta „permis de conducere din străinătate" lipsea complet, deși are alt preț și alt termen; în plus, două lucruri de scos din formular.

## 1. Permis emis în străinătate — LIPSEA pe eghiseul

CJO are `enablePermisStrain` (`src/config/auto.config.ts`): tarif **350 RON** și termen **7-10 zile lucrătoare**, în loc de 198 / 3-5. Pe eghiseul nu exista nicio întrebare — un client cu permis străin comanda la tariful și termenul intern, imposibil de respectat (fișa se cere autorității care a emis permisul).

Acum, la pasul „Permis de Conducere": **„Permisul de conducere a fost emis în: România / Străinătate"**.

- **Preț**: la „Străinătate" prețul de bază devine 350 RON, live în sidebar — același mecanism de override ca variantele de constatator (`priceBreakdown` din `modular-wizard-provider`).
- **Termen**: 7-10 zile lucrătoare, prin `baseRange` nou în `estimateFromSelectedOptions`; add-on-urile și cureierul se adaugă peste, ca de obicei.
- **Urgența dispare** când permisul e străin (nu poți grăbi o autoritate străină) + casetă care explică de ce; dacă un draft veche o cară după el, `baseRange` bate urgența și în calcul.
- **Guard server-side** în `/submit`: prețul de bază e calculat în wizard și persistat pe comandă, deci un payload modificat ar putea plăti 198 pentru o fișă cerută în străinătate. Înainte de plată recalculăm din config și corectăm în sus (log + `base_price`/`total_price` actualizate).
- **Admin**: rând nou „Permis emis în: România/Străinătate" pe cardul comenzii.
- **Pagina publică** (`/servicii/cazier-auto-online/`): tariful și termenul apar în paragraful de preț, în FAQ-ul „Am permis emis în străinătate" și în cel de preț; offer nou în JSON-LD (350 RON).

Config (migrarea 139, `verification_config.vehicleVerification.foreignLicense`):

```json
{ "enabled": true, "price": 350, "minDays": 7, "maxDays": 10, "daysDisplay": "7-10 zile lucrătoare" }
```

## 2. „Sunt cetățean străin" — scos de la cazier auto

La cazierul auto contează unde a fost emis **permisul**, nu cetățenia solicitantului; întrebarea dubla acum noua opțiune și adăuga zile de procesare degeaba. Stinsă prin `personalKyc.allowForeignCitizen = false` (același comutator folosit de documentele de stare civilă) — fără cod nou.

## 3. „Numărul Permisului de Conducere" — scos

Numărul se citește din poza permisului, deci câmpul era muncă în plus pentru client (și o sursă de greșeli de tastare). `vehicleVerification.fields.drivingLicense.required = false`.

Pasul rămâne (ține întrebarea despre locul emiterii) și se numește acum **„Permis de Conducere"** în loc de „Date Conducător Auto", cu subtitlul „Spune-ne unde a fost emis permisul — restul datelor le citim din poza permisului". Eticheta se calcula din `drivingLicense.required`; acum ține cont și de `foreignLicense.enabled`, altfel pasul s-ar fi reintitulat „Date Vehicul" (`step-builder.ts` + `VehicleDataStep`).

## 4. Poza VERSO a permisului — scoasă

`personalKyc.extraDocuments` păstrează doar `permis_fata`. Codul continuă să suporte `permis_verso` pentru comenzile deja plasate (etichete în admin, reupload).

## Verificat în browser (dev), pas cu pas

| Ce | Rezultat |
|---|---|
| Pas 1 „Date Contact" | fără „Sunt cetățean străin" ✅ |
| Pas 3 | se numește „Permis de Conducere", conține DOAR întrebarea România/Străinătate ✅ |
| „Străinătate" ales | sidebar 350.00 RON + „Timp estimat: 7-10 zile lucrătoare", casetă explicativă ✅ |
| Pas 4 „Opțiuni" | „Procesare Rapidă" ascunsă, casetă „Permis din străinătate — procesare 7-10 zile" ✅ |
| Pas 5 „Documente KYC" | doar „Permis de Conducere — față"; versoul permisului dispărut (mai apare doar versoul CI-ului, corect) ✅ |
| Draft în DB | `base_price = 350`, `vehicle.licenseIssuedAbroad = true` ✅ |

Draftul de test a fost șters după verificare.

## Fișiere

- `supabase/migrations/139_cazier_auto_permis_strain.sql` (aplicată)
- `src/types/verification-modules.ts` — `foreignLicense` în config, `licenseIssuedAbroad` în state
- `src/components/orders/modules/vehicle/VehicleDataStep.tsx`, `src/lib/verification-modules/step-builder.ts`
- `src/providers/modular-wizard-provider.tsx` (preț), `src/components/orders/price-sidebar-modular.tsx` (termen)
- `src/lib/delivery-calculator.ts` (`baseRange`), `src/lib/orders/order-estimate.ts` (`hasForeignDrivingLicense`)
- `src/components/orders/steps-modular/options-step.tsx` (urgența)
- `src/app/api/orders/[id]/submit/route.ts` (guard preț) + cele 3 rute care mai calculează estimarea (primesc `verification_config`)
- `src/app/admin/orders/[id]/page.tsx`, `src/app/servicii/cazier-auto-online/page.tsx`
- `tests/unit/lib/orders/foreign-driving-licence.test.ts` (6 teste)

## Rămas

Prețul și termenul pentru permis străin se editează deocamdată din config (migrare), nu din `/admin/settings` → Servicii. Dacă vrei să le poți schimba din admin, e același pattern ca prețurile de variantă de la constatator.
