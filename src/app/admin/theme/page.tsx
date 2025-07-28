
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette } from 'lucide-react';
import { updateTheme } from './update-theme';

// Utility to parse HSL strings
const parseHsl = (hsl: string): { h: string; s: string; l: string } => {
  const [h, s, l] = hsl.split(' ').map(v => v.replace('%', ''));
  return { h, s, l };
};

// Initial values from globals.css
const initialPrimary = parseHsl('262 52% 57%');
const initialBackground = parseHsl('0 0% 20%');
const initialAccent = parseHsl('45 100% 51%');

export default function ThemeCustomizerPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [primary, setPrimary] = useState(initialPrimary);
  const [background, setBackground] = useState(initialBackground);
  const [accent, setAccent] = useState(initialAccent);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const theme = {
        primary: `${primary.h} ${primary.s}% ${primary.l}%`,
        background: `${background.h} ${background.s}% ${background.l}%`,
        accent: `${accent.h} ${accent.s}% ${accent.l}%`,
      };
      await updateTheme(theme);
      toast({
        title: 'Theme Updated!',
        description: 'Your new color scheme has been applied.',
      });
      // Optional: Force a reload to see changes immediately
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Theme',
        description: 'Could not save the new theme. Please check the values and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ColorInputGroup = ({
    label,
    color,
    setColor,
  }: {
    label: string;
    color: { h: string; s: string; l: string };
    setColor: React.Dispatch<React.SetStateAction<{ h: string; s: string; l: string }>>;
  }) => (
    <div className="space-y-2">
      <Label className="text-lg font-semibold">{label}</Label>
      <div
        className="h-10 w-full rounded-md border"
        style={{ backgroundColor: `hsl(${color.h} ${color.s}% ${color.l}%)` }}
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor={`${label}-h`} className="text-xs">Hue</Label>
          <Input id={`${label}-h`} value={color.h} onChange={(e) => setColor({ ...color, h: e.target.value })} placeholder="0-360" />
        </div>
        <div>
          <Label htmlFor={`${label}-s`} className="text-xs">Saturation</Label>
          <Input id={`${label}-s`} value={color.s} onChange={(e) => setColor({ ...color, s: e.target.value })} placeholder="0-100" />
        </div>
        <div>
          <Label htmlFor={`${label}-l`} className="text-xs">Lightness</Label>
          <Input id={`${label}-l`} value={color.l} onChange={(e) => setColor({ ...color, l: e.target.value })} placeholder="0-100" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold font-headline">Theme Customizer</h1>
        <p className="text-muted-foreground">Adjust the HSL values to change the site's color scheme.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>
            Modify the core colors of your application's UI. Values are in HSL format (Hue Saturation% Lightness%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <ColorInputGroup label="Primary Color" color={primary} setColor={setPrimary} />
          <ColorInputGroup label="Background Color" color={background} setColor={setBackground} />
          <ColorInputGroup label="Accent Color" color={accent} setColor={setAccent} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Palette className="mr-2" />}
            Save and Apply Theme
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
