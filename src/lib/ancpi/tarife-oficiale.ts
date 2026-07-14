/**
 * Official ANCPI tariffs — Ordin ANCPI nr. 16/2019 (în vigoare de la 04.02.2019),
 * consolidat 26 iulie 2024 (ultimul amendament: Ordin 1498/2024). Sursa: Anexa,
 * cap. 2 „Servicii de cadastru și publicitate imobiliară" + Art. 4 (urgența).
 *
 * Urgency rule (Art. 4): la cerere, serviciul se prestează în max 1/3 din
 * termenul normal, contra unui tarif SUPLIMENTAR de 4× tariful normal
 * (plafonat la 5.000 lei/serviciu) — deci total urgent = 5× tariful normal.
 * Excepții (Nota 21/22): extrasul CF / extrasul de plan cadastral cerute
 * online se livrează DE ÎNDATĂ fără tarif de urgență, dacă CF-ul e în format
 * electronic (respectiv imobilul are geometrie) — urgența rămâne relevantă
 * exact pentru cărțile funciare VECHI, nedigitalizate.
 *
 * These are the state's taxes only — our service fees are separate. Shared by
 * /admin/tarife-ancpi and /colaborator/tarife so team + collaborators quote
 * identical numbers.
 */

export interface TarifAncpi {
  cod: string;
  serviciu: string;
  /** Official tariff, human-readable (some are percentage formulas). */
  tarif: string;
  um: string;
  /** Total cost in urgency regime (normal + 4× supplement), human-readable. */
  urgent: string;
  nota?: string;
}

export interface GrupaTarife {
  grupa: string;
  tarife: TarifAncpi[];
}

