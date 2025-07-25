
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOrdersBySeller, deleteOrderFromFirestore, type Order } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, MoreHorizontal, Trash2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Image from 'next/image';


function DeleteOrderDialog({ order, onOrderDeleted }: { order: Order; onOrderDeleted: () => void }) {
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
      <DropdownMenuTrigger asChild>
        <DropdownMenuItem
          className="text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuTrigger>
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

function OrderRow({ order, onOrderDeleted }: { order: Order; onOrderDeleted: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
     <Collapsible asChild key={order.id} open={isOpen} onOpenChange={setIsOpen}>
      <>
        <TableRow className="cursor-pointer">
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
             <CollapsibleTrigger asChild>
               <Button variant="ghost" size="sm" className="w-9 p-0">
                  <span className="sr-only">Toggle details</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
               </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DeleteOrderDialog order={order} onOrderDeleted={onOrderDeleted} />
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <tr className="bg-muted/50">
            <TableCell colSpan={7} className="p-0">
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
        </CollapsibleContent>
      </>
    </Collapsible>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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

  useEffect(() => {
    if(user) {
      fetchOrders();
    }
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
                  <OrderRow key={order.id} order={order} onOrderDeleted={fetchOrders} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
 