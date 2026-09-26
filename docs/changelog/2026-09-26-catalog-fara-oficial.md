# 26.09.2026 — Descrierile din catalog fără „oficial”
<!-- categorie: seo -->

## Pentru echipă

- Am scos cuvântul „oficial” din descrierile a cinci servicii din catalog: extras carte funciară, identificare imobil, certificat de integritate comportamentală, rovinietă și certificat de celibat.
- Regula rămâne aceeași: noi **obținem** documentele, instituția le **eliberează**. Nu scrieți „document oficial” sau „extras oficial” nici în mesajele către clienți.
- Rovinieta nu mai spune „redirect oficial CNAIR”. Clientul o cumpără cu cardul la noi pe pagină, iar rovinieta se înregistrează în sistemul CNAIR.
- Nu se schimbă nimic la comenzi sau prețuri. Sunt doar corecturi de text.

---

## Tehnic

Continuarea migrării 189 (cazier fiscal). Migrarea `190_catalog_fara_oficial.sql` actualizează `services.description` / `short_description`:

- `extras-carte-funciara`: `short_description` fără „Extras CF oficial”.
- `identificare-imobil`: „certificatul oficial” → „certificatul eliberat de OCPI”.
- `certificat-integritate`: fără „Document oficial”; textul aliniat la pagina serviciului (Legea 118/2019, infracțiuni asupra minorilor și persoanelor vulnerabile).
- `rovinieta`: fără „redirect oficial CNAIR” / „platforma oficială CNAIR” — afirmația era falsă, pagina vinde prin `RovinietaPurchaseForm`.
- `certificat-celibat`: fără „Document oficial”; eliberat de Serviciul de Stare Civilă al primăriei de domiciliu, ca pe pagină.

Verificare după aplicare: `select slug from services where description ilike '%oficial%' or short_description ilike '%oficial%'` trebuie să întoarcă 0 rânduri.
