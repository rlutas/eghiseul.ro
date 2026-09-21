'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from './ui';

/**
 * documentero.ro contact form. Same API as eghiseul (/api/contact), but the
 * fields ask what a civil-status client actually knows: which document, for
 * which country, by when. The document and country go into the message
 * body so the inbox reads them at a glance; `subject` stays one of the
 * server's known keys.
 */
const ACTE = [
  ['nastere', 'Certificat de naștere (duplicat)'],
  ['casatorie', 'Certificat de căsătorie (duplicat)'],
  ['celibat', 'Certificat de celibat (Anexa 18)'],
  ['extras', 'Extras multilingv (naștere sau căsătorie)'],
  ['altceva', 'Altceva / nu știu ce act îmi trebuie'],
] as const;

const field =
  'h-12 w-full rounded-xl border-[1.5px] border-d-line bg-d-bg px-4 text-[15px] text-d-ink outline-none transition-colors placeholder:text-d-muted focus:border-d-acc';
const label = 'text-[13px] font-bold text-d-ink';

export function ContactFormDocumentero({ whatsappHref }: { whatsappHref: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);
    const act = ACTE.find(([k]) => k === String(data.get('act')))?.[1] ?? 'nespecificat';
    const tara = String(data.get('tara') ?? '').trim();
    const orderNumber = String(data.get('orderNumber') ?? '').trim();
    const message = [`Act: ${act}`, tara ? `Țara / instituția: ${tara}` : null, '', String(data.get('message') ?? '').trim()].filter((x) => x !== null).join('\n');
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      orderNumber,
      subject: orderNumber ? 'comanda' : 'intrebare',
      message,
      website: String(data.get('website') ?? ''),
      newsletter: data.get('newsletter') === 'on',
    };
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'A apărut o eroare. Încearcă din nou sau scrie-ne pe WhatsApp.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      form.reset();
    } catch {
      setError('Nu am putut trimite mesajul. Verifică conexiunea sau scrie-ne pe WhatsApp.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl bg-d-soft p-7">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-d-acc text-d-ink"><Check /></span>
        <span className="text-[22px] font-bold tracking-[-0.02em]">Mesaj trimis.</span>
        <p className="m-0 text-[15px] leading-[1.6] text-d-muted">Răspundem pe email în orele de program, de obicei sub o oră. Dacă e urgent, scrie-ne și pe WhatsApp.</p>
        <button type="button" onClick={() => setStatus('idle')} className="text-[14px] font-semibold underline underline-offset-2 hover:text-d-acc">Trimite alt mesaj</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Nu completa acest câmp</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={label}>Numele tău</label>
          <input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Ana Popescu" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="ana@exemplu.ro" className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="act" className={label}>Ce act ai nevoie?</label>
          <select id="act" name="act" defaultValue="nastere" className={`${field} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230F2A22%22 stroke-width=%222.4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10`}>
            {ACTE.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tara" className={label}>Pentru ce țară sau instituție? <span className="font-normal text-d-muted">(opțional)</span></label>
          <input id="tara" name="tara" maxLength={120} placeholder="Italia, primăria din Torino" className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={label}>Telefon <span className="font-normal text-d-muted">(opțional, pentru WhatsApp)</span></label>
          <input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+40 7xx xxx xxx" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="orderNumber" className={label}>Cod comandă <span className="font-normal text-d-muted">(dacă ai deja una)</span></label>
          <input id="orderNumber" name="orderNumber" maxLength={60} placeholder="E-260921-XXXXX" className={field} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={label}>Ce vrei să știi?</label>
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Ex.: mă căsătoresc în Spania în decembrie, ce acte îmi trebuie și cât durează?" className={`${field} h-auto resize-y py-3`} />
      </div>

      {status === 'error' && (
        <p className="m-0 rounded-xl border border-[#E0B4A8] bg-[#FBEDE8] px-4 py-3 text-[14px] text-[#7A2E1C]" role="alert">{error}</p>
      )}

      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.5] text-d-muted">
        <input type="checkbox" name="newsletter" className="mt-0.5 h-4 w-4 rounded border-d-line accent-d-acc" />
        <span>Vreau să primesc pe email ghidurile noi de pe documentero.ro. Mă pot dezabona oricând, cu un click.</span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === 'sending'} className="inline-flex h-[52px] items-center justify-center rounded-xl bg-d-acc px-6 text-[16px] font-bold text-d-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          {status === 'sending' ? 'Se trimite…' : 'Trimite mesajul'}
        </button>
        <a href={whatsappHref} className="inline-flex h-[52px] items-center justify-center rounded-xl border-[1.5px] border-d-line bg-d-card px-6 text-[16px] font-semibold hover:border-d-acc">
          Sau scrie pe WhatsApp
        </a>
      </div>
      <p className="m-0 text-[12px] leading-[1.5] text-d-muted">
        Prin trimitere ești de acord cu <Link href="/politica-de-confidentialitate/" className="underline underline-offset-2 hover:text-d-acc">politica de confidențialitate</Link>. Nu trimite poze cu acte aici; le încarci în comandă, criptat.
      </p>
    </form>
  );
}
