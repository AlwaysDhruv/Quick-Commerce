
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersBySeller, getProductsBySeller, getBuyerCountFromFirestore, addProductToFirestore, getCategoriesBySeller, addCategory, type Order } from '@/lib/firestore';
import { DollarSign, Package, ShoppingCart, Users, Loader2, Database, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const sampleProducts = [
    {
        name: 'Classic Leather Watch',
        description: 'A timeless watch with a genuine leather strap and a stainless steel case. Water-resistant up to 50m.',
        price: 150.0,
        category: 'Accessories',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'leather watch',
    },
    {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immerse yourself in sound with these over-ear headphones featuring active noise cancellation and 30-hour battery life.',
        price: 249.99,
        category: 'Electronics',
        stock: 15,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'headphones',
    },
    {
        name: 'Organic Cotton T-Shirt',
        description: 'A soft, breathable t-shirt made from 100% organic cotton. Ethically sourced and produced.',
        price: 25.0,
        category: 'Apparel',
        stock: 100,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cotton t-shirt',
    },
    {
        name: 'French Press Coffee Maker',
        description: 'Brew rich, flavorful coffee with this classic 8-cup French press. Features a durable borosilicate glass carafe.',
        price: 35.0,
        category: 'Kitchenware',
        stock: 40,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'french press',
    },
    {
        name: 'Yoga Mat with Carrying Strap',
        description: 'A non-slip, eco-friendly yoga mat perfect for all types of practice. Includes a convenient carrying strap.',
        price: 40.0,
        category: 'Sports & Outdoors',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'yoga mat',
    },
    {
        name: 'The Great Gatsby by F. Scott Fitzgerald',
        description: 'A classic novel exploring themes of decadence, idealism, and social upheaval in the Jazz Age.',
        price: 12.99,
        category: 'Books',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'classic book',
    },
    {
        name: 'Handmade Ceramic Mug',
        description: 'A unique, hand-thrown ceramic mug with a beautiful speckled glaze. Dishwasher and microwave safe.',
        price: 28.0,
        category: 'Home Goods',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'ceramic mug',
    },
    {
        name: 'Natural Bar Soap - Lavender',
        description: 'A calming and moisturizing bar soap made with natural ingredients and scented with pure lavender essential oil.',
        price: 8.0,
        category: 'Beauty & Personal Care',
        stock: 120,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'lavender soap',
    },
    {
        name: 'Wooden Chess Set',
        description: 'A beautiful, handcrafted wooden chess set with weighted pieces and a foldable board for easy storage.',
        price: 75.0,
        category: 'Toys & Games',
        stock: 30,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'chess set',
    },
    {
        name: 'Gourmet Dark Chocolate Bar',
        description: 'A rich and intense 72% cacao dark chocolate bar, ethically sourced from single-origin beans.',
        price: 6.0,
        category: 'Food & Grocery',
        stock: 200,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dark chocolate',
    },
];

const sampleCategories = [
    'Electronics',
    'Apparel',
    'Books',
    'Home Goods',
    'Sports & Outdoors',
    'Kitchenware',
    'Toys & Games',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Accessories'
];


function SalesChart({ orders }: { orders: Order[] }) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // Aggregate sales by month
    const monthlySales = orders.reduce((acc, order) => {
      const month = format(order.createdAt.toDate(), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    // Get the last 6 months including the current one
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return sortedMonths.slice(-6).map(month => ({
      name: month,
      total: monthlySales[month],
    }));
  }, [orders]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">No sales data yet. Once you get orders, your sales chart will appear here.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Sales Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
            config={{ total: { label: 'Sales', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
             />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [buyerCount, setBuyerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (user) {
      setLoading(true);
      try {
        const [products, fetchedOrders, buyers] = await Promise.all([
          getProductsBySeller(user.uid),
          getOrdersBySeller(user.uid),
          getBuyerCountFromFirestore(),
        ]);

        setProductCount(products.length);
        setOrders(fetchedOrders);
        setTotalRevenue(fetchedOrders.reduce((sum, order) => sum + order.total, 0));
        setBuyerCount(buyers);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
        let categoriesAdded = 0;
        let productsAdded = 0;

        // Seed Categories
        const existingCategories = await getCategoriesBySeller(user.uid);
        const existingCategoryNames = new Set(existingCategories.map(c => c.name));
        const categoriesToAdd = sampleCategories.filter(name => !existingCategoryNames.has(name));
        
        if (categoriesToAdd.length > 0) {
            await Promise.all(categoriesToAdd.map(name => addCategory({ name, sellerId: user.uid })));
            categoriesAdded = categoriesToAdd.length;
        }

        // Seed Products
        const existingProducts = await getProductsBySeller(user.uid);
        const existingProductNames = new Set(existingProducts.map(p => p.name));
        const productsToAdd = sampleProducts.filter(p => !existingProductNames.has(p.name));
      
        if (productsToAdd.length > 0) {
            await Promise.all(productsToAdd.map(p => addProductToFirestore({ ...p, sellerId: user.uid })));
            productsAdded = productsToAdd.length;
        }
      
        if (productsAdded === 0 && categoriesAdded === 0) {
            toast({
                title: "Data Already Seeded",
                description: "All sample products and categories already exist in your store.",
            });
        } else {
            toast({
                title: "Data Seeded!",
                description: `${productsAdded} products and ${categoriesAdded} categories have been added.`,
            });
            await fetchData(); // Refresh dashboard data
        }

    } catch (error) {
      console.error("Failed to seed data:", error);
       toast({
        title: "Seeding Failed",
        description: "Could not add sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  }

  const renderStatCard = (title: string, value: string | number | null, icon: React.ReactNode, subtext?: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Here&apos;s a summary of your shop&apos;s performance.</p>
        </div>
        <Button variant="outline" onClick={handleSeedData} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard('Total Revenue', totalRevenue !== null ? `$${totalRevenue.toLocaleString()}` : 'N/A', <DollarSign className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Orders', orders ? `+${orders.length}` : 'N/A', <ShoppingCart className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Products', productCount !== null ? productCount : 'N/A', <Package className="h-4 w-4 text-muted-foreground" />, 'Total products listed')}
        {renderStatCard('Total Buyers', buyerCount !== null ? buyerCount : 'N/A', <Users className="h-4 w-4 text-muted-foreground" />, 'Total registered buyers')}
      </div>

      <div>
        <SalesChart orders={orders} />
      </div>
    </div>
  );
}

    