
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { getAllCategories, type Category } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export function MegaMenu() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories.sort((a,b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to fetch categories for mega menu:', error);
        toast({
          title: 'Error',
          description: 'Could not load categories.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-base">Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
            {isLoading ? (
              <div className="p-4 w-[200px] h-[100px] flex items-center justify-center">
                  <Loader2 className="animate-spin" />
              </div>
            ) : (
                <div className="p-4 w-full md:w-[600px] lg:w-[800px]">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">Product Categories</h3>
                    <p className="text-sm text-muted-foreground">Browse our wide selection of products.</p>
                  </div>
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category) => (
                      <li key={category.id}>
                         <NavigationMenuLink asChild>
                            <Link href="/buyer" className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors">
                                 <Image
                                    src={category.image || 'https://placehold.co/100x100.png'}
                                    alt={category.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover aspect-square"
                                />
                                <span className="font-medium text-sm">{category.name}</span>
                            </Link>
                         </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
              </div>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
