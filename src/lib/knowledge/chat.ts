import Anthropic from '@anthropic-ai/sdk';
import { loadSearchIndex } from './docs';
import { renderMarkdown } from './render';
import { knowledgeDb } from './reports';
import {
  coreDocs,
  guideHref,
  parseAnswerFooter,
  renderDocsForPrompt,
  retrievedDocs,
  type ChatAudience,
} from './chat-context';

/**
 * Chatbotul din Ghid: răspunde DOAR din documentația echipei, cu surse,
 * transmis pe măsură ce se generează (latența e în generare, nu în gândire:
 * 4–9 s pentru 400 de tokeni; cu streaming primul rând apare sub o secundă).
 *
 * Model: Claude Sonnet 5 (Raul, 21.09: Opus e prea scump pentru întrebări de
 * procedură), fără thinking, effort „low”. Nucleul (catalog A→Z, statusuri,
 * pagina comenzii; la colaborator fișele lui) stă în system prompt cu cache
 * de o oră; documentele găsite pentru întrebare vin în mesajul utilizatorului.
 * Răspunsul e text cu un subsol fix (SURSE / DOCUMENTAT / DE_DOCUMENTAT),
 * parsat de `parseAnswerFooter`.
 *
 * Fără `ANTHROPIC_API_KEY` chatbotul nu pornește; UI-ul arată mesajul de
 * configurare, iar raportarea de probleme merge oricum.
 */
export const CHAT_MODEL = 'claude-sonnet-5';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  answerMd: string;
  answerHtml: string;
  sources: Array<{ slug: string; title: string; href: string }>;
  documented: boolean;
  followUp: string | null;
  logId: string | null;
}

export type ChatEvent = { t: 'delta'; text: string } | { t: 'done'; result: ChatResult } | { t: 'error'; message: string };

export function isChatConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM_RULES = `Ești asistentul intern al echipei eGhișeul.ro / documentero.ro (servicii de obținere a actelor: caziere, acte de stare civilă, certificat constatator, extras de carte funciară, servicii imobiliare prin topograf). Răspunzi operatorilor din echipă și colaboratorilor (topograful Mircea) la întrebări despre cum funcționează platforma și ce au de făcut.

Reguli:
- Răspunzi DOAR din documentele primite (nucleul de mai jos + documentele din mesaj). Nu inventezi prețuri, termene, butoane sau proceduri. Dacă documentele nu acoperă întrebarea, spui într-o propoziție că nu e documentat.
- Român simplu, la persoana a doua plural („apăsați”, „verificați”). SCURT: răspunsul are cel mult 6 rânduri sau o listă de cel mult 5 puncte; fără introducere, fără încheiere, fără repetarea întrebării. Numele butoanelor și statusurilor exact ca în documente, cu ghilimele sau bold.
- Când răspunsul depinde de serviciu, dai ramurile în câte un rând.
- Nu dai sfaturi juridice clientului; explici ce face echipa în platformă.
- Nu ai acces la comenzi, clienți sau date live. La o întrebare despre o comandă anume (număr de comandă, un client) spui că nu vezi comenzile și unde se caută în admin (Comenzi → căutare după număr / email / telefon). Asta NU e un gol de documentație: DOCUMENTAT: da.
- DOCUMENTAT: nu doar când întrebarea e despre o procedură / regulă / preț / termen pe care documentele nu îl acoperă.

Formatul răspunsului: textul (Markdown simplu), apoi o linie goală, apoi EXACT subsolul de mai jos, pe rânduri separate, nimic după el:
SURSE: <slug-urile documentelor folosite, separate prin virgulă, exact valoarea atributului slug; cel mult 4; „niciuna” dacă nu ai folosit niciunul>
DOCUMENTAT: <da | nu>
DE_DOCUMENTAT: <doar când DOCUMENTAT este nu: ce ar trebui scris în ghid, într-o propoziție>`;

function buildSystem(audience: ChatAudience, coreText: string): Anthropic.TextBlockParam[] {
  const who =
    audience === 'collaborator'
      ? 'Vorbești cu colaboratorul (topograful), care lucrează în portalul lui (/colaborator) și NU are acces la admin: nu-i recomanda butoane din admin, doar din portalul lui și din procedurile lui.'
      : 'Vorbești cu un operator din echipă, care lucrează în admin (/admin/orders).';
  return [
    { type: 'text', text: `${SYSTEM_RULES}\n\n${who}` },
    {
      type: 'text',
      text: `Documentele de bază (mereu valabile):\n\n${coreText}`,
      cache_control: { type: 'ephemeral', ttl: '1h' },
    },
  ];
}

/**
 * Generează răspunsul ca flux de evenimente: `delta` (bucăți de text, fără
 * subsol; UI-ul le afișează imediat), apoi `done` (rezultatul complet, cu
 * surse, HTML randat și id-ul din log) sau `error`.
 */
