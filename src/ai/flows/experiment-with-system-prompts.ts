// src/ai/flows/experiment-with-system-prompts.ts
'use server';

/**
 * @fileOverview An AI agent that allows prompt engineers to experiment with different versions of the system prompt for resume tailoring.
 *
 * - experimentWithSystemPrompts - A function that saves and retrieves system prompts.
 * - ExperimentWithSystemPromptsInput - The input type for the experimentWithSystemPrompts function.
 * - ExperimentWithSystemPromptsOutput - The return type for the experimentWithSystemPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExperimentWithSystemPromptsInputSchema = z.object({
  systemPrompt: z.string().describe('The system prompt to be saved.'),
  versionLabel: z.string().describe('A label for the version of the system prompt.'),
});
export type ExperimentWithSystemPromptsInput = z.infer<
  typeof ExperimentWithSystemPromptsInputSchema
>;

const ExperimentWithSystemPromptsOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the system prompt was saved successfully.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type ExperimentWithSystemPromptsOutput = z.infer<
  typeof ExperimentWithSystemPromptsOutputSchema
>;

export async function experimentWithSystemPrompts(
  input: ExperimentWithSystemPromptsInput
): Promise<ExperimentWithSystemPromptsOutput> {
  return experimentWithSystemPromptsFlow(input);
}

const experimentWithSystemPromptsFlow = ai.defineFlow(
  {
    name: 'experimentWithSystemPromptsFlow',
    inputSchema: ExperimentWithSystemPromptsInputSchema,
    outputSchema: ExperimentWithSystemPromptsOutputSchema,
  },
  async input => {
    // Placeholder implementation: In a real application, this would save
    // the system prompt and version label to a database.
    console.log(
      `Saving system prompt version ${input.versionLabel}: ${input.systemPrompt}`
    );
    return {
      success: true,
      message: `System prompt version ${input.versionLabel} saved successfully.`,
    };
  }
);
