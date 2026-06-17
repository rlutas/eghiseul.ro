/**
 * Real Google reviews for eGhișeul.ro (eDigitalizare SRL), pulled verbatim from the
 * public Google Business Profile via the Maps reviews feed, sorted "Cele mai
 * recente" (4,9 ★ / 451 recenzii, 2026-06-16). Curated to recent positive 5★,
 * diverse across services. Light diacritic/typo cleanup only. Refresh by
 * re-scraping the GBP (sort by newest).
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
    name: 'Ștefania Cimena',
    rating: 5,
    when: 'acum 4 zile',
    text: 'Am solicitat actele necesare cu eGhiseul.ro fără să ajung în România și a fost totul perfect!',
  },
  {
    name: 'Ana-Maria Denisa Zaharia',
    rating: 5,
    when: 'acum o săptămână',
    text: 'De fiecare dată când avem nevoie de serviciile lor sunt eficienți și ne răspund imediat. Îi recomandăm cu încredere. O zi minunată!',
  },
  {
    name: 'Carmen',
    rating: 5,
    when: 'acum 3 săptămâni',
    text: 'Super profesioniști! Platformă ușor de folosit, comunicarea a fost rapidă și clară, iar documentele emise în doar 7 zile lucrătoare. Mulțumesc echipei — recomand cu încredere!',
  },
  {
    name: 'Daniel Odageriu',
    rating: 5,
    when: 'acum o lună',
    text: 'Am avut o experiență excelentă pentru obținerea cazierului judiciar online și a cazierului auto. Răspunsul pe WhatsApp a fost incredibil de rapid, iar profesionalismul lor este de top. Recomand cu încredere!',
  },
  {
    name: 'Soare Ali',
    rating: 5,
    when: 'acum o lună',
    text: 'Serviciu excelent, profesional, punctual și rapid. Am solicitat extrasul multilingv al certificatului de căsătorie, iar colaborarea a fost impecabilă de la început până la final.',
  },
  {
    name: 'Aurelian Acsinte',
    rating: 5,
    when: 'acum o lună',
    text: 'Servicii rapide, atitudine profesionistă și amabilă. A fost nevoie de o completare și am fost contactat imediat pe WhatsApp, iar demersul nu a fost întrerupt! Recomand cu sinceritate!',
  },
  {
    name: 'Diana Martins Morgado',
    rating: 5,
    when: 'acum o lună',
    text: 'Recomand cu mare drag, totul foarte rapid și foarte bine explicat. Apelați cu încredere la serviciile lor!',
  },
  {
    name: 'Gurgui Elena',
    rating: 5,
    when: 'acum o lună',
    text: 'Serviciu rapid, personal amabil. Recomand cu încredere.',
  },
  {
    name: 'Mariana Gîrneț',
    rating: 5,
    when: 'acum 2 luni',
    text: 'Am avut o experiență excelentă! Mi-au făcut documentul foarte rapid, sincer nici nu m-am așteptat să fie gata atât de repede. M-au contactat imediat, au fost foarte amabili și profesioniști.',
  },
  {
    name: 'Fd Ait',
    rating: 5,
    when: 'acum 2 luni',
    text: 'Siguranță, rapiditate, soluții eficiente și receptivitate. Soluția optimă în caz de nevoie, fie că ești în țară, fie că ești departe de casă — aici găsești rezultatul dorit.',
  },
  {
    name: 'Stoica Costel',
    rating: 5,
    when: 'acum 2 luni',
    text: 'Am făcut o solicitare și nici nu am apucat să spun ceva, că deja primisem ce aveam nevoie. S-au mișcat extraordinar de repede. Recomand și vă mulțumesc din suflet pentru efortul depus!',
  },
  {
    name: 'Adina Vereș',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Am apelat la serviciile eGhiseul și sunt foarte mulțumită. Servicii rapide, documentele solicitate au fost transmise la adresa mea din străinătate în câteva zile. Recomand cu încredere!',
  },
  {
    name: 'Mihai Buciumeanu',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Un serviciu de top! Să trimiți solicitarea și în 15 minute să ai tot ce-ți trebuie, asta înseamnă să fii profesionist. Poate rivaliza oricând cu unul din vestul Europei.',
  },
  {
    name: 'Sorin Marin',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Am apelat pentru un set de documente destul de complexe. Serviciile de eliberare și traducere au fost impecabile. M-au ținut la curent cu statusul actelor și au respectat termenele promise.',
  },
  {
    name: 'Anton Florin Gîfu',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Documentele solicitate, primite chiar înaintea termenului de eliberare. Bravo!',
  },
  {
    name: 'Cata Valeriu',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Serviciu excelent! Am comandat niște certificate din România și au ajuns în timp record. Comunicare foarte bună, oameni serioși și de încredere. Îi recomand tuturor celor din diaspora.',
  },
  {
    name: 'Irina Vișinoiu',
    rating: 5,
    when: 'acum 7 luni',
    text: 'Servicii excelente! Am primit extrasul în aceeași zi, deși știam doar numele proprietarului și localitatea. Ca bonus, al doilea extras a fost gratuit. Mulțumesc!',
  },
  {
    name: 'Turiac Silvia',
    rating: 5,
    when: 'acum 7 luni',
    text: 'Am avut nevoie urgentă de un certificat de celibat în Olanda. Am fost foarte plăcut surprinsă de profesionalismul, comunicarea și rapiditatea angajaților de la eghiseul.ro. Complimentele mele!',
  },
];
