
'use client';

import { Logo } from '@/components/logo';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container min-h-[calc(100vh-4rem)] py-8">
      {children}
    </div>
  );
}
