
// This file holds the Genkit flow for generating a structured prompt based on user input.

'use server';

/**
 * @fileOverview Generates a structured prompt (Role, Task, Context, Few-shots, Report format) based on user input.
 *
 * - generatePrompt - A function that handles the prompt generation process.
 * - GeneratePromptInput - The input type for the generatePrompt function.
 * - GeneratePromptOutput - The return type for the generatePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromptInputSchema = z.object({
  goalOrTask: z.string().describe('The primary goal or task for which the prompt is being created.'),
  context: z.string().describe('Relevant background information or context for the goal or task.'),
  constraints: z.string().optional().describe('Any constraints or limitations to consider.'),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;

const GeneratePromptOutputSchema = z.object({
  role: z.string().describe('The persona or role the AI should adopt.'),
  task: z.string().describe('The specific task the AI needs to perform.'),
  context: z.string().describe('The context for the task.'),
  fewShots: z.array(z.object({
    input: z.string(),
    output: z.string(),
  })).describe('A single, high-quality input-output pair to guide the AI.'),
  reportFormat: z.string().describe('The desired format of the AI response.'),
  optimizationTips: z.string().describe('Tips for optimizing the generated prompt.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;

export async function generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
  return generatePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptPrompt',
  input: {schema: GeneratePromptInputSchema},
  output: {schema: GeneratePromptOutputSchema},
  prompt: `You are an expert prompt engineer. Your task is to generate a structured prompt based on the user's goal or task description, context, and any constraints provided.

  The prompt should include the following elements:
  - Role: The persona or role the AI should adopt.
  - Task: Write a compelling, keyword-rich task description that helps the user achieve their goal. For instance, for a LinkedIn summary, the task should be 'Write a compelling, keyword-rich LinkedIn summary that helps a network engineer with 6 years of experience stand out to recruiters and hiring managers. Focus on key skills, accomplishments, and career goals within the networking field. Keep it conversational, concise, and results-oriented. Avoid bullet points or technical jargon overload (e.g., avoid dumping config commands or acronyms without context).'
  - Context: Relevant background information for the task. For example, if the user is a network engineer with 6 years of experience, a good context would be: 'The candidate is a network engineer with 6 years of experience, primarily in enterprise networking. They have worked with Cisco and Juniper devices, handled firewall configurations, and are looking to grow into roles involving cloud networking or SDN.'
  - Few-shots: A single, high-quality input-output pair to guide the AI. The few-shot output must be in the first person ("I am...") to align with the final desired output. For example, if the user wants a LinkedIn summary for a Network Engineer, a good few-shot input would be 'Network Engineer with 6 years of experience in enterprise networking' and the output should be 'I am an experienced Network Engineer with 6 years in designing, implementing, and managing complex enterprise networks. I'm skilled in Cisco, Juniper, and firewall management and am passionate about optimizing network performance and pursuing opportunities in cloud and SDN technologies.'
  - Report Format: The desired format of the AI's response, which should request a first-person perspective.
  - Optimization Tips: Provide tips for optimizing the generated prompt to enhance its effectiveness.

  Goal/Task: {{{goalOrTask}}}
  Context: {{{context}}}
  Constraints: {{{constraints}}}

  Now, generate the structured prompt.`,
});

const generatePromptFlow = ai.defineFlow(
  {
    name: 'generatePromptFlow',
    inputSchema: GeneratePromptInputSchema,
    outputSchema: GeneratePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
