
'use server';

import { generatePrompt, type GeneratePromptInput, type GeneratePromptOutput } from '@/ai/flows/generate-prompt';
import { generateGoalSuggestions, type GenerateGoalSuggestionsInput, type GenerateGoalSuggestionsOutput } from '@/ai/flows/generate-goal-suggestions';
import { generateContextSuggestions, type GenerateContextSuggestionsInput, type GenerateContextSuggestionsOutput } from '@/ai/flows/generate-context-suggestions';
import { generateConstraintsSuggestions, type GenerateConstraintsSuggestionsInput, type GenerateConstraintsSuggestionsOutput } from '@/ai/flows/generate-constraints-suggestions';


/**
 * Server action to generate a prompt using the Genkit flow.
 * @param data - The input for prompt generation, including goal, context, and constraints.
 * @returns An object with the generated prompt data or an error message.
 */
export async function generatePromptAction(
  data: GeneratePromptInput
): Promise<{ data?: GeneratePromptOutput; error?: string }> {
  try {
    const result = await generatePrompt(data);
    if (!result) {
      return { error: 'The AI service did not return a response. Please try again.' };
    }
    return { data: result };
  } catch (error) {
    console.error('Error during prompt generation:', error);
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Server action to generate goal suggestions using the Genkit flow.
 * @param data - The input for suggestion generation.
 * @returns An object with the generated suggestions or an error message.
 */
export async function generateGoalSuggestionsAction(
  data: GenerateGoalSuggestionsInput
): Promise<{ data?: GenerateGoalSuggestionsOutput; error?: string }> {
  try {
    const result = await generateGoalSuggestions(data);
    if (!result) {
      return { error: 'The AI service did not return a response. Please try again.' };
    }
    return { data: result };
  } catch (error) {
    console.error('Error during suggestion generation:', error);
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Server action to generate context suggestions using the Genkit flow.
 * @param data - The input for suggestion generation.
 * @returns An object with the generated suggestions or an error message.
 */
export async function generateContextSuggestionsAction(
  data: GenerateContextSuggestionsInput
): Promise<{ data?: GenerateContextSuggestionsOutput; error?: string }> {
  try {
    const result = await generateContextSuggestions(data);
    if (!result) {
      return { error: 'The AI service did not return a response. Please try again.' };
    }
    return { data: result };
  } catch (error) {
    console.error('Error during context suggestion generation:', error);
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Server action to generate constraints suggestions using the Genkit flow.
 * @param data - The input for suggestion generation.
 * @returns An object with the generated suggestions or an error message.
 */
export async function generateConstraintsSuggestionsAction(
  data: GenerateConstraintsSuggestionsInput
): Promise<{ data?: GenerateConstraintsSuggestionsOutput; error?: string }> {
  try {
    const result = await generateConstraintsSuggestions(data);
    if (!result) {
      return { error: 'The AI service did not return a response. Please try again.' };
    }
    return { data: result };
  } catch (error) {
    console.error('Error during constraints suggestion generation:', error);
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}
