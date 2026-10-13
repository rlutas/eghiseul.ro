# 09.10.2026 — CJO: de ce scad clicurile din Google, reindexare și linkuri spre prima pagină
<!-- categorie: seo -->

## Pentru echipă

În primele 9 zile din octombrie am încasat ~9.550 lei, față de ~16.200 lei în aceleași
zile din septembrie. Aproape toată diferența vine de pe cazierjudiciaronline.com.
eghiseul a scăzut doar cu 10%. Plata funcționează normal: cine ajunge la pasul de
plată plătește ca și în septembrie. Mai puțini oameni încep comanda.

Azi am cerut Google să recitească 9 pagini de oraș și prima pagină, cu titlurile noi.
Butoanele „Comandă cazier judiciar” din ghidurile CJO duc acum la formularul de pe
prima pagină, nu la pagina de București.

**Ce aveți de făcut:** sunați lista de 51 de clienți CJO care au completat datele în
octombrie și n-au plătit. 16 dintre ei au ajuns chiar la plată. Lista o primiți de la
Raul. Notați în coloana „Rezultat apel” ce v-a răspuns fiecare.

---

## Ce arată datele

**Vânzări 1–9 oct. vs 1–9 sept. (plătite, după `paid_at`):** eghiseul 6.462 vs 7.191 lei
(−10%); CJO 2.892 vs 9.034 lei (−68%); ecazier 198 vs 0; documentero 0.

**Plata nu e problema.** Pe CJO plătesc 6% din formularele începute în oct., față de
5,4% în sept. La pasul de plată plătesc 47%, față de 57%. Nu apar erori de checkout
în logurile Vercel (48 h).

**Search Console CJO (proprietatea domeniu, date din 19.09):**
- Pozițiile nu au căzut. Paginile de oraș stau pe 4,4–4,8 în medie, iar pe
  „cazier <oraș>” pe locul ~2.
- CTR-ul pe orașe a scăzut la aceeași poziție: 6,0% până pe 01.10, apoi 5,1–5,3%
  după titlurile din 05.10. SERP-ul live pentru „cazier oradea” arăta încă titlul
  „program ghișeu și varianta online”, cu adresa ghișeului în descriere, deci omul
  primea răspunsul fără să intre pe site.
- Pe 02–03.10 a fost o gaură în Google (246 și 92 de clicuri pe zi), apoi traficul a
  revenit.
- Afișările pe orașe au scăzut cu 23% în 2 săptămâni, la poziție egală. Pierderea e
  mai ales în căutările rare.
- „cazier judiciar” a coborât de pe 7,4 pe 9,0. Pe acest termen concurau trei pagini
  CJO: `/`, `/cazier-judiciar-online/bucuresti` și
  `/cazier-judiciar-persoane-fizice-ghid`.
- „cazier judiciar online” stă pe ~7, cu CTR ~0,5%. Deasupra noastră sunt 4 reclame
  ale concurenților și un rezumat AI care avertizează de „site-uri terțe ~198 RON”.

## Ce s-a făcut

1. **Cereri de indexare în GSC** (proprietatea URL-prefix, contul u/0): Constanța,
   Brașov, Sibiu, Târgu Mureș, Oradea, Buzău, Arad, Baia Mare, Bacău și `/`.
   **IndexNow** (Bing): 19 pagini de oraș + `/`, `/cazier-fiscal-online` și ghidul
   pentru persoane fizice, toate acceptate (200).
2. **Linkuri interne pe CJO** (CJO `c82e599c`): 9 butoane din ghiduri, 3 de pe
   `/cazier-fiscal-vs-cazier-judiciar` și cardul „Cazier Judiciar Online” din
   `CrossSellSection` duc acum la `/#formular` sau `/`, nu la
   `/cazier-judiciar-online/bucuresti`. Un link nou în textul ghidului pentru
   persoane fizice („cazierul judiciar online” → `/`). Titlurile, descrierile și
   poziția formularului nu s-au schimbat.
3. **Lista de sunat:** 51 de sesiuni CJO din octombrie, pașii 5–6, fără plată
   ulterioară. Fișierul e local (date personale), nu e în repo.

## Observat, nerezolvat

- GSC, inspecția pentru `/`: „Fragmentele de recenzii: 5 elemente nevalide”. De
  verificat împreună cu ratingul „4.9 · 441” rămas de decis la C3.
- Sept. vs aug. nu se poate compara pe proprietatea domeniu (date doar din 19.09).
  Proprietatea URL-prefix are istoric din iulie.

## Verificare

- 13.10: CTR-ul pe orașe revine spre 6% pe zilele de după recitire.
- 16.10: „cazier judiciar” se oprește pe o singură pagină (`/`) în GSC și urcă de la
  9,0.
- Formulare CJO începute: ținta e ~40 pe zi lucrătoare până luni 12.10.
