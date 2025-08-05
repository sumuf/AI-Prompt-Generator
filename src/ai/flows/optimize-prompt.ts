// This file contains the Genkit flow for providing AI-driven optimization tips for a generated prompt.

'use server';

/**
 * @fileOverview This file defines the prompt optimization flow.
 *
 * - optimizePrompt - A function that takes a prompt and provides optimization tips.
 * - OptimizePromptInput - The input type for the optimizePrompt function.
 * - OptimizePromptOutput - The return type for the optimizePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizePromptInputSchema = z.object({
  prompt: z
    .string()
    .describe('The prompt to be optimized. Include role, task, context, fewshots, and report format.'),
});
export type OptimizePromptInput = z.infer<typeof OptimizePromptInputSchema>;

const OptimizePromptOutputSchema = z.object({
  optimizationTips: z
    .string()
    .describe('AI-driven optimization tips tailored to the generated prompt.'),
});
export type OptimizePromptOutput = z.infer<typeof OptimizePromptOutputSchema>;

export async function optimizePrompt(input: OptimizePromptInput): Promise<OptimizePromptOutput> {
  return optimizePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizePromptPrompt',
  input: {schema: OptimizePromptInputSchema},
  output: {schema: OptimizePromptOutputSchema},
  prompt: `You are an AI prompt optimization expert. Given the following prompt, provide actionable optimization tips to improve its effectiveness and relevance. Focus on clarity, specificity, and alignment with the intended use case.

Prompt:
{{{prompt}}}`,
});

const optimizePromptFlow = ai.defineFlow(
  {
    name: 'optimizePromptFlow',
    inputSchema: OptimizePromptInputSchema,
    outputSchema: OptimizePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
