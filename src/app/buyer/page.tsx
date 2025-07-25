'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { type Product } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendProducts } from '@/ai/flows/recommend-products';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductsFromFirestore } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function AiRecommendations({ products }: { products: Product[] }) {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const productCatalog = products.map(p => `${p.name}: ${p.description}`).join('\n');

  const getRecommendations = async () => {
    if (!preferences) {
      toast({
        title: 'Preferences needed',
        description: 'Please tell us what you like first!',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setRecommendations('');
    try {
      const result = await recommendProducts({
        userPreferences: preferences,
        productCatalog: productCatalog,
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Wand2 className="text-accent" />
          Personalized Recommendations
        </CardTitle>
        <CardDescription>Tell us what you&apos;re looking for, and our AI will find the perfect products for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="e.g., 'I'm looking for high-quality leather goods' or 'I love minimalist home decor'"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={3}
          />
          <Button onClick={getRecommendations} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get Recommendations
          </Button>
          {recommendations && (
            <div className="mt-4 rounded-md border bg-background p-4">
              <h4 className="font-semibold">Here are your recommendations:</h4>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{recommendations}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function BuyerPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await getProductsFromFirestore();
      setProducts(fetchedProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="container py-8">
      <div className="space-y-4">
        <h1 className="font-headline text-3xl font-bold">Welcome, {user?.name || 'Shopper'}!</h1>
        <p className="text-muted-foreground">Discover our curated collection of fine products.</p>
      </div>
      <div className="mt-8">
        <AiRecommendations products={products} />
      </div>
      <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold">All Products</h2>
        {isLoading ? (
           <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                ))}
           </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
