
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ProductCard } from '@/components/product-card';
import { type Product } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendProducts } from '@/ai/flows/recommend-products';
import { Wand2, Loader2, ShoppingCart, Lightbulb, Filter, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductsFromFirestore, getCategoriesBySeller, type Category, getAllCategories } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Autoplay from "embla-carousel-autoplay"


function CategoryCards({ categories }: { categories: Category[] }) {
    const router = useRouter();

    if (categories.length === 0) return null;

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/buyer?category=${encodeURIComponent(categoryName)}`);
    }
    
    // Define the categories to be showcased. These names should match exactly what's in Firestore.
    const showcaseCategories = [
        { name: 'Apparel', image: 'https://placehold.co/300x300.png' },
        { name: 'Electronics', image: 'https://placehold.co/300x300.png' },
        { name: 'Home Goods', image: 'https://placehold.co/300x300.png' },
        { name: 'Sports & Outdoors', image: 'https://placehold.co/300x300.png' },
        { name: 'Food & Grocery', image: 'https://placehold.co/300x300.png' },
    ];
    
    // Map Firestore categories to the showcase, preserving the dynamic image from Firestore
    const displayCategories = showcaseCategories.map(showcaseCat => {
        const firestoreCat = categories.find(c => c.name === showcaseCat.name);
        return {
            id: firestoreCat?.id || showcaseCat.name,
            name: showcaseCat.name,
            // Use Firestore image if available, otherwise fallback to showcase default
            image: firestoreCat?.image || showcaseCat.image,
        };
    });


    return (
        <div className="py-12">
            <h2 className="font-headline text-3xl font-bold text-center mb-8">Shop by Category</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {displayCategories.map(category => (
                    <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category.name)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all"
                    >
                         <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            data-ai-hint={category.name}
                        />
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex items-center justify-center p-2">
                            <h3 className="text-white text-center font-semibold text-lg">{category.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProductFilters({
  filters,
  onFilterChange,
  allCategories
}: {
  filters: { categories: string[]; priceRange: [number, number], searchQuery: string };
  onFilterChange: (filters: any) => void;
  allCategories: Category[];
}) {
  const { categories: selectedCategories, priceRange } = filters;

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: value });
  };

  const clearAllFilters = () => {
    onFilterChange({ categories: [], priceRange: [0, 500], searchQuery: '' });
  };


  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24 space-y-6">
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Filters
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
                <AccordionItem value="category">
                    <AccordionTrigger className="text-base font-medium">Category</AccordionTrigger>
                    <AccordionContent>
                    <ScrollArea className="h-64">
                        <div className="space-y-2 pr-4">
                        {allCategories.map(category => (
                            <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={category.name}
                                checked={selectedCategories.includes(category.name)}
                                onCheckedChange={checked => handleCategoryChange(category.name, Boolean(checked))}
                            />
                            <label
                                htmlFor={category.name}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {category.name}
                            </label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
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
      </div>
    </aside>
  );
}


export default function BuyerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);


  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');

  const [filters, setFilters] = useState({
      categories: initialCategory ? [initialCategory] : [],
      priceRange: [0, 500] as [number, number],
      searchQuery: initialSearch || ''
  });

  const showFilters = useMemo(() => filters.searchQuery.length > 0 || filters.categories.length > 0, [filters]);

   const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };
  
  const startIndex = useMemo(() => getDayOfYear() % 5, []);

  useEffect(() => {
    setIsClient(true);
    const fetchProductsAndCategories = async () => {
      setIsLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProductsFromFirestore(),
          getAllCategories()
      ]);
      setProducts(fetchedProducts);
      setAllCategories(fetchedCategories.sort((a,b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    };

    fetchProductsAndCategories();
  }, []);
  
  useEffect(() => {
    // Update filters based on URL changes
    setFilters({
        categories: searchParams.has('category') ? [searchParams.get('category')!] : [],
        priceRange: [0, 500], // reset price range on nav
        searchQuery: searchParams.get('search') || '',
    });
  }, [searchParams]);

  const handleFilterChange = (newFilters: any) => {
      setFilters(newFilters);
      const params = new URLSearchParams();
      if (newFilters.searchQuery) {
          params.set('search', newFilters.searchQuery);
      }
      if (newFilters.categories.length > 0) {
          // simple for now, only handle single category in URL
          params.set('category', newFilters.categories[0]); 
      }
      // Only push new URL if filters are actually set
      if (newFilters.searchQuery || newFilters.categories.length > 0) {
          router.push(`/buyer?${params.toString()}`, { scroll: false });
      } else {
          router.push('/buyer', { scroll: false });
      }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const searchMatch = filters.searchQuery === '' || product.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
        const categoryMatch = filters.categories.length === 0 || filters.categories.includes(product.category);
        const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        return searchMatch && categoryMatch && priceMatch;
    });
  }, [products, filters]);

  if (!isClient) {
     return null;
  }


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

  if (showFilters) {
     return (
        <div className="container py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                <ProductFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    allCategories={allCategories}
                />
                <main className="lg:col-span-3">
                     <div>
                        <h2 className="font-headline text-xl font-bold mb-6">
                            Showing results for &quot;{filters.searchQuery || filters.categories.join(', ')}&quot; ({filteredProducts.length})
                        </h2>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
     )
  }

  return (
    <div className="space-y-8">
        <section>
            <Carousel 
                className="w-full" 
                opts={{ loop: true, startIndex }}
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image src="https://placehold.co/1600x900.png" alt="Slide 1" fill className="object-cover" data-ai-hint="sale banner"/>
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-headline font-bold">Summer Styles Are Here</h2>
                        <p className="mt-4 text-lg">Discover the latest trends and refresh your wardrobe.</p>
                        <Button asChild size="lg" className="mt-6">
                            <Link href="/buyer?category=Apparel">Shop Now</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>
                 <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image src="https://placehold.co/1600x900.png" alt="Slide 2" fill className="object-cover" data-ai-hint="tech gadgets"/>
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-headline font-bold">Upgrade Your Tech</h2>
                        <p className="mt-4 text-lg">Find the latest gadgets and electronics.</p>
                         <Button asChild size="lg" className="mt-6">
                            <Link href="/buyer?category=Electronics">Explore Tech</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image src="https://placehold.co/1600x900.png" alt="Slide 3" fill className="object-cover" data-ai-hint="home decor"/>
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-headline font-bold">Beautify Your Home</h2>
                        <p className="mt-4 text-lg">Discover unique pieces for every room.</p>
                         <Button asChild size="lg" className="mt-6">
                            <Link href="/buyer?category=Home Goods">Shop Home</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image src="https://placehold.co/1600x900.png" alt="Slide 4" fill className="object-cover" data-ai-hint="outdoor adventure"/>
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-headline font-bold">Adventure Awaits</h2>
                        <p className="mt-4 text-lg">Get equipped for your next outdoor journey.</p>
                         <Button asChild size="lg" className="mt-6">
                            <Link href="/buyer?category=Sports & Outdoors">Get Outside</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image src="https://placehold.co/1600x900.png" alt="Slide 5" fill className="object-cover" data-ai-hint="gourmet food"/>
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-headline font-bold">Taste The Difference</h2>
                        <p className="mt-4 text-lg">Explore gourmet foods and pantry staples.</p>
                         <Button asChild size="lg" className="mt-6">
                            <Link href="/buyer?category=Food & Grocery">Shop Gourmet</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4"/>
            </Carousel>
        </section>

        <section className="container">
            <CategoryCards categories={allCategories} />
        </section>
    </div>
  );
}
