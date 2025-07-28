
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { updateDashboard } from './update-dashboard';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- Default Image URLs ---
const defaultHeroImage = "https://images.unsplash.com/photo-1587721500213-5a0398bf8a39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2hvcGluZyUyMGNhcnR8ZW58MHx8fHwxNzUzNjg5MDc3fDA&ixlib=rb-4.1.0&q=80&w=1080";
const defaultCarouselImages = [
    "https://placehold.co/1600x900.png",
    "https://placehold.co/1600x900.png",
    "https://placehold.co/1600x900.png",
    "https://placehold.co/1600x900.png",
    "https://placehold.co/1600x900.png",
];
const defaultCategoryImages = [
    { name: 'Apparel', url: 'https://placehold.co/300x300.png', hint: 'Apparel'},
    { name: 'Electronics', url: 'https://placehold.co/300x300.png', hint: 'Electronics' },
    { name: 'Home Goods', url: 'https://placehold.co/300x300.png', hint: 'Home Goods' },
    { name: 'Sports & Outdoors', url: 'https://placehold.co/300x300.png', hint: 'Sports & Outdoors' },
    { name: 'Food & Grocery', url: 'https://placehold.co/300x300.png', hint: 'Food & Grocery' }
];

function ImagePreview({ src, alt }: { src: string, alt: string }) {
    return (
        <div className="mt-2 relative aspect-video w-full max-w-lg rounded-md border bg-muted overflow-hidden">
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    key={src} // Force re-render on src change
                />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Enter a URL to see a preview</p>
                </div>
            )}
        </div>
    );
}

export default function DashboardEditorPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [heroImageUrl, setHeroImageUrl] = useState(defaultHeroImage);
  const [carouselImages, setCarouselImages] = useState(defaultCarouselImages);
  const [categoryImages, setCategoryImages] = useState(defaultCategoryImages);

  const handleCarouselImageChange = (index: number, value: string) => {
    const newImages = [...carouselImages];
    newImages[index] = value;
    setCarouselImages(newImages);
  };
  
  const handleCategoryImageChange = (index: number, value: string) => {
    const newImages = [...categoryImages];
    newImages[index].url = value;
    setCategoryImages(newImages);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dashboardConfig = {
        heroImageUrl,
        carouselImages,
        categoryImages: categoryImages,
      };
      await updateDashboard(dashboardConfig);
      toast({
        title: 'Dashboard Updated!',
        description: 'Your new homepage images have been applied.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Dashboard',
        description: 'Could not save the new images. Please check the URLs and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold font-headline">Dashboard Editor</h1>
        <p className="text-muted-foreground">Change images and other content on your site.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Homepage Content</CardTitle>
            <CardDescription>Update the images displayed on the main buyer homepage.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['hero']} className="w-full">
                <AccordionItem value="hero">
                    <AccordionTrigger className="text-lg font-semibold">Hero Section</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        <div>
                            <Label htmlFor="hero-image-url">Hero Image URL</Label>
                            <Input 
                                id="hero-image-url"
                                value={heroImageUrl}
                                onChange={(e) => setHeroImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                        <ImagePreview src={heroImageUrl} alt="Hero Image Preview" />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="carousel">
                    <AccordionTrigger className="text-lg font-semibold">Carousel Slides</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-8">
                       {carouselImages.map((url, index) => (
                           <div key={index} className="space-y-2">
                                <Label htmlFor={`carousel-image-${index + 1}`}>Slide {index + 1} URL</Label>
                                <Input 
                                    id={`carousel-image-${index + 1}`}
                                    value={url}
                                    onChange={(e) => handleCarouselImageChange(index, e.target.value)}
                                    placeholder="https://placehold.co/..."
                                />
                                <ImagePreview src={url} alt={`Carousel Slide ${index + 1} Preview`} />
                           </div>
                       ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="categories">
                    <AccordionTrigger className="text-lg font-semibold">Category Showcase</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-8">
                       {categoryImages.map((cat, index) => (
                           <div key={index} className="space-y-2">
                                <Label htmlFor={`category-image-${index + 1}`}>{cat.name} Image URL</Label>
                                <Input 
                                    id={`category-image-${index + 1}`}
                                    value={cat.url}
                                    onChange={(e) => handleCategoryImageChange(index, e.target.value)}
                                    placeholder="https://placehold.co/..."
                                />
                               <div className="mt-2 relative aspect-square w-full max-w-xs rounded-md border bg-muted overflow-hidden">
                                    <ImagePreview src={cat.url} alt={`${cat.name} Preview`} />
                               </div>
                           </div>
                       ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
            Save All Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
