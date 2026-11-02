# 02.11.2026 — Sameday promite 1–2 zile; integritatea pe CJO costă 198 lei
<!-- categorie: livrare -->

## Pentru echipă

- **Sameday:** clientul vede acum livrare în 2 zile lucrătoare, ca la Fan Courier, iar termenul comenzii se calculează cu 1–2 zile pentru curier (înainte: o zi). Pe toate site-urile.
- **Certificat de integritate pe CazierJudiciarOnline:** 198 lei, urgent 278 lei (înainte 250 / 330), la fel ca pe eGhișeul. Prețul s-a schimbat și pe pagină, în formular și la plată.

Raportat din Ghid: Sameday (07.10, CJO-20261001-73026), integritate (30.09).

---

## Tehnic

- eghiseul: `src/lib/delivery-calculator.ts` Sameday `{1, 2}`; `src/lib/services/courier/sameday.ts` `estimatedDays: 2` pe ofertele standard și easybox.
- CJO: `src/lib/delivery-calculator.ts` Sameday `{1, 2}`; `src/config/integritate.config.ts` `pf_standard` 198_00, `pf_urgent` 278_00 (198 + 80); pagina `/certificat-integritate-comportamentala` (titlu, meta, schema Product/Offer, FAQ, GA4 `view_item`), `CrossSellSection`.
- Comenzile deja plătite își păstrează termenul calculat.
