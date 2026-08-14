import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';

/**
 * Antetul cabinetului pe împuternicirea avocațială.
 *
 * Regresie 2026-08-14 (semnalată de Raul): TOATE împuternicirile generate ieșeau
 * pe antetul vechi (text simplu, cu adresa veche „Str. Aurel Popp, nr.2").
 * Cauza: `loadTemplate()` caută `src/templates/<slug>/imputernicire.docx` și abia
 * apoi `shared/`, iar slug-urile reale din DB sunt
 * `cazier-judiciar-persoana-fizica` / `-juridica`, `cazier-auto`, `cazier-fiscal`,
 * `certificat-integritate` — niciunul nu are folder propriu. Folderul
 * `cazier-judiciar/` (singurul cu antetul nou) e folosit doar de slug-ul legacy.
 *
 * Testul ține antetul pe `shared/`, de unde îl iau toate serviciile reale.
 */
const TEMPLATES_DIR = join(process.cwd(), 'src', 'templates');

function readDocx(relPath: string) {
  return new PizZip(readFileSync(join(TEMPLATES_DIR, relPath)));
}

describe('imputernicire — antetul cabinetului', () => {
  it('shared/imputernicire.docx are antet cu imagini (logo + bloc de contact)', () => {
    const zip = readDocx('shared/imputernicire.docx');

    const header = zip.file('word/header1.xml')?.asText();
    expect(header, 'lipsește word/header1.xml').toBeTruthy();

    const rels = zip.file('word/_rels/header1.xml.rels')?.asText() || '';
    const images = [...rels.matchAll(/Target="media\/([^"]+)"/g)].map((m) => m[1]);
    expect(images.length, 'antetul nu conține imagini').toBeGreaterThanOrEqual(2);

    expect(header).toContain('BAROUL');
    // Adresa veche a cabinetului nu mai are ce căuta în antet.
    expect(header).not.toContain('Aurel Popp');
  });

  it('antetul din shared/ este identic cu cel din cazier-judiciar/', () => {
    const a = readDocx('shared/imputernicire.docx').file('word/header1.xml')?.asText();
    const b = readDocx('cazier-judiciar/imputernicire.docx')
      .file('word/header1.xml')
      ?.asText();
    expect(a).toBe(b);
  });

  it('placeholderele împuternicirii sunt intacte', () => {
    const doc = readDocx('shared/imputernicire.docx').file('word/document.xml')?.asText() || '';
    for (const tag of [
      '{{SERIE}}',
      '{{NRDELEGATIE}}',
      '{{DATAGENERAT}}',
      '{{CLIENT}}',
      '{{NRCONTRACT}}',
      '{{DATA}}',
      '{{INSTITUTIE}}',
      '{{MOTIV_FRAZA}}',
    ]) {
      expect(doc, `lipsește ${tag}`).toContain(tag);
    }
  });
});
