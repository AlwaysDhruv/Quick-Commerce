
'use server';
/**
 * @fileOverview An AI flow for generating images with Gemini.
 *
 * - findImages - A function that generates images based on a query.
 */

import { ai } from '@/ai/genkit';
import type { FindImagesInput, FindImagesOutput, FoundImage } from './find-images.types';
import { FindImagesInputSchema, FindImagesOutputSchema } from './find-images.types';

async function generateImage(query: string): Promise<FoundImage> {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A high-quality, professional marketing photo of: ${query}`,
        config: {
        responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    return {
        url: media.url,
        alt: query,
    };
}


const findImagesFlow = ai.defineFlow(
  {
    name: 'findImagesFlow',
    inputSchema: FindImagesInputSchema,
    outputSchema: FindImagesOutputSchema,
  },
  async ({ query }) => {
    try {
        // Generate a few images in parallel to give the user a selection
        const imagePromises = Array(4).fill(null).map(() => generateImage(query));
        const images = await Promise.all(imagePromises);
        return { images };
    } catch (error) {
        console.error('Error in findImagesFlow:', error);
        // Return empty array on failure to prevent crashing the main flow.
        return { images: [] };
    }
  }
);

export async function findImages(input: FindImagesInput): Promise<FindImagesOutput> {
  return findImagesFlow(input);
}
