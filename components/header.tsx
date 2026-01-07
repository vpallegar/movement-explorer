'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { NetworkSelector } from './network-selector';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/blocks', label: 'Blocks' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/validators', label: 'Validators' },
  ];

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo_yellow.svg"
              alt="Movement Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="font-bold text-xl hidden sm:block">Movement Network Explorer</h1>
            <h1 className="font-bold text-xl sm:hidden">Movement Explorer</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Network Selector - Hidden on mobile */}
            <div className="hidden md:block">
              <NetworkSelector />
            </div>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium hover:text-primary transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Network</div>
                    <NetworkSelector />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
