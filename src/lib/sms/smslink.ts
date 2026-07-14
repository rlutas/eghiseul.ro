/**
 * SMSLink.ro gateway — best-effort transactional SMS.
 *
 * Env: SMSLINK_API_KEY in the form "connection_id;password" (from SMSLink →
 * SMS Gateway → Configurare), optional SMSLINK_SENDER. When unset we skip
 * silently (same convention as lib/email/resend.ts) so flows never break in
 * environments without SMS configured.
 *
 * Docs: https://www.smslink.ro/sms-gateway-documentatie-sms-gateway.html
 */

export interface SendSmsResult {
  ok: boolean;
  skipped: boolean;
  detail?: string;
}

export async function sendSms(to: string, message: string): Promise<SendSmsResult> {
  const key = process.env.SMSLINK_API_KEY;
  if (!key || !key.includes(';')) {
    console.warn('[sms/smslink] SMSLINK_API_KEY not configured — skipping SMS', { to });
    return { ok: false, skipped: true, detail: 'SMSLINK_API_KEY not set' };
  }
  const [connectionId, password] = key.split(';', 2);
  const params = new URLSearchParams({
    connection_id: connectionId,
    password,
    to: to.replace(/^\+4/, '0').replace(/\s/g, ''),
    message,
  });
  try {
    const res = await fetch(
      `https://secure.smslink.ro/sms/gateway/communicate/index.php?${params.toString()}`,
      { method: 'GET' }
    );
    const body = await res.text();
    const ok = res.ok && body.startsWith('MESSAGE');
    if (!ok) console.error('[sms/smslink] send failed', { to, body: body.slice(0, 200) });
    return { ok, skipped: false, detail: body.slice(0, 200) };
  } catch (err) {
    console.error('[sms/smslink] request error', err);
    return { ok: false, skipped: false, detail: String(err).slice(0, 200) };
  }
}
