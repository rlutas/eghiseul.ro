# Audit SEO pe cele 4 site-uri și ce s-a făcut — 02.11.2026

Context: octombrie a închis cu 33% sub septembrie (40,3k față de 59,9k lei pe toate
site-urile). CJO a pierdut cel mai mult pe organic: de la 3.823 de clicuri pe
săptămână (21.09) la 809 (26.10). Analiza s-a făcut cu datele din Search Console
(API, toate cele 4 proprietăți), cu pagina de rezultate Google verificată în
incognito și cu paginile concurenților care stau bine (caziere.ro,
cazierul-judiciar-online.ro, infocazier.ro).

## Ce găsești aici

| Fișier | Ce e |
|---|---|
| [00-sinteza.md](00-sinteza.md) | Planul unic pe cele 4 site-uri (15 puncte) și ce NU facem |
| [01-cjo.md](01-cjo.md) | Audit cazierjudiciaronline.com, scor 72 |
| [02-eghiseul.md](02-eghiseul.md) | Audit eghiseul.ro, scor 72 |
| [03-ecazier.md](03-ecazier.md) | Audit ecazier.ro, scor 71 |
| [04-documentero.md](04-documentero.md) | Audit documentero.ro, scor 82 |
| [05-competitie-caziere.md](05-competitie-caziere.md) | Ce fac concurenții care stau bine pe organic |

## Concluziile principale

1. **Scăderea CJO are două faze.** Până pe 12.10 pozițiile au rămas, dar s-au
   pierdut clicurile: Google afișează sus hub.mai.gov.ro, pagina IPJ și un
   rezumat AI (AI Overview). De pe 16–19.10 a coborât și poziția (5,0 → 6,4),
   pe eghiseul și pe CJO deodată. Pe CJO nu s-a publicat nimic între 15.10 și
   01.11, deci cauza e la Google, nu la noi.
2. **Pe eghiseul, paginile de serviciu nu își revin după august.** Pe căutările
   comerciale Google arată pagina principală în locul paginii de serviciu
   (canibalizare). Pagina principală trebuie să devină pagina mărcii.
3. **Fapte care se contrazic** între pagini, `llms.txt` și datele structurate:
   termene („24-48 ore”, „instant”), prețuri vechi, „documente oficiale”.
   Exact acestea sunt citite de rezumatele AI.
4. **Pe ecazier rămân recenzii inventate și mesajul „ONLINE10 automat”.**
5. **Concurentul de urmat pe orașe e cazierul-judiciar-online.ro.** Răspunde
   direct la căutare: ghișeele, adresa, programul. caziere.ro stă sus pe brand
   și vechime, nu pe conținut.

## Ce s-a făcut pe 02.11.2026

| Ce | Site | Stare |
|---|---|---|
| Recenziile inventate și schema `Review` scoase; în loc, recenzii reale de pe profilul Google eGhișeul.ro, cu sursa în pagină | CJO | ✅ live |
| Prețuri și termene identice cu eghiseul (198 / 278 / 298 lei), fără ONLINE10 automat; cuponul merge doar dacă e introdus | CJO | ✅ live |
| Iași, Brașov, Timișoara refăcute: „Pe scurt” cu ghișeele și programul (verificate pe site-urile Poliției), buton de comandă în primul ecran, 8 întrebări locale, linkuri spre județele vecine | CJO | ✅ live, de urmărit 2 săptămâni |
| Țara pe factură: clienții din străinătate nu mai primesc județ românesc | CJO + eghiseul | ✅ live |
| Raportarea anunțurilor concurenților, a doua rundă (6 anunțuri) | Google Ads | ✅ vezi `docs/ads/registru-demersuri.md` (G4b) |

## Ce s-a mai făcut după-amiază (02.11)

| Ce | Site | Stare |
|---|---|---|
| Fapte corectate cu surse oficiale (taxe, anexe, primărie, consulat, Hub MAI, SPV, străini, împuternicire) | toate 4 | ✅ live |
| Homepage = hub cazier (39 orașe pe regiuni, 23 ghiduri), vecini pe paginile de oraș, „document oficial” 74 → 0 | CJO | ✅ live |
| Primul ghid util: cât durează duplicatul certificatului de naștere | documentero | ✅ live |
| Monitorizare SEO lunară (GSC, 4 site-uri) + checklist concurență | toate | ✅ [monitorizare](../monitorizare/README.md) |
| Curățenie șabloane imobiliare + certificat constatator | eghiseul | 🔄 în lucru |
| Decizie: fără pagini noi pe eghiseul până la revenire | eghiseul | ✅ |

## Ce urmează (din planul din 00-sinteza.md)

- **Azi / săptămâna asta:**
  - ecazier: recenzii inventate, ONLINE10 automat, termen unic, „documente oficiale”;
  - CJO: `llms.txt` corectat;
  - cererea de reindexare în Search Console pe cele 5 pagini cu recenzii vechi și pe cele 3 orașe;
  - eghiseul: termenele de pe pagina principală;
  - CJO: titlul paginii principale.
- **Apoi, 1–2 pagini pe săptămână:**
  - orașele CJO în ordinea pierderilor: Constanța, Târgu Mureș, Sibiu, Ploiești, Satu Mare;
  - pagina principală eghiseul ca pagină de marcă.
- **Măsurare săptămânală prin API-ul Search Console:** clicuri și poziții pe orașele refăcute față de cele nerefăcute, formularele începute pe Iași, Brașov și Timișoara.

## Acces la date

Search Console se citește prin API, cu contul de serviciu `claude-seo@caziere`.
Are acces la eghiseul (`https://eghiseul.ro/`), CJO, ecazier și documentero.
Datele CJO și ecazier încep abia pe 20.09.2026, iar backlinkurile nu au fost
măsurate.
