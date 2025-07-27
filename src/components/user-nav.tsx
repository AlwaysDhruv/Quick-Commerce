
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LayoutDashboard, LogIn, LogOut, UserPlus, Loader2, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';


export function UserNav() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case 'buyer':
        return "/buyer/profile";
      case 'seller':
        return "/seller";
      case 'delivery':
        return "/delivery";
      default:
        return "/";
    }
  }

  if (!isMounted) {
    return <Skeleton className="h-8 w-8" />;
  }

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">
            <LogIn className="mr-2" />
            Login
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <Link href="/register">
            <UserPlus className="mr-2" />
            Register
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {/* Vercel avatars are not compatible with Firebase Auth's default empty profile picture */}
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
           {user.role === 'buyer' && (
             <DropdownMenuItem asChild>
                <Link href="/buyer/orders">
                  <ListOrdered className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </Link>
              </DropdownMenuItem>
            )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-full bg-muted ${className}`} />;
}
