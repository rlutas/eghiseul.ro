# Canalul YouTube eGhiseul.ro: setup, primele clipuri și cum măsurăm

> **Document istoric (06.10, dimineața).** Descrie setup-ul canalului și versiunea 2 a clipurilor, cu vocea din macOS. Standardul actual e versiunea 3, cu vocea ElevenLabs: vezi [playbook-clipuri.md](playbook-clipuri.md). Ce e programat: [plan-postari-2026-10.md](plan-postari-2026-10.md).

De ce: mențiunile brandului pe YouTube sunt cel mai puternic semnal măsurat pentru a fi citat de asistenții AI (vezi `docs/seo/2026-10-06-geo-ai-citari-plan.md`). Clipurile sunt informative, nu reclame: răspund la întrebările pe care oamenii le pun deja, cu faptele de pe paginile noastre, și se termină cu un cadru scurt eghiseul.ro.

Proiectul video (Remotion) e în `/Users/raul/Projects/eghiseul-videos` (repo git separat).
- **Versiunea 2 (cea de urcat):** scripturile în `src/v2/data.ts`, fișierele randate în `out/v2/<id>/`, kitul de canal în `out/branding/`.
- Versiunea 1 (doar text, fără sunet) a rămas în `out/<id>/`; nu se mai folosește.

## Ce e nou în versiunea 2

- **Intro de 2,5 s** cu logo-ul (sting sonor), apoi **întrebarea-cârlig** în primele 2 secunde („Ți-a cerut angajatorul cazier și nu știi dacă cel vechi mai e bun?”) și răspunsul imediat după.
- **Voce în română** (vocea Ioana din macOS), **muzică de fundal** discretă și efecte scurte la tăieturi. Toată partea audio e generată de noi, deci nu are drepturi de autor de plătit și nu primește reclamații Content ID.
- **Ritm mai rapid:** o idee pe cadru, cadre de 2–6 s, ilustrații animate (calendar, clădire, laptop, glob, documente generice), cifre mari, comparații „apare / nu apare”, subtitrări arse.
- **Ecran final de 12 s** cu „Abonează-te” și două zone libere unde pui în YouTube Studio elementele de final (alt clip + abonare).
- **3 formate per clip:** 16:9 pentru YouTube, 9:16 pentru Shorts, Reels și TikTok, 4:5 pentru feed-ul Facebook și Instagram.
- Fără imagini generate cu AI: generatorul de imagini disponibil (Higgsfield) consumă credite plătite (≈6,5 credite pe imagine la calitate bună), așa că ilustrațiile sunt desenate în cod. Nu folosim nicăieri sigle, ștampile sau documente care să pară acte reale.

## 1. Setup canal (Raul)

Textele gata de copiat sunt în `out/branding/channel.md`.

- [ ] Creezi canalul pe contul Google al firmei, ca **cont de marcă** (poate fi administrat de mai mulți oameni).
- [ ] Nume: **eGhiseul.ro** · handle: **@eghiseul** (sau `@eghiseul.ro`).
- [ ] Imagine de profil: `out/branding/avatar.png` (800×800).
- [ ] Banner: `out/branding/banner.png` (2560×1440; textul stă în zona sigură, vizibilă pe telefon).
- [ ] Filigran video: `out/branding/watermark.png` (150×150), afișat pe toată durata.
- [ ] Descrierea canalului și linkurile: din `out/branding/channel.md` (are declarația de neafiliere).
- [ ] Trailer pentru vizitatorii neabonați: `out/v2/trailer/trailer-wide.mp4` (≈37 s).
- [ ] Setări implicite de încărcare: limba română, categoria „Educație”, comentarii ținute pentru aprobare dacă au linkuri.
- [ ] 4 playlisturi (nume și descrieri în `channel.md`): Cazierul judiciar · Cazier fiscal și acte pentru firme · Acte din străinătate · Shorts: răspunsuri în 60 de secunde.

## 2. Fișa de încărcare pentru fiecare clip

