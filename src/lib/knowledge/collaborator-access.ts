import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const ADMIN_ROLES = ['super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee'];

/**
 * Gardă server-side pentru paginile de ghid din portalul colaboratorului.
 * Layout-ul portalului e client-side (redirect după ce se încarcă profilul),
 * deci o pagină server care servește conținut din docs/ verifică singură
 * rolul: colaborator, sau un rol de admin (previzualizare).
 */
export async function requireCollaboratorOrAdmin(): Promise<{ userId: string; role: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/colaborator/ghid');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role ?? '';
  if (role !== 'collaborator' && !ADMIN_ROLES.includes(role)) redirect('/');
  return { userId: user.id, role };
}
