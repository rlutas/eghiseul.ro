/**
 * Specimen (mostră) al documentului livrat, per serviciu — afișat în wizard ca
 * să vadă clientul cum arată / ce primește. Imagini din public/images/specimens/.
 */
export interface ServiceSpecimen {
  src: string;
  alt: string;
}

export const SERVICE_SPECIMENS: Record<string, ServiceSpecimen> = {
  'cazier-judiciar': { src: '/images/specimens/cazier-judiciar.png', alt: 'Specimen cazier judiciar' },
  'cazier-judiciar-persoana-fizica': { src: '/images/specimens/cazier-judiciar.png', alt: 'Specimen cazier judiciar' },
  'cazier-judiciar-persoana-juridica': { src: '/images/specimens/cazier-judiciar.png', alt: 'Specimen cazier judiciar' },
  'cazier-auto': { src: '/images/specimens/cazier-auto.png', alt: 'Specimen cazier auto' },
  'cazier-fiscal': { src: '/images/specimens/cazier-fiscal.png', alt: 'Specimen cazier fiscal' },
  'certificat-integritate': { src: '/images/specimens/certificat-integritate.png', alt: 'Specimen certificat de integritate' },
  'certificat-nastere': { src: '/images/specimens/certificat-nastere.webp', alt: 'Specimen certificat de naștere' },
  'certificat-casatorie': { src: '/images/specimens/certificat-casatorie.webp', alt: 'Specimen certificat de căsătorie' },
  'certificat-celibat': { src: '/images/specimens/certificat-celibat.webp', alt: 'Specimen certificat de celibat' },
  'certificat-constatator': { src: '/images/specimens/certificat-constatator.png', alt: 'Specimen certificat constatator' },
  'extras-carte-funciara': { src: '/images/specimens/extras-cf.png', alt: 'Specimen extras de carte funciară' },
  'rovinieta': { src: '/images/specimens/rovinieta.webp', alt: 'Specimen rovinietă' },
};

export function getServiceSpecimen(slug: string | null | undefined): ServiceSpecimen | null {
  if (!slug) return null;
  return SERVICE_SPECIMENS[slug] ?? null;
}