export async function* streamAnswer(input: {
  question: string;
  audience: ChatAudience;
  history?: ChatTurn[];
  user: { id: string; role: string };
}): AsyncGenerator<ChatEvent> {
  const question = input.question.trim().slice(0, 2000);
  const index = await loadSearchIndex();
  const core = coreDocs(index, input.audience);
  const retrieved = retrievedDocs(index, question, input.audience);
  const bySlug = new Map([...core, ...retrieved].map((d) => [d.slug, d]));

  const client = new Anthropic();
  const history = (input.history ?? []).slice(-6).map<Anthropic.MessageParam>((t) => ({
    role: t.role,
    content: t.content.slice(0, 4000),
  }));
  const userContent =
    (retrieved.length
      ? `Documente relevante pentru întrebare:\n\n${renderDocsForPrompt(retrieved)}\n\n`
      : 'Nu s-a găsit niciun document suplimentar pentru întrebarea asta; folosește doar documentele de bază.\n\n') +
    `Întrebare: ${question}`;

  const admin = knowledgeDb();
  const t0 = Date.now();
  let full = '';
  let sentUpTo = 0;
  try {
    const stream = client.messages.stream({
      model: CHAT_MODEL,
      max_tokens: 1500,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: buildSystem(input.audience, renderDocsForPrompt(core)),
      messages: [...history, { role: 'user', content: userContent }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        full += event.delta.text;
        // Trimitem doar ce e sigur răspuns (nu subsol în curs de scriere).
        const visible = safePrefixLength(full);
        if (visible > sentUpTo) {
          yield { t: 'delta', text: full.slice(sentUpTo, visible) };
          sentUpTo = visible;
        }
      }
    }
    const message = await stream.finalMessage();
    const parsed = parseAnswerFooter(full);
    const sources = parsed.sources
      .map((slug) => bySlug.get(slug))
      .filter((d): d is NonNullable<typeof d> => !!d)
      .slice(0, 4)
      .map((d) => ({ slug: d.slug, title: d.title, href: guideHref(d.slug, input.audience) }));

    const { data: log } = await admin
      .from('knowledge_chat_log')
      .insert({
        user_id: input.user.id,
        user_role: input.user.role,
        audience: input.audience,
        question,
        answer: parsed.body,
        sources: sources.map((s) => s.slug),
        documented: parsed.documented,
        model: message.model,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_read_tokens: message.usage.cache_read_input_tokens ?? null,
      })
      .select('id')
      .single();

    // Întrebarea fără răspuns e un gol în documentație: intră singură în rapoarte.
    if (!parsed.documented) {
      await admin.from('knowledge_reports').insert({
        reporter_id: input.user.id,
        reporter_role: input.user.role,
        audience: input.audience,
        kind: 'intrebare-fara-raspuns',
        message: parsed.followUp || question,
        context: { question, answer: parsed.body, chatLogId: log?.id ?? null },
      });
    }

    console.info(
      `[knowledge/chat] ${input.audience} ${Date.now() - t0}ms in=${message.usage.input_tokens} cached=${message.usage.cache_read_input_tokens ?? 0} out=${message.usage.output_tokens} documented=${parsed.documented} stop=${message.stop_reason}`
    );
    yield {
      t: 'done',
      result: {
        answerMd: parsed.body,
        answerHtml: renderMarkdown(parsed.body, 'admin/README.md', input.audience === 'collaborator' ? '/colaborator/ghid' : '/admin/ghid'),
        sources,
        documented: parsed.documented,
        followUp: parsed.followUp,
        logId: log?.id ?? null,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[knowledge/chat] failed:', message);
    await admin.from('knowledge_chat_log').insert({
      user_id: input.user.id,
      user_role: input.user.role,
      audience: input.audience,
      question,
      error: message.slice(0, 1000),
      model: CHAT_MODEL,
    });
    yield { t: 'error', message: 'Chatbotul nu a putut răspunde acum. Încearcă din nou sau raportează problema.' };
  }
}

/** Câte caractere din textul parțial pot fi arătate fără să scăpăm subsolul. */
function safePrefixLength(partial: string): number {
  const idx = partial.search(/\n\s*(-{3,}\s*\n\s*)?SURSE\s*:/i);
  if (idx >= 0) return idx;
  // Ținem în buffer ultimul rând neterminat dacă poate fi începutul subsolului.
  const lastNl = partial.lastIndexOf('\n');
  const tail = partial.slice(lastNl + 1);
  if (tail.length > 0 && /^\s*(-{1,3}|S|SU|SUR|SURS|SURSE)\s*:?\s*$/i.test(tail)) return lastNl + 1;
  return partial.length;
}

/** Varianta fără streaming (teste, scripturi): consumă fluxul și întoarce rezultatul. */
export async function answerQuestion(input: Parameters<typeof streamAnswer>[0]): Promise<ChatResult> {
  for await (const ev of streamAnswer(input)) {
    if (ev.t === 'done') return ev.result;
    if (ev.t === 'error') throw new Error(ev.message);
  }
  throw new Error('Fluxul s-a încheiat fără rezultat');
}
