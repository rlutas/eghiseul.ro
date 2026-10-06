# Canalul YouTube eGhiseul.ro: setup, primele 3 clipuri și cum măsurăm

De ce: mențiunile brandului pe YouTube sunt cel mai puternic semnal măsurat pentru a fi citat de asistenții AI (vezi `docs/seo/2026-10-06-geo-ai-citari-plan.md`). Clipurile sunt informative, nu reclame: răspund la întrebările pe care oamenii le pun deja, cu faptele de pe paginile noastre, și se termină cu un cadru scurt eghiseul.ro.

Proiectul video (Remotion) e în `/Users/raul/Projects/eghiseul-videos` (repo git separat). Scripturile stau într-un singur fișier, `src/data/videos.ts`, iar fiecare fapt are sursa listată. Fișierele randate sunt în `out/<id>/`.

## 1. Setup canal (Raul)

- [ ] Creezi canalul pe contul Google al firmei (nu pe unul personal), ca **cont de marcă**, ca să poată fi administrat de mai mulți oameni.
- [ ] Nume: **eGhiseul.ro** · handle: **@eghiseul** (sau `@eghiseul.ro` dacă primul e luat).
- [ ] Imagine de profil: logo-ul (`public/images/brand/logo.webp`). Banner: fundal navy cu logo-ul alb, fără text de reclamă.
- [ ] Descrierea canalului:

  > Clipuri scurte despre actele de care ai nevoie în România: cazier judiciar, cazier fiscal, acte de stare civilă, carte funciară. Ce arată fiecare document, cât e valabil și cum îl obții, inclusiv gratuit, direct de la instituție.
  >
  > eGhiseul.ro este un serviciu privat de asistență, neafiliat instituțiilor statului. Documentele le eliberează instituțiile competente și pot fi cerute și direct, la ghișeu.

- [ ] Linkuri pe canal: eghiseul.ro, cazierjudiciaronline.com, documentero.ro.
- [ ] Setări implicite de încărcare: limba română, categoria „Educație”, comentarii moderate (ținute pentru aprobare dacă au linkuri).
- [ ] Playlisturi: „Cazier judiciar”, „Cazier fiscal”, „Acte de stare civilă”, „Carte funciară și cadastru”.
- [ ] Clipurile **nu** au sunet (doar text și subtitrări arse în imagine). Opțional: muzică discretă din YouTube Audio Library, adăugată direct în YouTube Studio la editare.

## 2. Fișa de încărcare pentru fiecare clip

Pentru fiecare: încarci MP4-ul, pui titlul și descrierea din `out/<id>/description.txt` (are capitole și link cu UTM), tagurile din `out/<id>/metadata.json`, miniatura PNG și fișierul de subtitrare `.srt` (limba: română). Shorts-ul îl încarci separat, cu `description-short.txt` și `<id>-short.srt`.

### Clipul 1: valabilitatea cazierului judiciar
- Video: `out/cazier-valabilitate/cazier-valabilitate.mp4` (1920×1080, 1:11, 4,6 MB)
- Shorts: `out/cazier-valabilitate/cazier-valabilitate-short.mp4` (1080×1920, 0:50, 2,6 MB)
- Titlu: **Cât e valabil cazierul judiciar și când îți trebuie unul nou**
- Miniatură: `out/cazier-valabilitate/cazier-valabilitate-thumb.png`
- Subtitrări: `cazier-valabilitate.srt`, `cazier-valabilitate-short.srt`
- Playlist: Cazier judiciar

### Clipul 2: cazierul judiciar din străinătate
- Video: `out/cazier-strainatate/cazier-strainatate.mp4` (1920×1080, 1:00, 3,8 MB)
- Shorts: `out/cazier-strainatate/cazier-strainatate-short.mp4` (1080×1920, 0:40, 2,3 MB)
- Titlu: **Cazierul judiciar din străinătate: cele 3 variante**
- Miniatură: `out/cazier-strainatate/cazier-strainatate-thumb.png`
- Subtitrări: `cazier-strainatate.srt`, `cazier-strainatate-short.srt`
- Playlist: Cazier judiciar

### Clipul 3: cazierul fiscal
- Video: `out/cazier-fiscal/cazier-fiscal.mp4` (1920×1080, 0:58, 3,0 MB)
- Shorts: `out/cazier-fiscal/cazier-fiscal-short.mp4` (1080×1920, 0:40, 1,9 MB)
- Titlu: **Cazierul fiscal: ce arată (sancțiuni, nu datorii) și cât e valabil**
- Miniatură: `out/cazier-fiscal/cazier-fiscal-thumb.png`
- Subtitrări: `cazier-fiscal.srt`, `cazier-fiscal-short.srt`
- Playlist: Cazier fiscal

## 3. Ritm

1–2 clipuri pe săptămână, în aceeași zi (de exemplu marțea): clipul lung plus Shorts-ul lui. Următoarele subiecte, din ce caută oamenii și ce ne citează deja AI-ul: extrasul de carte funciară (ce arată, cum îl citești), certificatul constatator pentru bancă, extrasul multilingv (Convenția CIEC, 23 de state), certificatul de celibat pentru căsătoria în străinătate. Faptele se iau numai de pe paginile noastre verificate; un clip nou se adaugă în `src/data/videos.ts`, iar randarea durează sub un minut.

## 4. Cum măsurăm

- **YouTube Studio**, lunar: vizualizări, timp de vizionare, clicuri pe link (Statistici avansate → Surse de trafic externe), căutările din YouTube care aduc clipurile.
- **Comenzi**: linkurile au `utm_source=youtube&utm_medium=video&utm_campaign=<id>` (Shorts: `<id>-short`), deci comenzile apar în `orders.attribution` și în tabelul „Comenzi pe canal” din `/admin/marketing`. De verificat după primele comenzi că `utm_source=youtube` e clasificat corect (nu „direct”).
- **Citări AI**: raportul „AI Performance” din Bing Webmaster și mențiunile brandului; ținta e să apară canalul printre sursele răspunsurilor la „cât e valabil cazierul judiciar” etc.
- Prag de decizie: după 8 clipuri (≈1 lună), dacă nu vedem vizualizări din căutare sau trafic spre site, schimbăm subiectele, nu ritmul.
