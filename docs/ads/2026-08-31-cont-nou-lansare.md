# Google Ads eghiseul.ro — pachet de lansare (cont nou)

**Data:** 31.08.2026 · **Decizie:** cont NOU pe EDIGITALIZARE SRL. Contul vechi (677-995-5005, eghiseul@gmail.com — istoric 2,09M lei la ROAS 1,41) e blocat pe politica „Documente guvernamentale și servicii oficiale", la fel ecazier — vezi `2026-08-18-analiza-cont-si-repornire.md` și memoria `ecazier-ads-istoric-politica`. Economia pe serviciu (CPA maxim = 40% din marjă) e în analiza din 18.08 — tabelul de acolo e sursa de adevăr.

**De ce acum:** organicul pe servicii e anihilat de spam update (20.08), dar cadastralul încă vinde organic. Pe „certificat de naștere/căsătorie online" NU rulează nimeni Ads (verificat 31.08, browser curat); pe constatator rulează 1 competitor în SERP (analiza celor 4 advertiseri: `2026-08-18-constatator-analiza-concurenta.md`). Landing-urile au fost aliniate la politică în commit `5e81b91` (bandă de neafiliere pe cele 4 pagini, fără „oficial" despre serviciu, poziționare asistență) — fix-ul care lipsea la blocările din 18.08.

---

## 0. Setup cont (manual, Raul)

1. Cont Google dedicat (ex. ads@edigitalizare.ro) → ads.google.com → cont nou, **EDIGITALIZARE SRL**, billing pe firmă, moneda RON.
2. **Verificarea advertiserului** din prima zi: Facturare → Verificarea advertiserului (acte SRL). Fără ea, categoria asta pică.
3. NU importa nimic din conturile ecazier / vechi.
4. Conversie: Obiective → Conversii → „Achiziție site" → ia **ID-ul (AW-XXXXXXXXX)** și **eticheta** → în Vercel setează `NEXT_PUBLIC_GOOGLE_ADS_ID` + `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` (format `AW-XXXXXXXXX/eticheta`). Codul e deja pe site (success page trimite valoare + transaction_id; Consent Mode v2 activ).
5. ⚠️ Memoria `google-ads-wizard-pierde-anuntul`: wizardul NU salvează pasul „Cuvinte cheie și anunțuri" până apeși „Terminat" — nu abandona la mijloc.
6. ⚠️ Memoria `google-ads-sitelinkuri-cont-contamineaza`: sitelinkurile se pun LA NIVEL DE CAMPANIE, niciodată pe cont.

## 1. Structură

| Campanie | Grupuri | Buget start | Licitare (conform `2026-08-18-strategie-licitare-decizie.md`) | CPA maxim |
|---|---|---|---|---|
| **SC-StareCivila** (Search) | naștere · căsătorie | 100 RON/zi | Maximizați clicurile cu CPC max 3 RON → după ~20 conversii „Maximizați valoarea conversiilor" (lecția Search-6/ecazier) | **200 lei** (marjă 500–600) |
| **SC-CazierFiscal** (Search) | cazier fiscal | 50 RON/zi | idem, CPC max 1,5 RON | **70 lei** — cel mai bun activ istoric: CPC 1,45, ROAS 3,37 |
| **SC-Constatator** (Search) | constatator | 30 RON/zi | idem, CPC max 1 RON | **24 lei** (istoric CPA 75 = pierdere; dacă nu iese sub 24 în 2 săpt., pauză) |

Locație: România + (a doua fază) diaspora — Italia/Spania/Germania/UK doar pentru StareCivila, limba română. Fără Display, fără parteneri de căutare la start. ⚠️ Naștere/multilingv livrează azi doar 67–73% în 16–18 zile (tabel livrabilitate 18.08) — anunțurile NU promit termene scurte pe stare civilă.

## 2. Cuvinte cheie

### Grup „Naștere" (potrivire expresie)
```
"certificat de nastere online"
"duplicat certificat de nastere"
"certificat nastere pierdut"
"eliberare certificat de nastere"
"copie certificat de nastere"
"certificat de nastere duplicat pret"
"cum obtin certificat de nastere"
```

### Grup „Căsătorie" (potrivire expresie)
```
"certificat de casatorie online"
"duplicat certificat de casatorie"
"certificat casatorie pierdut"
"eliberare certificat de casatorie"
"copie certificat casatorie"
```

### Grup „Constatator" (potrivire expresie)
```
"certificat constatator online"
"certificat constatator onrc"
"certificat constatator firma"
"certificat constatator pret"
"constatator cu istoric"
"certificat constatator srl"
```

### Negative (nivel de campanie, ambele)
```
gratuit, gratis, hub mai, mai.gov, ghiseul.ro, hub, program, primarie program,
model cerere, formular, pdf, download, descarca, acte necesare pentru casatorie,
anaf, politia, lege, cod civil, angajare stare civila
```
(„acte necesare" simplu NU e negativ — e intent de cumpărare pe naștere/căsătorie; revizuiește termenii de căutare săptămânal.)

## 3. Anunțuri RSA (copy validat pe limite: titluri ≤30, descrieri ≤90)

**Reguli de conformitate (nenegociabile):** niciodată „oficial/oficiale" (nici despre serviciu, nici lipit de „documente/acte" — memoria `google-ads-documente-oficiale`); emiterea se atribuie mereu autorității; poziționare de asistență.

