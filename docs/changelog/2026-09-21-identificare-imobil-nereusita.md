# 21.09.2026 — Identificare imobil: procedura când topograful nu găsește imobilul
<!-- categorie: comenzi -->

## Pentru echipă

Când Mircea nu găsește imobilul în e-Terra, comanda nu mai stă în „În
așteptare client” cu o notă. Depunem la OCPI cererea oficială (cod 2.7.8,
100 lei, ~10 zile lucrătoare) și clientul primește orice ar ieși un document:
certificatul cu CF + extrasul, sau certificatul negativ + raportul nostru +
un credit pentru un extras CF după ce își înscrie imobilul. Prețul serviciului
devine 298 lei. Pașii, emailul de copiat și ce faceți cu cele 12 comenzi
blocate: ghidul „Identificare imobil: când topograful NU găsește imobilul” din
Ghiduri.

---

## Tehnic

- Ghid echipă: `docs/admin/identificare-imobil-nereusita.md` (+ `CURATED_GUIDES`).
- Design: `docs/plans/2026-09-21-identificare-imobil-nereusita-design.md`:
  inventarul a ce există (identificare / depunere / upload / deliver), serviciul
  ANCPI 2.7.8 vs 2.7.6 (tarife + termene, surse), fluxul nou, statusul
  `identification_pending_ocpi` și toate listele albe de atins, creditul ca
  cupon 100% pe extras CF, etapele 0–4, întrebările deschise.
- Model de raport pentru client (PDF, de confirmat cu Mircea):
  `~/Downloads/raport-identificare-imobil-MODEL.pdf`, generat din HTML cu
  Playwright; nu e încă în repo.
- Nimic schimbat în cod în afară de intrarea din Knowledge Center.
