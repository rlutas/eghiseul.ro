/**
 * Script to create initial DOCX templates with placeholders.
 * Run with: node src/templates/create-templates.mjs
 *
 * Creates template DOCX files in src/templates/cazier-judiciar/
 * These are minimal templates - replace with the actual formatted templates.
 */
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createTemplate(content, outputPath) {
  // Create a minimal DOCX with the content as placeholder text
  // We create a very basic DOCX structure
  const zip = new PizZip();

  // Minimal DOCX structure
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // Convert content to DOCX paragraphs
  const paragraphs = content.split('\n').map(line => {
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
  }).join('');

  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
  </w:body>
</w:document>`);

  const buf = zip.generate({ type: 'nodebuffer' });
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buf);
  console.log(`Created: ${outputPath}`);
}

// Contract Prestari Servicii template
const contractPrestari = `Contract Prestari Servicii NR. {{NRCONTRACT}} {{NUMECLIENT}}

I. PARTILE CONTRACTANTE
1.1. {{NUMEFIRMAN}} cu sediul in judetul {{JUDETFIRMAN}}, com. {{COMUNAFIRMA}}, pe strada {{STRADASINRFIRMA}}, avand codul unic de inregistrare nr. {{CUIFIRMAN}}, inregistrata la Oficiul Registrului Comertului sub nr {{NRORDINEFIRMAN}}, contul nr. {{IBANFIRMAN}} deschis la Banca Transilvania, in calitate de "Prestator" si
1.2 Beneficiarul {{NUMECLIENT}} legitimat prin CNP/CUI: {{CNP/CUI}} cu adresa de email: {{EMAIL}}, telefon: {{CLIENT_PHONE}} denumit/a in cele ce urmeaza "Beneficiarul".

II. OBIECTUL CONTRACTULUI
2.1. Prestatorul asigura Beneficiarului suport administrativ, tehnic si corespondenta in ceea ce priveste predarea documentatiei necesare pentru eliberarea {{NUMESERVICIU}} in raport cu comanda formulata in acest sens de catre Beneficiar.
2.2. Pentru indeplinirea in mod corespunzator a obiectului contractului, Prestatorul va analiza toate informatiile si documentele comunicate de catre Beneficiar.

IV. PLATA
4.1. Pentru serviciile prestate in temeiul prezentului Contract, Beneficiarul se obliga sa plateasca Prestatorului suma de lei {{TOTALPLATA}}. Suma va putea fi platita prin transfer bancar sau online.

Intocmit si incheiat la distanta pe data de {{DATACOMANDA}}.
Subsemnatul/a {{NUMECLIENT}}, avand adresa de e-mail {{EMAIL}}, in calitate de Beneficiar, cu numarul comenzii {{NRCOMANDA}}.
Data, ora si minutul generarii acestui contract: {{GENERATED_AT}}.

PRESTATOR                    BENEFICIAR
{{NUMEFIRMAN}}               {{NUMECLIENT}}`;

// Contract Asistenta Juridica template
const contractAsistenta = `CONTRACT DE ASISTENTA JURIDICA Nr. {{NRCONTRACT}} din data de {{DATA}}

Incheiat intre:
1. Denumirea formei de exercitare a profesiei {{LAWYER_CABINET}}, cu sediul profesional situat in {{LAWYER_ADDRESS}}, avand C.I.F. {{LAWYER_CIF}} prin avocat titular {{LAWYER_NAME}}, in calitate de avocati pe de o parte si
2. Domnul/Doamna/Societatea {{NUMECLIENT}} legitimat prin CNP/CUI: {{CNP/CUI}} cu adresa de email: {{EMAIL}} in calitate de CLIENT/A pe de alta parte.

ARTICOLUL 1 - Obiectul contractului
1.1 Obiectul contractului: reprezentarea clientului in fata autoritatilor competente in vederea solicitarii si ridicarii {{NUMESERVICIU}}.

Art. 2. - Onorariu
2.1. Onorariul este de {{LAWYER_FEE}} RON si se plateste in contul IBAN {{IBANFIRMAN}}, deschis la Banca Transilvania pe numele Societatii {{NUMEFIRMAN}}.

Contractul se incheie pe durata obtinerii {{NUMESERVICIU}}.
Incheiat via e-mail, astazi {{DATA}}.

CABINET DE AVOCAT            CLIENT/REPREZENTANT
{{LAWYER_NAME}}              {{NUMECLIENT}}

NOTA DE INFORMARE
{{LAWYER_CABINET}}, va aducem la cunostinta urmatoarele:
Respectam dispozitiile legale privitoare la protectia datelor cu caracter personal.
Subscrisa {{NUMECLIENT}} in calitate de CLIENT/A am luat cunostinta si am inteles deplin informarea, azi data de {{DATASIORA}}.`;

// Imputernicire Avocatiala template
const imputernicire = `IMPUTERNICIRE AVOCATIALA
SERIA: {{IMPUTERNICIRE_SERIA}} NR: {{IMPUTERNICIRE_NR}} / {{DATA}}

{{LAWYER_CABINET}} se imputerniceste de catre clientul/a {{NUMECLIENT}} in baza contractului de asistenta juridica Seria: {{IMPUTERNICIRE_SERIA}} Nr: {{NRCONTRACT}} / {{DATA}} sa exercite urmatoarele activitati: sa se prezinte la autoritatile competente, in vederea ridicarii {{NUMESERVICIU}}.

Atest identitatea partilor, continutul si data
contractului de asistenta juridica in baza
caruia s-a eliberat imputernicirea.

CLIENT/REPREZENTANT
{{NUMECLIENT}}

{{LAWYER_CABINET}}`;

// Cerere Eliberare Cazier PF template
const cererePF = `CERERE
pentru eliberarea certificatului de cazier judiciar

Subsemnatul/a {{NUMECLIENT}}, CNP {{CLIENT_CNP}}, posesor/posesoare al/a actului de identitate seria {{CLIENT_CI_SERIES}} nr. {{CLIENT_CI_NUMBER}}, cu domiciliul in {{CLIENT_ADDRESS}}.

Solicit eliberarea unui certificat de cazier judiciar, acesta fiindu-mi necesar pentru {{MOTIV_SOLICITARE}}.

Declar pe proprie raspundere ca nu am avut si nici nu am folosit alte nume si date de identificare in afara de cele inscrise in prezenta cerere.

Semnatura
Data {{DATA}}`;

// Cerere Eliberare Cazier PJ template
const cererePJ = `CERERE
pentru eliberarea certificatului de cazier judiciar pentru persoana juridica

Subscrisa (denumirea): {{CLIENT_COMPANY_NAME}} numar de ordine in Registrul Comertului {{CLIENT_COMPANY_REG}} codul unic de inregistrare {{CLIENT_CUI}}, cu sediul in: {{CLIENT_COMPANY_ADDRESS}}.

Reprezentant legal/persoana imputernicita: nume: {{LAWYER_NAME}} poseda actul de identitate seria {{CLIENT_CI_SERIES}} nr. {{CLIENT_CI_NUMBER}} CNP {{CLIENT_CNP}}.

Solicit eliberarea unui certificat de cazier judiciar, acesta fiindu-mi necesar pentru {{MOTIV_SOLICITARE}}.

Semnatura Reprezentantului legal
Data {{DATA}}`;

// Create all templates
const baseDir = join(__dirname, 'cazier-judiciar');
createTemplate(contractPrestari, join(baseDir, 'contract-prestari.docx'));
createTemplate(contractAsistenta, join(baseDir, 'contract-asistenta.docx'));
createTemplate(imputernicire, join(baseDir, 'imputernicire.docx'));
createTemplate(cererePF, join(baseDir, 'cerere-eliberare-pf.docx'));
createTemplate(cererePJ, join(baseDir, 'cerere-eliberare-pj.docx'));

console.log('\nAll templates created successfully!');
console.log('NOTE: These are minimal templates. Replace with properly formatted DOCX files.');
