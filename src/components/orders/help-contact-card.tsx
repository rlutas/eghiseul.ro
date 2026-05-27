'use client';

import { MessageCircle, Phone } from 'lucide-react';

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+40 745 850 700';
const SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL ||
  // Sister-style wa.me link with prefilled greeting. Strip non-digits from
  // the phone number for the URL but keep the formatted version for display.
  `https://wa.me/${SUPPORT_PHONE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bună, am o întrebare despre comanda mea ')}`;

/**
 * Fixed help card on the customer-facing /comanda/status page. Primary
 * touchpoint when the client gets confused or stuck — surfaces WhatsApp +
 * phone first since they're the channels with sub-1h response in business
 * hours.
 *
 * Matches sister project (cazierjudiciaronline.com) UX where the same green
 * card sits right under the status header.
 */
export function HelpContactCard() {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-green-900">Ai întrebări despre comandă?</p>
          <p className="mt-0.5 text-xs text-green-800">
            Răspundem rapid pe WhatsApp în zilele lucrătoare 09–17.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100"
          >
            <Phone className="h-3.5 w-3.5" />
            {SUPPORT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}
