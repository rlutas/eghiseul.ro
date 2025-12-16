import Link from 'next/link'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            eGhiseul.ro
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/services" className="text-sm hover:text-primary">
              Servicii
            </Link>
            <Link href="/account" className="text-sm hover:text-primary">
              Contul meu
            </Link>
            <Link href="/orders" className="text-sm hover:text-primary">
              Comenzi
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">eGhiseul.ro</h3>
              <p className="text-sm text-muted-foreground">
                Platformă digitală pentru obținerea documentelor oficiale.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Servicii</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/services/cazier-fiscal">Cazier Fiscal</Link></li>
                <li><Link href="/services/cazier-judiciar">Cazier Judiciar</Link></li>
                <li><Link href="/services/extras-carte-funciara">Extras CF</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms">Termeni și Condiții</Link></li>
                <li><Link href="/privacy">Confidențialitate</Link></li>
                <li><Link href="/gdpr">GDPR</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contact@eghiseul.ro</li>
                <li>+40 XXX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} eGhiseul.ro. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  )
}
