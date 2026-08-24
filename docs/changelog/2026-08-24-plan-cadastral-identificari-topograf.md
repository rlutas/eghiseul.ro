# 2026-08-24 — Plan cadastral + identificările merg la topograf, cu cereri generate

Portalul ANCPI e în continuare picat pentru platformele publice (din 13 iulie),
deci doar Mircea poate lucra comenzile imobiliare, cu accesul lui de
profesionist. Extras CF îi era deja alocat (19.08, cu cereri generate automat);
au rămas pe dinafară exact serviciile astea, cu **29 de comenzi plătite**
invizibile pentru el:

| Serviciu | Comenzi în așteptare |
|---|---|
| `identificare-imobil` | 15 |
| `identificare-imobile-proprietar` | 3 |
| `extras-plan-cadastral` | 11 |

## Ce s-a livrat

**1. Alocare (migrarea 147, rulată).** Toate trei serviciile îi apar acum în
portal, cu upload de PDF.

**2. Cereri generate pentru extras plan cadastral.** Research: ANCPI nu are
anexă dedicată pentru „extras din planul cadastral, pe ortofotoplan" (cod
2.7.7, 15 lei) — OCPI-urile publică un derivat al Anexei 1.30 „Cerere de
informații" cu același corp ca cererea de extras CF, doar obiectul diferă.
Site-urile ANCPI fiind picate (nu se poate descărca niciun model oficial),
baza s-a derivat din **baza CF deja în git** — reproductibil, fără PDF-ul sursă
al lui Mircea: `scripts/build-plan-cadastral-cerere-template.ts` șterge din
content stream eticheta „ANEXA NR. 6", titlul și fraza cu obiectul, și le
redesenează cu „extras din planul cadastral, pe ortofotoplan". Restul —
antet OCPI/BCPI pe județul imobilului, UAT cu județ, CF/cadastral, data,
un imobil = o cerere — e exact mecanismul de la extras CF.

Denumirea primește prefixul `plan` (`plan cf 108650 - Medgidia-Constanta.pdf`):
el citește serviciul din numele fișierului, nu din document. ZIP-ul de cereri
(`/api/collaborator/cereri`) le include, iar filtrarea pe județ ține cont de
sursa fiecărei cereri.

**3. Identificările generează cererea de extras CF DUPĂ identificare.**
Clientul dă o adresă sau un proprietar, nu un CF — nu există ce depune la
OCPI până nu e găsit imobilul. Fluxul nou în portal:

1. El identifică imobilul (sistemul lui de profesionist).
2. „Am identificat imobilul": județ (din nomenclatorul ANCPI, validat — antetul
   OCPI/BCPI iese din el) + UAT + nr. CF (sau cadastral) →
   `POST /api/collaborator/orders/[id]/identificare`. Se salvează în
   `customer_data.identified_property` — **niciodată peste `property`-ul
   clientului**; ce a tastat clientul rămâne al clientului.
3. Platforma îi arată imediat cererea de extras CF (Anexa 6) generată din
   datele raportate — o descarcă, o semnează, o depune; extrasul obținut e
   livrabilul pe care îl încarcă.

Repostabil (identificarea se poate corecta), cu notă în istoricul comenzii la
fiecare raportare.

## De reținut

- ⚠️ **Prima cerere de plan cadastral depusă trebuie validată de Mircea** —
  formatul e derivat din corpul Anexei 6, nu din modelul lui (n-avea unul
  pentru plan). Dacă OCPI-ul vrea alt formular, refacem baza din modelul lui,
  cu același mecanism.
- Verificat pe date reale: toate cele 11 comenzi de plan cadastral au CF/UAT/
  județ completate — generarea nu blochează pe niciuna. PDF-ul de probă
  (Medgidia, Constanța) randat și verificat vizual.
- Identificările nu apar în ZIP până nu au identificarea raportată — corect,
  nu au ce depune.

## Fișiere

| Fișier | Rol |
|---|---|
| `supabase/migrations/147_asignare_identificari_plan_cadastral_topograf.sql` | alocările (rulată 24.08) |
| `scripts/build-plan-cadastral-cerere-template.ts` | builderul bazei de plan (input = baza CF din git) |
| `src/templates/ancpi/cerere-extras-plan-{base.pdf,fields.json}` | asset-urile derivate |
| `src/lib/ancpi/cerere-scope.ts` | `CERERE_SLUGS` (slug → template) + `IDENTIFICARE_SLUGS` |
| `src/lib/ancpi/cereri-for-order.ts` | `cereriForOrderSlug` — sursa unică slug → cereri |
| `POST /api/collaborator/orders/[id]/identificare` | raportarea identificării |

Detalii: `docs/technical/specs/cereri-ocpi-colaborator.md`.
