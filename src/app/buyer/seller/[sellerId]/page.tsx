
'use client';

import { useEffect, useState } from 'react';
import { 
    getProductsBySeller, 
    getSellerProfile,
    getCategoryCountForSeller,
    getUniqueBuyerCountForSeller,
    getCategoriesBySeller,
    type Category,
} from '@/lib/firestore';
import type { Product } from '@/lib/mock-data';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown, Store, Package, FolderKanban, Users, MessageSquare } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';

function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) {
    return (
        <div className="rounded-lg border bg-card p-6 flex items-center gap-6">
            <div className="bg-primary/20 text-primary p-4 rounded-full">
                <Icon className="h-8 w-8" />
            </div>
            <div>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="text-3xl font-bold">{value}</div>
                )}
                <p className="text-sm text-muted-foreground">{title}</p>
            </div>
        </div>
    );
}

export default function BuyerSellerProfilePage({ params }: { params: { sellerId: string } }) {
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ productCount: 0, categoryCount: 0, buyerCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sellerId = params.sellerId;
    if (sellerId) {
      const fetchSellerData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const sellerData = await getSellerProfile(sellerId);
          if (!sellerData) {
            throw new Error('Seller not found.');
          }
          setSellerName(sellerData.name);

          const [sellerProducts, sellerCategories, buyerCount] = await Promise.all([
            getProductsBySeller(sellerId),
            getCategoriesBySeller(sellerId),
            getUniqueBuyerCountForSeller(sellerId)
          ]);
          
          const productsWithSellerName = sellerProducts.map(p => ({ ...p, sellerName: sellerData.name }));
          setProducts(productsWithSellerName);
          setCategories(sellerCategories.sort((a,b) => a.name.localeCompare(b.name)));
          setStats({
              productCount: sellerProducts.length,
              categoryCount: sellerCategories.length,
              buyerCount
          });

        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSellerData();
    }
  }, [params.sellerId]);

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
    <div className="container py-12 space-y-12">
      <header className="space-y-2">
        <p className="text-lg text-muted-foreground">Welcome to the storefront of</p>
        <h1 className="font-headline text-5xl font-bold text-primary">{isLoading ? <Skeleton className="h-12 w-1/3" /> : `${sellerName}'s Store`}</h1>
      </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Products" value={stats.productCount} icon={Package} isLoading={isLoading} />
            <StatCard title="Product Categories" value={stats.categoryCount} icon={FolderKanban} isLoading={isLoading} />
            <StatCard title="Happy Customers" value={stats.buyerCount} icon={Users} isLoading={isLoading} />
        </div>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-6">Categories</h2>
         {isLoading ? (
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
            </div>
        ) : categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <Badge key={category.id} variant="secondary" className="text-lg px-4 py-2 cursor-pointer hover:bg-primary/20 transition-colors">
                        {category.name}
                    </Badge>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground">This seller has not added any categories yet.</p>
        )}
      </section>

       <section>
        <h2 className="font-headline text-3xl font-bold mb-6">All Products</h2>
        {isLoading ? (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[250px] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
        ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            <div className="mt-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
                <Store className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">This Shop is Getting Started</h3>
                <p className="mt-2 text-muted-foreground">{sellerName} hasn't listed any products yet. Check back soon!</p>
            </div>
        )}
       </section>
    </div>
  );
}
