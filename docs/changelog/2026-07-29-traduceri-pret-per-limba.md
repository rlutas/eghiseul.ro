# Traduceri: preț per limbă, 20 de limbi active, supliment Apostilă Haga — lanț complet

**Data:** 2026-07-29 (seara) · Commits: `8f629c8`, `e523add`, `f4d660c` (+ date în admin_settings)
**Declanșator:** prețurile confirmate de traducătoare (Iudith Bancoș, neplătitor TVA) —
analiza completă în [raspuns-traducatoare-2026-07-29.md](../serviciu-traduceri-apostile/raspuns-traducatoare-2026-07-29.md).

## Problema

Traducerea se vindea la **178,50 flat, indiferent de limbă** — câmpul `clientPriceDoc`
din `translation_price_list` exista dar nu era folosit nicăieri. Cu costurile reale
(45–150 lei/doc), daneza și norvegiana ar fi ieșit **în pierdere** (−2,48 lei net), iar
limbile slave la marjă de 25%. În plus, când comanda are și Apostilă Haga, traducătoarea
traduce și apostila (+20…+75/limbă) — cost care nu exista nicăieri în sistem.

## Ce s-a livrat (totul legat de aceeași sursă: `admin_settings.translation_price_list`)

| Punct din lanț | Ce face acum |
|---|---|
| **Wizard client** | prețul opțiunii = `clientPriceDoc` al limbii selectate; dropdown cu preț lângă limbă („Daneză — 349 lei"); la bifarea Apostilei Haga prețul traducerii crește cu `clientPriceApostilaExtra` (și scade la debifare); acoperă și opțiunile bundled |
| **Gardă la submit** | recalculează preț limbă + supliment Haga din setări și corectează ÎN SUS (payload editabil de client) — pattern-ul de la permisul străin |
| **Admin „Modifică" (plata extra)** | ruta `/modify` recalculează prețul traducerii adăugate telefonic din aceeași listă — înainte trimitea flat-ul din catalog (daneză facturată 178,50) |
| **Pop-up costuri (la Expediată/Finalizată)** | sugestia pentru traducere = cost/doc + suprataxa de apostilă când comanda are Haga, cu defalcare în etichetă |
| **Setări → Traduceri** | coloane noi: **Cost apostilă** (ce ne ia traducătoarea) și **Supl. client** (ce încasăm în plus), plus **marjă NETĂ** (÷1,21 — traducătorul e neplătitor de TVA; înainte marja era umflată cu 21%); switch Activ per limbă = dropdown-ul din wizard, live, fără deploy |
| **Setări → Furnizori → Tarife** | 20 de tarife traducere (cost/doc = cost/pag. suplimentară, regula 2.000 caractere) |

## Limbile și prețurile (20 active, erau 9)

| Treaptă | Limbi | Preț | Supliment Haga | Marjă netă |
|---|---|---|---|---|
| 1 | EN (UK/SUA/AUS), FR, IT, ES, DE, PT, NL + **maghiară (nouă)** | 178,50 | +40 / +70 | 62–102 lei |
| 2 | rusă, ucraineană, bulgară, polonă, cehă, slovacă, greacă | 249 | +60…+140 | 96–116 lei |
| 3 | suedeză, daneză, norvegiană | 349 | +120…+150 | 138–158 lei |

Supliment client = 2× costul traducătoarei, rotunjit la 10 — editabil per limbă.
**Bulgară:** doar traducere autorizată — legalizarea notarială e blocată în wizard
(card dezactivat + explicație + auto-drop). Limbile pe care NU le acoperă (arabă,
turcă, sârbă etc.) rămân inactive.

## Validare & schema

`TranslationPriceRow` + `validateTranslationPriceList`: câmpuri noi opționale
`ourCostApostila`, `clientPriceApostilaExtra`. API public `/api/translation-prices`
expune și suplimentul (costurile noastre rămân private).

## Rămas

- **Portarea pe cazierjudiciaronline.com + ecazier.ro** (liste de limbi proprii,
  probabil hardcodate) — sesiune separată.
- Termen per limbă afișat în wizard (1–4 zile); acte medicale +10 lei (doar în
  evidența internă); acte complexe la 2.000 caractere/pag (regulă documentată).
