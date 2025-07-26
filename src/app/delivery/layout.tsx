'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ListOrdered, Package, Truck } from 'lucide-react';
import { Logo } from '@/components/logo';

const navItems = [
  { href: '/delivery', label: 'Dashboard', icon: Home },
  { href: '/delivery/orders', label: 'My Orders', icon: Truck },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-[240px_1fr] gap-8 py-8">
      <aside className="hidden md:flex flex-col gap-6">
        <div className="px-2">
         <Logo />
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="rounded-lg border bg-card/50 p-6">{children}</div>
    </div>
  );
}
