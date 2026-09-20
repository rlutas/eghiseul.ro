# Design documentero.ro

Machetele stau în canvasul Claude Design:
<https://claude.ai/artifact/9uEDKnW37Xe97Ss5PwwWDi> (privat; se dă acces din
meniul Share). Sursa artboard-urilor e un generator Python păstrat local în
scratchpad-ul sesiunii (`documentero-design/build-site.py`); dacă îl pierdem,
canvasul rămâne sursa de adevăr.

## Cum am ajuns aici

Prima machetă (Fraunces + verde teal, carduri albe, butoane pilulă) a fost
respinsă de Raul ca „prea similară cu alte site-uri”. Ghidul de craft al
canvasului listează Fraunces printre tiparele de design generat de AI, deci
senzația era corectă. Au urmat trei direcții: A „Dosarul” (serif, hârtie,
ștampilă roșie), B „Tipografic” (Archivo lat, alb-negru, albastru), C
„Consulat” (Bricolage Grotesque, hero întunecat pe fond deschis). Raul a ales
C, dar nu paleta ei (petrol, nisip, cupru). Din trei palete noi a ales C1.

## Paleta C1

| Rol | Hex | Unde |
|---|---|---|
| Pădure (cerneală) | `#0F2A22` | text, butoane secundare, benzi întunecate, semnul din logo |
| Mentă (accent) | `#2FBF8F` | butonul principal, colțul din logo, „.ro”, bife, eyebrow-uri |
| Fildeș (fond) | `#FBF9F4` | fondul paginii |
| Card | `#FFFFFF` | carduri, formulare |
| Linie | `#DCE3DE` | borduri, separatoare |
| Text secundar | `#4F5E58` | paragrafe explicative |
| Mentă deschisă | `#DDF4EA` | badge-uri, fundal la starea selectată |

Un singur accent. Nu se folosesc auriul și navy-ul de la eghiseul, ca cele două
branduri să nu se confunde nici în admin, nici în inbox.

## Tipografie

Bricolage Grotesque (Google Fonts), o singură familie: titluri 700–800 cu
`letter-spacing` negativ (-0.035em), text 400–500, etichete 700 cu majuscule
și `letter-spacing` 0.08em. Corp 15–19 px, titluri de pagină 56–68 px pe
desktop, 26–38 px pe mobil. În cod: `next/font/google`, subseturi `latin` și
`latin-ext` (diacriticele românești).

## Logo

Conceptul ales: litera „d” a cărei tulpină se îndoaie ca un colț de pagină.
Semnul e desenat în SVG pe un `viewBox` de 64:

```svg
<path d="M36 8h5l13 13v35h-18z" fill="#0F2A22"/>
<path d="M41 8v13h13z" fill="#2FBF8F"/>
<circle cx="28" cy="39" r="10" fill="none" stroke="#0F2A22" stroke-width="12"/>
<rect x="36" y="22" width="8" height="34" fill="#0F2A22"/>
```

Reguli: fără badge în lockup (badge doar la iconița de aplicație, pătrat
rotunjit `#0F2A22`), wordmark lipit de semn (spațiu = un sfert din înălțimea
semnului), „.ro” în mentă, fără rotire, umbre sau alte culori. Pe fond închis:
semnul în fildeș, colțul rămâne mentă. Verificat la 16 px.

De produs din canvas când se implementează: `logo.svg`, `logo-white.svg`,
`icon.svg`, `favicon.ico`, `apple-icon.png` (180), OG implicit 1200×630, logo
pentru email `public/images/brand/documentero-email-logo.png` (165×40 în header).

## Structura paginilor

Toate paginile publice au același header (semn + wordmark; „Servicii” cu
mega-meniu — toate cele cinci acte, cu iconiță, o linie de context, link la
pagină și „Comandă” către formular — apoi Ghiduri · Despre · Contact;
„Urmărește comanda” — NU „Contul meu”, documentero vinde fără cont; „Comandă
online”; meniu `<details>` sub 1024 px; a doua variantă, 19.09: cele cinci
linkuri directe făceau bara înghesuită) și același
footer (descriere, certificate, ghiduri, companie, iar jos: firma + Telefonul
Consumatorului la stânga, badge-urile ANPC SAL/SOL la dreapta, neafiliere).
Recenziile de pe acasă sunt cele reale din profilul Google al eGhișeul.ro,
filtrate pe stare civilă, cu pozele de profil ale clienților
(`src/lib/documentero/reviews.ts`).

- Acasă: hero cu poză + card de status, selector „Ce act ai nevoie?” (cinci
  carduri), bandă de încredere, trei pași cu poze, bandă întunecată cu prețul și
  ce e inclus, recenzii, situații frecvente cu certificat desenat, alte acte, FAQ.
- Pagină de serviciu: breadcrumb, hero cu preț și opțiuni în card lipicios,
  „cine îl cere”, bloc lung de conținut cu „acte necesare”, tabelul „la ghișeu
  sau prin noi”, secțiunea pentru diaspora, ghiduri pe subiect, FAQ, „ai nevoie
  și de”.
- Ghiduri: index cu filtre pe categorii; articol cu cuprins lipicios, autor
  real, poză, CTA în margine, „citește și”.
- Despre: poză reală a echipei, cardul avocatei (poză reală, text scris de ea),
  cum lucrăm, firma și biroul.
- Contact: WhatsApp întâi, formular scurt, birou și firmă.
- Formular: vezi [`formular.md`](formular.md).

## Poze

Trei fotografii generate cu Higgsfield (Nano Banana 2 Lite, 1 credit fiecare),
păstrate ca assets în canvas: clientă acasă cu certificatul primit (hero),
avocată la ghișeul de stare civilă (pasul 2 și pagina de celibat), curier la ușa
unui bloc (pasul 3 și pagina de căsătorie). Sunt ilustrative, nu pretind că
arată echipa. Pentru producție: refacere fără mărci de curier vizibile (pe plic
apare „Cargus”), export WebP la 1600 px lățime, `alt` descriptiv.

Sloturile marcate „FOTO REALĂ” (echipa, avocata, autorul) se umplu doar cu
fotografii reale. Recenziile se preiau din profilul Google, cu inițiale, fără
chipuri — decizie înlocuită pe 19.09: Raul a cerut pozele de profil reale de pe
Google, deci recenziile au poza clientului, nu inițiale.

Ilustrațiile desenate în CSS (telefonul cu semnătura la pasul 1, certificatul pe
masă) se refac ca SVG-uri statice în implementare.

## Mișcare (19.09)

„Premium light”: fiecare `<Section>` intră cu fade + 18 px în sus la primul
scroll în viewport (`data-reveal`, un singur `IntersectionObserver`,
`src/components/documentero/reveal.tsx`); hero-ul intră în trepte de 80 ms
(`.d-rise`); cardurile se ridică 4 px la hover, butoanele 2 px; mega-meniul
alunecă 4 px. Ascunderea de dinaintea reveal-ului stă DOAR sub
`@media (scripting: enabled)`, deci crawlerele fără JS văd tot;
`prefers-reduced-motion` păstrează doar fade-ul. Observatorul se re-atașează la
fiecare schimbare de rută (`usePathname`) și prin `MutationObserver`, altfel la
navigarea client-side secțiunile rămâneau invizibile (bug 20.09). Ritm vertical: 96/128 px între
secțiuni, 80/112 între sub-secțiuni, 40 pentru o bandă lipită de blocul de sus.
