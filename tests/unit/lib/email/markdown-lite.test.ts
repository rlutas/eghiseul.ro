import { describe, expect, it } from 'vitest';
import { markdownLiteToHtml, markdownLiteToText } from '@/lib/email/markdown-lite';
import { personalize } from '@/lib/email/templates/campaign';

describe('markdownLiteToHtml', () => {
  it('paragrafe, liste, subtitluri, bold, link, autolink', () => {
    const html = markdownLiteToHtml(
      '## Noutăți\n\nAm lansat **rovinieta online**.\nVezi [aici](https://eghiseul.ro/servicii/rovinieta-online/).\n\n- unu\n- doi\n\nSau https://eghiseul.ro/servicii'
    );
    expect(html).toContain('<h2');
    expect(html).toContain('<strong>rovinieta online</strong>');
    expect(html).toContain('<a href="https://eghiseul.ro/servicii/rovinieta-online/"');
    expect(html).toContain('<ul');
    expect(html).toContain('<li>unu</li><li>doi</li>');
    expect(html).toContain('<br>');
    expect(html).toContain('<a href="https://eghiseul.ro/servicii"');
  });

  it('nu lasă HTML să treacă (escapare)', () => {
    const html = markdownLiteToHtml('<script>alert(1)</script> & <b>x</b>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('linkuri doar http(s)', () => {
    expect(markdownLiteToHtml('[x](javascript:alert(1))')).not.toContain('href=');
  });
});

describe('markdownLiteToText', () => {
  it('scoate marcajele, păstrează URL-urile', () => {
    expect(markdownLiteToText('## T\n\n**bold** [aici](https://x.ro)\n- a')).toBe('T\n\nbold aici (https://x.ro)\n• a');
  });
});

describe('personalize', () => {
  it('{{prenume}} cu și fără nume', () => {
    expect(personalize('Salut {{prenume}}, ce faci', 'Ana')).toBe('Salut Ana, ce faci');
    expect(personalize('Salut {{prenume}}, ce faci', null)).toBe('Salut, ce faci');
    expect(personalize('Salut {{ prenume }}!', '')).toBe('Salut!');
  });
});
