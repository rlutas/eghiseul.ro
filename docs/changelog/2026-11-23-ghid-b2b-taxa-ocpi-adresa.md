# 23.11.2026 — Ghid nou pentru agenții din străinătate; taxa OCPI la actualizare adresă e 75 lei
<!-- categorie: clienti -->

## Pentru echipă

- **Ghid nou: „Agenție din străinătate vrea colaborare (B2B)”.** Îl găsiți în Ghid. Spune cum recunoașteți o cerere reală față de o țeapă și ce acceptăm: o comandă pe site pentru fiecare persoană, împuternicire, plata înainte, fără plăți din Rusia, fără cercetare în arhive. Are și un răspuns-model în engleză.
- Factura pe o firmă din străinătate nu se poate face din formular. Se face manual din admin, cu acordul lui Raul la prima comandă.
- **Taxa OCPI la „Actualizare adresă în CF” e acum 75 lei** în setări (era 60). La livrare, costul intern se înregistrează corect. Raportul din 03.11 e închis.
- Raportul din 19.11 (comenzi intrate pe juridică) e și el închis.

---

Ghid: [colaborari-b2b-agentii-straine.md](../admin/colaborari-b2b-agentii-straine.md), adăugat în `CURATED_GUIDES` (`src/lib/knowledge/docs.ts`).

Taxa: `services.processing_config.ancpi_cost_ron` pe `actualizare-adresa-cf` 60 → 75 (cod 2.6.3 din `src/lib/ancpi/tarife-oficiale.ts`), schimbat direct în DB pe 23.11. Corecția din 12.11 fusese blocată de permisiuni și nu se aplicase.
