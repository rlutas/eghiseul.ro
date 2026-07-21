import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { getOcpiCounty, allOcpiSlugs, nearbyOcpiCounties } from '@/lib/seo/locations/ocpi';
import { CarteFunciaraLocationPage } from '@/components/services/carte-funciara-location-page';

export const revalidate = 86400;

export function generateStaticParams() {
  return allOcpiSlugs().map((judet) => ({ judet }));
}

export async function generateMetadata({ params }: { params: Promise<{ judet: string }> }): Promise<Metadata> {
  const { judet } = await params;
  const c = getOcpiCounty(judet);
  if (!c) return {};
  return buildPageMetadata({
    title: `Extras de Carte Funciară Online ${c.judet} — 89 RON, Fără Drum la OCPI`,
    description: `Obține extrasul de carte funciară pentru un imobil din județul ${c.judet} online, fără drum la ${c.office}. 89 RON, taxe incluse, livrare pe email în câteva minute.`,
    path: `/servicii/extras-de-carte-funciara/${c.slug}/`,
    ogImage: '/og/services/extras-cf.png',
  });
}

export default async function Page({ params }: { params: Promise<{ judet: string }> }) {
  const { judet } = await params;
  const c = getOcpiCounty(judet);
  if (!c) notFound();
  const others = nearbyOcpiCounties(c.slug, 12).map((o) => ({ slug: o.slug, judet: o.judet }));
  return <CarteFunciaraLocationPage county={c} others={others} />;
}
