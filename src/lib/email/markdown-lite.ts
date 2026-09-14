/**
 * Markdown-lite pentru corpul campaniilor scrise de echipă în /admin/marketing.
 * Intenționat minimal, ca textul să iasă identic în HTML și în varianta text:
 *
 *   linie goală          → paragraf nou
 *   "- text"             → listă cu buline (linii consecutive = aceeași listă)
 *   "## Titlu"           → subtitlu
 *   **bold**             → <strong>
 *   [text](https://…)    → link
 *   https://…            → link (autolink)
 *
 * Tot ce nu e recunoscut rămâne text (escapat) — nu se poate injecta HTML.
 */

import { escHtml } from './templates/branded-layout';

const P = 'margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;';
const H = 'margin:18px 0 8px;color:#0B1B33;font-size:16px;font-weight:700;';
const UL = 'margin:0 0 14px;padding-left:20px;color:#475569;font-size:14px;line-height:1.6;';
const A = 'color:#0B1B33;text-decoration:underline;';

function inline(raw: string): string {
  // Escapăm întâi, apoi reintroducem doar construcțiile noastre.
  let s = escHtml(raw);
  // [text](url) — url doar http(s)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text, url) => `<a href="${url}" style="${A}">${text}</a>`);
  // autolink pentru URL-uri libere (nu cele deja în href="…")
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_m, pre, url) => `${pre}<a href="${url}" style="${A}">${url}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s;
}

export function markdownLiteToHtml(body: string): string {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/);
  const out: string[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    if (lines.every((l) => /^-\s+/.test(l.trim()))) {
      out.push(`<ul style="${UL}">${lines.map((l) => `<li>${inline(l.trim().replace(/^-\s+/, ''))}</li>`).join('')}</ul>`);
      continue;
    }
    if (lines.length === 1 && /^##\s+/.test(lines[0].trim())) {
      out.push(`<h2 style="${H}">${inline(lines[0].trim().replace(/^##\s+/, ''))}</h2>`);
      continue;
    }
    out.push(`<p style="${P}">${lines.map((l) => inline(l.trim())).join('<br>')}</p>`);
  }
  return out.join('\n');
}

/** Varianta text: scoate marcajele, păstrează URL-urile. */
export function markdownLiteToText(body: string): string {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^##\s+/gm, '')
    .replace(/^-\s+/gm, '• ')
    .trim();
}
