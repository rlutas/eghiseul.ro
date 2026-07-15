# Documentație eGhișeul.ro

Index al documentației. Aceasta e o **hartă**, nu un jurnal — pentru jurnalul de livrări vezi [`changelog/`](changelog/), pentru jurnale tehnice de sesiune vezi [`session-logs/`](session-logs/).

**Ultima actualizare:** 2026-06-22 · **Status proiect:** 9 servicii live, 36 calculatoare, expansiune SEO de localizare în curs (42 CF pe județe, 48 orașe cazier, clustere ONRC + stare civilă), rovinietă (verificare + cumpărare), /tools/.

## 📌 Citește primul
| Document | Rol |
|---|---|
| [`STATUS_CURRENT.md`](STATUS_CURRENT.md) | Ce merge acum, probleme cunoscute, testare — **citește primul dacă revii** |
| [`DEVELOPMENT_MASTER_PLAN.md`](DEVELOPMENT_MASTER_PLAN.md) | Plan master sprinturi + backlog + features viitoare |
| [`changelog/`](changelog/) | Ce s-a livrat, pe sesiuni (cronologic invers) |

## 🗂️ Navigare pe domenii
| Domeniu | Folder | Conținut |
|---|---|---|
| **Tehnic** | [`technical/`](technical/) | `specs/` (arhitecturi servicii), `api/`, `webmcp.md` |
| **SEO** | [`seo/`](seo/) | location pages (CF/cazier), clustere (ONRC/stare civilă/rovinietă), keywords, GSC, planuri |
| **Servicii** | [`services/`](services/) | catalog viu, folder-per-serviciu |
| **Admin** | [`admin/`](admin/) | RBAC, handbook-uri operaționale (storno, modifică comandă, coșuri abandonate) |
| **Deployment** | [`deployment/`](deployment/) | Vercel + Stripe webhook, S3, migrări DB, email Zoho+Resend, deploy checklist |
| **Securitate** | [`security/`](security/) | audit securitate, incidente |
| **Design** | [`design/`](design/) | sistem de design, ghiduri vizuale |
| **PRD / Business** | [`prd/`](prd/), [`business/`](business/), [`legal/`](legal/) | cerințe produs, business, legal |
| **Registru central Barou** | [`registru-central/`](registru-central/) | registru numere partajat pe 3 platforme, alocare post-plată, cutover |
| **Curieri** | [`fancourier/`](fancourier/), [`sameday/`](sameday/) | integrări curier |
| **Testing** | [`testing/`](testing/) | ghiduri de testare |
| **Agenți** | [`agents/`](agents/) | orchestrare agenți |

## 🧾 Jurnale & istoric
| Folder | Conținut |
|---|---|
| [`changelog/`](changelog/) | Livrări pe sesiuni (ce s-a făcut) |
| [`session-logs/`](session-logs/) | Jurnale tehnice de sesiune (debugging, incidente) |
| [`plans/`](plans/) | Planuri de implementare (location SEO engine etc.) |
| [`archive/`](archive/) | Materiale istorice (paritate cazier 2026-04, sprints, catalog WPForms legacy, audituri vechi) |

## 🔑 Referințe rapide (din CLAUDE.md)
- **Cum adaug un serviciu nou:** [`technical/specs/modular-wizard-guide.md`](technical/specs/modular-wizard-guide.md)
- **Document generation:** [`technical/specs/admin-document-system.md`](technical/specs/admin-document-system.md)
- **Solicită documente (cerere de la client + standby):** [`technical/specs/document-request-system.md`](technical/specs/document-request-system.md)
- **RBAC & permisiuni:** [`admin/rbac-permissions.md`](admin/rbac-permissions.md)
- **Plăți & facturare:** [`technical/specs/stripe-oblio-payment-invoicing.md`](technical/specs/stripe-oblio-payment-invoicing.md)
- **Webhook Resend (bounce → banner admin + alertă):** [`technical/specs/resend-bounce-webhook.md`](technical/specs/resend-bounce-webhook.md)
- **Decontări Stripe (reconciliere cross-platform + proforme extra):** [`technical/specs/decontari-stripe-reconciliation.md`](technical/specs/decontari-stripe-reconciliation.md)
- **Runbook schimbare firmă (Stripe/Oblio/bancă noi):** [`technical/specs/schimbare-firma-runbook.md`](technical/specs/schimbare-firma-runbook.md)
- **ANCPI automation:** [`technical/specs/ancpi-automation-plan.md`](technical/specs/ancpi-automation-plan.md)
- **Cookie consent (GDPR, banner + consent receipts):** [`technical/specs/cookie-consent.md`](technical/specs/cookie-consent.md)
- **Deploy:** [`deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md)
- **Email (Resend + Zoho) setup:** [`deployment/EMAIL_RESEND_ZOHO_SETUP.md`](deployment/EMAIL_RESEND_ZOHO_SETUP.md)

---

> **Convenție de organizare** (după reorganizarea 2026-06-22):
> - Root `docs/` = doar 3 docuri vii (acest README, MASTER_PLAN, STATUS_CURRENT).
> - Status „viu" → `STATUS_CURRENT.md`. Ce s-a livrat → `changelog/`. Jurnal de sesiune → `session-logs/`. Milestone/snapshot încheiat → `archive/`.
> - Fiecare zonă mare are un `README.md` index (vezi `seo/README.md`).
