'use server';

/**
 * @fileOverview Personalized product recommendations AI agent.
 *
 * - recommendProducts - A function that handles the product recommendation process.
 * - RecommendProductsInput - The input type for the recommendProducts function.
 * - RecommendProductsOutput - The return type for the recommendProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendProductsInputSchema = z.object({
  userPreferences: z
    .string()
    .describe('A description of the user shopping preferences.'),
  productCatalog: z
    .string()
    .describe('A description of the available product catalog.'),
});
export type RecommendProductsInput = z.infer<typeof RecommendProductsInputSchema>;

const RecommendProductsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A list of personalized product recommendations.'),
});
export type RecommendProductsOutput = z.infer<typeof RecommendProductsOutputSchema>;

export async function recommendProducts(input: RecommendProductsInput): Promise<RecommendProductsOutput> {
  return recommendProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendProductsPrompt',
  input: {schema: RecommendProductsInputSchema},
  output: {schema: RecommendProductsOutputSchema},
  prompt: `You are a personal shopping assistant. Based on the user's preferences and the available product catalog, you will provide a list of personalized product recommendations.\n\nUser Preferences: {{{userPreferences}}}\nProduct Catalog: {{{productCatalog}}}\n\nRecommendations:`,
});

const recommendProductsFlow = ai.defineFlow(
  {
    name: 'recommendProductsFlow',
    inputSchema: RecommendProductsInputSchema,
    outputSchema: RecommendProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
