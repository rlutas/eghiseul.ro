# Clipuri educative eGhiseul: cum le facem

Stare la 06.10.2026: stilul și vocea sunt aprobate de Raul pe clipul de test „Cât e valabil cazierul judiciar” (randarea finală din 06.10, 1:52 pe YouTube, 0:56 pe Shorts). Proiectul e local, în `/Users/raul/Projects/eghiseul-videos` (Remotion). **Clipurile nu se urcă pe GitHub**; merg doar pe YouTube și pe rețelele sociale.

Pașii tehnici (script, voce, randare, comprimare) sunt în `README.md` din proiectul de clipuri.

## Vocea standard

- ElevenLabs, vocea „Roxana – Warm & Confident” (`wEJjJg8SheKHTwm83mZY`), româncă nativă.
- Model `eleven_multilingual_v2`; reglaje: stability 0,32 · similarity 0,75 · style 0,45 · speaker boost pornit · viteză 0,97.
- Sursa unică: `voice.config.json` din proiect. Cheia API stă în `.env` (exclus din git, nu se lipește în chat).
- Frazele se generează pe scene, legate între ele (`previous_text` / `next_text`), ca să curgă ca o singură narațiune și ca întrebările să sune a întrebare.
- Fiecare frază se taie exact după ultimul cuvânt, cu o estompare scurtă (fără „aaa” sau respirație la final). Tăietura o găsește transcrierea automată ElevenLabs (momentul fiecărui cuvânt) plus nivelul sunetului; aceleași momente sincronizează textul de pe ecran și subtitrările scurte.
- Dacă transcrierea găsește un „ă” sau „mm” în mijlocul frazei, fraza se regenerează cu altă variantă (`seed`) și se verifică din nou.
- Cost: ~1.300 de caractere pe minut de clip. Audio-ul se păstrează frază cu frază: dacă schimbi o frază, se regenerează doar ea (clipul de test: 1.465 de caractere pentru cele 7 fraze noi).

## Structura unui clip

1. Hook în primele 2 secunde: întrebarea pe care o pune omul („Ți-a cerut angajatorul cazier și nu știi dacă cel vechi mai e bun?”).
2. Răspunsul, imediat.
3. Detaliile, câte o idee pe cadru, cadre de 2–6 secunde.
4. „La ghișeu vs. online prin noi”, corect în ambele sensuri: la ghișeu e gratuit, dar cu drum, coadă, program limitat, uneori trebuie să revii; prin noi: online, fără drum, avocatul depune și ridică, scan pe email, originalul prin curier oriunde, apostilă/traducere în aceeași comandă.
5. Card de preț și termen: „de la X lei” cu termenul standard · varianta urgentă pe rândul ei, cu prețul ei · rating Google din `SOCIAL_PROOF`.
6. Opțiunile din aceeași comandă, când contează (la cazier: apostilă, traducere autorizată, legalizare, livrare oriunde în lume).
7. Final: „Îl comanzi online pe eghiseul.ro”, „Abonează-te”, mențiunea de serviciu privat. Pe Shorts: hook → răspuns → ghișeu vs. online → preț → final.

## Text pe ecran și animație

- Textul de pe ecran **completează** vocea, nu o repetă cuvânt cu cuvânt: cuvinte-cheie de 3–6 cuvinte, cifre mari, iconițe, comparații, liste.
- Ce apare e sincronizat cu ce spune vocea în acel moment.
- Ce apare e sincronizat cu ce spune vocea în acel moment: fiecare element dintr-o listă sau comparație apare chiar înainte să fie rostit și se aprinde auriu cât se vorbește despre el.
- Fiecare cadru se mișcă ușor până la tăietură (zoom lent, iconițe care plutesc, bara de progres); cadrele trec unul în altul prin suprapunere, fără tăietură seacă; cadrul următor intră cu ~0,27 s înainte de fraza lui; pauze între fraze ≤ 0,25 s.
- Subtitrări: pe YouTube orizontal nu se ard în imagine (se urcă `.srt` separat); pe Shorts, Reels și Facebook/Instagram, subtitrări scurte de 2–4 cuvinte, sincronizate pe cuvânt, cu cuvântul rostit în auriu.

