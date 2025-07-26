'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Store, Truck } from 'lucide-react';

export default function DeliveryDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">This is your delivery dashboard.</p>
        </div>
      </div>

      {user?.associatedSellerId ? (
        <Card>
            <CardHeader>
                <CardTitle>You're part of a team!</CardTitle>
                <CardDescription>
                    You are currently assigned to deliver orders for <strong>{user.associatedSellerName}</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/delivery/orders">
                        <Truck className="mr-2" />
                        View Assigned Orders
                    </Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
         <div className="text-center py-20 rounded-lg border-2 border-dashed">
            <h2 className="text-xl font-semibold">You're a free agent!</h2>
            <p className="text-muted-foreground mt-2">You are not yet associated with any seller's shop.</p>
            <Button asChild className="mt-4">
                <Link href="/delivery/shops">
                    <Store className="mr-2" />
                    Find Shops to Join
                </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
