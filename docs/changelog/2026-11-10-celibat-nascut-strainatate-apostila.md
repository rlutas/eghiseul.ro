# 10.11.2026 — Certificat de celibat: născut în străinătate; apostilă pentru Kârgâzstan și Jamaica
<!-- categorie: comenzi -->

## Pentru echipă

- La certificatul de celibat, clientul răspunde acum la „Țara în care v-ați născut: România / Străinătate”.
- La „Străinătate” alege țara dintr-o listă, în locul județului. Pe pagina comenzii apare „Țara nașterii”.
- Pe cerere și împuternicire, la „Județul nașterii” se tipărește țara (de exemplu „Kârgâzstan”). Verificați rubrica înainte de depunere.
- Clientul vede avertismentul: nașterea din străinătate trebuie să fie transcrisă în România, altfel nu putem obține certificatul.
- Termenul afișat pentru născuții în străinătate e cel lung (actul se cere prin București), ca la certificatul de naștere.
- Lista de țări pentru Apostila de la Haga e completă: 125 de țări, între ele Kârgâzstan, Jamaica, Maroc, Tunisia, Arabia Saudită, Indonezia, Pakistan, Republica Dominicană. Nu mai e nevoie ca clientul să aleagă altă țară și să corectăm noi.
- Dacă un client cere o țară care tot nu e în listă, țara nu e în Convenția de la Haga: actul are nevoie de supralegalizare, nu de apostilă.

---

## Tehnic

- `CivilStatusStep`: la servicii cu `fields.birthLocality` fără `fields.birthPlace` (celibat), întrebare nouă care scrie `civil_status.bornAbroad`; la `true` se cere `civil_status.birthCountry` (select `COUNTRIES` fără România) și `birthCounty` se golește; la `false` se golește `birthCountry`. Localitatea + județul/țara apar după răspuns.
- `bornAbroad` alimentează deja `actFromAbroad` → tier lent la termen.
- `CivilStatusState.birthCountry` nou (doar JSONB, fără migrare).
- Documente (`auto-generate.ts`, `generate-document/route.ts`): `birth_judet` = țara când `bornAbroad`, ca să nu cadă pe județul din CNP; `birth_country` primește și `civil.birthCountry`.
- `APOSTILA_COUNTRIES`: 82 → 125 intrări, completată din tabelul HCCH (Jamaica, Kârgâzstan + 41 state membre lipsă). Numele identice cu `COUNTRIES`. Kosovo lăsat afară (nerecunoscut de România).
- Admin: eticheta `birthCountry` → „Țara nașterii”.
