
'use client';

import { useEffect, useState } from 'react';
import { getProductsBySeller, getSellerProfile } from '@/lib/firestore';
import type { Product } from '@/lib/mock-data';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown } from 'lucide-react';

export default function SellerProfilePage({ params: { sellerId } }: { params: { sellerId: string } }) {
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sellerData = await getSellerProfile(sellerId);
        if (!sellerData) {
          throw new Error('Seller not found.');
        }
        setSellerName(sellerData.name);

        const sellerProducts = await getProductsBySeller(sellerId);
        
        // We need to manually add sellerName to each product since getProductsBySeller doesn't
        const productsWithSellerName = sellerProducts.map(p => ({ ...p, sellerName: sellerData.name }));
        setProducts(productsWithSellerName);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[250px] w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Alert variant="destructive" className="max-w-md">
          <Frown className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Products from</p>
        <h1 className="font-headline text-3xl font-bold">{sellerName}'s Store</h1>
      </div>
       {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <h3 className="text-xl font-semibold">No Products Yet</h3>
            <p className="mt-2 text-muted-foreground">{sellerName} hasn't listed any products.</p>
        </div>
      )}
    </div>
  );
}
