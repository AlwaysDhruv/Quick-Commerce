'use client';

import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from 'lucide-react';
import { Logo } from './logo';
import { UserNav } from './user-nav';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="ml-6 flex items-center space-x-4 text-sm font-medium">
          {user?.role === 'buyer' && (
            <Link href="/buyer" className="text-muted-foreground transition-colors hover:text-foreground">
              Shop
            </Link>
          )}
           {user?.role === 'seller' && (
            <Link href="/seller" className="text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
