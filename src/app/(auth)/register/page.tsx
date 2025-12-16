import { Metadata } from 'next'
import { RegisterForm } from '@/components/forms/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Înregistrare | eGhiseul.ro',
  description: 'Creează un cont nou pe eGhiseul.ro',
}

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Creează cont</CardTitle>
        <CardDescription>
          Înregistrează-te pentru a comanda documente online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  )
}
