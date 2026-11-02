import { describe, it, expect } from 'vitest';
import { toPublicServiceFact, formatLei, type PublicServiceFacts } from '@/lib/services/public-facts';
import { buildHomepageFaqItems, toFaqSchemaPairs } from '@/components/home/faq-data';

const row = (slug: string, price: string, display?: string, urgent?: string) => ({
  slug,
  base_price: price as unknown as number,
  estimated_days: 5,
  urgent_days: 2,
  processing_config: {
    ...(display ? { estimated_days_display: display } : {}),
    ...(urgent ? { urgent_days_display: urgent } : {}),
  } as never,
});

describe('toPublicServiceFact', () => {
  it('uses the same term text as the service pages (processing_config display)', () => {
    const f = toPublicServiceFact(row('cazier-judiciar', '198.00', '3-5 zile lucrătoare', '1-2 zile lucrătoare'));
    expect(f).toMatchObject({
      href: '/servicii/cazier-judiciar-online/',
      priceWithVat: 198,
      term: '3-5 zile lucrătoare',
      urgentTerm: '1-2 zile lucrătoare',
    });
  });

  it('states nothing for price-0 entries (rovinieta is an affiliate link)', () => {
    expect(toPublicServiceFact(row('rovinieta', '0.00'))).toBeUndefined();
  });

  it('formats lei with a decimal comma', () => {
    expect(formatLei(198)).toBe('198');
    expect(formatLei(73.55)).toBe('73,55');
  });
});

describe('homepage FAQ terms', () => {
  const facts: PublicServiceFacts = {
    'cazier-judiciar': toPublicServiceFact(row('cazier-judiciar', '198', '3-5 zile lucrătoare', '1-2 zile lucrătoare')),
    'extras-carte-funciara': toPublicServiceFact(row('extras-carte-funciara', '89', '2 zile lucrătoare')),
    'certificat-constatator': toPublicServiceFact(row('certificat-constatator', '89', 'câteva minute (24/7)')),
  };

  it('takes every term from the services row, no hardcoded 24-48 / instant', () => {
    const text = toFaqSchemaPairs(buildHomepageFaqItems(facts)).map((f) => f.answer).join('\n');
    expect(text).not.toMatch(/24-48|24–48|instant/i);
    expect(text).toContain('3-5 zile lucrătoare');
    expect(text).toContain('1-2 zile lucrătoare');
    expect(text).toContain('extras de carte funciară în 2 zile lucrătoare');
    expect(text).toContain('certificat constatator ONRC în câteva minute (24/7)');
  });

  it('leaves the term out when the DB lookup failed, instead of guessing', () => {
    const text = toFaqSchemaPairs(buildHomepageFaqItems({})).map((f) => f.answer).join('\n');
    expect(text).not.toMatch(/\d+-\d+ zile|24-48|instant|minute/);
  });

  it('never pairs „oficial" with documents (Google Ads policy)', () => {
    const items = buildHomepageFaqItems(facts);
    const text = items.map((f) => `${f.question} ${f.plain}`).join('\n');
    expect(text).not.toMatch(/oficial/i);
  });
});
