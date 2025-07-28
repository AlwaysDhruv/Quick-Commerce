
'use server';
/**
 * @fileOverview An AI flow for finding images on Unsplash.
 *
 * - findImages - A function that searches for images based on a query.
 * - FindImagesInput - The input type for the findImages function.
 * - FindImagesOutput - The return type for the findImages function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { config } from 'dotenv';
config();

export const FindImagesInputSchema = z.object({
  query: z.string().describe('The search query for the images.'),
});
export type FindImagesInput = z.infer<typeof FindImagesInputSchema>;

export const FoundImageSchema = z.object({
  url: z.string().url().describe('The URL of the found image.'),
  alt: z.string().describe('A descriptive alt text for the image.'),
});
export type FoundImage = z.infer<typeof FoundImageSchema>;

export const FindImagesOutputSchema = z.object({
  images: z.array(FoundImageSchema).describe('A list of found images.'),
});
export type FindImagesOutput = z.infer<typeof FindImagesOutputSchema>;


const searchUnsplashTool = ai.defineTool(
  {
    name: 'searchUnsplashTool',
    description: 'Searches for images on Unsplash based on a query and returns a list of image URLs and their descriptions.',
    inputSchema: FindImagesInputSchema,
    outputSchema: FindImagesOutputSchema,
  },
  async ({ query }) => {
    // Note: In a real app, you should hide your API key, but we'll use an environment variable for this prototype.
    const apiKey = process.env.UNSPLASH_API_KEY;
    if (!apiKey) {
      // This is a fallback public key with a very low rate limit.
      // For real use, get your own key from unsplash.com
      console.warn("UNSPLASH_API_KEY not set, using public fallback key.");
      return { images: [] };
    }
    
    // Using node-fetch because native fetch is not consistently available in all server-side Node environments
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`;
    
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${apiKey}`
        }
      });
      const data: any = await response.json();

      if (!response.ok || !data.results) {
        throw new Error(`Unsplash API error: ${data.errors?.[0] || 'Unknown error'}`);
      }

      const images: FoundImage[] = data.results.map((img: any) => ({
        url: img.urls.regular,
        alt: img.alt_description || query,
      }));

      return { images };
    } catch (error) {
      console.error('Error in searchUnsplashTool:', error);
      // Return empty array on failure to prevent crashing the main flow.
      return { images: [] };
    }
  }
);


const findImagesFlow = ai.defineFlow(
  {
    name: 'findImagesFlow',
    inputSchema: FindImagesInputSchema,
    outputSchema: FindImagesOutputSchema,
  },
  async (input) => {
    // Directly call the tool for reliable image searching
    return await searchUnsplashTool(input);
  }
);

export async function findImages(input: FindImagesInput): Promise<FindImagesOutput> {
  return findImagesFlow(input