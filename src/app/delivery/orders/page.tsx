
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersBySeller, type Order } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';


function OrderRow({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <React.Fragment>
        <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
          <TableCell>{order.buyerName}</TableCell>
          <TableCell>{format(order.createdAt.toDate(), 'PPP')}</TableCell>
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
           <TableCell className="text-center">
              <Button variant="ghost" size="sm" className="w-9 p-0" asChild>
                  <div>
                    <span className="sr-only">Toggle details</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </div>
               </Button>
          </TableCell>
        </TableRow>
        {isOpen && (
          <tr className="bg-muted/50">
            <TableCell colSpan={6} className="p-0">
               <div className="p-6">
                 <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold mb-2">Order Details</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID</span>
                                <span className="font-mono text-foreground">{order.id}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Total</span>
                                <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Buyer ID</span>
                                <span className="font-mono text-foreground">{order.buyerId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Date</span>
                                <span className="text-foreground">{format(order.createdAt.toDate(), 'PPpp')}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 mt-4">Items</h4>
                         <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Image</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-center">Quantity</TableHead>
                              <TableHead className="text-right">Unit Price</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map(item => (
                               <TableRow key={item.product.id}>
                                <TableCell>
                                   <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md object-cover"
                                    data-ai-hint={item.product.dataAiHint}
                                  />
                                </TableCell>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-medium">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                               </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                    </div>
                 </div>
              </div>
            </TableCell>
          </tr>
        )}
    </React.Fragment>
  )
}

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (user && user.associatedSellerId) {
      setIsLoading(true);
      const fetchedOrders = await getOrdersBySeller(user.associatedSellerId);
      fetchedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setOrders(fetchedOrders);
      setIsLoading(false);
    } else {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">My Assigned Orders</h1>
        <p className="text-muted-foreground">
          Orders to be delivered for <strong>{user?.associatedSellerName || '...'}</strong>.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of the most recent orders assigned to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px] text-center">Details</TableHead>
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
                    You have no orders to deliver yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

