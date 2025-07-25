
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { type Product } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendProducts } from '@/ai/flows/recommend-products';
import { Wand2, Loader2, ShoppingCart, Lightbulb, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductsFromFirestore } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

function AiSearch({ products, onSuggestionClick }: { products: Product[], onSuggestionClick: (suggestion: string) => void }) {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const productCategories = useMemo(() => {
    const cats = products.map(p => p.category);
    return [...new Set(cats)];
  }, [products]);

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
    setRecommendations([]);
    try {
      const result = await recommendProducts({
        userPreferences: preferences,
        productCatalog: productCategories,
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

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
    toast({
        title: 'Filter Applied!',
        description: `Showing products for "${suggestion}".`
    });
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <Wand2 className="text-accent" />
          AI Search
        </CardTitle>
        <CardDescription>Tell us what you&apos;re looking for and we&apos;ll suggest some categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="e.g., 'I need some new kitchen gadgets' or 'something for the outdoors'"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={3}
          />
          <Button onClick={getRecommendations} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get Suggestions
          </Button>
          {recommendations.length > 0 && (
            <div className="mt-4 rounded-md border bg-background p-4">
              <h4 className="font-semibold mb-2">Here are some ideas:</h4>
               <div className="flex flex-wrap gap-2">
                 {recommendations.map((rec, index) => (
                    <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSuggestionClick(rec)}
                    >
                        {rec}
                    </Badge>
                ))}
               </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductFilters({
  products,
  filters,
  onFilterChange,
}: {
  products: Product[];
  filters: { categories: string[]; priceRange: [number, number] };
  onFilterChange: (filters: any) => void;
}) {
  const { categories: selectedCategories, priceRange } = filters;

  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
    return [...new Set(cats)];
  }, [products]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: value });
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <Filter className="text-accent" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
          <AccordionItem value="category">
            <AccordionTrigger className="text-base font-medium">Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={checked => handleCategoryChange(category, Boolean(checked))}
                    />
                    <label
                      htmlFor={category}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-medium">Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <Slider min={0} max={500} step={10} value={priceRange} onValueChange={handlePriceChange} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}


function CartRecommendations({ allProducts }: { allProducts: Product[] }) {
  const { cart } = useCart();
  const { toast } = useToast();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const productCatalog = allProducts.map(p => `${p.name}: ${p.description}`).join('\n');
  const cartContents = cart.map(item => `${item.product.name} (Quantity: ${item.quantity})`).join(', ');

  const findProductByName = (name: string) => {
    // Attempt to find a direct match first
    let product = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
    // If no direct match, try to find a product whose name is included in the recommended string
    if (!product) {
       product = allProducts.find(p => name.toLowerCase().includes(p.name.toLowerCase()));
    }
    return product;
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    setRecommendedProducts([]);
    try {
       const result = await recommendProducts({
        userPreferences: `Based on the items in my cart, which are: ${cartContents}. Please suggest 3 other products from the catalog that I might like. Return just the product names.`,
        productCatalog: allProducts.map(p => p.name),
      });

      const recommendedNames = result.recommendations;
      
      const foundProducts = recommendedNames
        .map(findProductByName)
        .filter((p): p is Product => p !== undefined);

      setRecommendedProducts(foundProducts.slice(0, 3));

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to get cart recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cart.length > 0) {
      getRecommendations();
    } else {
        setRecommendedProducts([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(cart.map(i => i.product.id))]);


  if (cart.length === 0 || recommendedProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
      <div className="mb-12">
        <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="text-accent"/>
            Top Picks For You
        </h2>
        <p className="text-muted-foreground mb-6">Based on what's in your cart, you might also like these...</p>
        {isLoading ? (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-[250px] w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        ) : (
            <Carousel opts={{ align: "start", loop: recommendedProducts.length > 2 }}>
                <CarouselContent className="-ml-4">
                {recommendedProducts.map((product) => (
                    <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                         <div className="p-1">
                            <ProductCard product={product} />
                         </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        )}
      </div>
  )
}

export default function BuyerPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ categories: [] as string[], priceRange: [0, 500] as [number, number] });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await getProductsFromFirestore();
      setProducts(fetchedProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const handleAiSuggestion = (suggestion: string) => {
    // Check if the suggestion is already a selected category
    if (!filters.categories.includes(suggestion)) {
      setFilters(prevFilters => ({
        ...prevFilters,
        categories: [...prevFilters.categories, suggestion],
      }));
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const searchMatch = searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = filters.categories.length === 0 || filters.categories.includes(product.category);
        const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        return searchMatch && categoryMatch && priceMatch;
    });
  }, [products, filters, searchQuery]);

  return (
    <div className="container py-8">
        <div className="mb-8 space-y-2">
            <h1 className="font-headline text-3xl font-bold">Welcome, {user?.name || 'Shopper'}!</h1>
            <p className="text-muted-foreground">Discover our curated collection of fine products.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <aside className="md:col-span-1">
                <div className="sticky top-24">
                  <ScrollArea className="h-[calc(100vh-10rem)] pr-6">
                    <div className="space-y-6">
                      <AiSearch products={products} onSuggestionClick={handleAiSuggestion} />
                      <ProductFilters products={products} filters={filters} onFilterChange={setFilters} />
                    </div>
                  </ScrollArea>
                </div>
            </aside>

            <main className="md:col-span-3">
                 <CartRecommendations allProducts={products} />
                
                <div>
                    <div className="flex justify-between items-center mb-6 gap-4">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <h2 className="font-headline text-xl font-bold whitespace-nowrap">
                        All Products ({filteredProducts.length})
                      </h2>
                       {(filters.categories.length > 0 || searchQuery) && (
                          <Button variant="ghost" onClick={() => {
                            setFilters(f => ({ ...f, categories: []}));
                            setSearchQuery('');
                          }}>Clear Filters</Button>
                       )}
                    </div>
                    {isLoading ? (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-[250px] w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        ))}
                    </div>
                    ) : filteredProducts.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    ) : (
                        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
                            <h3 className="text-xl font-semibold">No Products Found</h3>
                            <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
}
