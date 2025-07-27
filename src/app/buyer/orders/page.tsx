
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersByBuyer, type Order } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ChevronDown, Search, MapPin, Store, Truck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

function OrderRow({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <React.Fragment>
        <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
          <TableCell>{format(order.createdAt.toDate(), 'PPP')}</TableCell>
          <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
               <div className="p-6 grid md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <h4 className="font-semibold mb-2">Items</h4>
                     <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
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
                            <TableCell className="text-right font-medium">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                           </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 </div>
                 <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Shipping To</h4>
                        <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50 space-y-2">
                            <p className="font-bold text-foreground">{order.address.fullName}</p>
                            <p>{order.address.streetAddress}</p>
                            <p>{order.address.city}, {order.address.district} - {order.address.pincode}</p>
                            <p>{order.address.country}</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Sold By</h4>
                        <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                <span className="font-bold text-foreground">{order.items[0]?.product.sellerName || '...'}</span>
                            </div>
                            <Button asChild variant="link" size="sm" className="text-accent h-auto p-0">
                                <Link href={`/buyer/seller/${order.sellerId}`}>View Store <ArrowRight className="ml-1" /></Link>
                            </Button>
                        </div>
                    </div>
                    {order.deliveryPersonName && (
                         <div>
                            <h4 className="font-semibold mb-2">Delivered By</h4>
                             <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span className="font-bold text-foreground">{order.deliveryPersonName}</span>
                             </div>
                        </div>
                    )}
                 </div>
              </div>
            </TableCell>
          </tr>
        )}
    </React.Fragment>
  )
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setIsLoading(true);
        const fetchedOrders = await getOrdersByBuyer(user.uid);
        
        // Enrich products with sellerName before setting state
        const enrichedOrders = fetchedOrders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                product: {
                    ...item.product,
                    // Assume all items in an order are from the same seller for sellerName
                    sellerName: order.items[0]?.product.sellerName || 'N/A' 
                }
            }))
        }));

        enrichedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setOrders(enrichedOrders);
        setIsLoading(false);
      }
    };

    if(user) {
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;

    const lowercasedQuery = searchQuery.toLowerCase();

    return orders.filter(order => {
      const idMatch = order.id.slice(-6).toLowerCase().includes(lowercasedQuery);
      const productMatch = order.items.some(item =>
        item.product.name.toLowerCase().includes(lowercasedQuery)
      );
      return idMatch || productMatch;
    });
  }, [orders, searchQuery]);

  return (
    <div className="container py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Orders</h1>
        <p className="text-muted-foreground">
          View the history of your past orders.
        </p>
      </div>
      <Card>
        <CardHeader>
            <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>A list of all your past orders.</CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Order ID or Product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
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
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    {searchQuery ? 'No orders found for your search.' : 'You have not placed any orders yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
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
