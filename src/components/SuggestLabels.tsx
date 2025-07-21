'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { suggestProductLabels } from '@/ai/flows/suggest-product-labels';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface SuggestLabelsProps {
  productDescription: string;
  onSelectLabel: (label: string) => void;
}

export function SuggestLabels({ productDescription, onSelectLabel }: SuggestLabelsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    if (!productDescription.trim()) {
      setError('Please enter a product description first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await suggestProductLabels({ productDescription });
      setSuggestions(result.labels);
    } catch (e) {
      setError('Could not generate suggestions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={handleSuggest} disabled={isLoading}>
        <Wand2 className="mr-2 h-4 w-4" />
        {isLoading ? 'Thinking...' : 'Suggest Labels'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading && (
        <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => onSelectLabel(label)}
            >
              {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
