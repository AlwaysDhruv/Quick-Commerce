'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/mock-data';
import { ShoppingCart, Ban } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock === 0;

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
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? <Ban className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          <span className="sr-only">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
