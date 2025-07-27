
'use client';

import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, Search } from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from '@/hooks/use-auth';
import { MegaMenu } from './mega-menu';
import { Input } from './ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './logo';

function HeaderSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/buyer?search=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push('/buyer');
        }
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
            />
        </form>
    );
}


export function Header() {
  const { cartCount } = useCart();
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
            <Logo />
        </div>
        <nav className="flex items-center space-x-4 text-sm font-medium">
          {user?.role === 'buyer' && (
            <MegaMenu />
          )}
        </nav>
        <div className="flex-1 flex justify-center px-8">
            {user?.role === 'buyer' && (
                <HeaderSearchBar />
            )}
        </div>
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
