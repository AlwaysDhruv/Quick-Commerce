
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
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { BookOpen, Home, Shirt, Sparkles, Tag } from 'lucide-react';
import Image from 'next/image';

const components: { title: string; href: string; description: string, icon: React.ElementType }[] = [
  {
    title: 'New Arrivals',
    href: '/buyer?search=new',
    description: 'Check out the latest products from our sellers.',
    icon: Sparkles
  },
  {
    title: 'Best Sellers',
    href: '/buyer?search=popular',
    description: 'See what other customers are loving right now.',
    icon: Tag
  },
   {
    title: 'Apparel',
    href: '/buyer?category=Apparel',
    description: 'Find your new favorite outfit for any occasion.',
    icon: Shirt
  },
   {
    title: 'Home Goods',
    href: '/buyer?category=Home Goods',
    description: 'Everything you need to make your house a home.',
    icon: Home
  },
   {
    title: 'Books',
    href: '/buyer?category=Books',
    description: 'Get lost in a new story from our wide selection.',
    icon: BookOpen
  },
];

export function MegaMenu() {

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-base">Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
             <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/buyer"
                    >
                       <div className="relative w-full h-32 mb-4">
                        <Image src="https://placehold.co/400x200.png" alt="Special Offer" fill className="object-cover rounded-md" data-ai-hint="store sale"/>
                       </div>
                      <div className="text-lg font-medium">
                        SwiftShopper Deals
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Limited time offers and special promotions.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                 {components.map((component) => (
                    <li key={component.title}>
                        <NavigationMenuLink asChild>
                            <a
                                href={component.href}
                                className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                     <component.icon className="h-5 w-5 text-primary" />
                                    <div className="text-sm font-medium leading-none">{component.title}</div>
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {component.description}
                                </p>
                            </a>
                        </NavigationMenuLink>
                    </li>
                ))}
              </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
