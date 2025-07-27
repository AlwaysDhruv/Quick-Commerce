
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Loader2, Trash2, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { type Product } from '@/lib/mock-data';
import { getProductsBySeller, addProductToFirestore, updateProductInFirestore, deleteProductFromFirestore, deleteMultipleProductsFromFirestore, getCategoriesBySeller, type Category } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


function ProductDialog({ onProductSuccess, productToEdit }: { onProductSuccess: () => void, productToEdit?: Product }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [dataAiHint, setDataAiHint] = useState('');

  useEffect(() => {
    if (open) {
      // Reset form fields when dialog opens
      setName(productToEdit?.name || '');
      setDescription(productToEdit?.description || '');
      setPrice(productToEdit?.price.toString() || '');
      setStock((productToEdit?.stock ?? 10).toString());
      setCategory(productToEdit?.category || '');
      setImage(productToEdit?.image || '');
      setDataAiHint(productToEdit?.dataAiHint || '');

      // Fetch categories
      if (user) {
        getCategoriesBySeller(user.uid)
          .then(setCategories)
          .catch(() => toast({ title: 'Could not load categories', variant: 'destructive' }));
      }
    }
  }, [open, productToEdit, user, toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !category || !stock) {
      toast({ title: 'Missing Information', description: 'Please fill out all required fields.', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'Authentication Error', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      image: image || 'https://placehold.co/400x400.png',
      dataAiHint,
    };

    try {
      if (isEditing) {
        await updateProductInFirestore(productToEdit.id, productData);
        toast({ title: 'Product Updated!', description: `${name} has been successfully updated.` });
      } else {
        await addProductToFirestore({ ...productData, sellerId: user.uid });
        toast({ title: 'Product Added!', description: `${name} has been successfully added.` });
      }
      onProductSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: `Failed to ${isEditing ? 'update' : 'add'} product.`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
        ) : (
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update the details for ${productToEdit.name}.` : 'Fill in the details to add a product.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
             <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.length > 0 ? categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    )) : <SelectItem value="-" disabled>No categories found</SelectItem>}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">Stock</Label>
            <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Image</Label>
            <div className="col-span-3 flex items-center gap-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <Input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {image && <Image src={image} alt="preview" width={40} height={40} className="rounded-md object-cover" />}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataAiHint" className="text-right">AI Hint</Label>
            <Input id="dataAiHint" value={dataAiHint} onChange={(e) => setDataAiHint(e.target.value)} className="col-span-3" placeholder="e.g. 'leather wallet'" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function DeleteProductDialog({ product, onProductDeleted, children }: { product: Product; onProductDeleted: () => void, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProductFromFirestore(product.id);
      toast({
        title: 'Product Deleted',
        description: `${product.name} has been removed.`,
      });
      onProductDeleted();
      setOpen(false);
    } catch (error) {
       console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
     <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product
            <span className="font-bold"> {product.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-2 animate-spin" />}
            Yes, delete product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const { toast } = useToast();
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const fetchProducts = async () => {
    if (user) {
      setIsLoading(true);
      const sellerProducts = await getProductsBySeller(user.uid);
      setProducts(sellerProducts);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProductIds(prev =>
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedProductIds(checked ? products.map(p => p.id) : []);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await deleteMultipleProductsFromFirestore(selectedProductIds);
      toast({
        title: 'Products Deleted',
        description: `${selectedProductIds.length} products have been removed.`,
      });
      fetchProducts(); // Refresh product list
      setSelectedProductIds([]);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to delete selected products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Your Products</h1>
          <p className="text-muted-foreground">Manage your product listings here.</p>
        </div>
        <div className="flex items-center gap-2">
            {selectedProductIds.length > 0 && (
              <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete ({selectedProductIds.length})
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the selected <strong>{selectedProductIds.length}</strong> products.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkDeleting} className="bg-destructive hover:bg-destructive/90">
                      {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Yes, delete products
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <ProductDialog onProductSuccess={fetchProducts} />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                    checked={selectedProductIds.length > 0 && selectedProductIds.length === products.length}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    aria-label="Select all"
                  />
              </TableHead>
              <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
              <TableHead>
                <span className="sr-only">Delete</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    You haven&apos;t added any products yet.
                    </TableCell>
                </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) && "selected"}>
                   <TableCell>
                      <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, Boolean(checked))}
                          aria-label={`Select ${product.name}`}
                        />
                   </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image || 'https://placehold.co/400x400.png'}
                      width="64"
                      data-ai-hint={product.dataAiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                   <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                     {product.stock > 0 ? (
                      <span>{product.stock}</span>
                    ) : (
                      <Badge variant="destructive">Out of stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                           <ProductDialog onProductSuccess={fetchProducts} productToEdit={product} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                  <TableCell>
                     <DeleteProductDialog product={product} onProductDeleted={fetchProducts}>
                         <Button size="icon" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                             <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Delete</span>
                         </Button>
                     </DeleteProductDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    