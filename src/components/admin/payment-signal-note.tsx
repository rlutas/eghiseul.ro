import { CreditCard } from 'lucide-react';
import { paymentSignal, type PaymentSignalInput } from '@/lib/admin/payment-signal';

/**
 * Unde s-a oprit clientul pe o comandă neplătită: card refuzat (roșu, cu
 * sugestia IBAN), a ajuns la plată (galben) sau pasul din wizard (gri).
 * `compact` = o singură linie, pentru coloana de status din liste.
 */
export function PaymentSignalNote({
  order,
  compact = false,
}: {
  order: PaymentSignalInput;
  compact?: boolean;
}) {
  const s = paymentSignal(order);

  if (s.kind === 'step') {
    if (!order.current_step) return null;
    return <div className="mt-0.5 text-[10px] text-muted-foreground whitespace-nowrap">{s.label}</div>;
  }

  if (s.kind === 'failed') {
    return (
      <div className="mt-1" title={`${s.reason}. ${s.hint}`}>
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
          <CreditCard className="h-3 w-3" />
          {s.label}
        </span>
        {!compact && (
          <div className="mt-0.5 text-[11px] text-red-700">
            {s.reason} · <span className="font-medium">{s.hint}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-1" title={s.hint}>
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
        <CreditCard className="h-3 w-3" />
        {s.label}
      </span>
      {!compact && <div className="mt-0.5 text-[11px] text-amber-800">{s.hint}</div>}
    </div>
  );
}
