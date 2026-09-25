/**
 * „Ce se întâmplă după comandă" — the identification process as agreed with
 * the topograph (25.09.2026), on both identification pages:
 *
 *  1. the topograph searches the ANCPI records; found → CF extract, 1–3
 *     working days (by owner with several properties: the client picks one);
 *  2. not found → request to OCPI, which searches its archive (~10 working
 *     days, OCPI's own deadline shown on the order page); the OCPI document
 *     is the result either way.
 *
 * Plus the two things that make it easier for everyone: an old act uploaded
 * with the order, and the message thread on the order page.
 */

import { FileSearch, Landmark, MessageSquare, Paperclip } from 'lucide-react';

interface Props {
  variant: 'address' | 'owner';
}

export function IdentificationProcessSection({ variant }: Props) {
  const byOwner = variant === 'owner';
  return (
    <section className="py-12 lg:py-16 bg-neutral-50" aria-labelledby="identificare-proces">
      <div className="container mx-auto px-4 max-w-[1000px]">
        <h2 id="identificare-proces" className="text-2xl sm:text-3xl font-extrabold text-secondary-900 mb-3 text-center">
          Ce se întâmplă după ce comanzi
        </h2>
        <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-10">
          Lucrarea o face un topograf autorizat. Vezi în pagina comenzii la ce pas e și poți vorbi direct cu noi
          acolo.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <FileSearch className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Pasul 1 · 1–3 zile lucrătoare</p>
                <h3 className="text-lg font-bold text-secondary-900">Topograful caută imobilul</h3>
              </div>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {byOwner
                ? 'Căutăm imobilele înscrise pe numele proprietarului în evidențele ANCPI. Dacă găsim unul, îți obținem extrasul de carte funciară. Dacă găsim mai multe, îți scriem lista în pagina comenzii și alegi tu imobilul pentru care scoatem extrasul inclus în preț. Pentru celelalte poți comanda separat câte un extras.'
                : 'Căutăm imobilul după adresă în evidențele ANCPI. Când îl găsim, îți obținem extrasul de carte funciară, care arată numărul cărții funciare, proprietarul și sarcinile. Cu extrasul, serviciul e complet.'}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-800">
                <Landmark className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-700">Pasul 2 · până la ~10 zile lucrătoare</p>
                <h3 className="text-lg font-bold text-secondary-900">Dacă imobilul nu apare online</h3>
              </div>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed mb-3">
              Unele imobile au cartea funciară veche, pe hârtie, încă nedigitalizată, sau nu au fost înscrise
              niciodată. Atunci topograful depune cerere la OCPI, care caută în arhivă. Termenul dat de OCPI îl
              vezi în pagina comenzii.
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-700">
              <li>
                <strong className="text-secondary-900">OCPI găsește cartea funciară:</strong> o digitalizează și
                primești documentul care o confirmă, cu numărul ei. Extrasul îl poți comanda apoi separat.
              </li>
              <li>
                <strong className="text-secondary-900">OCPI nu o găsește:</strong> primești documentul oficial
                care confirmă asta. Cu el, un topograf din zona ta poate înscrie imobilul în cartea funciară.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="flex gap-3 rounded-2xl border border-primary-200 bg-primary-50/60 p-5">
            <Paperclip className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
            <p className="text-sm text-neutral-700 leading-relaxed">
              <strong className="text-secondary-900">Ai un act vechi al imobilului?</strong> Un extras de carte
              funciară vechi, titlul de proprietate sau contractul de vânzare-cumpărare grăbesc mult căutarea. Îl
              încarci ca poză direct în formularul de comandă.
            </p>
          </div>
          <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-secondary-700" aria-hidden="true" />
            <p className="text-sm text-neutral-700 leading-relaxed">
              <strong className="text-secondary-900">Te întrebăm direct, nu prin intermediari.</strong> Dacă
              topograful are nevoie de o informație, primești un email și răspunzi din pagina comenzii, cu poze
              atașate dacă e nevoie.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