## Sunet

- Muzică de fundal generată de noi (fără drepturi de autor), care scade lin sub voce și urcă în pauze (rampe de ~0,5 s).
- Efecte de tranziție discrete și scurte.
- Volum final −14 LUFS, vârf ≤ −1 dB.

## Formate și durate

| Platformă | Format | Durată |
|---|---|---|
| YouTube | 16:9, 1080p | 60–120 s |
| YouTube Shorts, Reels, TikTok | 9:16 | ≤ 59 s |
| Facebook / Instagram feed | 4:5 | ≤ 60 s |

Pentru urcarea din browser (limită 10 MB pe fișier), fișierele se comprimă la ≤ 9,5 MB cu x264 în două treceri.

## Reguli de conformitate (obligatorii)

- Doar fapte și prețuri verificate pe pagina live sau în baza de date. „De la X lei”. Termenul urgent nu se pune lângă prețul standard (cazier judiciar: 198 lei în 3–5 zile; urgent 278 lei în 1–2 zile).
- Spunem că la ghișeu documentul e gratuit.
- Noi **obținem**, instituția **eliberează**. Fără „oficial” lângă „documente/acte”.
- Fără cifre de clienți sau documente pe care nu le putem dovedi; ratingul vine din `SOCIAL_PROOF`.
- În străinătate cazierul îl cer ambasadele și consulatele, dar și instituțiile de acolo (rezidență, cetățenie, permis de muncă, angajatori, școli); de regulă cu apostilă de la Haga și traducere autorizată. Instituția care cere decide formatul și vechimea acceptate.
- Integritatea comportamentală: pentru posturile cu copii sau persoane vulnerabile (Legea 118/2019).

## Publicare

- YouTube (canalul eGhiseul, @eghiseul, personalizat pe 06.10): titlu ≤ 70 de caractere, descriere cu capitole, surse și link cu `utm_source=youtube&utm_medium=video&utm_campaign=<slug>`, taguri, miniatură, `.srt`, elemente de final pe ultimele ~11 s (cardul de final). Clipul se urcă întâi ca privat, Raul îl aprobă, apoi devine public.
- Facebook + Instagram: din Meta Business Suite, pagina EGhiseul cu postare pe Instagram în același timp; format 4:5 sau 9:16; link în comentariu/bio, cu UTM. Necesită login Facebook în browser.
- Comenzile din clipuri se văd în admin la canalul „social · youtube”.

## Ritm și subiecte

1–2 clipuri lungi + 3 Shorts pe săptămână. Subiecte, după cerere (citări AI, căutări, comenzi):

1. Cât e valabil cazierul judiciar (gata, în test)
2. Cazierul judiciar din străinătate: consulat, procură sau online prin avocat
3. Cazierul pentru cetățenie, rezidență sau muncă în străinătate (apostilă + traducere)
4. Cazierul fiscal: sancțiuni, nu datorii; valabil 30 de zile
5. Certificatul de integritate comportamentală: cine îl cere
6. Certificatul de căsătorie: duplicat și din străinătate
7. Extrasul multilingv: în ce 23 de state merge fără traducere
8. Certificatul de celibat pentru căsătoria în străinătate
9. Extrasul de carte funciară: cum îl citești
10. Certificatul constatator pentru bancă
11. Certificatul de naștere pierdut
12. Apostila de la Haga: unde și pentru ce acte

## Ce rămâne de făcut (06.10, seara)

- Refacerea celorlalte 2 clipuri și a trailerului cu vocea standard, apoi urcarea pe YouTube (o ciornă privată veche e deja în Studio și trebuie înlocuită).
- Facebook/Instagram după login în Meta Business Suite.
