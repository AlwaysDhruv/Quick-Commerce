'use client';

import Image from 'next/image';
import { PlusCircle } from 'lucide-react';

import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useAppContext } from '@/hooks/useAppContext';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAppContext();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product['data-ai-hint']}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
        <div className="flex gap-1 flex-wrap my-2">
            {product.labels.slice(0, 3).map(label => (
                <Badge key={label} variant="secondary">{label}</Badge>
            ))}
        </div>
        <CardDescription className="text-sm">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
        <Button size="sm" onClick={() => addToCart(product)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
