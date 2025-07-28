/**
 * @fileOverview Type definitions for the image search AI flow.
 */

import { z } from 'genkit';

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
