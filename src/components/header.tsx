
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

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'buyer':
        return "/buyer";
      case 'seller':
        return "/seller";
      case 'delivery':
        return "/delivery";
      default:
        return "/";
    }
  }

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
           {user && user.role !== 'buyer' && (
            <Link href={getDashboardLink()!} className="text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
           {user?.role === 'buyer' && (
            <Button asChild variant="ghost" size="icon" className="relative h-9 w-9">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
