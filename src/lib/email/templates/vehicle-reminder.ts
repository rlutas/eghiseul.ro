/**
 * Reminder for a saved vehicle: the rovinietă, the ITP or the RCA is about to
 * expire (or just has). Sent by `/api/cron/vehicle-reminders`, once per
 * expiry date per vehicle.
 *
 * The rovinietă one sells something we own — erovinieta.net — so it carries
 * the plate straight into that checkout. ITP and RCA have nothing of ours to
 * buy; they are a service to the customer and a reason to keep the account.
 */

import { brandedEmailHtml, ctaButton, escHtml } from './branded-layout';
import { greeting, unsubscribeNoteHtml, unsubscribeNoteText } from './marketing-footer';
import { formatRoDate } from '@/lib/lifecycle/rules';

export type VehicleReminderKind = 'rovinieta' | 'itp' | 'insurance';

export interface VehicleReminderEmailInput {
  firstName?: string | null;
  kind: VehicleReminderKind;
  plateNumber: string;
  /** Optional „Golf alb" the customer named the car. */
  label?: string | null;
  expiresOn: Date;
  /** Days until expiry; negative when it has passed. */
  daysLeft: number;
  /** Where the button goes: erovinieta.net for the rovinietă, the account otherwise. */
  actionUrl: string;
  unsubscribeUrl: string;
}

const KIND_LABEL: Record<VehicleReminderKind, string> = {
  rovinieta: 'Rovinieta',
  itp: 'ITP-ul',
  insurance: 'Asigurarea RCA',
};

export function renderVehicleReminderEmail(input: VehicleReminderEmailInput): { subject: string; html: string; text: string } {
  const what = KIND_LABEL[input.kind];
  const car = input.label ? `${input.plateNumber} (${input.label})` : input.plateNumber;
  const date = formatRoDate(input.expiresOn);
  const expired = input.daysLeft < 0;
  const when = expired
    ? `a expirat pe ${date}`
    : input.daysLeft === 0
      ? `expiră azi, ${date}`
      : `expiră pe ${date}, peste ${input.daysLeft} ${input.daysLeft === 1 ? 'zi' : 'zile'}`;

  const subject = `${what} pentru ${input.plateNumber} ${expired ? 'a expirat' : `expiră ${input.daysLeft <= 1 ? 'acum' : `în ${input.daysLeft} zile`}`}`;
  const hello = greeting(input.firstName);

  const consequence =
    input.kind === 'rovinieta'
      ? 'Fără rovinietă valabilă, amenda e între 250 și 500 de lei și se dă automat, din camere.'
      : input.kind === 'itp'
        ? 'Fără ITP valabil, mașina nu poate circula legal, iar asigurarea poate refuza daunele.'
        : 'Fără RCA valabil, mașina nu poate circula legal, iar accidentul se plătește din buzunar.';

  const cta =
    input.kind === 'rovinieta'
      ? ctaButton('Cumpără rovinieta online, în 2 minute', input.actionUrl)
      : ctaButton('Vezi mașinile mele în cont', input.actionUrl);

  const html = brandedEmailHtml({
    preheader: `${what} pentru ${input.plateNumber} ${when}.`,
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${escHtml(hello)}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;"><strong>${escHtml(what)}</strong> pentru mașina <strong>${escHtml(car)}</strong>, salvată în contul tău eGhișeul.ro, <strong>${escHtml(when)}</strong>.</p>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">${escHtml(consequence)}</p>
        ${cta}
        ${
          input.kind === 'rovinieta'
            ? `<p style="margin:12px 0 0;text-align:center;font-size:12px;color:#9ca3af;">erovinieta.net e platforma noastră pentru rovinietă — numărul de înmatriculare e deja completat.</p>`
            : `<p style="margin:12px 0 0;text-align:center;font-size:12px;color:#9ca3af;">După reînnoire, pune noua dată în cont ca să te anunțăm și data viitoare.</p>`
        }
        ${unsubscribeNoteHtml(input.unsubscribeUrl, 'ai salvat mașina în contul tău eGhișeul.ro')}`,
  });

  const text = [
    hello,
    '',
    `${what} pentru mașina ${car}, salvată în contul tău eGhișeul.ro, ${when}.`,
    consequence,
    '',
    input.kind === 'rovinieta'
      ? `Cumpără rovinieta online: ${input.actionUrl}`
      : `Vezi mașinile mele în cont: ${input.actionUrl}`,
    '',
    unsubscribeNoteText(input.unsubscribeUrl),
    '',
    '— Echipa eGhișeul.ro',
  ].join('\n');

  return { subject, html, text };
}
