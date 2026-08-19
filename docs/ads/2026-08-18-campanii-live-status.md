# Cele 3 campanii pornite pe 18.08.2026 — stare finală

Cont **eGhiseul 677-995-5005**. Toate rulează pe **Maximizarea clicurilor cu plafon CPC**, nu pe
Smart Bidding — motivul e în [strategia de licitare](2026-08-18-strategie-licitare-decizie.md):
n-avem încă cele 30 de conversii pe care le cere tCPA.

| Campanie | ID | Buget/zi | Plafon CPC | Serviciu | Marjă/comandă | CPA maxim |
|---|---|---|---|---|---|---|
| Search-Constatator-2026-08 | 24144189582 (istoric: vezi mai jos) | 100 lei | 6 lei | constatator de bază, 89 lei | ~55 lei | 24 lei |
| Search-Constatator-Istoric-2026-08 | 24144189582 | 80 lei | 12 lei | constatator cu istoric, 487 lei | ~230 lei | ~90 lei |
| **Search-Cazier-Fiscal-2026-08** | **24150154697** | **100 lei** | **3 lei** | cazier fiscal, 198 lei | ~178 lei | ~70 lei |

Setări comune, verificate pe fiecare: partenerii de căutare **OFF**, Display **OFF**, AI Max **OFF**
(„Personalizarea textului și extinderea adresei URL finale au fost dezactivate"), locație România
cu **„Prezență"** (nu „prezență sau interes"), limbă română, obiectiv Vânzări cu **doar `Achiziții`**.

## Campania de cazier fiscal (cea nouă)

De ce ea: în istoricul contului e singurul serviciu cu **ROAS 3,37** și CPC mediu **1,45 lei**.
La 100 lei/zi și un CPC estimat de 3 lei ⇒ ~148 clicuri/săptămână, deci cele 30 de conversii
necesare pentru tCPA se strâng în ~2 săptămâni.

**Cuvinte cheie** (exact + frază, fără potrivire amplă):
`[cazier fiscal online]`, `[cazier fiscal]`, `[certificat de atestare fiscala]`,
`[cazier fiscal persoana fizica]`, `[cazier fiscal firma]`, `[eliberare cazier fiscal]`,
`"cazier fiscal anaf online"`, `"obtinere cazier fiscal"`, `"cazier fiscal pfa"`

**Anunț RSA** → `https://eghiseul.ro/servicii/cazier-fiscal-online/`, cale afișată `/cazier/fiscal`.

Titluri (12): Cazier Fiscal Online · Cazier Fiscal Rapid Online · Cerere Online in 3 Minute ·
Primesti Actul pe Email · Fara Drum la Ghiseu · **Serviciu Privat, Nu ANAF** · Cazier Fiscal PF si PJ ·
Cazier Fiscal fara Deplasare · Certificat Atestare Fiscala · Obtinere Cazier Fiscal ·
Cazier Fiscal pentru Firma · Cazier Fiscal Persoana Fizica · Eliberare Cazier Fiscal

Descrieri (3):
1. Completezi cererea online in 3 minute. Ne ocupam noi de tot si primesti actul pe email.
2. Serviciu privat de intermediere, nu ANAF. Tarif 198 lei, fara drumuri si fara cozi.
3. Cazier fiscal pentru persoane fizice si firme. Suport pe WhatsApp si telefon, zilnic.

Numele companiei în anunț: **eGhiseul.ro**. Fără el, Google difuza anunțul cu un nume inventat din
URL, iar puterea anunțului rămânea „Slabă"; după completare a urcat la „Medie".

**35 de excluderi** la nivel de campanie: gratuit, gratis, gratuita, model, modele, formular,
formulare, exemplu, pdf, "ce este", "cum se obtine", "cat costa", "cat dureaza", wikipedia, forum,
lege, legislatie, "cod fiscal", "anaf ro", "portal anaf", "cont spv", "ghiseul ro",
"cazier judiciar", "cazier auto", "certificat de integritate", "loc de munca", angajare, salariu,
curs, "declaratie unica", "fisa fiscala", "impozite locale", "taxe locale", primarie,
"adeverinta de venit".

⚠️ N-am exclus cuvântul simplu `anaf`: ar fi blocat propriul nostru cuvânt cheie
`"cazier fiscal anaf online"`. Excluderile vizează doar navigaționalele (`anaf ro`, `portal anaf`,
`cont spv`).

## Capcana interfeței (a costat două reconstrucții)

Wizardul de campanie **nu salvează pe server pasul „Cuvinte cheie și anunțuri"** până când nu
închizi editorul de anunț cu **Terminat**, deși scrie „Toate modificările au fost salvate".
Concret, ce s-a întâmplat:

1. dai *refresh* pe pagină ⇒ cuvintele cheie și anunțul dispar complet, restul pașilor rămân;
2. navighezi la alt pas din meniul din stânga cu editorul de anunț deschis ⇒ anunțul se pierde,
   iar la „Verificați" apare „Creați un anunț / Adăugați cuvinte cheie".

Regulă pentru data viitoare: **completează cuvintele cheie și anunțul dintr-o bucată, apasă
„Terminat", și abia apoi mută-te din pas. Niciun refresh în tot pasul ăsta.** Verifică la final în
„Verificați" că secțiunea „Probleme" e goală.

