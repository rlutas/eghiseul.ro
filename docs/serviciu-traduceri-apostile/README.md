# Serviciu NOU: Traduceri autorizate + legalizări + apostile (analiză & plan)

**Status:** 📋 ANALIZĂ — 2026-07-23. Nimic implementat; documentul e baza pentru
negocierea cu traducătoarea + notarul și pentru decizia de pricing.

> **📊 Research legal + piață verificat** (deep-research, 24 afirmații 3-0 pe
> surse guvernamentale): [`research-legal-si-piata.md`](research-legal-si-piata.md)
> — procedurile oficiale exacte, taxele, lanțul per document, prețurile
> competiției. Descoperiri cheie: apostila la prefectură e **GRATUITĂ** și se
> poate la ORICE prefectură; UE nu cere apostilă pe stare civilă/cazier
> (Reg. 2016/1191); nimeni nu vinde preț fix online (toți per pagină / „cere
> ofertă"); codess taxează apostila 59+comision 150 pe o taxă de stat gratuită.

## 1. Conceptul

Clientul urcă documentul (buletin/CI, pașaport, cazier, certificat, acte auto,
diplomă etc.), alege limba și nivelul de certificare, plătește online, primește
scan pe email + originalul fizic prin curier dacă vrea.

Niveluri de serviciu (în trepte, fiecare o include pe precedenta):
1. **Traducere simplă** (fără ștampilă) — ieftină, volum
2. **Traducere autorizată** (traducător autorizat MJ)
3. **Traducere legalizată** (notarul legalizează semnătura traducătorului)
4. **Apostilă notarială** (Camera Notarilor, pe traducerea legalizată)
5. **Apostilă Haga pe original** (unde clientul are nevoie — prefectură/Camera
   Notarilor, depinde de act)
6. **Supralegalizare** (țări NON-Haga: MAE → ambasada țării — ex. Emirate,
   Qatar, Kuweit, China, Canada parțial) — de documentat exact fluxul

**De ce noi:** avem deja fluxul complet (wizard + plată + KYC + curier +
facturare), partener traduceri, avocat, notar, și — proaspăt negociat — DHL
-18% pe TOATE destinațiile + **import** (colectare de la clientul din
străinătate: DE→RO 207 RON). Serviciul de traduceri e exact use-case-ul pentru
importul DHL: clientul din diaspora ne trimite originalul, îl procesăm, îl
returnăm.

## 2. Ce avem DEJA (infrastructură + istoric)

- **Opțiunea traducere** pe cazier & co: 178,50 RON, 9 limbi
  (`src/config/translation-languages.ts`): Engleză (UK/SUA/AUS), Franceză,
  Italiană, Spaniolă, Portugheză, Germană, Olandeză.
- **Legalizare notarială**: 99 RON (opțiune existentă). **Apostilă Haga**:
  opțiune existentă. Apostilă Notari: opțiune existentă.
- Partener: „doamna de la traduceri" (de negociat listă extinsă + limbi noi).
- Notar: relație existentă (de clarificat exact ce poate — vezi §7).
- Livrare: Fan/Sameday domestic + DHL internațional (tarife noi -18%) +
  import DHL pentru dus-întors documente originale.
- Termene în wizard: mecanismul OPTION_DELIVERY_IMPACT + termen per serviciu.

## 3. Benchmark concurență — kenna.ro/preturi (extras 2026-07-23)

Kenna vinde **per pagină** (2.000 caractere cu spații), prețuri FĂRĂ TVA,
termen 24h până la 5 pagini. Grupele lor de limbi (per pagină, uz general):

| Grupă | Limbi | Preț/pag | Urgent |
|---|---|---|---|
| I | EN, DE, FR, ES, IT, HU | 20-25 | 25-30 |
| II | PT, RU | 35-45 | 40-50 |
| III | NL, NO, SK, BG, UA, SR, PL, **TR**, SE, **EL**, FI | 50-65 | 55-70 |
| IV | HR, **AR (arabă)**, CS, **ZH (chineză)** | 70-80 | 75-85 |
| V | JA, DA, SQ, **HE (ebraică)**, HI, LA, SL | 85-90 | 90-95 |
| VI | LT, MK, VI, UR, FA (persană) | 220-250 | — |

Extra Kenna: legalizare notarială locală **40 RON** prima copie + 6 RON/copie
suplimentară; legalizare per act **45 RON**; +5 RON/exemplar de la al 3-lea;
curier +16 RON.

### Research extins (23.07, după-amiază)

**centruldevize.ro (T&B Visa International, București):** apostilare +
supralegalizare + traduceri pentru 100+ țări, vize (specialitate: invitații
Rusia), **„servicii diaspora" remote** — concurent direct pe nișa noastră.
FĂRĂ prețuri publice (pagina de traduceri = 404); vând prin „cere ofertă".
Confirmă diferențiatorul nostru: preț fix + checkout online.

**traducerilegalizate.com (București):** documente standard (certificat
naștere, CI, permis, **cazier**) de la **20 lei/pag**; acte auto/bancare 30;
diplome 30; contracte 35; medicale 40. Limbi: FR/IT/ES/DE de la 20, TR/EL 40,
RU/HU/PL/BG 50. **Legalizare ~30 lei/doc; apostilă/supralegalizare 50
lei+TVA/exemplar.** Urgent +50%; străină→străină +50%.

**Taxa oficială apostilă Camera Notarilor (CNPB): 50 lei+TVA per exemplar**
(pe acte notariale, copii legalizate și traduceri legalizate). Supralegalizare
non-Haga: lanț Cameră → MAE → misiunea diplomatică a statului (confirmat).

**Concluzie piață:** nimeni nu vinde online cu preț fix per document +
checkout — toți per pagină / „cere ofertă". Costul de achiziție pe grupa I e
mic (20-30/pag) → marja reală vine din convenience + bundling
(traducere+legalizare+apostilă+livrare+import DHL), nu din traducerea în sine.

**Observații strategice vs Kenna:**
- Ei vând per pagină → clientul nu știe cât plătește până nu-i numără paginile.
  **Oportunitatea noastră: preț FIX per document standard** (un buletin = 1
  pagină mereu, cazier = 1-2, certificat = 1) — checkout instant online, fără
  „cere ofertă". Documentele standard au lungime predictibilă → putem fixa.
- Legalizarea lor e 40-45 RON → noi vindem azi la 99 (marjă bună, dar de
  verificat costul real la notarul nostru).
- Grupa I e ieftină (20-25/pag) — acolo concurăm pe COMODITATE (online, plată
  card, livrare, tot fluxul), nu pe preț.
- **Arabă e la ei 70-80/pag** — cerută la noi și INEXISTENTĂ în lista noastră.

## 4. Lista documentelor standard (pentru preț fix per document)

Grupate după lungime predictibilă (baza calculului cu traducătoarea):

**1 pagină (fix):** carte de identitate/buletin · pașaport (pagina de date) ·
permis de conducere · certificat de naștere · certificat de căsătorie ·
certificat de deces · cazier judiciar · cazier auto · certificat de
integritate · adeverință (generică, 1 pag) · talon auto (CIV) · atestat
profesional

**1-2 pagini:** diplomă (bacalaureat/licență/master) · certificat de celibat ·
extras multilingv · adeverință medicală · recomandare

**Variabile (per pagină, ofertă la upload):** foaie matricolă / supliment
diplomă · contract vânzare auto · sentință divorț · acte firmă (CUI,
constatator) · procuri · documente medicale · orice alt document

## 4b. Harta apostilării — CE se apostilează UNDE (și ce NU se poate)

Apostila Haga se aplică în România de TREI autorități diferite, după tipul
actului — asta dictează logistica per document (de VERIFICAT cu notarul, §7):

| Autoritate | Ce apostilează | Documentele noastre |
|---|---|---|
| **Instituția Prefectului** | acte administrative ORIGINALE | certificate stare civilă (naștere/căsătorie/deces), cazier judiciar, adeverințe, certificate de rezidență |
| **Camera Notarilor Publici** (50+TVA/ex.) | acte notariale, **copii legalizate**, **traduceri legalizate** | traducerile noastre legalizate + copiile legalizate ale originalelor |
| **Tribunal** | hotărâri judecătorești | sentințe divorț, hotărâri |

**Capcane cunoscute (de confirmat):**
- **Diplomele NU se apostilează direct** — întâi viză CNRED (Ministerul
  Educației) / inspectorat, apoi apostila la prefectură. Flux mai lung —
  termen separat în wizard.
- CI/pașaport/permis: originalul NU se apostilează (act de identitate) — se
  face **copie legalizată la notar → apostilă pe copia legalizată** la Cameră.
- Actele mai vechi de un anumit format (certificate stare civilă vechi) pot
  necesita preschimbare înainte de apostilare.
- Pentru țările NON-Haga nimic din tabel nu ajunge — lanțul e supralegalizare
  (MAE + ambasadă), faza 3.

Consecință pentru wizard: câmpul „țara de utilizare" decide automat lanțul
corect (Haga → apostilă la autoritatea potrivită tipului de act; non-Haga →
supralegalizare/faza 3 → deocamdată mesaj + contact manual).

## 5. Limbile — ce avem, ce lipsește, ce cerem

- **Avem (9):** EN (UK/SUA/AUS), FR, IT, ES, PT, DE, NL.
- **Lipsă cu cerere confirmată:** **ARABĂ** (căutată — clienți pentru Golf/
  Emirate; la Kenna grupa IV). De adăugat prioritar.
- **Lipsă probabil cerute (diaspora + destinații frecvente):** Greacă, Turcă,
  Maghiară (grupa I la Kenna!), Norvegiană, Suedeză, Daneză, Finlandeză
  (diaspora nordică), Poloneză, Cehă, Slovacă, Ebraică (Israel — avem clienți),
  Rusă, Ucraineană, Chineză, Japoneză.
- **Cererea reală din DB (query 2026-07-23, ~6 săpt de la lansarea opțiunii):**
  20 selecții traducere — Engleză 9 (UK 7/SUA 1/AUS 1), Italiană 6, Spaniolă 2,
  Franceză/Germană/Olandeză câte 1. Țări apostilă: Germania 3, Italia 2,
  Cipru 2, Africa de Sud/Columbia/Peru câte 1. **Atenție la interpretare:**
  araba/greaca/turca au 0 pentru că NU pot fi selectate (nu-s în listă) —
  cererea pentru ele vine din mesaje/telefoane, nu din date. Volumul mic de
  până acum = opțiune atașată cazierului, nu serviciu de sine stătător.

## 6. Lista pentru DOAMNA DE LA TRADUCERI (de trimis — cere preț + termen)

Format cerut: preț per DOCUMENT standard (nu per pagină) unde se poate + preț
per pagină pentru rest; termen standard + termen urgent; pe fiecare limbă.

| # | Ce cerem | Detalii |
|---|---|---|
| 1 | Lista completă de limbi pe care le acoperă (direct sau prin colaboratori) | separat: pe care le face în regim AUTORIZAT (MJ) |
| 2 | Preț per document standard | pentru lista din §4 (1 pagină fix), pe grupe de limbi |
| 3 | Preț per pagină | pentru documentele variabile, pe grupe de limbi |
| 4 | Termen standard + urgent | și dacă urgentul costă extra |
| 5 | ARABĂ | o face? dacă nu — are colaborator? preț? |
| 6 | Limbi rare (chineză, ebraică, persană, japoneză) | face/colaborator/refuză? |
| 7 | Preț la volum | ce discount la 30-50-100 documente/lună? |
| 8 | Exemplare suplimentare | cost per exemplar în plus |
| 9 | Poate duce ea la legalizare/apostilă? | sau predăm noi la notar? costul serviciului complet la ea vs pe bucăți |
| 10 | Format livrare | scan + fizic; cât de repede după traducere |

## 7. Întrebări pentru NOTAR

1. Legalizarea semnăturii traducătorului: preț per act + per exemplar
   suplimentar (benchmark Kenna: 40-45 RON). Cerință: traducătorul trebuie să
   aibă specimen de semnătură depus la notarul respectiv — traducătoarea
   noastră ÎL ARE? La ce notari? Dar colaboratorii ei pe limbi rare (arabă)?
2. Copii legalizate după originale (des cerute împreună cu traducerea) — preț.
3. Apostilă notarială (Camera Notarilor) prin notar: preț + termen + pe ce
   acte se aplică (traduceri legalizate, copii legalizate).
4. **Validarea hărții din §4b**: confirmă per tip de document unde se
   apostilează originalul (prefectură/Cameră/tribunal), că CI/pașaport merg pe
   copie legalizată + apostilă pe copie, fluxul CNRED la diplome, și ce acte
   NU se pot apostila deloc.
5. Apostilă pe ORIGINALE la prefectură/tribunal: cine din echipă poate depune,
   împuternicire necesară? Termene per autoritate.
6. Program/SLA: putem duce zilnic un batch? termen de întoarcere?

## 8. Flow-ul clientului (draft wizard)

1. **Upload documente** (foto/PDF; multi-doc per comandă) + tip document ales
   din listă (§4) — la tipurile standard prețul e FIX și afișat live.
2. **Limba țintă** (+ opțional limba sursă dacă nu e româna — traduceri
   inversate ex. DE→RO pentru recunoaștere în România!).
3. **Nivel certificare** (trepte §1) + exemplare suplimentare + urgență.
4. **Scop/țara de utilizare** → sistemul recomandă nivelul corect (ex. Emirate
   → supralegalizare; Italia → apostilă; validare anti-vânzare-greșită).
5. **Livrare**: scan email (gratuit) / curier RO / DHL internațional (tarife
   noi) / **IMPORT DHL** — clientul din străinătate ne trimite originalul cu
   etichetă plătită de noi (unde originalul e necesar: apostilă pe original,
   legalizare copie).
6. **Plată** → flux standard (contract, facturare, status page, termene).

Termene de expus: traducere 1-2z + legalizare 1z + apostilă 1-2z +
supralegalizare 5-10z (de confirmat) + livrare.

## 9. Model de pricing (draft — de completat după prețurile traducătoarei)

Principiu: **preț fix per document standard, pe grupe de limbi** (à la Kenna
dar per document, nu per pagină), marjă ~2-2,5× pe traducere + marjă fixă pe
legalizare/apostilă (unde costul e fix).

Schiță (de validat cu costurile reale):
| Componentă | Cost estimat | Preț client (draft) |
|---|---|---|
| Traducere doc standard grupa I (EN/DE/FR/ES/IT/HU) | ~25-30 | 89-119 |
| Traducere doc standard grupa II-III (PT/RU/NL/TR/EL/nordice) | ~45-70 | 149-199 |
| Traducere doc standard grupa IV-V (AR/ZH/HE/JA) | ~80-95 | 249-299 |
| Legalizare notarială | ~40-45 | 99 (există deja) |
| Apostilă notarială | de aflat | de stabilit |
| Apostilă original | taxe + drum | de stabilit |
| Supralegalizare | de aflat (MAE+ambasadă) | de stabilit |
| Exemplar suplimentar | ~5-10 | 29-39 |

Referință internă: azi vindem traducerea la **178,50** pe 9 limbi (toate
~grupa I-II) — peste piață pe grupa I; noul serviciu per-document poate poziționa
grupa I mai jos (89-119) pentru volum, păstrând 178,50 în bundle-urile cazier.

## 10. Supralegalizare (de documentat separat)

Pentru țări NON-membre Haga (Emirate, Qatar, Kuweit, Arabia Saudită, China,
Egipt, Iordania...): lanțul e MAE (supralegalizare) → ambasada/consulatul țării
în România. Costuri + termene + cine poate depune = TODO research dedicat
înainte s-o vindem (o putem lansa în faza 2; faza 1 = traduceri + legalizare +
apostilă).

## 11. Plan CONCRET de lansare (pe faze) — actualizat 23.07 p.m.

**Unealta internă (LIVRATĂ 23.07):** `/admin/settings` → tab **„Traduceri"** —
lista celor 29 de limbi (9 active + 20 neoferite pe grupele de cost I-VI) cu
coloanele: cost/doc NOSTRU, cost/pag, preț client, marjă calculată, activ,
note. Acolo intri prețurile când vine oferta traducătoarei; flag-ul „Activ"
alimentează LIVE dropdown-ul de limbi din wizard + dialogul Modifică (API
public `/api/translation-prices`; fallback lista statică). Araba e deja în
listă (inactivă, marcată „CERUTĂ — prioritate").

### Faza 0 — negociere (ACUM)
1. ✅ Benchmark concurență (Kenna + centruldevize + traducerilegalizate + taxe oficiale).
2. ✅ Query DB cerere reală (EN 9 / IT 6 din 20; limbile lipsă nu-s măsurabile).
3. ✅ Lista de prețuri în admin settings (unealta de negociere).
4. ⬜ **Mesaj către doamna de la traduceri** (§12) cu lista §6 → completezi
   costurile în settings pe măsură ce vin.
5. ⬜ Discuție notar (§7) → costuri legalizare/apostilă + specimenul de semnătură.

**Criteriu GO faza 1:** cost grupa I ≤ ~40 lei/doc standard (marjă 2×+ la
89-119) ȘI acoperire arabă (direct sau colaborator).

### Faza 1 — soft-launch, ZERO build
Activezi limbile noi din settings pe opțiunea de traducere EXISTENTĂ (cazier,
certificate) — dropdown-ul se extinde instant, fără deploy. Preț rămâne flat
178,50 → validare cerere reală pe limbile noi înainte de orice investiție.

### Faza 2 — serviciul de sine stătător
Wizard nou „Traduceri documente" (upload multi-doc, preț FIX per document
standard pe grupe de limbi, trepte autorizată→legalizată→apostilă, exemplare,
urgență), pagină SEO (keyword research separat: „traduceri legalizate online",
„traducere cazier engleză"...), livrare + **import DHL** pentru originale
(contract semnat → DE→RO 207). Pricing per limbă din lista de settings.

### Faza 3 — supralegalizare non-Haga
Research separat MAE + ambasade (Emirate/Qatar/China...) — costuri, termene,
împuterniciri. Se lansează doar după ce faza 2 rulează.

## 11b. NEGOCIEREA — ținte concrete (23.07, seara)

**⚠️ Descoperire care schimbă discuția:** site-urile afișează „de la 20-25
lei/pag", dar NOUĂ ni s-a facturat **minim 45 RON** pe lista traducătoarei —
prețurile publice sunt teaser, realele diferă. De-asta lista Excel
(`lista-preturi-traducator.csv`, în acest folder + pe Desktop): o completează
EA, negru pe alb, per limbă și per document — fără „depinde".

### Ce negociezi la TRADUCĂTOARE (ținte)
| Punct | Ancoră | Țintă | Walk-away |
|---|---|---|---|
| Doc standard grupa I (EN/DE/FR/IT/ES) | „pe site-uri e 20-25/pag" | **30-35 RON/doc** | 45 (statu-quo — nu acceptăm, la 45 marja la 89-119 moare) |
| Per pagină variabile grupa I | 20-25 piața | 30-35 | 45 |
| Arabă /doc | Kenna 70-80/pag | **≤100/doc** | 150 |
| Exemplar suplimentar | Kenna +5 | 5-10 | 20 |
| Termen | piața 24h/5 pag | 24-48h standard | 72h |
| Volum | — | −10% la 30/lună, −15% la 50+ | fără discount = căutăm al 2-lea traducător |
| Model | — | **preț per DOCUMENT fix în scris** (lista Excel semnată/confirmată pe email) | doar per pagină „depinde" |

Pârghii: (1) volum existent (traducerile de pe caziere, în creștere) +
serviciu dedicat nou = flux constant, nu ocazional; (2) plată centralizată
lunară, fără discuții per act; (3) există alternativă — birourile mari
(Kenna & co) lucrează cu firme la prețurile de pe site; (4) ancora „ni s-a
facturat 45 la ce piața dă cu 20-25".

### Ce negociezi la NOTAR (ținte)
| Punct | Referință piață | Țintă |
|---|---|---|
| Legalizare semnătură traducător | 30-45/act | **≤35/act** + tarif redus exemplar 2+ (Kenna: 6!) |
| Copie legalizată | — | preț/pagină clar |
| Apostilă notarială (prin el la Cameră) | taxa oficială 50+TVA | 50+TVA + comision fix mic (≤30) pentru drum |
| SLA | — | batch zilnic predat dimineața → gata în aceeași zi |
| Specimen | — | confirmare că traducătoarea (și colaboratorii ei pe limbi rare!) au specimen la notariatul lui — altfel lanțul se rupe pe arabă etc. |

### Ce servicii putem oferi + competiția (sinteză decizie)
| Serviciu | Competiția cere | Noi putem vinde | Condiție |
|---|---|---|---|
| Traducere autorizată doc standard, grupa I | 20-35/pag (site) — real mai mult; nimeni cu preț fix online | **89-119/doc** fix, checkout online | cost ≤35-40 |
| Traducere grupa II-III (RU/TR/EL/nordice) | 40-65/pag | 149-199/doc | cost ≤70 |
| Arabă + rare (grupa IV-V) | 70-90/pag, greu de găsit | **249-299/doc** (cerere nedeservită) | colaborator cu specimen |
| Legalizare notarială | 30-45 | 99 (există) — marjă 55-65 | notar ≤35 |
| Apostilă notarială pe traducere | 50+TVA taxă | 149-179 (taxă+drum+marjă) | SLA notar |
| Apostilă pe original | 50+TVA / prefectură | 179-249 | de clarificat per tip act |
| Pachet „totul inclus" (trad+leg+apostilă) | nimeni online | ~349-399 grupa I — ancora ofertei | tot lanțul funcțional |
| Dus-întors original diaspora | nimeni | + livrare (DHL import 207 + export 155 DE) | contract DHL semnat |

## 12. Mesaj DRAFT către doamna de la traduceri

> Bună ziua, [nume],
>
> Vrem să extindem colaborarea: lansăm pe eghiseul.ro un serviciu dedicat de
> traduceri autorizate/legalizate pentru documente standard (buletin, pașaport,
> cazier, certificate de stare civilă, permis, diplome etc.), cu volum estimat
> în creștere lună de lună — și vrem să lucrăm cu dumneavoastră ca partener
> principal.
>
> Ca să putem pune prețuri fixe pe site, avem nevoie de o ofertă pe:
> 1. Lista limbilor pe care le acoperiți în regim autorizat (direct sau prin
>    colaboratori) — ne interesează în mod special și araba, greaca, turca,
>    maghiara, limbile nordice, ebraica, rusa, ucraineana, chineza;
> 2. Preț per DOCUMENT pentru actele standard de 1 pagină (CI, pașaport,
>    cazier, certificat naștere/căsătorie/deces, permis), pe limbă sau pe
>    grupe de limbi;
> 3. Preț per pagină pentru documente variabile (foi matricole, sentințe,
>    contracte);
> 4. Termen standard / urgent și costul urgenței;
> 5. Preț pentru exemplare suplimentare;
> 6. Discount la volum (30-50-100 documente/lună);
> 7. Dacă puteți prelua și legalizarea notarială/apostila (serviciu complet)
>    și la ce cost, sau predăm noi actele la notar.
>
> Putem discuta și telefonic dacă e mai simplu — spuneți-mi când aveți timp.
>
> Mulțumesc!

---

**Legături:** [analiza DHL](../operations/dhl-livrare-analiza-cost-negociere.md)
(tarife noi + import) · [ghid wizard modular](../technical/specs/modular-wizard-guide.md)
· prețuri opțiuni existente: `/admin/settings` → Servicii.