### RSA Naștere

Titluri (caractere):
1. Certificat de Naștere Online (28)
2. Duplicat Certificat Naștere (27)
3. Fără Drumuri la Starea Civilă (29)
4. Te Ajutăm să Obții Duplicatul (29)
5. Certificat Pierdut? Te Ajutăm (29)
6. Asistență prin Avocat în Barou (30)
7. Comandă Online în 5 Minute (26)
8. Livrare pe Email și Curier (26)
9. Pentru Diaspora — 100% Online (29)
10. Taxe Incluse, Preț Afișat (25)
11. 4,9★ din Peste 450 Recenzii (27)
12. Depunem Cererea în Numele Tău (29)
13. Din Orice Localitate din Țară (29)
14. Serviciu Privat de Asistență (28)
15. Începe Acum, Formular Simplu (28)

Descrieri:
1. Te ajutăm să obții duplicatul de la Starea Civilă, fără deplasare. Avocat în Barou. (83)
2. Completezi online în 5 minute, noi depunem cererea prin împuternicire. Taxe incluse. (84)
3. Primești certificatul pe email și în original prin curier, oriunde te afli. (75)
4. Serviciu privat de asistență, rapid și transparent, cu prețul afișat. Comandă acum. (83)

### RSA Căsătorie
Identic cu Naștere, cu înlocuirile: titlul 1 „Certificat Căsătorie Online" (27), titlul 2 „Duplicat Certificat Căsătorie" (29), titlul 5 „Act Pierdut? Te Ajutăm Rapid" (28); descrierea 1 „Te ajutăm să obții duplicatul certificatului de căsătorie, fără nicio deplasare." (79).

### RSA Constatator

Titluri:
1. Certificat Constatator Online (29)
2. Constatator ONRC în Minute (26)
3. Doar cu CUI-ul Firmei (21)
4. 89 RON, Taxe ONRC Incluse (25)
5. Disponibil 24/7, și în Weekend (30)
6. Fără Taxă de Urgență (20)
7. Îl Obținem de la ONRC Rapid (27)
8. Constatator cu Istoric Complet (30)
9. Pentru Licitații și Bănci (25)
10. Depunere Automată la ONRC (25)
11. Primești PDF Semnat de ONRC (27)
12. Comandă în 2 Minute (19)

Descrieri:
1. Obținem certificatul constatator de la ONRC în câteva minute, 24/7. Taxe incluse. (81)
2. Introduci CUI-ul, plătești online, primești certificatul pe email. Simplu și rapid. (83)
3. Situație la zi 89 RON sau istoric complet 487 RON. Preț final, fără surprize. (77)
4. Serviciu privat de asistență: depunem cererea la ONRC în numele tău, automat. (77)

### Extensii (LA NIVEL DE CAMPANIE)
- **Sitelinks StareCivila:** Certificat de Naștere → /servicii/eliberare-certificat-de-nastere/ · Certificat de Căsătorie → /servicii/eliberare-certificat-de-casatorie/ · Cum Funcționează → /#cum-functioneaza · Contact/WhatsApp → /contact
- **Sitelinks Constatator:** Constatator pe Firmă · Constatator cu Istoric · Verificare Firmă · Contact
- **Callouts:** Taxe incluse · Livrare pe email · Avocat în Barou · Suport WhatsApp · Plată securizată
- **Structured snippet (Servicii):** Duplicat naștere, Duplicat căsătorie, Copie legalizată / respectiv Constatator firmă, Constatator istoric

## 4. Economie & ținte

Sursa de adevăr: tabelul „Cât ne permitem să plătim" din `2026-08-18-analiza-cont-si-repornire.md` (CPA maxim = 40% din marjă): stare civilă **200**, cazier fiscal **70**, constatator **24**. Referință suplimentară ecazier Search-6: CPA 194,68 la valoare medie 264 (ROAS 1,36) — aici stare civilă are valoare 998+/comandă, deci mult mai mult loc.

Grup suplimentar pentru SC-CazierFiscal (cuvintele câștigătoare istoric): `"cazier fiscal online"`, `"eliberare cazier fiscal"`, `"cazier fiscal anaf online"`, `"cazier fiscal pret"` — anunțuri pe modelul constatatorului, cu atribuirea emiterii către ANAF.

## 5. Monitorizare

- Zilele 1–3: verifică zilnic statusul anunțurilor (Eligibil vs „Limitat de politică"). Dacă apare limitarea → contestă IMEDIAT din anunț (landing-urile-s acum conforme) și notează exact motivul.
- Săptămânal: raport termeni de căutare → negative noi; nu opri anunțuri sub 1.000 de afișări.
- După ~20 conversii/campanie: comută pe „Maximizați valoarea conversiilor".

## Istoric decizii
- 31.08: preț headline rămâne ex-TVA pe site (decizie Raul); dacă review-ul pică pe „taxe ascunse", primul fix e afișarea prețului cu TVA pe paginile din campanie.
