'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { mockProducts } from '@/lib/mock-data';
import { DollarSign, Package, ShoppingCart } from 'lucide-react';

export default function SellerDashboard() {
  const { user } = useAuth();
  
  // Mock data for dashboard
  const totalProducts = mockProducts.length;
  const totalRevenue = 12530.50;
  const totalOrders = 152;
  
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground">Here&apos;s a summary of your shop&apos;s performance.</p>
      
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+18.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total products listed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
