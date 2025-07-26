
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/mock-data';
import { ShoppingCart, Ban, Store, Package, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Link from 'next/link';

interface ProductDetailDialogProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductDetailDialog({ product, children }: ProductDetailDialogProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    const result = addToCart(product, 1);

    if (result.success) {
      toast({
        title: 'Added to cart',
        description: `1 x ${product.name} has been added.`,
      });
      setOpen(false); // Close dialog on successful add
    } else {
      if (result.reason === 'out-of-stock') {
        toast({
          title: 'Out of Stock',
          description: `Sorry, ${product.name} is currently unavailable.`,
          variant: 'destructive',
        });
      } else if (result.reason === 'stock-limit') {
        toast({
          title: 'Not enough stock',
          description: `You can't add more of ${product.name} to your cart.`,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl grid-cols-1 md:grid-cols-2 grid gap-8">
        <div className="relative aspect-square w-full">
            <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-md"
                data-ai-hint={product.dataAiHint}
            />
        </div>
        <div className="flex flex-col">
            <DialogHeader>
            <Badge variant="outline" className="w-fit mb-2">{product.category}</Badge>
            <DialogTitle className="text-3xl font-headline font-bold">{product.name}</DialogTitle>
            <DialogDescription className="pt-2 text-base text-muted-foreground">{product.description}</DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>Sold by <strong className="text-foreground">{product.sellerName}</strong></span>
                    </div>
                    <Button variant="link" asChild className="text-accent h-auto p-0">
                        <Link href={`/seller/${product.sellerId}`}>
                            View Profile
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                 </div>
                 <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Package className="h-4 w-4" />
                    <span>
                        {isOutOfStock ? (
                            <span className="text-destructive font-semibold">Out of Stock</span>
                        ) : (
                             <span className="text-green-400 font-semibold">{product.stock} in stock</span>
                        )}
                    </span>
                </div>
            </div>

            <DialogFooter className="flex-row items-center justify-between mt-auto">
                 <p className="text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
                <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? <Ban className="mr-2" /> : <ShoppingCart className="mr-2" />}
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
