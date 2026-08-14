# 2026-08-14 — Preț urbanism aliniat + analiză SEO/comenzi pe zona cadastrală

## Preț: Certificat de Urbanism pentru Informare 780 → 943,50 lei

Decizia lui Raul după auditul de prețuri: era singurul serviciu imobiliar sub
prețul concurentului (cfunciara afișează 780 + TVA = 943,80 cu TVA, noi vindeam
la 780 cu TVA inclus, adică sub prețul lor de listă pentru aceeași lucrare de
primărie, 30 de zile lucrătoare). Rotunjit la 943,50.

Identificările (198 vs 302,50 la ei) **rămân neschimbate**, ca preț de intrare.

Migrarea `144_certificat_urbanism_aliniere_pret.sql`, aplicată. Pagina de
serviciu citește prețul din DB, deci se actualizează singură.

## Analiză SEO + comenzi pe cele 18 pagini cadastrale

Raport complet: [`seo/2026-08-14-analiza-imobiliare-seo-comenzi.md`](../seo/2026-08-14-analiza-imobiliare-seo-comenzi.md).

Pe scurt:

- **Indexare curată** — 18/18 pagini în sitemap și indexate (verificat cu URL
  Inspection, inclusiv cele fără niciun clic). Nu avem problemă tehnică aici.
- **Traficul e concentrat pe extras CF** (920 clicuri/90 zile) și pe articolele
  informaționale despre numărul cadastral. Extras CF stă pe **poziția 8–10** pe
  interogări cu mii de afișări — singura pârghie reală de creștere din zonă.
- **Serviciile prin topograf n-au cerere în căutare**: 3 interogări raportate de
  GSC în 90 de zile pe toate cele 12 pagini. Pozițiile sunt bune (5–9), volumul
  e zero. Nu e o problemă de SEO — vânzarea lor trebuie să vină din pachete,
  legături interne și cross-sell, nu din conținut nou.
- **Conversia e bună acolo unde există trafic**: extras CF 10% din clicuri devin
  plăți, identificare imobil 14%.

## 🔴 Constatare colaterală, mai urgentă decât SEO-ul

**87 de comenzi plătite de Extras Carte Funciară (8.034 lei) stau nelivrate**,
cu joburile ANCPI în `FAILED`, cea mai veche plătită de 31 de zile. Pe 12.08
erau 71 — deci +16 în două zile. Niciun client n-a cerut refund încă.

Vânzarea continuă (cu avertisment vizibil înainte de plată), dar riscul se
acumulează. De decis: continuăm, oprim temporar comanda pe extras CF, sau
livrăm manual cele mai vechi.
