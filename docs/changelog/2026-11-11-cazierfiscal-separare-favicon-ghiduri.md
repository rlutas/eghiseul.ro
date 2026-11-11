# 11.11.2026 — cazierfiscal.com: fără date de firmă și telefon în pagini, favicon reparat, ghiduri verificate, GA4 propriu
<!-- categorie: seo -->

## Pentru echipă

- Pe cazierfiscal.com nu mai apar telefonul, WhatsApp-ul și datele firmei în footer. Clienții de acolo scriu doar prin formularul de contact; mesajele ajung în aceeași căsuță ca până acum.
- Datele firmei (nume, CUI, Reg. Com.) rămân doar în Termeni și condiții, Confidențialitate și Contact, cum cere legea. Pagina Despre și pagina principală nu le mai afișează.
- Iconița site-ului apare corect și pe pagina de comandă și pe telefon.
- Cele două ghiduri (SPV, străinătate) au o casetă „Pe scurt” sus și au fost recitite pe lege; câteva formulări greșite au fost corectate.
- Pe pagina principală e acum o poză cu specimenul certificatului de cazier fiscal și explicația fiecărei părți; aceeași poză apare și lângă formularul de comandă.
- Comenzile de pe cazierfiscal.com se măsoară acum într-un Google Analytics separat.
- Rețeta după care am făcut site-ul, ca s-o repetăm pentru alte servicii: playbook-ul din documentația SEO.

---

**Rezumat tehnic**

- Footer `src/components/cazierfiscal/footer.tsx`: scoase firma/CUI/adresa și linia „Telefonul Consumatorului”; rămân ANPC SAL/SOL, disclosure-ul (fără numele firmei) și link „Datele firmei” → `/termeni-si-conditii/`.
- Telefon/WhatsApp scoase din contact, despre, T&C, confidențialitate, anulare și din `contactPoint.telephone` (schema). `ContactFormDocumentero`: `whatsappHref` opțional; fără el, textele nu mai pomenesc WhatsApp.
- Favicon: `src/app/cazierfiscal/icon.png` + `apple-icon.png` mutate în `public/images/cazierfiscal/`; rewrite pe host în `next.config.ts` pentru `/icon.png`, `/apple-icon.png`, `/apple-touch-icon.png`, `/apple-touch-icon-precomposed.png`. Înainte, wizardul partajat (`/comanda/cazier-fiscal/`) și cererile directe primeau iconița eghiseul.
- `CazierFiscalGuide`: caseta „Pe scurt” cu bife, cuprins cu ancore (`summary`, `toc`, `readMinutes`), „Citește și” din `CAZIERFISCAL_GUIDES`, `Article.citation` din surse.
- Fapte corectate pe OG 39/2015 (consolidat 08.11.2025), OPANAF 2594/2015 + 2048/2023, CPF art. 18: „de îndată” în loc de „pe loc”; avocat prin CPF art. 18 alin. 3; art. 8 alin. 4 doar pentru străini neînregistrați fiscal la ONRC; lista din art. 4 (răspundere solidară, inactivitate în cazierul reprezentanților).
- Pagina principală: 4 întrebări noi (durată, de unde se scoate, ghiseul.ro/Hub MAI, cazier financiar), H2-uri pe interogări reale, descriere cu „eliberare” și termen.
- GA4: cont nou „cazierfiscal”, `G-DGW62V4WXX` în `NEXT_PUBLIC_GA_MEASUREMENT_ID_CAZIERFISCAL` (Vercel, production).
- Docs: `docs/seo/playbook-site-de-nisa-un-serviciu.md` (nou), `docs/cazier-fiscal/README.md` (secțiunea 11.11 + harta cuvintelor cheie), date în `docs/cazier-fiscal/cuvinte-cheie-2026-11/`.
- Completare (11.11, a doua livrare): scos rândul cu firma/CUI/Reg. Com. de pe `/despre/` și numele firmei din intro și din meta description; FAQ-ul „Sunteți ANAF?” trimite la T&C pentru datele firmei; schema `Organization` fără `legalName` și `address`. `CAZIERFISCAL_ALL_GUIDES` + `published`: ghidurile pregătite dau 404 în producție până la publicare (se văd doar în `next dev`).
- Specimen (11.11, a treia livrare): `public/images/cazierfiscal/specimen-cazier-fiscal.webp` (specimenul eghiseul fără logo), secțiunea „Cum arată certificatul de cazier fiscal” pe `/`, `BRAND_SPECIMENS` în `src/config/service-specimens.ts` pentru sidebar-ul wizardului pe alte branduri.
