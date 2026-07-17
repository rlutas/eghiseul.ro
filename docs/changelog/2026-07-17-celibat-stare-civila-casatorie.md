# 2026-07-17 — Celibat: „Căsătoria a avut loc în" mutată sub starea civilă actuală

**Cerință Raul:** la certificat de celibat, când clientul alege „Căsătorit(ă)" sau „Divorțat(ă)" la starea civilă actuală, întrebarea „Căsătoria a avut loc în: România / Străinătate" să apară **direct sub**, cu mesajul de transcriere la „Străinătate" — și abia după să vină „Ați mai fost căsătorit(ă) anterior?".

**Înainte:** întrebarea locului căsătoriei se declanșa doar din „Ați mai fost căsătorit(ă) anterior = Da" și se randa după blocul de istoric marital. Cine alegea „Căsătorit(ă)" la starea civilă actuală nu primea nicio întrebare/avertisment despre transcriere.

## Implementare

- `CivilStatusStep.tsx`: când serviciul are `fields.maritalStatus` activ (doar celibat azi), trigger-ul întrebării „Căsătoria a avut loc în:" devine `maritalStatus ∈ {casatorit, divortat}` și blocul se randează imediat sub starea civilă. Serviciile fără `maritalStatus` (naștere, căsătorie) păstrează trigger-ele vechi (`currentlyMarried` / `wasMarriedBefore`) și poziția veche — zero schimbări acolo.
- La schimbarea stării civile pe „Necăsătorit(ă)"/„Văduv(ă)", răspunsul România/Străinătate se golește din state (fără date stale în `customer_data`).
- Mesajul warning la „Străinătate" (căsătorie netranscrisă → nu putem elibera) rămâne același; fluxul de divorț din istoricul marital (divorț în străinătate → înregistrat în România? → warning) rămâne neatins.
- Validare: „Unde a avut loc căsătoria" intră în lista „Ca să poți continua…" când e vizibilă și fără răspuns.

**Verificat manual** (Playwright pe dev): Divorțat(ă) → întrebarea apare sub starea civilă → Străinătate → warning; Necăsătorit(ă) → dispare; Căsătorit(ă) → reapare cu selecția golită; lista de erori la „Continuă" o include.
