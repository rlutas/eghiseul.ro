/**
 * Trimite pe o adresă de test toate șabloanele de email de marketing/lifecycle,
 * cu date de exemplu, ca să le vezi „fizic" în inbox înainte de a porni
 * comutatoarele din /admin/marketing.
 *
 *   npx tsx scripts/email-previews.ts serviciiseonethut@gmail.com
 *   npx tsx scripts/email-previews.ts <email> warmup,review   (doar câteva)
 *
 * Citește RESEND_API_KEY / RESEND_FROM din .env.local. Nu atinge DB-ul, nu
 * scrie în lifecycle_emails / contacts — e doar randare + trimitere.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// .env.local → process.env, înainte de orice import care citește env.
for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const [, , to, onlyArg] = process.argv;
if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
  console.error('Usage: npx tsx scripts/email-previews.ts <email> [warmup,review,expiry,expired,crosssell,campaign,recovery1,recovery2,recovery3]');
  process.exit(1);
}
const only = onlyArg ? new Set(onlyArg.split(',')) : null;

async function main() {
  const { sendEmail } = await import('../src/lib/email/resend');
  const { buildWarmupSubject, buildWarmupHtml, buildWarmupText } = await import('../src/lib/email/templates/warmup-reengagement');
  const { renderReviewRequestEmail } = await import('../src/lib/email/templates/review-request');
  const { renderExpiryReminderEmail, validityLabel } = await import('../src/lib/email/templates/expiry-reminder');
  const { renderCrossSellEmail } = await import('../src/lib/email/templates/cross-sell');
  const { renderCampaignEmail } = await import('../src/lib/email/templates/campaign');
  const { buildRecoveryStep1, buildRecoveryStep2 } = await import('../src/lib/email/templates/abandoned-recovery-sequence');
  const { buildRecoverySubject, buildRecoveryHtml, buildRecoveryText } = await import('../src/lib/email/templates/abandoned-recovery');
  const { GOOGLE_REVIEW_WRITE_URL } = await import('../src/config/contact');

  const unsubscribeUrl = 'https://eghiseul.ro/api/contacts/unsubscribe?token=preview';
  const firstName = 'Raul';
  const day = 86_400_000;

  const previews: Record<string, () => { subject: string; html: string; text: string }> = {
    warmup: () => {
      const p = { firstName, serviceHint: 'cazier judiciar', unsubscribeUrl };
      return { subject: buildWarmupSubject(p), html: buildWarmupHtml(p), text: buildWarmupText(p) };
    },
    review: () =>
      renderReviewRequestEmail({ firstName, serviceName: 'Cazier Judiciar', friendlyOrderId: 'E-260910-TEST1', reviewUrl: GOOGLE_REVIEW_WRITE_URL, unsubscribeUrl }),
    expiry: () =>
      renderExpiryReminderEmail({
        firstName,
        serviceName: 'Cazier Judiciar',
        friendlyOrderId: 'E-260315-TEST2',
        expiresOn: new Date(Date.now() + 12 * day),
        alreadyExpired: false,
        validityLabel: validityLabel(180),
        reorderUrl: 'https://eghiseul.ro/servicii/cazier-judiciar-online/persoana-fizica/?utm_source=email&utm_medium=lifecycle&utm_campaign=expiry',
        unsubscribeUrl,
      }),
    expired: () =>
      renderExpiryReminderEmail({
        firstName,
        serviceName: 'Extras de Carte Funciară',
        friendlyOrderId: 'E-260801-TEST3',
        expiresOn: new Date(Date.now() - 5 * day),
        alreadyExpired: true,
        validityLabel: validityLabel(30),
        reorderUrl: 'https://eghiseul.ro/servicii/extras-de-carte-funciara/?utm_source=email&utm_medium=lifecycle&utm_campaign=expiry',
        unsubscribeUrl,
      }),
    crosssell: () =>
      renderCrossSellEmail({
        firstName,
        boughtServiceName: 'Cazier Judiciar',
        suggestions: [
          { slug: 'certificat-integritate', name: 'Certificat de Integritate Comportamentală', url: 'https://eghiseul.ro/servicii/certificat-de-integritate-comportamentala/?utm_campaign=cross_sell' },
          { slug: 'cazier-fiscal', name: 'Cazier Fiscal', url: 'https://eghiseul.ro/servicii/cazier-fiscal-online/?utm_campaign=cross_sell' },
          { slug: 'cazier-auto', name: 'Cazier Auto', url: 'https://eghiseul.ro/servicii/cazier-auto-online/?utm_campaign=cross_sell' },
        ],
        catalogUrl: 'https://eghiseul.ro/servicii/?utm_campaign=cross_sell',
        unsubscribeUrl,
      }),
    campaign: () =>
      renderCampaignEmail({
        subject: '{{prenume}}, două servicii noi și un ghid despre cazier',
        preheader: 'Rovinieta online și certificatul de celibat — plus ce s-a schimbat la eGhișeul.ro.',
        bodyText: [
          'Salut {{prenume}},',
          '',
          'Câteva noutăți de la eGhișeul.ro:',
          '',
          '## Servicii noi',
          '',
          '- **Rovinieta online** — o plătești în 2 minute, fără drum la benzinărie: https://eghiseul.ro/servicii/rovinieta-online/',
          '- **Certificat de celibat** — pentru căsătoria în străinătate, obținut de la primăria de stare civilă: https://eghiseul.ro/servicii/eliberare-certificat-de-celibat/',
          '',
          '## Un ghid util',
          '',
          'Cazier judiciar sau certificat de integritate? Diferența contează dacă lucrezi cu copii: [citește ghidul](https://eghiseul.ro/cazier-judiciar-vs-certificat-integritate-comportamentala/).',
        ].join('\n'),
        ctaLabel: 'Vezi toate serviciile',
        ctaUrl: 'https://eghiseul.ro/servicii/',
        firstName,
        unsubscribeUrl,
      }),
    recovery1: () =>
      buildRecoveryStep1({
        customerFirstName: firstName,
        serviceName: 'Cazier Judiciar',
        totalRon: 199,
        resumeUrl: 'https://eghiseul.ro/comanda/checkout/preview',
        orderNumber: 'E-260914-TEST4',
        estimatedDaysDisplay: '3-5 zile lucrătoare',
      }),
    recovery2: () =>
      buildRecoveryStep2({
        customerFirstName: firstName,
        serviceName: 'Cazier Judiciar',
        totalRon: 199,
        resumeUrl: 'https://eghiseul.ro/comanda/checkout/preview',
        orderNumber: 'E-260914-TEST4',
        estimatedDaysDisplay: '3-5 zile lucrătoare',
      }),
    recovery3: () => {
      const p = {
        customerFirstName: firstName,
        serviceName: 'Cazier Judiciar',
        totalRon: 199,
        couponCode: 'RECOVERY-PREVIEW',
        discountPercent: 10,
        resumeUrl: 'https://eghiseul.ro/comanda/checkout/preview?coupon=RECOVERY-PREVIEW',
        orderNumber: 'E-260914-TEST4',
      };
      return { subject: buildRecoverySubject(p), html: buildRecoveryHtml(p), text: buildRecoveryText(p) };
    },
  };

  for (const [key, render] of Object.entries(previews)) {
    if (only && !only.has(key)) continue;
    const mail = render();
    const res = await sendEmail({ to, subject: `[PREVIEW ${key}] ${mail.subject}`, html: mail.html, text: mail.text });
    console.log(`${key.padEnd(10)} → ${res.skipped ? `SKIPPED (${res.reason})` : `sent ${res.id}`}`);
    await new Promise((r) => setTimeout(r, 700)); // Resend: 2 req/s
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
