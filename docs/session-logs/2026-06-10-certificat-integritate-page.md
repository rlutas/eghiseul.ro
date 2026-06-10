# Sesiune 2026-06-10 (15) — Pagina + formular Certificat de Integritate (slug)

**Status:** ✅ Live (migrare rulată, build OK, pagini testate)
**Fișiere:**
- `supabase/migrations/050_rename_certificat_integritate_slug.sql` (rulat)
- `src/lib/documents/generator.ts`, `next.config.ts`

---

## Cerință

Construiește pagina `/servicii/certificat-integritate/` + formularul, ca la cazier judiciar, dar cu **Certificat de Integritate ca serviciu principal** și **Cazier Judiciar ca extra (bundled)**.

## Descoperire

Totul exista deja în DB — doar slug-ul nu se potrivea:
- Serviciul: `certificat-integritate-comportamentala` (Certificat de Integritate Comportamentală, 250 RON, 5 zile, activ), cu `verification_config` complet (KYC, semnătură) și **deja** opțiunea bundled `addon_cazier_judiciar` (Cazier Judiciar ca extra, +100 RON).
- Dar `hero-section.tsx` linka spre slug-ul **scurt** `certificat-integritate` → `/servicii/certificat-integritate` dădea **404**.
- Rutele `/servicii/[slug]` și `/comanda/[service]` sunt 100% DB-driven, deci orice serviciu activ randează automat.

## Soluție

Migrare **050**: redenumit slug-ul `certificat-integritate-comportamentala` → **`certificat-integritate`** (numele afișat rămâne „…Comportamentală"). Actualizat și `addon_service_slug` din cele 3 opțiuni `addon_certificat_integritate` de pe serviciile cazier (referințele bundled inverse).

Cod:
- `generator.ts`: cheia de mapare instituție → `certificat-integritate`.
- `next.config.ts`: redirect permanent `…-comportamentala` → `certificat-integritate` (pentru orice link vechi), pe `/servicii` și `/comanda`.

Comenzile existente (2) sunt legate prin `service_id` (UUID) → neafectate.

## Verificare (dev)

- `/servicii/certificat-integritate` → 200
- `/comanda/certificat-integritate` → 200
- API: 9 opțiuni, inclusiv `addon_cazier_judiciar` (Cazier Judiciar bundled, 100 RON) ✓
- `tsc`/`build` curate.
