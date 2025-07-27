

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersBySeller, updateOrderStatus, deleteOrderFromFirestore, type Order, getDeliveryTeamForSeller } from '@/lib/firestore';
import { useAuth, type User } from '@/hooks/use-auth';
import { Loader2, MoreHorizontal, Trash2, ChevronDown, CheckCircle, Truck, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import React from 'react';


function DeleteOrderDialog({ order, onOrderDeleted, children }: { order: Order; onOrderDeleted: () => void, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrderFromFirestore(order.id);
      toast({
        title: 'Order Deleted',
        description: `Order ...${order.id.slice(-6)} has been removed.`,
      });
      onOrderDeleted();
      setOpen(false);
    } catch (error) {
       console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
     <AlertDialog open={open} onOpenChange={setOpen}>
        {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the order from <strong>{order.buyerName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, delete order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function OrderRow({ order, onOrderUpdated, deliveryTeam }: { order: Order; onOrderUpdated: () => void, deliveryTeam: User[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: Order['status'], deliveryPerson?: { id: string, name: string }) => {
    if (status === 'Shipped' && !deliveryPerson) {
         toast({
            title: 'Assignment Required',
            description: 'Please assign a delivery person to ship an order.',
            variant: 'destructive',
        });
        return;
    }

    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, status, deliveryPerson);
      toast({
        title: 'Order Status Updated',
        description: `Order ...${order.id.slice(-6)} is now ${status}.`
      });
      onOrderUpdated();
    } catch(error) {
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
          <TableCell onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 {order.status === 'Processing' && (
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Truck className="mr-2" />
                            Assign & Ship
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuLabel>Select Delivery Person</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {deliveryTeam.length > 0 ? deliveryTeam.map(person => (
                                    <DropdownMenuItem key={person.uid} onClick={() => handleStatusUpdate('Shipped', { id: person.uid, name: person.name })}>
                                        {person.name}
                                    </DropdownMenuItem>
                                )) : <DropdownMenuItem disabled>No delivery staff found</DropdownMenuItem>}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                     </DropdownMenuSub>
                 )}
                 {order.status === 'Shipped' && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate('Out for Delivery')}>
                        <Truck className="mr-2" />
                        Mark as Out for Delivery
                    </DropdownMenuItem>
                 )}
                 {order.status === 'Out for Delivery' && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate('Delivered')}>
                        <CheckCircle className="mr-2" />
                        Mark as Delivered
                    </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DeleteOrderDialog order={order} onOrderDeleted={onOrderUpdated}>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => {e.preventDefault()}}
                      asChild
                    >
                        <AlertDialogTrigger className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                        </AlertDialogTrigger>
                    </DropdownMenuItem>
                </DeleteOrderDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isOpen && (
          <tr className="bg-muted/50">
            <TableCell colSpan={7} className="p-0">
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
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
                 <div className="space-y-3">
                    <h4 className="font-semibold mb-2 mt-4">Shipping Address</h4>
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
                                <MapPin className="mr-2" />
                                View on Map
                            </a>
                         )}
                    </div>
                     {order.deliveryPersonName && (
                        <>
                         <h4 className="font-semibold mb-2 mt-4">Assigned To</h4>
                         <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50 space-y-2">
                            <p className="font-bold text-foreground flex items-center gap-2"><Truck className="h-4 w-4" />{order.deliveryPersonName}</p>
                         </div>
                        </>
                    )}
                 </div>
              </div>
            </TableCell>
          </tr>
        )}
    </React.Fragment>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryTeam, setDeliveryTeam] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (user) {
      setIsLoading(true);
      const [fetchedOrders, fetchedTeam] = await Promise.all([
        getOrdersBySeller(user.uid),
        getDeliveryTeamForSeller(user.uid)
      ]);
      fetchedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setOrders(fetchedOrders);
      setDeliveryTeam(fetchedTeam);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px] text-center">Details</TableHead>
                <TableHead className="w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    You have no orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} onOrderUpdated={fetchData} deliveryTeam={deliveryTeam} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
