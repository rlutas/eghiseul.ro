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
| **Tehnic** | [`technical/`](technical/) | `specs/` (arhitecturi servicii), `api/` (incl. [contul în wizard + dovada plății](technical/api/orders-account-payment-proof-api.md)), `webmcp.md` |
| **Google Ads** | [`ads/`](ads/) | starea contului, economia pe serviciu (CPA maxim), analize de concurenta pe serviciu, reguli de politica |
| **ChatGPT Ads (OpenAI)** | [`ads/chatgpt/`](ads/chatgpt/) | politica OpenAI citată, eligibilitate servicii (avocat = legal services), audit landing, campania constatator, roadmap |
| **Meta Ads** | [`ads/meta/`](ads/meta/) | cercetare US/UK + Ad Library live, mecanica Meta 2026/UE, playbook, plan de test constatator |
| **SEO** | [`seo/`](seo/) | location pages (CF/cazier), clustere (ONRC/stare civilă/rovinietă), keywords, GSC, planuri, [tooling pe date reale](seo/TOOLING-claude-seo.md) (GSC API/CrUX/PageSpeed) |
| **Servicii** | [`services/`](services/) | catalog viu, folder-per-serviciu |
| **Admin** | [`admin/`](admin/) | RBAC, handbook-uri operaționale (storno, modifică comandă, coșuri abandonate) |
| **Marketing** | [`marketing/`](marketing/) | plan email marketing A–Z, recuperare telefonică comenzi abandonate |
| **Deployment** | [`deployment/`](deployment/) | Vercel + Stripe webhook, S3, migrări DB, email Zoho+Resend, deploy checklist |
| **Securitate** | [`security/`](security/) | audit securitate, incidente |
| **Design** | [`design/`](design/) | sistem de design, ghiduri vizuale |
| **PRD / Business** | [`prd/`](prd/), [`business/`](business/), [`legal/`](legal/) | cerințe produs, business, legal |
| **Registru central Barou** | [`registru-central/`](registru-central/) | registru numere partajat pe 3 platforme, alocare post-plată, cutover |
| **Serviciu NOU: traduceri+apostile** | [`serviciu-traduceri-apostile/`](serviciu-traduceri-apostile/) | analiză & plan (benchmark Kenna, liste documente/limbi, întrebări traducător+notar, flow, pricing draft) — în negociere |
| **Curieri** | [`fancourier/`](fancourier/), [`sameday/`](sameday/) | integrări curier |
| **Testing** | [`testing/`](testing/) | ghiduri de testare |
| **Agenți** | [`agents/`](agents/) | orchestrare agenți |

## 🧾 Jurnale & istoric
| Folder | Conținut |
|---|---|
| [`changelog/`](changelog/) | Livrări pe sesiuni (ce s-a făcut) |
| [`session-logs/`](session-logs/) | Jurnale tehnice de sesiune (debugging, incidente) |
| [`plans/`](plans/) | Planuri de implementare — **[index cu status](plans/README.md)**. Curent: [ecosistem auto](plans/2026-07-20-ecosistem-auto-unelte-afiliere.md) + [categoria Contracte](plans/2026-07-20-categoria-contracte-eghiseul.md) |
| [`archive/`](archive/) | Materiale istorice (paritate cazier 2026-04, sprints, catalog WPForms legacy, audituri vechi) |

