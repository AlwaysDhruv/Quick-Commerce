
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersBySeller, getProductsBySeller, getBuyerCountFromFirestore, addProductToFirestore, type Order } from '@/lib/firestore';
import { DollarSign, Package, ShoppingCart, Users, Loader2, Database, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const sampleProducts = [
    {
      name: 'Artisan Leather Journal',
      description: 'A beautifully crafted leather journal for your thoughts and sketches. Made with full-grain leather and filled with 200 pages of acid-free paper.',
      price: 45.0,
      category: 'Stationery',
      stock: 15,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'leather journal',
    },
    {
      name: 'Minimalist Wall Clock',
      description: 'A silent, non-ticking wall clock with a clean, modern design. Perfect for any room in your home or office.',
      price: 60.0,
      category: 'Home Decor',
      stock: 10,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'modern clock',
    },
    {
      name: 'Organic Beard Oil',
      description: 'A blend of natural oils to soften, tame, and condition your beard. Lightly scented with sandalwood and cedarwood.',
      price: 25.0,
      category: 'Grooming',
      stock: 30,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'beard oil',
    },
    {
      name: 'Hand-poured Soy Candle',
      description: 'A relaxing lavender and chamomile scented soy candle. Burns for over 40 hours, creating a calming ambiance.',
      price: 22.0,
      category: 'Home Fragrance',
      stock: 25,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'scented candle',
    },
    {
      name: 'Gourmet Coffee Beans',
      description: 'A 12oz bag of single-origin Ethiopian Yirgacheffe coffee beans. Notes of blueberry, lemon, and floral undertones.',
      price: 18.0,
      category: 'Food & Drink',
      stock: 50,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'coffee beans',
    },
    {
      name: 'Ceramic Pour-Over Coffee Dripper',
      description: 'Brew the perfect cup of coffee with this elegant ceramic pour-over dripper. Designed for optimal heat retention and a clean brew.',
      price: 35.0,
      category: 'Kitchenware',
      stock: 20,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'coffee dripper',
    },
     {
      name: 'Waterproof Adventure Backpack',
      description: 'A durable and waterproof 30L backpack designed for hiking and travel. Features multiple compartments and comfortable straps.',
      price: 120.0,
      category: 'Outdoor Gear',
      stock: 8,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'hiking backpack',
    },
    {
      name: 'Smart Reusable Notebook',
      description: 'A digital-friendly notebook that allows you to write, scan, and erase pages. Syncs with your favorite cloud services.',
      price: 30.0,
      category: 'Tech Gadgets',
      stock: 40,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'smart notebook',
    },
     {
      name: 'Weighted Comfort Blanket',
      description: 'A 15lb weighted blanket designed to reduce anxiety and improve sleep quality. Made with soft, breathable cotton.',
      price: 90.0,
      category: 'Bedding',
      stock: 12,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'weighted blanket',
    },
    {
      name: 'Portable Bluetooth Speaker',
      description: 'A compact but powerful Bluetooth speaker with 12 hours of battery life and a waterproof design. Delivers rich, clear sound.',
      price: 75.0,
      category: 'Electronics',
      stock: 18,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'bluetooth speaker',
    },
    {
      name: 'Matte Ceramic Mug Set',
      description: 'Set of four minimalist ceramic mugs in a beautiful matte finish. Dishwasher and microwave safe.',
      price: 40.0,
      category: 'Kitchenware',
      stock: 22,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'ceramic mugs',
    },
    {
      name: 'Linen Duvet Cover Set',
      description: 'A queen-size duvet cover set made from 100% natural linen. Soft, breathable, and durable.',
      price: 150.0,
      category: 'Bedding',
      stock: 10,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'linen bedding',
    },
    {
      name: 'Electric Gooseneck Kettle',
      description: 'A variable temperature electric kettle with a precision-pour gooseneck spout, perfect for tea and coffee.',
      price: 85.0,
      category: 'Kitchenware',
      stock: 15,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'electric kettle',
    },
    {
      name: 'Felt Desk Mat',
      description: 'A large, soft felt desk mat that protects your desk and provides a smooth surface for your mouse.',
      price: 28.0,
      category: 'Office',
      stock: 35,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'desk mat',
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: 'A 32oz insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
      price: 32.0,
      category: 'Outdoor Gear',
      stock: 40,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'water bottle',
    },
    {
      name: 'Wireless Charging Stand',
      description: 'A sleek 3-in-1 wireless charging stand for your phone, earbuds, and smartwatch. Fast and convenient.',
      price: 55.0,
      category: 'Electronics',
      stock: 25,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'wireless charger',
    },
    {
      name: 'Indoor Herb Garden Kit',
      description: 'An easy-to-use indoor herb garden kit with everything you need to grow your own basil, mint, and cilantro.',
      price: 38.0,
      category: 'Gardening',
      stock: 18,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'herb garden',
    },
    {
      name: 'Cashmere Throw Blanket',
      description: 'A luxurious and incredibly soft cashmere throw blanket, perfect for cozying up on the couch.',
      price: 250.0,
      category: 'Home Decor',
      stock: 5,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'cashmere blanket',
    },
    {
      name: 'Noise-Cancelling Headphones',
      description: 'Over-ear noise-cancelling headphones with superior sound quality and 30 hours of playtime.',
      price: 180.0,
      category: 'Electronics',
      stock: 12,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'headphones',
    },
    {
      name: 'French Press Coffee Maker',
      description: 'A classic 8-cup French press with a durable borosilicate glass carafe and a stainless steel filter.',
      price: 30.0,
      category: 'Kitchenware',
      stock: 20,
      image: 'https://placehold.co/400x400.png',
      dataAiHint: 'french press',
    }
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

  const handleSeedProducts = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const existingProducts = await getProductsBySeller(user.uid);
      const existingProductNames = new Set(existingProducts.map(p => p.name));
      const productsToAdd = sampleProducts.filter(p => !existingProductNames.has(p.name));
      
      if (productsToAdd.length === 0) {
         toast({
          title: "Products Already Seeded",
          description: "All sample products already exist in your store.",
        });
        setIsSeeding(false);
        return;
      }

      await Promise.all(productsToAdd.map(p => addProductToFirestore({ ...p, sellerId: user.uid })));
      
      toast({
        title: "Products Seeded!",
        description: `${productsToAdd.length} new sample products have been added.`,
      });

      await fetchData();

    } catch (error) {
      console.error("Failed to seed products:", error);
       toast({
        title: "Seeding Failed",
        description: "Could not add sample products. Please try again.",
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
        <Button variant="outline" onClick={handleSeedProducts} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Products
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
