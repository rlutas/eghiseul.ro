import { describe, expect, it } from 'vitest';
import {
  SERVICES_WITHOUT_CERERE,
  computeCerereItems,
} from '@/lib/documents/cerere-items';

/**
 * Care comenzi au cerere de eliberare și care nu.
 *
 * Cazierul auto și certificatul de integritate se ridică DOAR pe împuternicire
 * (IPJ nu are formular de eliberare pentru ele). Înainte, cererea cădea pe
 * `templates/shared/cerere-eliberare-pf.docx` — formularul de cazier judiciar —
 * și genera un document greșit.
 */
describe('computeCerereItems', () => {
  const svc = (slug: string, name = slug) => ({ slug, name });

  it('întoarce cererea serviciului principal pentru cazier judiciar', () => {
    const items = computeCerereItems({
      services: svc('cazier-judiciar', 'Cazier Judiciar'),
      selected_options: [],
    });
    expect(items.map((i) => i.serviceSlug)).toEqual(['cazier-judiciar']);
  });

  it('NU întoarce nicio cerere pentru cazier auto', () => {
    expect(
      computeCerereItems({
        services: svc('cazier-auto', 'Cazier Auto'),
        selected_options: [
          { code: 'apostila_haga', option_name: 'Apostilă de la Haga' },
          { code: 'urgenta', option_name: 'Procesare Urgentă' },
        ],
      })
    ).toEqual([]);
  });

  it('NU întoarce nicio cerere pentru certificat de integritate', () => {
    expect(
      computeCerereItems({
        services: svc('certificat-integritate', 'Certificat de Integritate'),
        selected_options: [{ code: 'traducere', option_name: 'Traducere' }],
      })
    ).toEqual([]);
  });

  it('integritate + add-on cazier judiciar: doar cererea de cazier judiciar', () => {
    const items = computeCerereItems({
      services: svc('certificat-integritate', 'Certificat de Integritate'),
      selected_options: [
        { code: 'addon_cazier_judiciar', option_name: 'Cazier Judiciar' },
      ],
    });
    expect(items.map((i) => i.serviceSlug)).toEqual(['cazier-judiciar']);
  });

  it('comandă combinată de stare civilă păstrează o cerere per serviciu', () => {
    const items = computeCerereItems({
      services: svc('certificat-nastere', 'Certificat de Naștere'),
      selected_options: [
        { code: 'extras_multilingv', option_name: 'Extras Multilingv' },
      ],
    });
    expect(items.map((i) => i.serviceSlug)).toEqual([
      'certificat-nastere',
      'extras-multilingv-certificat-nastere',
    ]);
  });

  it('lista serviciilor fără cerere rămâne exact cea agreată', () => {
    expect([...SERVICES_WITHOUT_CERERE].sort()).toEqual([
      'cazier-auto',
      'certificat-integritate',
    ]);
  });
});
