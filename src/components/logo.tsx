import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-white", className)}>
      <ShoppingBag className="h-7 w-7 text-accent" />
      <span className="font-headline">SwiftShopper</span>
    </Link>
  );
}
