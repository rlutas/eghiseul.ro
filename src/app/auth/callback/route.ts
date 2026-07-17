import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Land each role on its home: collaborators on their portal, admin
      // roles on /admin, customers on /account. An explicit ?next= wins ONLY
      // if the role can access it (a stale /colaborator link would bounce an
      // admin to the homepage via the layout guard).
      const ADMIN_ROLES = ['super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee']
      let role = ''
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        role = profile?.role ?? ''
      }
      const roleHome =
        role === 'collaborator' ? '/colaborator'
        : ADMIN_ROLES.includes(role) ? '/admin'
        : '/account'
      let target = searchParams.get('next') ? next : roleHome
      if (target.startsWith('/colaborator') && role !== 'collaborator') target = roleHome
      if (target.startsWith('/admin') && !ADMIN_ROLES.includes(role)) target = roleHome
      return NextResponse.redirect(`${origin}${target}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
