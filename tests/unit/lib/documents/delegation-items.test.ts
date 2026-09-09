import { describe, it, expect } from 'vitest';
import {
  computeDelegationItems,
  resolveComposedDelegationSlug,
  DELEGATION_REQUIRING_OPTION_CODES,
} from '@/lib/documents/delegation-items';

describe('computeDelegationItems', () => {
  it('main service only when there are no qualifying options', () => {
    const items = computeDelegationItems({
      services: { slug: 'cazier-judiciar', name: 'Cazier Judiciar' },
      selected_options: [{ code: 'urgenta', option_name: 'Procesare Urgentă' }],
    });
    expect(items.map((i) => i.serviceType)).toEqual(['cazier-judiciar']);
  });

  it('allocates a delegation for the cazier judiciar add-on (E-260907-AMV62)', () => {
    const items = computeDelegationItems({
      services: { slug: 'certificat-integritate', name: 'Certificat de Integritate' },
      selected_options: [
        { code: 'urgenta', option_name: 'Procesare Urgentă' },
        { code: 'addon_cazier_judiciar', option_name: 'Cazier Judiciar (adaugă în aceeași comandă)' },
      ],
    });
    expect(items.map((i) => i.serviceType)).toEqual([
      'certificat-integritate',
      'addon_cazier_judiciar',
    ]);
  });

  it('resolves certificat_pachet to the certificate slug (E-260907-EJZM7)', () => {
    const items = computeDelegationItems({
      services: {
        slug: 'extras-multilingv-certificat-nastere',
        name: 'Extras Multilingv Certificat de Naștere',
      },
      selected_options: [
        { code: 'certificat_pachet', option_name: 'Adaugă și Certificatul de Naștere (pachet)' },
      ],
    });
    expect(items.map((i) => i.serviceType)).toEqual([
      'extras-multilingv-certificat-nastere',
      'certificat-nastere',
    ]);
  });

  it('resolves extras_multilingv to the extras slug', () => {
    const items = computeDelegationItems({
      services: { slug: 'certificat-casatorie', name: 'Certificat de Căsătorie' },
      selected_options: [{ code: 'extras_multilingv', option_name: 'Extras Multilingv' }],
    });
    expect(items.map((i) => i.serviceType)).toEqual([
      'certificat-casatorie',
      'extras-multilingv-certificat-casatorie',
    ]);
  });

  it('never allocates two delegations for the same document', () => {
    const items = computeDelegationItems({
      services: { slug: 'certificat-nastere', name: 'Certificat de Naștere' },
      selected_options: [
        { code: 'extras_multilingv', option_name: 'Extras Multilingv' },
        { code: 'extras_multilingv', option_name: 'Extras Multilingv' },
      ],
    });
    expect(items).toHaveLength(2);
  });

  it('keeps bundled options on their own bundled key', () => {
    const items = computeDelegationItems({
      services: { slug: 'cazier-judiciar', name: 'Cazier Judiciar' },
      selected_options: [
        { code: 'apostila_haga', option_name: 'Apostilă de la Haga' },
        {
          option_name: 'Apostilă de la Haga (Certificat Integritate)',
          bundled_for: {
            parent_option_id: 'p1',
            bundled_service_slug: 'certificat-integritate',
            bundled_option_code: 'apostila_haga',
          },
        },
      ],
    });
    expect(items.map((i) => i.serviceType)).toEqual([
      'cazier-judiciar',
      'apostila_haga',
      'bundled:p1:certificat-integritate:apostila_haga',
    ]);
  });

  it('composed codes are NOT in the flat allow-list (they need the main slug)', () => {
    expect(DELEGATION_REQUIRING_OPTION_CODES.has('certificat_pachet')).toBe(false);
    expect(DELEGATION_REQUIRING_OPTION_CODES.has('extras_multilingv')).toBe(false);
    expect(resolveComposedDelegationSlug('certificat_pachet', 'cazier-judiciar')).toBeNull();
    expect(resolveComposedDelegationSlug('extras_multilingv', 'certificat-celibat')).toBeNull();
  });
});
