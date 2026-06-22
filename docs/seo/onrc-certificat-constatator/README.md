# ONRC — Certificat Constatator (cluster use-case)

**Status:** ✅ LIVE (2026-06-22) · 4 pagini · cluster pe **caz de utilizare**, NU pe locație

## De ce use-case, nu locație
Certificatul constatator e document **național** (emis online de ONRC). Intenția comercială e după CAZ (bancă, licitație, notar), nu după geografie. Birourile ORCT există dar sunt irelevante pentru o comandă online → cluster use-case.

## Pagini (root, ArticleLayout)
| Slug | Pentru |
|---|---|
| `certificat-constatator-pentru-banca` | deschidere cont firmă/PFA, credit firmă |
| `certificat-constatator-pentru-licitatie` | SEAP/SICAP, achiziții publice |
| `certificat-constatator-pentru-notar` | cesiune părți sociale, vânzare firmă, acte imobiliare |
| `certificat-constatator-pentru-fonduri-europene` | granturi IMM + AFIR/APIA |

Înregistrate în `src/config/articles.ts` (apar în `/blog`) + `HARDCODED_ARTICLE_SLUGS` (sitemap).

## Fapte verificate (mesaj standardizat pe toate paginile)
- **Emitent/canal:** ONRC, online via **myportal.onrc.ro** (InfoCert / fost RECOM). PDF e-semnat, 24/7, plată card, fără semnătura solicitantului.
- **Cost:** **30 lei** oficial (Ordin MJ 380/C/2024) pentru de bază; **~250 lei** pentru raport cu istoric.
- **Valabilitate:** ONRC nu pune termen legal („starea la zi"), dar solicitantul impune unul — dominant **30 de zile** (bănci, notari, SEAP resping mai vechi).
- **Objection-killer:** PDF-ul e-semnat **ESTE** original (acceptat la SEAP, bănci, ANAF, notari) — preîntâmpină „trebuie în original?".
- „extins" = zgomot de marketing; al doilea produs real e **istoric**.

## Competiție (validează cererea)
depus.ro + certificatconstatatoronline.ro rulează money-pages pe aceste use-case-uri. (contpedia.ro NU vinde — irelevant.)

## NU s-a făcut (filler)
`radiere/dizolvare` ca pagină separată — intenția e procedura, nu certificatul; acoperit doar ca secțiune/FAQ în „de bază vs istoric".

## Vezi și
`../SEO-STATUS-2026-06-22.md` — overview.
