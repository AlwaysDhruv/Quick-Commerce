
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addOrderToFirestore, getProductsFromFirestore } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const result = updateQuantity(productId, quantity);
    if (!result.success && result.reason === 'stock-limit') {
      const product = cart.find(item => item.product.id === productId)?.product;
      toast({
        title: 'Not enough stock',
        description: `Only ${product?.stock} of ${product?.name} available.`,
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'You must be logged in to check out.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (cart.length === 0) return;
    
    // For this example, we'll assume all items in the cart are from the same seller.
    const sellerId = cart[0].product.sellerId;

    try {
       // --- Stock Verification Step ---
      const allProducts = await getProductsFromFirestore();
      const productMap = new Map(allProducts.map(p => [p.id, p]));

      let stockError = false;
      for (const item of cart) {
        const productInDb = productMap.get(item.product.id);
        if (!productInDb || productInDb.stock < item.quantity) {
          toast({
            title: 'Checkout Error',
            description: `${item.product.name} is out of stock or has insufficient quantity. Please update your cart.`,
            variant: 'destructive',
          });
          stockError = true;
          break; // Stop on first error
        }
      }

      if (stockError) {
        // Optionally, you could implement logic to auto-update the cart here.
        // For now, we'll just stop the checkout.
        return;
      }
      // --- End Stock Verification ---


      await addOrderToFirestore({
        buyerId: user.uid,
        buyerName: user.name,
        items: cart,
        total: cartTotal,
        status: 'Processing',
        sellerId: sellerId,
        createdAt: new Date() as any, // Firestore will convert this to Timestamp
      });
      
      toast({
        title: 'Checkout Successful!',
        description: 'Your order has been placed.',
      });
      
      clearCart();
      router.push('/buyer');

    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an issue placing your order. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (cartCount === 0) {
    return (
      <div className="container flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/buyer">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold font-headline mb-8">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(({ product, quantity }) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                          data-ai-hint={product.dataAiHint}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value, 10))}
                          className="w-20 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell className="text-right">${(product.price * quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} className="w-full bg-primary hover:bg-primary/90">Proceed to Checkout</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
