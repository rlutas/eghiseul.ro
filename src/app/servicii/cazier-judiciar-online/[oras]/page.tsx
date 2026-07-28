import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { getCity, allCitySlugs, CITIES, isCityIndexable } from '@/lib/seo/locations';
import { CazierLocationPage } from '@/components/services/cazier-location-page';

export const revalidate = 86400;

export function generateStaticParams() {
  return allCitySlugs().map((oras) => ({ oras }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oras: string }>;
}): Promise<Metadata> {
  const { oras } = await params;
  const city = getCity(oras);
  if (!city) return {};
  return buildPageMetadata({
    title: `Cazier Judiciar Online ${city.name} — Fără Drum la IPJ ${city.judet}`,
    description: `Obține cazierul judiciar în ${city.name} online, fără cozi la IPJ ${city.judet}. Depunem cererea în numele tău, livrare în 3-5 zile pe email sau curier. Comandă în 5 minute.`,
    path: `/servicii/cazier-judiciar-online/${city.slug}/`,
    ogImage: '/og/services/cazier-judiciar.png',
    // Doar orașele care chiar sunt indexate (și aduc afișări) rămân
    // indexabile; restul primesc `noindex, follow` — Google le-a refuzat deja
    // ca fiind cvasi-duplicate, iar în index n-ar face decât să dilueze
    // calitatea domeniului. Lista + dovezile: lib/seo/locations/index.ts.
    noindexFollow: !isCityIndexable(city.slug),
  });
}

export default async function Page({ params }: { params: Promise<{ oras: string }> }) {
  const { oras } = await params;
  const city = getCity(oras);
  if (!city) notFound();

  const otherCities = CITIES.filter((c) => c.slug !== city.slug).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return <CazierLocationPage city={city} otherCities={otherCities} />;
}
