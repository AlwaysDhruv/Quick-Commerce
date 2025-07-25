'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/mock-data';
import { ShoppingCart, Ban } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    const result = addToCart(product, 1);

    if (result.success) {
      toast({
        title: 'Added to cart',
        description: `1 x ${product.name} has been added.`,
      });
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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.dataAiHint}
          />
           {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">{product.category}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-xl font-bold text-white">${product.price.toFixed(2)}</p>
        <Button 
          size="icon" 
          variant="outline" 
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground disabled:border-muted disabled:bg-transparent disabled:text-muted-foreground disabled:cursor-not-allowed" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        >
          {isOutOfStock ? <Ban className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          <span className="sr-only">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
