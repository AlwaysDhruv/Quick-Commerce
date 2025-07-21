'use client';

import Link from 'next/link';
import { CircleUser, LogOut, Package, ShoppingCart, Slice, Store } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const { userType, setUserType } = useAppContext();

  const handleLogout = () => {
    setUserType(null);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <Link href={userType === 'buyer' ? '/buyer' : '/seller'} className="flex items-center gap-2 font-semibold">
        <Slice className="h-6 w-6 text-primary" />
        <span className="text-lg">Orange Slice</span>
      </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {children}
      </nav>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {userType === 'buyer' ? 'Buyer Account' : 'Seller Account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setUserType(userType === 'buyer' ? 'seller' : 'buyer')}>
                {userType === 'buyer' ? <Store className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              <span>Switch to {userType === 'buyer' ? 'Seller' : 'Buyer'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
