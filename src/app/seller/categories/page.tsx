
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  type Category,
  addCategory,
  getCategoriesBySeller,
  updateCategory,
  deleteCategory,
} from '@/lib/firestore';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';

function CategoryDialog({
  onSuccess,
  category,
}: {
  onSuccess: () => void;
  category?: Category;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(category?.name || '');

  const isEditing = !!category;

  useEffect(() => {
    if (open) {
      setName(category?.name || '');
    }
  }, [open, category]);

  const handleSubmit = async () => {
    if (!name) {
      toast({ title: 'Category name is required', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'You must be logged in', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateCategory(category.id, name);
        toast({ title: 'Category Updated' });
      } else {
        await addCategory({ name, sellerId: user.uid });
        toast({ title: 'Category Added' });
      }
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({ title: 'An error occurred', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add New'} Category</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the name for the ${category.name} category.`
              : 'Create a new category for your products.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Electronics"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            Save Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  category,
  onSuccess,
}: {
  category: Category;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCategory(category.id);
      toast({ title: 'Category Deleted' });
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error deleting category', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the <strong>{category.name}</strong> category.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    if (!user) return;
    setIsLoading(true);
    const fetchedCategories = await getCategoriesBySeller(user.uid);
    setCategories(fetchedCategories.sort((a, b) => a.name.localeCompare(b.name)));
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage the categories for your products.
          </p>
        </div>
        <CategoryDialog onSuccess={fetchCategories} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>A list of all your product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="py-10 text-center text-muted-foreground"
                  >
                    You haven't created any categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CategoryDialog onSuccess={fetchCategories} category={cat} />
                        <DeleteCategoryDialog onSuccess={fetchCategories} category={cat} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
