import { describe, expect, it } from 'vitest';
import PizZip from 'pizzip';
import { buildMotivCertificatVechi, generateDocument } from '@/lib/documents/generator';

/**
 * Cererea de duplicat (naștere / căsătorie) avea „PIERDUT" scris fix în șablon.
 * Clienții care au predat originalul unei autorități (dosar de cetățenie)
 * declarau astfel o pierdere — raport echipă 16.11.2026.
 */
const textOf = (buf: Buffer) => new PizZip(buf).file('word/document.xml')!.asText().replace(/<[^>]+>/g, '');

const ctx = (slug: string, reason?: string) =>
  ({
    order: { total_price: 0, service_price: 0, order_number: 'E-TEST', service_name: 'Test', service_slug: slug },
    company: {},
    lawyer: {},
    client: { name: 'Ion Test', email: 'test@example.com', phone: '+40740000000', old_certificate_reason: reason },
    document_numbers: { contract_number: 1 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe('cerere duplicat — ce s-a întâmplat cu vechiul certificat', () => {
  it('fiecare răspuns din formular are textul lui; fără răspuns rămâne PIERDUT', () => {
    expect(buildMotivCertificatVechi('predat_autoritati')).toBe('PREDAT ÎN ORIGINAL AUTORITĂȚILOR');
    expect(buildMotivCertificatVechi('pierdut')).toBe('PIERDUT');
    expect(buildMotivCertificatVechi('distrus')).toBe('DISTRUS');
    expect(buildMotivCertificatVechi('furat')).toBe('FURAT');
    expect(buildMotivCertificatVechi(undefined)).toBe('PIERDUT');
    expect(buildMotivCertificatVechi('')).toBe('PIERDUT');
  });

  it.each(['certificat-nastere', 'certificat-casatorie'])(
    '%s: „predat autorităților" nu mai apare pe cerere ca pierdut',
    (slug) => {
      const text = textOf(generateDocument(slug, 'cerere-eliberare-pf', ctx(slug, 'predat_autoritati')));
      expect(text).toContain('PREDAT ÎN ORIGINAL AUTORITĂȚILOR');
      expect(text).not.toContain('PIERDUT');
      expect(text).not.toContain('{{');
    },
  );

  it.each(['certificat-nastere', 'certificat-casatorie'])('%s: „pierdut" și comenzile vechi rămân PIERDUT', (slug) => {
    expect(textOf(generateDocument(slug, 'cerere-eliberare-pf', ctx(slug, 'pierdut')))).toContain('PIERDUT');
    expect(textOf(generateDocument(slug, 'cerere-eliberare-pf', ctx(slug)))).toContain('PIERDUT');
  });
});
