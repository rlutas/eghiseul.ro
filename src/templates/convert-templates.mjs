/**
 * One-time script: Convert user-provided DOCX templates to our naming convention.
 *
 * IMPORTANT: Copies the original DOCX files byte-for-byte, then surgically replaces
 * ONLY word/document.xml inside the zip. This preserves all formatting, images, styles.
 *
 * Run with: node src/templates/convert-templates.mjs
 */

import PizZip from 'pizzip';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const downloads = join(homedir(), 'Downloads');

/**
 * Copy original DOCX, then replace only word/document.xml with modified XML.
 * Uses the `zip` CLI to do an in-place update, preserving all other entries.
 */
function processDocx(inputPath, outputPaths, xmlTransform) {
  // Read the original to extract and modify XML
  const buf = readFileSync(inputPath);
  const zip = new PizZip(buf);
  let xml = zip.file('word/document.xml').asText();

  // Apply the transform
  xml = xmlTransform(xml);

  // Write modified XML to a temp file
  const tmpDir = join(tmpdir(), 'docx-convert-' + Date.now());
  mkdirSync(join(tmpDir, 'word'), { recursive: true });
  writeFileSync(join(tmpDir, 'word', 'document.xml'), xml, 'utf-8');

  for (const outPath of outputPaths) {
    mkdirSync(dirname(outPath), { recursive: true });
    // Copy original DOCX as-is (preserves all formatting, images, styles)
    copyFileSync(inputPath, outPath);
    // Replace ONLY word/document.xml inside the copied DOCX
    execSync(`cd "${tmpDir}" && zip -q "${outPath}" word/document.xml`);
    console.log(`  -> ${outPath}`);
  }

  // Cleanup temp
  execSync(`rm -rf "${tmpDir}"`);

  return buf; // return original buffer for verification
}

// ──────────────────────────────────────────────────────────────
// 1. Imputernicire (TEMPLATE DELEGATIE NOUA 2024 (1).docx)
// ──────────────────────────────────────────────────────────────
console.log('\n=== Processing: imputernicire ===');
const impPaths = [
  join(__dirname, 'cazier-judiciar', 'imputernicire.docx'),
  join(__dirname, 'shared', 'imputernicire.docx'),
];
processDocx(
  join(downloads, 'TEMPLATE DELEGATIE NOUA 2024 (1).docx'),
  impPaths,
  (xml) => {
    xml = xml.replaceAll('{{SERIE}}', '{{IMPUTERNICIRE_SERIA}}');
    xml = xml.replaceAll('{{NRDELEGATIE}}', '{{IMPUTERNICIRE_NR}}');
    xml = xml.replaceAll('{{DATAGENERAT}}', '{{DATA}}');
    xml = xml.replaceAll('{{MOTIV}}', '{{MOTIV_SOLICITARE}}');
    return xml;
  }
);

// ──────────────────────────────────────────────────────────────
// 2. Cerere eliberare PF (cere_cazier_PF_template (1).docx)
// ──────────────────────────────────────────────────────────────
console.log('\n=== Processing: cerere-eliberare-pf ===');
const pfPaths = [
  join(__dirname, 'cazier-judiciar', 'cerere-eliberare-pf.docx'),
  join(__dirname, 'shared', 'cerere-eliberare-pf.docx'),
];
processDocx(
  join(downloads, 'cere_cazier_PF_template (1).docx'),
  pfPaths,
  (xml) => {
    xml = xml.replaceAll('{{NUME}}', '{{CLIENT_LASTNAME}}');
    xml = xml.replaceAll('{{PRENUME}}', '{{CLIENT_FIRSTNAME}}');
    xml = xml.replaceAll('{{NUMEANTERIOR}}', '{{CLIENT_PREVIOUS_NAME}}');
    xml = xml.replaceAll('{{PRENUMETATA}}', '{{CLIENT_FATHER_NAME}}');
    xml = xml.replaceAll('{{PRENUMEMAMA}}', '{{CLIENT_MOTHER_NAME}}');
    xml = xml.replaceAll('{{ANULNASTERI}}', '{{CLIENT_BIRTH_YEAR}}');
    xml = xml.replaceAll('{{LUNANASTERI}}', '{{CLIENT_BIRTH_MONTH}}');
    xml = xml.replaceAll('{{ZIUANASTERI}}', '{{CLIENT_BIRTH_DAY}}');
    xml = xml.replaceAll('{{JUDETULNASTERI}}', '{{CLIENT_BIRTH_COUNTY}}');
    xml = xml.replaceAll('{{JUDETUL}}', '{{CLIENT_COUNTY}}');
    xml = xml.replaceAll('{{ORAS}}', '{{CLIENT_CITY}}');
    xml = xml.replaceAll('{{STRADA}}', '{{CLIENT_STREET}}');
    xml = xml.replaceAll('{{NR}}', '{{CLIENT_STREET_NR}}');
    xml = xml.replaceAll('{{BL}}', '{{CLIENT_BUILDING}}');
    xml = xml.replaceAll('{{AP}}', '{{CLIENT_APARTMENT}}');
    xml = xml.replaceAll('{{SERIE}}', '{{CLIENT_CI_SERIES}}');
    xml = xml.replaceAll('{{NUMAR}}', '{{CLIENT_CI_NUMBER}}');
    xml = xml.replaceAll('{{CNP}}', '{{CLIENT_CNP}}');
    xml = xml.replaceAll('{{MOTIV}}', '{{MOTIV_SOLICITARE}}');
    return xml;
  }
);

