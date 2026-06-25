# Keyword Research — per serviciu

Folder cu cercetarea de cuvinte cheie, **un subfolder per serviciu**. Sursa: export-uri Semrush / GSC, salvate „frumos" (grupate pe sub-intenție, cu Volume + KD + Intent + maparea la pagină).

## Convenție
```
docs/seo/keywords/
  README.md                       # acest index
  certificat-nastere/keywords.md
  certificat-casatorie/keywords.md
  certificat-celibat/keywords.md
  cazier-judiciar/keywords.md
  cazier-auto/keywords.md
  extras-carte-funciara/keywords.md
  certificat-constatator/keywords.md
```

Fiecare `keywords.md`: tabel grupat pe **cluster de sub-intenție**, cu coloane `Keyword | Volume | KD% | Intent | Pagina țintă`. La final: total volum cluster + concluzie SEO (ce pagini facem).

**Intent legend (Semrush):** `I`=Informational, `N`=Navigational, `C`=Commercial, `T`=Transactional.

## Status
| Serviciu | Keywords salvate | Sursă | Notă |
|---|---|---|---|
| certificat-nastere | ✅ (4 clustere, ~27.670 vol) | Semrush 2026-06-19 | KD mic (11%) — winnable; cluster topical, NU matrice orașe |
| certificat-casatorie | ✅ (5 clustere, ~5.850 vol) | Semrush 2026-06-19 | KD 11%; cluster topical. ⚠️ „certificat medical căsătorie" = alt document |
| certificat-celibat | ⏳ pending | — | de adăugat export |
| cazier-judiciar | ⏳ pending | GSC | date în `docs/seo/gsc-data/` |
| cazier-auto | ⏳ pending | GSC | — |
| extras-carte-funciara | ⏳ pending | — | vezi `../carte-funciara/competitor-analysis.md` |
| certificat-constatator | ⏳ pending | — | segmentare pe caz, nu orașe |
| cadastru (releveu/plan încadrare/plan cadastral) | ✅ (3 clustere, ~9.200 vol) | Semrush 2026-06-25 | KD 2–19, winnable. Pagini: copie-releveu / copie-plan-incadrare / extras-plan-cadastral. 2 articole propuse. Vezi `cadastru/keywords.md` |

## Legătură cu planul
Maparea keyword → pagini e operaționalizată în `docs/plans/2026-06-19-location-seo-engine.md`.
