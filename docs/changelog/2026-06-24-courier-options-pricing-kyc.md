# 2026-06-24 (val. 2) — Dropdown-uri, livrare, specimen opțiuni, lockere, admin KYC

## Wizard — dropdown-uri (SearchableSelect)
- Arată **TOATE** opțiunile (scroll), în ordine **alfabetică**, fără cap de 8 / „frecvent". Type-in filtrează în continuare. Scos `priorityOptions` peste tot (județ/țară/motiv).

## Wizard — livrare
- Stare civilă: păstrează alegerea regiunii (**România / Internațional**) — nu mai sare direct la România (rămâne fizic forțat, fără email-only).
- **Minim 20 RON cu TVA** pe quote-urile de curier (acoperă procesare/plic — nu pierdem bani).
- Eticheta livrării include regiunea: „**Livrare România · {curier}**" / „**Livrare internațională · {curier}**" → apare clar în Stripe + checkout + success.

## Wizard — opțiuni
- Buton **„Vezi specimen"** lângă opțiunile cu mostră (Apostilă Haga, Extras multilingv) → modal cu imaginea documentului. Componentă reutilizabilă `SpecimenInfoButton`.

## Lockere (EasyBox/Sameday) — performanță
- `sameday.getServicePoints`: paginare **în paralel** (page 1 → totalPages → restul în `Promise.all`) în loc de secvențial → încărcare mult mai rapidă a listei. Cache module-level + filtrare county/city păstrate.

## Prețuri curier — analiză
- Analiză completă: `docs/technical/specs/courier-pricing-analysis.md`. Concluzie: minim 20 RON corect, greutate 0.5kg + markup 15% OK. Sameday = estimat (fără API quote) → backlog: monitoring quote-vs-AWB.

## Success / status / text
- Success „Ce urmează": „Procesăm documentul în X" → „**Primești documentul în X zile lucrătoare**" (X = termen livrare, nu procesare).
- `/comanda/status`: doar buton **„Scrie-ne pe WhatsApp"** (scos numărul de telefon).

## Admin — KYC pe cont
- Detaliul comenzii: legătură **comandă ↔ cont** (client înregistrat vs invitat + status KYC cont) + buton **„Marchează KYC verificat / Anulează"**.
- `PATCH /api/admin/users/customers/[id]` acceptă `kyc_verified`.

## Teste
- Suita unit: **1078 teste pass** (76 fișiere), 0 regresii. Build + lint verzi.
