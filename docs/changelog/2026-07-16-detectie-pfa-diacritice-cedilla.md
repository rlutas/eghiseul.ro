# 2026-07-16 — Detecție PFA: SRL blocat fals din cauza diacriticelor cedilla (ANAF)

**Simptom:** client cu SRL real (VERIFICATOR ŞI EXPERT CONSTRUCŢII S.R.L., CUI 35456698) primea la pasul companie mesajul blocant „Pentru PFA / Întreprindere Individuală / … folosește fluxul pentru Persoană Fizică" și nu putea comanda cazier PJ.

**Cauza:** `src/lib/services/entity-type-detection.ts` — regex-ul de word-boundary folosea clasa `[^A-ZĂÂÎȘȚ0-9]` care conține DOAR diacriticele comma-below (Ș U+0218, Ț U+021A). ANAF returnează numele firmelor cu diacritice **cedilla** legacy (Ş U+015E, Ţ U+0162), verificat live pe API-ul ANAF. Rezultat: `Ţ` din `CONSTRUCŢII` era tratat ca separator de cuvânt → `II` de la final se potrivea ca cuvânt de sine stătător → flag „Întreprindere Individuală" → flux PJ blocat.

Afecta ORICE firmă al cărei nume ANAF conține `ŢII`/`ŢIF` etc. înainte de spațiu sau final (CONSTRUCŢII, INSTALAŢII, CONSULTAŢII…).

## Fix

- `normalizeCedilla()` nou în `entity-type-detection.ts`: `Ş→Ș`, `ş→ș`, `Ţ→Ț`, `ţ→ț`, aplicat în `detectEntityType()` înainte de matching.
- Plasă de siguranță: clasa word-boundary include acum și formele cedilla (`[^A-ZĂÂÎȘȚŞŢ0-9]`) pentru apeluri directe la `matchesAnyWord()` care sar peste normalizare.

## Teste

`tests/unit/lib/entity-type-detection.test.ts` (nou, 20 teste): variante cedilla/comma-below/fără diacritice ale numelui real din incident, true-positives (PFA/II/IF/Cabinet/Birou/ONG rămân detectate), false-positives de word-boundary (EDITII, MEDIATIF rămân excluse).
