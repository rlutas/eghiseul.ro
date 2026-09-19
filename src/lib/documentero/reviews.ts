/**
 * Real Google reviews shown on documentero.ro.
 *
 * Source: the Google Business Profile of eGhișeul.ro (eDigitalizare SRL —
 * same company, same lawyer, same team that handles documentero orders),
 * read from Google Maps on 19.09.2026 (4,9 ★ / 470 reviews). Only 5★
 * reviews about CIVIL-STATUS documents (birth/marriage certificate, proof of
 * celibacy, multilingual extract), text verbatim except for the trims marked
 * with „…”. Avatars are the reviewers' public Google profile photos, saved
 * at 160 px in public/images/documentero/recenzii/.
 *
 * Content rule (.claude/rules/content-and-seo.md §3): nothing invented — no
 * rating without a source, no relative dates („acum 4 zile” freezes and
 * lies), no reviews for a product that has none. The page says these come
 * from the eGhișeul.ro profile and links to it.
 *
 * Refresh: Google Maps → eGhișeul.ro → Recenzii → sort by newest; keep the
 * ones about stare civilă, replace the avatar files, update the date below.
 */

/** When the list below was read from Google, for the note under the cards. */
export const DOCUMENTERO_REVIEWS_COLLECTED = '19 septembrie 2026';

export interface DocumenteroReview {
  name: string;
  /** Path under public/ of the reviewer's Google photo; null → initials. */
  avatar: string | null;
  /** Which document the review is about — shown under the name. */
  service: string;
  text: string;
}

export const DOCUMENTERO_REVIEWS: DocumenteroReview[] = [
  {
    name: 'Ionuț Badea',
    avatar: '/images/documentero/recenzii/ionut-badea.jpg',
    service: 'Extras multilingv de naștere',
    text: 'Servicii excelente și rapiditate în rezolvare. Practic 3 zile lucrătoare pentru soluționarea eliberării unui extras multilingv certificat naștere.',
  },
  {
    name: 'Turiac Silvia',
    avatar: '/images/documentero/recenzii/turiac-silvia.jpg',
    service: 'Certificat de celibat · Olanda',
    text: 'Am avut nevoie urgentă de un certificat de celibat în Olanda. Am fost foarte plăcut surprinsă de profesionalism, comunicare și rapiditatea de care au dat dovadă angajații de la eghiseul.ro, mai ales în situația în care aveam nevoie de acest certificat în mod urgent. Complimentele mele!',
  },
  {
    name: 'Amalia Marin',
    avatar: '/images/documentero/recenzii/amalia-marin.jpg',
    service: 'Certificat de naștere pierdut',
    text: 'Un serviciu excepțional. Am făcut comanda pentru un certificat de naștere pierdut și, deși termenul inițial de pe site era 15-20 zile, l-am primit în 9 zile. O surpriză foarte plăcută! … Un serviciu de calitate. Recomand din toată inima!',
  },
  {
    name: 'Soare Ali',
    avatar: '/images/documentero/recenzii/soare-ali.jpg',
    service: 'Extras multilingv de căsătorie · din străinătate',
    text: 'Un serviciu excelent, profesional, punctual și cât se poate de rapid și eficient … de la solicitarea serviciului (extras multilingv al certificatului de căsătorie), efectuarea comenzii și livrarea acesteia. Timpii au fost rapizi, vorbim de 2 săptămâni, în condițiile în care eu am solicitat acest serviciu aflându-mă în străinătate și făcând totul de la această distanță.',
  },
  {
    name: 'Alexandra Pleșea',
    avatar: '/images/documentero/recenzii/alexandra-plesea.jpg',
    service: 'Certificat de celibat',
    text: 'Recomand din inimă, am depus pe 4 actele pentru certificatul de celibat, dânșii au reușit să mi-l obțină azi în 8. Super mulțumită, rapiditate, seriozitate 🙏🏻',
  },
  {
    name: 'Claudia Teslaru',
    avatar: '/images/documentero/recenzii/claudia-teslaru.jpg',
    service: 'Certificat de naștere',
    text: 'Am fost extrem de mulțumită de serviciul oferit pentru eliberarea certificatului de naștere. Totul a decurs rapid, eficient și fără complicații. Personalul a fost amabil, bine informat și dispus să mă ajute cu orice nelămurire. Documentul a fost pregătit și eliberat într-un timp foarte scurt, mult mai repede decât mă așteptam.',
  },
  {
    name: 'Mihai Cristian Stănculescu',
    avatar: '/images/documentero/recenzii/mihai-cristian-stanculescu.jpg',
    service: 'Certificat de naștere · livrare DHL',
    text: 'Am avut nevoie de certificatul de naștere, l-am primit în 2 săptămâni, timp în care cei de la relații cu clienții mi-au dat update-uri încontinuu și au fost super profesioniști, iar livrarea prin DHL super express! M-ați salvat de un drum în România plus cheltuiala extra!',
  },
  {
    name: 'Liliana Gomotriceanu',
    avatar: '/images/documentero/recenzii/liliana-gomotriceanu.jpg',
    service: 'Certificat de naștere + apostilă',
    text: 'Vă mulțumesc frumos pentru serviciile dumneavoastră, sunteți foarte rapizi și corecți, vă recomand tuturor celor care au nevoie de acte din România. Am avut nevoie de duplicat după certificatul de naștere și apostilă. Actele mi-au ajuns chiar mai repede decât era prevăzut.',
  },
  {
    name: 'Viky Chira',
    avatar: '/images/documentero/recenzii/viky-chira.jpg',
    service: 'Certificat de naștere',
    text: 'Am făcut comanda pentru certificatul de naștere online, au fost cordiali, au răspuns imediat la toate întrebările și de fiecare dată mi-au trimis mesaj cu toate demersurile comenzii. Sunt numărul 1.',
  },
];
