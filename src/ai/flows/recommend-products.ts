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
    .array(z.string())
    .describe('A list of available product categories.'),
});
export type RecommendProductsInput = z.infer<typeof RecommendProductsInputSchema>;

const RecommendProductsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe(
      'A list of 3-5 product categories or keywords from the catalog that best match the user\'s preferences. These should be existing categories.'
    ),
});
export type RecommendProductsOutput = z.infer<typeof RecommendProductsOutputSchema>;

export async function recommendProducts(input: RecommendProductsInput): Promise<RecommendProductsOutput> {
  return recommendProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendProductsPrompt',
  input: {schema: RecommendProductsInputSchema},
  output: {schema: RecommendProductsOutputSchema},
  prompt: `You are a personal shopping assistant. Based on the user's preferences, you will suggest a few product categories or keywords from the provided catalog that they might be interested in.

User Preferences: {{{userPreferences}}}

Available Product Categories:
{{#each productCatalog}}
- {{{this}}}
{{/each}}

Based on the user preferences, select 3 to 5 of the most relevant categories or keywords from the list above.`,
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