## 🔑 Referințe rapide (din CLAUDE.md)
- **Cum adaug un serviciu nou:** [`technical/specs/modular-wizard-guide.md`](technical/specs/modular-wizard-guide.md)
- **documentero.ro (al doilea brand): dosarul site-ului** — de ce, design, conținut/SEO, formular, lansare: [`documentero/`](documentero/README.md); legătura tehnică: [`technical/specs/multi-brand.md`](technical/specs/multi-brand.md)
- **Document generation:** [`technical/specs/admin-document-system.md`](technical/specs/admin-document-system.md)
- **Convenția cu topograful (angajament de execuție):** [`technical/specs/conventie-topograf.md`](technical/specs/conventie-topograf.md)
- **Solicită documente (cerere de la client + standby):** [`technical/specs/document-request-system.md`](technical/specs/document-request-system.md)
- **Chatbotul din Ghid + rapoarte (echipă și colaborator):** [`admin/chatbot-si-raportare.md`](admin/chatbot-si-raportare.md) — „Întreabă ghidul” (Claude peste corpusul echipei), „Raportează o problemă”, pagina `/admin/ghid/rapoarte`; API: [`technical/api/knowledge-api.md`](technical/api/knowledge-api.md)
- **Serviciile A→Z pentru echipă (catalog + fișe pe familii):** [`admin/servicii/README.md`](admin/servicii/README.md) — caziere/integritate, stare civilă, constatator, extras CF, imobiliare prin topograf, opțiuni suplimentare; transversal: [`admin/statusuri-comenzi.md`](admin/statusuri-comenzi.md) (statusuri + cozile zilnice) și [`admin/pagina-comenzii.md`](admin/pagina-comenzii.md) (butoanele). Corpusul echipei pentru căutare/chatbot: `src/lib/knowledge/corpus.ts`
- **RBAC & permisiuni:** [`admin/rbac-permissions.md`](admin/rbac-permissions.md)
- **Contul clientului (ce vede clientul, cupon de bun-venit, ce se leagă automat cu comanda):** [`admin/contul-clientului.md`](admin/contul-clientului.md)
- **Plăți & facturare:** [`technical/specs/stripe-oblio-payment-invoicing.md`](technical/specs/stripe-oblio-payment-invoicing.md)
- **Anulare în 30 min (refund 70% + factura de 30%):** [`admin/anulare-refund-70.md`](admin/anulare-refund-70.md) — procedura echipei: „Procesează refund" (Stripe + storno + factura taxei de anulare), „Am refundat manual", „Reconciliază", ce vede contabilul în Decontări
- **Identificare imobil (după adresă / după proprietar), inclusiv „nu l-am găsit” → certificat OCPI 2.7.8:** [`admin/identificare-imobil-nereusita.md`](admin/identificare-imobil-nereusita.md) — procedura echipei + PDF pentru topograf și suport [`admin/identificare-imobil-ghid.pdf`](admin/identificare-imobil-ghid.pdf); design: [`plans/2026-09-21-identificare-imobil-nereusita-design.md`](plans/2026-09-21-identificare-imobil-nereusita-design.md)
- **Plată prin transfer bancar (IBAN):** [`admin/plata-transfer-bancar.md`](admin/plata-transfer-bancar.md) — procedura echipei: tab „Așteptare plată", confirmarea încasării din extras, legătura cu decontările
- **Meta Conversions API (tracking server-side):** [`technical/specs/meta-capi-tracking.md`](technical/specs/meta-capi-tracking.md)
- **Webhook Resend (bounce → banner admin + alertă):** [`technical/specs/resend-bounce-webhook.md`](technical/specs/resend-bounce-webhook.md)
- **Decontări Stripe (reconciliere cross-platform + proforme extra):** [`technical/specs/decontari-stripe-reconciliation.md`](technical/specs/decontari-stripe-reconciliation.md)
- **Runbook schimbare firmă (Stripe/Oblio/bancă noi):** [`technical/specs/schimbare-firma-runbook.md`](technical/specs/schimbare-firma-runbook.md)
- **ANCPI automation:** [`technical/specs/ancpi-automation-plan.md`](technical/specs/ancpi-automation-plan.md)
- **Cereri OCPI pentru topograf (extras CF, cât e ANCPI picat):** [`technical/specs/cereri-ocpi-colaborator.md`](technical/specs/cereri-ocpi-colaborator.md)
- **Decont avocată colaboratoare (eghiseul + CJO, tab admin):** [`admin/decont-avocat-colaborator.md`](admin/decont-avocat-colaborator.md)
- **Parolă internă pe Decont/Serviciile mele în portalul de colaborator (cont partajat cu angajat):** [`changelog/2026-09-09-parola-pagini-private-colaborator.md`](changelog/2026-09-09-parola-pagini-private-colaborator.md)
- **Decont Mircea — regularizarea din 07.09 (stare curentă, model cumulativ, ce rămâne de reglat):** [`operations/decont-mircea-2026-09-07-regularizare.md`](operations/decont-mircea-2026-09-07-regularizare.md)
- **Decont Mircea (topograf) — primul calcul + cutoff:** [`operations/decont-mircea-2026-08-26.md`](operations/decont-mircea-2026-08-26.md)
- **Cookie consent (GDPR, banner + consent receipts):** [`technical/specs/cookie-consent.md`](technical/specs/cookie-consent.md)
- **Plan email marketing A–Z (72k contacte, GDPR, roadmap):** [`marketing/email-marketing-plan-2026-09.md`](marketing/email-marketing-plan-2026-09.md)
- **Recuperare telefonică comenzi abandonate (coadă priorizare + cupoane custom):** [`technical/specs/phone-recovery-abandoned-carts.md`](technical/specs/phone-recovery-abandoned-carts.md)
- **Warm-up email pe registrul de 72k contacte (implicit oprit):** [`technical/specs/warmup-email-campaign.md`](technical/specs/warmup-email-campaign.md)
- **Emailuri de lifecycle (recenzie / expirare document / cross-sell) + campanii manuale din admin:** [`technical/specs/lifecycle-emails.md`](technical/specs/lifecycle-emails.md)
- **Deploy:** [`deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md)
- **Email (Resend + Zoho) setup:** [`deployment/EMAIL_RESEND_ZOHO_SETUP.md`](deployment/EMAIL_RESEND_ZOHO_SETUP.md)

---

> **Convenție de organizare** (după reorganizarea 2026-06-22):
> - Root `docs/` = doar 3 docuri vii (acest README, MASTER_PLAN, STATUS_CURRENT).
> - Status „viu" → `STATUS_CURRENT.md`. Ce s-a livrat → `changelog/`. Jurnal de sesiune → `session-logs/`. Milestone/snapshot încheiat → `archive/`.
> - Fiecare zonă mare are un `README.md` index (vezi `seo/README.md`).
