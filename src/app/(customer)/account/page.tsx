import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/shared/logout-button'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Contul meu</h1>
          <LogoutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informații cont</CardTitle>
            <CardDescription>Detaliile contului tău eGhiseul.ro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Prenume</p>
                <p className="font-medium">{profile?.first_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nume</p>
                <p className="font-medium">{profile?.last_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{profile?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">KYC Verificat</p>
                <p className="font-medium">
                  {profile?.kyc_verified ? (
                    <span className="text-green-600">Da</span>
                  ) : (
                    <span className="text-yellow-600">Nu</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">2FA Activat</p>
                <p className="font-medium">
                  {profile?.two_factor_enabled ? (
                    <span className="text-green-600">Da</span>
                  ) : (
                    <span className="text-muted-foreground">Nu</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comenzile mele</CardTitle>
            <CardDescription>Istoricul comenzilor tale</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Nu ai încă nicio comandă.
            </p>
            <Button className="mt-4" asChild>
              <a href="/services">Vezi serviciile disponibile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
