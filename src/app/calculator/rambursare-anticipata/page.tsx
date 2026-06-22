import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { RambursareAnticipataCalculator } from '@/components/calculators/rambursare-anticipata-calculator';

const SLUG = 'rambursare-anticipata';
const TITLE = 'Calculator Rambursare Anticipată Credit — Dobândă Economisită';
const DESCRIPTION =
  'Calculează cât economisești dacă rambursezi anticipat o parte din credit: reduci durata sau rata și afli dobânda economisită, pentru un credit cu rate egale.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Rambursare Anticipată')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Rambursare Anticipată Credit"
      description="Află cât economisești dacă plătești anticipat o sumă din credit — comparând cele două opțiuni: reduci perioada sau reduci rata lunară."
      widget={<RambursareAnticipataCalculator />}
      faqs={[
        {
          q: 'Ce este mai avantajos: să reduc perioada sau rata?',
          a: 'Din punct de vedere al dobânzii economisite, reducerea perioadei (păstrând aceeași rată) economisește de regulă mai mult, pentru că termini creditul mai repede. Reducerea ratei îți ușurează bugetul lunar, dar economia de dobândă este mai mică. Calculatorul îți arată ambele variante.',
        },
        {
          q: 'Se plătește comision la rambursarea anticipată?',
          a: 'Pentru creditele cu dobândă variabilă, comisionul de rambursare anticipată este, conform OUG 50/2010, zero. Pentru creditele cu dobândă fixă, banca poate percepe un comision de maximum 1% (sau 0,5% dacă mai sunt sub un an până la final). Verifică în contract.',
        },
        {
          q: 'Cum se calculează dobânda economisită?',
          a: 'Se compară dobânda totală rămasă de plată înainte și după rambursarea anticipată. Suma plătită anticipat reduce soldul (principalul), deci dobânda care s-ar fi calculat pe acel sold dispare — de aici economia.',
        },
      ]}
    >
      <h2>Cum funcționează rambursarea anticipată</h2>
      <p>
        Când plătești anticipat o sumă, aceasta se duce integral în <strong>principal</strong> (soldul rămas), nu în
        dobândă. Cu un sold mai mic, dobânda viitoare scade. Ai două opțiuni: să <strong>reduci perioada</strong>{' '}
        (păstrând rata lunară, termini mai repede) sau să <strong>reduci rata</strong> (păstrând durata, plătești mai
        puțin pe lună).
      </p>

      <h2>Care variantă economisește mai mult</h2>
      <p>
        <strong>Reducerea perioadei</strong> economisește de obicei mai multă dobândă, pentru că scurtează durata în care
        se aplică dobânda. <strong>Reducerea ratei</strong> e mai bună pentru flexibilitatea bugetului lunar. Calculatorul
        afișează economia de dobândă pentru ambele.
      </p>

      <h2>Comisioane</h2>
      <p>
        La creditele cu dobândă variabilă, rambursarea anticipată este gratuită (OUG 50/2010). La cele cu dobândă fixă,
        comisionul este de maximum 1%. Verifică întotdeauna contractul de credit.
      </p>

      <p>
        Vezi și <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link> (util la creditul
        ipotecar) sau <Link href="/calculator/salariu/">calculatorul de salariu</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ pentru un credit cu rate egale (anuitate), fără comisioane. Cifrele exacte depind de
        contractul tău și de dobânda curentă.
      </p>
    </CalculatorLayout>
  );
}
