
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { updateDashboard } from './update-dashboard';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- Type Definitions ---
interface CarouselSlide {
    title: string;
    description: string;
    buttonText: string;
    link: string;
    imageUrl: string;
}
interface CategoryImage {
    name: string;
    url: string;
    hint: string;
}

// --- Default Values ---
const defaultHeroImage = "https://images.unsplash.com/photo-1587721500213-5a0398bf8a39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2hvcGluZyUyMGNhcnR8ZW58MHx8fHwxNzUzNjg5MDc3fDA&ixlib=rb-4.1.0&q=80&w=1080";

const defaultCarouselSlides: CarouselSlide[] = [
    {
        title: 'Summer Styles Are Here',
        description: 'Discover the latest trends and refresh your wardrobe.',
        buttonText: 'Shop Now',
        link: '/buyer?category=Apparel',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop'
    },
    {
        title: 'Upgrade Your Tech',
        description: 'Find the latest gadgets and electronics.',
        buttonText: 'Explore Tech',
        link: '/buyer?category=Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964&auto=format&fit=crop'
    },
    {
        title: 'Beautify Your Home',
        description: 'Discover unique pieces for every room.',
        buttonText: 'Shop Home',
        link: '/buyer?category=Home+Goods',
        imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2127&auto=format&fit=crop'
    },
    {
        title: 'Adventure Awaits',
        description: 'Get equipped for your next outdoor journey.',
        buttonText: 'Get Outside',
        link: '/buyer?category=Sports+%26+Outdoors',
        imageUrl: 'https://images.unsplash.com/photo-1506939391439-366f68e3a435?q=80&w=2070&auto=format&fit=crop'
    },
    {
        title: 'Taste The Difference',
        description: 'Explore gourmet foods and pantry staples.',
        buttonText: 'Shop Gourmet',
        link: '/buyer?category=Food+%26+Grocery',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop'
    },
];

const defaultCategoryImages: CategoryImage[] = [
    { name: 'Apparel', url: 'https://placehold.co/300x300.png', hint: 'Apparel'},
    { name: 'Electronics', url: 'https://placehold.co/300x300.png', hint: 'Electronics' },
    { name: 'Home Goods', url: 'https://placehold.co/300x300.png', hint: 'Home Goods' },
    { name: 'Sports & Outdoors', url: 'https://placehold.co/300x300.png', hint: 'Sports & Outdoors' },
    { name: 'Food & Grocery', url: 'https://placehold.co/300x300.png', hint: 'Food & Grocery' }
];

function ImagePreview({ src, alt, aspect = 'video' }: { src: string, alt: string, aspect?: 'video' | 'square' }) {
    const aspectClass = aspect === 'video' ? 'aspect-video' : 'aspect-square';
    return (
        <div className={`mt-2 relative ${aspectClass} w-full max-w-lg rounded-md border bg-muted overflow-hidden`}>
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
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(defaultCarouselSlides);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>(defaultCategoryImages);

  const handleCarouselChange = (index: number, field: keyof CarouselSlide, value: string) => {
    const newSlides = [...carouselSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setCarouselSlides(newSlides);
  };
  
  const addCarouselSlide = () => {
    setCarouselSlides([
        ...carouselSlides,
        {
            title: 'New Slide',
            description: 'A brief description for your new slide.',
            buttonText: 'Learn More',
            link: '/',
            imageUrl: 'https://placehold.co/1600x900.png'
        }
    ]);
  }

  const removeCarouselSlide = (index: number) => {
    const newSlides = carouselSlides.filter((_, i) => i !== index);
    setCarouselSlides(newSlides);
  }

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
        carouselSlides,
        categoryImages,
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
                            <Label htmlFor="hero-image-url">Landing Page Hero Image URL</Label>
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
                       {carouselSlides.map((slide, index) => (
                           <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                <div className='flex justify-between items-center'>
                                     <h4 className="font-semibold text-lg">Slide {index + 1}</h4>
                                     <Button variant="destructive" size="sm" onClick={() => removeCarouselSlide(index)}>
                                         <Trash2 className="mr-2"/> Remove Slide
                                     </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`carousel-title-${index}`}>Title</Label>
                                        <Input id={`carousel-title-${index}`} value={slide.title} onChange={(e) => handleCarouselChange(index, 'title', e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`carousel-desc-${index}`}>Description</Label>
                                        <Input id={`carousel-desc-${index}`} value={slide.description} onChange={(e) => handleCarouselChange(index, 'description', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`carousel-btn-text-${index}`}>Button Text</Label>
                                        <Input id={`carousel-btn-text-${index}`} value={slide.buttonText} onChange={(e) => handleCarouselChange(index, 'buttonText', e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`carousel-link-${index}`}>Button Link</Label>
                                        <Input id={`carousel-link-${index}`} value={slide.link} onChange={(e) => handleCarouselChange(index, 'link', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`carousel-image-${index}`}>Image URL</Label>
                                    <Input id={`carousel-image-${index}`} value={slide.imageUrl} onChange={(e) => handleCarouselChange(index, 'imageUrl', e.target.value)} />
                                </div>
                                <ImagePreview src={slide.imageUrl} alt={`Slide ${index + 1} Preview`} />
                           </div>
                       ))}
                       <Button variant="outline" onClick={addCarouselSlide}>
                            <Plus className="mr-2"/> Add New Slide
                       </Button>
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
                               <ImagePreview src={cat.url} alt={`${cat.name} Preview`} aspect="square"/>
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
