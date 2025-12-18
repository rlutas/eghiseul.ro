'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Acasă', type: 'route' as const },
  { href: '/#servicii', label: 'Servicii', type: 'hash' as const },
  { href: '/#cum-functioneaza', label: 'Cum Funcționează', type: 'hash' as const },
  { href: '/#intrebari', label: 'Întrebări Frecvente', type: 'hash' as const },
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
    <>
      {/* Top Bar - Desktop only */}
      <div className="hidden lg:block bg-secondary-900 text-white py-2">
        <div className="container mx-auto px-4 max-w-[1100px]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-white/70">Luni - Vineri: 09:00 - 18:00</span>
              <span className="text-white/30">|</span>
              <a href="tel:+40312299399" className="flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4" />
                +40 312 299 399
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/70">Peste 200.000 documente procesate</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-white font-medium">4.9/5</span>
                <span className="text-white/50 text-xs">Google</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'fixed top-0 lg:top-[40px] left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'lg:top-0 bg-white shadow-[0_4px_20px_rgba(6,16,31,0.08)]'
            : 'bg-white'
        )}
      >
        <div className="container mx-auto px-4 lg:px-6 max-w-[1100px]">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="eGhișeul.ro - Acasă">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(236,185,95,0.3)] group-hover:shadow-[0_6px_16px_rgba(236,185,95,0.4)] transition-shadow">
                <span className="text-secondary-900 font-extrabold text-base">eG</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-secondary-900 leading-tight">
                  eGhișeul<span className="text-primary-500">.ro</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-medium tracking-wide hidden md:block">
                  Documente oficiale online
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigare principală">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={cn(
                    'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                    isActiveLink(link)
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                asChild
                className="text-secondary-700 hover:text-secondary-900 hover:bg-neutral-100 font-semibold"
              >
                <Link href="/auth/login">Autentificare</Link>
              </Button>
              <Button
                asChild
                className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-6 rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/auth/register">Începe Acum</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Deschide meniul"
                  className="hover:bg-primary-50"
                >
                  <Menu className="h-6 w-6 text-secondary-900" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                        <span className="text-secondary-900 font-bold text-sm">eG</span>
                      </div>
                      <span className="text-lg font-bold text-secondary-900">
                        eGhișeul<span className="text-primary-500">.ro</span>
                      </span>
                    </Link>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Închide meniul"
                        className="hover:bg-white"
                      >
                        <X className="h-5 w-5 text-secondary-700" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col p-4 flex-1" aria-label="Navigare mobilă">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          handleNavClick(e, link);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          'text-base font-semibold px-4 py-4 rounded-xl transition-all border-l-4',
                          isActiveLink(link)
                            ? 'text-primary-700 bg-primary-50 border-l-primary-500'
                            : 'text-secondary-700 hover:bg-neutral-50 border-l-transparent hover:border-l-primary-300'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Contact Info */}
                  <div className="px-4 py-4 border-t border-neutral-100 bg-neutral-50">
                    <a
                      href="tel:+40312299399"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Sună-ne acum</p>
                        <p className="text-sm font-bold text-secondary-900">+40 312 299 399</p>
                      </div>
                    </a>
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="p-4 space-y-3 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full border-2 border-neutral-200 h-12 text-secondary-700 font-semibold rounded-xl hover:bg-neutral-50"
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
                      className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold h-12 rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)]"
                    >
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Începe Acum
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-[112px]" />
    </>
  );
}
