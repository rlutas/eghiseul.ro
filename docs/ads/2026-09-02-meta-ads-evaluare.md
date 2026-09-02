# 02.09.2026 — Meta Ads (Facebook/Instagram): merită?

Întrebarea lui Raul după lansarea ChatGPT Ads: „pe Facebook nu ar merge reclama de genul ăsta?"
Verificat în Meta Ad Library (România, 02.09) + politica Meta.

## 1. Politica: NU e blocajul

Meta Advertising Standards nu au o categorie „documente guvernamentale / servicii oficiale" ca
Google (rezultatul „government documents" din căutare e pagina Google, nu Meta). Ce se aplică la
noi: „Misleading claims", „Unacceptable business practices" (impersonare de entități oficiale),
landing funcțional. Regulile noastre fixe (serviciu privat declarat, preț final, fără „oficial"
lângă „document") acoperă asta.

Dovadă din Ad Library: „Cazier Judiciar Online" (cazierul-judiciar-online.ro) a rulat 24.05 →
23.09.2025 un anunț la certificat de integritate, 149 RON, cu textul „emis oficial de Poliția
Română" — **nu a fost scos de politică**. S-a oprit singur după 4 luni.

## 2. Ce rulează concurența pe Meta (Ad Library RO, toate statusurile)

| Căutare | Rezultate | Ce e de fapt |
|---|---|---|
| „cazier judiciar" (activ) | ~41 | **toate** anunțuri de angajare („cazier judiciar curat" la cerințe). Zero servicii de cazier. |
| „cazier judiciar online" (exact) | 3 | Cazier Judiciar Online (4 luni în 2025, oprit); Civica Info (articol, 2 zile); primărie |
| „certificat constatator" (exact) | ~51 | contabili, înființări firme, funerare — nimeni nu vinde constatatorul |
| „extras de carte funciara" (exact) | 9 | **CFunciara.ro — ACTIV din 4 feb 2025** (carusel cu 6 servicii OCPI, CTA „Contact us"); carte-funciara-online.ro 3 zile în mar 2026 (test, oprit); restul imobiliare |

Citire: pe Meta **nu există concurență** pe niciunul din serviciile noastre, cu o singură
excepție care contează: CFunciara.ro ține același anunț de 19 luni. Nimeni nu ține 19 luni un
anunț care pierde bani. Pe cazier/constatator, cei care au încercat s-au oprit repede.

## 3. De ce e diferit de Google/ChatGPT

Meta nu are intenție. Nimeni nu scrollează Instagram gândindu-se la cazier. Documentul se
cumpără când îl cere cineva (angajator, bancă, notar, ONRC). Deci pe Meta funcționează doar:

1. **Retargeting** — oamenii care au fost pe site și n-au plătit (drafturi/abandon). Intenție
   deja dovedită, CPM mic, audiență mică. Cel mai bun raport cost/rezultat. Cere pixel Meta +
   consimțământ de marketing (avem infrastructura de consent, ca pentru Google/OpenAI).
2. **Interese B2B pentru constatator** — administratori de firmă, contabili, „antreprenoriat";
   mesaj de tip „îl iei în 5 minute de pe telefon, când ți-l cere banca". Rece, dar ieftin de testat.
3. **Carte funciară** — modelul CFunciara: carusel cu servicii OCPI. ⚠️ noi NU putem livra
   ANCPI acum (ePay picat) → nu se face reclamă (regula fixă 5).

NU: stare civilă / cazier judiciar la rece pe interese. Cost mare per click, intenție zero.

## 4. Recomandare

Nu acum. Ordinea:

1. Așteptăm verdictul ChatGPT Ads (1–2 zile) — e canalul cu intenție și cu politică favorabilă.
2. Dacă ChatGPT livrează: rămânem acolo și scalăm; Meta doar **retargeting** (buget 10 €/zi),
   pe toate serviciile, fără cuvinte de „oficial/avocat".
3. Dacă ChatGPT pică pe politică: Meta devine planul B, tot cu retargeting întâi, apoi un test
   de 2 săptămâni pe constatator cu interese B2B (20 €/zi). Buget total de test ≤ 500 €.
4. Când ANCPI revine: replicăm carusel-ul CFunciara pe CF (singura dovadă că Meta merge în nișă).

Costuri de pregătire (o singură dată, ~1 zi): pixel Meta consent-gated (același pattern ca
`loadOpenAiPixel`), eveniment Purchase pe pagina de succes + Conversions API din webhook,
2–3 creative pătrate per serviciu, cont Business Manager pe EDIGITALIZARE cu verificarea firmei.

## 5. Ce urmărim

- Ad Library CFunciara.ro (ID 1217872553090259): dacă se oprește, ne spune ceva.
- Dacă apare un competitor cu anunț la cazier care ține > 3 luni, ne uităm la landing/ofertă.
