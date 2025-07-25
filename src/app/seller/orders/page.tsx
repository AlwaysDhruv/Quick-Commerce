'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for orders - in a real app, this would come from your database
const mockOrders = [
  {
    id: 'ORD001',
    customer: 'Liam Johnson',
    date: '2023-10-26',
    total: 89.99,
    status: 'Shipped',
    product: 'Handcrafted Leather Wallet',
  },
  {
    id: 'ORD002',
    customer: 'Olivia Smith',
    date: '2023-10-25',
    total: 349.99,
    status: 'Processing',
    product: 'Noise-Cancelling Headphones',
  },
  {
    id: 'ORD003',
    customer: 'Noah Brown',
    date: '2023-10-24',
    total: 45.00,
    status: 'Delivered',
    product: 'Gourmet Coffee Sampler',
  },
    {
    id: 'ORD004',
    customer: 'Emma Davis',
    date: '2023-10-22',
    total: 499.99,
    status: 'Delivered',
    product: 'Luxury Chronograph Watch',
  },
];

export default function OrdersPage() {
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
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
