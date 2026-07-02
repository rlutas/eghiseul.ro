import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { sendEmail } from '@/lib/email/resend';
import { renderContactMessageEmail } from '@/lib/email/templates/contact-message';
import { ORGANIZATION } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Where the notification lands. Reply-To is set to the sender so a reply
// from the inbox goes straight back to the customer.
const INBOX = ORGANIZATION.contactPoint.email;

// Map select values → human labels used in the email subject + DB.
const SUBJECTS: Record<string, string> = {
  intrebare: 'Întrebare generală',
  comanda: 'Întrebare despre o comandă',
  reclamatie: 'Reclamație',
  colaborare: 'Colaborare / parteneriat',
  altele: 'Altele',
};

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  orderNumber?: string;
  subject?: string;
  message?: string;
  // Honeypot — real users never fill this (hidden field). Bots do.
  website?: string;
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 messages / 10 min per IP.
  const ip = getClientIP(req);
  const rl = checkRateLimit(`contact:${ip}`, { windowMs: 10 * 60 * 1000, maxRequests: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Prea multe mesaje trimise. Încearcă din nou în câteva minute.' },
      { status: 429 }
    );
  }

  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Cerere invalidă' }, { status: 400 });
  }

  // Honeypot — silently accept so bots don't learn, but drop the message.
  if (body.website && body.website.trim() !== '') {
    return NextResponse.json({ success: true });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const phone = (body.phone ?? '').trim();
  const orderNumber = (body.orderNumber ?? '').trim();
  const message = (body.message ?? '').trim();
  const subjectKey = (body.subject ?? 'intrebare').trim();
  const subjectLabel = SUBJECTS[subjectKey] ?? SUBJECTS.intrebare;

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ success: false, error: 'Introdu un nume valid.' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ success: false, error: 'Adresă de email invalidă.' }, { status: 400 });
  }
  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { success: false, error: 'Mesajul trebuie să aibă între 10 și 5000 de caractere.' },
      { status: 400 }
    );
  }
  if (phone.length > 40 || orderNumber.length > 60) {
    return NextResponse.json({ success: false, error: 'Date invalide.' }, { status: 400 });
  }

  // `contact_messages` nu e încă în tipurile generate Supabase — același
  // pattern ca newsletter/route.ts pentru tabele noi.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error: dbError } = await supabase.from('contact_messages').insert({
    name,
    email,
    phone: phone || null,
    order_number: orderNumber || null,
    subject: subjectKey,
    message,
    ip: ip === 'unknown' ? null : ip,
    user_agent: (req.headers.get('user-agent') ?? '').slice(0, 500) || null,
  });

  if (dbError) {
    console.error('[contact] insert failed:', dbError.message);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare. Încearcă din nou.' },
      { status: 500 }
    );
  }

  // Notify the inbox. A failed send must not lose the message — it's already
  // persisted — so we log and still return success.
  try {
    const mail = renderContactMessageEmail({
      name,
      email,
      phone: phone || undefined,
      orderNumber: orderNumber || undefined,
      subject: subjectLabel,
      message,
    });
    await sendEmail({ to: INBOX, subject: mail.subject, html: mail.html, text: mail.text, replyTo: email });
  } catch (e) {
    console.error('[contact] email notify failed:', e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ success: true });
}
