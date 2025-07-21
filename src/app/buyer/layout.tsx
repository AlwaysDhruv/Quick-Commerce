'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';

import { useAppContext } from '@/hooks/useAppContext';
import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { userType, cartCount } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (userType !== 'buyer') {
      router.push('/');
    }
  }, [userType, router]);

  if (userType !== 'buyer') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }
  
  const navLinks = [
      { href: '/buyer', label: 'Products', icon: <Package className="h-4 w-4" /> },
      { href: '/buyer/cart', label: 'Cart', icon: <ShoppingCart className="h-4 w-4" />, badge: cartCount > 0 ? cartCount : undefined },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "text-foreground font-semibold"
            )}
          >
            {link.icon}
            {link.label}
            {link.badge && <Badge className="ml-1">{link.badge}</Badge>}
          </Link>
        ))}
      </AppHeader>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
