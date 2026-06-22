# Cazier Judiciar — pagini pe orașe (location SEO)

**Status:** ✅ LIVE · extins 37 → **48 orașe** (2026-06-22)

## Ce este
Pagini de cazier judiciar per oraș, ancorate pe biroul **IPJ** local real (anti-doorway).

- **Rute:** `/servicii/cazier-judiciar-online/{oras}/`.
- **Date:** `src/lib/seo/locations/cities.ts` (tip `CityData` în `types.ts`).
- **Componentă:** `src/components/services/cazier-location-page.tsx`.
- **Gate anti-doorway:** `src/lib/seo/locations/quality.ts` (`assertAllCities`) — cere `ipj.address`≥10 SAU `officeNote`≥30, `localContext` care conține numele orașului (test anti-swap), ≥2 FAQ locale, `judetAbbr`.
- **Conținut:** ~1.400 cuvinte/pagină, schema Service + areaServed.
- **Navigare:** din hub (`/servicii/cazier-judiciar-online/` → secțiune „pe orașe") + nearbyCitySlugs + sitemap.

## Extindere 2026-06-22 (37 → 48)
**5 reședințe noi cu date IPJ reale** (verificate pe `{cod}.politiaromana.ro`):
| Oraș | Județ | Notă |
|---|---|---|
| Târgu Jiu | Gorj | Str. Traian nr. 2 |
| Piatra Neamț | Neamț | ghișeu public Str. Alexandru cel Bun nr. 12 (relocat apr. 2024) |
| Slatina | Olt | Str. Mihai Eminescu nr. 19 |
| Satu Mare | Satu Mare | Str. Mircea cel Bătrân nr. 3 (nr. 2/3 de re-verificat) |
| Ilfov | Ilfov | ghișeul fizic e în București, sector 2 (Șos. Fabrica de Glucoză nr. 7) |

**6 orașe secundare mari** (`officeNote` → IPJ județean, nu ghișeu propriu):
Turda (→IPJ Cluj), Mediaș (→IPJ Sibiu), Lugoj (→IPJ Timiș), Bârlad (→IPJ Vaslui), Sebeș (→IPJ Alba), Onești (→IPJ Bacău).

Acum: toate 41 județe + București + 6 secundare.

## Sursa datelor
Paginile oficiale „cazier judiciar" de pe `{cod}.politiaromana.ro` per IPJ județean.

## Rămas (opțional)
Alte orașe secundare candidate: Câmpina (→Prahova), Dej (→Cluj), Caransebeș (→Caraș-Severin). **Roman** are ghișeu propriu (Str. Bogdan Dragoș nr. 8) → ar putea fi pagină cu IPJ real, nu doar secundară.

## Vezi și
`../SEO-STATUS-2026-06-22.md` — overview.
