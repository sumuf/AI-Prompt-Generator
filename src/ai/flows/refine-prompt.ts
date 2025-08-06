// This file contains the Genkit flow for refining prompts based on user instructions.

'use server';

/**
 * @fileOverview This file defines the prompt refinement flow.
 *
 * - refinePrompt - A function that takes an original prompt and refinement instructions to improve it.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefinePromptInputSchema = z.object({
  originalPrompt: z
    .string()
    .describe('The original prompt to be refined.'),
  refinementInstructions: z
    .string()
    .describe('Instructions on how to improve or modify the prompt.'),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinePromptOutputSchema = z.object({
  refinedPrompt: z
    .string()
    .describe('The improved version of the original prompt based on the refinement instructions.'),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  return refinePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refinePromptPrompt',
  input: {schema: RefinePromptInputSchema},
  output: {schema: RefinePromptOutputSchema},
  prompt: `You are an AI prompt refinement expert. Your task is to improve the given prompt based on the specific refinement instructions provided.

Original Prompt:
{{{originalPrompt}}}

Refinement Instructions:
{{{refinementInstructions}}}

Please refine the original prompt according to the instructions. Maintain the core intent and structure while implementing the requested improvements. Return only the refined prompt without additional explanations.`,
});

const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);