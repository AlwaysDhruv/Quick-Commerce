'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/hooks/useAppContext';
import { useEffect } from 'react';

export default function RoleSelectionPage() {
  const { setUserType, userType } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (userType === 'buyer') {
      router.push('/buyer');
    } else if (userType === 'seller') {
      router.push('/seller');
    }
  }, [userType, router]);


  const handleRoleSelect = (role: 'buyer' | 'seller') => {
    setUserType(role);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary">Orange Slice</h1>
        <p className="text-muted-foreground mt-2">Your one-stop quick commerce destination.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader className="items-center text-center">
            <ShoppingCart className="w-12 h-12 text-primary mb-4" />
            <CardTitle className="text-2xl">I'm a Buyer</CardTitle>
            <CardDescription>Browse products and start shopping.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleRoleSelect('buyer')}>
              Shop Now
            </Button>
          </CardContent>
        </Card>
        <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader className="items-center text-center">
            <Store className="w-12 h-12 text-primary mb-4" />
            <CardTitle className="text-2xl">I'm a Seller</CardTitle>
            <CardDescription>Manage your products and orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleRoleSelect('seller')}>
              Manage Store
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