// ──────────────────────────────────────────────────────────────
// 3. Cerere eliberare PJ (cerere_cazier_PJ_template.docx)
// ──────────────────────────────────────────────────────────────
console.log('\n=== Processing: cerere-eliberare-pj ===');
const pjPaths = [
  join(__dirname, 'cazier-judiciar', 'cerere-eliberare-pj.docx'),
  join(__dirname, 'shared', 'cerere-eliberare-pj.docx'),
];
processDocx(
  join(downloads, 'cerere_cazier_PJ_template.docx'),
  pjPaths,
  (xml) => {
    // Rename placeholders
    xml = xml.replaceAll('{{NUMEFIRMA}}', '{{CLIENT_COMPANY_NAME}}');
    xml = xml.replaceAll('{{CODINMATRICULARE}}', '{{CLIENT_COMPANY_REG}}');
    xml = xml.replaceAll('{{CUIFIRMA}}', '{{CLIENT_CUI}}');
    xml = xml.replaceAll('{{LOCALITATEA}}', '{{CLIENT_COMPANY_CITY}}');
    xml = xml.replaceAll('{{JUDET}}', '{{CLIENT_COMPANY_COUNTY}}');
    xml = xml.replaceAll('{{STRADA}}', '{{CLIENT_COMPANY_STREET}}');
    xml = xml.replaceAll('{{NUMAR}}', '{{CLIENT_COMPANY_NR}}');
    xml = xml.replaceAll('{{BL}}', '{{CLIENT_COMPANY_BL}}');
    xml = xml.replaceAll('{{AP}}', '{{CLIENT_COMPANY_AP}}');
    xml = xml.replaceAll('{{MOTIVUL}}', '{{MOTIV_SOLICITARE}}');

    // Replace hardcoded lawyer data in text nodes
    xml = xml.replaceAll('>TARTA <', '>{{LAWYER_NAME}} <');
    xml = xml.replaceAll('>ANA-GABRIELA <', '> <');
    xml = xml.replaceAll('>SM<', '>{{LAWYER_CI_SERIES}}<');
    xml = xml.replaceAll('>833828<', '>{{LAWYER_CI_NUMBER}}<');

    // Replace CNP: "CNP|" followed by individual digit runs → "CNP {{LAWYER_CNP}}"
    xml = xml.replace('>CNP|<', '>CNP {{LAWYER_CNP}}<');

    // Remove individual digit+pipe runs after the CNP placeholder
    const cnpPos = xml.indexOf('{{LAWYER_CNP}}');
    if (cnpPos > -1) {
      const afterCnpTag = xml.indexOf('</w:t>', cnpPos);
      const paragraphEnd = xml.indexOf('</w:p>', afterCnpTag);
      const before = xml.substring(0, afterCnpTag + '</w:t>'.length);
      const cnpSection = xml.substring(afterCnpTag + '</w:t>'.length, paragraphEnd);
      const after = xml.substring(paragraphEnd);

      // Remove <w:r> elements containing single digits or pipes
      let cleaned = cnpSection;
      cleaned = cleaned.replace(/<w:r><w:rPr>.*?<\/w:rPr><w:t xml:space="preserve">[\d|][\d| ]*<\/w:t><\/w:r>/g, '');
      cleaned = cleaned.replace(/<w:r><w:t xml:space="preserve">[\d|][\d| ]*<\/w:t><\/w:r>/g, '');
      xml = before + cleaned + after;
    }

    return xml;
  }
);

// ──────────────────────────────────────────────────────────────
// Verification
// ──────────────────────────────────────────────────────────────
console.log('\n=== Verification ===');
for (const [name, path] of [
  ['imputernicire', impPaths[0]],
  ['cerere-eliberare-pf', pfPaths[0]],
  ['cerere-eliberare-pj', pjPaths[0]],
]) {
  const buf = readFileSync(path);
  const z = new PizZip(buf);
  const x = z.file('word/document.xml').asText();
  const placeholders = x.match(/\{\{[^}]+\}\}/g) || [];
  console.log(`\n${name}: ${[...new Set(placeholders)].join(', ')}`);

  const original = x.match(/\{\{(SERIE|NRDELEGATIE|DATAGENERAT|NUME|PRENUME|NUMEANTERIOR|PRENUMETATA|PRENUMEMAMA|ANULNASTERI|LUNANASTERI|ZIUANASTERI|JUDETULNASTERI|JUDETUL|ORAS|NR|BL|AP|NUMAR|MOTIV|NUMEFIRMA|CODINMATRICULARE|CUIFIRMA|LOCALITATEA|JUDET|MOTIVUL)\}\}/g);
  if (original) {
    console.log(`  WARNING: Leftover original placeholders: ${original.join(', ')}`);
  }

  const text = x.replace(/<[^>]+>/g, '');
  if (text.includes('TARTA') || text.includes('ANA-GABRIELA') || text.includes('833828')) {
    console.log('  WARNING: Hardcoded lawyer data still present!');
  }
}

console.log('\nDone! Templates converted (original formatting preserved).');
