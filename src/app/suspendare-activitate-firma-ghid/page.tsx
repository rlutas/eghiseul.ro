import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'suspendare-activitate-firma-ghid';
const TITLE = 'Suspendarea activității firmei: procedură, acte și ce obligații rămân (2026)';
const DESCRIPTION =
  'Ghid suspendare activitate SRL/PFA în 2026: pașii la ONRC și ANAF, durata maximă de 3 ani, ' +
  'ce obligații fiscale rămân în suspendare și cum se face reluarea activității.';
const DATE_PUBLISHED = '2026-07-31';
const DATE_MODIFIED = '2026-07-31';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Firme & ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="iulie 2026"
      updatedLabel="31 iulie 2026"
      relatedServices={[
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator Online',
          desc: 'Starea de suspendare apare în constatator — verifică ce văd partenerii.',
        },
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Necesar la reluarea activității sau la deschiderea altei firme.',
        },
      ]}
      faqs={[
        {
          q: 'Cât timp poate fi suspendată o firmă?',
          a: 'Maximum 3 ani de la înregistrarea mențiunii la Registrul Comerțului. Dacă la finalul celor 3 ani activitatea nu este reluată, firma riscă dizolvarea — inclusiv la cererea ONRC sau ANAF.',
        },
        {
          q: 'Ce obligații rămân în perioada de suspendare?',
          a: 'Firma nu mai desfășoară activitate comercială, dar continuă să existe juridic: păstrează obligația de a avea sediu social valabil și de a depune situațiile financiare anuale. Declarațiile fiscale curente se sistează doar după înregistrarea inactivității temporare la ANAF, nu automat de la ONRC.',
        },
        {
          q: 'Se poate emite factură în timpul suspendării?',
          a: 'Nu. Suspendarea înseamnă oprirea completă a activității economice. Emiterea de facturi sau încasările în perioada de suspendare pot atrage sancțiuni și reactivarea obligațiilor fiscale retroactiv.',
        },
        {
          q: 'Cum se reia activitatea firmei?',
          a: 'Prin aceeași procedură, în oglindă: decizia asociaților de reluare, cerere de mențiune la ONRC și actualizarea vectorului fiscal la ANAF. Reluarea se poate face oricând înainte de termenul de 3 ani.',
        },
      ]}
    >
      <p>
        Când firma nu mai are comenzi, dar nu vrei să o închizi definitiv, legea oferă o pauză oficială:
        suspendarea temporară a activității. E soluția clasică pentru un an prost, o plecare din țară
        sau o pauză de reorientare. Mai puțin cunoscute sunt regulile din spatele ei: pauza are termen
        maxim, obligațiile nu dispar toate, iar drumul are două stații — ONRC și ANAF — nu una singură.
      </p>

      <h2>Pasul 1: mențiunea la Registrul Comerțului</h2>
      <p>
        Dosarul e scurt: decizia asociatului unic sau hotărârea adunării generale privind suspendarea
        (cu data de început și durata), declarația-tip pe propria răspundere și cererea de înregistrare
        a mențiunii. Se depune la ghișeu sau online, în portalul ONRC, iar mențiunea se înregistrează de
        regulă în câteva zile lucrătoare. Din acel moment, starea de „activitate suspendată” devine
        publică — orice partener care scoate un{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator</Link> al firmei o
        vede negru pe alb.
      </p>

      <h2>Pasul 2, cel uitat: inactivitatea temporară la ANAF</h2>
      <p>
        Mențiunea de la ONRC <strong>nu oprește singură</strong> obligațiile declarative. Pentru
        sistarea declarațiilor curente, firma depune la ANAF declarația de mențiuni pentru înregistrarea
        inactivității temporare. Cine sare pasul ăsta descoperă după câteva luni un șir de declarații
        nedepuse și amenzile aferente — cea mai frecventă și mai scumpă greșeală din toată procedura.
      </p>

      <h2>Ce obligații RĂMÂN pe perioada suspendării</h2>
      <ul>
        <li>
          <strong>Sediul social valabil.</strong> Contractul de sediu trebuie menținut pe toată durata;
          un sediu expirat în plină suspendare complică orice operațiune ulterioară, inclusiv reluarea.
          Dacă sediul devine problema, vezi ghidul despre{' '}
          <Link href="/schimbare-sediu-social-srl-ghid/">schimbarea sediului social</Link>.
        </li>
        <li>
          <strong>Situațiile financiare anuale.</strong> Firma suspendată există juridic și depune în
          continuare situațiile anuale, chiar dacă pe zero.
        </li>
        <li>
          <strong>Evidența și arhiva.</strong> Documentele contabile se păstrează conform termenelor
          legale; suspendarea nu le anulează.
        </li>
        <li>
          <strong>Datoriile existente.</strong> Suspendarea nu șterge și nu amână datoriile către stat
          sau furnizori; creditorii pot continua recuperarea.
        </li>
      </ul>

      <h2>Termenul de 3 ani și ce se întâmplă la capătul lui</h2>
      <p>
        Suspendarea poate dura cel mult <strong>3 ani</strong>. La expirare, firma are două drumuri:
        reluarea activității (mențiune în oglindă la ONRC + reactivarea vectorului fiscal la ANAF) sau
        închiderea definitivă. Dacă nu se face nimic, firma riscă procedura de dizolvare declanșată de
        instituții. Cine știe de la început că nu va mai folosi firma economisește trei ani de obligații
        administrative mergând direct pe{' '}
        <Link href="/radiere-firma-srl-ghid/">radierea firmei</Link>.
      </p>

      <h2>Suspendare sau radiere: cum alegi</h2>
      <ul>
        <li>
          <strong>Suspendă</strong> dacă pauza e reală și temporară: sezonalitate, plecare limitată,
          incertitudine de piață. Costul e administrativ (situații anuale, sediu), dar firma, istoricul
          și eventualele autorizații se păstrează.
        </li>
        <li>
          <strong>Radiază</strong> dacă activitatea s-a încheiat definitiv. Procedura e mai lungă, dar
          după ea nu mai există nicio obligație.
        </li>
        <li>
          <strong>Nu lăsa firma „în aer”</strong> — nici suspendată, nici radiată, doar nefolosită:
          declarațiile curg, amenzile se adună, iar administratorul poate ajunge cu fapte înscrise în{' '}
          <Link href="/cazier-fiscal-persoana-fizica/">cazierul fiscal</Link>, ceea ce blochează
          înființarea altor firme în viitor.
        </li>
      </ul>
    </ArticleLayout>
  );
}
