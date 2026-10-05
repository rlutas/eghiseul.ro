# 05.10.2026 — documentero.ro: două ghiduri noi (certificatul de naștere vechi, valabilitatea certificatului de celibat)
<!-- categorie: seo -->

## Pentru echipă

- Pe documentero.ro sunt două ghiduri noi, în secțiunea Ghiduri: „Certificat de naștere vechi (model tipizat): mai e valabil în 2026?” și „Cât e valabil certificatul de celibat”.
- **Certificatul de naștere vechi rămâne valabil.** Legea din 2024 o spune expres. Clientul îl schimbă doar dacă e deteriorat, plastifiat sau are ștersături, dacă i l-a reținut o autoritate străină sau dacă instituția vrea un exemplar eliberat recent (Franța și Spania cer la căsătorie un certificat de naștere de cel mult 6 luni).
- **Certificatul de celibat nu are termen de valabilitate scris pe el.** Nu mai spuneți „e valabil 6 luni în România”. Termenul îl pune țara care îl primește, de obicei 3 sau 6 luni de la data eliberării (Germania: 6 luni). Clientul îl comandă după ce află data depunerii dosarului, nu cu luni înainte.
- În UE, de regulă, nu e nevoie de apostilă pe certificatul de celibat. Dacă un client a divorțat în străinătate și divorțul nu e înscris în România, certificatul îl arată tot căsătorit; asta se rezolvă întâi.
- Pagina certificatului de celibat și ghidul despre procura din străinătate au fost corectate în același sens.

---

## Tehnic

- Pagini noi: `src/app/documentero/ghiduri/certificat-de-nastere-vechi-tipizat/page.tsx` și `src/app/documentero/ghiduri/valabilitate-certificat-de-celibat/page.tsx`. Aceeași structură ca ghidul „pierdut” (autor `SITE_AUTHOR`, avocata în linia de dată, „Pe scurt”, cuprins, card de comandă), plus `FaqList` cu `FAQPage`, `RelatedServices`, secțiune „Surse” cu linkuri externe și blocul de neafiliere.
- `documenteroArticleGraph` primește opțional `faq` (emite `FAQPage` doar când întrebările sunt pe pagină).
- `GUIDES` în `src/lib/documentero/content.ts`: slugul `certificat-de-nastere-model-vechi` devine `certificat-de-nastere-vechi-tipizat`; ambele ghiduri `published: true` (apar automat în `/ghiduri/` și în `/llms.txt`).
- `src/config/documentero-sitemap.ts`: cele două ghiduri (lastModified 2026-10-05); `/ghiduri/`, `/certificat-de-nastere/`, `/certificat-de-celibat/` și ghidul de procură au lastModified 2026-10-05.
- Linkuri contextuale: `/certificat-de-nastere/` (cardul „Am modelul vechi, tipizat”) → ghidul 1; `/certificat-de-celibat/` (secțiunea de valabilitate + „Ghiduri pe subiect”) → ghidul 2; ghidul de procură → ghidul 2.
- Corecturi de fond pe `/certificat-de-celibat/` (hero, „Pe scurt”, FAQ, secțiunea de valabilitate) și în ghidul de procură: „valabil 6 luni în România” nu are sursă. Anexa 18 la H.G. 255/2024 (imaginea formularului de pe legislatie.just.ro) nu are rubrică de valabilitate, iar Normele nu dau vreun termen.
- Surse verificate: H.G. 255/2024 art. 2 alin. (2); Normele art. 12 lit. o, 66, 135, 158, 162, 163, 165, 166, 180, 181, anexele 1 și 18; juridice.ro (termenul SIIEASC 31.03.2025); §1309 BGB; service-public.gouv.fr F930; Xustiza.gal (Galicia); art. 116 c.c. italian; GOV.UK (notificarea căsătoriei); Reg. (UE) 2016/1191.
- Similaritate: Jaccard pe shingle-uri de 5 cuvinte, ghidul 1 față de articolul eghiseul `/schimbare-certificat-de-nastere-vechi/` = 0,0025; ghidul 2 față de același = 0; între ele 0,0085.
- Rămase, nereparate: tabelul pe țări de pe `/certificat-de-celibat/` spune „apostilă: da” pentru Italia, Spania, Germania, Franța, Olanda/Belgia, deși Reg. (UE) 2016/1191 scutește actele de stare civilă de apostilă între statele membre; termenii din coloana „Cât de nou” nu au sursă.
