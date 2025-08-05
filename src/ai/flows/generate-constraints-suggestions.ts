
'use server';

/**
 * @fileOverview Generates suggestions for the constraints field based on the user's goal and context.
 *
 * - generateConstraintsSuggestions - A function that handles the suggestion generation process.
 * - GenerateConstraintsSuggestionsInput - The input type for the generateConstraintsSuggestions function.
 * - GenerateConstraintsSuggestionsOutput - The return type for the generateConstraintsSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConstraintsSuggestionsInputSchema = z.object({
    goalOrTask: z.string().describe('The user\'s goal or task.'),
    context: z.string().describe('The user\'s context.'),
    query: z.string().describe('The user\'s partial input for the constraints.'),
});
export type GenerateConstraintsSuggestionsInput = z.infer<typeof GenerateConstraintsSuggestionsInputSchema>;

const GenerateConstraintsSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3-5 constraint suggestions.'),
});
export type GenerateConstraintsSuggestionsOutput = z.infer<typeof GenerateConstraintsSuggestionsOutputSchema>;

export async function generateConstraintsSuggestions(input: GenerateConstraintsSuggestionsInput): Promise<GenerateConstraintsSuggestionsOutput> {
  return generateConstraintsSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConstraintsSuggestionsPrompt',
  input: {schema: GenerateConstraintsSuggestionsInputSchema},
  output: {schema: GenerateConstraintsSuggestionsOutputSchema},
  prompt: `You are an AI assistant that helps users write constraints for AI prompts. Based on the user's goal, context, and their partial constraints input, generate a list of 3 to 5 concise and relevant suggestions.

  User's Goal: {{{goalOrTask}}}
  User's Context: {{{context}}}
  User's Partial Constraints Input: {{{query}}}

  Generate a list of suggestions.`,
});

const generateConstraintsSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateConstraintsSuggestionsFlow',
    inputSchema: GenerateConstraintsSuggestionsInputSchema,
    outputSchema: GenerateConstraintsSuggestionsOutputSchema,
  },
  async input => {
    if (input.query.trim().length < 3 || input.goalOrTask.trim().length === 0) {
        return { suggestions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
