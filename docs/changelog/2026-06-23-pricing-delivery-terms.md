# 2026-06-23 — Prețuri + termeni de livrare + editor admin

Audit prețuri și termeni de livrare pe toate cele 14 servicii, aliniere cu WPForms vechi + decizii business, plus un editor admin ca termenii să fie ajustabili fără cod.

## Migrație DB (077_pricing_and_delivery_terms.sql)

### Prețuri
- `certificat-integritate`: 250 → **198 lei** (aliniat cu caziere-le).
- `certificat-celibat`: 179 → **698 lei** (WPForms vechi: „Obținere Certificat de Celibat" = 699).
- Naștere/căsătorie rămân 998 (WPForms vechi era 1190 — 998 e preț deliberat mai mic).

### Termeni de livrare (`processing_config` + `estimated_days` numeric)

Două căi de afișare ținute consistente:
- pagini `/servicii/*` → `formatEstimatedDays()` / `formatUrgentDays()` citesc `processing_config.{estimated_days_display,urgent_days_display}`;
- wizard price-sidebar → calcul din `estimated_days` numeric (constatator + extras CF sunt hardcodate „câteva minute (24/7)").

| Serviciu | termen standard | termen urgent |
|---|---|---|
| cazier-judiciar (x3) + cazier-auto | 2-4 zile lucrătoare | 1-2 zile lucrătoare |
| certificat-integritate | 2-4 zile lucrătoare | 1-2 zile lucrătoare |
| cazier-fiscal | 2-4 zile lucrătoare | — (fără opțiune urgență) |
| identificare-imobil | 2-4 zile lucrătoare | — |
| extras-carte-funciară + certificat-constatator | câteva minute (24/7) | — |
| certificat-naștere / căsătorie / celibat | 7-15 zile lucrătoare (baseline) | — |

**Constatator verificat**: worker ONRC emite toate tipurile (firmă de bază/IMM/insolvență + PF + istoric); emailul (`api/onrc/result/route.ts`) spune deja „câteva minute, max 24h dacă ONRC e în mentenanță". „5 minute" e corect.

## UI — pagini servicii

Cardul „Urgent" trecut de la valori hardcodate la `formatUrgentDays(service)` (ca editorul admin să propage), pe:
- `cazier-auto-online` (era `{service.urgent_days} zile` → acum „1-2 zile lucrătoare")
- `cazier-judiciar-online/persoana-fizica` + `/persoana-juridica` (erau hardcodate „1-2 zile")

## Feature — editor admin termeni de livrare

`/admin/settings` → tab Servicii → Editează serviciu: adăugate câmpuri **Termen standard** + **Termen urgent** (text liber). Se salvează în `processing_config` (merge, păstrează celelalte chei) prin `PATCH /api/admin/settings/services` (whitelist avea deja `processing_config`). Se propagă automat pe tot site-ul fără modificări de cod.

## Wizard — pas Opțiuni sărit pentru servicii property

`step-builder.ts`: pasul „Opțiuni suplimentare" e sărit pentru servicii cu `propertyVerification.enabled` (extras CF / plan cadastral / identificare imobil) — singura opțiune (extras suplimentar) e condusă de modulul Property, deci pasul randa gol.

## Cleanup
- Șterse scripturile temporare `query_db.mjs` + `query_service.js` (al doilea avea un service_role key hardcodat).

## Backlog deschis (vezi DEVELOPMENT_MASTER_PLAN.md)
- Termen dinamic stare civilă pe oficiul selectat (București/sectoare 15-30, oficii rapide 5-7, rest 7-15) — câmpul localitate e text liber, necesită selecție structurată.
- Extras multilingv naștere/căsătorie: **799 lei** standalone / **399 lei** add-on, termen 7-15 (WPForms vechi).
- Specimene PNG vechi (17.06) pe 4 pagini servicii (integritate/auto/fiscal/constatator) — fără versiuni WebP 2025; de refăcut documentele.
