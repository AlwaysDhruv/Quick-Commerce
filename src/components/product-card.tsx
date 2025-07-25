
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/mock-data';
import { Store, Eye } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { ProductDetailDialog } from './product-detail-dialog';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <ProductDetailDialog product={product}>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer group">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint}
            />
            {isOutOfStock && (
              <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
            )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Eye className="h-10 w-10 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-2">
          <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 pt-1">
              <Store className="h-3 w-3" />
              <span>{product.sellerName}</span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <p className="text-xl font-bold text-white">${product.price.toFixed(2)}</p>
        </CardFooter>
      </Card>
    </ProductDetailDialog>
  );
}
