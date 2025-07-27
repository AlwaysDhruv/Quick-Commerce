
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersBySeller, getProductsBySeller, getUniqueBuyerCountForSeller, type Order } from '@/lib/firestore';
import { DollarSign, Package, ShoppingCart, Users, Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

function SalesChart({ orders }: { orders: Order[] }) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // Aggregate sales by month
    const monthlySales = orders.reduce((acc, order) => {
      const month = format(order.createdAt.toDate(), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    // Get the last 6 months including the current one
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return sortedMonths.slice(-6).map(month => ({
      name: month,
      total: monthlySales[month],
    }));
  }, [orders]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">No sales data yet. Once you get orders, your sales chart will appear here.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Sales Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
            config={{ total: { label: 'Sales', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
             />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [buyerCount, setBuyerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (user) {
      setLoading(true);
      try {
        const [products, fetchedOrders, buyers] = await Promise.all([
          getProductsBySeller(user.uid),
          getOrdersBySeller(user.uid),
          getUniqueBuyerCountForSeller(user.uid),
        ]);

        setProductCount(products.length);
        setOrders(fetchedOrders);
        setTotalRevenue(fetchedOrders.reduce((sum, order) => sum + order.total, 0));
        setBuyerCount(buyers);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Here&apos;s a summary of your shop&apos;s performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard('Total Revenue', totalRevenue !== null ? `$${totalRevenue.toLocaleString()}` : 'N/A', <DollarSign className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Orders', orders ? `+${orders.length}` : 'N/A', <ShoppingCart className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Products', productCount !== null ? productCount : 'N/A', <Package className="h-4 w-4 text-muted-foreground" />, 'Total products listed')}
        {renderStatCard('Total Buyers', buyerCount !== null ? buyerCount : 'N/A', <Users className="h-4 w-4 text-muted-foreground" />, 'Customers who bought from you')}
      </div>

      <div>
        <SalesChart orders={orders} />
      </div>
    </div>
  );
}
