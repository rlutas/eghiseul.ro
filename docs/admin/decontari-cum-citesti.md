# Decontări Stripe: cum citești liniile (anulări, plăți extra, dispute)

Pagina **Admin → Decontări** arată fiecare decontare Stripe (banii virați în bancă), linie cu linie: încasări, rambursări și alte mișcări. Pe fiecare linie apar comanda, clientul, serviciul și factura din Oblio. Ghidul ăsta explică liniile care **nu** sunt o simplă „încasare = factură”, adică exact cele despre care a întrebat contabilul în octombrie 2026.

Regula de bază: **suma din coloana Brut nu e mereu suma facturii.** Când diferă, sub numele serviciului apare o notă galbenă care spune de ce. Aceeași notă apare și în exportul CSV.

## 1. Încasare normală

Comanda plătită și factura ei. Suma facturii este egală cu suma încasată. Nu e nimic de explicat.

## 2. Plată extra (link de plată din „Modifică”)

- Apare pe o linie separată, cu **factura ei proprie**, nu cu factura comenzii.
- Dacă factura n-a putut fi emisă, linia arată „plată extra, factură neemisă”. Pe pagina comenzii și pe dashboard apare un avertisment roșu, iar sistemul reîncearcă din oră în oră. Procedura: [Plată extra încasată fără factură](factura-plata-extra-neemisa.md).
- Se aplică la fel pe eGhiseul și pe CazierJudiciarOnline.

## 3. Anulare cu rambursare 70%: există două variante

**a) Comanda avea deja factură.** Factura inițială se anulează integral prin storno, iar pentru partea păstrată (30%) se emite o factură nouă. Pe linia de rambursare scrie, de exemplu:

> rambursat 138,60 lei = storno EGH-0683 (−198,00 lei, factura inițială anulată integral) + factura EGH-0684 (59,40 lei păstrați)

Storno-ul (−198) este mai mare decât rambursarea (−138,60). E corect, pentru că diferența e acoperită de factura nouă de 59,40 lei.

**b) Comanda a fost anulată înainte să i se emită factura.** Nu există factură inițială, deci nici storno. Singurul document este factura taxei de anulare (30%).
- Pe **încasare** scrie: „EGH-0692 = 59,40 lei (taxa de anulare 30%), NU 198,00 lei: din 198,00 lei încasați s-au rambursat 138,60 lei; fără factură inițială”.
- Pe **rambursare** scrie „fără document (vezi nota)”. Linia **nu** are factură, pentru că EGH-0692 e o factură pozitivă, nu una cu minus.

## 4. Dispută bancară (chargeback)

Clientul contestă plata la banca lui. Stripe retrage suma și reține **100 lei comision**.

- Linia are eticheta galbenă **„Dispută bancară”** și arată clientul, factura inițială, suma retrasă, comisionul și **starea disputei**. Starea se actualizează la fiecare sincronizare:
  - **deschisă, fără răspuns de la noi:** trebuie răspuns până la termenul afișat;
  - **contestată de noi, așteptăm decizia băncii:** banca decide în până la 3 luni;
  - **câștigată, banii revin:** apare și o linie „bani returnați nouă”;
  - **pierdută, se emite storno pe factura inițială.**
- **Ce face contabilitatea:**
  - storno se emite **doar pentru suma plătită de client** și **doar după ce disputa e pierdută**;
  - **comisionul Stripe de 100 lei e cheltuială** și nu se trece pe factura clientului.
- Comisioanele de dispută apar pe linii separate: „Comision Stripe pentru dispută (cheltuială, nu se trece pe factura clientului)”.

## 5. Când sunt actualizate liniile

- Sincronizarea rulează zilnic și reface decontările din ultimele 30 de zile.
- Disputele se actualizează la **fiecare** sincronizare, oricât de veche ar fi decontarea.
- Ca să refaceți decontări mai vechi după o corectură, folosiți butonul „Sincronizează” cu perioadă mare sau cereți-i lui Raul.

## Ce a fost verificat

Pe 16.10.2026 am comparat toate liniile din decontările din mai până în octombrie (1.174) cu facturile din Oblio, ca sumă și ca semn. Toate facturile există. Afișarea a fost corectată în 12 locuri. Au rămas 8 linii unde suma facturii diferă intenționat de suma din Stripe (variantele 3a și 3b); toate au nota explicativă.
