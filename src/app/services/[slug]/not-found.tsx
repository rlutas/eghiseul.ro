import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileX, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/home/footer';

export default function ServiceNotFound() {
  return (
    <>
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileX className="h-10 w-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Serviciu Negasit
            </h1>

            <p className="text-neutral-600 mb-8">
              Serviciul pe care il cauti nu exista sau a fost dezactivat.
              Te rugam sa verifici adresa sau sa alegi din lista de servicii disponibile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="border-neutral-300">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Inapoi Acasa
                </Link>
              </Button>

              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/#servicii">
                  Vezi Toate Serviciile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
