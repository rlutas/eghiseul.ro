import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ReabilitareCalculator } from '@/components/calculators/reabilitare-calculator';

const SLUG = 'reabilitare';
const TITLE = 'Calculator Reabilitare Cazier — Când se Șterge Condamnarea';
const DESCRIPTION =
  'Află când intervine reabilitarea și se șterge mențiunea din cazierul judiciar: termenele fixe ' +
  'din Codul Penal (3, 4, 5 sau 7 ani) în funcție de pedeapsă, calculate din data executării.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: '/og/default.png',
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Reabilitare Cazier Judiciar"
      description="Calculează data la care intervine reabilitarea și se șterge mențiunea din cazierul judiciar, pe baza termenelor fixe din Codul Penal."
      widget={<ReabilitareCalculator />}
      faqs={[
        { q: 'După cât timp se șterge cazierul judiciar?', a: 'Depinde de pedeapsă: reabilitarea de drept intervine după 3 ani (amendă, închisoare ≤ 2 ani, suspendare). Reabilitarea judecătorească: 4 ani (2-5 ani închisoare), 5 ani (5-10 ani) sau 7 ani (peste 10 ani), calculate de la executarea pedepsei.' },
        { q: 'Ce diferență e între reabilitarea de drept și cea judecătorească?', a: 'Reabilitarea de drept operează automat la împlinirea termenului, fără cerere. Reabilitarea judecătorească trebuie cerută la instanță și presupune îndeplinirea unor condiții (fără nouă infracțiune, plata cheltuielilor și a despăgubirilor).' },
        { q: 'Ce se întâmplă după reabilitare?', a: 'Mențiunea condamnării nu mai apare în cazierul judiciar obișnuit (cel cerut de angajatori). Pentru a verifica situația ta actuală, poți obține cazierul judiciar online.' },
      ]}
    >
      <h2>Când se șterge cazierul judiciar prin reabilitare</h2>
      <p>
        Codul Penal (art. 165-167) prevede <strong>termene fixe</strong> după care condamnarea se
        consideră reabilitată — nu se mai aplică vechea formulă cu fracție din pedeapsă.
      </p>
      <ul>
        <li><strong>Reabilitare de drept — 3 ani:</strong> amendă, închisoare ≤ 2 ani sau suspendare sub supraveghere;</li>
        <li><strong>Reabilitare judecătorească — 4 ani:</strong> închisoare între 2 și 5 ani;</li>
        <li><strong>5 ani:</strong> închisoare între 5 și 10 ani;</li>
        <li><strong>7 ani:</strong> închisoare peste 10 ani.</li>
      </ul>
      <p>
        Termenul curge, de regulă, de la data executării pedepsei principale (sau a achitării
        amenzii). Pentru a verifica ce mențiuni există în prezent, poți obține{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar online</Link>, fără drum la ghișeu.
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă. Situațiile cu condamnări succesive sau pedepse speciale au reguli
        diferite — consultă un avocat.
      </p>
    </CalculatorLayout>
  );
}
