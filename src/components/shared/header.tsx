'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Acasă', type: 'route' as const },
  { href: '/#servicii', label: 'Servicii', type: 'hash' as const },
  { href: '/#cum-functioneaza', label: 'Cum Funcționează', type: 'hash' as const },
  { href: '/#contact', label: 'Contact', type: 'hash' as const },
];

// Smooth scroll utility
const smoothScrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const yOffset = -80;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (link: typeof navLinks[number]) => {
    if (link.type === 'route') {
      return pathname === link.href;
    }
    return pathname === '/' && typeof window !== 'undefined' && window.location.hash === link.href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[number]) => {
    if (link.type === 'hash' && pathname === '/') {
      e.preventDefault();
      const sectionId = link.href.replace('/#', '');
      smoothScrollToSection(sectionId);
      setIsMobileMenuOpen(false);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', link.href);
      }
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-md border-b border-neutral-200'
          : 'bg-white/95 backdrop-blur-sm'
      )}
    >
      <div className="container mx-auto px-4 lg:px-6 max-w-[1100px]">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="eGhișeul.ro - Acasă">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-secondary-900 font-bold text-sm">eG</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">
              eGhișeul<span className="text-primary-500">.ro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  'text-sm font-medium transition-colors relative py-2',
                  isActiveLink(link)
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600',
                  'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-500 after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100',
                  isActiveLink(link) && 'after:scale-x-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-secondary-700 hover:text-secondary-900 hover:bg-neutral-100"
            >
              <Link href="/auth/login">Autentificare</Link>
            </Button>
            <Button
              asChild
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Link href="/auth/register">Înregistrare</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Deschide meniul">
                <Menu className="h-6 w-6 text-secondary-900" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <div className="flex flex-col h-full">
                {/* Mobile Header with Close Button */}
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <span className="text-secondary-900 font-bold text-sm">eG</span>
                    </div>
                    <span className="text-xl font-bold text-secondary-900">
                      eGhișeul<span className="text-primary-500">.ro</span>
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Închide meniul"
                    >
                      <X className="h-5 w-5 text-secondary-700" />
                    </Button>
                  </SheetClose>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-1 py-6" aria-label="Navigare mobilă">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        handleNavClick(e, link);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        'text-base font-medium px-4 py-4 rounded-xl transition-colors',
                        'active:bg-neutral-200',
                        isActiveLink(link)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-secondary-700 active:bg-neutral-100'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="mt-auto pt-6 border-t border-neutral-200 space-y-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-neutral-300 h-12 text-secondary-700"
                  >
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Autentificare
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold h-12 shadow-sm"
                  >
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Înregistrare
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