Pentru fiecare clip, în `out/v2/<id>/`:

| Ce urci | Fișier |
|---|---|
| YouTube (lung) | `<id>-wide.mp4` + `description.txt` (capitole, surse, link cu UTM) + `<id>-wide.srt` + `<id>-thumb.png` |
| YouTube Shorts | `<id>-tall.mp4` + `description-short.txt` + `<id>-tall.srt` (titlul scurt e `shortTitle` din `metadata.json`) |
| Facebook / Instagram feed | `<id>-feed.mp4` (4:5) + `description-facebook-instagram.txt` |
| Reels / TikTok | același `<id>-tall.mp4` |

Titlurile și tagurile sunt în `metadata.json`.

| Clip | Titlu YouTube | Lung | Shorts | Feed |
|---|---|---|---|---|
| `cazier-valabilitate` | Cât e valabil cazierul judiciar și când îți trebuie unul nou | 1:18 | 0:45 | 0:45 |
| `cazier-strainatate` | Cazierul judiciar din străinătate: cele 3 variante (și ordinea corectă) | 1:05 | 0:37 | 0:37 |
| `cazier-fiscal` | Cazierul fiscal NU arată datoriile. Ce arată și cât e valabil | 0:57 | 0:41 | 0:41 |
| `trailer` | eGhiseul: acte, cazier, certificate, explicate simplu | 0:37 | 0:25 | 0:25 |

Elementele de final în YouTube Studio: pe ultimele 12 s pui „Abonare” peste butonul roșu și „Cel mai recent videoclip” / „Cel mai potrivit” în cele două chenare punctate.

## 3. Facebook și Instagram

- Pagina de Facebook a eGhiseul se leagă de contul de Instagram din **Meta Business Suite**; acolo programezi postarea o singură dată și bifezi ambele (Facebook + Instagram), deci apare automat și pe Instagram.
- Formatul pentru feed e `<id>-feed.mp4` (4:5), pentru Reels `<id>-tall.mp4` (9:16).
- Linkul din descriere are `utm_source=facebook&utm_medium=social`; pe Instagram linkul nu e clicabil în descriere, deci pui linkul în bio și scrii „link în bio”.

## 4. Ritm și subiecte următoare

1–2 clipuri pe săptămână (lungul + Shorts + feed, aceeași zi). Următoarele subiecte, din ce caută oamenii și ce ne citează deja AI-ul:
- extrasul de carte funciară (ce arată, cum îl citești);
- certificatul constatator pentru bancă;
- extrasul multilingv (Convenția CIEC nr. 16, 23 de state);
- certificatul de celibat pentru căsătoria în străinătate.

Faptele se iau numai de pe paginile noastre verificate. Un clip nou se adaugă în `src/v2/data.ts`, apoi:

```bash
cd /Users/raul/Projects/eghiseul-videos
npx tsx scripts/tts.ts            # vocea, pe scene
npx tsx scripts/export-meta-v2.ts # subtitrări, descrieri, metadata
./scripts/render-v2.sh            # randează toate formatele
```

## 5. Cum măsurăm

- **YouTube Studio**, lunar: vizualizări, retenție în primele 5 s (arată dacă cârligul merge), clicuri pe link, căutările care aduc clipurile.
- **Comenzi**: linkurile au `utm_source=youtube&utm_medium=video&utm_campaign=<id>` (Shorts: `<id>-short`) și `utm_source=facebook&utm_medium=social` pe Facebook/Instagram; apar în `orders.attribution` și în „Comenzi pe canal” din `/admin/marketing`. `utm_source=youtube` e clasificat ca „social · youtube” (corectat pe 06.10).
- **Citări AI**: raportul „AI Performance” din Bing Webmaster; ținta e ca site-ul și canalul să apară la „cât e valabil cazierul judiciar” etc.
- Prag de decizie: după 8 clipuri (≈1 lună), dacă nu vedem vizualizări din căutare sau trafic spre site, schimbăm subiectele, nu ritmul.
