
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersByDeliveryPerson, updateOrderStatus, type Order } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ChevronDown, CheckCircle, PackageCheck, Package, Bell, MapPin } from 'lucide-react';
import { format, isToday } from 'date-fns';
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

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (user?.uid) {
      // Don't set loading to true here to avoid flickering on real-time updates
      const fetchedOrders = await getOrdersByDeliveryPerson(user.uid);
      fetchedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setOrders(fetchedOrders);
      setIsLoading(false); // Set loading to false after the first fetch
    } else {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        setIsLoading(true); // Set loading true only on initial component mount with user
        fetchOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Real-time listener for new/updated orders
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
        collection(db, 'orders'),
        where('deliveryPersonId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const initialLoad = isLoading;
        let newAssignments = false;

        snapshot.docChanges().forEach((change) => {
             const changedOrder = { id: change.doc.id, ...change.doc.data() } as Order;
             // Check for new assignments specifically
             if (change.type === "added" && !orders.some(o => o.id === changedOrder.id)) {
                 newAssignments = true;
             }
        });
        
        // Refetch the full list if there are any changes
        // This is simpler and more reliable than trying to merge changes manually
        if (!snapshot.metadata.hasPendingWrites) {
            fetchOrders();

            // Show toast only for new assignments after the initial data load
            if (!initialLoad && newAssignments) {
                toast({
                    title: 'New Order Assigned!',
                    description: 'You have a new order to deliver.',
                });
            }
        }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isLoading]); // Re-run when user or initial loading state changes


  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status !== 'Delivered').length;
    const completedToday = orders.filter(o => o.status === 'Delivered' && o.deliveredAt && isToday(o.deliveredAt.toDate())).length;
    return { pending, completedToday };
  }, [orders]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">All Assigned Orders</h1>
        <p className="text-muted-foreground">
          A complete history of orders assigned to you for <strong>{user?.associatedSellerName || '...'}</strong>.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Total Assigned" value={orders.length} icon={Package} />
            <StatCard title="Pending Deliveries" value={stats.pending} icon={Bell} />
            <StatCard title="Completed Today" value={stats.completedToday} icon={PackageCheck} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Deliveries</CardTitle>
          <CardDescription>A list of all orders assigned to you for delivery, including completed ones.</CardDescription>
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
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    You have no orders to deliver yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
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
