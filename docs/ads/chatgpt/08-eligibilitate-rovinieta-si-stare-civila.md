# Ce mai putem urca pe ChatGPT Ads — rovinietă, stare civilă și restul catalogului

Analiză făcută pe **politica v1.6, „Updated: 10 September 2026"**, citită direct în browser
pe 17.09.2026. Documentul `01-politica-openai.md` citează v1.5 din 31.08, deci era în urmă
cu o versiune.

## Ce s-a schimbat în v1.6

Un singur rând în changelog, dar contează:

> v1.6 (September 2026): Updated to clarify our right to decline ads where they conflict with
> our advertising principles, business interests, or competitive position.

Adică OpenAI își rezervă explicit dreptul de a refuza reclame care intră în conflict cu
**poziția lor competitivă**. Pentru noi e un risc de fundal, nu o interdicție: vindem obținerea
unor documente pe care ChatGPT nu le poate emite. De reținut la orice viitoare respingere fără
motiv de politică.

Tot ce ne privea din v1.5 a rămas neschimbat, inclusiv fraza care blochează jumătate din catalog:

> Ads for legal advice, representation, or legal services offered to individuals or businesses
> are permitted in the US only when the advertiser is licensed to practice law in the
> jurisdiction where the ad is shown. This includes services related to immigration, personal
> injury, legal claims, or **document preparation**.
>
> Ads for legal services outside of the US are currently prohibited.

## Certificat de naștere: nu, și nu e o chestiune de text

`certificat-nastere` e în `LAWYER_SERVICE_SLUGS`, împreună cu căsătorie, celibat, integritate,
ambele extrase multilingve și toate cazierele. Pentru serviciile astea clientul semnează în
wizard un contract de asistență juridică, primește o împuternicire avocațială cu număr de Barou,
iar avocatul depune cererea. Asta e definiția de manual a „legal services" plus „document
preparation".

Reviewul OpenAI citește landingul cu un model de limbaj, iar sancțiunea e pe advertiser, nu pe
anunț. Un ban ar închide și constatatorul, singurul lucru care difuzează acum. Un landing
„curățat" care ascunde avocatul intră direct în „Destination integrity", iar un cont sau domeniu
paralel intră în „Abuse of OpenAI Ads".

Naștere rămâne pe Meta, unde deja rulează celibat și unde politica nu are problema asta.
Se redeschide doar dacă OpenAI extinde „legal services" în UE, cu dovada licenței, cum a făcut
în SUA la v1.5. Se urmărește în changelogul politicii.

## Rovinietă: categoria e bună, produsul nu e pregătit

Instinctul e corect pe politică. `rovinieta` **nu** e în `LAWYER_SERVICE_SLUGS`, nu are avocat
în flux, e un produs de consum, iar categoria „digital products" sau „local services" i se
potrivește. Dar trei lucruri o descalifică acum, și niciunul nu ține de OpenAI.

**1. Nu vindem noi.** `RovinietaPurchaseForm` nu creează comandă la noi. Trimite utilizatorul
în tab nou pe `https://erovinieta.net/checkout` cu `utm_source=eghiseul&utm_medium=referral`.
E afiliere, nu serviciu propriu. În baza noastră, serviciul are `base_price = 0`, zero opțiuni,
**2 comenzi în total și niciuna plătită**, de la lansare.

Deci reclama ar însemna să plătim clic ca să trimitem omul la checkout-ul altcuiva. Sub
„Destination integrity", asta e și fragil la review: anunțul promite o achiziție la noi,
destinația finală e altă firmă.

**2. Comisionul nu e în scris.** „Deblocare RCA pe erovinieta + split 85% în scris" e încă pe
lista de acțiuni umane din `docs/STATUS_CURRENT.md`, la fel ca „verificare statut distribuitor
CNAIR". Nu cumperi trafic pentru un venit care nu e contractat.

**3. Landingul ar pica review-ul.** Trei lucruri de pe pagină, măsurate pe politică:

| Pe pagină acum | Ce încalcă |
|---|---|
| Badge „Oficial CNAIR" în formular | „Scams & fraud": ads that impersonate individuals, brands, **official entities**, or trusted services |
| „Activare instant", „Valabilă Instant" | „Misleading or deceptive ads": unfounded claims about outcomes. Plus regula noastră de casă: fără „instant" |
| „Plată 100% Securizată" | același rând, procent absolut nedemonstrabil |

Partea bună: pagina are deja `PrivateServiceNotice` care trimite la roviniete.ro, site-ul CNAIR,
deci scheletul de neafiliere există. Se repară în câteva ore de text.

**Concluzie pe rovinietă:** merită, dar în ordinea asta. Întâi comisionul în scris și statutul
de distribuitor, apoi curățat landingul de „Oficial CNAIR" și de „instant", apoi ideal o comandă
care se face la noi, nu pe alt domeniu. Abia apoi campania. Marja e oricum mică, deci e test de
volum și de recurență anuală, nu de profit pe prima tranzacție.

## Ce e de fapt următorul: extras de carte funciară

Serviciile fără avocat, pe ultimele 90 de zile:

| Serviciu | Comenzi plătite | Venit (lei) | Preț mediu | Conversie |
|---|---|---|---|---|
| Extras carte funciară | 143 | 13.309 | 93 | 29,7% |
| Certificat constatator | 66 | 6.272 | 95 | 63,5% |
| Identificare imobil | 25 | 4.930 | 197 | 28,1% |
| Extras plan cadastral | 14 | 1.228 | 88 | 42,4% |
| Rovinietă | 0 | — | — | — |

**Extrasul de carte funciară are de două ori volumul constatatorului, la același preț**, e
complet automat, fără avocat, și livrează: din 38 de comenzi plătite în ultimele 30 de zile,
37 sunt `completed`. Nu are nicio problemă de politică.

Riscul lui e altul, operațional, nu de reclamă: portalul ANCPI ePay a fost picat din 13 iulie
și repornit în august doar pentru profesioniști. Înainte de a cumpăra trafic, verifică
`SystemStatus` pe pagină și livrarea din ultimele zile, altfel plătim clicuri către un serviciu
care intră în așteptare.

## Ordinea recomandată pe ChatGPT Ads

1. **AG2 „cu istoric"** pe campania existentă, 487 lei, marja reală. Zero risc, e deja scris.
2. **Extras carte funciară**, campanie nouă, după ce confirmi că ANCPI livrează.
3. **Identificare imobil**, 197 lei, dacă primele două merg.
4. **Rovinietă**, după cele trei reparații de mai sus.
5. Stare civilă și caziere: nu, până se schimbă politica.
