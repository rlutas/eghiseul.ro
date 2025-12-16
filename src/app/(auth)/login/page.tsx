import { Metadata } from 'next'
import { LoginForm } from '@/components/forms/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Autentificare | eGhiseul.ro',
  description: 'Autentifică-te în contul tău eGhiseul.ro',
}

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Bine ai revenit!</CardTitle>
        <CardDescription>
          Autentifică-te pentru a accesa contul tău
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
