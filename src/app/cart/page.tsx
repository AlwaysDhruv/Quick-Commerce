
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Trash2, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addOrderToFirestore, getProductsFromFirestore, type Address } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { geocodeAddress } from '@/ai/flows/geocode-address-flow';

function ShippingAddressForm({ onConfirm, onCancel, user }: { onConfirm: (address: Address) => void, onCancel: () => void, user: any }) {
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.address?.phone || '');
  const [streetAddress, setStreetAddress] = useState(user?.address?.streetAddress || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [district, setDistrict] = useState(user?.address?.district || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [latitude, setLatitude] = useState<number | undefined>(user?.address?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(user?.address?.longitude);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);
          toast({ title: "Location captured! Fetching address..." });

          try {
            const geocoded = await geocodeAddress({ latitude: lat, longitude: lon });
            setStreetAddress(geocoded.streetAddress);
            setCity(geocoded.city);
            setDistrict(geocoded.district);
            setCountry(geocoded.country);
            setPincode(geocoded.pincode);
            toast({ title: "Address automatically filled!" });
          } catch(err) {
            console.error(err);
            toast({ title: "Could not auto-fill address", description: "Please fill the details manually.", variant: "destructive" });
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({ title: "Could not get location", description: "Please ensure location services are enabled.", variant: "destructive" });
          setIsLocating(false);
        }
      );
    } else {
      toast({ title: "Geolocation not supported", description: "Your browser does not support geolocation.", variant: "destructive" });
    }
  };

  const handleSubmit = () => {
    if (!fullName || !phone || !streetAddress || !city || !district || !country || !pincode) {
        toast({ title: "All fields are required", description: "Please fill in all address details.", variant: "destructive"});
        return;
    }
    const addressToConfirm: Address = {
      fullName,
      phone,
      streetAddress,
      city,
      district,
      country,
      pincode,
    };
    if (typeof latitude === 'number' && typeof longitude === 'number') {
        addressToConfirm.latitude = latitude;
        addressToConfirm.longitude = longitude;
    }
    onConfirm(addressToConfirm);
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
            </div>
             <div className="flex items-center gap-4">
                 <Button variant="outline" onClick={handleGetLocation} disabled={isLocating}>
                    {isLocating ? <Loader2 className="mr-2 animate-spin" /> : <MapPin className="mr-2" />}
                    Use My Location
                </Button>
                {latitude && longitude && <span className="text-sm text-green-500">Location captured!</span>}
            </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm Order</Button>
        </CardFooter>
      </Card>
    </div>
  )
}


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  const handleInitiateCheckout = () => {
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
    setIsCheckingOut(true);
  }

  const handlePlaceOrder = async (address: Address) => {
    if (!user) return;
    
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
        setIsCheckingOut(false);
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
        address,
      });
      
      toast({
        title: 'Checkout Successful!',
        description: 'Your order has been placed.',
      });
      
      clearCart();
      router.push('/buyer/orders');

    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an issue placing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsCheckingOut(false);
    }
  }

  if (cartCount === 0) {
    return (
      <div className="container flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
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
                          disabled={isCheckingOut}
                        />
                      </TableCell>
                      <TableCell className="text-right">${(product.price * quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)} disabled={isCheckingOut}>
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
              <Button onClick={handleInitiateCheckout} className="w-full bg-primary hover:bg-primary/90" disabled={isCheckingOut}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      {isCheckingOut && (
        <ShippingAddressForm
          onConfirm={handlePlaceOrder}
          onCancel={() => setIsCheckingOut(false)}
          user={user}
        />
      )}
    </div>
  );
}
