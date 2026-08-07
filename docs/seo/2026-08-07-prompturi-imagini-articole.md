# Prompturi imagini featured — articolele care nu au încă imagine

**Data:** 2026-08-07 · 23 din 54 de articole nu au imagine featured.
`ArticleLayout` o caută prin convenție la `/images/articole/<slug>.webp`, deci fișierul trebuie
salvat exact cu numele slug-ului.

## Reguli valabile la toate

- Generează **16:9**, exportă la rezoluția maximă, apoi redimensionează la **1200×675 px** și
  convertește în **WebP** (calitate 80–85). Sub 150 KB per imagine.
- Nume fișier: `<slug>.webp`, salvat în `public/images/articole/`.
- Cere explicit în prompt: **fără text, fără litere, fără sigle, fără steaguri, fără fețe
  recognoscibile**. Modelele „scriu" litere inventate pe documente; dacă apar, regenerează adăugând
  `all documents are blank, no writing, no letters anywhere`.
- Ton: fotografie editorială realistă, lumină naturală, birou românesc credibil. Nu ilustrație, nu
   3D, nu stock zâmbitor.
- Sufix de folosit la finalul fiecărui prompt (îl scriu o dată aici, ca să nu-l repet mai jos):

```
photorealistic editorial photograph, natural window light, shallow depth of field, shot on a 35mm
lens, 16:9 landscape, muted realistic colors, no text or lettering anywhere, all documents
completely blank, no logos, no flags, no recognizable faces
```

Îl notez mai jos ca `[SUFIX]`.

---

## Prioritatea 1 — articolele cu trafic sau nou publicate

### cazier-fiscal-persoana-fizica
```
A person in their thirties sitting at a home desk reviewing a blank printed certificate held in
both hands, laptop open beside them showing a neutral blurred interface, a coffee cup and a pen on
the desk, calm morning light from a window on the left, seen from a three-quarter angle behind the
shoulder. [SUFIX]
```

### certificat-de-nastere-pierdut
```
An open cardboard document box on a living room table, old family papers and folders spread around
it, a person's hands searching through them, warm afternoon light, slightly cluttered and lived-in
scene suggesting a lost document. [SUFIX]
```

### duplicat-certificat-de-nastere
```
A public records office counter seen from the visitor side, a clerk's hands sliding a blank
certificate across the counter, soft indoor lighting, neutral institutional interior, shot from
chest height. [SUFIX]
```

### acte-necesare-certificat-de-nastere
```
A flat top-down arrangement on a wooden table: a blank folded certificate, an ID-sized blank card,
a pen and a simple checklist notepad with blank lines, natural daylight, tidy composition with
generous empty space. [SUFIX]
```

### schimbare-certificat-de-nastere-vechi
```
Two blank certificates side by side on a table, one visibly older with yellowed aged paper and worn
folds, the other crisp and new, a hand resting near the older one, natural side light emphasizing
the paper texture difference. [SUFIX]
```

### transcriere-certificat-de-nastere
```
A desk near a window with a blank foreign-style document, a passport-sized blank booklet and a
laptop, a suitcase corner visible in the blurred background suggesting return from abroad, late
afternoon light. [SUFIX]
```

### inregistrare-nastere-copil-nou-nascut
```
A parent holding a newborn in one arm while filling in a blank form on a table with the other hand,
soft hospital or home interior, gentle diffused light, face turned away from camera, tender and calm
mood. [SUFIX]
```

### ce-este-un-releveu
```
An architect's desk with a blank technical drawing sheet unrolled, a scale ruler, a mechanical
pencil and a small measuring tape, overhead daylight, clean minimal composition, drawing lines
abstract and unreadable. [SUFIX]
```

### ce-este-planul-cadastral
```
A large blank site plan spread across a table outdoors on a construction site, held down at the
corners by small stones, blurred rural land and a distant tree line in the background, bright
overcast daylight. [SUFIX]
```

---

## Prioritatea 2 — clusterul certificat constatator (7 articole)

