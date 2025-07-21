'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X } from 'lucide-react';

import { useAppContext } from '@/hooks/useAppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SuggestLabels } from '@/components/SuggestLabels';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  imageUrl: z.string().url('Must be a valid URL'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  labels: z.array(z.string()).min(1, 'At least one label is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const { addProduct } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: 'https://placehold.co/600x400',
      stock: 0,
      labels: [],
    },
  });

  const description = useWatch({ control, name: 'description' });
  const labels = useWatch({ control, name: 'labels' });

  const addLabel = (label: string) => {
    const currentLabels = getValues('labels');
    if (!currentLabels.includes(label)) {
      setValue('labels', [...currentLabels, label]);
    }
  };
  
  const removeLabel = (labelToRemove: string) => {
     setValue('labels', labels.filter(label => label !== labelToRemove));
  }

  const onSubmit = (data: ProductFormValues) => {
    addProduct(data);
    toast({
        title: 'Product Added!',
        description: `${data.name} has been added to your store.`,
    })
    router.push('/seller/products');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add a New Product</CardTitle>
          <CardDescription>Fill in the details below to list a new product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={5} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>AI Label Suggestions</Label>
             <SuggestLabels productDescription={description} onSelectLabel={addLabel} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="labels">Product Labels</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {labels.map(label => (
                    <Badge key={label} variant="default">
                        {label}
                        <button type="button" onClick={() => removeLabel(label)} className="ml-1 rounded-full hover:bg-white/20">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                 {labels.length === 0 && <p className="text-sm text-muted-foreground">Add labels or use suggestions.</p>}
            </div>
             {errors.labels && <p className="text-sm text-destructive">{errors.labels.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" {...register('imageUrl')} />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
