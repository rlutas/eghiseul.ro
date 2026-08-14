# Audit prețuri servicii imobiliare vs cfunciara.ro — 14.08.2026

Verificare cerută de Raul: „trecem prin cfunciara și aliniem exact prețurile cu
ce au ei; verifică și prețurile de urgență, că acolo urgența vine cât documentul
sau mai mult".

Sursa: paginile lor de serviciu, citite live pe 14.08.2026. Ei afișează **fără
TVA** („179 lei + TVA"), noi afișăm **cu TVA** → comparația se face la
`preț_lor × 1,21`.

## Rezultatul pe scurt

**Grila noastră este identică cu a lor**, la leu, pe toate cele 14 servicii prin
topograf — bază, taxă de urgență și termene. Nu e nimic stricat: valorile
„aberante" de la urgență (134,31 / 255,31 / 423,50) sunt exact taxele lor
(+111 / +211 / +350), convertite cu TVA de migrarea 086 din 25.06.

Observația lui Raul despre urgență e însă corectă ca fapt de business: **la ei
prioritatea costă cât documentul**, iar noi am preluat asta ca atare.

## Tabel comparativ

| Serviciu | Ei (fără TVA) | Ei ×1,21 | Noi | Urgență la ei | ×1,21 | Urgența noastră | Termen ei → noi |
|---|---|---|---|---|---|---|---|
| Copie Carte Funciară | 139 | 168,19 | **168,19** ✅ | +151 | 182,71 | **182,71** ✅ | 4z → 4z ✅ |
| Extras CF colectivă | 139 | 168,19 | **168,19** ✅ | +151 | 182,71 | **182,71** ✅ | 4z → 4z ✅ |
| Copie după releveu | 179 | 216,59 | **216,59** ✅ | +111 | 134,31 | **134,31** ✅ | 4z → 4z ✅ |
| Copie arhivă OCPI | 179 | 216,59 | **216,59** ✅ | +111 | 134,31 | **134,31** ✅ | 4z → 4z ✅ |
| Copie inventar coordonate | 179 | 216,59 | **216,59** ✅ | +111 | 134,31 | **134,31** ✅ | 4z → 4z ✅ |
| Copie intabulare | 179 | 216,59 | **216,59** ✅ | +211 | 255,31 | **255,31** ✅ | 4z → 4z ✅ |
| Copie plan cadastral | 179 | 216,59 | **216,59** ✅ | +211 | 255,31 | **255,31** ✅ | 4z → 4z ✅ |
| Copie plan încadrare | 179 | 216,59 | **216,59** ✅ | +211 | 255,31 | **255,31** ✅ | 4z → 4z ✅ |
| Copie contract vânzare-cumpărare | 179 | 216,59 | **216,59** ✅ | +211 | 255,31 | **255,31** ✅ | 4z → 4z ✅ |
| Plan de amplasament (PAD) | 179 | 216,59 | **216,59** ✅ | +211 | 255,31 | **255,31** ✅ | 4z → 4z ✅ |
| Actualizare adresă CF | 250 | 302,50 | **302,50** ✅ | +350 | 423,50 | **423,50** ✅ | 15z→5z urgent, la fel ✅ |
| Certificat de sarcini | 250 | 302,50 | **302,50** ✅ | fără | — | fără ✅ | 4z → 4z ✅ |
| Certificat dețineri imobile | 250 | 302,50 | **302,50** ✅ | fără | — | fără ✅ | 5z → 5z ✅ |
| Certificat urbanism informare | 780 | 943,80 | **780** ⚠️ | fără | — | fără ✅ | 30z → 30z ✅ |
| Identificare imobil după adresă | 250 | 302,50 | **198** ⚠️ | fără | — | fără ✅ | 10z → **3z** ⚠️ |
| Identificare imobile după proprietar | 250 | 302,50 | **198** ⚠️ | fără | — | fără ✅ | 5z → 5z ✅ |

## Cât cântărește urgența la ei (și, implicit, la noi)

| Serviciu | Bază | Urgență | Urgența ca % din bază |
|---|---|---|---|
| Copie CF / extras CF colectivă | 139 | +151 | **109%** |
| Copiile de 179 (intabulare, plan cadastral, plan încadrare, contract, PAD) | 179 | +211 | **118%** |
| Copiile „simple" (releveu, arhivă OCPI, inventar coordonate) | 179 | +111 | 62% |
| Actualizare adresă CF | 250 | +350 | **140%** |

Pentru comparație, la cazier urgența e 80 la o bază de 198 = **40%**.

Deci prioritatea pe zona cadastrală mai mult decât dublează factura. E prețul
lor, preluat de noi — nu o greșeală de calcul.

## Unde NU suntem aliniați (3 servicii)

1. **Certificat de urbanism pentru informare** — 780 la noi (cu TVA) vs 943,80
   la ei. Suntem cu 163,80 mai ieftini.
2. **Identificare imobil după adresă** — 198 vs 302,50. Suntem cu 104,50 mai
   ieftini **și** promitem 3 zile față de 10 la ei.
3. **Identificare imobile după proprietar** — 198 vs 302,50, termen identic.

Identificările sunt servicii vechi ale noastre (dinainte de colaborarea cu
topograful, când mergeau prin workerul ANCPI), de aceea au rămas pe grila
proprie.

## De decis (business, nu tehnic)

- Ridicăm cele 3 servicii la nivelul lor sau le păstrăm ca preț de intrare?
- Termenul de 3 zile la identificare imobil: îl ținem (e un avantaj real față de
  cele 10 zile ale lor) sau îl aliniem, ca să nu promitem ce nu putem susține cât
  timp e-Terra e oprit?
- Păstrăm urgența copiată de la ei (dublează factura) sau punem o grilă proprie,
  mai vandabilă? Din **498 de comenzi pe servicii imobiliare (126 plătite),
  ZERO au bifat urgența** — deci prețul ăsta nu s-a vândut niciodată. Fie e prea
  mare, fie opțiunea nu se vede; oricum, nu pierdem venit existent dacă o
  ieftinim.

Nimic din tabel nu s-a modificat în urma acestui audit — e doar constatare.
