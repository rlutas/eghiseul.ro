📘 Ghid de Design – eGhiseul.ro (Document pentru Cursor)
🔹 1. Stil vizual general

Stil: minimalist, modern, legal-administrativ, cu accente premium aurii (#ECB95F).

Atmosferă: profesională, curată, prietenoasă, dar serioasă (nu corporatist rece).

Forme: colțuri rotunjite mari (12–20px), umbre moi (0 6px 20px rgba(6,16,31,0.08)).

Spațieri: aerisire mare între secțiuni (min. 40px).

Font: sistem sans-serif (Inter, Open Sans sau font implicit WordPress).

Greutăți: titluri 700–800, text 400–500.

Lățime container: max. 1100px, centrat.

Contrast: text principal #06101F, subtitluri #3a4555, fundaluri #fff / #F9FAFB.

🎨 2. Paletă de culori
Element	Cod Hex	Utilizare principală
Auriu principal	#ECB95F	butoane, accente, iconițe
Albastru închis (text)	#06101F	text principal, titluri
Gri mediu	#3a4555	text secundar
Fundal deschis	#F9FAFB	backgrounduri neutre
Gri foarte deschis (borduri)	#e8edf3	margini, delimitări
🔹 3. Componente standard
🟡 Carduri (folosite la “Documente necesare”, “Beneficii”, “Când ai nevoie”)

Fundal alb #fff, colțuri rotunjite 16px.

Linie de accent aurie sus (::before cu height: 3px; width: 36–40px; background: #ECB95F;).

Umbră: 0 4px 14px rgba(6,16,31,.06).

Hover: translateY(-3px) + border-color: rgba(236,185,95,.55).

Spațiere internă: 18–22px.

Text clar, max. 3 rânduri per paragraf.

🟢 Iconițe

Container rotund sau pătrat cu colțuri moi (12–14px radius).

Dimensiuni: 40–52px.

Fundal: rgba(236,185,95,0.15)

Culoare icon: #ECB95F.

SVG sau emoji permis, dar consecvent în secțiune.

🔹 4. Butoane
✅ Buton principal (“btn-primary”)
background: #ECB95F;
color: #06101F;
border-radius: 12px;
font-weight: 700;
box-shadow: 0 6px 14px rgba(236,185,95,.35);
transition: transform .1s ease, box-shadow .2s ease;


Hover: transform: translateY(-2px); box-shadow: 0 10px 20px rgba(236,185,95,.45);

⚪ Buton secundar (“btn-secondary”)
background: transparent;
border: 2px solid #ECB95F;
color: #ECB95F;
border-radius: 12px;


Hover: inversează culorile (fundal auriu, text închis).

🔹 5. Layout-uri de secțiune
🧱 “Când ai nevoie de cazier auto online”

Două coloane în Elementor:

Stânga: imagine ilustrativă (șoferi profesioniști, lumină naturală, urban).

Dreapta: listă verticală cu carduri numerotate (1–5).

Linie verticală subtilă gri deschis (#e8edf3) aliniată la numere.

Numere în cercuri aurii (32x32px, background: rgba(236,185,95,.15)).

🧾 “Documente necesare”

3 carduri într-un grid 3x1 (1x3 pe mobil).

Iconițe mari în partea de sus.

Text concis, maxim 2 rânduri de descriere.

💰 “Prețuri și termene”

Două carduri de preț alăturate (Standard / Urgent).

Card “Urgent” are bordură 2px solid #ECB95F și etichetă “Cel mai rapid”.

Fundal alb, text centrat, buton mare dedesubt.

💡 “Beneficii”

Grid 3x2 (sau 2x3 pe tabletă).

Fiecare card: icon + titlu + text.

Accent auriu sus.

❓ “Întrebări frecvente (FAQ)”

Stil simplu (flat), fără carduri.

Variante recomandate:

Static list: toate întrebările și răspunsurile vizibile.

Sau accordeon subțire: <details><summary> cu chevron CSS.

📞 “Call to Action Final”

Fundal degrade albastru închis (linear-gradient(180deg, #06101F, #0C1A2F)).

Titlu auriu mare, text alb.

Buton primar auriu + buton secundar conturat.

Badge de încredere cu text mic, gri deschis.

🔹 6. Spacing & responsive
Element	Desktop	Tablet	Mobil
Spațiu între secțiuni	60px	40px	30px
Lățime max. container	1100px	90%	95%
Font titlu H2	1.8rem	1.5rem	1.3rem
Font text paragraf	1rem	0.98rem	0.95rem
🔹 7. Stil general de imagine

Fotografie clară, naturală, lumină caldă (nu stock generic).

Subiecte: oameni profesioniști (șoferi, funcționari), fundal urban, birouri luminoase.

Evită: polițiști, amenzi, trafic congestionat, branding vizibil de companii auto.

🔹 8. Principii de construcție în Elementor

Folosește containere și coloane boxate (max 1100px).

Setează padding intern uniform (40px top/bottom).

Nu folosi gradienturi colorate multiple — doar albastru-auriu.

Pentru titluri H2, folosește mereu color: #06101F; font-weight:800;.

Folosește SVG inline pentru iconițe, nu imagini raster.

Păstrează colțuri rotunjite mari la toate cardurile (12–20px).

Respectă spațiere consistentă între elemente (minim 16px).

Evită umbre dure — doar umbre moi, difuze.

🔹 9. Ton general al interfeței

Mesaj clar, sigur, juridic, dar accesibil.

Evită fraze tehnice, folosește “tu”.

Accent pe rapiditate, siguranță și profesionalism.

Fiecare pagină se încheie cu CTA clar + buton principal.

💼 Scop final: fiecare pagină trebuie să pară o platformă oficială, sigură, digitalizată, cu accent premium (auriu), nu un site generic de servicii.
Elementor trebuie să respecte aceste reguli pentru toate serviciile eGhiseul.ro.