# Prompturi imagini featured — direcția „documentar românesc"

**Data:** 2026-08-07 · Direcție aleasă de Raul: **documentar românesc real**.
23 din 54 de articole nu au imagine featured. `ArticleLayout` o caută prin convenție la
`/images/articole/<slug>.webp`.

---

## Principiul care lipsea din prima variantă

Prima serie descria **scene** („om la birou cu laptop și cafea") — de aceea ieșeau 23 de imagini
identice și banale. Aici fiecare prompt pornește de la **ideea articolului**, iar scena e aleasă ca
să o poarte. Ideea e scrisă deasupra fiecărui prompt, ca să poți judeca rezultatul: dacă imaginea
generată nu transmite ideea aia, regenerezi, indiferent cât de frumoasă e.

A doua regulă: **locul trebuie recunoscut de un român în două secunde**. Coridor de primărie cu
linoleum, ghișeu cu geam glisant, bloc de la periferie, casă la țară cu poartă de tablă. Nu „office
interior".

---

## Stare — 9 din 23 livrate (7 aug 2026)

| ✅ Gata | ⏳ Rămase |
|---|---|
| cazier-fiscal-persoana-fizica · certificat-de-nastere-pierdut · duplicat-certificat-de-nastere · acte-necesare-certificat-de-nastere · schimbare-certificat-de-nastere-vechi · model-certificat-de-casatorie · transcriere-certificat-de-nastere · inregistrare-nastere-copil-nou-nascut · certificat-de-celibat | valabilitate-certificat-de-celibat · certificat-de-celibat-pentru-casatorie-in-strainatate · transcriere-certificat-de-casatorie · duplicat-certificat-de-casatorie · acte-necesare-casatorie · certificat-constatator-de-baza · certificat-constatator-pfa · certificat-constatator-pentru-banca · certificat-constatator-pentru-licitatie · certificat-constatator-pentru-notar · certificat-constatator-pentru-fonduri-europene · certificat-constatator-insolventa · ce-este-un-releveu · ce-este-planul-cadastral |

⚠️ **Nu compune specimene peste hârtiile din poze.** S-a încercat pe 7 aug (transformare de
perspectivă + păstrarea luminii) și arăta artificial; a fost respins. Pozele rămân foto simplă, cu
documentul gol. Singura excepție validă: articolele unde specimenul **este** subiectul, ca
`model-certificat-de-casatorie`.

---

## Blocul de stil — se lipește la FINALUL fiecărui prompt

```
shot on 35mm film, Kodak Portra 400, available light only, visible film grain,
slightly desaturated muted palette, documentary photography, natural imperfection,
16:9 landscape, no readable text on any sign paper or screen, no logos, no flags,
no brand names, no recognizable faces
```

Îl notez mai jos ca **`[STIL]`**.

## Ancorele anti-clișeu — de ce contează

Riscul direcției ăsteia, spus de la început: modelele derapează în „est-european generic" sau
sovietic. Se corectează cu detalii materiale specifice României de azi. Folosește 2–3 din lista asta
în fiecare prompt, alese să se potrivească scenei:

| În loc de generic | Scrie concret |
|---|---|
| „institutional interior" | `pale green oil-painted wainscoting up to waist height, white wall above` |
| „office furniture" | `melamine-faced chipboard desk in light beech finish` |
| „waiting area" | `moulded plastic chairs in rows bolted to a metal rail` |
| „window" | `white PVC window with a tilt-and-turn handle` |
| „floor" | `worn grey speckled linoleum` sau `beige ceramic tiles with dark grout` |
| „apartment building" | `1970s concrete panel block with enclosed balconies in mismatched frames` |
| „rural house" | `single-storey house with a corrugated metal gate and a grapevine over the porch` |
| „heating" | `cast-iron radiator painted over many times` |

⚠️ **Nu** scrie „Romania", „Romanian" mai mult de o dată per prompt. Repetat, modelele produc
kitsch turistic (căruțe, port popular, Dracula). O singură mențiune plus ancorele materiale.

---

# Prioritatea 1 — articolele cu trafic

## 1. cazier-fiscal-persoana-fizica
> **Ideea:** drumul la administrația financiară, pe care articolul te învață să îl eviți.

```
A narrow corridor inside a public administration building in Romania, late afternoon.
Rows of moulded plastic chairs bolted to a metal rail along a wall with pale green
oil-painted wainscoting up to waist height and white wall above. A closed service
window with a sliding glass panel. Worn grey speckled linoleum reflecting light from
a single tall window at the far end. Completely empty, nobody present. [STIL]
```

## 2. certificat-de-nastere-pierdut
> **Ideea:** golul. Nu documentul, ci locul din care lipsește.

```
An open cardboard document box on a dining table in a modest apartment, seen from
above at a slight angle. Inside, a row of transparent document sleeves, one of them
visibly empty while the others hold folded papers. A hand rests on the edge of the
box, mid-search. Cluttered domestic background, crocheted tablecloth partially
visible, warm late-afternoon light through a white PVC window. [STIL]
```

## 3. duplicat-certificat-de-nastere
> **Ideea:** al doilea exemplar, identic cu primul. Repetiția e subiectul.

```
Two identical folded certificates lying on a dark wooden table, one placed slightly
offset over the other so both are visible, photographed from directly above. Both are
completely blank. A cast-iron radiator painted over many times is visible in the
blurred background. Hard side light from a window creates a sharp shadow line between
the two sheets. [STIL]
```

## 4. acte-necesare-certificat-de-nastere
> **Ideea:** lista pe care o ceri la ghișeu și o pierzi în geantă.

```
A handwritten list on a small torn notepad page, lying on a laminate counter next to
a worn ID card holder and a set of house keys. The notepad page is blank with only
faint ruled lines. Above, the edge of a sliding glass service window catches
fluorescent light. Slightly overexposed highlights, cool indoor colour cast. [STIL]
```

## 5. schimbare-certificat-de-nastere-vechi
> **Ideea:** trecerea de la vechi la nou, arătată prin materialul hârtiei.

```
Two blank certificates side by side on a table, photographed from directly above. The
left one is visibly aged: yellowed paper, deep fold creases, softened edges. The right
one is crisp, bright and flat. Raking light from the left emphasises the texture
difference between the two papers. Neutral dark background, generous empty space
around them. [STIL]
```

## 6. transcriere-certificat-de-nastere
> **Ideea:** actul făcut afară, care trebuie să intre în evidența de acasă.

```
A domestic table near a window in a small apartment: an unfolded foreign-format
document lying flat and blank, a passport-sized booklet closed beside it, and an
airline luggage tag still looped around a bag handle at the frame edge. Grey overcast
light through a white PVC window, cool tones, quiet mood, nobody present. [STIL]
```

## 7. inregistrare-nastere-copil-nou-nascut
> **Ideea:** cele 15 zile care încep în ziua în care ai altceva în cap.

```
A hospital discharge scene in a modest maternity ward corridor: a folded blanket and
a small knitted hat resting on a vinyl bench seat, a folder of blank papers beside
them, a parent's forearm visible at the edge of the frame holding a bag. Pale green
wainscoting, worn linoleum, fluorescent ceiling light mixed with daylight from a far
window. Face not visible. [STIL]
```

---

# Prioritatea 2 — clusterul certificat constatator

Ține **același oraș vizual** pe tot clusterul: birouri mici din blocuri reconvertite, lumină de
zi, mobilier PAL. Se schimbă doar situația. Așa se citesc ca o serie.

## 8. certificat-constatator-de-baza
> **Ideea:** actul de identitate al firmei, scos din dosarul de la înmatriculare.

```
A ring binder open on a melamine-faced chipboard desk in a small office converted from
an apartment, its plastic sleeves holding blank documents. A rubber stamp and an ink
pad rest beside it. Behind, a window with a tilt-and-turn handle looks onto the
enclosed balconies of a concrete panel block. Flat morning light. [STIL]
```

## 9. certificat-constatator-pfa
> **Ideea:** firma de un singur om, care lucrează de acasă.

```
A corner of a living room used as a workspace: a small desk pushed against the wall
under a shelf holding folders, a chair borrowed from the dining set, a blank document
lying next to a phone face-down. A drying rack with laundry stands blurred in the
background. Warm domestic light, lived-in and slightly untidy. Nobody present. [STIL]
```

## 10. certificat-constatator-pentru-banca
> **Ideea:** momentul în care actele trec peste birou și decizia nu mai e a ta.

```
A bank branch desk seen from the customer's side, over the shoulder: a slim folder of
blank papers pushed across the laminate surface toward a clerk whose hands only are
visible. A glass partition and a queue-number display are blurred behind. Cool even
interior lighting, low saturation, corporate but worn. [STIL]
```

## 11. certificat-constatator-pentru-licitatie
> **Ideea:** dosarul care se depune sigilat și nu mai poate fi corectat.

```
A row of identical sealed brown envelopes standing upright in a cardboard tray on a
formal meeting table, photographed at table height. A registry ledger lies open and
blank beside them. Long institutional room with pale green wainscoting, high windows
casting hard parallel light stripes across the table. No people. [STIL]
```

## 12. certificat-constatator-pentru-notar
> **Ideea:** biroul unde hârtia devine act.

```
A notary office desk photographed at eye level: heavy dark wood surface, a stack of
blank documents squared to the edge, a brass desk lamp switched on, a seal press and
reading glasses set aside. Bookcases with uniform ledger spines blurred behind. Warm
tungsten light against cool daylight from the left. [STIL]
```

## 13. certificat-constatator-pentru-fonduri-europene
> **Ideea:** dosarul gros cu termen, unde o hârtie lipsă anulează tot.

```
A thick lever-arch file lying open on a desk, densely filled with blank tabbed
dividers, coloured sticky flags protruding from its edge. A second, thinner file waits
beside it. Fluorescent office light, slightly green cast, papers stacked with visible
handling wear. Nobody present. [STIL]
```

## 14. certificat-constatator-insolventa
> **Ideea:** activitatea care s-a oprit. Absența oamenilor e subiectul.

```
An emptied small office: a desk chair pushed back at an angle, two cardboard boxes
stacked against a wall with a lighter rectangle where a cabinet used to stand, loose
blank papers left on a bare desk. Cold grey light through half-closed horizontal
blinds, dust visible in the air. Absolutely no people. [STIL]
```

---

# Prioritatea 3 — stare civilă

## 15. certificat-de-celibat
> **Ideea:** dovada pentru altcineva, cerută de altă țară.

```
A kitchen table with a document envelope addressed but blank, a passport booklet
closed on top of it, and a phone showing a blurred flight-booking screen face-up
beside them. Morning light through a window with a mesh curtain, warm and quiet.
Nobody present. [STIL]
```

## 16. valabilitate-certificat-de-celibat
> **Ideea:** documentul care expiră mai repede decât crezi.

```
A blank certificate lying on a desk beside a paper wall calendar whose days are
unmarked, and a small analogue clock lying face-up on the paper. Hard directional
light throws the clock's shadow across the certificate. Dark uncluttered background,
composition suggesting a deadline without any readable numbers. [STIL]
```

## 17. certificat-de-celibat-pentru-casatorie-in-strainatate
> **Ideea:** dosarul de nuntă pregătit dintr-o țară pentru alta.

```
A half-packed suitcase open on a bed, a slim document folder placed flat on the
folded clothes inside, a passport booklet tucked into the mesh pocket. Bedroom of a
concrete panel block apartment, sheer curtain diffusing afternoon light. Nobody
present, calm and slightly melancholic. [STIL]
```

## 18. duplicat-certificat-de-casatorie
> **Ideea:** actul care se cere după ani, când originalul e de mult pierdut.

```
An old photo album open on a table, its cellophane pages holding faded family
photographs turned face-down so no faces are visible, and a blank folded certificate
placed on the open page. Two plain wedding bands rest on the table edge. Warm low
light from a single lamp. [STIL]
```

## 19. transcriere-certificat-de-casatorie
> **Ideea:** căsătoria făcută afară, care încă nu există în evidența de acasă.

```
A dining table with two documents lying side by side: one in a foreign format,
horizontally oriented, and one in a domestic vertical format, both entirely blank. A
translator's stamp and a pen rest between them. Overcast daylight, cool neutral
tones, precise flat-lay composition. [STIL]
```

## 20. model-certificat-de-casatorie
> **Ideea:** cum arată actul, la nivel de hârtie.

```
Extreme close-up of a blank official certificate form on a dark wooden surface,
photographed from directly above, filling the frame. Visible watermark texture,
guilloche border pattern without any lettering, embossed seal impression catching
raking light from the left. Macro detail, shallow focus falling off at the edges.
[STIL]
```

## 21. acte-necesare-casatorie
> **Ideea:** teancul de hârtii din spatele unei zile la care nimeni nu se gândește.

```
A flat-lay on a bright table: a small stack of blank documents, two plain wedding
bands placed on top of the stack, a fountain pen, and a folded fabric napkin at the
frame edge. Soft directional daylight from the upper left, gentle shadows, calm and
uncluttered composition. [STIL]
```

---

# Prioritatea 4 — cadastru

## 22. ce-este-un-releveu
> **Ideea:** planul interior — desenul e eroul, nu biroul.

```
A technical floor-plan drawing unrolled flat and held down at two corners by a scale
ruler and a mechanical pencil, photographed from directly above so the drawing fills
the frame. The drawn lines are abstract and unreadable, no dimensions or lettering.
Slight paper curl at the edges, hard overhead light picking out the graphite sheen.
[STIL]
```

## 23. ce-este-planul-cadastral
> **Ideea:** hârtia scoasă afară, peste terenul pe care îl descrie.

```
A large blank site plan spread on the ground outdoors at the edge of a rural plot,
weighted down at the corners with stones. Beyond it: a fence of wooden pickets, a
single-storey house with a corrugated metal gate, and a bare field running to a
distant tree line. Bright overcast daylight, wind lifting one corner of the paper.
No people. [STIL]
```

---

## Blocul negativ — dacă tool-ul tău acceptă negative prompt

```
text, letters, numbers, handwriting, watermark, logo, flag, brand name, signage,
human faces, extra fingers, deformed hands, stock photo look, smiling business people,
glossy corporate, 3d render, illustration, cartoon, HDR, oversaturated, Soviet,
brutalist propaganda aesthetic, folk costume, horse cart
```

## Verificare după generare — specifică direcției ăsteia

1. **Testul de recunoaștere.** Arată imaginea cuiva și întreabă „unde e locul ăsta?". Dacă răspunsul
   e „nu știu, un birou", regenerezi. Dacă e „la primărie" sau „la un ghișeu", e bună.
2. **Testul de clișeu.** Dacă a ieșit gri-sovietic, becuri chele și pereți crăpați, modelul a derapat
   în „Eastern Bloc". Adaugă ancore de prezent: `PVC window`, `melamine desk`, `flat-screen monitor
   switched off`, `2020s`.
3. **Litere inventate.** Regenerează cu `all documents completely blank, no writing anywhere`.
4. **Fețe.** Nicio față identificabilă. Mâini și umeri sunt în regulă, dar verifică degetele.
5. **Granulația.** Dacă iese perfect curată și lucioasă, nu e documentar. Insistă pe
   `visible film grain, available light only`.

## Livrare

- Export **1200×675 px, WebP**, calitate 80–85, sub 150 KB.
- Nume fișier: exact `<slug>.webp`, în `public/images/articole/`.
- După ce pui fișierul, setează `imageAlt` în `ArticleLayout` cu descrierea reală a imaginii, nu cu
  titlul articolului — altfel alt-textul nu ajută pe nimeni.
- Dacă imaginile ajung și în articolele de presă cumpărate, notează sursa „imagine generată AI,
  arhiva autorului" (startupcafe.ro o cere explicit).
