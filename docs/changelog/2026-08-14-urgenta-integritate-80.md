# 2026-08-14 — Taxa de urgență la certificat integritate: 100 → 80 lei

Semnalat de colegi pe două comenzi urgente cu aceeași bază, dar totaluri
diferite:

| Comandă | Serviciu | Bază | Urgență | Total |
|---|---|---|---|---|
| `E-260810-WGS95` | Cazier judiciar PF | 198 | **80** | 278 |
| `E-260813-BE38X` | Certificat integritate | 198 | **100** | 298 |

Ambele: același termen (5 → 2 zile lucrătoare), același flux prin avocat.

## Cum a apărut diferența

Două migrări care s-au ratat reciproc:

1. **036 (20.05)** a coborât taxa de urgență 100 → 80 pe cazier judiciar
   (PF/PJ/generic) + cazier auto — poziționare față de cazierjudiciaronline.com.
   Lista de slug-uri **nu includea** `certificat-integritate`.
2. **077 (23.06)** a aliniat **baza** integrității 250 → 198 „ca restul
   cazierelor", dar a lăsat opțiunea de urgență pe valoarea inițială (100,
   stabilită când baza era 250).

Rezultat: integritatea a rămas singurul serviciu din grupă cu urgență de 100 lei
la o bază de 198.

## Fix

- **eghiseul.ro** — migrarea `143_urgenta_integritate_80.sql`: `service_options`
  → `urgenta` = 80 pe `certificat-integritate`. Aplicată; toate cele 5 servicii
  din grupă (judiciar PF/PJ/generic, auto, integritate) sunt acum la 80.
- **cazierjudiciaronline.com / ecazier** — `integritate.config.ts`:
  `pf_urgent` 350 → **330** (250 + 80) și `addons.urgent_uplift` override la 80,
  după modelul din `cabinet-judiciar.config.ts`. Ambele erau necesare: totalul se
  calculează din `pf_urgent − pf_standard`, iar liniile de pe checkout/factură
  din `addons.urgent_uplift` — dacă rămânea doar una, factura ar fi arătat altă
  sumă decât cea încasată.

Paginile publice citesc prețul din config/DB, deci se actualizează singure. Nu
există sume hardcodate.

## Comenzile deja plătite

Nu se ating: prețul e înghețat în `orders.selected_options.price_modifier` la
momentul comenzii. Două comenzi de integritate au fost plătite cu urgență de 100
lei (`E-260806-BV63P`, `E-260813-BE38X`) — dacă vrei să le compensezi cei 20 lei,
e o decizie separată.
