'use client';

import { ProductCard } from '@/components/ProductCard';
import { useAppContext } from '@/hooks/useAppContext';

export default function BuyerDashboard() {
  const { products } = useAppContext();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
