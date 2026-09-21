import { describe, expect, it } from 'vitest';
import { coreDocs, guideHref, parseAnswerFooter, questionTerms, renderDocsForPrompt, retrievedDocs, visibleAnswerPrefix } from '@/lib/knowledge/chat-context';
import { indexDoc } from '@/lib/knowledge/search';

// Contextul chatbotului: nucleul mereu prezent, documentele relevante peste,
// fără duplicate, tăiate ca să nu explodeze costul.

const index = [
  indexDoc('admin/servicii/README.md', '# Catalog\n\ncazier fiscal 198 lei', 'Catalog'),
  indexDoc('admin/statusuri-comenzi.md', '# Statusuri\n\nasteptare plata', 'Statusuri'),
  indexDoc('admin/pagina-comenzii.md', '# Pagina\n\nbutoane', 'Pagina'),
  indexDoc('admin/servicii/caziere-si-integritate.md', '# Caziere\n\ncazier fiscal ANAF 1-3 zile', 'Caziere'),
  indexDoc('admin/plata-transfer-bancar.md', '# Transfer\n\nasteptare plata confirma plata', 'Transfer'),
  indexDoc('admin/servicii/imobiliare-topograf.md', '# Topograf\n<!-- audienta: colaborator -->\n\nextras cf mircea', 'Topograf'),
  indexDoc('technical/specs/x.md', '# Spec\n\ncazier fiscal intern', 'Spec'),
];

describe('coreDocs', () => {
  it('echipa: catalog + statusuri + pagina comenzii, în ordinea asta', () => {
    expect(coreDocs(index, 'team').map((d) => d.slug)).toEqual(['admin/servicii', 'admin/statusuri-comenzi', 'admin/pagina-comenzii']);
  });
  it('colaboratorul: doar fișele lui existente', () => {
    expect(coreDocs(index, 'collaborator').map((d) => d.slug)).toEqual(['admin/servicii/imobiliare-topograf']);
  });
});

describe('retrievedDocs', () => {
  it('găsește documentele relevante din corpusul echipei, fără nucleu și fără specs', () => {
    const docs = retrievedDocs(index, 'cazier fiscal', 'team');
    expect(docs.map((d) => d.slug)).toEqual(['admin/servicii/caziere-si-integritate']);
  });
  it('colaboratorul nu primește documente ale echipei', () => {
    expect(retrievedDocs(index, 'asteptare plata', 'collaborator')).toEqual([]);
  });
  it('taie documentele lungi și o spune', () => {
    const big = [indexDoc('admin/lung.md', '# Lung\n\n' + 'cuvant '.repeat(5000), 'Lung')];
    const [d] = retrievedDocs(big, 'cuvant', 'team', { maxChars: 100 });
    expect(d.truncated).toBe(true);
    expect(d.text).toContain('document tăiat aici');
    expect(d.text.length).toBeLessThan(200);
  });
  it('întrebare în limbaj natural: nu cere toate cuvintele, potrivește prefixe', () => {
    // „cât durează … la București” — fișa nu conține „dureaza”, dar are „durata”, „nastere”, „bucuresti”.
    const docs = [
      indexDoc('admin/servicii/stare-civila.md', '# Acte de stare civilă\n\nCertificatul de naștere: durata depinde de oficiu; București 30-45 zile lucrătoare.', 'Acte de stare civilă'),
      indexDoc('admin/chatbot.md', '# Chatbot\n\nExemplu: „cât durează certificatul de naștere la București?”', 'Chatbot'),
      indexDoc('changelog/2026-08-05-termene.md', '# Termene stare civilă\n\nBucurești 30-45 zile.', 'Termene stare civilă'),
    ];
    const r = retrievedDocs(docs, 'cat dureaza certificatul de nastere la bucuresti', 'team');
    expect(r.map((d) => d.slug)).toContain('admin/servicii/stare-civila');
    expect(r.length).toBeGreaterThanOrEqual(2);
  });
  it('„cum dau refund la cazier” găsește procedura de refund', () => {
    const docs = [
      indexDoc('admin/anulare-refund-70.md', '# Anulare în 30 min: refund 70%\n\n„Procesează refund” face refundul Stripe.', 'Anulare: refund 70%'),
      indexDoc('admin/altceva.md', '# Altceva\n\ncazier judiciar', 'Altceva'),
    ];
    expect(retrievedDocs(docs, 'cum dau refund la cazier ?', 'team')[0].slug).toBe('admin/anulare-refund-70');
    expect(questionTerms('cum dau refund la cazier ?')).toEqual(['refund', 'cazier']);
  });
  it('respectă limita de documente', () => {
    const many = Array.from({ length: 10 }, (_, i) => indexDoc(`admin/d${i}.md`, `# D${i}\n\nfactura oblio`, `D${i}`));
    expect(retrievedDocs(many, 'factura', 'team', { max: 3 })).toHaveLength(3);
  });
});

describe('renderDocsForPrompt / guideHref', () => {
  it('delimitează fiecare document cu slug și titlu', () => {
    const out = renderDocsForPrompt(coreDocs(index, 'team').slice(0, 1));
    expect(out).toContain('<document slug="admin/servicii" titlu="Catalog">');
    expect(out).toContain('</document>');
  });
  it('linkul spre ghid depinde de audiență', () => {
    expect(guideHref('admin/servicii', 'team')).toBe('/admin/ghid/admin/servicii/');
    expect(guideHref('admin/servicii/imobiliare-topograf', 'collaborator')).toBe('/colaborator/ghid/admin/servicii/imobiliare-topograf/');
  });
});

describe('parseAnswerFooter', () => {
  it('desparte răspunsul de subsol și citește sursele', () => {
    const r = parseAnswerFooter('Apăsați **„Confirmă plata”**.\n\n---\nSURSE: admin/statusuri-comenzi, admin/plata-transfer-bancar.md\nDOCUMENTAT: da\n');
    expect(r.body).toBe('Apăsați **„Confirmă plata”**.');
    expect(r.sources).toEqual(['admin/statusuri-comenzi', 'admin/plata-transfer-bancar']);
    expect(r.documented).toBe(true);
    expect(r.followUp).toBeNull();
  });
  it('nedocumentat + ce lipsește', () => {
    const r = parseAnswerFooter('Nu găsesc în ghid.\nSURSE: niciuna\nDOCUMENTAT: nu\nDE_DOCUMENTAT: cine depune cazierul auto');
    expect(r.sources).toEqual([]);
    expect(r.documented).toBe(false);
    expect(r.followUp).toBe('cine depune cazierul auto');
  });
  it('fără subsol → tot textul e răspuns, documentat', () => {
    expect(parseAnswerFooter('Doar text.')).toEqual({ body: 'Doar text.', sources: [], documented: true, followUp: null });
  });
});

describe('visibleAnswerPrefix', () => {
  it('ascunde subsolul pe măsură ce vine', () => {
    expect(visibleAnswerPrefix('Răspuns.\n\nSURSE: admin/x')).toBe('Răspuns.');
    expect(visibleAnswerPrefix('Răspuns.\n---\nSURSE:')).toBe('Răspuns.');
    expect(visibleAnswerPrefix('Răspuns.\nSUR')).toBe('Răspuns.');
    expect(visibleAnswerPrefix('Răspuns normal fără subsol')).toBe('Răspuns normal fără subsol');
  });
});
