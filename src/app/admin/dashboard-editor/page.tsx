
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus, Trash2, Wand2 } from 'lucide-react';
import { updateDashboard } from './update-dashboard';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { findImages } from '@/ai/flows/find-images-flow';
import { type FoundImage } from '@/ai/flows/find-images.types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Type Definitions ---
interface CarouselSlide {
    title: string;
    description: string;
    buttonText: string;
    imageUrl: string;
}
interface CategoryImage {
    name: string;
    url: string;
    hint: string;
}

// --- Default Values ---
const defaultCarouselSlides: CarouselSlide[] = [
    {
        title: 'Summer Styles Are Here',
        description: 'Discover the latest trends and refresh your wardrobe.',
        buttonText: 'Shop Now',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop'
    },
    {
        title: 'Upgrade Your Tech',
        description: 'Find the latest gadgets and electronics.',
        buttonText: 'Explore Tech',
        imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964&auto=format&fit=crop'
    },
    {
        title: 'Beautify Your Home',
        description: 'Discover unique pieces for every room.',
        buttonText: 'Shop Home',
        imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2127&auto=format&fit=crop'
    },
    {
        title: 'Adventure Awaits',
        description: 'Get equipped for your next outdoor journey.',
        buttonText: 'Get Outside',
        imageUrl: 'https://images.unsplash.com/photo-1506939391439-366f68e3a435?q=80&w=2070&auto=format&fit=crop'
    },
    {
        title: 'Taste The Difference',
        description: 'Explore gourmet foods and pantry staples.',
        buttonText: 'Shop Gourmet',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop'
    },
];

const defaultCategoryImages: CategoryImage[] = [
    { name: 'Apparel', url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop', hint: 'Apparel'},
    { name: 'Electronics', url: 'https://images.unsplash.com/photo-1550009158-94ae76552485?q=80&w=1887&auto=format&fit=crop', hint: 'Electronics' },
    { name: 'Home Goods', url: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=1887&auto=format&fit=crop', hint: 'Home Goods' },
    { name: 'Sports & Outdoors', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop', hint: 'Sports Outdoors' },
    { name: 'Food & Grocery', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop', hint: 'Food Grocery' }
];

function ImageSearchDialog({
  searchHint,
  onImageSelect,
}: {
  searchHint: string;
  onImageSelect: (imageUrl: string) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<FoundImage[]>([]);

  const handleSearch = async () => {
    setIsLoading(true);
    setImages([]);
    try {
      const result = await findImages({ query: searchHint });
      setImages(result.images);
      if (result.images.length === 0) {
        toast({ title: 'No images were generated for this query.' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error generating images', description: 'The AI model failed to generate images. Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleSearch}>
          <Wand2 className="mr-2" /> Find with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI Image Generation</DialogTitle>
          <DialogDescription>
            Showing results for &quot;{searchHint}&quot;. Click an image to select it.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[60vh] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Generating images... (this may take a moment)</p>
              </div>
            </div>
          )}
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleSelect(image.url)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}


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
                    key={src}
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
            imageUrl: 'https://placehold.co/1600x900.png'
        }
    ]);
  }

  const removeCarouselSlide = (index: number) => {
    const newSlides = carouselSlides.filter((_, i) => i !== index);
    setCarouselSlides(newSlides);
  }

  const handleCategoryImageChange = (index: number, field: keyof CategoryImage, value: string) => {
    const newImages = [...categoryImages];
    newImages[index] = { ...newImages[index], [field]: value };

    if (field === 'name') {
        newImages[index].hint = value.replace(/&/g, '').replace(/\s+/g, ' ');
    }
    
    setCategoryImages(newImages);
  };

  const addCategory = () => {
    setCategoryImages([
        ...categoryImages,
        {
            name: 'New Category',
            url: 'https://placehold.co/300x300.png',
            hint: 'New Category'
        }
    ]);
  }

  const removeCategory = (index: number) => {
    const newImages = categoryImages.filter((_, i) => i !== index);
    setCategoryImages(newImages);
  }


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dashboardConfig = {
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
            <Accordion type="multiple" defaultValue={['carousel']} className="w-full">
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`carousel-image-${index}`}>Image URL</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id={`carousel-image-${index}`} value={slide.imageUrl} onChange={(e) => handleCarouselChange(index, 'imageUrl', e.target.value)} />
                                        <ImageSearchDialog searchHint={slide.title} onImageSelect={(url) => handleCarouselChange(index, 'imageUrl', url)} />
                                    </div>
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
                           <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                <div className='flex justify-between items-center'>
                                     <h4 className="font-semibold text-lg">Category {index + 1}</h4>
                                     <Button variant="destructive" size="sm" onClick={() => removeCategory(index)}>
                                         <Trash2 className="mr-2"/> Remove Category
                                     </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`category-name-${index}`}>Category Name</Label>
                                    <Input 
                                        id={`category-name-${index}`}
                                        value={cat.name}
                                        onChange={(e) => handleCategoryImageChange(index, 'name', e.target.value)}
                                        placeholder="e.g. Apparel"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`category-image-url-${index}`}>Image URL</Label>
                                     <div className="flex items-center gap-2">
                                        <Input 
                                            id={`category-image-url-${index}`}
                                            value={cat.url}
                                            onChange={(e) => handleCategoryImageChange(index, 'url', e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        <ImageSearchDialog searchHint={cat.hint} onImageSelect={(url) => handleCategoryImageChange(index, 'url', url)} />
                                    </div>
                                </div>
                               <ImagePreview src={cat.url} alt={`${cat.name} Preview`} aspect="square"/>
                           </div>
                       ))}
                       <Button variant="outline" onClick={addCategory}>
                            <Plus className="mr-2"/> Add New Category
                       </Button>
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
