import { describe, expect, it } from 'vitest';
import {
  buildWarmupHtml,
  buildWarmupSubject,
  buildWarmupText,
  serviceLabels,
  warmupCtaUrl,
} from '@/lib/email/templates/warmup-reengagement';
import { isLoyalContact } from '@/lib/coupons/loyalty';

const unsubscribeUrl = 'https://eghiseul.ro/api/contacts/unsubscribe?token=t';
const coupon = { code: 'FIDEL-ABCD2345', discountPercent: 10, validUntil: '2026-10-26T07:00:00Z' };

describe('warmup re-engagement email', () => {
  it('names every earlier service once, in order', () => {
    expect(serviceLabels(['cazier-judiciar', 'cazier-judiciar-persoana-fizica', 'certificat-constatator'])).toEqual([
      'cazier judiciar',
      'certificat constatator',
    ]);
  });

  it('tells a platform customer what they obtained through us', () => {
    const text = buildWarmupText({ serviceSlugs: ['certificat-constatator', 'extras-carte-funciara'], isCustomer: true, unsubscribeUrl });
    expect(text).toContain('Ai obținut prin noi certificat constatator și extras de carte funciară.');
  });

  it('does not claim an old-site lead bought anything', () => {
    const text = buildWarmupText({ serviceSlugs: ['cazier-judiciar'], isCustomer: false, unsubscribeUrl });
    expect(text).toContain('Ai apelat la noi pentru cazier judiciar.');
    expect(text).not.toContain('obținut');
  });

  it('puts the loyalty coupon in subject, body and the wizard link', () => {
    const input = { firstName: 'Ana', serviceSlugs: ['certificat-constatator'], isCustomer: true, coupon, unsubscribeUrl };
    expect(buildWarmupSubject(input)).toBe('Ana, ai 10% reducere pentru că ne-ai ales de mai multe ori');
    expect(buildWarmupHtml(input)).toContain('FIDEL-ABCD2345');
    expect(buildWarmupText(input)).toContain('Valabil până la 26.10.2026');
    const url = new URL(warmupCtaUrl(input));
    expect(url.pathname).toBe('/comanda/certificat-constatator/');
    expect(url.searchParams.get('coupon')).toBe('FIDEL-ABCD2345');
    expect(url.searchParams.get('utm_campaign')).toBe('warmup-fidel');
  });

  it('falls back to the services list without a known service', () => {
    const url = new URL(warmupCtaUrl({ serviceSlugs: [], coupon: null }));
    expect(url.pathname).toBe('/servicii/');
    expect(url.searchParams.get('coupon')).toBeNull();
  });
});

describe('isLoyalContact', () => {
  it('needs two orders or two services', () => {
    expect(isLoyalContact({ orders_count: 1, services: ['cazier-judiciar'] })).toBe(false);
    expect(isLoyalContact({ orders_count: 2, services: ['cazier-judiciar'] })).toBe(true);
    expect(isLoyalContact({ orders_count: 0, services: ['cazier-judiciar', 'cazier-fiscal'] })).toBe(true);
  });
});

describe('warm-up email for buyers from a sister site', () => {
  const input = {
    firstName: 'Ana',
    serviceSlugs: ['cazier-judiciar'],
    isCustomer: true,
    purchasedOn: 'cazierjudiciaronline' as const,
    unsubscribeUrl: 'https://eghiseul.ro/u',
  };

  it('names the site they bought from', () => {
    expect(buildWarmupText(input)).toContain('Ai obținut prin cazierjudiciaronline.com cazier judiciar.');
    expect(buildWarmupHtml(input)).toContain('ai comandat pe cazierjudiciaronline.com');
    expect(buildWarmupText({ ...input, purchasedOn: 'ecazier' })).toContain('Ai obținut prin ecazier.ro');
  });

  it('does not claim they knew eGhișeul or saw it rebuilt', () => {
    const all = buildWarmupSubject(input) + buildWarmupHtml(input) + buildWarmupText(input);
    expect(all).not.toContain('rescris');
    expect(all).not.toContain('s-a schimbat');
    expect(all).not.toContain('prin noi');
  });

  it('keeps the existing text when the site is not set', () => {
    const { purchasedOn: _unused, ...own } = input;
    expect(buildWarmupSubject(own)).toBe('Ana, eGhișeul.ro s-a schimbat de când ne-ai scris');
    expect(buildWarmupText(own)).toContain('De atunci am rescris toată platforma.');
  });
});

describe('warm-up email by service', () => {
  const base = { firstName: 'Ana', isCustomer: true, unsubscribeUrl: 'https://eghiseul.ro/u' };

  it('promises minutes for the constatator, hedged and only for the basic one', () => {
    const input = { ...base, serviceSlugs: ['certificat-constatator'] };
    expect(buildWarmupSubject(input)).toBe('Ana, certificat constatator în câteva minute, oricând ai nevoie');
    expect(buildWarmupText(input)).toContain('Certificatul constatator de bază ajunge de obicei pe email în câteva minute');
    expect(buildWarmupHtml(input)).toContain('/comanda/certificat-constatator/');
  });

  it('sends the constatator buyer to the constatator form, whatever the slug order', () => {
    const input = { ...base, serviceSlugs: ['cazier-judiciar', 'certificat-constatator'] };
    expect(buildWarmupHtml(input)).toContain('/comanda/certificat-constatator/');
  });

  it('lists the surveyor services for land book buyers, with links', () => {
    const input = { ...base, serviceSlugs: ['extras-carte-funciara'] };
    const html = buildWarmupHtml(input);
    expect(buildWarmupSubject(input)).toContain('extras de carte funciară și alte acte pentru imobil');
    expect(html).toContain('prin topograf autorizat');
    expect(html).toContain('/servicii/certificat-sarcini/');
    expect(html).toContain('utm_campaign=warmup-imobiliare');
    expect(buildWarmupText(input)).toContain('- certificat de sarcini: https://eghiseul.ro/servicii/certificat-sarcini/');
  });

  it('shows neither block to other buyers', () => {
    const input = { ...base, serviceSlugs: ['cazier-judiciar'] };
    const all = buildWarmupHtml(input) + buildWarmupText(input);
    expect(all).not.toContain('topograf');
    expect(all).not.toContain('Certificatul constatator de bază');
  });

  it('keeps the coupon subject for loyal buyers', () => {
    const input = {
      ...base,
      serviceSlugs: ['certificat-constatator'],
      coupon: { code: 'FIDEL-X', discountPercent: 10, validUntil: '2026-12-01T00:00:00Z' },
    };
    expect(buildWarmupSubject(input)).toContain('10% reducere');
  });
});
