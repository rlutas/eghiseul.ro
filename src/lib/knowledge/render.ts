import { Marked, type Tokens } from 'marked';
import { rewriteDocLink } from './parse';

/**
 * Markdown → HTML pentru Knowledge Center. Conținutul e al nostru (repo),
 * deci nu sanitizăm; singura transformare e rescrierea linkurilor relative
 * dintre documente către `/admin/ghid/...`, ca navigarea să rămână în admin.
 *
 * Linkurile către fișiere pe care nu le servim (png, pdf, csv) rămân text
 * simplu — mai bine decât un 404.
 */
export function renderMarkdown(md: string, currentDoc: string, basePath = '/admin/ghid'): string {
  const marked = new Marked({
    gfm: true,
    breaks: false,
    walkTokens(token) {
      if (token.type === 'link') {
        const t = token as Tokens.Link;
        const rewritten = rewriteDocLink(t.href, currentDoc);
        if (rewritten === null) {
          // Degradăm la text: marked nu are „unlink", deci golim href-ul și
          // lăsăm renderer-ul de mai jos să scoată <span>.
          t.href = '';
        } else {
          // Portalul colaboratorului randează aceleași documente sub alt prefix.
          t.href = basePath === '/admin/ghid' ? rewritten : rewritten.replace(/^\/admin\/ghid/, basePath);
        }
      }
    },
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        if (!href) return `<span class="text-neutral-500">${text}</span>`;
        const external = /^https?:/i.test(href);
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
        const target = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeAttr(href)}"${titleAttr}${target}>${text}</a>`;
      },
    },
  });
  return marked.parse(md, { async: false }) as string;
}

/** Doar partea inline (un rând de tabel din changelog) — fără <p> în jur. */
export function renderInline(md: string, currentDoc: string): string {
  const html = renderMarkdown(md, currentDoc).trim();
  return html.replace(/^<p>/, '').replace(/<\/p>$/, '');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