A doua capcană, deja știută de la campania cu istoric: câmpul **„Adresa URL finală" din cutia de
sugestii de cuvinte cheie** arată identic cu cel al anunțului. Dacă îl completezi pe cel greșit,
anunțul rămâne fără URL și pică la validare cu „Acest câmp nu poate rămâne necompletat".

## Ce urmează

- [ ] Confirmă conversia `Purchase` end-to-end la prima comandă plătită reală (tag-ul e verificat
      live: `dataLayer` are `config AW-11464910041`, pixelii dau 200, `gclid` se prinde — lipsește
      doar evenimentul de conversie propriu-zis).
- [ ] Sitelinkuri: cele 4 din cont sunt **de constatator** și apar și pe anunțul de fiscal. De
      adăugat sitelinkuri la nivel de campanie pentru fiscal (ex. cazier fiscal PF / PJ / termene /
      întrebări frecvente).
- [ ] Monitorizare zilnică a termenilor de căutare în prima săptămână, pe toate 3.
- [ ] Stop-loss: CPA > 35 lei pe constatator de bază, > 70 lei pe fiscal, după 15–30 conversii.
- [ ] La 30+ conversii pe campanie ⇒ trecere pe **CPA vizat** (constatator 24 lei, fiscal 70 lei),
      cu plafonul de CPC scos.
- [ ] Rămâne interdicția: **zero reclamă la extras CF / topograf** cât timp ANCPI e picat.

---

## 19.08 — Respinse pe politica documentelor guvernamentale. Ce am aflat

A doua zi după publicare, Google a respins **3 din 4 campanii**:

| Campanie | Stare anunț | Afișări | Clicuri |
|---|---|---|---|
| Search-Cadastru-Documente-2026-08 (PAD) | **Eligibilă** | 107 | 9 |
| Search-Constatator-2026-08 | Respins — documente guvernamentale | 0 | 0 |
| Search-Constatator-Istoric-2026-08 | Respins | 0 | 0 |
| Search-Cazier-Fiscal-2026-08 | Respins | 99 | 19 |

Total cheltuit: **79,70 lei, 0 conversii**.

### De ce a trecut cadastrul și n-au trecut celelalte

Nu e o chestiune de cuvinte, ci de **ce vinde anunțul**. Cadastru/PAD vinde **munca topografului**
(„Ridicat de Topograf Autorizat", „Serviciu Privat, Nu ANCPI"). Celelalte trei vând **obținerea unui
document de la o instituție** — exact ce interzice politica.

Mailul cere „**un certificat**" — certificarea aia e doar pentru instituții guvernamentale sau
furnizori delegați oficial. **Noi nu suntem niciuna, deci calea e închisă.** Un cont nou ar fi
eludarea sistemelor: suspendare permanentă, inclusiv a conturilor asociate.

Politica exceptează explicit: consultanță fiscală, servicii juridice, B2B, servicii de avocat. La
cazier judiciar chiar avem cabinetul; la constatator, argumentul B2B e real. Dar exceptarea se
judecă **după pagina de destinație**, iar paginile noastre vând procurarea documentului — deci o
retrimitere fără rescrierea paginilor pică din nou și strică reputația contului.

### ⚠️ Capcana sitelinkurilor la nivel de cont

Cele 4 sitelinkuri create pe 18.08 sunt la **nivel de cont**, deci se atașează automat pe **toate**
campaniile. Trei au fost respinse pe aceeași politică:

| Sitelink | Stare |
|---|---|
| Constatator PFA — „Pentru PFA, II și IF / Doar cu CUI-ul, în minute" | **Eligibilă** |
| Constatator pentru bancă — „Acceptat de bănci și notari / **Emis** în câteva minute, 24/7" | Respins |
| Constatator cu istoric — „Raport cu toate mențiunile firmei / Cronologic, **487 lei taxe incluse**" | Respins |
| Tipurile de constatator — „De bază, IMM, insolvență, PF" | Respins |

Alea 3 = „Elemente (3)" din mailul de respingere primit **pe campania de cazier fiscal**, cu care
n-aveau nicio legătură. Sitelinkurile de cont propagă respingerile în tot contul, iar anunțul de
cadastru (aprobat) afișa sitelinkuri de constatator.

Din nou, diferența: cel aprobat spune **cui i se potrivește**; cele respinse promit **livrarea
documentului oficial** („Emis în câteva minute", „taxe incluse").

**Regulă de acum înainte: sitelinkuri per campanie, niciodată la nivel de cont**, cât timp în cont
coexistă servicii cu risc de politică.

Cele 3 au fost **întrerupte** pe 19.08 (nu șterse, ca să rămână istoricul).

### De făcut

- [ ] Sitelinkuri proprii, la nivel de campanie, pentru cadastru (nu de constatator)
- [ ] Decis dacă rescriem paginile de fiscal + constatator ca servicii profesionale (consultanță
      fiscală / B2B / asistență juridică) înainte de orice retrimitere
- [ ] Pus pe pauză cele 3 campanii respinse
- [ ] Extins cadastrul cu grupurile rămase (releveu, plan cadastral, coordonate Stereo 70, copii CF)
      și campania de certificat de urbanism
