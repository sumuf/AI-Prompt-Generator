
'use server';

/**
 * @fileOverview Generates suggestions for a user's goal or task.
 *
 * - generateGoalSuggestions - A function that handles the suggestion generation process.
 * - GenerateGoalSuggestionsInput - The input type for the generateGoalSuggestions function.
 * - GenerateGoalSuggestionsOutput - The return type for the generateGoalSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGoalSuggestionsInputSchema = z.object({
    query: z.string().describe('The user\'s partial input for their goal or task.'),
});
export type GenerateGoalSuggestionsInput = z.infer<typeof GenerateGoalSuggestionsInputSchema>;

const GenerateGoalSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3-5 goal or task suggestions.'),
});
export type GenerateGoalSuggestionsOutput = z.infer<typeof GenerateGoalSuggestionsOutputSchema>;

export async function generateGoalSuggestions(input: GenerateGoalSuggestionsInput): Promise<GenerateGoalSuggestionsOutput> {
  return generateGoalSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoalSuggestionsPrompt',
  input: {schema: GenerateGoalSuggestionsInputSchema},
  output: {schema: GenerateGoalSuggestionsOutputSchema},
  prompt: `You are an AI assistant that helps users formulate goals or tasks for AI prompts. Based on the user's input, generate a list of 3 to 5 concise and actionable suggestions for what their goal or task could be.

  User Input: {{{query}}}

  Generate a list of suggestions.`,
});

const generateGoalSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateGoalSuggestionsFlow',
    inputSchema: GenerateGoalSuggestionsInputSchema,
    outputSchema: GenerateGoalSuggestionsOutputSchema,
  },
  async input => {
    if (input.query.trim().length < 3) {
        return { suggestions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
