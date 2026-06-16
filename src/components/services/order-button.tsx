import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderButtonProps {
  href: string;
  children: React.ReactNode;
  /** Visual size. `lg` = hero/CTA, `md` = inline. */
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Primary order CTA used site-wide. The arrow is hidden by default and slides
 * in only on hover/focus (width + opacity transition), so the resting state is
 * clean and the affordance appears on intent. Respects reduced-motion.
 */
export function OrderButton({ href, children, size = 'lg', className }: OrderButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center justify-center rounded-xl bg-primary-500 font-bold text-secondary-900',
        'shadow-[0_4px_14px_rgba(236,185,95,0.4)] transition-all duration-200',
        'hover:bg-primary-600 hover:shadow-[0_8px_22px_rgba(236,185,95,0.5)] hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
        size === 'lg' ? 'h-14 px-8 text-lg' : 'h-12 px-6 text-base',
        className,
      )}
    >
      <span>{children}</span>
      <ArrowRight
        className="h-5 w-5 max-w-0 -translate-x-1 opacity-0 transition-all duration-200 motion-reduce:transition-none group-hover:ml-2 group-hover:max-w-[1.5rem] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[1.5rem] group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
