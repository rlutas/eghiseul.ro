/**
 * Real Google reviews for eGhișeul.ro (RapidCert SRL), pulled verbatim from the
 * public Google Business Profile via the Maps reviews feed (4,9 ★ / 451 recenzii,
 * 2026-06-16). Curated to positive 5★ reviews, diverse across services. Light
 * diacritic/clarity cleanup only — kept faithful. Refresh by re-scraping the GBP.
 */

export interface Review {
  name: string;
  rating: number;
  /** Relative time as shown on Google (Romanian). */
  when: string;
  text: string;
}

export const REVIEWS: Review[] = [
  {
    name: 'Mihai Buciumeanu',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Un serviciu de top! Să trimiți solicitarea și în 15 minute să ai tot ce-ți trebuie, asta înseamnă să fii profesionist. Poate rivaliza oricând cu unul din vestul Europei și credeți-mă, știu ce vorbesc.',
  },
  {
    name: 'Irina Vișinoiu',
    rating: 5,
    when: 'acum 7 luni',
    text: 'Servicii excelente! Am primit extrasul în aceeași zi, deși știam doar numele proprietarului și localitatea. Deși termenul era de 5 zile, ca bonus al doilea extras a fost gratuit. Mulțumesc!',
  },
  {
    name: 'Iulia Pielmuș',
    rating: 5,
    when: 'acum 4 luni',
    text: 'Foarte prompți și profesioniști. Deși am introdus eu greșit adresa, am reușit să iau rapid legătura cu ei pe WhatsApp și au remediat instantaneu. Recomand!',
  },
  {
    name: 'Turiac Silvia',
    rating: 5,
    when: 'acum 4 luni',
    text: 'Am avut nevoie urgentă de un certificat de celibat în Olanda. Am fost foarte plăcut surprinsă de profesionalismul, comunicarea și rapiditatea angajaților de la eghiseul.ro. Complimentele mele! Sunt foarte mulțumită!',
  },
  {
    name: 'Daniel Odageriu',
    rating: 5,
    when: 'acum o lună',
    text: 'Am avut o experiență excelentă pentru obținerea cazierului judiciar online și a cazierului auto. Răspunsul pe WhatsApp a fost incredibil de rapid, iar profesionalismul lor este de top. Recomand cu încredere!',
  },
  {
    name: 'Tudor-Ștefan Rotaru',
    rating: 5,
    when: 'acum 4 luni',
    text: 'Merită. Plătești o dată și primești ambele certificate (cazier și integritate) pe mail și pe WhatsApp. Alte site-uri dau erori sau nu funcționează. Aici a fost totul OK.',
  },
  {
    name: 'Claudia Teslaru',
    rating: 5,
    when: 'acum 7 luni',
    text: 'Am fost extrem de mulțumită de serviciul pentru eliberarea certificatului de naștere. Totul a decurs rapid, eficient și fără complicații. Documentul a fost eliberat mult mai repede decât mă așteptam. Recomand cu încredere!',
  },
  {
    name: 'D. Viorel Sosa',
    rating: 5,
    when: 'acum 8 luni',
    text: 'Cei mai profesioniști din tot ce am întâlnit până acum, super rapizi, comunicare permanentă, prețuri foarte decente. În două zile actele scoase, apostilate și trimise prin DHL + electronic pe mail. Mulțumesc că existați!',
  },
  {
    name: 'Alessandro Teodor Aquadro',
    rating: 5,
    when: 'acum 6 luni',
    text: 'Aș dori să vă mulțumesc pentru profesionalismul de care ați dat dovadă! Am avut nevoie de certificatul de naștere și, pentru că locuiesc în Franța, nu aveam timp să merg în țară. Totul s-a rezolvat rapid. Apelați cu încredere!',
  },
  {
    name: 'Sorin Marin',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Am apelat pentru un set de documente destul de complexe. Serviciile de eliberare și traducere au fost impecabile. M-au ținut la curent cu statusul actelor și au respectat termenele promise. O echipă de profesioniști!',
  },
  {
    name: 'Aurelian Acsinte',
    rating: 5,
    when: 'acum o lună',
    text: 'Servicii rapide, atitudine profesionistă și amabilă. A fost nevoie de o completare și am fost contactat imediat pe WhatsApp, iar demersul nu a fost întrerupt! Recomand cu sinceritate!',
  },
  {
    name: 'Dina',
    rating: 5,
    when: 'acum 11 luni',
    text: 'Servicii impecabile și profesionalism real. Am solicitat un duplicat al certificatului de naștere pentru dosarul de cetățenie spaniolă, iar echipa a gestionat totul rapid, chiar mai repede decât termenul estimat.',
  },
  {
    name: 'Ionuț Badea',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Servicii excelente și rapiditate în rezolvare. Practic 3 zile lucrătoare pentru eliberarea unui extras multilingv de certificat de naștere.',
  },
  {
    name: 'Svetlana Didorac',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Vă mulțumesc pentru serviciul oferit! Foarte rapid am primit actele. Recomand cu încredere și, în caz de nevoie, voi reveni oricând. Vă mulțumesc!',
  },
];
