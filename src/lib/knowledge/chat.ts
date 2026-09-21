import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { loadSearchIndex } from './docs';
import { renderMarkdown } from './render';
import { knowledgeDb } from './reports';
import {
  coreDocs,
  guideHref,
  renderDocsForPrompt,
  retrievedDocs,
  type ChatAudience,
} from './chat-context';

/**
 * Chatbotul din Ghid: răspunde DOAR din documentația echipei, cu surse.
 *
 * Model: Claude Sonnet 5 (Raul, 21.09: Opus e prea scump pentru întrebări de
 * procedură; testat, răspunde corect), thinking adaptiv (implicit), effort
 * „medium”. Nucleul (catalog A→Z,
 * statusuri, pagina comenzii) stă în system prompt cu cache de o oră;
 * documentele găsite pentru întrebare vin în mesajul utilizatorului.
 *
 * Fără `ANTHROPIC_API_KEY` chatbotul nu pornește; UI-ul arată mesajul de
 * configurare, iar raportarea de probleme merge oricum.
 */
export const CHAT_MODEL = 'claude-sonnet-5';

const AnswerSchema = z.object({
  raspuns_md: z
    .string()
    .describe('Răspunsul pentru operator, în română, Markdown scurt (liste, bold pe butoane). Fără surse aici.'),
  surse: z
    .array(z.string())
    .describe('Slug-urile documentelor pe care se bazează răspunsul, exact cum apar în atributul slug.'),
  documentat: z
    .boolean()
    .describe('true dacă răspunsul reiese clar din documente; false dacă documentele nu acoperă întrebarea.'),
  intrebare_pentru_raul: z
    .string()
    .nullable()
    .describe('Când documentat=false: ce ar trebui documentat, într-o propoziție. Altfel null.'),
});
export type ChatAnswer = z.infer<typeof AnswerSchema>;

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

export function isChatConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM_RULES = `Ești asistentul intern al echipei eGhișeul.ro / documentero.ro (servicii de obținere a actelor: caziere, acte de stare civilă, certificat constatator, extras de carte funciară, servicii imobiliare prin topograf). Răspunzi operatorilor din echipă și colaboratorilor (topograful Mircea) la întrebări despre cum funcționează platforma și ce au de făcut.

Reguli:
- Răspunzi DOAR din documentele primite (nucleul de mai jos + documentele din mesaj). Nu inventezi prețuri, termene, butoane sau proceduri. Dacă documentele nu acoperă întrebarea, spui clar că nu e documentat și pui documentat=false.
- Român simplu, la persoana a doua plural („apăsați”, „verificați”), scurt: de regulă 3–8 rânduri sau o listă. Numele butoanelor și statusurilor exact ca în documente, cu ghilimele sau bold.
- Când răspunsul depinde de serviciu, întrebi sau dai ramurile scurt.
- Nu dai sfaturi juridice clientului; explici ce face echipa în platformă.
- În „surse” pui slug-urile documentelor folosite (atributul slug al fiecărui <document>), cel mult 4.
- Nu repeta întrebarea. Nu adăuga introduceri sau încheieri.`;

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

export async function answerQuestion(input: {
  question: string;
  audience: ChatAudience;
  history?: ChatTurn[];
  user: { id: string; role: string };
}): Promise<ChatResult> {
  const question = input.question.trim().slice(0, 2000);
  const index = await loadSearchIndex();
  const core = coreDocs(index, input.audience);
  const retrieved = retrievedDocs(index, question, input.audience);
  const byPath = new Map([...core, ...retrieved].map((d) => [d.slug, d]));

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
  try {
    const response = await client.messages.parse({
      model: CHAT_MODEL,
      max_tokens: 4000,
      output_config: { effort: 'medium', format: zodOutputFormat(AnswerSchema) },
      system: buildSystem(input.audience, renderDocsForPrompt(core)),
      messages: [...history, { role: 'user', content: userContent }],
    });
    const parsed = response.parsed_output;
    if (!parsed) throw new Error(`Răspuns neparsabil (stop_reason=${response.stop_reason})`);

    const sources = parsed.surse
      .map((slug) => byPath.get(slug))
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
        answer: parsed.raspuns_md,
        sources: sources.map((s) => s.slug),
        documented: parsed.documentat,
        model: response.model,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_tokens: response.usage.cache_read_input_tokens ?? null,
      })
      .select('id')
      .single();

    // Întrebarea fără răspuns e un gol în documentație: intră singură în rapoarte.
    if (!parsed.documentat) {
      await admin.from('knowledge_reports').insert({
        reporter_id: input.user.id,
        reporter_role: input.user.role,
        audience: input.audience,
        kind: 'intrebare-fara-raspuns',
        message: parsed.intrebare_pentru_raul || question,
        context: { question, answer: parsed.raspuns_md, chatLogId: log?.id ?? null },
      });
    }

    console.info(
      `[knowledge/chat] ${input.audience} ${Date.now() - t0}ms in=${response.usage.input_tokens} cached=${response.usage.cache_read_input_tokens ?? 0} out=${response.usage.output_tokens} documented=${parsed.documentat}`
    );
    return {
      answerMd: parsed.raspuns_md,
      answerHtml: renderMarkdown(parsed.raspuns_md, 'admin/README.md', input.audience === 'collaborator' ? '/colaborator/ghid' : '/admin/ghid'),
      sources,
      documented: parsed.documentat,
      followUp: parsed.intrebare_pentru_raul,
      logId: log?.id ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin.from('knowledge_chat_log').insert({
      user_id: input.user.id,
      user_role: input.user.role,
      audience: input.audience,
      question,
      error: message.slice(0, 1000),
      model: CHAT_MODEL,
    });
    throw err;
  }
}
