'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ProductsPage() {
  const { products } = useAppContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your store's products.</CardDescription>
        </div>
        <Button asChild size="sm" className="gap-1">
          <Link href="/seller/products/new">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add New Product</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Labels</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={product.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.imageUrl}
                    width="64"
                    data-ai-hint={product['data-ai-hint']}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                    <div className="flex gap-1 flex-wrap">
                        {product.labels.map(label => (
                            <Badge key={label} variant="outline">{label}</Badge>
                        ))}
                    </div>
                </TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
