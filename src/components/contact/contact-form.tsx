'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SUBJECTS = [
  { value: 'intrebare', label: 'Întrebare generală' },
  { value: 'comanda', label: 'Întrebare despre o comandă' },
  { value: 'reclamatie', label: 'Reclamație' },
  { value: 'colaborare', label: 'Colaborare / parteneriat' },
  { value: 'altele', label: 'Altele' },
];

export function ContactForm() {
  const [subject, setSubject] = useState('intrebare');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      orderNumber: String(data.get('orderNumber') ?? ''),
      subject,
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''), // honeypot
      newsletter: data.get('newsletter') === 'on',
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'A apărut o eroare. Încearcă din nou.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      form.reset();
      setSubject('intrebare');
    } catch {
      setError('Nu am putut trimite mesajul. Verifică conexiunea și încearcă din nou.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-secondary-900 mb-2">Mesaj trimis!</h2>
        <p className="text-neutral-600">
          Îți mulțumim. Îți răspundem de regulă în aceeași zi lucrătoare, pe adresa de email furnizată.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-5 text-sm font-semibold text-primary-700 underline"
        >
          Trimite alt mesaj
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot — hidden from users, catches bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Nu completa acest câmp</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nume și prenume <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Ion Popescu" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="nume@exemplu.ro" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon <span className="text-neutral-400 font-normal">(opțional)</span></Label>
          <Input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="07XX XXX XXX" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="orderNumber">Nr. comandă <span className="text-neutral-400 font-normal">(opțional)</span></Label>
          <Input id="orderNumber" name="orderNumber" maxLength={60} placeholder="EGH-20260101-12345" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subiect</Label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger id="subject" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Mesaj <span className="text-red-500">*</span></Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Cu ce te putem ajuta?" />
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-colors hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? (
            <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Se trimite…</>
          ) : (
            <><Send className="h-5 w-5" aria-hidden="true" /> Trimite mesajul</>
          )}
        </button>
        <p className="text-xs text-neutral-500">
          Prin trimitere ești de acord cu{' '}
          <a href="/politica-de-confidentialitate/" className="underline hover:text-primary-700">politica de confidențialitate</a>.
        </p>
      </div>

      {/* Newsletter opt-in — GDPR: unchecked by default, explicit wording */}
      <label className="flex items-start gap-2.5 text-sm text-neutral-600 cursor-pointer">
        <input
          type="checkbox"
          name="newsletter"
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-primary-500"
        />
        <span>
          Sunt de acord să primesc pe email noutăți, ghiduri și oferte de la eGhișeul.ro.
          Mă pot dezabona oricând, printr-un singur click.
        </span>
      </label>
    </form>
  );
}
