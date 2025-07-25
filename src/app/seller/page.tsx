'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersBySeller, getProductsBySeller, getUsersCountFromFirestore } from '@/lib/firestore';
import { DollarSign, Package, ShoppingCart, Users, Loader2 } from 'lucide-react';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [products, orders, users] = await Promise.all([
            getProductsBySeller(user.uid),
            getOrdersBySeller(user.uid),
            getUsersCountFromFirestore(),
          ]);

          setProductCount(products.length);
          setOrderCount(orders.length);
          setTotalRevenue(orders.reduce((sum, order) => sum + order.total, 0));
          setUserCount(users);

        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const renderStatCard = (title: string, value: string | number | null, icon: React.ReactNode, subtext?: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground">Here&apos;s a summary of your shop&apos;s performance.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard('Total Revenue', totalRevenue !== null ? `$${totalRevenue.toLocaleString()}` : 'N/A', <DollarSign className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Orders', orderCount !== null ? `+${orderCount}` : 'N/A', <ShoppingCart className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Products', productCount !== null ? productCount : 'N/A', <Package className="h-4 w-4 text-muted-foreground" />, 'Total products listed')}
        {renderStatCard('Total Users', userCount !== null ? userCount : 'N/A', <Users className="h-4 w-4 text-muted-foreground" />, 'Total registered users')}
      </div>
    </div>
  );
}
