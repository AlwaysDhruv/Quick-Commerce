
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addProductToFirestore, getCategoriesBySeller, addCategory, getProductsBySeller, type Category } from '@/lib/firestore';
import { Loader2, Database } from 'lucide-react';
import { sampleProducts, sampleCategories } from '@/lib/sample-data';


export default function SeedDataPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) return;
    setIsLoading(true);
    const fetchedCategories = await getCategoriesBySeller(user.uid);
    setCategories(fetchedCategories.sort((a,b) => a.name.localeCompare(b.name)));
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSeedCategories = async () => {
    if (!user) return;
    setIsSeeding('categories');
    try {
      const existingCategoryNames = new Set(categories.map(c => c.name));
      const categoriesToAdd = sampleCategories.filter(name => !existingCategoryNames.has(name));
      
      if (categoriesToAdd.length === 0) {
        toast({ title: "All sample categories already exist." });
      } else {
        await Promise.all(categoriesToAdd.map(name => addCategory({ name, sellerId: user.uid })));
        toast({ title: "Sample Categories Seeded!", description: `${categoriesToAdd.length} new categories were added.`});
        await fetchCategories();
      }
    } catch (error) {
      console.error("Failed to seed categories:", error);
      toast({ title: "Seeding Failed", variant: "destructive" });
    } finally {
      setIsSeeding(null);
    }
  };

  const handleSeedProducts = async (category: Category) => {
    if (!user) return;
    setIsSeeding(category.id);
    try {
      const existingProducts = await getProductsBySeller(user.uid);
      const existingProductNames = new Set(existingProducts.map(p => p.name));

      const productsToAdd = sampleProducts
        .filter(p => !existingProductNames.has(p.name))
        .slice(0, 100);

      if (productsToAdd.length === 0) {
        toast({ title: "All sample products already exist." });
        setIsSeeding(null);
        return;
      }
      
      await Promise.all(productsToAdd.map(p => addProductToFirestore({
        ...p,
        sellerId: user.uid,
        category: category.name, // Assign to the selected category
      })));
      
      toast({
          title: "Products Seeded!",
          description: `${productsToAdd.length} products have been added to the "${category.name}" category.`,
      });

    } catch (error) {
      console.error("Failed to seed products:", error);
       toast({
        title: "Seeding Failed",
        description: "Could not add sample products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(null);
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Seed Sample Data</h1>
          <p className="text-muted-foreground">
            Populate your store with sample data for testing and demonstration.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Seed Categories</CardTitle>
          <CardDescription>
            Add a list of 100+ sample categories to your store. This is a good first step.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleSeedCategories} disabled={!!isSeeding}>
                {isSeeding === 'categories' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                Seed Sample Categories
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Seed Products by Category</CardTitle>
            <CardDescription>
                Choose a category below and click the button to add up to 100 sample products to it.
            </CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                 <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
            ) : categories.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                    <p>You haven&apos;t created any categories yet.</p>
                    <p>Use the button above to seed sample categories first.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between rounded-md border p-4">
                            <span className="font-medium">{cat.name}</span>
                            <Button size="sm" onClick={() => handleSeedProducts(cat)} disabled={!!isSeeding}>
                                {isSeeding === cat.id ? <Loader2 className="mr-2 animate-spin" /> : <Database className="mr-2" />}
                                Seed Products
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
