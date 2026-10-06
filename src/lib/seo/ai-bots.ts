/**
 * User agents for robots.txt on eghiseul.ro and documentero.ro.
 * Raul, 06.10.2026: allow every AI crawler and assistant fetcher.
 */
/** AI crawlers (training + search indexes). All allowed since 06.10.2026. */
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'DuckAssistBot',
  'cohere-ai',
];

/** Fetchers acting for one user's request in an assistant. */
export const AI_ASSISTANT_FETCHERS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'MistralAI-User'];
