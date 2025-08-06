
'use server';

/**
 * @fileOverview Generates suggestions for the context field based on the user's goal.
 *
 * - generateContextSuggestions - A function that handles the suggestion generation process.
 * - GenerateContextSuggestionsInput - The input type for the generateContextSuggestions function.
 * - GenerateContextSuggestionsOutput - The return type for the generateContextSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContextSuggestionsInputSchema = z.object({
    goalOrTask: z.string().describe('The user\'s goal or task.'),
    query: z.string().describe('The user\'s partial input for the context.'),
});
export type GenerateContextSuggestionsInput = z.infer<typeof GenerateContextSuggestionsInputSchema>;

const GenerateContextSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3-5 context suggestions.'),
});
export type GenerateContextSuggestionsOutput = z.infer<typeof GenerateContextSuggestionsOutputSchema>;

export async function generateContextSuggestions(input: GenerateContextSuggestionsInput): Promise<GenerateContextSuggestionsOutput> {
  return generateContextSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContextSuggestionsPrompt',
  input: {schema: GenerateContextSuggestionsInputSchema},
  output: {schema: GenerateContextSuggestionsOutputSchema},
  prompt: `You are an AI assistant that helps users write context for AI prompts. Based on the user's goal and their partial context input, generate a list of 3 to 5 concise and relevant suggestions.

  User's Goal: {{{goalOrTask}}}
  User's Partial Context: {{{query}}}

  Generate a list of suggestions.`,
});

const generateContextSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateContextSuggestionsFlow',
    inputSchema: GenerateContextSuggestionsInputSchema,
    outputSchema: GenerateContextSuggestionsOutputSchema,
  },
  async input => {
    if (input.query.trim().length < 3 || input.goalOrTask.trim().length === 0) {
        return { suggestions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
