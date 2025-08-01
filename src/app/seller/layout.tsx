
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ListOrdered, Package, Wand2, Users, FolderKanban, Database } from 'lucide-react';

const navItems = [
  { href: '/seller', label: 'Dashboard', icon: Home },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/categories', label: 'Categories', icon: FolderKanban },
  { href: '/seller/orders', label: 'Orders', icon: ListOrdered },
  { href: '/seller/delivery', label: 'Delivery Team', icon: Users },
  { href: '/seller/ai-description', label: 'AI Tools', icon: Wand2 },
  { href: '/seller/seed', label: 'Seed Data', icon: Database },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-[240px_1fr] gap-8 py-12">
      <aside className="hidden md:flex flex-col gap-6">
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
