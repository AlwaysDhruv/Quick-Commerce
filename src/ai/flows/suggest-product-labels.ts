'use server';

/**
 * @fileOverview This file contains a Genkit flow that suggests product category labels based on a product description.
 *
 * - suggestProductLabels - A function that takes a product description and returns suggested category labels.
 * - SuggestProductLabelsInput - The input type for the suggestProductLabels function.
 * - SuggestProductLabelsOutput - The return type for the suggestProductLabels function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductLabelsInputSchema = z.object({
  productDescription: z
    .string()
    .describe('The description of the product for which to suggest labels.'),
});
export type SuggestProductLabelsInput = z.infer<typeof SuggestProductLabelsInputSchema>;

const SuggestProductLabelsOutputSchema = z.object({
  labels: z
    .array(z.string())
    .describe('An array of suggested category labels for the product.'),
});
export type SuggestProductLabelsOutput = z.infer<typeof SuggestProductLabelsOutputSchema>;

export async function suggestProductLabels(
  input: SuggestProductLabelsInput
): Promise<SuggestProductLabelsOutput> {
  return suggestProductLabelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductLabelsPrompt',
  input: {schema: SuggestProductLabelsInputSchema},
  output: {schema: SuggestProductLabelsOutputSchema},
  prompt: `You are an expert in product categorization.

  Given the following product description, suggest three relevant category labels.

  Description: {{{productDescription}}}

  Return the labels as a JSON array of strings.
  `,
});

const suggestProductLabelsFlow = ai.defineFlow(
  {
    name: 'suggestProductLabelsFlow',
    inputSchema: SuggestProductLabelsInputSchema,
    outputSchema: SuggestProductLabelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
