'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersBySeller, type Order } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setIsLoading(true);
        const fetchedOrders = await getOrdersBySeller(user.uid);
        // Sort orders by most recent
        fetchedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setOrders(fetchedOrders);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders for your products.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of the most recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    You have no orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
                    <TableCell>{order.buyerName}</TableCell>
                    <TableCell>{format(order.createdAt.toDate(), 'PPP')}</TableCell>
                    <TableCell>
                      {order.items.map(item => `${item.product.name} (x${item.quantity})`).join(', ')}
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          order.status === 'Shipped' && 'bg-blue-500/20 text-blue-500',
                          order.status === 'Processing' && 'bg-yellow-500/20 text-yellow-500',
                          order.status === 'Delivered' && 'bg-green-500/20 text-green-500'
                        )}
                        variant="outline"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
