/**
 * Removes `email` from the address bar right after a page reads it.
 *
 * Email links carry `?email=` as the guest check. Analytics scripts, once accepted,
 * send the page URL to Google and Meta, and the address also stays in the browser
 * history, so the email must not stay there.
 */
export function urlWithoutEmail(href: string): string | null {
  const url = new URL(href);
  if (!url.searchParams.has('email')) return null;
  url.searchParams.delete('email');
  return `${url.pathname}${url.search}${url.hash}`;
}

export function stripEmailFromAddressBar(): void {
  if (typeof window === 'undefined') return;
  const next = urlWithoutEmail(window.location.href);
  if (next) window.history.replaceState(window.history.state, '', next);
}
