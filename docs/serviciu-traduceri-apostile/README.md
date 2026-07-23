# Serviciu NOU: Traduceri autorizate + legalizări + apostile (analiză & plan)

**Status:** 📋 ANALIZĂ — 2026-07-23. Nimic implementat; documentul e baza pentru
negocierea cu traducătoarea + notarul și pentru decizia de pricing.

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
   noastră ÎL ARE? La ce notari?
2. Copii legalizate după originale (des cerute împreună cu traducerea) — preț.
3. Apostilă notarială (Camera Notarilor) prin notar: preț + termen + pe ce
   acte se aplică (traduceri legalizate, copii legalizate).
4. Apostilă pe ORIGINALE: ce se duce la Camera Notarilor vs prefectură
   (instituția 1) vs tribunal — cine din echipă poate depune, împuternicire?
5. Program/SLA: putem duce zilnic un batch? termen de întoarcere?

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

## 11. Plan de acțiune

1. ✅ Benchmark Kenna + structura documentului (azi).
2. ⬜ Query DB: distribuția limbilor cerute până acum + purpose-uri (cerere reală).
3. ⬜ **Mesaj către doamna de la traduceri** (draft în §12) cu lista §6 → primim prețuri + limbi.
4. ⬜ Discuție notar (lista §7) → prețuri legalizare/apostilă + logistica specimenului.
5. ⬜ Decizie pricing final (completăm §9) + care limbi intră în faza 1.
6. ⬜ Research supralegalizare (faza 2).
7. ⬜ Implementare: serviciu nou în platformă (wizard modular — ghid existent
   `docs/technical/specs/modular-wizard-guide.md`), pagină SEO („traduceri
   legalizate online", „traducere buletin engleză" etc. — de făcut keyword
   research separat), integrare import DHL după semnarea contractului.

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