export const TARIFE_ANCPI: GrupaTarife[] = [
  {
    grupa: 'Informare (extrase, copii, certificate)',
    tarife: [
      {
        cod: '2.7.2',
        serviciu: 'Extras de carte funciară pentru informare',
        tarif: '20 lei online / 25 lei la ghișeu',
        um: 'imobil',
        urgent: 'CF electronică: instant, FĂRĂ taxă de urgență · CF nedigitalizată: 125 lei',
        nota: 'Nota 21: urgența se aplică doar când CF-ul nu există în format electronic (CF vechi).',
      },
      {
        cod: '2.7.3',
        serviciu: 'Extras de carte funciară pentru autentificare',
        tarif: '40 lei',
        um: 'imobil',
        urgent: 'CF electronică: instant · CF nedigitalizată: 200 lei',
        nota: 'Doar prin notar. Aceeași regulă Nota 21 ca la extrasul de informare.',
      },
      {
        cod: '2.7.10',
        serviciu: 'Copie de carte funciară (inclusiv CF veche)',
        tarif: '25 lei',
        um: 'carte funciară',
        urgent: '125 lei',
      },
      {
        cod: '2.7.5',
        serviciu: 'Copii certificate ale documentelor din arhivă',
        tarif: '25 lei',
        um: 'dosar',
        urgent: '125 lei',
        nota: 'Dosarul = toate documentele unei cereri de recepție/înscriere; și alte documente din arhivă.',
      },
      {
        cod: '2.7.1',
        serviciu: 'Consultare documente din arhivă',
        tarif: '10 lei',
        um: '15 minute',
        urgent: '50 lei',
      },
      {
        cod: '2.7.6',
        serviciu: 'Certificat identificare nr. topografic / cadastral / CF după numele proprietarului',
        tarif: '10 lei',
        um: 'proprietar / BCPI',
        urgent: '50 lei',
      },
      {
        cod: '2.7.9',
        serviciu: 'Referat consultare registru proprietari la nivel național',
        tarif: '10 lei',
        um: 'referat / proprietar',
        urgent: '50 lei',
      },
      {
        cod: '2.7.7',
        serviciu: 'Extras din planul cadastral',
        tarif: '15 lei',
        um: 'imobil',
        urgent: 'Cu geometrie: instant, fără urgență · fără geometrie: 75 lei',
        nota: 'Nota 22: se livrează de îndată dacă imobilul are geometrie în sistemul integrat.',
      },
      {
        cod: '2.7.4',
        serviciu: 'Certificat de sarcini',
        tarif: '100 lei',
        um: 'certificat / BCPI',
        urgent: '500 lei',
      },
      {
        cod: '2.7.8',
        serviciu: 'Certificat privind înscrierea imobilului după adresă (județ, localitate, stradă, număr)',
        tarif: '100 lei',
        um: 'certificat',
        urgent: '500 lei',
        nota: 'Nota 15: se furnizează DOAR dacă imobilul NU este înscris în cadastru și carte funciară.',
      },
    ],
  },
  {
    grupa: 'Actualizare (aici intră schimbarea adresei)',
    tarife: [
      {
        cod: '2.6.3',
        serviciu: 'Actualizare informații tehnice (schimbare adresă poștală, categorie de folosință, suprafață, geometrie etc.)',
        tarif: '75 lei',
        um: 'imobil',
        urgent: '375 lei',
        nota: 'Tarif unic pentru TOATE actualizările cerute printr-o singură cerere. GRATUIT când modificarea de adresă vine din inițiativa primăriei.',
      },
      {
        cod: '2.6.1',
        serviciu: 'Înscriere construcție',
        tarif: '60 lei/construcție + 0,05% din valoarea de impozitare',
        um: 'construcție',
        urgent: '5× tariful calculat (supliment max 5.000 lei)',
      },
      {
        cod: '2.6.2',
        serviciu: 'Extindere / radiere construcții',
        tarif: '120 lei',
        um: 'construcție',
        urgent: '600 lei',
      },
      {
        cod: '2.6.4',
        serviciu: 'Anulare operațiuni cadastrale',
        tarif: '60 lei',
        um: 'operațiune',
        urgent: '300 lei',
      },
    ],
  },
  {
    grupa: 'Prima înregistrare în cadastru și CF',
    tarife: [
      {
        cod: '2.1.1',
        serviciu: 'Recepție cadastrală și înființare carte funciară',
        tarif: '120 lei',
        um: 'imobil / u.i.',
        urgent: '600 lei',
        nota: 'Scutit la prima înregistrare a terenurilor agricole/forestiere din titluri de proprietate (urgența costă atunci 480 lei).',
      },
      {
        cod: '2.1.2',
        serviciu: 'Recepție cu alocare număr cadastral',
        tarif: '60 lei',
        um: 'imobil / u.i.',
        urgent: '300 lei',
        nota: 'Include eliberarea gratuită a extrasului de plan cadastral. Scutire titluri de proprietate: urgența costă 240 lei.',
      },
      {
        cod: '2.1.3',
        serviciu: 'Înființare carte funciară',
        tarif: '60 lei',
        um: 'imobil / u.i.',
        urgent: '300 lei',
      },
      {
        cod: '2.1.4',
        serviciu: 'Recepție cadastrală + înființare CF — imobile în regiunile de CF veche (Decretul-lege 115/1938: Transilvania, Banat, Bucovina)',
        tarif: '120 lei',
        um: 'imobil / u.i.',
        urgent: '600 lei',
        nota: 'Exact cazul conversiei cărților funciare vechi (cu jugări/stânjeni/nr. topografic) în sistemul electronic.',
      },
    ],
  },
  {
    grupa: 'Dezlipire / Alipire',
    tarife: [
      { cod: '2.2.1', serviciu: 'Recepție dezlipire/alipire', tarif: '60 lei', um: 'imobil/u.i. rezultat', urgent: '300 lei' },
      { cod: '2.2.2', serviciu: 'Înscriere dezlipire/alipire', tarif: '60 lei', um: 'imobil/u.i. rezultat', urgent: '300 lei' },
    ],
  },
  {
    grupa: 'Intabulare / Notare / Radiere',
    tarife: [
      {
        cod: '2.3.1',
        serviciu: 'Intabulare drepturi reale — persoane juridice',
        tarif: '0,50% din valoarea din act (min. 60 lei/imobil)',
        um: 'valoare din act',
        urgent: '5× tariful calculat (supliment max 5.000 lei)',
      },
      {
        cod: '2.3.2',
        serviciu: 'Intabulare drepturi reale — persoane fizice',
        tarif: '0,15% din valoarea din act (min. 60 lei/imobil)',
        um: 'valoare din act',
        urgent: '5× tariful calculat (supliment max 5.000 lei)',
      },
      {
        cod: '2.3.3',
        serviciu: 'Înscriere ipotecă / privilegiu',
        tarif: '100 lei/imobil + 0,1% din valoarea creanței garantate',
        um: 'operațiune',
        urgent: '5× tariful calculat (supliment max 5.000 lei)',
      },
      { cod: '2.4.1', serviciu: 'Notare în cartea funciară', tarif: '75 lei', um: 'operațiune', urgent: '375 lei' },
      { cod: '2.4.2', serviciu: 'Radiere din cartea funciară', tarif: '75 lei', um: 'operațiune', urgent: '375 lei' },
    ],
  },
  {
    grupa: 'Rectificare (gratuite)',
    tarife: [
      { cod: '2.5.1', serviciu: 'Îndreptare eroare materială (include repoziționarea imobilului)', tarif: '0 lei', um: 'operațiune', urgent: '—' },
      { cod: '2.5.2', serviciu: 'Reconstituire carte funciară', tarif: '0 lei', um: 'operațiune', urgent: '—' },
      { cod: '2.5.3', serviciu: 'Corectare cadastru', tarif: '0 lei', um: 'imobil/u.i.', urgent: '—' },
    ],
  },
  {
    grupa: 'Regiunile de CF veche — Decretul-lege 115/1938 (înregistrare în plan cadastral)',
    tarife: [
      { cod: '2.8.1', serviciu: 'Înregistrarea în planul cadastral (solicitată de titularul tabular, fără alte operațiuni)', tarif: '0 lei', um: 'imobil/u.i.', urgent: '—' },
      { cod: '2.8.2', serviciu: 'Înregistrarea în planul cadastral + alte operațiuni', tarif: '75 lei', um: 'imobil', urgent: '375 lei' },
      { cod: '2.8.3', serviciu: 'Înregistrarea în planul cadastral + înscriere construcție', tarif: '60 lei/construcție + 0,05% din valoarea de impozitare', um: 'construcție', urgent: '5× tariful calculat' },
      { cod: '2.8.4', serviciu: 'Înregistrarea în planul cadastral + extindere/radiere construcție', tarif: '120 lei', um: 'construcție', urgent: '600 lei' },
    ],
  },
];

/** Urgency rule summary, shown as a header note on both tariff pages. */
export const REGULA_URGENTA = {
  supliment: 'Tarif suplimentar de urgență = 4× tariful normal (total plătit = 5× tariful normal)',
  plafon: 'Suplimentul de urgență este plafonat la 5.000 lei / serviciu',
  termen: 'Termen în regim de urgență = maximum 1/3 din termenul normal de eliberare',
  exceptii:
    'Serviciile online livrate de îndată NU au taxă de urgență: extrasul CF electronic (Nota 21) și extrasul de plan cadastral cu geometrie (Nota 22). Urgența contează exact la cărțile funciare vechi, nedigitalizate.',
  sursa: 'Ordin ANCPI nr. 16/2019, consolidat 26.07.2024 (ultimul amendament: Ordin 1498/2024)',
};
