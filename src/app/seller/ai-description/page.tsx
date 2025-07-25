'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Copy } from 'lucide-react';

export default function AiDescriptionPage() {
  const [keywords, setKeywords] = useState('');
  const [details, setDetails] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!keywords || !details) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both keywords and details.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedDescription('');

    try {
      const result = await generateProductDescription({ keywords, details });
      setGeneratedDescription(result.description);
      toast({
        title: 'Description Generated!',
        description: 'Your new product description is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast({
      title: 'Copied to Clipboard!',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">AI Product Description Generator</h1>
        <p className="text-muted-foreground">Create compelling descriptions for your products in seconds.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Provide some basic information about your product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              placeholder="e.g., handmade, leather, minimalist, wallet"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Product Details</Label>
            <Textarea
              id="details"
              placeholder="e.g., Full-grain Italian leather, holds 6 cards, slim profile, available in brown and black."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Description
          </Button>
        </CardFooter>
      </Card>
      
      {generatedDescription && (
         <Card>
           <CardHeader>
             <CardTitle>Generated Description</CardTitle>
             <CardDescription>Here is the AI-generated description. You can copy it or edit as needed.</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="relative rounded-md border bg-background p-4">
               <p className="text-sm text-foreground">{generatedDescription}</p>
               <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
                 <Copy className="h-4 w-4" />
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
    </div>
  );
}
