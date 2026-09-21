# 21.09.2026 — documentero.ro: două ghiduri noi (acte necesare, procură din străinătate) și testul Rich Results
<!-- categorie: seo -->

## Pentru echipă

Pe documentero.ro au apărut două ghiduri pe care le puteți trimite clienților
în loc să explicați la telefon:

- „Acte necesare pentru duplicatul certificatului de naștere”: lista scurtă
  (doar buletinul valabil + datele nașterii), ce NU se cere (certificatul
  vechi, declarație la poliție), ce întoarce cererea (buletin expirat,
  transcriere confundată cu duplicat) și instituțiile din cele 6 sectoare din
  București, cu site-urile lor.
- „Procură din străinătate: notar, consulat sau avocat”: pentru clienții din
  diaspora care întreabă „pe cine împuternicesc?”. Tabel comparativ cu cost,
  timp și ce poate merge prost pe fiecare cale; a noastră (împuternicirea
  avocațială) e a treia.

Trimiteți linkul, nu copiați textul în WhatsApp: se actualizează pe site.

---

## Ce s-a livrat

- `src/app/documentero/ghiduri/acte-necesare-duplicat-certificat-de-nastere/page.tsx`
  (8 secțiuni, tabel `InfoTable` cu sectoarele: dpepscs1.ro,
  dpepsc.primariasector2.ro, primarie3.ro, deps4.ro, sector5.ro,
  evidentapersoanelor6.ro; DGEPMB coordonează, nu eliberează).
- `src/app/documentero/ghiduri/procura-din-strainatate-notar-consulat-avocat/page.tsx`
  (7 secțiuni, tabel comparativ notar/consulat/avocat, prețuri din DB).
- `GUIDES`: acte-necesare → `published: true`; procură → intrare nouă.
  Sitemap: 2 URL-uri noi (16 în total).
- Cardurile „Ghiduri pe subiect”: naștere → acte necesare (înlocuiește
  placeholder-ul „model vechi”), celibat/căsătorie/extras → procură. Cardul de
  situație „Locuiesc în străinătate” de pe naștere trimite la ghidul de procură.
- Rich Results Test (21.09, după flip): `/certificat-de-nastere/` 3 elemente
  valide (Product snippets, Breadcrumbs, Organization; avertismente
  non-critice = fără `aggregateRating`/`review`, intenționat); `/` 1 element
  (Organization). `FAQPage` nu mai produce rich result decât pentru site-uri
  guvernamentale/medicale (Google, august 2023), dar rămâne util pentru
  înțelegerea paginii.
- Cadența: 2 ghiduri în săptămâna 21.09; următoarele două în săptămâna
  28.09 (model vechi, valabilitate celibat).
