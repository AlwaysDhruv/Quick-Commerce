'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Package, ListOrdered } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { AppHeader } from '@/components/AppHeader';
import { cn } from '@/lib/utils';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { userType } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (userType !== 'seller') {
      router.push('/');
    }
  }, [userType, router]);

  if (userType !== 'seller') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  const navLinks = [
    { href: '/seller/orders', label: 'Orders', icon: <ListOrdered className="h-4 w-4" /> },
    { href: '/seller/products', label: 'Products', icon: <Package className="h-4 w-4" /> },
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
              pathname.startsWith(link.href) && "text-foreground font-semibold"
            )}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </AppHeader>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
