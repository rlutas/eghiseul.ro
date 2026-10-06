'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone } from 'lucide-react';

const READ_PREFIX = 'eghiseul_ghid_anunt_citit_';

/**
 * Anunțul fixat sus în Ghid. „Am citit” se ține doar în browserul
 * operatorului (conveniență); dacă storage-ul e blocat, anunțul rămâne
 * deschis, ceea ce e varianta sigură.
 */
export function GhidAnnouncement({
  id,
  title,
  dateLabel,
  href,
  html,
}: {
  id: string;
  title: string;
  dateLabel: string | null;
  href: string;
  html: string;
}) {
  const [read, setRead] = useState(false);

  useEffect(() => {
    // Deferred a tick: reading storage is a sync setState inside an effect.
    const t = setTimeout(() => {
      try {
        setRead(localStorage.getItem(READ_PREFIX + id) === '1');
      } catch {
        /* storage blocat: anunțul rămâne deschis */
      }
    }, 0);
    return () => clearTimeout(t);
  }, [id]);

  function markRead(value: boolean) {
    setRead(value);
    try {
      if (value) localStorage.setItem(READ_PREFIX + id, '1');
      else localStorage.removeItem(READ_PREFIX + id);
    } catch {
      /* nimic critic */
    }
  }

  if (read) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm text-neutral-600">
        <Megaphone className="h-4 w-4 text-amber-600" />
        <span>
          Anunț citit:{' '}
          <Link href={href} className="font-medium text-primary-700 hover:underline">
            {title}
          </Link>
          {dateLabel ? <span className="text-neutral-400"> · {dateLabel}</span> : null}
        </span>
        <button type="button" onClick={() => markRead(false)} className="ml-auto text-xs text-neutral-500 hover:underline">
          Deschide din nou
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5" aria-label="Anunț pentru echipă">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Megaphone className="h-5 w-5 text-amber-700" />
        <p className="text-base font-semibold text-amber-950">{title}</p>
        {dateLabel ? <span className="text-xs text-amber-800">{dateLabel}</span> : null}
      </div>
      <div
        className="prose prose-sm max-w-none break-words prose-headings:text-base prose-headings:mt-4 prose-a:text-primary-700 prose-table:text-xs"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => markRead(true)}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Am citit
        </button>
        <Link href={href} className="text-sm text-primary-700 hover:underline">
          Deschide ca pagină
        </Link>
      </div>
    </section>
  );
}
