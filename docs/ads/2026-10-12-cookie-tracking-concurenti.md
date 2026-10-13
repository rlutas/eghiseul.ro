# Tracking înainte de consimțământ: concurenții și site-urile noastre (12.10.2026)

Test: browser curat, fără nicio interacțiune cu bannerul, prima pagină încărcată plus 7 secunde de așteptare. Am notat cererile către trackere și cookie-urile de tracking setate. `gcs=G100` = Consent Mode cu totul refuzat; un tag care pornește în modul ăsta e de regulă acceptat.

| Site | Trackere pornite fără consimțământ | Cookie-uri setate fără consimțământ | Verdict |
|---|---|---|---|
| caziere.ro | GA4, Google Ads (ccm/doubleclick), Microsoft Clarity | `_ga`, `_ga_*`, `_gcl_au` | ❌ |
| roghiseul.ro | Google Ads (ccm/doubleclick); niciun text despre cookie pe pagină | `_gcl_au` | ❌ |
| obtinecazier.ro | Google Ads (ccm/doubleclick) + Inspectlet (înregistrarea sesiunii) | `_gcl_au`, `__insp_*` | ❌ |
| eliberarecazier.ro | GTM, Google Ads, Microsoft Clarity | `_gcl_au` | ❌ |
| infocazier.ro | GA4 cu Consent Mode refuzat (G100), dar **Clarity pornește** | — | ⚠️ Clarity |
| cfunciara.ro | GA4 cu Consent Mode refuzat (G100) | — | ✅ |
| constatator-online.ro | nimic | — | ✅ |
| **eghiseul.ro** | nimic | — | ✅ |
| **documentero.ro** | nimic | — | ✅ |
| **cazierjudiciaronline.com** | până azi: GTM, GA4, Google Ads, fără banner. **Reparat 12.10 (CJO `02ee98f5`): nimic** | — | ✅ |
| **ecazier.ro** | până azi: GA4, Google Ads, fără banner. **Reparat 12.10: nimic** | — | ✅ |

## Concluzie

Reparat pe 12.10.2026: CJO și ecazier au acum bannerul de pe eghiseul (`changelog/2026-10-12-cjo-ecazier-banner-cookie.md`). Toate cele 4 site-uri ale noastre sunt curate la testul live. Plângerile, dovezile și textele sunt în `2026-10-12-plangeri-anspdcp.md`.
