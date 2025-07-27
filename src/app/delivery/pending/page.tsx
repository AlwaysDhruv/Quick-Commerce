
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersByDeliveryPerson, updateOrderStatus, type Order } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ChevronDown, CheckCircle, PackageCheck, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';


function OrderRow({ order, onOrderUpdated }: { order: Order, onOrderUpdated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (status: Order['status']) => {
    setIsUpdating(true);
    try {
        await updateOrderStatus(order.id, status);
        toast({
            title: 'Order Updated',
            description: `Order ...${order.id.slice(-6)} has been marked as ${status}.`
        });
        onOrderUpdated();
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Failed to update order status.',
            variant: 'destructive',
        });
    } finally {
        setIsUpdating(false);
    }
  }

  return (
    <React.Fragment>
        <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
          <TableCell>{order.buyerName}</TableCell>
          <TableCell>{format(order.createdAt.toDate(), 'PPP')}</TableCell>
          <TableCell className="text-center">
            <Badge
              className={cn(
                order.status === 'Shipped' && 'bg-blue-500/20 text-blue-500',
                order.status === 'Out for Delivery' && 'bg-orange-500/20 text-orange-500',
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
            <TableCell colSpan={5} className="p-0">
               <div className="p-6 grid md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <h4 className="font-semibold mb-2">Items</h4>
                     <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
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
                           </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 </div>
                 <div className="space-y-3">
                     <h4 className="font-semibold mb-2">Shipping Address</h4>
                    {order.address ? (
                        <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50 space-y-2">
                            <p className="font-bold text-foreground">{order.address.fullName}</p>
                            <p>{order.address.phone}</p>
                            <p>{order.address.streetAddress}</p>
                            <p>{order.address.city}, {order.address.district} - {order.address.pincode}</p>
                            <p>{order.address.country}</p>
                            {order.address.latitude && order.address.longitude && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-accent hover:underline"
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    View on Map
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50">
                            Address not available for this order.
                        </div>
                    )}
                     <div className="flex justify-end pt-4 gap-2">
                        {order.status === 'Shipped' && (
                             <Button onClick={() => handleStatusUpdate('Out for Delivery')} disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="mr-2 animate-spin" /> : <PackageCheck className="mr-2" /> }
                                Mark as Out for Delivery
                            </Button>
                        )}
                        {order.status === 'Out for Delivery' && (
                             <Button onClick={() => handleStatusUpdate('Delivered')} disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle className="mr-2" /> }
                                Mark as Delivered
                            </Button>
                        )}
                    </div>
                 </div>
              </div>
            </TableCell>
          </tr>
        )}
    </React.Fragment>
  )
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (user?.uid) {
      const fetchedOrders = await getOrdersByDeliveryPerson(user.uid);
      setOrders(fetchedOrders);
      setIsLoading(false);
    } else {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        fetchOrders();
    }
  }, [user]);

  // Real-time listener
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
        collection(db, 'orders'),
        where('deliveryPersonId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, () => {
        fetchOrders();
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const pendingOrders = useMemo(() => {
    return orders
      .filter(order => order.status !== 'Delivered')
      .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()); // Show oldest first
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Pending Orders</h1>
        <p className="text-muted-foreground">
          These are your active orders that need to be delivered.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Active Deliveries</CardTitle>
          <CardDescription>A list of orders that are currently 'Shipped' or 'Out for Delivery'.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px] text-center">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : pendingOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    You have no pending orders. Great job!
                  </TableCell>
                </TableRow>
              ) : (
                pendingOrders.map((order) => (
                  <OrderRow key={order.id} order={order} onOrderUpdated={fetchOrders} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