Ține un **stil vizual unitar** pe tot clusterul: același birou, aceeași paletă, se schimbă doar
contextul. Așa se citesc ca o serie.

### certificat-constatator-de-baza
```
An entrepreneur's desk in a small modern office, an open laptop showing a neutral blurred document
viewer, one blank printed document with a plain blue ink stamp beside it, coffee cup, morning light.
[SUFIX]
```

### certificat-constatator-pfa
```
A freelancer working at a small home office desk, blank paperwork in a slim folder, laptop and
phone nearby, plants and a bookshelf in the softly blurred background, warm natural light. [SUFIX]
```

### certificat-constatator-pentru-banca
```
Two people at a bank desk seen from the side, one sliding a slim folder of blank documents toward
the other, modern glass office interior blurred behind, cool neutral daylight, faces not visible.
[SUFIX]
```

### certificat-constatator-pentru-licitatie
```
A conference table with several identical sealed envelopes arranged in a row, a pen and a blank
notepad beside them, formal meeting room with large windows, cool even light, no people. [SUFIX]
```

### certificat-constatator-pentru-notar
```
A notary office desk with a heavy wooden surface, blank documents stacked neatly, a brass desk lamp
and reading glasses, a stamp resting on the corner, warm focused lamp light. [SUFIX]
```

### certificat-constatator-pentru-fonduri-europene
```
A desk with an open laptop and a thick folder of blank documents, sticky notes on the desk edge, a
window overlooking a business district, bright morning light, organized busy atmosphere. [SUFIX]
```

### certificat-constatator-insolventa
```
An empty office with chairs pushed back, a few cardboard boxes stacked near the wall, blank papers
left on a desk, cool grey light through half-closed blinds, quiet and abandoned mood, no people.
[SUFIX]
```

---

## Prioritatea 3 — stare civilă (căsătorie, celibat)

### certificat-de-celibat
```
A person at a desk preparing a slim stack of blank documents for an envelope, a passport-sized blank
booklet beside them, plain interior, calm daylight, hands only in frame. [SUFIX]
```

### valabilitate-certificat-de-celibat
```
A blank certificate lying on a desk next to a simple wall calendar with unmarked days and a small
analog clock, soft daylight, composition suggesting a deadline without any readable numbers. [SUFIX]
```

### certificat-de-celibat-pentru-casatorie-in-strainatate
```
A travel-ready desk scene: a slim document folder, a blank passport booklet and a boarding-pass-sized
blank card on a table, a packed bag corner blurred behind, warm afternoon light. [SUFIX]
```

### duplicat-certificat-de-casatorie
```
A couple's hands on a table beside a blank certificate and two wedding rings placed to the side,
neutral home interior, soft window light, no faces. [SUFIX]
```

### transcriere-certificat-de-casatorie
```
A desk with a blank foreign-style certificate, a translation notepad and a laptop, a bookshelf
blurred in the background, calm study atmosphere, natural light. [SUFIX]
```

### model-certificat-de-casatorie
```
A blank ornate certificate form lying flat on a dark wooden desk, photographed from directly above,
a fountain pen resting beside it, soft even light, high detail on the paper texture. [SUFIX]
```

### acte-necesare-casatorie
```
A checklist notepad with blank lines, a small folder of blank documents and two wedding rings on a
bright table, top-down composition, cheerful but restrained daylight. [SUFIX]
```

---

## Verificare după generare

1. Nicio literă inventată pe documente. Dacă apar, regenerează.
2. Fără branding, fără sigle instituționale, fără steag tricolor.
3. Fețele să nu fie identificabile.
4. Redimensionează la 1200×675, convertește WebP, pune fișierul în `public/images/articole/`.
5. Setează `imageAlt` în `ArticleLayout` cu o descriere reală a imaginii, nu cu titlul articolului.

**Copyright:** dacă imaginile ajung și în articolele de presă cumpărate, notează sursa
„imagine generată AI, arhiva autorului" — startupcafe.ro cere explicit acest lucru.
