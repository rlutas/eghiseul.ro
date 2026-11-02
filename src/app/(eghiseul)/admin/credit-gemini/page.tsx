import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkPermission } from '@/lib/admin/permissions';
import { GeminiCreditPanel } from './GeminiCreditPanel';

export const dynamic = 'force-dynamic';

export default async function GeminiCreditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!(await checkPermission(user.id, 'settings.manage'))) redirect('/admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Credit Gemini (OCR)</h1>
        <p className="text-sm text-neutral-500">
          Citirea automată a actelor (Google Gemini) pe eghiseul, documentero, CJO și ecazier folosește același
          credit preplătit din AI Studio. Google nu arată soldul prin API, așa că îl estimăm: alimentările trecute aici
          minus costul fiecărei citiri înregistrate.
        </p>
      </div>
      <GeminiCreditPanel />
    </div>
  );
}
