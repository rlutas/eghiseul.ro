'use client';

import Link from 'next/link';
import { ArrowRight, Building2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface ClientTypeOption {
  kind: 'pf' | 'pj';
  href: string;
  title: string;
  desc: string;
}

/**
 * „Alege tipul” opens the two choices on the spot instead of scrolling the
 * page down to the PF/PJ cards (14.10.2026: visitors scrolled and got lost).
 * Each option is a real link straight into its order form.
 */
export function ClientTypeChooser({
  options,
  className,
  children,
}: {
  options: ClientTypeOption[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pentru cine ceri cazierul?</DialogTitle>
          <DialogDescription>Alegi o dată și continui direct în formular.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {options.map((o) => {
            const Icon = o.kind === 'pf' ? User : Building2;
            return (
              <Link
                key={o.href}
                href={o.href}
                className="group flex items-center gap-3 rounded-2xl border-2 border-neutral-200 p-4 transition-colors hover:border-primary-500 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800 group-hover:bg-primary-500 group-hover:text-secondary-900">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-secondary-900">{o.title}</span>
                  <span className="block text-sm leading-snug text-neutral-600">{o.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-400 group-hover:text-primary-700" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
