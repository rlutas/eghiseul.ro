/**
 * Real Google reviews for eGhișeul.ro (RapidCert SRL), pulled verbatim from the
 * public Google Business Profile (4,9 ★ din 451 recenzii, 2026-06-16).
 * Kept verbatim for authenticity. To refresh, copy new reviews from the GBP.
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
    name: 'Svetlana Didorac',
    rating: 5,
    when: 'acum 3 luni',
    text: 'Vă mulțumesc pentru serviciul oferit! Foarte rapid am primit actele. Recomand cu încredere și, în caz de nevoie, voi reveni oricând. Vă mulțumesc!',
  },
  {
    name: 'Turiac Silvia',
    rating: 5,
    when: 'acum 4 luni',
    text: 'Am avut nevoie urgentă de un certificat de celibat în Olanda. Am fost foarte plăcut surprinsă de profesionalismul, comunicarea și rapiditatea de care au dat dovadă angajații de la eghiseul.ro, mai ales în situația în care aveam nevoie urgentă de acest certificat. Complimentele mele! Sunt foarte mulțumită de aceste servicii! Țineți-o tot așa!',
  },
  {
    name: 'Raji Mook',
    rating: 5,
    when: 'acum 2 ani',
    text: 'Perfect service! I asked for a criminal record with translation in Italian, apostilled and verified by a notary. Everything was sent as soon as possible with DHL Express (to Switzerland), very fast and with really good communication. I cannot ask for better work — thank you!',
  },
  {
    name: 'Tania Vasilescu',
    rating: 5,
    when: 'acum 1 an',
    text: 'I would like to thank you for your excellent service. Your team was efficient and professional, and I greatly appreciate the support and guidance provided throughout the process. I will not hesitate to recommend you.',
  },
  {
    name: 'Mirela Morar',
    rating: 5,
    when: 'acum 11 luni',
    text: 'Very fast, great experience. Very respectful and very helpful people! Thank you!',
  },
];
