
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

const currentHeroImage = "https://images.unsplash.com/photo-1587721500213-5a0398bf8a39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2hvcGluZyUyMGNhcnR8ZW58MHx8fHwxNzUzNjg5MDc3fDA&ixlib=rb-4.1.0&q=80&w=1080";

export default function DashboardEditorPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(currentHeroImage);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dashboardConfig = {
        heroImageUrl,
      };
      await updateDashboard(dashboardConfig);
      toast({
        title: 'Dashboard Updated!',
        description: 'Your new homepage image has been applied.',
      });
      // Optional: Force a reload to see changes immediately. Useful if caching is aggressive.
      // window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Dashboard',
        description: 'Could not save the new image. Please check the URL and try again.',
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
          <CardTitle>Homepage Hero</CardTitle>
          <CardDescription>
            Update the main image displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="hero-image-url">Hero Image URL</Label>
                <Input 
                    id="hero-image-url"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                />
            </div>
            <div>
                <Label>Image Preview</Label>
                <div className="mt-2 relative aspect-video w-full max-w-lg rounded-md border bg-muted overflow-hidden">
                    {heroImageUrl ? (
                        <Image
                            src={heroImageUrl}
                            alt="Hero Image Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Enter a URL to see a preview</p>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
