// This file contains the Genkit flow for generating refinement instruction suggestions based on a prompt.

'use server';

/**
 * @fileOverview This file defines the refinement suggestions flow.
 *
 * - generateRefinementSuggestions - A function that analyzes a prompt and suggests ways to improve it.
 * - GenerateRefinementSuggestionsInput - The input type for the generateRefinementSuggestions function.
 * - GenerateRefinementSuggestionsOutput - The return type for the generateRefinementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRefinementSuggestionsInputSchema = z.object({
  originalPrompt: z
    .string()
    .describe('The original prompt to analyze for potential improvements.'),
});
export type GenerateRefinementSuggestionsInput = z.infer<typeof GenerateRefinementSuggestionsInputSchema>;

const GenerateRefinementSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Array of specific refinement instruction suggestions for improving the prompt.'),
});
export type GenerateRefinementSuggestionsOutput = z.infer<typeof GenerateRefinementSuggestionsOutputSchema>;

export async function generateRefinementSuggestions(input: GenerateRefinementSuggestionsInput): Promise<GenerateRefinementSuggestionsOutput> {
  return generateRefinementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRefinementSuggestionsPrompt',
  input: {schema: GenerateRefinementSuggestionsInputSchema},
  output: {schema: GenerateRefinementSuggestionsOutputSchema},
  prompt: `You are an AI prompt optimization expert. Analyze the given prompt and provide 4-6 specific, actionable refinement suggestions that users could use to improve it.

Focus on common improvement areas like:
- Clarity and specificity
- Adding context or constraints
- Improving structure or format
- Making it more concise or detailed
- Adding examples or use cases
- Adjusting tone or style

Original Prompt:
{{{originalPrompt}}}

Provide practical, specific suggestions that a user could easily understand and apply. Each suggestion should be a clear instruction like "make it more concise", "add specific examples", "clarify the target audience", etc.`,
});

const generateRefinementSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateRefinementSuggestionsFlow',
    inputSchema: GenerateRefinementSuggestionsInputSchema,
    outputSchema: GenerateRefinementSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);